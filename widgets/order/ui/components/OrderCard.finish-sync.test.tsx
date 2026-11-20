import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OrderCard } from './OrderCard';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { pendingFinishes, setFinishOwner } from '@/entities/order/model/pendingFinishes';
import type { Order } from '@/entities/order/model/order.types';
import { OFFLINE_CACHE_KEY, readOfflineCache } from '@/shared/lib/offline/cache';

const mocks = vi.hoisted(() => ({
  online: false,
  token: 'test-token',
  fetchOrders: vi.fn(),
  actionOrder: vi.fn(),
  success: vi.fn(),
  gps: vi.fn(),
}));
vi.mock('@/shared/api/token', () => ({ getAuthToken: () => mocks.token }));
vi.mock('@/entities/settings', () => {
  const state = { pointId: 10 };
  const useSettingsStore = Object.assign(
    (select: (value: typeof state) => unknown) => select(state),
    {
      getState: () => state,
    }
  );
  return { useSettingsStore };
});
vi.mock('@/features/offline/model/connectivity.store', () => ({
  isAppOnline: () => mocks.online,
  markAppOffline: vi.fn(),
  useConnectivityStore: { getState: () => ({ probeConnectivity: vi.fn() }) },
}));
vi.mock('@/components/analytics', () => ({ log: vi.fn(), logTel: vi.fn() }));
vi.mock('@/shared/lib/devLog', () => ({ devLog: vi.fn() }));
vi.mock('@/shared/lib/geolocation', () => ({
  readDriverPosition: mocks.gps,
  describeGeolocationError: () => ({ text: 'GPS', canContinue: false }),
}));
vi.mock('@/shared/lib/orderActionEvents', () => ({
  emitOrderTakeStarted: vi.fn(),
  emitSuccessfulOrderAction: mocks.success,
}));
vi.mock('@/entities/order/api/order.api', () => ({
  actionOrder: mocks.actionOrder,
  fetchOrders: mocks.fetchOrders,
  checkFakeOrder: vi.fn(),
  getPayQr: vi.fn(),
  hideDelOrders: vi.fn(),
  checkPayOrder: vi.fn(),
  normalizeOrdersResponse: (response: { orders?: Order[] }) => ({
    orders: response.orders ?? [],
    update_interval: 30,
    limit: '',
    limit_count: '',
    del_orders: [],
    driver_pay: false,
    driver_need_gps: false,
    home: null,
  }),
}));

const loadOrders = useOrdersStore.getState().getOrders;
const queueKey = 'jaco_driver_pending_finishes_v1';
const completion = {
  owner: '7',
  pointId: 10,
  orderId: 123,
  completedAt: '2026-11-20T12:40:00.000Z',
  latitude: '',
  longitude: '',
};
const order: Order = {
  id: 123,
  id_text: '#123 В пути',
  status_order: 5,
  is_my: 1,
  is_get: 1,
  is_delete: 0,
  online_pay: 0,
  driver_pay: 0,
  fake_dom: 1,
  drink_list: [],
  addr: 'Тест',
  pd: '',
  et: '',
  kv: '',
  comment: '',
  need_time: '16:00 - 17:00',
  sum_order: 100,
  sdacha: 0,
  number: '70000000000',
  count_other: 0,
  count_pizza: 0,
  count_pasta: 0,
  count_drink: 0,
};
function CurrentOrderCard() {
  const item = useOrdersStore((state) => state.orders[0]);
  return item ? <OrderCard item={item} globalFontSize={16} /> : null;
}

describe('accepted finish while the web order list is loading', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mocks.online = false;
    mocks.token = 'test-token';
    localStorage.removeItem(queueKey);
    localStorage.removeItem(OFFLINE_CACHE_KEY);
    setFinishOwner('7');
    await pendingFinishes.hydrate();
    mocks.actionOrder.mockResolvedValue({ st: true, text: 'ok' });
    useOrdersStore.setState({
      type: { id: 2, text: 'Мои отмеченные' },
      types: [],
      orders: [order],
      sourceOrders: [order],
      ordersByContext: { '10:2': [order], '10:1': [order], '20:2': [order] },
      showOrders: [order],
      is_check: false,
      isClick: false,
      is_load: false,
      ordersRefreshPending: false,
      modalConfirm: false,
      showErrOrder: false,
      driver_need_gps: false,
      getOrders: vi.fn(loadOrders),
    });
  });
  afterEach(() => {
    useOrdersStore.setState({ getOrders: loadOrders });
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.each(['delayed', 'failed', 'stale', 'cache failure'])(
    'keeps actions blocked with a %s list refresh',
    async (mode) => {
      let resolveList!: (value: { orders: Order[] }) => void;
      let rejectList!: (error: Error) => void;
      const response = new Promise<{ orders: Order[] }>((resolve, reject) => {
        resolveList = resolve;
        rejectList = reject;
      });
      mocks.fetchOrders.mockReturnValue(response);
      await pendingFinishes.put(completion);
      render(<CurrentOrderCard />);
      expect(screen.getByRole('status')).toHaveTextContent(
        'Завершение сохранено. Ожидает отправки.'
      );
      mocks.online = true;
      await act(async () => {
        await pendingFinishes.flush();
      });
      expect(screen.getByRole('status')).toHaveTextContent(
        'Завершение отправлено. Обновляем статус.'
      );
      for (const action of ['finish', 'cancel', 'fake']) {
        expect(screen.queryByTestId(`order-card-${action}`)).not.toBeInTheDocument();
      }
      const refresh = vi.mocked(useOrdersStore.getState().getOrders).mock.results[0]
        .value as Promise<void>;
      await act(async () => {
        useOrdersStore.getState().setActiveConfirm(true, 123, false, 'finish', false);
        await useOrdersStore.getState().actionFinishOrder(123);
        await pendingFinishes.flush();
      });
      expect(useOrdersStore.getState().modalConfirm).toBe(false);
      expect(mocks.actionOrder).toHaveBeenCalledTimes(1);
      expect(mocks.gps).not.toHaveBeenCalled();
      expect(mocks.success).toHaveBeenCalledTimes(1);

      if (mode === 'failed' || mode === 'stale') {
        await act(async () => {
          if (mode === 'failed') rejectList(new Error('list unavailable'));
          else resolveList({ orders: [order] });
          await refresh;
        });
        expect(pendingFinishes.find('7', 10, 123)?.acknowledged).toBe(true);
        expect(screen.getByRole('status')).toHaveTextContent(
          'Завершение отправлено. Обновляем статус.'
        );
        expect(screen.queryByTestId('order-card-finish')).not.toBeInTheDocument();
        return;
      }
      if (mode === 'cache failure') {
        const original = Storage.prototype.setItem;
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
          this: Storage,
          key: string,
          value: string
        ) {
          if (key === OFFLINE_CACHE_KEY) throw new Error('quota');
          return original.call(this, key, value);
        });
      }
      const completed = { ...order, status_order: 6, id_text: '#123 У клиента' };
      await act(async () => {
        resolveList({ orders: [completed] });
        await refresh;
      });
      expect(screen.getByText('#123 У клиента')).toBeInTheDocument();
      expect(useOrdersStore.getState().showOrders[0].status_order).toBe(6);
      expect(screen.queryByTestId('order-card-finish')).not.toBeInTheDocument();
      expect(pendingFinishes.find('7', 10, 123)?.acknowledged).toBe(
        mode === 'cache failure' ? true : undefined
      );
      if (mode === 'delayed') {
        expect(readOfflineCache()?.orders?.ordersByContext?.['10:2'][0].status_order).toBe(6);
        expect(readOfflineCache()?.orders?.ordersByContext?.['10:1'][0].status_order).toBe(6);
        expect(readOfflineCache()?.orders?.ordersByContext?.['20:2'][0].status_order).toBe(5);
      }
      expect(mocks.actionOrder).toHaveBeenCalledTimes(1);
    }
  );

  it.each(['foreground', 'background'])(
    'keeps the completed card after an older %s response arrives',
    async (requestKind) => {
      const completed = { ...order, status_order: 6, id_text: '#123 У клиента' };
      let releaseOldList!: (value: { orders: Order[] }) => void;
      const oldBackgroundResponse = new Promise<{ orders: Order[] }>((resolve) => {
        releaseOldList = resolve;
      });
      let foregroundRequests = 0;
      let backgroundStarted = false;
      mocks.fetchOrders.mockImplementation((request: { type_orders: number }) => {
        if (request.type_orders === 5) {
          backgroundStarted = true;
          // The server took this snapshot before completion; delivery is held by the test.
          return oldBackgroundResponse;
        }
        foregroundRequests += 1;
        return Promise.resolve({ orders: [foregroundRequests === 1 ? order : completed] });
      });
      useOrdersStore.setState({
        types:
          requestKind === 'background'
            ? [
                { id: 2, text: 'Мои отмеченные' },
                { id: 5, text: 'У других курьеров' },
              ]
            : [],
        ordersByContext: { '10:2': [order], '10:5': [order], '20:5': [order] },
      });
      mocks.online = true;
      await act(async () => {
        await useOrdersStore.getState().getOrders();
        await vi.advanceTimersByTimeAsync(300);
      });
      let olderForegroundRequest: Promise<void> | undefined;
      if (requestKind === 'foreground') {
        useOrdersStore.setState({ type: { id: 5, text: 'У других курьеров' } });
        olderForegroundRequest = useOrdersStore.getState().getOrders();
        useOrdersStore.setState({ type: { id: 2, text: 'Мои отмеченные' } });
      }
      expect(backgroundStarted).toBe(true);

      mocks.online = false;
      await pendingFinishes.put(completion);
      render(<CurrentOrderCard />);
      mocks.online = true;
      await act(async () => {
        await pendingFinishes.flush();
        const requests = vi.mocked(useOrdersStore.getState().getOrders).mock.results;
        await (requests[requests.length - 1].value as Promise<void>);
      });
      expect(foregroundRequests).toBe(2);
      expect(pendingFinishes.find('7', 10, 123)).toBeUndefined();
      expect(useOrdersStore.getState().ordersByContext['10:5'][0].status_order).toBe(6);

      // Release the old response only after status 6 was persisted and the guard removed.
      await act(async () => {
        releaseOldList({ orders: [order] });
        await oldBackgroundResponse;
        await olderForegroundRequest;
      });
      mocks.online = false;
      act(() => {
        useOrdersStore.getState().setType({ id: 5, text: 'У других курьеров' });
      });
      expect(mocks.actionOrder).toHaveBeenCalledTimes(1);
      expect(useOrdersStore.getState().orders[0].status_order).toBe(6);
      expect(useOrdersStore.getState().ordersByContext['20:5'][0].status_order).toBe(5);
      expect(readOfflineCache()?.orders?.ordersByContext?.['10:5'][0].status_order).toBe(6);
      expect(screen.queryByTestId('order-card-finish')).not.toBeInTheDocument();

      // Do not freeze the order forever: a request started later may report a new server state.
      mocks.fetchOrders.mockResolvedValue({ orders: [order] });
      mocks.online = true;
      await act(async () => {
        await useOrdersStore.getState().getOrders();
      });
      expect(useOrdersStore.getState().orders[0].status_order).toBe(5);
    }
  );
});
