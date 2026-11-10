import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRegistrationPage } from './useRegistrationPage';

const mocks = vi.hoisted(() => ({
  fetchRecoveryChannels: vi.fn(),
  requestRecoveryCode: vi.fn(),
  resetPasswordWithCode: vi.fn(),
  login: vi.fn(),
  push: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('@/features/auth/api/passwordRecovery.api', () => ({
  fetchRecoveryChannels: mocks.fetchRecoveryChannels,
  requestRecoveryCode: mocks.requestRecoveryCode,
  resetPasswordWithCode: mocks.resetPasswordWithCode,
}));

vi.mock('@/features/auth/model/auth.store', () => ({
  useAuthStore: (selector: (state: { login: typeof mocks.login }) => unknown) =>
    selector({ login: mocks.login }),
}));

vi.mock('@/components/analytics', () => ({
  log: vi.fn(),
}));

vi.mock('@/shared/ui/YandexSmartCaptcha', () => ({
  SMARTCAPTCHA_CLIENT_KEY: 'client-key',
}));

const ok = (extra: Record<string, unknown> = {}) => ({
  st: true,
  text: '',
  errorCode: '',
  retryAfter: 0,
  resendAfter: 0,
  captchaRequired: false,
  ...extra,
});

describe('useRegistrationPage with a CAPTCHA key', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.fetchRecoveryChannels.mockResolvedValue(['sms']);
    mocks.requestRecoveryCode.mockResolvedValue(ok());
  });

  async function mount() {
    const hook = renderHook(() => useRegistrationPage());

    await waitFor(() => expect(mocks.fetchRecoveryChannels).toHaveBeenCalled());
    await act(async () => {});

    return hook;
  }

  it('requires CAPTCHA before the first send', async () => {
    const { result } = await mount();

    act(() => result.current.setPhone('79991234567'));
    expect(result.current.captchaVisible).toBe(true);
    expect(result.current.canSubmit).toBe(false);

    await act(async () => result.current.resend());
    expect(mocks.requestRecoveryCode).not.toHaveBeenCalled();
    expect(result.current.error?.text).toBe('Пожалуйста, подтвердите, что вы не робот');

    act(() => result.current.setCaptchaToken('token-1'));
    expect(result.current.canSubmit).toBe(true);
    await act(async () => result.current.submit());

    expect(mocks.requestRecoveryCode).toHaveBeenCalledWith('+79991234567', 'sms', 'token-1');
    expect(result.current.step).toBe('code');
  });

  it('asks for a fresh token before every resend and shows CAPTCHA on the code step', async () => {
    const { result } = await mount();

    act(() => result.current.setPhone('79991234567'));
    act(() => result.current.setCaptchaToken('token-1'));
    await act(async () => result.current.submit());

    // Использованный токен сброшен: повторная отправка без новой проверки не уходит.
    expect(result.current.captchaVisible).toBe(true);
    const keyAfterSend = result.current.captchaResetKey;
    await act(async () => result.current.resend());
    expect(mocks.requestRecoveryCode).toHaveBeenCalledTimes(1);

    act(() => result.current.setCaptchaToken('token-2'));
    await act(async () => result.current.resend());

    expect(mocks.requestRecoveryCode).toHaveBeenLastCalledWith('+79991234567', 'sms', 'token-2');
    expect(result.current.captchaResetKey).toBeGreaterThan(keyAfterSend);
    expect(result.current.step).toBe('code');
  });

  it('does not reuse an expired token', async () => {
    const { result } = await mount();

    act(() => result.current.setPhone('79991234567'));
    act(() => result.current.setCaptchaToken('token-1'));
    act(() => result.current.resetCaptcha());

    expect(result.current.canSubmit).toBe(false);
    await act(async () => result.current.submit());
    expect(mocks.requestRecoveryCode).not.toHaveBeenCalled();
  });
});
