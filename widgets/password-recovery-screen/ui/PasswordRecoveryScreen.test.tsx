import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  SMARTCAPTCHA_CLIENT_KEY: '',
  default: () => null,
}));

vi.mock('@/shared/ui/Font', () => ({
  roboto: { variable: 'roboto-variable' },
}));

describe('PasswordRecoveryScreen without captcha key', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requestPasswordRecoveryCode.mockResolvedValue({ st: true });
    mocks.confirmPasswordRecoveryCode.mockResolvedValue({ st: false, text: 'Неверный код' });
  });

  afterEach(() => { vi.useRealTimers(); });

  it('lets the driver request a code without rendering captcha', async () => {
    render(<PasswordRecoveryScreen />);

    expect(screen.queryByTestId('smart-captcha')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Номер телефона'), {
      target: { value: '79870001122' },
    });
    fireEvent.change(screen.getByLabelText('Новый пароль'), {
      target: { value: 'Password1' },
    });

    const submit = screen.getByRole('button', { name: 'Получить код' });
    expect(submit).toBeEnabled();

    fireEvent.click(submit);

    await waitFor(() =>
      expect(mocks.requestPasswordRecoveryCode).toHaveBeenCalledWith('79870001122', 'Password1', '')
    );
  });

  it('shows a resend countdown while allowing code confirmation and updates after background time', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-07T12:00:00Z'));
    mocks.requestPasswordRecoveryCode.mockResolvedValueOnce({ st: true, resend_after: 30 });
    render(<PasswordRecoveryScreen />);
    fireEvent.change(screen.getByLabelText('Номер телефона'), { target: { value: '79870001122' } });
    fireEvent.change(screen.getByLabelText('Новый пароль'), { target: { value: 'Password1' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Получить код' })); });
    expect(screen.getByRole('button', { name: 'Отправить код повторно через 30 с' })).toBeDisabled();
    await act(async () => {
      fireEvent.paste(screen.getByLabelText('Код из смс, цифра 1'), {
        clipboardData: { getData: () => '123456' },
      });
    });
    expect(mocks.confirmPasswordRecoveryCode).toHaveBeenCalledWith('79870001122', '123456');
    expect(screen.getByRole('button', { name: 'Подтвердить' })).toBeEnabled();
    act(() => {
      vi.setSystemTime(new Date('2026-10-07T12:01:00Z'));
      window.dispatchEvent(new Event('focus'));
    });
    expect(screen.getByRole('button', { name: 'Отправить код повторно' })).toBeEnabled();
  });

});
