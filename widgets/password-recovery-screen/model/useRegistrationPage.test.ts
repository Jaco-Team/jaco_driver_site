import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  SMARTCAPTCHA_CLIENT_KEY: '',
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
const fail = (extra: Record<string, unknown> = {}) => ok({ st: false, text: 'Отказ', ...extra });

async function mount() {
  const hook = renderHook(() => useRegistrationPage());

  await waitFor(() => expect(mocks.fetchRecoveryChannels).toHaveBeenCalled());
  await act(async () => {});

  return hook;
}

async function reachPasswordStep(result: { current: ReturnType<typeof useRegistrationPage> }) {
  act(() => result.current.setPhone('79991234567'));
  await act(async () => result.current.submit());
  act(() => result.current.setCode('123456'));
  act(() => result.current.submit());
  act(() => {
    result.current.setPassword('NewPassword9');
    result.current.setRepeatPassword('NewPassword9');
  });
}

describe('useRegistrationPage: code first, like the SSO page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.fetchRecoveryChannels.mockResolvedValue(['sms', 'telegram', 'voice']);
    mocks.requestRecoveryCode.mockResolvedValue(ok({ text: 'Запрос принят', resendAfter: 30 }));
    mocks.resetPasswordWithCode.mockResolvedValue(ok());
    mocks.login.mockResolvedValue({ st: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('offers the channels the server allows and sends the code through the chosen one', async () => {
    const { result } = await mount();

    expect(result.current.channels).toEqual(['sms', 'telegram', 'voice']);
    expect(result.current.canSubmit).toBe(false);

    act(() => result.current.setPhone('79991234567'));
    act(() => result.current.setChannel('telegram'));
    expect(result.current.phone).toBe('+7 (999) 123-45-67');

    await act(async () => result.current.submit());

    expect(mocks.requestRecoveryCode).toHaveBeenCalledWith('+79991234567', 'telegram', '');
    expect(result.current.step).toBe('code');
    expect(result.current.maskedPhone).toBe('+7 (999) ***-**-67');
    expect(result.current.recoveryMessage).toBe('Запрос принят');
    expect(result.current.resendAfter).toBe(30);
  });

  it('keeps SMS selected when the saved choice is no longer offered', async () => {
    mocks.fetchRecoveryChannels.mockResolvedValue(['sms']);
    const { result } = await mount();

    expect(result.current.channels).toEqual(['sms']);
    expect(result.current.channel).toBe('sms');
  });

  it('does not ask the server for an incomplete number', async () => {
    const { result } = await mount();

    act(() => result.current.setPhone('7999'));
    await act(async () => result.current.resend());

    expect(mocks.requestRecoveryCode).not.toHaveBeenCalled();
    expect(result.current.phoneError).toBe('Введите номер в формате +7 или 8');
  });

  it('does not send duplicate requests before React updates the loading state', async () => {
    let finish!: (value: unknown) => void;
    mocks.requestRecoveryCode.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    const { result } = await mount();

    act(() => result.current.setPhone('79991234567'));
    act(() => {
      result.current.submit();
      result.current.submit();
    });

    expect(mocks.requestRecoveryCode).toHaveBeenCalledTimes(1);
    await act(async () => finish(ok()));
    expect(result.current.step).toBe('code');
  });

  it('shows an unknown number under the phone field, like in Chef', async () => {
    mocks.requestRecoveryCode.mockResolvedValue(
      fail({ errorCode: 'account_not_found', text: 'Аккаунт с таким номером не найден.' })
    );
    const { result } = await mount();

    act(() => result.current.setPhone('79991234567'));
    await act(async () => result.current.submit());

    expect(result.current.step).toBe('request');
    expect(result.current.phoneError).toBe('Аккаунт с таким номером не найден.');
    expect(result.current.error).toBeNull();

    // Правка номера снимает серверную ошибку.
    act(() => result.current.setPhone('79991234568'));
    expect(result.current.phoneError).toBe('');
  });

  it('checks the code on the server only together with the new password', async () => {
    const { result } = await mount();

    act(() => result.current.setPhone('79991234567'));
    await act(async () => result.current.submit());

    act(() => result.current.setCode('12'));
    act(() => result.current.submit());
    expect(result.current.step).toBe('code');
    expect(result.current.error).toEqual({ text: 'Введите 6 цифр кода', code: false });

    act(() => result.current.setCode('12a3456789'));
    expect(result.current.code).toBe('123456');
    act(() => result.current.submit());

    expect(result.current.step).toBe('password');
    expect(mocks.resetPasswordWithCode).not.toHaveBeenCalled();
  });

  it('saves the password only when every rule is met, then signs in with it', async () => {
    const { result } = await mount();

    await reachPasswordStep(result);
    act(() => result.current.setRepeatPassword('NewPassword'));
    expect(result.current.passwordRules).toEqual({ length: true, characters: true, match: false });
    expect(result.current.canSubmit).toBe(false);
    await act(async () => result.current.submit());
    expect(mocks.resetPasswordWithCode).not.toHaveBeenCalled();

    // Пробелы в пароль не попадают.
    act(() => result.current.setRepeatPassword('New Password9'));
    expect(result.current.repeatPassword).toBe('NewPassword9');
    await act(async () => result.current.submit());

    expect(mocks.resetPasswordWithCode).toHaveBeenCalledWith('+79991234567', '123456', 'NewPassword9');
    expect(result.current.step).toBe('success');

    await act(async () => result.current.submit());

    expect(mocks.login).toHaveBeenCalledWith('+79991234567', 'NewPassword9');
    expect(mocks.push).toHaveBeenCalledWith('/list_orders', { scroll: false });
  });

  it('sends the driver to the login page when signing in with the new password fails', async () => {
    mocks.login.mockResolvedValue({ st: false, text: 'Ошибка' });
    const { result } = await mount();

    await reachPasswordStep(result);
    await act(async () => result.current.submit());
    await act(async () => result.current.submit());

    expect(mocks.push).toHaveBeenCalledWith('/auth', { scroll: false });
  });

  it('returns to the code step when the server rejects the code', async () => {
    mocks.resetPasswordWithCode.mockResolvedValue(
      fail({ errorCode: 'invalid_code', text: 'Код не подошёл' })
    );
    const { result } = await mount();

    await reachPasswordStep(result);
    await act(async () => result.current.submit());

    expect(result.current.step).toBe('code');
    expect(result.current.code).toBe('');
    expect(result.current.error).toEqual({ text: 'Код не подошёл', code: true });
    // Новый пароль остаётся: после верного кода вводить его заново не нужно.
    expect(result.current.password).toBe('NewPassword9');
  });

  it('waits before another save when the server asks to', async () => {
    mocks.resetPasswordWithCode.mockResolvedValue(
      fail({ errorCode: 'too_many_requests', retryAfter: 20 })
    );
    const { result } = await mount();

    await reachPasswordStep(result);
    await act(async () => result.current.submit());

    expect(result.current.step).toBe('password');
    expect(result.current.retryAfter).toBe(20);
    expect(result.current.canSubmit).toBe(false);
  });

  it('counts the resend delay down and follows time spent in the background', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    vi.setSystemTime(new Date('2026-11-10T10:00:00Z'));
    const hook = renderHook(() => useRegistrationPage());
    await act(async () => {});
    const { result } = hook;

    act(() => result.current.setPhone('79991234567'));
    await act(async () => result.current.submit());
    expect(result.current.resendAfter).toBe(30);

    await act(async () => {
      vi.advanceTimersByTime(10_000);
    });
    expect(result.current.resendAfter).toBe(20);

    vi.setSystemTime(new Date('2026-11-10T10:00:31Z'));
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(result.current.resendAfter).toBe(0);
  });

  it('ignores a reply that arrives after leaving the screen', async () => {
    let finish!: (value: unknown) => void;
    mocks.requestRecoveryCode.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    const { result, unmount } = await mount();

    act(() => result.current.setPhone('79991234567'));
    act(() => result.current.submit());
    unmount();

    await act(async () => finish(ok()));
    expect(result.current.step).toBe('request');
  });

  it('explains a server CAPTCHA challenge when the site has no CAPTCHA key', async () => {
    mocks.requestRecoveryCode.mockResolvedValue(
      fail({ errorCode: 'captcha_required', captchaRequired: true, text: 'Подтвердите, что вы не робот' })
    );
    const { result } = await mount();

    act(() => result.current.setPhone('79991234567'));
    await act(async () => result.current.submit());
    expect(result.current.captchaVisible).toBe(false);

    await act(async () => result.current.submit());
    expect(result.current.error?.text).toBe('Проверка безопасности недоступна. Попробуйте позже.');
    expect(mocks.requestRecoveryCode).toHaveBeenCalledTimes(1);
  });

  it('goes back one step and lets the driver edit the number', async () => {
    const { result } = await mount();

    await reachPasswordStep(result);
    act(() => result.current.back());
    expect(result.current.step).toBe('code');
    act(() => result.current.back());
    expect(result.current.step).toBe('request');

    await act(async () => {});
    act(() => result.current.goToLogin());
    expect(mocks.push).toHaveBeenCalledWith('/auth', { scroll: false });
  });
});
