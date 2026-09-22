import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';

import { OrdersMapScreen } from './OrdersMapScreen';

const mocks = vi.hoisted(() => {
  const setCenter = vi.fn();
  const getBounds = vi.fn(() => [
    [55.6, 37.5],
    [55.8, 37.7],
  ]);
  const getCenter = vi.fn(() => [55.7, 37.6]);
  const eventsAdd = vi.fn();
  const eventsRemove = vi.fn();

  return {
    headerState: {
    globalFontSize: 16,
    theme: 'white',
    mapScale: '1',
    night_map: false,
    darkTheme: false,
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
      isClick: false,
      is_load: false,
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
    setCenter,
    getBounds,
    getCenter,
    eventsAdd,
    eventsRemove,
    createClass: vi.fn((template: string) => template),
    isOnline: true,
    mapInstance: {
      setCenter,
      getBounds,
      getCenter,
      events: { add: eventsAdd, remove: eventsRemove },
    },
  };
});

vi.mock('@pbe/react-yandex-maps', () => ({
  YMaps: ({ children }: { children: React.ReactNode }) => <div data-testid="ymaps">{children}</div>,
  Map: ({
    children,
    instanceRef,
  }: {
    children: React.ReactNode;
    instanceRef?: (ref: any) => void;
  }) => {
    instanceRef?.(mocks.mapInstance);
    return <div data-testid="map">{children}</div>;
  },
  Placemark: ({ onClick }: { onClick?: () => void }) => (
    <button type="button" data-testid="placemark" onClick={onClick} />
  ),
  TrafficControl: () => <div data-testid="traffic-control" />,
  ZoomControl: () => <div data-testid="zoom-control" />,
  useYMaps: () => ({
    templateLayoutFactory: {
      createClass: mocks.createClass,
    },
  }),
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

vi.mock('@/shared/config/fonts', () => ({
  roboto: { variable: 'roboto-variable' },
}));

vi.mock('@/features/offline/model/connectivity.store', () => ({
  isAppOnline: () => mocks.isOnline,
  markAppOffline: vi.fn(),
  useConnectivityStore: (selector: (state: { isOnline: boolean }) => any) =>
    selector({ isOnline: mocks.isOnline }),
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
    mocks.orderState.type = { id: 1, text: 'Активные' };
    mocks.orderState.orders = [];
    mocks.isOnline = true;
    mocks.headerState.night_map = false;
    mocks.headerState.darkTheme = false;
    delete (window as { ymaps?: unknown }).ymaps;
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

  it('uses the dark map style when the interface theme is dark', () => {
    mocks.headerState.darkTheme = true;

    const { container } = render(<OrdersMapScreen />);
    const mapStage = container.querySelector('.orders-map-stage__map');

    expect(mapStage).toHaveAttribute('data-map-theme', 'dark');
    expect(mapStage).toHaveStyle({ backgroundColor: '#070A0E' });
    expect(mapStage?.getAttribute('style')).toContain('brightness(72%)');
  });

  it('renders one counted marker for orders at the same location', () => {
    mocks.orderState.orders = [
      {
        id: 1,
        point_color: '#cc0033',
        point_text: 'Первый',
        xy: { latitude: 55.7, longitude: 37.6 },
      },
      {
        id: 2,
        point_color: '#42627d',
        point_text: 'Второй',
        xy: { latitude: 55.700004, longitude: 37.600004 },
      },
      {
        id: 3,
        point_color: '#cc0033',
        point_text: 'Третий',
        xy: { latitude: 55.75, longitude: 37.65 },
      },
    ];

    render(<OrdersMapScreen />);

    expect(screen.getAllByTestId('placemark')).toHaveLength(3);
    expect(mocks.createClass).toHaveBeenCalledWith(
      expect.stringContaining('map-marker-count'),
      expect.any(Object)
    );
  });

  it('shows a grouped edge arrow and centers the map when it is tapped', () => {
    mocks.orderState.orders = [
      {
        id: 4,
        point_color: '#cc0033',
        point_text: 'За картой',
        xy: { latitude: 55.7, longitude: 38 },
      },
      {
        id: 5,
        point_color: '#42627d',
        point_text: 'Там же',
        xy: { latitude: 55.700004, longitude: 38.000004 },
      },
    ];

    render(<OrdersMapScreen />);

    fireEvent.click(screen.getByRole('button', { name: /Показать 2 заказа/ }));

    expect(mocks.setCenter).toHaveBeenCalledWith([55.7, 38]);
  });

  it('opens cached order cards from the offline list when the map cannot load', () => {
    mocks.isOnline = false;
    mocks.orderState.orders = [
      {
        id: 7,
        addr: 'Ленина, 5',
        status: 'Собран',
        point_color: '#cc0033',
        xy: { latitude: 55.7, longitude: 37.6 },
      },
      {
        id: 8,
        addr: 'Ленина, 5',
        status: 'Готовится',
        point_color: '#42627d',
        xy: { latitude: 55.700004, longitude: 37.600004 },
      },
    ];

    render(<OrdersMapScreen />);

    expect(screen.queryByTestId('map')).not.toBeInTheDocument();
    expect(screen.getByTestId('orders-map-offline-list')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Ленина, 5'));

    expect(mocks.orderState.showOrdersMap).toHaveBeenCalledWith(7);
  });

  it('keeps the map when the maps api is already loaded and the app goes offline', () => {
    mocks.isOnline = false;
    (window as { ymaps?: unknown }).ymaps = {};

    render(<OrdersMapScreen />);

    expect(screen.getByTestId('map')).toBeInTheDocument();
    expect(screen.queryByTestId('orders-map-offline-list')).not.toBeInTheDocument();
  });
});
