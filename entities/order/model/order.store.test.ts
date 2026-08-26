import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrdersStore } from './order.store';

const mocks = vi.hoisted(() => ({
  readDriverPosition: vi.fn(),
  actionOrder: vi.fn(),
  fetchOrders: vi.fn(),
  checkFakeOrder: vi.fn(),
  getPayQr: vi.fn(),
  hideDelOrders: vi.fn(),
  checkPayOrder: vi.fn(),
}));

vi.mock('@/shared/lib/geolocation', () => ({
  describeGeolocationError: (error: unknown) => ({
    text: String((error as { message?: string })?.message ?? error),
    canContinue: false,
  }),
  readDriverPosition: mocks.readDriverPosition,
}));

vi.mock('@/entities/order/api/order.api', () => ({
  actionOrder: mocks.actionOrder,
  fetchOrders: mocks.fetchOrders,
  checkFakeOrder: mocks.checkFakeOrder,
  getPayQr: mocks.getPayQr,
  hideDelOrders: mocks.hideDelOrders,
  checkPayOrder: mocks.checkPayOrder,
  normalizeOrdersResponse: (response: { home?: { latitude?: number; longitude?: number } }) => ({
    orders: [],
    update_interval: 30,
    limit: '',
    limit_count: '',
    del_orders: [],
    driver_pay: false,
    driver_need_gps: true,
    home:
      response?.home?.latitude != null && response?.home?.longitude != null
        ? {
            center: [response.home.latitude, response.home.longitude],
            zoom: 12,
            controls: [],
          }
        : null,
    zoomSize: 12,
  }),
}));

vi.mock('@/entities/settings', () => ({
  useSettingsStore: {
    getState: () => ({ pointId: 12 }),
  },
}));

vi.mock('@/components/analytics', () => ({
  log: vi.fn(),
}));

vi.mock('@/shared/lib/devLog', () => ({
  devLog: vi.fn(),
}));

describe('orders store actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.readDriverPosition.mockResolvedValue({
      latitude: '53.5',
      longitude: '49.4',
      blocked: false,
      message: null,
    });
    mocks.actionOrder.mockResolvedValue({ st: true, text: 'ok' });
    mocks.fetchOrders.mockResolvedValue({ st: true, orders: [] });
    mocks.checkFakeOrder.mockResolvedValue({ st: true, text: 'ok' });
    mocks.getPayQr.mockResolvedValue({ st: true, pay: { qr: 'qr' } });

    useOrdersStore.setState({
      isClick: false,
      is_load: false,
      is_check: false,
      isOpenOrderMap: true,
      showOrders: [{ id: 866503 } as any],
      driver_need_gps: true,
      showErrOrder: false,
      textErrOrder: '',
      modalConfirm: true,
      type_confirm: 'take',
      order_finish_id: 866503,
    });
  });

  it('keeps the map card open until the take request succeeds', async () => {
    let resolveAction: (value: { st: boolean }) => void = () => undefined;
    mocks.actionOrder.mockReturnValue(
      new Promise((resolve) => {
        resolveAction = resolve;
      })
    );

    const pending = useOrdersStore.getState().actionGetOrder(866503, true);

    expect(useOrdersStore.getState().is_load).toBe(true);
    expect(useOrdersStore.getState().isClick).toBe(true);
    expect(useOrdersStore.getState().isOpenOrderMap).toBe(true);
    expect(useOrdersStore.getState().modalConfirm).toBe(false);

    resolveAction({ st: true });
    await pending;

    expect(mocks.actionOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 866503,
        type_action: 1,
        latitude: '53.5',
        longitude: '49.4',
        point_id: 12,
      })
    );
    expect(useOrdersStore.getState().isOpenOrderMap).toBe(false);
    expect(useOrdersStore.getState().is_load).toBe(false);
    expect(useOrdersStore.getState().isClick).toBe(false);
  });

  it('does not close the card and skips the request when geolocation is blocked', async () => {
    mocks.readDriverPosition.mockResolvedValue({
      latitude: '',
      longitude: '',
      blocked: true,
      message: 'Нет доступа к геолокации.',
    });

    await useOrdersStore.getState().actionGetOrder(866503, true);

    expect(mocks.actionOrder).not.toHaveBeenCalled();
    expect(useOrdersStore.getState().isOpenOrderMap).toBe(true);
    expect(useOrdersStore.getState().showErrOrder).toBe(true);
    expect(useOrdersStore.getState().textErrOrder).toContain('Нет доступа к геолокации');
  });

  it('continues take without coordinates after a GPS timeout', async () => {
    mocks.readDriverPosition.mockResolvedValue({
      latitude: '',
      longitude: '',
      blocked: false,
      message: null,
    });

    await useOrdersStore.getState().actionGetOrder(866503, true);

    expect(mocks.actionOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 866503,
        type_action: 1,
        latitude: '',
        longitude: '',
      })
    );
    expect(useOrdersStore.getState().isOpenOrderMap).toBe(false);
  });

  it('keeps the card open when the take request fails', async () => {
    mocks.actionOrder.mockResolvedValue({ st: false, text: 'Заказ уже взят' });

    await useOrdersStore.getState().actionGetOrder(866503, true);

    expect(useOrdersStore.getState().isOpenOrderMap).toBe(true);
    expect(useOrdersStore.getState().showErrOrder).toBe(true);
    expect(useOrdersStore.getState().textErrOrder).toBe('Заказ уже взят');
  });

  it('ignores a second take click while the first request is in flight', async () => {
    let resolveAction: (value: { st: boolean }) => void = () => undefined;
    mocks.actionOrder.mockReturnValue(
      new Promise((resolve) => {
        resolveAction = resolve;
      })
    );

    const first = useOrdersStore.getState().actionGetOrder(866503, true);
    const second = useOrdersStore.getState().actionGetOrder(866503, true);

    resolveAction({ st: true });
    await Promise.all([first, second]);

    expect(mocks.actionOrder).toHaveBeenCalledTimes(1);
  });

  it('sends finish and cancel with the matching type_action', async () => {
    await useOrdersStore.getState().actionFinishOrder(10, true);
    await useOrdersStore.getState().actionCencelOrder(10, true);

    expect(mocks.actionOrder).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ id: 10, type_action: 3 })
    );
    expect(mocks.actionOrder).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ id: 10, type_action: 2 })
    );
  });

  it('skips GPS when the driver does not need it', async () => {
    useOrdersStore.setState({ driver_need_gps: false });

    await useOrdersStore.getState().actionGetOrder(866503, true);

    expect(mocks.readDriverPosition).not.toHaveBeenCalled();
    expect(mocks.actionOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: '',
        longitude: '',
      })
    );
  });

  it('moves the map home point when cafe coordinates change', async () => {
    useOrdersStore.setState({
      home: { center: [1, 2], zoom: 12, controls: [] },
      is_check: false,
      isClick: false,
    });
    mocks.fetchOrders.mockResolvedValue({
      st: true,
      home: { latitude: 53.531521, longitude: 49.312353 },
    });

    await useOrdersStore.getState().getOrders();

    expect(useOrdersStore.getState().home?.center).toEqual([53.531521, 49.312353]);
  });

  it('keeps the same home point when cafe coordinates did not change', async () => {
    const home = {
      center: [53.531521, 49.312353] as [number, number],
      zoom: 12,
      controls: [] as string[],
    };

    useOrdersStore.setState({
      home,
      is_check: false,
      isClick: false,
    });
    mocks.fetchOrders.mockResolvedValue({
      st: true,
      home: { latitude: 53.531521, longitude: 49.312353 },
    });

    await useOrdersStore.getState().getOrders();

    expect(useOrdersStore.getState().home).toBe(home);
  });

  it('opens all orders grouped at practically the same map location', () => {
    useOrdersStore.setState({
      orders: [
        { id: 1, xy: { latitude: 55.700001, longitude: 37.600001 } } as any,
        { id: 2, xy: { latitude: 55.700004, longitude: 37.600004 } } as any,
        { id: 3, xy: { latitude: 55.71, longitude: 37.61 } } as any,
      ],
      showOrders: [],
      isOpenOrderMap: false,
    });

    useOrdersStore.getState().showOrdersMap(1);

    expect(useOrdersStore.getState().showOrders.map((order) => order.id)).toEqual([1, 2]);
    expect(useOrdersStore.getState().isOpenOrderMap).toBe(true);
  });
});
