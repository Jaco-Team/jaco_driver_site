import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PasswordRecoveryScreen from './PasswordRecoveryScreen';

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

vi.mock('@/components/meta', () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-meta-title={title}>{children}</div>
  ),
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
  default: () => null,
}));

vi.mock('@/shared/ui/Font', () => ({
  inter: { variable: 'inter-variable' },
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

async function renderScreen() {
  render(<PasswordRecoveryScreen />);
  await waitFor(() => expect(mocks.fetchRecoveryChannels).toHaveBeenCalled());
  await act(async () => {});
}

function typeCode(code: string): void {
  code.split('').forEach((digit, index) => {
    fireEvent.change(screen.getByLabelText(`Цифра ${index + 1} кода`), { target: { value: digit } });
  });
}

describe('PasswordRecoveryScreen: the same steps as the SSO page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.fetchRecoveryChannels.mockResolvedValue(['sms', 'telegram', 'voice']);
    mocks.requestRecoveryCode.mockResolvedValue(ok({ text: 'Запрос принят', resendAfter: 30 }));
    mocks.resetPasswordWithCode.mockResolvedValue(ok());
    mocks.login.mockResolvedValue({ st: true });
  });

  it('walks from the number to the new password and signs in', async () => {
    await renderScreen();

    expect(screen.getByRole('heading', { name: 'Восстановление пароля' })).toBeTruthy();
    expect(screen.getByText('Отправим код подтверждения на ваш номер')).toBeTruthy();
    const submit = screen.getByRole('button', { name: 'Отправить код' }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText('Номер телефона'), { target: { value: '79991234567' } });
    expect((screen.getByLabelText('Номер телефона') as HTMLInputElement).value).toBe(
      '+7 (999) 123-45-67'
    );

    // Способ получения кода: SMS выбрана, подпись под переключателем меняется вместе с ним.
    expect(screen.getByRole('tab', { name: 'SMS' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.click(screen.getByRole('tab', { name: 'Звонок' }));
    expect(screen.getByText('Робот позвонит и продиктует код').getAttribute('data-active')).toBe('true');

    await act(async () => {
      fireEvent.click(submit);
    });
    expect(mocks.requestRecoveryCode).toHaveBeenCalledWith('+79991234567', 'voice', '');

    expect(screen.getByRole('heading', { name: 'Введите код' })).toBeTruthy();
    expect(screen.getByText('+7 (999) ***-**-67')).toBeTruthy();
    expect(screen.getByText('Отправить повторно через 0:30')).toBeTruthy();
    expect(screen.getByText('Запрос принят')).toBeTruthy();

    typeCode('123456');
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить' }));

    expect(screen.getByRole('heading', { name: 'Придумайте новый пароль' })).toBeTruthy();
    const save = screen.getByRole('button', { name: 'Сохранить пароль' }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText('Новый пароль'), { target: { value: 'NewPassword9' } });
    fireEvent.change(screen.getByLabelText('Повторите пароль'), { target: { value: 'NewPassword9' } });
    expect(screen.getByText('Пароли совпадают').closest('li')?.getAttribute('data-met')).toBe('true');

    await act(async () => {
      fireEvent.click(save);
    });
    expect(mocks.resetPasswordWithCode).toHaveBeenCalledWith('+79991234567', '123456', 'NewPassword9');

    expect(screen.getByRole('heading', { name: 'Пароль изменён' })).toBeTruthy();
    expect(screen.getByText('Теперь вы можете войти с новым паролем')).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Войти' }));
    });
    expect(mocks.push).toHaveBeenCalledWith('/list_orders', { scroll: false });
  });

  it('hides the channel switch when only SMS is available', async () => {
    mocks.fetchRecoveryChannels.mockResolvedValue(['sms']);
    await renderScreen();

    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryByText('Способ получения кода')).toBeNull();
  });

  it('shows a rejected code with its own title and lets the driver go back', async () => {
    mocks.resetPasswordWithCode.mockResolvedValue(
      ok({ st: false, errorCode: 'invalid_code', text: 'Код не подошёл или устарел' })
    );
    await renderScreen();

    fireEvent.change(screen.getByLabelText('Номер телефона'), { target: { value: '79991234567' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Отправить код' }));
    });
    typeCode('123456');
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить' }));
    fireEvent.change(screen.getByLabelText('Новый пароль'), { target: { value: 'NewPassword9' } });
    fireEvent.change(screen.getByLabelText('Повторите пароль'), { target: { value: 'NewPassword9' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Сохранить пароль' }));
    });

    expect(screen.getByRole('heading', { name: 'Введите код' })).toBeTruthy();
    expect(screen.getByText('Неверный код')).toBeTruthy();
    expect(screen.getByText('Код не подошёл или устарел')).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Код подтверждения, 6 цифр' }).getAttribute('data-error')).toBe(
      'true'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Изменить' }));
    expect(screen.getByRole('heading', { name: 'Восстановление пароля' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '← Вернуться ко входу' }));
    expect(mocks.push).toHaveBeenCalledWith('/auth', { scroll: false });
  });
});
