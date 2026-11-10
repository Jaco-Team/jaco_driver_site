import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchRecoveryChannels,
  requestRecoveryCode,
  resetPasswordWithCode,
} from './passwordRecovery.api';
import { apiRoutes } from '@/shared/api/routes';

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock('@/shared/api/connector', () => ({
  connector: { rest: { get, post } },
}));

describe('password recovery API (code first, like the SSO page)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns only known channels and falls back to SMS', async () => {
    get.mockResolvedValueOnce({ channels: ['voice', 'sms', 'pigeon', 'telegram'] });
    await expect(fetchRecoveryChannels()).resolves.toEqual(['sms', 'telegram', 'voice']);
    expect(get).toHaveBeenCalledWith(apiRoutes.auth.passwordRecoveryChannels);

    get.mockResolvedValueOnce({ channels: [] });
    await expect(fetchRecoveryChannels()).resolves.toEqual(['sms']);

    get.mockRejectedValueOnce(new Error('offline'));
    await expect(fetchRecoveryChannels()).resolves.toEqual(['sms']);
  });

  it('requests a code for the chosen channel and reads the resend delay', async () => {
    post.mockResolvedValueOnce({ st: true, text: 'Запрос принят', resend_after: 30 });

    await expect(requestRecoveryCode('+79991234567', 'telegram')).resolves.toEqual({
      st: true,
      text: 'Запрос принят',
      errorCode: '',
      retryAfter: 0,
      resendAfter: 30,
      captchaRequired: false,
    });
    expect(post).toHaveBeenCalledWith(apiRoutes.auth.passwordRecoveryRequestCode, {
      login: '+79991234567',
      delivery_channel: 'telegram',
    });

    post.mockResolvedValueOnce({ st: true });
    await requestRecoveryCode('+79991234567', 'sms', 'captcha-token');
    expect(post).toHaveBeenLastCalledWith(apiRoutes.auth.passwordRecoveryRequestCode, {
      login: '+79991234567',
      delivery_channel: 'sms',
      captcha_token: 'captcha-token',
    });
  });

  it('reads the refusal from a 4xx body the same way as from a 200 body', async () => {
    post.mockResolvedValueOnce({
      st: false,
      error_code: 'account_not_found',
      text: 'Аккаунт с таким номером не найден.',
    });
    await expect(requestRecoveryCode('+79991234567', 'sms')).resolves.toMatchObject({
      st: false,
      errorCode: 'account_not_found',
      text: 'Аккаунт с таким номером не найден.',
    });

    post.mockRejectedValueOnce({
      response: {
        status: 429,
        data: { st: false, error_code: 'too_many_requests', text: 'Подождите', retry_after: 17.2 },
      },
    });
    await expect(requestRecoveryCode('+79991234567', 'sms')).resolves.toMatchObject({
      st: false,
      errorCode: 'too_many_requests',
      retryAfter: 18,
    });

    post.mockRejectedValueOnce({
      response: { status: 422, data: { st: false, error_code: 'captcha_required', captcha_required: true } },
    });
    await expect(requestRecoveryCode('+79991234567', 'sms')).resolves.toMatchObject({
      st: false,
      captchaRequired: true,
      text: 'Не удалось запросить код. Попробуйте позже.',
    });
  });

  it('sends the code together with the new password', async () => {
    post.mockResolvedValueOnce({ st: true, text: 'Пароль успешно обновлен!' });

    await expect(resetPasswordWithCode('+79991234567', '123456', 'NewPassword9')).resolves.toMatchObject({
      st: true,
    });
    expect(post).toHaveBeenCalledWith(apiRoutes.auth.passwordRecoveryReset, {
      login: '+79991234567',
      code: '123456',
      password: 'NewPassword9',
    });

    post.mockRejectedValueOnce(new Error('network'));
    await expect(resetPasswordWithCode('+79991234567', '123456', 'NewPassword9')).resolves.toMatchObject({
      st: false,
      text: 'Не удалось обновить пароль. Попробуйте позже.',
    });
  });
});
