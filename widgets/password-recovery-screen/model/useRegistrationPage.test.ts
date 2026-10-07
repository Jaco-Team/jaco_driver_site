import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  SMARTCAPTCHA_CLIENT_KEY: '',
}));

describe('useRegistrationPage without captcha key', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requestPasswordRecoveryCode.mockResolvedValue({ st: true });
    mocks.confirmPasswordRecoveryCode.mockResolvedValue({ st: true });
    mocks.login.mockResolvedValue({ st: true });
  });

  afterEach(() => { vi.useRealTimers(); });

  it('sends a recovery code without a captcha token', async () => {
    const { result } = renderHook(() => useRegistrationPage());

    act(() => {
      result.current.setMyLogin('79870001122');
      result.current.setMyPWD('Password1');
    });

    expect(result.current.canSubmit).toBe(true);

    await act(async () => {
      await result.current.requestRecoveryCode();
    });

    expect(mocks.requestPasswordRecoveryCode).toHaveBeenCalledWith('79870001122', 'Password1', '');
    expect(result.current.activeStep).toBe(1);
    expect(result.current.errorText).toBe('');
  });
  it('does not send duplicate requests before React updates the loading state', async () => {
    let complete!: (value: { st: boolean }) => void;
    mocks.requestPasswordRecoveryCode.mockReturnValueOnce(new Promise((resolve) => { complete = resolve; }));
    const { result } = renderHook(() => useRegistrationPage());
    act(() => {
      result.current.setMyLogin('79870001122');
      result.current.setMyPWD('Password1');
    });
    await act(async () => {
      const first = result.current.requestRecoveryCode();
      const second = result.current.requestRecoveryCode();
      expect(mocks.requestPasswordRecoveryCode).toHaveBeenCalledTimes(1);
      complete({ st: true });
      await Promise.all([first, second]);
    });
  });

  it('allows SMS confirmation during the resend cooldown', async () => {
    mocks.requestPasswordRecoveryCode.mockResolvedValueOnce({ st: true, resend_after: 30 });
    const { result } = renderHook(() => useRegistrationPage());
    act(() => {
      result.current.setMyLogin('79870001122');
      result.current.setMyPWD('Password1');
    });
    await act(async () => { await result.current.requestRecoveryCode(); });
    act(() => { result.current.setMyCode('123456'); });
    expect(result.current.sendRetryAfter).toBe(30);
    expect(result.current.retryAfter).toBe(0);
    expect(result.current.canSubmit).toBe(true);
    await act(async () => { await result.current.confirmRecoveryCode(); });
    expect(mocks.confirmPasswordRecoveryCode).toHaveBeenCalledWith('79870001122', '123456');
  });

  it('waits for a confirm block and prevents rapid duplicate verification', async () => {
    vi.useFakeTimers();
    let complete!: (value: { st: boolean; retry_after: number; text: string }) => void;
    mocks.confirmPasswordRecoveryCode.mockReturnValueOnce(new Promise((resolve) => { complete = resolve; }));
    const { result } = renderHook(() => useRegistrationPage());
    act(() => {
      result.current.setMyLogin('79870001122');
      result.current.setMyPWD('Password1');
    });
    await act(async () => { await result.current.requestRecoveryCode(); });
    act(() => { result.current.setMyCode('123456'); });
    await act(async () => {
      const first = result.current.confirmRecoveryCode();
      const second = result.current.confirmRecoveryCode();
      expect(mocks.confirmPasswordRecoveryCode).toHaveBeenCalledTimes(1);
      complete({ st: false, retry_after: 2, text: 'Повторите позже' });
      await Promise.all([first, second]);
    });
    expect(result.current.canSubmit).toBe(false);
    await act(async () => { await result.current.confirmRecoveryCode(); });
    expect(mocks.confirmPasswordRecoveryCode).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.canSubmit).toBe(true);
  });

  it('keeps a changed password successful even when automatic login fails', async () => {
    mocks.login.mockResolvedValueOnce({ st: false, text: 'Временная ошибка входа' });
    const { result } = renderHook(() => useRegistrationPage());
    act(() => {
      result.current.setMyLogin('79870001122');
      result.current.setMyPWD('Password1');
    });
    await act(async () => { await result.current.requestRecoveryCode(); });
    act(() => { result.current.setMyCode('123456'); });
    await act(async () => { await result.current.confirmRecoveryCode(); });
    expect(result.current.passwordChanged).toBe(true);
    expect(result.current.errorText).toContain('Пароль изменён');
    await act(async () => { await result.current.confirmRecoveryCode(); });
    expect(mocks.confirmPasswordRecoveryCode).toHaveBeenCalledTimes(1);
  });

  it('ignores a recovery reply after leaving the screen', async () => {
    let complete!: (value: { st: boolean }) => void;
    mocks.requestPasswordRecoveryCode.mockReturnValueOnce(new Promise((resolve) => { complete = resolve; }));
    const { result, unmount } = renderHook(() => useRegistrationPage());
    act(() => {
      result.current.setMyLogin('79870001122');
      result.current.setMyPWD('Password1');
    });
    let pending!: Promise<void>;
    act(() => { pending = result.current.requestRecoveryCode(); });
    unmount();
    await act(async () => { complete({ st: true }); await pending; });
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it.each([
    { st: false, status: 429, retry_after: 30, text: 'Повторная отправка будет доступна через 30 с.' },
    { st: false, captcha_required: true, text: 'Подтвердите, что вы не робот' },
  ])('keeps the original code available after a failed resend: %j', async (failure) => {
    mocks.requestPasswordRecoveryCode.mockResolvedValueOnce({ st: true });
    mocks.requestPasswordRecoveryCode.mockResolvedValueOnce(failure);
    const { result } = renderHook(() => useRegistrationPage());
    act(() => {
      result.current.setMyLogin('79870001122');
      result.current.setMyPWD('Password1');
    });
    await act(async () => { await result.current.requestRecoveryCode(); });
    act(() => { result.current.setMyCode('123456'); });
    await act(async () => { await result.current.requestRecoveryCode(); });
    expect(result.current.activeStep).toBe(1);
    expect(result.current.myCode).toBe('123456');
    expect(result.current.canSubmit).toBe(true);
    expect(result.current.errorText).toBe('captcha_required' in failure && failure.captcha_required
      ? 'Проверка безопасности недоступна. Попробуйте позже.' : failure.text);
    await act(async () => { await result.current.confirmRecoveryCode(); });
    expect(mocks.confirmPasswordRecoveryCode).toHaveBeenCalledWith('79870001122', '123456');
  });

  it('keeps the original code available after a resend network failure', async () => {
    mocks.requestPasswordRecoveryCode.mockResolvedValueOnce({ st: true });
    mocks.requestPasswordRecoveryCode.mockRejectedValueOnce(new Error('Network Error'));
    const { result } = renderHook(() => useRegistrationPage());
    act(() => {
      result.current.setMyLogin('79870001122');
      result.current.setMyPWD('Password1');
    });
    await act(async () => { await result.current.requestRecoveryCode(); });
    act(() => { result.current.setMyCode('123456'); });
    await act(async () => { await result.current.requestRecoveryCode(); });
    expect(result.current.activeStep).toBe(1);
    expect(result.current.myCode).toBe('123456');
    expect(result.current.canSubmit).toBe(true);
    expect(result.current.loader).toBe(false);
    expect(result.current.errorText).toContain('Попробуйте ещё раз');
  });

  it('explains a server CAPTCHA challenge when the client key is missing', async () => {
    mocks.requestPasswordRecoveryCode.mockResolvedValueOnce({ st: false, captcha_required: true });
    const { result } = renderHook(() => useRegistrationPage());
    act(() => {
      result.current.setMyLogin('79870001122');
      result.current.setMyPWD('Password1');
    });
    await act(async () => { await result.current.requestRecoveryCode(); });
    expect(result.current.captchaRequired).toBe(true);
    expect(result.current.canSubmit).toBe(false);
    expect(result.current.errorText).toBe('Проверка безопасности недоступна. Попробуйте позже.');
  });

  it('reconciles resend and confirmation deadlines after time passes in the background', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-07T12:00:00Z'));
    mocks.requestPasswordRecoveryCode.mockResolvedValueOnce({ st: true, resend_after: 30 });
    mocks.confirmPasswordRecoveryCode.mockResolvedValueOnce({ st: false, retry_after: 10, locked: true });
    const { result } = renderHook(() => useRegistrationPage());
    act(() => {
      result.current.setMyLogin('79870001122');
      result.current.setMyPWD('Password1');
    });
    await act(async () => { await result.current.requestRecoveryCode(); });
    act(() => { result.current.setMyCode('123456'); });
    await act(async () => { await result.current.confirmRecoveryCode(); });
    expect(result.current.sendRetryAfter).toBe(30);
    expect(result.current.retryAfter).toBe(10);
    act(() => {
      vi.setSystemTime(new Date('2026-10-07T12:01:00Z'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current.sendRetryAfter).toBe(0);
    expect(result.current.retryAfter).toBe(0);
    expect(result.current.canSubmit).toBe(true);
    expect(result.current.canResend).toBe(true);
  });

  it('clears the previous code and confirmation lock only after a successful resend', async () => {
    mocks.confirmPasswordRecoveryCode.mockResolvedValueOnce({ st: false, retry_after: 600, locked: true });
    const { result } = renderHook(() => useRegistrationPage());
    act(() => {
      result.current.setMyLogin('79870001122');
      result.current.setMyPWD('Password1');
    });
    await act(async () => { await result.current.requestRecoveryCode(); });
    act(() => { result.current.setMyCode('123456'); });
    await act(async () => { await result.current.confirmRecoveryCode(); });
    expect(result.current.retryAfter).toBe(600);
    await act(async () => { await result.current.requestRecoveryCode(); });
    expect(result.current.myCode).toBe('');
    expect(result.current.retryAfter).toBe(0);
  });

});
