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
import { getApiErrorInfo } from '@/shared/api/errors';
import { log } from '@/components/analytics';
import { devLog } from '@/shared/lib/devLog';
import { describeGeolocationError, readDriverPosition } from '@/shared/lib/geolocation';
import { useSettingsStore } from '@/entities/settings';
import {
  fetchOrders,
  actionOrder as apiActionOrder,
  checkFakeOrder as apiCheckFakeOrder,
  getPayQr as apiGetPayQr,
  hideDelOrders as apiHideDelOrders,
  checkPayOrder as apiCheckPayOrder,
  normalizeOrdersResponse,
} from '../api/order.api';

function getSelectedPointId(): number | null {
  return useSettingsStore.getState().pointId;
}

function isApiOk(st: unknown): boolean {
  return st === true || st === 1 || st === '1';
}

function formatOrderError(error: unknown): string {
  const message = getApiErrorInfo(error).message.trim();

  return message || 'Не удалось выполнить запрос.';
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
    orders: [],
    isOpenMenu: false,
    update_interval: 30,
    limit: '',
    limit_count: '',
    token: '',
    notifToken: '',
    type: { id: 1, text: 'Активные' },
    types: ORDER_TYPES,
    types_dop: ORDER_STATUS_TYPES,
    type_dop: ['1', '2', '3'],
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
    driver_pay: false,
    typeToStatus: TYPE_STATUS_MAP,
    is_check: false,
    location_driver: null,
    location_driver_time_text: '',
    home: null,
    type_location: 'none',
    id_watch: null,
    driver_need_gps: false,

    setShowPay: (active) => {
      set({ showPay: active });
      if (active === false) {
        set({ payData: null });
      }
    },

    setActiveConfirm: (active, order_finish_id, is_map, type_confirm, order_finish_is_delete) => {
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
      get().getOrders(true);
    },

    hideDelOrders: async () => {
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

      if (is_check) {
        return;
      }

      set({ is_check: true });

      if (is_reload) {
        set({ is_load: true });
      }

      try {
        const response = await fetchOrders({
          point_id: getSelectedPointId() ?? undefined,
          type_orders: get().type.id,
        });

        const normalized = normalizeOrdersResponse(response);
        let orders = normalized.orders;

        if (type.id === 1 && type_dop.length !== types_dop.length) {
          orders = filterOrdersByTypes(orders, type_dop, get().typeToStatus);
        }

        set({
          orders,
          update_interval: normalized.update_interval,
          limit: normalized.limit,
          limit_count: normalized.limit_count,
          del_orders: normalized.del_orders,
          driver_pay: normalized.driver_pay,
          driver_need_gps: normalized.driver_need_gps,
          ...(hasHomeMoved(get().home, normalized.home) ? { home: normalized.home } : {}),
        });

        log('orders_fetch_success', 'Получение списка заказов');
      } catch (err) {
        devLog('orders_fetch_error', 'Orders fetch error', err);
        log('orders_fetch_fail', 'Ошибка при получении списка заказов');
        get().openErrOrder(formatOrderError(err));
      }

      setTimeout(() => {
        set({
          is_check: false,
          ...(get().isClick ? {} : { is_load: false }),
        });
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
        const newOrders = get().orders.filter(
          (item) =>
            item?.xy?.latitude === order?.xy?.latitude &&
            item?.xy?.longitude === order?.xy?.longitude
        );

        log('order_map_open', 'Открытие заказа на карте');
        set({ showOrders: newOrders, isOpenOrderMap: true });
      }
    },

    setType: (type) => {
      set({ type, isOpenMenu: false });
      get().getOrders(false);
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
      const dataRes = res?.data ?? res;

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
