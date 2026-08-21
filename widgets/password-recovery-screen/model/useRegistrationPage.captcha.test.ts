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
    vi.clearAllMocks();
    mocks.requestPasswordRecoveryCode.mockResolvedValue({ st: true });
  });

  it('blocks send without a captcha token when the client key is present', async () => {
    const { result } = renderHook(() => useRegistrationPage());

    act(() => {
      result.current.setMyLogin('79870001122');
      result.current.setMyPWD('Password1');
    });

    expect(result.current.canSubmit).toBe(false);

    await act(async () => {
      await result.current.requestRecoveryCode();
    });

    expect(mocks.requestPasswordRecoveryCode).not.toHaveBeenCalled();
    expect(result.current.errorText).toBe('Пожалуйста, подтвердите, что вы не робот');
    expect(result.current.activeStep).toBe(0);
  });

  it('sends a recovery code after captcha succeeds', async () => {
    const { result } = renderHook(() => useRegistrationPage());

    act(() => {
      result.current.setMyLogin('79870001122');
      result.current.setMyPWD('Password1');
      result.current.setCaptchaToken('captcha-token');
    });

    expect(result.current.canSubmit).toBe(true);

    await act(async () => {
      await result.current.requestRecoveryCode();
    });

    expect(mocks.requestPasswordRecoveryCode).toHaveBeenCalledWith(
      '79870001122',
      'Password1',
      'captcha-token'
    );
    expect(result.current.activeStep).toBe(1);
  });
});
