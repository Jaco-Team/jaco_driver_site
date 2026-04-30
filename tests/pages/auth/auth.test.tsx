import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthPage from '@/pages/auth';

const mocks = vi.hoisted(() => ({
  setActivePageRU: vi.fn(),
  push: vi.fn(),
  session: { isAuth: false as boolean | 'load', token: '' },
}));

vi.mock('next/dynamic', () => ({
  default: () =>
    function DynamicAuthScreen() {
      return <div data-testid="auth-screen" />;
    },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('@/components/sessionHook', () => ({
  default: () => mocks.session,
}));

vi.mock('@/features/header/model/header.store', () => ({
  useHeaderStore: (
    selector: (state: { setActivePageRU: typeof mocks.setActivePageRU }) => unknown
  ) => selector({ setActivePageRU: mocks.setActivePageRU }),
}));

describe('AuthPage', () => {
  beforeEach(() => {
    mocks.setActivePageRU.mockClear();
    mocks.push.mockClear();
    mocks.session = { isAuth: false, token: '' };
  });

  it('renders the auth screen and marks the active page', async () => {
    render(<AuthPage />);

    expect(screen.getByTestId('auth-screen')).toBeInTheDocument();

    await waitFor(() => expect(mocks.setActivePageRU).toHaveBeenCalledWith('Авторизация'));
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('redirects authenticated users to orders list', async () => {
    mocks.session = { isAuth: true, token: 'token' };

    render(<AuthPage />);

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/list_orders', { scroll: false }));
  });

  it('does not redirect while session is loading', async () => {
    mocks.session = { isAuth: 'load', token: '' };

    render(<AuthPage />);

    await waitFor(() => expect(mocks.setActivePageRU).toHaveBeenCalledWith('Авторизация'));
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
