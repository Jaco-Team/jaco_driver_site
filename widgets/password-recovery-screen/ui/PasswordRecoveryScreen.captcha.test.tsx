import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PasswordRecoveryScreen from './PasswordRecoveryScreen';

const mocks = vi.hoisted(() => ({
  requestPasswordRecoveryCode: vi.fn(),
  confirmPasswordRecoveryCode: vi.fn(),
  login: vi.fn(),
  push: vi.fn(),
}));

vi.mock('next/image', () => ({
  // The test mock intentionally renders the browser element instead of Next Image.
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('@/components/meta', () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-meta-title={title}>{children}</div>
  ),
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
  default: ({ onSuccess }: { onSuccess: (token: string) => void }) => (
    <button type="button" data-testid="smart-captcha" onClick={() => onSuccess('captcha-token')}>
      captcha
    </button>
  ),
}));

vi.mock('@/shared/ui/Font', () => ({
  roboto: { variable: 'roboto-variable' },
}));

describe('PasswordRecoveryScreen with captcha key', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requestPasswordRecoveryCode.mockResolvedValue({ st: true });
    mocks.confirmPasswordRecoveryCode.mockResolvedValue({ st: false, text: 'Неверный код' });
    mocks.login.mockResolvedValue({ st: true });
  });

  it('keeps the first send disabled until mandatory CAPTCHA succeeds', async () => {
    render(<PasswordRecoveryScreen />);
    fireEvent.change(screen.getByLabelText('Номер телефона'), { target: { value: '79870001122' } });
    fireEvent.change(screen.getByLabelText('Новый пароль'), { target: { value: 'Password1' } });
    const submit = screen.getByRole('button', { name: 'Получить код' });
    expect(screen.getByTestId('smart-captcha')).toBeInTheDocument();
    expect(screen.getByText('Хотя бы одна цифра')).toBeInTheDocument();
    expect(screen.getByText('Строчная латинская буква')).toBeInTheDocument();
    expect(screen.getByText('Заглавная латинская буква')).toBeInTheDocument();
    expect(submit).toBeDisabled();
    fireEvent.click(screen.getByTestId('smart-captcha'));
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    await waitFor(() => expect(mocks.requestPasswordRecoveryCode).toHaveBeenLastCalledWith(
      '79870001122', 'Password1', 'captcha-token'
    ));
    await screen.findByRole('button', { name: 'Подтвердить' });
    expect(screen.queryByTestId('smart-captcha')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Отправить код повторно' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Отправить код повторно' }));
    expect(mocks.requestPasswordRecoveryCode).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Проверка для повторной отправки')).toBeInTheDocument();
    expect(screen.getByTestId('smart-captcha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Отправить код повторно' })).toBeDisabled();
    fireEvent.paste(screen.getByLabelText('Код из смс, цифра 1'), {
      clipboardData: { getData: () => '123456' },
    });
    await waitFor(() => expect(mocks.confirmPasswordRecoveryCode).toHaveBeenCalledWith('79870001122', '123456'));
  });

  it('preserves the code fields after a failed resend and displays its CAPTCHA on the SMS step', async () => {
    mocks.requestPasswordRecoveryCode.mockResolvedValueOnce({ st: true });
    mocks.requestPasswordRecoveryCode.mockResolvedValueOnce({
      st: false, captcha_required: true, text: 'Не удалось подтвердить CAPTCHA.',
    });
    render(<PasswordRecoveryScreen />);
    fireEvent.change(screen.getByLabelText('Номер телефона'), { target: { value: '79870001122' } });
    fireEvent.change(screen.getByLabelText('Новый пароль'), { target: { value: 'Password1' } });
    fireEvent.click(screen.getByTestId('smart-captcha'));
    fireEvent.click(screen.getByRole('button', { name: 'Получить код' }));
    await screen.findByRole('button', { name: 'Подтвердить' });
    fireEvent.paste(screen.getByLabelText('Код из смс, цифра 1'), {
      clipboardData: { getData: () => '12345' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Отправить код повторно' }));
    expect(mocks.requestPasswordRecoveryCode).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByTestId('smart-captcha'));
    fireEvent.click(screen.getByRole('button', { name: 'Отправить код повторно' }));
    await screen.findByText('Не удалось подтвердить CAPTCHA.');
    expect(screen.queryByLabelText('Номер телефона')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Код из смс, цифра 1')).toHaveValue('1');
    expect(screen.getByLabelText('Код из смс, цифра 5')).toHaveValue('5');
    expect(screen.getByTestId('smart-captcha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Отправить код повторно' })).toBeDisabled();
    fireEvent.paste(screen.getByLabelText('Код из смс, цифра 1'), {
      clipboardData: { getData: () => '123456' },
    });
    await waitFor(() => expect(mocks.confirmPasswordRecoveryCode).toHaveBeenCalledWith('79870001122', '123456'));
  });
});
