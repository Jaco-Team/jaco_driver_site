import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';

import ListPage from '@/pages/list_orders';

const mocks = vi.hoisted(() => ({
  isAuthenticated: true,
}));

vi.mock('@/components/meta', () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-meta-title={title}>{children}</div>
  ),
}));

vi.mock('@/widgets/app-header/ui/AppHeader', () => ({
  AppHeader: () => <header data-testid="app-header" />,
}));

vi.mock('@/widgets/order/ui/OrdersPage', () => ({
  OrdersPage: () => <div data-testid="orders-screen" />,
}));

vi.mock('@/shared/lib/session/useProtectedRoute', () => ({
  useProtectedRoute: () => ({ isAuthenticated: mocks.isAuthenticated }),
}));

describe('ListPage', () => {
  beforeEach(() => {
    mocks.isAuthenticated = true;
  });

  it('renders the orders list for authenticated users', () => {
    render(<ListPage />);

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('orders-screen')).toBeInTheDocument();
  });

  it('renders nothing while unauthenticated', () => {
    mocks.isAuthenticated = false;

    const { container } = render(<ListPage />);

    expect(container).toBeEmptyDOMElement();
  });
});
