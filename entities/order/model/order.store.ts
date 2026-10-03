import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import {
  Order,
  OrderType,
  HomeLocation,
  PayData,
  DelOrder,
  ORDER_TYPES,
  ORDER_STATUS_TYPES,
  TYPE_STATUS_MAP,
} from './order.types';
import { normalizeOrderRow, filterOrdersByTypes } from './order.utils';
import { getOrderMapLocationKey } from './orderMapGroups';
import { getApiErrorInfo } from '@/shared/api/errors';
import { getAuthToken } from '@/shared/api/token';
import { log } from '@/components/analytics';
import { devLog } from '@/shared/lib/devLog';
import { describeGeolocationError, readDriverPosition } from '@/shared/lib/geolocation';
import { useSettingsStore } from '@/entities/settings';
import {
  isAppOnline,
  markAppOffline,
  useConnectivityStore,
} from '@/features/offline/model/connectivity.store';
import { readOfflineCache, writeOfflineCache } from '@/shared/lib/offline/cache';
import { isConnectivityError } from '@/shared/lib/offline/isConnectivityError';
import { scheduleOfflineYandexMapSync } from '@/shared/lib/offline/yandexOfflineMap';
import {
  fetchOrders,
  actionOrder as apiActionOrder,
  checkFakeOrder as apiCheckFakeOrder,
  getPayQr as apiGetPayQr,
  hideDelOrders as apiHideDelOrders,
  checkPayOrder as apiCheckPayOrder,
  normalizeOrdersResponse,
} from '../api/order.api';

const cachedOrders = readOfflineCache()?.orders ?? null;

function getSelectedPointId(): number | null {
  return useSettingsStore.getState().pointId;
}

function getOrdersContextKey(typeId: number, pointId = getSelectedPointId()): string {
  return `${pointId ?? 'all'}:${typeId}`;
}

const initialOrdersByContext: Record<string, Order[]> = {
  ...(cachedOrders?.ordersByContext ?? {}),
};
let ordersWarmupPromise: Promise<void> | null = null;
let pendingOrdersWarmup: { pointId: number | null; activeTypeId: number } | null = null;
const inactiveOrdersSyncedAt = new Map<string, number>();
const INACTIVE_ORDERS_REFRESH_INTERVAL_MS = 45_000;
let activeOrdersRequestContextKey = '';
let ordersRequestSequence = 0;
let latestOrdersRequestId = 0;

if (cachedOrders && !initialOrdersByContext[getOrdersContextKey(cachedOrders.type.id)]) {
  initialOrdersByContext[getOrdersContextKey(cachedOrders.type.id)] = cachedOrders.sourceOrders;
}

function isApiOk(st: unknown): boolean {
  return st === true || st === 1 || st === '1';
}

function nestedApiStatus(res: { st?: unknown; text?: string; data?: unknown }): {
  st?: unknown;
  text?: string;
} {
  const nested = res.data;
  if (nested && typeof nested === 'object') {
    return nested as { st?: unknown; text?: string };
  }
  return res;
}

function formatOrderError(error: unknown): string {
  if (isConnectivityError(error) || !isAppOnline()) {
    return 'Нет интернета. Действие будет доступно после восстановления связи.';
  }

  const message = getApiErrorInfo(error).message.trim();

  return message || 'Не удалось выполнить запрос.';
}

function persistOrdersSnapshot(state: {
  orders: Order[];
  sourceOrders: Order[];
  ordersByContext: Record<string, Order[]>;
  type: OrderType;
  type_dop: string[];
  update_interval: number;
  limit: string;
  limit_count: string;
  home: HomeLocation | null;
  driver_pay: boolean;
  driver_need_gps: boolean;
}): void {
  writeOfflineCache({
    orders: {
      orders: state.orders,
      sourceOrders: state.sourceOrders,
      ordersByContext: state.ordersByContext,
      type: state.type,
      type_dop: state.type_dop,
      update_interval: state.update_interval,
      limit: state.limit,
      limit_count: state.limit_count,
      home: state.home,
      driver_pay: state.driver_pay,
      driver_need_gps: state.driver_need_gps,
    },
  });
}

function hasHomeMoved(current: HomeLocation | null, next: HomeLocation | null): boolean {
  if (!next) {
    return false;
  }

  if (!current) {
    return true;
  }

  return current.center[0] !== next.center[0] || current.center[1] !== next.center[1];
}

interface OrdersStore {
  // State
  orders: Order[];
  sourceOrders: Order[];
  ordersByContext: Record<string, Order[]>;
  isOpenMenu: boolean;
  update_interval: number;
  limit: string;
  limit_count: string;
  token: string;
  notifToken: string;
  type: OrderType;
  types: OrderType[];
  types_dop: OrderType[];
  type_dop: string[];
  is_showModalTypeDop: boolean;
  showErrOrder: boolean;
  textErrOrder: string;
  is_load: boolean;
  map: any | null;
  showOrders: Order[];
  isOpenOrderMap: boolean;
  del_orders: DelOrder[];
  showPay: boolean;
  payData: PayData | null;
  modalConfirm: boolean;
  is_map: boolean;
  order_finish_id: number | null;
  order_finish_is_delete: boolean | null;
  type_confirm: string | null;
  isClick: boolean;
  driver_pay: boolean;
  typeToStatus: Record<number, string>;
  is_check: boolean;
  ordersRefreshPending: boolean;
  location_driver: [number, number] | null;
  location_driver_time_text: string;
  home: HomeLocation | null;
  type_location: 'none' | 'location' | 'watch';
  id_watch: number | null;
  driver_need_gps: boolean;

  // Actions
  setShowPay: (active: boolean) => void;
  setActiveConfirm: (
    active: boolean,
    order_finish_id?: number | null,
    is_map?: boolean,
    type_confirm?: string | null,
    order_finish_is_delete?: boolean | null
  ) => void;
  showModalTypeDop: (is_show: boolean) => void;
  setTypeDop: (type: string[]) => void;
  hideDelOrders: () => Promise<void>;
  setToken: (token: string) => void;
  setNotifToken: (token: string) => void;
  closeErrOrder: () => void;
  openErrOrder: (text: string) => void;
  getOrders: (is_reload?: boolean) => Promise<void>;
  set_type_location: () => void;
  showLocationDriver: () => Promise<void>;
  MyCurrentLocation: () => Promise<void>;
  showOrdersMap: (id: number | string) => void;
  setType: (type: OrderType, pointId?: number) => void;
  switchPoint: (pointId: number | null) => void;
  setCloseMenu: () => void;
  setOpenMenu: () => void;
  actionFinishOrder: (order_id: number, is_map?: boolean) => Promise<void>;
  actionCencelOrder: (order_id: number, is_map?: boolean) => Promise<void>;
  actionGetOrder: (order_id: number, is_map?: boolean) => Promise<void>;
  actionFakeOrder: (order_id: number, is_map?: boolean) => Promise<void>;
  actionPayOrder: (order_id: number, is_map?: boolean) => Promise<void>;
  clearMap: () => void;
  renderMap: (home: any, orders: Order[]) => void;
  closeOrderMap: () => void;
  getCheckStatusPay: (params: {
    data: { order_id: number; is_map: boolean };
    latitude?: string;
    longitude?: string;
  }) => Promise<void>;
  checkPos: (callback: (coords: { latitude: string; longitude: string }) => void) => void;
  actionOrder: (params: {
    data: { order_id: number; type: number; is_map: boolean; point_id?: number };
    latitude: string;
    longitude: string;
  }) => Promise<void>;
  actionOrderFake: (params: {
    data: { order_id: number; type: number; is_map: boolean };
    latitude: string;
    longitude: string;
  }) => Promise<void>;
  actionPay: (params: {
    data: { order_id: number; is_map: boolean };
    latitude: string;
    longitude: string;
  }) => Promise<void>;
}

export const useOrdersStore = createWithEqualityFn<OrdersStore>((set, get) => {
  const syncOfflineMap = (
    pointId: number | null,
    home: HomeLocation | null,
    additionalOrders: Order[] = []
  ): void => {
    const token = getAuthToken();
    if (!token || pointId === null || !home || !isAppOnline()) return;

    const prefix = `${pointId}:`;
    const uniqueOrders = new Map<string, Order>();
    const pointOrders = Object.entries(get().ordersByContext)
      .filter(([key]) => key.startsWith(prefix))
      .flatMap(([, orders]) => orders);

    for (const order of [...pointOrders, ...additionalOrders]) {
      const key = `${order.id}:${order.xy?.latitude ?? ''}:${order.xy?.longitude ?? ''}`;
      uniqueOrders.set(key, order);
    }

    void scheduleOfflineYandexMapSync({
      authToken: token,
      pointId,
      home,
      orders: [...uniqueOrders.values()],
    }).catch((error) => {
      devLog('offline_map_sync_error', 'Offline map background sync error', error);
    });
  };

  const warmOrdersCache = (pointId: number | null, activeTypeId: number): void => {
    if (ordersWarmupPromise) {
      pendingOrdersWarmup = { pointId, activeTypeId };
      return;
    }

    if (!isAppOnline() || getSelectedPointId() !== pointId) {
      return;
    }

    const now = Date.now();
    const inactiveTypes = get().types.filter((item) => item.id !== activeTypeId);
    const unsyncedTypes = inactiveTypes.filter(
      (item) => !inactiveOrdersSyncedAt.has(getOrdersContextKey(item.id, pointId))
    );
    const staleTypes = inactiveTypes.filter((item) => {
      const lastSync = inactiveOrdersSyncedAt.get(getOrdersContextKey(item.id, pointId)) ?? 0;
      return now - lastSync >= INACTIVE_ORDERS_REFRESH_INTERVAL_MS;
    });
    // Сначала обновляем все вкладки, включая устаревшие данные из прошлого
    // запуска. После прогрева обновляем по одной вкладке за цикл.
    const typesToWarm =
      unsyncedTypes.length > 0
        ? unsyncedTypes.sort((a, b) => Number(b.id === 5) - Number(a.id === 5))
        : staleTypes
            .sort((a, b) => {
              if (a.id === 5 || b.id === 5) return Number(b.id === 5) - Number(a.id === 5);
              return (
                (inactiveOrdersSyncedAt.get(getOrdersContextKey(a.id, pointId)) ?? 0) -
                (inactiveOrdersSyncedAt.get(getOrdersContextKey(b.id, pointId)) ?? 0)
              );
            })
            .slice(0, 1);

    if (typesToWarm.length === 0) {
      return;
    }

    ordersWarmupPromise = (async () => {
      for (const item of typesToWarm) {
        if (!isAppOnline() || getSelectedPointId() !== pointId) break;

        try {
          const response = await fetchOrders({
            point_id: pointId ?? undefined,
            type_orders: item.id,
          });
          if (!isAppOnline() || getSelectedPointId() !== pointId) break;

          const normalized = normalizeOrdersResponse(response);
          const contextKey = getOrdersContextKey(item.id, pointId);
          const ordersByContext = {
            ...get().ordersByContext,
            [contextKey]: normalized.orders,
          };

          set({ ordersByContext });
          persistOrdersSnapshot({ ...get(), ordersByContext });
          inactiveOrdersSyncedAt.set(contextKey, Date.now());
        } catch (error) {
          devLog('orders_cache_warmup_error', 'Orders cache warmup error', error);
        }
      }

      if (getSelectedPointId() === pointId) syncOfflineMap(pointId, get().home);
    })().finally(() => {
      ordersWarmupPromise = null;

      const pending = pendingOrdersWarmup;
      pendingOrdersWarmup = null;

      if (pending && isAppOnline() && getSelectedPointId() === pending.pointId) {
        warmOrdersCache(pending.pointId, pending.activeTypeId);
      }
    });
  };

  const resolveDriverCoords = async (): Promise<{
    latitude: string;
    longitude: string;
  } | null> => {
    if (!get().driver_need_gps) {
      return { latitude: '', longitude: '' };
    }

    const result = await readDriverPosition();

    if (result.blocked) {
      get().openErrOrder(result.message || 'Не удалось определить местоположение.');
      return null;
    }

    return {
      latitude: result.latitude,
      longitude: result.longitude,
    };
  };

  const runLockedOrderAction = async (fn: () => Promise<void>): Promise<void> => {
    if (get().isClick) {
      return;
    }

    if (!isAppOnline()) {
      if (get().modalConfirm) get().setActiveConfirm(false);
      get().openErrOrder(formatOrderError(new Error('offline')));
      return;
    }

    set({ isClick: true, is_load: true });

    try {
      await fn();
    } catch (err) {
      devLog('orders_action_error', 'Order action error', err);
      get().openErrOrder(formatOrderError(err));
    } finally {
      set({ isClick: false, is_load: false });
    }
  };

  const startOrderAction = () => {
    get().setActiveConfirm(false);
  };

  return {
    orders: cachedOrders?.orders ?? [],
    sourceOrders: cachedOrders?.sourceOrders ?? cachedOrders?.orders ?? [],
    ordersByContext: initialOrdersByContext,
    isOpenMenu: false,
    update_interval: cachedOrders?.update_interval ?? 30,
    limit: cachedOrders?.limit ?? '',
    limit_count: cachedOrders?.limit_count ?? '',
    token: '',
    notifToken: '',
    type: cachedOrders?.type ?? { id: 1, text: 'Активные' },
    types: ORDER_TYPES,
    types_dop: ORDER_STATUS_TYPES,
    type_dop: cachedOrders?.type_dop ?? ['1', '2', '3'],
    is_showModalTypeDop: false,
    showErrOrder: false,
    textErrOrder: '',
    is_load: false,
    map: null,
    showOrders: [],
    isOpenOrderMap: false,
    del_orders: [],
    showPay: false,
    payData: null,
    modalConfirm: false,
    is_map: false,
    order_finish_id: null,
    order_finish_is_delete: null,
    type_confirm: null,
    isClick: false,
    driver_pay: cachedOrders?.driver_pay ?? false,
    typeToStatus: TYPE_STATUS_MAP,
    is_check: false,
    ordersRefreshPending: false,
    location_driver: null,
    location_driver_time_text: '',
    home: cachedOrders?.home ?? null,
    type_location: 'none',
    id_watch: null,
    driver_need_gps: cachedOrders?.driver_need_gps ?? false,

    setShowPay: (active) => {
      set({ showPay: active });
      if (active === false) {
        set({ payData: null });
      }
    },

    setActiveConfirm: (active, order_finish_id, is_map, type_confirm, order_finish_is_delete) => {
      if (active && !isAppOnline()) {
        get().openErrOrder(formatOrderError(new Error('offline')));
        return;
      }

      if (active) {
        log('confirm_modal_open', 'Открытие модалки подтверждения заказа');
      } else {
        log('confirm_modal_close', 'Закрытие модалки подтверждения заказа');
      }

      set({
        modalConfirm: active,
        order_finish_id: order_finish_id ?? null,
        is_map: is_map ?? false,
        type_confirm: type_confirm ?? null,
        order_finish_is_delete: order_finish_is_delete ?? null,
      });
    },

    showModalTypeDop: (is_show) => {
      log(
        is_show ? 'orders_type_dop_modal_open' : 'orders_type_dop_modal_close',
        is_show ? 'Открытие модалки доп. типов заказов' : 'Закрытие модалки доп. типов заказов'
      );
      set({ is_showModalTypeDop: is_show });
    },

    setTypeDop: (type) => {
      const newType = type.length === 0 ? ['1', '2', '3'] : type;
      set({ type_dop: newType });

      if (!isAppOnline()) {
        const { sourceOrders, type: currentType, types_dop, typeToStatus } = get();
        const orders =
          currentType.id === 1 && newType.length !== types_dop.length
            ? filterOrdersByTypes(sourceOrders, newType, typeToStatus)
            : sourceOrders;

        set({ orders });
        persistOrdersSnapshot({ ...get(), orders, type_dop: newType });
        return;
      }

      get().getOrders(true);
    },

    hideDelOrders: async () => {
      if (!isAppOnline()) {
        get().openErrOrder(formatOrderError(new Error('offline')));
        return;
      }

      const idList = get().del_orders.map((item) => item.id);
      await apiHideDelOrders(get().token, idList, getSelectedPointId());
      set({ del_orders: [] });
    },

    setToken: (token) => {
      set({ token: `${token ?? ''}` });
    },

    setNotifToken: (token) => {
      set({ notifToken: token });
    },

    closeErrOrder: () => {
      set({ showErrOrder: false, textErrOrder: '' });
    },

    openErrOrder: (text) => {
      set({ showErrOrder: true, textErrOrder: text });
    },

    getOrders: async (is_reload = false) => {
      const { type_dop, types_dop, type, is_check } = get();
      const pointId = getSelectedPointId();
      const contextKey = getOrdersContextKey(type.id, pointId);

      if (is_check && activeOrdersRequestContextKey === contextKey) {
        set({ ordersRefreshPending: true });
        return;
      }

      if (!isAppOnline()) {
        void useConnectivityStore.getState().probeConnectivity();
        return;
      }

      const requestId = ++ordersRequestSequence;
      latestOrdersRequestId = requestId;
      activeOrdersRequestContextKey = contextKey;
      set({ is_check: true, ordersRefreshPending: false });

      if (is_reload) {
        set({ is_load: true });
      }

      try {
        const response = await fetchOrders({
          point_id: pointId ?? undefined,
          type_orders: type.id,
        });

        const normalized = normalizeOrdersResponse(response);
        let orders = normalized.orders;
        const ordersByContext = {
          ...get().ordersByContext,
          [contextKey]: normalized.orders,
        };
        const isCurrentContext = getOrdersContextKey(get().type.id) === contextKey;

        if (type.id === 1 && type_dop.length !== types_dop.length) {
          orders = filterOrdersByTypes(orders, type_dop, get().typeToStatus);
        }

        const nextHome = hasHomeMoved(get().home, normalized.home) ? normalized.home : get().home;

        set({
          ordersByContext,
          ...(isCurrentContext
            ? {
                orders,
                sourceOrders: normalized.orders,
                update_interval: normalized.update_interval,
                limit: normalized.limit,
                limit_count: normalized.limit_count,
                del_orders: normalized.del_orders,
                driver_pay: normalized.driver_pay,
                driver_need_gps: normalized.driver_need_gps,
                ...(hasHomeMoved(get().home, normalized.home) ? { home: normalized.home } : {}),
              }
            : {}),
        });

        persistOrdersSnapshot({
          ...get(),
          ordersByContext,
          ...(isCurrentContext
            ? {
                orders,
                sourceOrders: normalized.orders,
                update_interval: normalized.update_interval,
                limit: normalized.limit,
                limit_count: normalized.limit_count,
                home: nextHome,
                driver_pay: normalized.driver_pay,
                driver_need_gps: normalized.driver_need_gps,
              }
            : {}),
        });

        log('orders_fetch_success', 'Получение списка заказов');
        syncOfflineMap(pointId, nextHome, normalized.orders);
        warmOrdersCache(pointId, type.id);
      } catch (err) {
        devLog('orders_fetch_error', 'Orders fetch error', err);
        log('orders_fetch_fail', 'Ошибка при получении списка заказов');

        if (isConnectivityError(err)) {
          markAppOffline();

          if (getOrdersContextKey(get().type.id) === contextKey && get().orders.length === 0) {
            get().openErrOrder(formatOrderError(err));
          }
        } else {
          get().openErrOrder(formatOrderError(err));
        }
      }

      setTimeout(() => {
        if (requestId !== latestOrdersRequestId) {
          return;
        }

        const shouldRefreshCurrent = get().ordersRefreshPending;
        activeOrdersRequestContextKey = '';
        set({
          is_check: false,
          ordersRefreshPending: false,
          ...(get().isClick ? {} : { is_load: false }),
        });

        if (shouldRefreshCurrent) {
          void get().getOrders(false);
        }
      }, 300);
    },

    set_type_location: () => {
      const { type_location, id_watch } = get();

      if (type_location === 'none') {
        get().showLocationDriver();
        set({ type_location: 'location' });
      } else if (type_location === 'location') {
        get().MyCurrentLocation();
        set({ type_location: 'watch' });
      } else if (type_location === 'watch' && id_watch) {
        set({ type_location: 'none', location_driver: null, location_driver_time_text: '' });
        navigator.geolocation.clearWatch(id_watch);
        setTimeout(() => set({ id_watch: null }), 300);
      }
    },

    showLocationDriver: async () => {
      try {
        set({ is_load: true });
        log('driver_location', 'Показать текущее местоположение водителя на карте');

        const result = await readDriverPosition();

        if (result.blocked) {
          get().openErrOrder(result.message || 'Не удалось определить местоположение.');
          setTimeout(() => set({ is_load: false }), 300);
          return;
        }

        if (!result.latitude || !result.longitude) {
          setTimeout(() => set({ is_load: false }), 300);
          return;
        }

        const now = new Date();
        const min = now.getMinutes() < 10 ? `0${now.getMinutes()}` : `${now.getMinutes()}`;

        set({
          location_driver: [Number(result.latitude), Number(result.longitude)],
          location_driver_time_text: `${now.getHours()}:${min}`,
        });

        setTimeout(() => set({ is_load: false }), 300);

        setTimeout(() => {
          if (get().type_location === 'location') {
            set({ type_location: 'none', location_driver: null });
          }
        }, 30000);
      } catch (err) {
        const described = describeGeolocationError(err);
        get().openErrOrder(described.text);
        setTimeout(() => set({ is_load: false, type_location: 'none' }), 300);
      }
    },

    MyCurrentLocation: async () => {
      if (!get().driver_need_gps) return;

      try {
        let blockedNoticeShown = false;
        const id_watch = navigator.geolocation.watchPosition(
          ({ coords }) => {
            const { latitude, longitude } = coords;
            const now = new Date();
            const min = now.getMinutes() < 10 ? `0${now.getMinutes()}` : `${now.getMinutes()}`;

            set({
              location_driver: [latitude, longitude],
              location_driver_time_text: `${now.getHours()}:${min}`,
            });

            setTimeout(() => {
              if (get().type_location === 'none') {
                set({ type_location: 'watch' });
              }
            }, 100);
          },
          (error) => {
            const described = describeGeolocationError(error);
            devLog('orders_watch_position_error', 'Watch position error', error);

            if (!described.canContinue && !blockedNoticeShown) {
              blockedNoticeShown = true;
              get().openErrOrder(described.text);
            }
          },
          {
            maximumAge: 10000,
            timeout: 10000,
            enableHighAccuracy: true,
          }
        );

        set({ id_watch });
      } catch (err) {
        devLog('orders_current_location_error', 'Current location error', err);
      }
    },

    showOrdersMap: (id) => {
      const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
      if (idNum === -1) return;

      const order = get().orders.find((item) => item.id === idNum);
      if (order) {
        const locationKey = getOrderMapLocationKey(order);
        const newOrders = locationKey
          ? get().orders.filter((item) => getOrderMapLocationKey(item) === locationKey)
          : [order];

        log('order_map_open', 'Открытие заказа на карте');
        set({ showOrders: newOrders, isOpenOrderMap: true });
      }
    },

    setType: (type) => {
      const cached = get().ordersByContext[getOrdersContextKey(type.id)];
      const orders = cached
        ? type.id === 1 && get().type_dop.length !== get().types_dop.length
          ? filterOrdersByTypes(cached, get().type_dop, get().typeToStatus)
          : cached
        : [];

      set({
        type,
        orders,
        sourceOrders: cached ?? [],
        isOpenMenu: false,
      });
      persistOrdersSnapshot({ ...get(), type });

      if (!isAppOnline()) {
        return;
      }

      get().getOrders(false);
    },

    switchPoint: (pointId) => {
      const { type, type_dop, types_dop, typeToStatus, ordersByContext } = get();
      const cached = ordersByContext[getOrdersContextKey(type.id, pointId)];
      const sourceOrders = cached ?? [];
      const orders =
        type.id === 1 && type_dop.length !== types_dop.length
          ? filterOrdersByTypes(sourceOrders, type_dop, typeToStatus)
          : sourceOrders;

      set({
        orders,
        sourceOrders,
        showOrders: [],
        isOpenOrderMap: false,
        ordersRefreshPending: false,
      });
      persistOrdersSnapshot({ ...get(), orders, sourceOrders });

      if (isAppOnline()) {
        void get().getOrders(true);
      }
    },

    setCloseMenu: () => set({ isOpenMenu: false }),
    setOpenMenu: () => set({ isOpenMenu: true }),

    checkPos: (callback: (coords: { latitude: string; longitude: string }) => void) => {
      void readDriverPosition().then((result) => {
        if (result.blocked) {
          devLog('orders_geolocation_error', 'Geolocation error', result.message);
          get().openErrOrder(result.message || 'Не удалось определить местоположение.');
          set({ is_load: false });
          return;
        }

        callback({
          latitude: result.latitude,
          longitude: result.longitude,
        });
      });
    },

    actionOrder: async ({ data, latitude, longitude }) => {
      const { order_id, type, is_map, point_id } = data;

      const res = await apiActionOrder({
        type: 'actionOrder',
        id: order_id,
        point_id: point_id ?? getSelectedPointId() ?? undefined,
        type_action: type,
        latitude,
        longitude,
      });

      if (!isApiOk(res?.st)) {
        get().openErrOrder(res?.text || 'Ошибка');
        return;
      }

      get().closeOrderMap();
      get().setShowPay(false);
      await get().getOrders();
    },

    actionOrderFake: async ({ data, latitude, longitude }) => {
      const { order_id, is_map } = data;

      const res = await apiCheckFakeOrder({
        type: 'checkFakeOrder',
        token: get().token,
        order_id,
        point_id: getSelectedPointId() ?? undefined,
        latitude,
        longitude,
      });
      const dataRes = nestedApiStatus(res);

      if (!isApiOk(dataRes?.st ?? res?.st)) {
        get().openErrOrder(dataRes?.text || res?.text || 'Ошибка');
        return;
      }

      const now = new Date();
      const min = now.getMinutes() < 10 ? `0${now.getMinutes()}` : `${now.getMinutes()}`;

      set({
        location_driver: [parseFloat(latitude), parseFloat(longitude)],
        location_driver_time_text: `${now.getHours()}:${min}`,
      });

      get().closeOrderMap();
      await get().getOrders();
      setTimeout(() => set({ location_driver: null }), 300000);
    },

    actionPay: async ({ data, latitude, longitude }) => {
      const { order_id, is_map } = data;

      const res = await apiGetPayQr({
        type: 'get_pay_qr',
        token: get().token,
        order_id,
        point_id: getSelectedPointId() ?? undefined,
      });

      if (!isApiOk(res?.st)) {
        get().openErrOrder(res?.text || 'Ошибка');
        return;
      }

      if (res.pay) {
        res.pay.check_data = { data: { order_id, is_map }, latitude, longitude };
      }

      get().openErrOrder('Заказ оплачен');
      set({ showPay: true, payData: res.pay });
    },

    actionFinishOrder: (order_id, is_map = false) => {
      return runLockedOrderAction(async () => {
        log('confirm_finish', 'Заказ завершен');
        startOrderAction();

        const coords = await resolveDriverCoords();
        if (!coords) return;

        await get().actionOrder({
          latitude: coords.latitude,
          longitude: coords.longitude,
          data: { order_id, type: 3, is_map },
        });
      });
    },

    actionCencelOrder: (order_id, is_map = false) => {
      return runLockedOrderAction(async () => {
        log('confirm_cancel', 'Заказ отменен');
        startOrderAction();

        const coords = await resolveDriverCoords();
        if (!coords) return;

        await get().actionOrder({
          latitude: coords.latitude,
          longitude: coords.longitude,
          data: { order_id, type: 2, is_map },
        });
      });
    },

    actionGetOrder: (order_id, is_map = false) => {
      return runLockedOrderAction(async () => {
        log('confirm_approve', 'Взятие заказа');
        startOrderAction();

        const coords = await resolveDriverCoords();
        if (!coords) return;

        await get().actionOrder({
          latitude: coords.latitude,
          longitude: coords.longitude,
          data: { order_id, type: 1, is_map },
        });
      });
    },

    actionFakeOrder: (order_id, is_map = false) => {
      return runLockedOrderAction(async () => {
        log('confirm_fake', 'Клиент не вышел на связь');
        startOrderAction();

        const coords = await resolveDriverCoords();
        if (!coords) return;

        await get().actionOrderFake({
          latitude: coords.latitude,
          longitude: coords.longitude,
          data: { order_id, type: 1, is_map },
        });
      });
    },

    actionPayOrder: (order_id, is_map = false) => {
      return runLockedOrderAction(async () => {
        get().setActiveConfirm(false);

        const result = await readDriverPosition();
        if (result.blocked) {
          get().openErrOrder(result.message || 'Не удалось определить местоположение.');
          return;
        }

        await get().actionPay({
          latitude: result.latitude,
          longitude: result.longitude,
          data: { order_id, is_map },
        });
      });
    },

    clearMap: () => set({ map: null }),

    renderMap: (home, orders) => {
      // Yandex maps implementation - simplified for now
      devLog('orders_render_map', 'Render map called', { home, orders });
    },

    closeOrderMap: () => {
      log('order_map_close', 'Закрытие заказа на карте');
      set({ showOrders: [], isOpenOrderMap: false });
    },

    getCheckStatusPay: async ({ data, latitude = '', longitude = '' }) => {
      const { order_id, is_map } = data;

      const res = await apiCheckPayOrder(get().token, order_id, getSelectedPointId());

      if (isApiOk(res?.st)) {
        await get().actionOrder({ latitude, longitude, data: { order_id, type: 3, is_map } });
      }
    },
  };
}, shallow);
