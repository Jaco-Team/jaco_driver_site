import { beforeEach, describe, expect, it, vi } from 'vitest';

import { confirmPasswordRecoveryCode, fetchMe, sendPasswordRecoveryCode } from './auth.api';
import { apiRoutes } from '@/shared/api/routes';

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock('@/shared/api/connector', () => ({
  connector: { rest: { get, post } },
}));

describe('session API', () => {
  it('bounds the session check to 15 seconds', async () => {
    const user = { user_id: 7, name: 'Водитель' };
    get.mockResolvedValue(user);

    await expect(fetchMe()).resolves.toBe(user);

    expect(get).toHaveBeenCalledWith(apiRoutes.auth.me, { timeout: 15_000 });
  });
});


describe('password recovery API', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('passes through the send cooldown and includes the fresh CAPTCHA token', async () => {
    const response = { st: true, resend_after: 30 };
    post.mockResolvedValue(response);
    await expect(sendPasswordRecoveryCode(' 79870001122 ', 'Password1', 'fresh-token')).resolves.toBe(response);
    expect(post).toHaveBeenCalledWith(apiRoutes.auth.passwordRecoverySendCode, {
      login: '79870001122', password: 'Password1', captcha_token: 'fresh-token',
    });
  });

  it('passes through a logical confirmation lock returned with HTTP 200', async () => {
    const response = { st: false, locked: true, retry_after: 600, attempts_left: 0 };
    post.mockResolvedValue(response);
    await expect(confirmPasswordRecoveryCode(' 79870001122 ', '123456')).resolves.toBe(response);
    expect(post).toHaveBeenCalledWith(apiRoutes.auth.passwordRecoveryConfirmCode, {
      login: '79870001122', code: '123456',
    });
  });

  it('preserves HTTP 429 error metadata for the auth store', async () => {
    const error = { response: { status: 429, data: { retry_after: 30 }, headers: { 'retry-after': '30' } } };
    post.mockRejectedValue(error);
    await expect(sendPasswordRecoveryCode('79870001122', 'Password1', 'fresh-token')).rejects.toBe(error);
  });
});
