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
    vi.clearAllMocks();
    mocks.requestPasswordRecoveryCode.mockResolvedValue({ st: true });
  });

  it('keeps submit disabled until captcha succeeds', async () => {
    render(<PasswordRecoveryScreen />);

    fireEvent.change(screen.getByLabelText('Номер телефона'), {
      target: { value: '79870001122' },
    });
    fireEvent.change(screen.getByLabelText('Новый пароль'), {
      target: { value: 'Password1' },
    });

    const submit = screen.getByRole('button', { name: 'Получить код' });
    expect(screen.getByTestId('smart-captcha')).toBeInTheDocument();
    expect(submit).toBeDisabled();

    fireEvent.click(submit);
    expect(mocks.requestPasswordRecoveryCode).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('smart-captcha'));
    expect(submit).toBeEnabled();

    fireEvent.click(submit);
    await waitFor(() =>
      expect(mocks.requestPasswordRecoveryCode).toHaveBeenCalledWith(
        '79870001122',
        'Password1',
        'captcha-token'
      )
    );
  });
});
