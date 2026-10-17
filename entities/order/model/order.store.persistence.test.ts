import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  OFFLINE_CACHE_KEY,
  clearOfflineCache,
  readOfflineCache,
  writeOfflineCache,
  type OfflineOrdersSnapshot,
} from '@/shared/lib/offline/cache';
import { ORDER_STATUS_TYPES, type Order } from './order.types';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  fetchMe: vi.fn(),
  logoutWeb: vi.fn(),
  pointId: 12 as number | null,
  isOnline: false,
}));

vi.mock('@/shared/api/connector', () => ({
  connector: { rest: { post: mocks.request } },
}));
vi.mock('@/entities/settings', () => ({
  useSettingsStore: {
    getState: () => ({ pointId: mocks.pointId }),
    setState: vi.fn(),
  },
}));
vi.mock('@/features/header/model/header.store', () => ({
  useHeaderStore: {
    setState: vi.fn(),
    getState: () => ({ setAppTheme: vi.fn() }),
  },
}));
vi.mock('@/features/auth/api/auth.api', () => ({
  fetchMe: mocks.fetchMe,
  logoutWeb: mocks.logoutWeb,
  loginToken: vi.fn(),
  sendPasswordRecoveryCode: vi.fn(),
  confirmPasswordRecoveryCode: vi.fn(),
}));
vi.mock('@/features/offline/model/connectivity.store', () => ({
  isAppOnline: () => mocks.isOnline,
  markAppOffline: vi.fn(),
  useConnectivityStore: { getState: () => ({ probeConnectivity: vi.fn() }) },
}));
vi.mock('@/components/analytics', () => ({ log: vi.fn() }));
vi.mock('@/shared/lib/devLog', () => ({ devLog: vi.fn() }));
vi.mock('@/shared/lib/geolocation', () => ({
  readDriverPosition: vi.fn(),
  describeGeolocationError: vi.fn(),
}));

function order(id: number, status: string): Order {
  return { id, status, drink_list: [], pd: '', et: '', kv: '', comment: '' };
}

const sourceOrders = [
  order(1, 'В очереди'),
  order(2, 'Готовится'),
  order(4, 'Готов на кухне'),
  order(3, 'Собран'),
];

function snapshot(patch: Partial<OfflineOrdersSnapshot> = {}): OfflineOrdersSnapshot {
  return {
    orders: sourceOrders,
    sourceOrders,
    ordersByContext: { '12:1': sourceOrders },
    type: { id: 1, text: 'Активные' },
    type_dop: ['1', '2', '4', '3'],
    statusFilterVersion: 2,
    update_interval: 30,
    limit: '2',
    limit_count: '10',
    home: null,
    driver_pay: false,
    driver_need_gps: false,
    ...patch,
  };
}

async function reloadOrdersStore() {
  vi.resetModules();
  return (await import('./order.store')).useOrdersStore;
}

describe('orders store persistence with real browser storage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
    mocks.isOnline = false;
    mocks.pointId = 12;
    mocks.request.mockResolvedValue({ st: true, orders: [] });
    mocks.logoutWeb.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    localStorage.clear();
  });

  it.each([
    { selected: ['3'], visibleIds: [3] },
    { selected: ['1', '2'], visibleIds: [1, 2] },
    { selected: ['4'], visibleIds: [4] },
    { selected: ['1', '2', '3'], visibleIds: [1, 2, 3] },
  ])(
    'writes and restores the partial filter $selected after a full module reload',
    async ({ selected, visibleIds }) => {
      writeOfflineCache({ orders: snapshot() });
      const store = await reloadOrdersStore();
      store.getState().setTypeDop(selected);

      const written = JSON.parse(localStorage.getItem(OFFLINE_CACHE_KEY)!);
      expect(written.orders.type_dop).toEqual(selected);
      expect(written.orders.statusFilterVersion).toBe(2);
      expect(written.orders.orders.map((item: Order) => item.id)).toEqual(visibleIds);
      expect(written.orders.sourceOrders).toEqual(sourceOrders);
      expect(written.orders.ordersByContext['12:1']).toEqual(sourceOrders);

      const restored = await reloadOrdersStore();
      expect(restored).not.toBe(store);
      expect(restored.getState().type_dop).toEqual(selected);
      expect(restored.getState().orders.map((item) => item.id)).toEqual(visibleIds);
      expect(restored.getState().sourceOrders).toEqual(sourceOrders);
      expect(mocks.request).not.toHaveBeenCalled();
    }
  );

  it.each([undefined, 1])(
    'migrates legacy all-selected storage with filter version %s to four statuses',
    async (version) => {
      writeOfflineCache({
        orders: snapshot({ type_dop: ['3', '1', '2'], statusFilterVersion: version }),
      });
      const restored = await reloadOrdersStore();

      expect(restored.getState().type_dop).toEqual(['1', '2', '4', '3']);
      expect(restored.getState().orders).toEqual(sourceOrders);
      restored.getState().setUpdateInterval(45);
      expect(readOfflineCache()?.orders?.statusFilterVersion).toBe(2);
      expect(readOfflineCache()?.orders?.type_dop).toEqual(['1', '2', '4', '3']);
    }
  );

  it('restores missing legacy sourceOrders from the visible orders field', async () => {
    writeOfflineCache({ orders: snapshot({ orders: [sourceOrders[3]], type_dop: ['3'] }) });
    const saved = JSON.parse(localStorage.getItem(OFFLINE_CACHE_KEY)!);
    delete saved.orders.sourceOrders;
    localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(saved));

    const restored = await reloadOrdersStore();
    expect(restored.getState().orders).toEqual([sourceOrders[3]]);
    expect(restored.getState().sourceOrders).toEqual([sourceOrders[3]]);
    expect(restored.getState().type_dop).toEqual(['3']);
  });

  it('preserves the partial selection across categories without mixing their cached orders', async () => {
    const otherCouriers = [order(50, 'В пути')];
    writeOfflineCache({
      orders: snapshot({
        ordersByContext: {
          '12:1': sourceOrders,
          '12:5': otherCouriers,
          '13:5': [order(51, 'В пути')],
        },
      }),
    });
    const store = await reloadOrdersStore();
    store.getState().setTypeDop(['4']);
    store.getState().setType({ id: 5, text: 'У других курьеров' });

    const restored = await reloadOrdersStore();
    expect(restored.getState().type.id).toBe(5);
    expect(restored.getState().type_dop).toEqual(['4']);
    expect(restored.getState().orders).toEqual(otherCouriers);
    restored.getState().setType({ id: 1, text: 'Активные' });
    expect(restored.getState().orders).toEqual([sourceOrders[2]]);
    expect(restored.getState().sourceOrders).toEqual(sourceOrders);
    expect(mocks.request).not.toHaveBeenCalled();
  });

  it('uses only the selected cafe context and persists its reset selection', async () => {
    const nextCafeOrders = [order(13, 'Готов на кухне')];
    writeOfflineCache({
      orders: snapshot({
        ordersByContext: {
          '12:1': sourceOrders,
          '13:1': nextCafeOrders,
          'all:1': [order(99, 'Собран')],
        },
      }),
    });
    const store = await reloadOrdersStore();
    store.getState().setTypeDop(['3']);
    store.setState({
      is_showModalTypeDop: true,
      showOrders: [sourceOrders[3]],
      isOpenOrderMap: true,
    });
    mocks.pointId = 13;
    store.getState().switchPoint(13);

    expect(store.getState().orders).toEqual(nextCafeOrders);
    expect(store.getState().type_dop).toEqual(['1', '2', '4', '3']);
    expect(store.getState()).toMatchObject({
      is_showModalTypeDop: false,
      showOrders: [],
      isOpenOrderMap: false,
    });
    const restored = await reloadOrdersStore();
    expect(restored.getState().orders).toEqual(nextCafeOrders);
    expect(restored.getState().sourceOrders).toEqual(nextCafeOrders);
    expect(restored.getState().type_dop).toEqual(['1', '2', '4', '3']);
    expect(restored.getState().ordersByContext['12:1']).toEqual(sourceOrders);
    expect(mocks.request).not.toHaveBeenCalled();
  });

  it('does not substitute another cafe or the all-cafes context when the selected cafe has no cache', async () => {
    writeOfflineCache({
      orders: snapshot({
        ordersByContext: { '12:1': sourceOrders, 'all:1': [order(99, 'Собран')] },
      }),
    });
    const store = await reloadOrdersStore();
    store.getState().setTypeDop(['3']);
    mocks.pointId = 14;
    store.getState().switchPoint(14);

    expect(store.getState().orders).toEqual([]);
    expect(store.getState().sourceOrders).toEqual([]);
    const restored = await reloadOrdersStore();
    expect(restored.getState().orders).toEqual([]);
    expect(restored.getState().sourceOrders).toEqual([]);
    expect(mocks.request).not.toHaveBeenCalled();
  });

  it('does not lose settings or phones when persisting a new status selection', async () => {
    writeOfflineCache({
      orders: snapshot(),
      settings: { settings: { fontSize: 24 }, pointId: 12, points: [], cityId: '1' },
      phones: { phone_upr: '79000000000' },
    });
    const store = await reloadOrdersStore();
    store.getState().setTypeDop(['3']);

    expect(readOfflineCache()?.settings).toEqual({
      settings: { fontSize: 24 },
      pointId: 12,
      points: [],
      cityId: '1',
    });
    expect(readOfflineCache()?.phones).toEqual({ phone_upr: '79000000000' });
    expect(readOfflineCache()?.orders?.type_dop).toEqual(['3']);
  });

  it('clears the previous owner snapshot on an account change so a new store cannot restore it', async () => {
    writeOfflineCache({ orders: snapshot({ type_dop: ['3'] }) });
    const store = await reloadOrdersStore();
    const { useAuthStore } = await import('@/features/auth/model/auth.store');
    useAuthStore.setState({
      session: { isAuth: true, token: 'owner-one', user: { id: 1, login: 'one' } },
    });
    useAuthStore.getState().setAuthenticated({ id: 2, login: 'two', token: 'owner-two' });

    expect(readOfflineCache()).toBeNull();
    expect(store.getState().type_dop).toEqual(['1', '2', '4', '3']);
    const restored = await reloadOrdersStore();
    expect(restored.getState().orders).toEqual([]);
    expect(restored.getState().ordersByContext).toEqual({});
    expect(restored.getState().type_dop).toEqual(['1', '2', '4', '3']);
  });

  it('clears cached and live orders through the real logout workflow before another owner starts', async () => {
    writeOfflineCache({ orders: snapshot({ type_dop: ['3'] }) });
    const store = await reloadOrdersStore();
    const { logoutAndClearSession } = await import('@/features/auth/model/logoutSession');
    await logoutAndClearSession();

    expect(mocks.logoutWeb).toHaveBeenCalledTimes(1);
    expect(readOfflineCache()).toBeNull();
    expect(store.getState()).toMatchObject({
      orders: [],
      sourceOrders: [],
      ordersByContext: {},
      showOrders: [],
      token: '',
    });
    const restored = await reloadOrdersStore();
    expect(restored.getState().orders).toEqual([]);
    expect(restored.getState().type_dop).toEqual(['1', '2', '4', '3']);
  });

  it('starts empty after cache removal without contacting the API', async () => {
    writeOfflineCache({ orders: snapshot({ type_dop: ['3'] }) });
    clearOfflineCache();
    const restored = await reloadOrdersStore();
    expect(restored.getState().orders).toEqual([]);
    expect(restored.getState().ordersByContext).toEqual({});
    expect(restored.getState().types_dop).toEqual(ORDER_STATUS_TYPES);
    expect(mocks.request).not.toHaveBeenCalled();
  });
});
