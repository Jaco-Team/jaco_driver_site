import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRegistrationPage } from './useRegistrationPage';

const mocks = vi.hoisted(() => ({
  requestPasswordRecoveryCode: vi.fn(),
  confirmPasswordRecoveryCode: vi.fn(),
  login: vi.fn(),
  push: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('@/features/auth/model/auth.store', () => ({
  useAuthStore: (
    selector: (state: {
      requestPasswordRecoveryCode: typeof mocks.requestPasswordRecoveryCode;
      confirmPasswordRecoveryCode: typeof mocks.confirmPasswordRecoveryCode;
      login: typeof mocks.login;
    }) => unknown
  ) =>
    selector({
      requestPasswordRecoveryCode: mocks.requestPasswordRecoveryCode,
      confirmPasswordRecoveryCode: mocks.confirmPasswordRecoveryCode,
      login: mocks.login,
    }),
}));

vi.mock('@/components/analytics', () => ({
  log: vi.fn(),
}));

vi.mock('@/shared/ui/YandexSmartCaptcha', () => ({
  SMARTCAPTCHA_CLIENT_KEY: 'test-client-key',
}));

describe('useRegistrationPage with captcha key', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requestPasswordRecoveryCode.mockResolvedValue({ st: true });
    mocks.confirmPasswordRecoveryCode.mockResolvedValue({ st: true });
    mocks.login.mockResolvedValue({ st: true });
  });

  it('requires CAPTCHA on the first send when the client key is present', async () => {
    const { result } = renderHook(() => useRegistrationPage());
    act(() => {
      result.current.setMyLogin('79870001122');
      result.current.setMyPWD('Password1');
    });
    expect(result.current.captchaRequired).toBe(true);
    expect(result.current.canSubmit).toBe(false);
    await act(async () => { await result.current.requestRecoveryCode(); });
    expect(mocks.requestPasswordRecoveryCode).not.toHaveBeenCalled();
    expect(result.current.errorText).toContain('Подтвердите, что вы не робот');
    act(() => { result.current.setCaptchaToken('first-token'); });
    expect(result.current.canSubmit).toBe(true);
    await act(async () => { await result.current.requestRecoveryCode(); });
    expect(mocks.requestPasswordRecoveryCode).toHaveBeenCalledWith('79870001122', 'Password1', 'first-token');
    expect(result.current.activeStep).toBe(1);
    expect(result.current.showResendCaptcha).toBe(false);
    expect(result.current.canResend).toBe(true);
  });

  it('keeps mandatory CAPTCHA after a generic 429 without CAPTCHA metadata', async () => {
    mocks.requestPasswordRecoveryCode.mockResolvedValueOnce({
      st: false, status: 429, retry_after: 30, text: 'Повторная отправка будет доступна через 30 с.',
    });
    const { result } = renderHook(() => useRegistrationPage());
    act(() => {
      result.current.setMyLogin('79870001122');
      result.current.setMyPWD('Password1');
      result.current.setCaptchaToken('first-token');
    });
    await act(async () => { await result.current.requestRecoveryCode(); });
    expect(result.current.captchaRequired).toBe(true);
    expect(result.current.canSubmit).toBe(false);
    expect(result.current.sendRetryAfter).toBe(30);
    expect(result.current.captchaResetKey).toBe(1);
  });

  it('keeps the existing code usable while a resend requires a fresh CAPTCHA token', async () => {
    const { result } = renderHook(() => useRegistrationPage());
    act(() => {
      result.current.setMyLogin('79870001122');
      result.current.setMyPWD('Password1');
      result.current.setCaptchaToken('first-token');
    });
    await act(async () => { await result.current.requestRecoveryCode(); });
    act(() => { result.current.setMyCode('123456'); });
    await act(async () => { await result.current.requestRecoveryCode(); });
    expect(mocks.requestPasswordRecoveryCode).toHaveBeenCalledTimes(1);
    expect(result.current.showResendCaptcha).toBe(true);
    expect(result.current.canResend).toBe(false);
    expect(result.current.activeStep).toBe(1);
    expect(result.current.myCode).toBe('123456');
    expect(result.current.canSubmit).toBe(true);
    await act(async () => { await result.current.confirmRecoveryCode(); });
    expect(mocks.confirmPasswordRecoveryCode).toHaveBeenCalledWith('79870001122', '123456');
  });

  it('resets a rejected resend token without hiding the existing SMS code', async () => {
    mocks.requestPasswordRecoveryCode.mockResolvedValueOnce({ st: true });
    mocks.requestPasswordRecoveryCode.mockResolvedValueOnce({
      st: false, captcha_required: true, text: 'Не удалось подтвердить CAPTCHA.',
    });
    const { result } = renderHook(() => useRegistrationPage());
    act(() => {
      result.current.setMyLogin('79870001122');
      result.current.setMyPWD('Password1');
      result.current.setCaptchaToken('first-token');
    });
    await act(async () => { await result.current.requestRecoveryCode(); });
    act(() => {
      result.current.setMyCode('123456');
      result.current.setCaptchaToken('rejected-token');
    });
    await act(async () => { await result.current.requestRecoveryCode(); });
    expect(result.current.activeStep).toBe(1);
    expect(result.current.myCode).toBe('123456');
    expect(result.current.canSubmit).toBe(true);
    expect(result.current.canResend).toBe(false);
    expect(result.current.captchaResetKey).toBe(2);
    expect(result.current.errorText).toBe('Не удалось подтвердить CAPTCHA.');
    act(() => { result.current.setCaptchaToken('fresh-token'); });
    await act(async () => { await result.current.requestRecoveryCode(); });
    expect(mocks.requestPasswordRecoveryCode).toHaveBeenLastCalledWith('79870001122', 'Password1', 'fresh-token');
    expect(result.current.myCode).toBe('');
    expect(result.current.showResendCaptcha).toBe(false);
  });

  it('does not reuse an expired resend CAPTCHA token', async () => {
    const { result } = renderHook(() => useRegistrationPage());
    act(() => {
      result.current.setMyLogin('79870001122');
      result.current.setMyPWD('Password1');
      result.current.setCaptchaToken('first-token');
    });
    await act(async () => { await result.current.requestRecoveryCode(); });
    await act(async () => { await result.current.requestRecoveryCode(); });
    act(() => { result.current.setCaptchaToken('expired-token'); });
    expect(result.current.canResend).toBe(true);
    act(() => { result.current.resetCaptcha(); });
    expect(result.current.canResend).toBe(false);
    await act(async () => { await result.current.requestRecoveryCode(); });
    expect(mocks.requestPasswordRecoveryCode).toHaveBeenCalledTimes(1);
    expect(result.current.activeStep).toBe(1);
  });

});
