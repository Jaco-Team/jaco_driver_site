import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';

import MapPage from '@/pages/map_orders';

const mocks = vi.hoisted(() => ({
  isAuthenticated: true,
  session: { isAuth: true, token: 'token-1' },
  setActivePageRU: vi.fn(),
  getOrders: vi.fn(),
  setToken: vi.fn(),
  clearMap: vi.fn(),
}));

vi.mock('@/components/meta', () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-meta-title={title}>{children}</div>
  ),
}));

vi.mock('@/widgets/app-header/ui/AppHeader', () => ({
  AppHeader: () => <header data-testid="app-header" />,
}));

vi.mock('@/widgets/orders-map-screen/ui/OrdersMapScreen', () => ({
  OrdersMapScreen: () => <main data-testid="orders-map-screen" />,
}));

vi.mock('@/shared/lib/session/useProtectedRoute', () => ({
  useProtectedRoute: () => ({
    isAuthenticated: mocks.isAuthenticated,
    session: mocks.session,
  }),
}));

vi.mock('@/features/header/model/header.store', () => ({
  useHeaderStore: (selector: (state: { setActivePageRU: typeof mocks.setActivePageRU }) => any) =>
    selector({ setActivePageRU: mocks.setActivePageRU }),
}));

vi.mock('@/entities/order/model/order.store', () => ({
  useOrdersStore: (
    selector: (state: {
      getOrders: typeof mocks.getOrders;
      setToken: typeof mocks.setToken;
      clearMap: typeof mocks.clearMap;
    }) => any
  ) =>
    selector({
      getOrders: mocks.getOrders,
      setToken: mocks.setToken,
      clearMap: mocks.clearMap,
    }),
}));

describe('MapOrdersPage', () => {
  beforeEach(() => {
    mocks.isAuthenticated = true;
    mocks.session = { isAuth: true, token: 'token-1' };
    mocks.setActivePageRU.mockClear();
    mocks.getOrders.mockClear();
    mocks.setToken.mockClear();
    mocks.clearMap.mockClear();
  });

  it('initializes the orders map screen for authenticated users', async () => {
    render(<MapPage />);

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('orders-map-screen')).toBeInTheDocument();

    await waitFor(() => expect(mocks.setActivePageRU).toHaveBeenCalledWith('Карта заказов'));
    expect(mocks.clearMap).toHaveBeenCalled();
    expect(mocks.setToken).toHaveBeenCalledWith('token-1');
    expect(mocks.getOrders).toHaveBeenCalledWith(true);
  });

  it('renders nothing while unauthenticated', () => {
    mocks.isAuthenticated = false;

    const { container } = render(<MapPage />);

    expect(container).toBeEmptyDOMElement();
  });
});
