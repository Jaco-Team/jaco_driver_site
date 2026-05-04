import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';

import AuthCallbackPage from '@/pages/auth/callback';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  fetchMe: vi.fn(),
  log: vi.fn(),
  setAuthenticated: vi.fn(),
  setUnauthorized: vi.fn(),
  getApiErrorInfo: vi.fn((_error?: unknown) => ({ status: 500 })),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock('@mui/material/Grid', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@mui/material/CircularProgress', () => ({
  default: () => <div data-testid="spinner" />,
}));

vi.mock('@/components/meta', () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-meta-title={title}>{children}</div>
  ),
}));

vi.mock('@/features/auth/api/auth.api', () => ({
  fetchMe: () => mocks.fetchMe(),
}));

vi.mock('@/shared/api/errors', () => ({
  getApiErrorInfo: (error: unknown) => mocks.getApiErrorInfo(error),
}));

vi.mock('@/shared/api/client', () => ({
  log: (...args: unknown[]) => mocks.log(...args),
}));

vi.mock('@/features/auth/model/auth.store', () => ({
  useAuthStore: {
    getState: () => ({
      setAuthenticated: (payload: unknown) => mocks.setAuthenticated(payload),
      setUnauthorized: () => mocks.setUnauthorized(),
    }),
  },
}));

vi.mock('@/shared/ui/Font', () => ({
  roboto: { variable: 'roboto-variable' },
}));

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    mocks.replace.mockClear();
    mocks.fetchMe.mockReset();
    mocks.log.mockClear();
    mocks.setAuthenticated.mockClear();
    mocks.setUnauthorized.mockClear();
    mocks.getApiErrorInfo.mockClear();
    window.history.pushState({}, '', '/auth/callback');
  });

  it('renders the callback progress state', () => {
    render(<AuthCallbackPage />);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.getByText('Завершаем вход')).toBeInTheDocument();
  });

  it('marks session authenticated and redirects after successful callback', async () => {
    const me = { id: 1, name: 'Driver' };
    mocks.fetchMe.mockResolvedValueOnce(me);
    window.history.pushState({}, '', '/auth/callback?status=success');

    render(<AuthCallbackPage />);

    await waitFor(() => expect(mocks.setAuthenticated).toHaveBeenCalledWith(me));
    expect(mocks.replace).toHaveBeenCalledWith('/list_orders', { scroll: false });
  });

  it('marks session unauthorized and redirects on failed callback status', async () => {
    window.history.pushState({}, '', '/auth/callback?status=fail&code=denied');

    render(<AuthCallbackPage />);

    await waitFor(() => expect(mocks.setUnauthorized).toHaveBeenCalled());
    expect(mocks.replace).toHaveBeenCalledWith('/auth?error=sso_failed', { scroll: false });
  });

  it('marks session unauthorized and redirects when profile request fails', async () => {
    mocks.fetchMe.mockRejectedValueOnce(new Error('fail'));
    window.history.pushState({}, '', '/auth/callback?status=success');

    render(<AuthCallbackPage />);

    await waitFor(() => expect(mocks.setUnauthorized).toHaveBeenCalled());
    expect(mocks.replace).toHaveBeenCalledWith('/auth?error=sso_failed', { scroll: false });
  });
});
