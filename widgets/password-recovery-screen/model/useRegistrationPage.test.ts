import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRegistrationPage } from './useRegistrationPage';

const mocks = vi.hoisted(() => ({ send: vi.fn(), reset: vi.fn() }));
vi.mock('@/features/auth/model/auth.store', () => ({ useAuthStore: (selector: (state: unknown) => unknown) => selector({ requestRecoveryCode: mocks.send, resetRecoveryPassword: mocks.reset }) }));
vi.mock('@/components/analytics', () => ({ log: vi.fn() }));
vi.mock('@/shared/ui/YandexSmartCaptcha', () => ({ SMARTCAPTCHA_CLIENT_KEY: '' }));
describe('recovery flow without CAPTCHA', () => {
  beforeEach(() => { vi.resetAllMocks(); mocks.send.mockResolvedValue({ st: true }); mocks.reset.mockResolvedValue({ st: true }); });
  it('sends the chosen channel and resets the password only after code and matching password', async () => {
    const { result } = renderHook(() => useRegistrationPage());
    act(() => { result.current.setMyLogin('79870001122'); result.current.setDeliveryChannel('voice'); });
    await act(async () => { await result.current.requestRecoveryCode(); });
    expect(mocks.send).toHaveBeenCalledWith('79870001122', 'voice', '');
    expect(result.current.activeStep).toBe(1);
    act(() => { result.current.setMyCode('123456'); });
    act(() => { result.current.confirmRecoveryCode(); });
    expect(result.current.activeStep).toBe(2);
    expect(mocks.reset).not.toHaveBeenCalled();
    act(() => { result.current.setMyPWD('Password1'); result.current.setRepeatPWD('Password1'); });
    await act(async () => { await result.current.saveRecoveryPassword(); });
    expect(mocks.reset).toHaveBeenCalledWith('79870001122', '123456', 'Password1');
    expect(result.current.passwordChanged).toBe(true);
  });
  it('returns an invalid code to the code step', async () => {
    mocks.reset.mockResolvedValue({ st: false, text: 'Код подтверждения неверен или истёк' });
    const { result } = renderHook(() => useRegistrationPage());
    act(() => { result.current.setMyLogin('79870001122'); });
    await act(async () => { await result.current.requestRecoveryCode(); });
    act(() => { result.current.setMyCode('123456'); });
    act(() => { result.current.confirmRecoveryCode(); });
    act(() => { result.current.setMyPWD('Password1'); result.current.setRepeatPWD('Password1'); });
    await act(async () => { await result.current.saveRecoveryPassword(); });
    expect(result.current.activeStep).toBe(1);
    expect(result.current.myCode).toBe('');
  });
  it('fails closed if the server requires CAPTCHA but no public key is configured', async () => {
    mocks.send.mockResolvedValue({ st: false, captcha_required: true });
    const { result } = renderHook(() => useRegistrationPage());
    act(() => { result.current.setMyLogin('79870001122'); });
    await act(async () => { await result.current.requestRecoveryCode(); });
    expect(result.current.captchaRequired).toBe(true);
    expect(result.current.canSubmit).toBe(false);
    expect(result.current.errorText).toContain('недоступна');
  });
});
