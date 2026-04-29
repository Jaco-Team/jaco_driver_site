import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';

import { OrdersMapScreen } from './OrdersMapScreen';

const mocks = vi.hoisted(() => ({
  headerState: {
    globalFontSize: 16,
    theme: 'white',
    mapScale: '1',
    night_map: false,
    is_scaleMap: true,
  },
  orderState: {
    orders: [],
    update_interval: 30,
    type: { id: 1, text: 'Активные' },
    limit: '1/5',
    limit_count: '2',
    home: { center: [55.7, 37.6], zoom: 12, controls: [] },
    location_driver: null,
    type_location: 'none',
    location_driver_time_text: '',
    modalConfirm: false,
    order_finish_id: null,
    type_confirm: null,
    showErrOrder: false,
    textErrOrder: '',
    types_dop: [
      { id: 1, text: 'В очереди' },
      { id: 2, text: 'Готовится' },
    ],
    type_dop: ['1', '2'],
    is_showModalTypeDop: false,
    getOrders: vi.fn(),
    showOrdersMap: vi.fn(),
    setType: vi.fn(),
    set_type_location: vi.fn(),
    closeErrOrder: vi.fn(),
    setActiveConfirm: vi.fn(),
    actionFinishOrder: vi.fn(),
    actionCencelOrder: vi.fn(),
    actionGetOrder: vi.fn(),
    actionFakeOrder: vi.fn(),
    showModalTypeDop: vi.fn(),
    setTypeDop: vi.fn(),
  } as any,
  setCenter: vi.fn(),
}));

vi.mock('@pbe/react-yandex-maps', () => ({
  YMaps: ({ children }: { children: React.ReactNode }) => <div data-testid="ymaps">{children}</div>,
  Map: ({
    children,
    instanceRef,
  }: {
    children: React.ReactNode;
    instanceRef?: (ref: any) => void;
  }) => {
    instanceRef?.({ setCenter: mocks.setCenter });
    return <div data-testid="map">{children}</div>;
  },
  Placemark: () => <div data-testid="placemark" />,
  TrafficControl: () => <div data-testid="traffic-control" />,
  ZoomControl: () => <div data-testid="zoom-control" />,
}));

vi.mock('@/features/header/model/header.store', () => ({
  useHeaderStore: (selector: (state: typeof mocks.headerState) => any) =>
    selector(mocks.headerState),
}));

vi.mock('@/entities/order/model/order.store', () => ({
  useOrdersStore: (selector: (state: typeof mocks.orderState) => any) => selector(mocks.orderState),
}));

vi.mock('@/shared/api/client', () => ({
  log: vi.fn(),
}));

vi.mock('@/shared/ui/Font', () => ({
  roboto: { variable: 'roboto-variable' },
}));

vi.mock('@/widgets/order/ui/components/OrderConfirmModal', () => ({
  OrderConfirmModal: () => <div data-testid="confirm-modal" />,
}));

vi.mock('@/shared/ui/ErrorModal/ErrorModal', () => ({
  ErrorModal: () => <div data-testid="error-modal" />,
}));

describe('OrdersMapScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).ymaps = {
      templateLayoutFactory: {
        createClass: vi.fn((template: string) => template),
      },
    };
    mocks.orderState.type = { id: 1, text: 'Активные' };
  });

  it('renders map controls and current limits', () => {
    render(<OrdersMapScreen />);

    expect(screen.getByTestId('map')).toBeInTheDocument();
    expect(screen.getByTestId('traffic-control')).toBeInTheDocument();
    expect(screen.getByTestId('zoom-control')).toBeInTheDocument();
    expect(screen.getByText('1/5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('switches map order type through footer controls', () => {
    render(<OrdersMapScreen />);

    fireEvent.click(screen.getByText('Мои'));

    expect(mocks.orderState.setType).toHaveBeenCalledWith({ id: 2, text: 'Мои отмеченные' }, -1);
  });
});
