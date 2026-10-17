import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrdersStore } from '@/entities/order/model/order.store';
import { ORDER_STATUS_TYPES, TYPE_STATUS_MAP } from '@/entities/order/model/order.types';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { clearAuthToken, getAuthToken, setAuthToken } from '@/shared/api/token';
import { readOfflineCache } from '@/shared/lib/offline/cache';

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  fetchMe: vi.fn(),
  pointId: 12,
}));

vi.mock('@/shared/api/connector', () => ({
  connector: { rest: { post: mocks.post } },
}));
vi.mock('@/entities/settings', () => ({
  useSettingsStore: { getState: () => ({ pointId: mocks.pointId }) },
}));
vi.mock('@/features/auth/api/auth.api', () => ({
  fetchMe: mocks.fetchMe,
  loginToken: vi.fn(),
  sendPasswordRecoveryCode: vi.fn(),
  confirmPasswordRecoveryCode: vi.fn(),
}));
vi.mock('@/features/offline/model/connectivity.store', () => ({
  isAppOnline: () => true,
  markAppOffline: vi.fn(),
  useConnectivityStore: { getState: () => ({ probeConnectivity: vi.fn() }) },
}));
vi.mock('@/components/analytics', () => ({ log: vi.fn() }));
vi.mock('@/shared/lib/devLog', () => ({ devLog: vi.fn() }));
vi.mock('@/shared/lib/geolocation', () => ({
  readDriverPosition: vi.fn(),
  describeGeolocationError: vi.fn(),
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  localStorage.clear();
  clearAuthToken();
  mocks.pointId = 12;
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      throw new Error('Network forbidden in diagnostic tests');
    })
  );
  useOrdersStore.setState({
    orders: [],
    sourceOrders: [],
    ordersByContext: {},
    type: { id: 1, text: 'Активные' },
    types: [],
    types_dop: ORDER_STATUS_TYPES,
    type_dop: ['1', '2', '4', '3'],
    typeToStatus: TYPE_STATUS_MAP,
    is_check: false,
    is_load: false,
    isClick: false,
    ordersRefreshPending: false,
  });
  useAuthStore.setState({
    isSubmitting: false,
    isSessionRefreshing: false,
    session: { isAuth: true, token: 'owner-a-token', user: { user_id: 1, login: 'owner-a' } },
  });
  setAuthToken('owner-a-token');
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  clearAuthToken();
  localStorage.clear();
});

describe('session and order request races', () => {
  it('does not let the old A response replace the newer A after switching A -> B -> A', async () => {
    type Response = { st: boolean; orders: { id: number; status: string }[] };
    const oldA = deferred<Response>();
    const cafeB = deferred<Response>();
    const newA = deferred<Response>();
    mocks.post
      .mockReturnValueOnce(oldA.promise)
      .mockReturnValueOnce(cafeB.promise)
      .mockReturnValueOnce(newA.promise);

    const oldRequest = useOrdersStore.getState().getOrders(true);
    mocks.pointId = 13;
    useOrdersStore.getState().switchPoint(13);
    mocks.pointId = 12;
    useOrdersStore.getState().switchPoint(12);
    expect(mocks.post).toHaveBeenCalledTimes(3);
    expect(mocks.post.mock.calls.map((call) => call[1].point_id)).toEqual([12, 13, 12]);

    cafeB.resolve({ st: true, orders: [{ id: 200, status: 'Собран' }] });
    newA.resolve({ st: true, orders: [{ id: 300, status: 'Собран' }] });
    await vi.advanceTimersByTimeAsync(0);
    expect(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([300]);
    expect(readOfflineCache()?.orders?.orders.map((order) => order.id)).toEqual([300]);

    oldA.resolve({ st: true, orders: [{ id: 100, status: 'Собран' }] });
    await oldRequest;
    expect.soft(useOrdersStore.getState().orders.map((order) => order.id)).toEqual([300]);
    expect
      .soft(useOrdersStore.getState().ordersByContext['12:1'].map((order) => order.id))
      .toEqual([300]);
    expect.soft(readOfflineCache()?.orders?.orders.map((order) => order.id)).toEqual([300]);
    await vi.advanceTimersByTimeAsync(300);
  });

  it('does not authenticate again when a pending refresh resolves after explicit logout', async () => {
    const response = deferred<{ user_id: number; login: string }>();
    mocks.fetchMe.mockReturnValueOnce(response.promise);
    const pending = useAuthStore.getState().refreshSession();
    expect(mocks.fetchMe).toHaveBeenCalledTimes(1);
    useAuthStore.getState().setUnauthorized();
    expect(useAuthStore.getState().session.isAuth).toBe(false);
    expect(getAuthToken()).toBeNull();
    expect(localStorage.getItem('jaco_driver_explicit_unauthorized')).toBe('1');

    response.resolve({ user_id: 1, login: 'owner-a' });
    await pending;

    expect.soft(useAuthStore.getState().session.isAuth).toBe(false);
    expect.soft(useAuthStore.getState().session.user).toBeNull();
    expect.soft(getAuthToken()).toBeNull();
    expect.soft(localStorage.getItem('jaco_driver_explicit_unauthorized')).toBe('1');
  });

  it('does not clear a new owner token when the previous owner refresh rejects with 401', async () => {
    const response = deferred<{ user_id: number }>();
    mocks.fetchMe.mockReturnValueOnce(response.promise);
    const pending = useAuthStore.getState().refreshSession();
    setAuthToken('owner-b-token');
    useAuthStore
      .getState()
      .setAuthenticated({ user_id: 2, login: 'owner-b', token: 'owner-b-token' });
    expect(useAuthStore.getState().session.user?.user_id).toBe(2);

    response.reject({ response: { status: 401 } });
    await pending;

    expect.soft(getAuthToken()).toBe('owner-b-token');
    expect.soft(useAuthStore.getState().session).toMatchObject({
      isAuth: true,
      token: 'owner-b-token',
      user: { user_id: 2, login: 'owner-b' },
    });
  });
});
