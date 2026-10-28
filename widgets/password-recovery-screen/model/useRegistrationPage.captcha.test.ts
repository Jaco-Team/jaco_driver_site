import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRegistrationPage } from './useRegistrationPage';

const mocks = vi.hoisted(() => ({ send: vi.fn(), reset: vi.fn() }));
vi.mock('@/features/auth/model/auth.store', () => ({ useAuthStore: (selector: (state: unknown) => unknown) => selector({ requestRecoveryCode: mocks.send, resetRecoveryPassword: mocks.reset }) }));
vi.mock('@/components/analytics', () => ({ log: vi.fn() }));
vi.mock('@/shared/ui/YandexSmartCaptcha', () => ({ SMARTCAPTCHA_CLIENT_KEY: 'test-key' }));
describe('recovery flow with CAPTCHA', () => {
  beforeEach(() => { vi.resetAllMocks(); mocks.send.mockResolvedValue({ st: true }); });
  it('requires a token only to request a code and returns to request for resend', async () => {
    const { result } = renderHook(() => useRegistrationPage());
    act(() => { result.current.setMyLogin('79870001122'); });
    expect(result.current.canSubmit).toBe(false);
    act(() => { result.current.setCaptchaToken('token'); });
    await act(async () => { await result.current.requestRecoveryCode(); });
    expect(mocks.send).toHaveBeenCalledWith('79870001122', 'sms', 'token');
    expect(result.current.activeStep).toBe(1);
    act(() => { result.current.setMyCode('123456'); });
    expect(result.current.canSubmit).toBe(true);
    await act(async () => { await result.current.requestRecoveryCode(); });
    expect(result.current.activeStep).toBe(0);
    expect(result.current.canSubmit).toBe(false);
    expect(mocks.send).toHaveBeenCalledTimes(1);
  });
});
