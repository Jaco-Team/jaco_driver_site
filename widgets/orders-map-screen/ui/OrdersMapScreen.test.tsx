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
  const getZoom = vi.fn(() => 12);
  const setZoom = vi.fn();
  const trafficSetMap = vi.fn();
  const placemarkMount = vi.fn();
  const placemarkUnmount = vi.fn();

  return {
    headerState: {
      globalFontSize: 16,
      theme: 'white',
      mapScale: '1',
      night_map: false,
      darkTheme: false,
      is_scaleMap: true,
    },
    settingsState: {
      pointId: 12,
      settings: {
        map_hints: 1,
        ai_recommend: 0,
      },
    },
    orderState: {
      orders: [],
      sourceOrders: [],
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
      typeToStatus: { 1: 'В очереди', 2: 'Готовится' },
      is_showModalTypeDop: false,
      isClick: false,
      is_load: false,
      is_check: false,
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
    getZoom,
    setZoom,
    trafficSetMap,
    placemarkMount,
    placemarkUnmount,
    createClass: vi.fn((template: string) => template),
    loadOfflineMapRuntime: vi.fn().mockResolvedValue(undefined),
    isOnline: true,
    mapInstance: {
      setCenter,
      getBounds,
      getCenter,
      getZoom,
      setZoom,
      events: { add: eventsAdd, remove: eventsRemove },
    },
  };
});

vi.mock('@pbe/react-yandex-maps', async () => {
  const { useEffect } = await vi.importActual<typeof import('react')>('react');

  return {
    YMaps: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="ymaps">{children}</div>
    ),
    Map: ({
      children,
      instanceRef,
      options,
    }: {
      children: React.ReactNode;
      instanceRef?: (ref: any) => void;
      options?: { suppressMapOpenBlock?: boolean };
    }) => {
      useEffect(() => {
        instanceRef?.(mocks.mapInstance);

        return () => instanceRef?.(null);
      }, [instanceRef]);

      return (
        <div data-testid="map" data-suppress-map-open-block={options?.suppressMapOpenBlock}>
          {children}
        </div>
      );
    },
    Placemark: ({ onClick }: { onClick?: () => void }) => {
      useEffect(() => {
        mocks.placemarkMount();

        return () => mocks.placemarkUnmount();
      }, []);

      return <button type="button" data-testid="placemark" onClick={onClick} />;
    },
    TrafficControl: () => <div data-testid="traffic-control" />,
    ZoomControl: () => <div data-testid="zoom-control" />,
    useYMaps: () => ({
      templateLayoutFactory: {
        createClass: mocks.createClass,
      },
      traffic: {
        provider: {
          Actual: class {
            setMap = mocks.trafficSetMap;
          },
        },
      },
    }),
  };
});

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

vi.mock('@/entities/settings', () => ({
  normalizeBooleanSetting: (value: unknown) => Number(value) === 1 || value === true,
  useSettingsStore: (selector: (state: typeof mocks.settingsState) => any) =>
    selector(mocks.settingsState),
}));

vi.mock('@/features/order-recommendation/ui/OrderRecommendationControl', () => ({
  OrderRecommendationControl: () => <div data-testid="order-recommendation-control" />,
}));

vi.mock('@/features/order-recommendation/ui/ActiveOrderRecommendationMapLayer', () => ({
  ActiveOrderRecommendationMapLayer: () => <div data-testid="order-recommendation-map-layer" />,
}));

vi.mock('@/shared/lib/offline/offlineMapAssets', () => ({
  ensureOfflineMapAssets: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/shared/lib/offline/offlineMapRuntime', () => ({
  loadOfflineMapRuntime: mocks.loadOfflineMapRuntime,
}));

vi.mock('./OrdersOfflineMap', () => ({
  OrdersOfflineMap: ({ onOpenOrders }: { onOpenOrders: (id: number) => void }) => (
    <div data-testid="offline-map">
      <button type="button" onClick={() => onOpenOrders(7)}>
        Открыть сохранённый заказ
      </button>
    </div>
  ),
}));

vi.mock('@/widgets/order/ui/components/OrderConfirmModal', () => ({
  OrderConfirmModal: () => <div data-testid="confirm-modal" />,
}));

describe('OrdersMapScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.orderState.type = { id: 1, text: 'Активные' };
    mocks.orderState.orders = [];
    mocks.orderState.update_interval = 30;
    mocks.orderState.isClick = false;
    mocks.orderState.is_load = false;
    mocks.orderState.is_check = false;
    mocks.headerState.is_scaleMap = true;
    mocks.isOnline = true;
    mocks.headerState.night_map = false;
    mocks.headerState.darkTheme = false;
    mocks.settingsState.settings.map_hints = 1;
    mocks.settingsState.settings.ai_recommend = 0;
    delete (window as { ymaps?: unknown }).ymaps;
  });

  it('renders map controls and current limits', () => {
    render(<OrdersMapScreen />);

    expect(screen.getByTestId('map')).toBeInTheDocument();
    expect(screen.getByTestId('map')).toHaveAttribute('data-suppress-map-open-block', 'true');
    expect(screen.getByRole('button', { name: 'Показать пробки на карте' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Масштаб карты' })).toBeInTheDocument();
    expect(screen.getByText('1/5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(mocks.loadOfflineMapRuntime).toHaveBeenCalledTimes(1);
  });

  it('switches API 2.1 traffic without changing the map controls', () => {
    render(<OrdersMapScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'Показать пробки на карте' }));
    expect(mocks.trafficSetMap).toHaveBeenCalledWith(mocks.mapInstance);

    fireEvent.click(screen.getByRole('button', { name: 'Скрыть пробки на карте' }));
    expect(mocks.trafficSetMap).toHaveBeenLastCalledWith(null);
  });

  it('refreshes orders using the same action as the header', () => {
    render(<OrdersMapScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'Обновить заказы' }));

    expect(mocks.orderState.getOrders).toHaveBeenCalledTimes(1);
    expect(mocks.orderState.getOrders).toHaveBeenCalledWith(true);
    expect(mocks.setZoom).not.toHaveBeenCalled();
  });

  it('keeps the refresh control when zoom is disabled and the theme is dark', () => {
    mocks.headerState.is_scaleMap = false;
    mocks.headerState.darkTheme = true;
    render(<OrdersMapScreen />);

    expect(screen.queryByRole('slider', { name: 'Масштаб карты' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Обновить заказы' })).toBeEnabled();
  });

  it.each(['is_check', 'is_load'])('accepts refresh while regular loading %s is active', (flag) => {
    mocks.orderState[flag] = true;
    render(<OrdersMapScreen />);

    const refresh = screen.getByRole('button', { name: 'Обновить заказы' });
    expect(refresh).toBeEnabled();
    fireEvent.click(refresh);
    expect(mocks.orderState.getOrders).toHaveBeenCalledWith(true);
  });

  it('blocks refresh only during an order action', () => {
    mocks.orderState.isClick = true;
    render(<OrdersMapScreen />);

    const refresh = screen.getByRole('button', { name: 'Обновить заказы' });
    expect(refresh).toBeDisabled();
    fireEvent.click(refresh);
    expect(mocks.orderState.getOrders).not.toHaveBeenCalled();
  });

  it('hides refresh offline and restores it when the connection returns', () => {
    mocks.isOnline = false;
    const { rerender } = render(<OrdersMapScreen />);
    expect(screen.queryByRole('button', { name: 'Обновить заказы' })).not.toBeInTheDocument();

    mocks.isOnline = true;
    rerender(<OrdersMapScreen />);
    expect(screen.getByRole('button', { name: 'Обновить заказы' })).toBeInTheDocument();
  });

  it('does not show the cached map before the online map is ready', () => {
    render(<OrdersMapScreen />);

    expect(screen.getByRole('progressbar', { name: 'Загрузка карты' })).toBeInTheDocument();
    expect(screen.queryByTestId('offline-map')).not.toBeInTheDocument();
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
    expect(mapStage).toHaveStyle({ backgroundColor: '#2e3c4e' });
    expect(mapStage?.getAttribute('style')).not.toContain('filter:');
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
      expect.stringContaining('map-marker-cluster'),
      expect.any(Object)
    );
    const groupedTemplates = mocks.createClass.mock.calls
      .map(([template]) => String(template))
      .filter((template) => template.includes('map-marker-cluster'));
    expect(groupedTemplates).not.toHaveLength(0);
    expect(groupedTemplates.every((template) => !template.includes('span_text_'))).toBe(true);
  });

  it('recreates an order placemark when its remaining-time label changes', () => {
    mocks.orderState.orders = [
      {
        id: 1,
        point_color: '#cc0033',
        point_text: '15:59 (64 мин.)',
        xy: { latitude: 55.7, longitude: 37.6 },
      },
    ];

    const { rerender } = render(<OrdersMapScreen />);
    const mountsBeforeRefresh = mocks.placemarkMount.mock.calls.length;
    const unmountsBeforeRefresh = mocks.placemarkUnmount.mock.calls.length;

    mocks.orderState.orders = [
      {
        ...mocks.orderState.orders[0],
        point_text: '15:59 (63 мин.)',
      },
    ];
    rerender(<OrdersMapScreen />);

    expect(mocks.placemarkMount).toHaveBeenCalledTimes(mountsBeforeRefresh + 1);
    expect(mocks.placemarkUnmount).toHaveBeenCalledTimes(unmountsBeforeRefresh + 1);
  });

  it('does not start order polling when automatic refresh is disabled', () => {
    mocks.orderState.update_interval = 0;
    const setIntervalSpy = vi.spyOn(window, 'setInterval');

    render(<OrdersMapScreen />);

    expect(setIntervalSpy.mock.calls.some(([, delay]) => delay === 0)).toBe(false);
    setIntervalSpy.mockRestore();
  });

  it('shows three order colors and the hidden-order count for a group of five', () => {
    mocks.orderState.orders = Array.from({ length: 5 }, (_, index) => ({
      id: index + 20,
      point_color: index < 2 ? '#cc0033' : `#42627${index}`,
      point_text: `Заказ ${index + 1}`,
      xy: { latitude: 55.7, longitude: 37.6 },
    }));

    render(<OrdersMapScreen />);

    const groupedTemplates = mocks.createClass.mock.calls
      .map(([template]) => String(template))
      .filter((template) => template.includes('map-marker-cluster'));
    expect(groupedTemplates).not.toHaveLength(0);
    expect(groupedTemplates.every((template) => template.includes('+2'))).toBe(true);
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

  it('hides map edge hints when the courier disables them', () => {
    mocks.settingsState.settings.map_hints = 0;
    mocks.orderState.orders = [
      {
        id: 4,
        point_color: '#cc0033',
        point_text: 'За картой',
        xy: { latitude: 55.7, longitude: 38 },
      },
    ];

    render(<OrdersMapScreen />);

    expect(screen.queryByRole('button', { name: /Показать 1 заказ/ })).not.toBeInTheDocument();
  });

  it('shows AI recommendations only after the courier enables them', () => {
    const { rerender } = render(<OrdersMapScreen />);

    expect(screen.queryByTestId('order-recommendation-control')).not.toBeInTheDocument();

    mocks.settingsState.settings.ai_recommend = 1;
    rerender(<OrdersMapScreen />);

    expect(screen.getByTestId('order-recommendation-control')).toBeInTheDocument();
  });

  it('opens cached order cards from the saved offline map', () => {
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
    expect(screen.getByTestId('offline-map')).toBeInTheDocument();

    expect(mocks.loadOfflineMapRuntime).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Открыть сохранённый заказ'));

    expect(mocks.orderState.showOrdersMap).toHaveBeenCalledWith(7);
  });

  it('uses the saved map offline even when the online maps api was loaded before', () => {
    mocks.isOnline = false;
    (window as { ymaps?: unknown }).ymaps = {};

    render(<OrdersMapScreen />);

    expect(screen.queryByTestId('map')).not.toBeInTheDocument();
    expect(screen.getByTestId('offline-map')).toBeInTheDocument();
  });

  it('switches from the cached map back to the online map without a page reload', () => {
    mocks.isOnline = false;
    const { rerender } = render(<OrdersMapScreen />);
    expect(screen.getByTestId('offline-map')).toBeInTheDocument();

    mocks.isOnline = true;
    rerender(<OrdersMapScreen />);

    expect(screen.queryByTestId('offline-map')).not.toBeInTheDocument();
    expect(screen.getByTestId('map')).toBeInTheDocument();
  });
});
