import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrdersStore } from './order.store';
import { ORDER_STATUS_TYPES, TYPE_STATUS_MAP } from './order.types';
import { writeOfflineCache } from '@/shared/lib/offline/cache';

const mocks = vi.hoisted(() => ({
  readDriverPosition: vi.fn(),
  actionOrder: vi.fn(),
  fetchOrders: vi.fn(),
  checkFakeOrder: vi.fn(),
  getPayQr: vi.fn(),
  hideDelOrders: vi.fn(),
  checkPayOrder: vi.fn(),
  probeConnectivity: vi.fn(),
  isOnline: true,
  pointId: 12 as number | null,
  token: null as string | null,
}));

vi.mock('@/shared/api/token', () => ({ getAuthToken: () => mocks.token }));

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
  normalizeOrdersResponse: (response: {
    orders?: unknown[];
    home?: { latitude?: number; longitude?: number };
  }) => ({
    orders: response?.orders ?? [],
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

vi.mock('@/shared/lib/offline/cache', () => ({
  readOfflineCache: () => null,
  writeOfflineCache: vi.fn(),
  clearOfflineCache: vi.fn(),
}));

vi.mock('@/entities/settings', () => ({
  useSettingsStore: {
    getState: () => ({ pointId: mocks.pointId }),
  },
}));

vi.mock('@/features/offline/model/connectivity.store', () => ({
  isAppOnline: () => mocks.isOnline,
  markAppOffline: () => {
    mocks.isOnline = false;
  },
  useConnectivityStore: {
    getState: () => ({
      probeConnectivity: mocks.probeConnectivity,
    }),
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
    mocks.isOnline = true;
    mocks.pointId = 12;
    mocks.token = null;
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
      type: { id: 1, text: 'Активные' },
      types: [],
      types_dop: [
        { id: 1, text: 'В очереди' },
        { id: 2, text: 'Готовится' },
        { id: 3, text: 'Собран' },
      ],
      type_dop: ['1', '2', '3'],
      orders: [],
      sourceOrders: [],
      ordersByContext: {},
      ordersRefreshPending: false,
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

  it('shows an offline error on the first tap without opening confirmation or calling the API', () => {
    mocks.isOnline = false;
    useOrdersStore.setState({ modalConfirm: false });

    useOrdersStore.getState().setActiveConfirm(true, 866503, true, 'finish', false);

    const state = useOrdersStore.getState();
    expect(state.modalConfirm).toBe(false);
    expect(state.showErrOrder).toBe(true);
    expect(state.textErrOrder).toContain('Нет интернета');
    expect(mocks.readDriverPosition).not.toHaveBeenCalled();
    expect(mocks.actionOrder).not.toHaveBeenCalled();
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

  it('does not send point_id to orders when the cafe filter is not selected', async () => {
    mocks.pointId = null;
    useOrdersStore.setState({ is_check: false, isClick: false });
    mocks.fetchOrders.mockResolvedValue({
      st: true,
      home: { latitude: 53.531521, longitude: 49.312353 },
      orders: [{ id: 77, xy: { latitude: 53.53, longitude: 49.31 } }],
    });

    await useOrdersStore.getState().getOrders();

    expect(mocks.fetchOrders).toHaveBeenCalledWith({ point_id: undefined, type_orders: 1 });
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

  it('keeps cached orders and skips the error modal on a network failure', async () => {
    const cached = { id: 42, drink_list: [], pd: '', et: '', kv: '', comment: 'cached' } as any;
    useOrdersStore.setState({
      orders: [cached],
      is_check: false,
      is_load: false,
      showErrOrder: false,
      textErrOrder: '',
    });
    mocks.fetchOrders.mockRejectedValue({ code: 'ERR_NETWORK', message: 'Network Error' });

    await useOrdersStore.getState().getOrders(false);

    expect(useOrdersStore.getState().orders).toEqual([cached]);
    expect(useOrdersStore.getState().showErrOrder).toBe(false);
  });

  it('switches order tabs from the matching point cache while offline', () => {
    const active = { id: 1, addr: 'Активный' } as any;
    const mine = { id: 2, addr: 'Мой' } as any;
    mocks.isOnline = false;
    useOrdersStore.setState({
      type: { id: 1, text: 'Активные' },
      orders: [active],
      sourceOrders: [active],
      ordersByContext: {
        '12:1': [active],
        '12:2': [mine],
      },
    });

    useOrdersStore.getState().setType({ id: 2, text: 'Мои отмеченные' });

    expect(useOrdersStore.getState().orders).toEqual([mine]);
    expect(useOrdersStore.getState().sourceOrders).toEqual([mine]);
    expect(mocks.fetchOrders).not.toHaveBeenCalled();
  });

  it('restores orders for the selected point from cache while offline', () => {
    const firstPointOrder = { id: 10, addr: 'Первая точка' } as any;
    const secondPointOrder = { id: 20, addr: 'Вторая точка' } as any;
    mocks.isOnline = false;
    useOrdersStore.setState({
      orders: [firstPointOrder],
      sourceOrders: [firstPointOrder],
      ordersByContext: {
        '12:1': [firstPointOrder],
        '13:1': [secondPointOrder],
      },
      showOrders: [firstPointOrder],
      isOpenOrderMap: true,
    });

    mocks.pointId = 13;
    useOrdersStore.getState().switchPoint(13);

    expect(useOrdersStore.getState().orders).toEqual([secondPointOrder]);
    expect(useOrdersStore.getState().showOrders).toEqual([]);
    expect(useOrdersStore.getState().isOpenOrderMap).toBe(false);
    expect(mocks.fetchOrders).not.toHaveBeenCalled();
  });

  it('resets the status selection before showing another point from cache', () => {
    const queued = { id: 21, status: 'В очереди' } as any;
    const assembly = { id: 22, status: 'Готов на кухне' } as any;
    mocks.isOnline = false;
    mocks.pointId = 13;
    useOrdersStore.setState({
      types_dop: ORDER_STATUS_TYPES,
      type_dop: ['3'],
      is_showModalTypeDop: true,
      ordersByContext: { '13:1': [queued, assembly] },
    });

    useOrdersStore.getState().switchPoint(13);

    expect(useOrdersStore.getState().type_dop).toEqual(['1', '2', '4', '3']);
    expect(useOrdersStore.getState().orders).toEqual([queued, assembly]);
    expect(useOrdersStore.getState().is_showModalTypeDop).toBe(false);
    expect(mocks.fetchOrders).not.toHaveBeenCalled();
  });

  it.each([true, false])('filters active orders locally with online=%s', (isOnline) => {
    const queued = { id: 1, status: 'В очереди' } as any;
    const collected = { id: 2, status: 'Собран' } as any;
    mocks.isOnline = isOnline;
    useOrdersStore.setState({
      type: { id: 1, text: 'Активные' },
      types_dop: [
        { id: 1, text: 'В очереди' },
        { id: 2, text: 'Готовится' },
        { id: 3, text: 'Собран' },
      ],
      type_dop: ['1', '2', '3'],
      orders: [queued, collected],
      sourceOrders: [queued, collected],
    });

    useOrdersStore.getState().setTypeDop(['3']);

    expect(useOrdersStore.getState().orders).toEqual([collected]);
    expect(useOrdersStore.getState().type_dop).toEqual(['3']);
    expect(mocks.fetchOrders).not.toHaveBeenCalled();

    useOrdersStore.getState().setTypeDop([]);

    expect(useOrdersStore.getState().orders).toEqual([queued, collected]);
    expect(useOrdersStore.getState().type_dop).toEqual(['1', '2', '3']);
    expect(mocks.fetchOrders).not.toHaveBeenCalled();
  });

  it('filters the new assembly option separately and restores all four after the last deselection', () => {
    const queued = { id: 1, status: 'В очереди' } as any;
    const kitchenReady = { id: 2, status: 'Готов на кухне' } as any;
    const collected = { id: 3, status: 'Собран' } as any;
    useOrdersStore.setState({
      types_dop: ORDER_STATUS_TYPES,
      typeToStatus: TYPE_STATUS_MAP,
      orders: [queued, kitchenReady, collected],
      sourceOrders: [queued, kitchenReady, collected],
    });

    useOrdersStore.getState().setTypeDop(['4']);
    expect(useOrdersStore.getState().orders).toEqual([kitchenReady]);

    useOrdersStore.getState().setTypeDop([]);
    expect(useOrdersStore.getState().type_dop).toEqual(['1', '2', '4', '3']);
    expect(useOrdersStore.getState().orders).toEqual([queued, kitchenReady, collected]);

    useOrdersStore.getState().setTypeDop(['1', '2', '3']);
    expect(useOrdersStore.getState().orders).toEqual([queued, collected]);
    expect(mocks.fetchOrders).not.toHaveBeenCalled();
  });

  it('applies the latest status selection when an existing request finishes', async () => {
    vi.useFakeTimers();
    try {
      const queued = { id: 1, status: 'В очереди' } as any;
      const collected = { id: 2, status: 'Собран' } as any;
      const updatedCollected = { ...collected, comment: 'Обновлённый заказ' };
      useOrdersStore.setState({ orders: [queued, collected], sourceOrders: [queued, collected] });
      let resolveResponse!: (value: { st: boolean; orders: unknown[] }) => void;
      mocks.fetchOrders.mockReturnValueOnce(
        new Promise<{ st: boolean; orders: unknown[] }>((resolve) => {
          resolveResponse = resolve;
        })
      );

      const request = useOrdersStore.getState().getOrders();
      useOrdersStore.getState().setTypeDop(['1']);
      useOrdersStore.getState().setTypeDop(['3']);

      expect(useOrdersStore.getState().orders).toEqual([collected]);
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(1);

      resolveResponse({ st: true, orders: [queued, updatedCollected] });
      await request;

      expect(useOrdersStore.getState().orders).toEqual([updatedCollected]);
      expect(useOrdersStore.getState().sourceOrders).toEqual([queued, updatedCollected]);
      expect(useOrdersStore.getState().type_dop).toEqual(['3']);
      await vi.advanceTimersByTimeAsync(300);
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(1);
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it('does not let a slower response from the previous point replace current orders', async () => {
    let resolveFirst: (value: { st: boolean; orders: unknown[] }) => void = () => undefined;
    let resolveSecond: (value: { st: boolean; orders: unknown[] }) => void = () => undefined;
    const firstResponse = new Promise<{ st: boolean; orders: unknown[] }>((resolve) => {
      resolveFirst = resolve;
    });
    const secondResponse = new Promise<{ st: boolean; orders: unknown[] }>((resolve) => {
      resolveSecond = resolve;
    });

    mocks.fetchOrders.mockImplementation(({ point_id }: { point_id?: number }) =>
      point_id === 13 ? secondResponse : firstResponse
    );

    const firstRequest = useOrdersStore.getState().getOrders();
    mocks.pointId = 13;
    useOrdersStore.getState().switchPoint(13);

    resolveSecond({ st: true, orders: [{ id: 200, addr: 'Текущая точка' }] });
    await vi.waitFor(() => {
      expect(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([200]);
    });

    resolveFirst({ st: true, orders: [{ id: 100, addr: 'Старая точка' }] });
    await firstRequest;

    expect(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([200]);
    expect(useOrdersStore.getState().ordersByContext['12:1']?.[0]?.id).toBe(100);
    expect(useOrdersStore.getState().ordersByContext['13:1']?.[0]?.id).toBe(200);
  });

  describe('queued manual refresh', () => {
    type Response = { st: boolean; orders: { id: number; status?: string }[] };

    function deferredResponse() {
      let resolve!: (value: Response) => void;
      let reject!: (reason: Error) => void;
      const promise = new Promise<Response>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
      });
      return { promise, resolve, reject };
    }

    async function repeatRefresh(times = 20) {
      for (let index = 0; index < times; index += 1) {
        await useOrdersStore.getState().getOrders(true);
      }
    }

    beforeEach(() => {
      vi.useFakeTimers();
      useOrdersStore.setState({
        types_dop: ORDER_STATUS_TYPES,
        typeToStatus: TYPE_STATUS_MAP,
        type_dop: ['3'],
        orders: [{ id: 10, status: 'Собран' } as any],
        sourceOrders: [{ id: 10, status: 'Собран' } as any],
      });
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('coalesces twenty clicks into one follow-up and preserves the current filter and cache', async () => {
      const first = deferredResponse();
      const second = deferredResponse();
      mocks.fetchOrders.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
      const request = useOrdersStore.getState().getOrders(true);

      await repeatRefresh();

      expect(mocks.fetchOrders).toHaveBeenCalledTimes(1);
      expect(useOrdersStore.getState()).toMatchObject({
        is_check: true,
        is_load: true,
        ordersRefreshPending: true,
        type_dop: ['3'],
      });
      first.resolve({
        st: true,
        orders: [
          { id: 11, status: 'В очереди' },
          { id: 12, status: 'Собран' },
        ],
      });
      await request;
      await vi.advanceTimersByTimeAsync(299);
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1);
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(2);
      expect(mocks.fetchOrders).toHaveBeenNthCalledWith(2, { point_id: 12, type_orders: 1 });
      expect(useOrdersStore.getState()).toMatchObject({
        is_check: true,
        ordersRefreshPending: false,
        type_dop: ['3'],
        type: { id: 1 },
      });

      second.resolve({
        st: true,
        orders: [
          { id: 21, status: 'Готов на кухне' },
          { id: 22, status: 'Собран' },
        ],
      });
      await vi.advanceTimersByTimeAsync(300);
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(2);
      expect(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([22]);
      expect(useOrdersStore.getState().sourceOrders.map((order) => order.id)).toEqual([21, 22]);
      expect(useOrdersStore.getState().ordersByContext['12:1'].map((order) => order.id)).toEqual([
        21, 22,
      ]);
      expect(useOrdersStore.getState()).toMatchObject({
        is_check: false,
        is_load: false,
        ordersRefreshPending: false,
      });
    });

    it('also coalesces clicks received during the completion delay', async () => {
      const second = deferredResponse();
      mocks.fetchOrders
        .mockResolvedValueOnce({ st: true, orders: [] })
        .mockReturnValueOnce(second.promise);
      await useOrdersStore.getState().getOrders(true);

      await repeatRefresh();
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(300);
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(2);
      second.resolve({ st: true, orders: [] });
      await vi.advanceTimersByTimeAsync(300);
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(2);
      expect(useOrdersStore.getState()).toMatchObject({
        is_check: false,
        is_load: false,
        ordersRefreshPending: false,
      });
    });

    it('runs the queued refresh after a server error without dropping cached orders', async () => {
      const first = deferredResponse();
      const second = deferredResponse();
      mocks.fetchOrders.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
      const request = useOrdersStore.getState().getOrders(true);
      await repeatRefresh();
      first.reject(new Error('Internal Server Error'));
      await request;

      expect(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([10]);
      expect(useOrdersStore.getState().showErrOrder).toBe(true);
      expect(mocks.isOnline).toBe(true);
      await vi.advanceTimersByTimeAsync(300);
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(2);
      second.resolve({ st: true, orders: [{ id: 30, status: 'Собран' }] });
      await vi.advanceTimersByTimeAsync(300);
      expect(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([30]);
      expect(useOrdersStore.getState()).toMatchObject({
        is_check: false,
        is_load: false,
        ordersRefreshPending: false,
      });
    });

    it('does not replay the queue after a network failure and clears loading flags', async () => {
      const first = deferredResponse();
      mocks.fetchOrders.mockReturnValueOnce(first.promise);
      const request = useOrdersStore.getState().getOrders(true);
      await repeatRefresh();
      first.reject(Object.assign(new Error('Network Error'), { code: 'ERR_NETWORK' }));
      await request;
      await vi.advanceTimersByTimeAsync(300);

      expect(mocks.fetchOrders).toHaveBeenCalledTimes(1);
      expect(mocks.probeConnectivity).toHaveBeenCalledTimes(1);
      expect(mocks.isOnline).toBe(false);
      expect(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([10]);
      expect(useOrdersStore.getState().showErrOrder).toBe(false);
      expect(useOrdersStore.getState()).toMatchObject({
        is_check: false,
        is_load: false,
        ordersRefreshPending: false,
      });
    });

    it('does not send a queued request when connectivity disappears before completion', async () => {
      const first = deferredResponse();
      mocks.fetchOrders.mockReturnValueOnce(first.promise);
      const request = useOrdersStore.getState().getOrders(true);
      await repeatRefresh();
      mocks.isOnline = false;
      first.resolve({ st: true, orders: [{ id: 31, status: 'Собран' }] });
      await request;
      await vi.advanceTimersByTimeAsync(300);

      expect(mocks.fetchOrders).toHaveBeenCalledTimes(1);
      expect(mocks.probeConnectivity).toHaveBeenCalledTimes(1);
      expect(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([31]);
      expect(useOrdersStore.getState()).toMatchObject({
        is_check: false,
        is_load: false,
        ordersRefreshPending: false,
      });
    });

    it('discards the previous category queue and does not clear loading for the new category', async () => {
      const first = deferredResponse();
      const second = deferredResponse();
      mocks.fetchOrders.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
      const request = useOrdersStore.getState().getOrders(true);
      await repeatRefresh();
      useOrdersStore.getState().setType({ id: 5, text: 'У других курьеров' });
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(2);
      expect(useOrdersStore.getState().ordersRefreshPending).toBe(false);

      first.resolve({ st: true, orders: [{ id: 40, status: 'Собран' }] });
      await request;
      await vi.advanceTimersByTimeAsync(300);
      expect(useOrdersStore.getState().is_check).toBe(true);
      expect(useOrdersStore.getState().orders).toEqual([]);
      expect(useOrdersStore.getState().ordersByContext['12:1'].map((order) => order.id)).toEqual([
        40,
      ]);

      second.resolve({ st: true, orders: [{ id: 50, status: 'В пути' }] });
      await vi.advanceTimersByTimeAsync(300);
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(2);
      expect(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([50]);
      expect(useOrdersStore.getState().ordersByContext['12:5'].map((order) => order.id)).toEqual([
        50,
      ]);
      expect(useOrdersStore.getState()).toMatchObject({
        type_dop: ['3'],
        type: { id: 5 },
        is_check: false,
        is_load: false,
        ordersRefreshPending: false,
      });
    });

    it('discards the previous cafe queue and keeps each response in its own context', async () => {
      const first = deferredResponse();
      const second = deferredResponse();
      mocks.fetchOrders.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
      const request = useOrdersStore.getState().getOrders(true);
      await repeatRefresh();
      mocks.pointId = 13;
      useOrdersStore.getState().switchPoint(13);
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(2);
      expect(mocks.fetchOrders).toHaveBeenLastCalledWith({ point_id: 13, type_orders: 1 });

      second.resolve({ st: true, orders: [{ id: 60, status: 'Готов на кухне' }] });
      await vi.advanceTimersByTimeAsync(300);
      expect(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([60]);
      first.resolve({ st: true, orders: [{ id: 61, status: 'Собран' }] });
      await request;
      await vi.advanceTimersByTimeAsync(300);

      expect(mocks.fetchOrders).toHaveBeenCalledTimes(2);
      expect(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([60]);
      expect(useOrdersStore.getState().ordersByContext['12:1'].map((order) => order.id)).toEqual([
        61,
      ]);
      expect(useOrdersStore.getState().ordersByContext['13:1'].map((order) => order.id)).toEqual([
        60,
      ]);
      expect(useOrdersStore.getState()).toMatchObject({
        type_dop: ['1', '2', '4', '3'],
        is_check: false,
        is_load: false,
        ordersRefreshPending: false,
      });
    });

    it('does not clear the spinner belonging to an order action', async () => {
      mocks.fetchOrders.mockResolvedValueOnce({ st: true, orders: [] });
      await useOrdersStore.getState().getOrders(true);
      useOrdersStore.setState({ isClick: true, is_load: true });
      await vi.advanceTimersByTimeAsync(300);

      expect(useOrdersStore.getState()).toMatchObject({
        isClick: true,
        is_load: true,
        is_check: false,
        ordersRefreshPending: false,
      });
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(1);
    });

    it('keeps the newer response after returning to the same cafe before its old response finishes', async () => {
      const oldCafe = deferredResponse();
      const otherCafe = deferredResponse();
      const newCafe = deferredResponse();
      mocks.fetchOrders
        .mockReturnValueOnce(oldCafe.promise)
        .mockReturnValueOnce(otherCafe.promise)
        .mockReturnValueOnce(newCafe.promise);
      const oldRequest = useOrdersStore.getState().getOrders(true);
      mocks.pointId = 13;
      useOrdersStore.getState().switchPoint(13);
      mocks.pointId = 12;
      useOrdersStore.getState().switchPoint(12);

      otherCafe.resolve({ st: true, orders: [{ id: 20, status: 'Собран' }] });
      newCafe.resolve({ st: true, orders: [{ id: 30, status: 'Собран' }] });
      await vi.advanceTimersByTimeAsync(0);
      expect(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([30]);
      const persistedCount = vi.mocked(writeOfflineCache).mock.calls.length;
      oldCafe.resolve({ st: true, orders: [{ id: 10, status: 'Собран' }] });
      await oldRequest;

      expect(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([30]);
      expect(useOrdersStore.getState().ordersByContext['12:1'].map((order) => order.id)).toEqual([
        30,
      ]);
      expect(useOrdersStore.getState().ordersByContext['13:1'].map((order) => order.id)).toEqual([
        20,
      ]);
      expect(writeOfflineCache).toHaveBeenCalledTimes(persistedCount);
      await vi.advanceTimersByTimeAsync(300);
      expect(useOrdersStore.getState()).toMatchObject({ is_check: false, is_load: false });
    });

    it.each(['server', 'network'])(
      'ignores the old %s error after a newer request succeeds in the same category',
      async (kind) => {
        const oldCategory = deferredResponse();
        const otherCategory = deferredResponse();
        const newCategory = deferredResponse();
        mocks.fetchOrders
          .mockReturnValueOnce(oldCategory.promise)
          .mockReturnValueOnce(otherCategory.promise)
          .mockReturnValueOnce(newCategory.promise);
        const oldRequest = useOrdersStore.getState().getOrders(true);
        useOrdersStore.getState().setType({ id: 5, text: 'У других курьеров' });
        useOrdersStore.getState().setType({ id: 1, text: 'Активные' });
        otherCategory.resolve({ st: true, orders: [{ id: 20, status: 'Собран' }] });
        newCategory.resolve({ st: true, orders: [{ id: 30, status: 'Собран' }] });
        await vi.advanceTimersByTimeAsync(0);
        oldCategory.reject(
          Object.assign(
            new Error('Old response error'),
            kind === 'network' ? { code: 'ERR_NETWORK' } : {}
          )
        );
        await oldRequest;
        await vi.advanceTimersByTimeAsync(300);

        expect(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([30]);
        expect(useOrdersStore.getState().showErrOrder).toBe(false);
        expect(mocks.isOnline).toBe(true);
        expect(useOrdersStore.getState()).toMatchObject({ is_check: false, is_load: false });
      }
    );

    it.each(['success', 'network'])(
      'does not apply an old session %s or replay its refresh queue',
      async (outcome) => {
        mocks.token = 'owner-one';
        const first = deferredResponse();
        mocks.fetchOrders.mockReturnValueOnce(first.promise);
        const request = useOrdersStore.getState().getOrders(true);
        await repeatRefresh();
        useOrdersStore.setState({ orders: [], sourceOrders: [], ordersByContext: {} });
        mocks.token = null;
        const persistedCount = vi.mocked(writeOfflineCache).mock.calls.length;
        if (outcome === 'success')
          first.resolve({ st: true, orders: [{ id: 99, status: 'Собран' }] });
        else first.reject(Object.assign(new Error('Old network error'), { code: 'ERR_NETWORK' }));
        await request;
        await vi.advanceTimersByTimeAsync(300);

        expect(mocks.fetchOrders).toHaveBeenCalledTimes(1);
        expect(useOrdersStore.getState()).toMatchObject({
          orders: [],
          sourceOrders: [],
          ordersByContext: {},
          is_check: false,
          is_load: false,
          ordersRefreshPending: false,
          showErrOrder: false,
        });
        expect(writeOfflineCache).toHaveBeenCalledTimes(persistedCount);
        expect(mocks.isOnline).toBe(true);
      }
    );

    it('starts the new session request without joining the previous session queue', async () => {
      mocks.token = 'owner-one';
      const oldOwner = deferredResponse();
      const newOwner = deferredResponse();
      mocks.fetchOrders.mockReturnValueOnce(oldOwner.promise).mockReturnValueOnce(newOwner.promise);
      const oldRequest = useOrdersStore.getState().getOrders(true);
      mocks.token = 'owner-two';
      const newRequest = useOrdersStore.getState().getOrders(true);
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(2);
      newOwner.resolve({ st: true, orders: [{ id: 200, status: 'Собран' }] });
      await newRequest;
      oldOwner.resolve({ st: true, orders: [{ id: 100, status: 'Собран' }] });
      await oldRequest;
      await vi.advanceTimersByTimeAsync(300);

      expect(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([200]);
      expect(useOrdersStore.getState().ordersByContext['12:1'].map((order) => order.id)).toEqual([
        200,
      ]);
      expect(useOrdersStore.getState()).toMatchObject({ is_check: false, is_load: false });
    });

    it('does not let an older warmup overwrite a newer active response for the same category', async () => {
      mocks.pointId = 201;
      useOrdersStore.setState({
        types: [
          { id: 1, text: 'Активные' },
          { id: 5, text: 'У других курьеров' },
        ],
      });
      const warmup = deferredResponse();
      const active = deferredResponse();
      mocks.fetchOrders
        .mockResolvedValueOnce({ st: true, orders: [{ id: 10, status: 'Собран' }] })
        .mockReturnValueOnce(warmup.promise)
        .mockReturnValueOnce(active.promise);
      await useOrdersStore.getState().getOrders(false);
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(2);
      useOrdersStore.getState().setType({ id: 5, text: 'У других курьеров' });
      active.resolve({ st: true, orders: [{ id: 50, status: 'В пути' }] });
      await vi.advanceTimersByTimeAsync(0);
      warmup.resolve({ st: true, orders: [{ id: 51, status: 'В пути' }] });
      await vi.advanceTimersByTimeAsync(300);

      expect(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([50]);
      expect(useOrdersStore.getState().ordersByContext['201:5'].map((order) => order.id)).toEqual([
        50,
      ]);
    });

    it('does not let an older active response overwrite a newer warmup for an inactive category', async () => {
      mocks.pointId = 202;
      useOrdersStore.setState({
        type: { id: 5, text: 'У других курьеров' },
        types: [
          { id: 1, text: 'Активные' },
          { id: 5, text: 'У других курьеров' },
        ],
      });
      const oldActive = deferredResponse();
      const warmup = deferredResponse();
      mocks.fetchOrders
        .mockReturnValueOnce(oldActive.promise)
        .mockResolvedValueOnce({ st: true, orders: [{ id: 10, status: 'Собран' }] })
        .mockReturnValueOnce(warmup.promise);
      const oldRequest = useOrdersStore.getState().getOrders(false);
      useOrdersStore.getState().setType({ id: 1, text: 'Активные' });
      await vi.advanceTimersByTimeAsync(0);
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(3);
      warmup.resolve({ st: true, orders: [{ id: 50, status: 'В пути' }] });
      await vi.advanceTimersByTimeAsync(0);
      oldActive.resolve({ st: true, orders: [{ id: 51, status: 'В пути' }] });
      await oldRequest;
      await vi.advanceTimersByTimeAsync(300);

      expect(useOrdersStore.getState().ordersByContext['202:5'].map((order) => order.id)).toEqual([
        50,
      ]);
      expect(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([10]);
    });

    it('does not warm a category that now has an active pending request', async () => {
      mocks.pointId = 203;
      useOrdersStore.setState({
        types: [
          { id: 1, text: 'Активные' },
          { id: 5, text: 'У других курьеров' },
        ],
      });
      const previous = deferredResponse();
      const active = deferredResponse();
      mocks.fetchOrders.mockReturnValueOnce(previous.promise).mockReturnValueOnce(active.promise);
      const previousRequest = useOrdersStore.getState().getOrders(false);
      useOrdersStore.getState().setType({ id: 5, text: 'У других курьеров' });
      previous.resolve({ st: true, orders: [{ id: 10, status: 'Собран' }] });
      await previousRequest;
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(2);
      active.resolve({ st: true, orders: [{ id: 50, status: 'В пути' }] });
      await vi.advanceTimersByTimeAsync(300);
      expect(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([50]);
    });

    it('does not restore the previous session cache when its warmup finishes after logout', async () => {
      mocks.pointId = 204;
      mocks.token = 'owner-one';
      useOrdersStore.setState({
        types: [
          { id: 1, text: 'Активные' },
          { id: 5, text: 'У других курьеров' },
        ],
      });
      const warmup = deferredResponse();
      mocks.fetchOrders
        .mockResolvedValueOnce({ st: true, orders: [{ id: 10, status: 'Собран' }] })
        .mockReturnValueOnce(warmup.promise);
      await useOrdersStore.getState().getOrders(false);
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(2);
      mocks.token = null;
      useOrdersStore.setState({ orders: [], sourceOrders: [], ordersByContext: {} });
      const persistedCount = vi.mocked(writeOfflineCache).mock.calls.length;

      warmup.resolve({ st: true, orders: [{ id: 50, status: 'В пути' }] });
      await vi.advanceTimersByTimeAsync(300);

      expect(useOrdersStore.getState()).toMatchObject({
        orders: [],
        sourceOrders: [],
        ordersByContext: {},
        is_check: false,
        is_load: false,
      });
      expect(writeOfflineCache).toHaveBeenCalledTimes(persistedCount);
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(2);
    });
  });

  it('refreshes every cached order tab after loading a selected point', async () => {
    const pointId = 99;
    const staleOtherOrder = { id: 5, addr: 'Старый заказ другого курьера' } as any;
    mocks.pointId = pointId;
    useOrdersStore.setState({
      type: { id: 1, text: 'Активные' },
      types: [
        { id: 1, text: 'Активные' },
        { id: 2, text: 'Мои отмеченные' },
        { id: 5, text: 'У других курьеров' },
      ],
      ordersByContext: {
        [`${pointId}:5`]: [staleOtherOrder],
      },
    });
    mocks.fetchOrders.mockImplementation(({ type_orders }: { type_orders?: number }) =>
      Promise.resolve({
        st: true,
        orders: [{ id: Number(type_orders) * 100, addr: `Категория ${type_orders}` }],
      })
    );

    await useOrdersStore.getState().getOrders(false);

    await vi.waitFor(() => {
      expect(useOrdersStore.getState().ordersByContext[`${pointId}:2`]?.[0]?.id).toBe(200);
      expect(useOrdersStore.getState().ordersByContext[`${pointId}:5`]?.[0]?.id).toBe(500);
    });

    expect(mocks.fetchOrders).toHaveBeenCalledWith({ point_id: pointId, type_orders: 2 });
    expect(mocks.fetchOrders).toHaveBeenCalledWith({ point_id: pointId, type_orders: 5 });
  });

  it('refreshes «У других» again before switching offline', async () => {
    const pointId = 101;
    let now = 100_000;
    let otherOrderId = 501;
    const nowSpy = vi.spyOn(Date, 'now').mockImplementation(() => now);
    mocks.pointId = pointId;
    useOrdersStore.setState({
      type: { id: 1, text: 'Активные' },
      types: [
        { id: 1, text: 'Активные' },
        { id: 5, text: 'У других курьеров' },
      ],
      ordersByContext: { [`${pointId}:5`]: [{ id: 500 } as any] },
    });
    mocks.fetchOrders.mockImplementation(({ type_orders }: { type_orders?: number }) =>
      Promise.resolve({
        st: true,
        orders: [{ id: type_orders === 5 ? otherOrderId : 100 }],
      })
    );

    try {
      await useOrdersStore.getState().getOrders(false);
      await vi.waitFor(() => {
        expect(useOrdersStore.getState().ordersByContext[`${pointId}:5`]?.[0]?.id).toBe(501);
        expect(useOrdersStore.getState().is_check).toBe(false);
      });

      now += 46_000;
      otherOrderId = 502;
      await useOrdersStore.getState().getOrders(false);
      await vi.waitFor(() => {
        expect(useOrdersStore.getState().ordersByContext[`${pointId}:5`]?.[0]?.id).toBe(502);
      });

      mocks.isOnline = false;
      useOrdersStore.getState().setType({ id: 5, text: 'У других курьеров' });
      expect(useOrdersStore.getState().orders[0]?.id).toBe(502);
      expect(mocks.fetchOrders).toHaveBeenCalledTimes(4);
    } finally {
      nowSpy.mockRestore();
    }
  });
});
