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
import { log } from '@/shared/api/client';
import {
  fetchOrders,
  actionOrder as apiActionOrder,
  checkFakeOrder as apiCheckFakeOrder,
  getPayQr as apiGetPayQr,
  hideDelOrders as apiHideDelOrders,
  checkPayOrder as apiCheckPayOrder,
  normalizeOrdersResponse,
  GetOrdersResponse,
} from '../api/order.api';
import { useSettingsStore } from '@/entities/settings/model/settings.store';

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
  setType: (type: OrderType) => void;
  setCloseMenu: () => void;
  setOpenMenu: () => void;
  actionFinishOrder: (order_id: number, is_map?: boolean) => void;
  actionCencelOrder: (order_id: number, is_map?: boolean) => void;
  actionGetOrder: (order_id: number, is_map?: boolean) => void;
  actionFakeOrder: (order_id: number, is_map?: boolean) => void;
  actionPayOrder: (order_id: number, is_map?: boolean) => void;
  clearMap: () => void;
  renderMap: (home: any, orders: Order[]) => void;
  closeOrderMap: () => void;
  getCheckStatusPay: (params: {
    data: { order_id: number; is_map: boolean };
    latitude?: string;
    longitude?: string;
  }) => Promise<void>;
  checkPos: (callback: (coords: { latitude: string; longitude: string }) => void) => void;
  actionOrder: (params: { data: any; latitude: string; longitude: string }) => Promise<void>;
  actionOrderFake: (params: { data: any; latitude: string; longitude: string }) => Promise<void>;
  actionPay: (params: { data: any; latitude: string; longitude: string }) => Promise<void>;
}

export const useOrdersStore = createWithEqualityFn<OrdersStore>(
  (set, get) => ({
    // Initial state
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
      await apiHideDelOrders(get().token, idList);
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

    getOrders: async (is_reload = false, point_id) => {
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
          type_orders: get().type.id,
          point_id,
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
        });

        log('orders_fetch_success', 'Получение списка заказов');

        const currentHome = get().home;
        if (!currentHome && normalized.home) {
          set({ home: normalized.home });
        }
      } catch (err) {
        console.error(err);
        log('orders_fetch_fail', 'Ошибка при получении списка заказов');
        get().openErrOrder('Ошибка ' + err);
      }

      setTimeout(() => {
        set({ is_load: false, is_check: false });
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

        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const { latitude, longitude } = coords;
            const now = new Date();
            const min = now.getMinutes() < 10 ? `0${now.getMinutes()}` : `${now.getMinutes()}`;

            set({
              location_driver: [latitude, longitude],
              location_driver_time_text: `${now.getHours()}:${min}`,
            });

            setTimeout(() => set({ is_load: false }), 300);

            setTimeout(() => {
              if (get().type_location === 'location') {
                set({ type_location: 'none', location_driver: null });
              }
            }, 30000);
          },
          (error) => {
            console.error('Geolocation error:', error);
            setTimeout(() => set({ is_load: false }), 300);
          },
          { enableHighAccuracy: true }
        );
      } catch (err) {
        get().openErrOrder(`Произошла ошибка ${err}`);
        setTimeout(() => set({ is_load: false, type_location: 'none' }), 300);
      }
    },

    MyCurrentLocation: async () => {
      if (!get().driver_need_gps) return;

      try {
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
            console.error('Watch position error:', error);
          },
          {
            maximumAge: 10000,
            timeout: 10000,
            enableHighAccuracy: true,
            distanceFilter: 15,
          }
        );

        set({ id_watch });
      } catch (err) {
        console.error('MyCurrentLocation error:', err);
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
      get().getOrders();
    },

    setCloseMenu: () => set({ isOpenMenu: false }),
    setOpenMenu: () => set({ isOpenMenu: true }),

    checkPos: (callback: (coords: { latitude: string; longitude: string }) => void) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) =>
          callback({ latitude: `${coords.latitude}`, longitude: `${coords.longitude}` }),
        ({ message }) => {
          console.error('Geolocation error:', message);
          get().openErrOrder(`Не удалось определить местоположение. ${message}`);
          set({ is_load: false });
        },
        { enableHighAccuracy: true }
      );
    },

    actionOrder: async ({ data, latitude, longitude }) => {
      const { order_id, type, is_map } = data;

      const res = await apiActionOrder({
        type: 'actionOrder',
        token: get().token,
        id: order_id,
        type_action: type,
        appToken: get().notifToken,
        latitude,
        longitude,
      });

      if (!res?.st) {
        get().openErrOrder(res?.text || 'Ошибка');
        setTimeout(() => set({ is_load: false }), 500);
      } else {
        get().closeOrderMap();
        get().setShowPay(false);
        get().getOrders();
        setTimeout(() => set({ is_load: false }), 500);
      }
    },

    actionOrderFake: async ({ data, latitude, longitude }) => {
      const { order_id, is_map } = data;

      const res = await apiCheckFakeOrder({
        type: 'checkFakeOrder',
        token: get().token,
        order_id,
        latitude,
        longitude,
      });

      if (!res?.st) {
        get().openErrOrder(res?.text || 'Ошибка');
        setTimeout(() => set({ is_load: false }), 500);
      } else {
        const now = new Date();
        const min = now.getMinutes() < 10 ? `0${now.getMinutes()}` : `${now.getMinutes()}`;

        set({
          location_driver: [parseFloat(latitude), parseFloat(longitude)],
          location_driver_time_text: `${now.getHours()}:${min}`,
        });

        get().closeOrderMap();
        get().getOrders();

        setTimeout(() => set({ is_load: false }), 500);
        setTimeout(() => set({ location_driver: null }), 300000);
      }
    },

    acttionPay: async ({ data, latitude, longitude }) => {
      const { order_id, is_map } = data;

      const res = await apiGetPayQr({
        type: 'get_pay_qr',
        token: get().token,
        order_id,
      });

      if (!res?.st) {
        get().openErrOrder(res?.text || 'Ошибка');
        setTimeout(() => set({ is_load: false }), 500);
      } else {
        res.pay.check_data = { data: { order_id, is_map }, latitude, longitude };
        get().openErrOrder('Заказ оплачен');
        setTimeout(() => set({ is_load: false, showPay: true, payData: res.pay }), 500);
      }
    },

    actionFinishOrder: (order_id, is_map = false) => {
      if (get().isClick) return;
      set({ isClick: true, is_load: true });

      log('confirm_finish', 'Заказ завершен');

      const finishHandler = ({ latitude, longitude }: { latitude: string; longitude: string }) => {
        const data = { order_id, type: 3, is_map };
        get().actionOrder({ latitude, longitude, data });
      };

      if (get().driver_need_gps) {
        get().checkPos(finishHandler);
      } else {
        finishHandler({ latitude: '', longitude: '' });
      }

      setTimeout(() => {
        get().setActiveConfirm(false);
        set({ isClick: false });
      }, 300);
    },

    actionCencelOrder: (order_id, is_map = false) => {
      if (get().isClick) return;
      set({ isClick: true, is_load: true });

      log('confirm_cancel', 'Заказ отменен');

      const cancelHandler = ({ latitude, longitude }: { latitude: string; longitude: string }) => {
        const data = { order_id, type: 2, is_map };
        get().actionOrder({ latitude, longitude, data });
      };

      if (get().driver_need_gps) {
        get().checkPos(cancelHandler);
      } else {
        cancelHandler({ latitude: '', longitude: '' });
      }

      setTimeout(() => {
        get().setActiveConfirm(false);
        set({ isClick: false });
      }, 300);
    },

    actionGetOrder: (order_id, is_map = false) => {
      if (get().isClick) return;
      set({ isClick: true, is_load: true });

      log('confirm_approve', 'Взятие заказа');

      const getHandler = ({ latitude, longitude }: { latitude: string; longitude: string }) => {
        const data = { order_id, type: 1, is_map };
        get().actionOrder({ latitude, longitude, data });
      };

      if (get().driver_need_gps) {
        get().checkPos(getHandler);
      } else {
        getHandler({ latitude: '', longitude: '' });
      }

      setTimeout(() => set({ isClick: false }), 300);
    },

    actionFakeOrder: (order_id, is_map = false) => {
      if (get().isClick) return;
      set({ isClick: true, is_load: true });

      log('confirm_fake', 'Клиент не вышел на связь');

      const fakeHandler = ({ latitude, longitude }: { latitude: string; longitude: string }) => {
        const data = { order_id, type: 1, is_map };
        get().actionOrderFake({ latitude, longitude, data });
      };

      if (get().driver_need_gps) {
        get().checkPos(fakeHandler);
      } else {
        fakeHandler({ latitude: '', longitude: '' });
      }

      setTimeout(() => {
        get().setActiveConfirm(false);
        set({ isClick: false });
      }, 300);
    },

    actionPayOrder: (order_id, is_map = false) => {
      if (get().isClick) return;
      set({ isClick: true, is_load: true });
      get().checkPos(({ latitude, longitude }) => {
        get().acttionPay({ latitude, longitude, data: { order_id, is_map } });
      });
      setTimeout(() => set({ isClick: false }), 300);
    },

    clearMap: () => set({ map: null }),

    renderMap: (home, orders) => {
      // Yandex maps implementation - simplified for now
      console.log('renderMap called', home, orders);
    },

    closeOrderMap: () => {
      log('order_map_close', 'Закрытие заказа на карте');
      set({ showOrders: [], isOpenOrderMap: false });
    },

    getCheckStatusPay: async ({ data, latitude, longitude }) => {
      const { order_id, is_map } = data;

      const res = await apiCheckPayOrder(get().token, order_id);

      if (res?.st === true) {
        get().actionOrder({ latitude, longitude, data: { order_id, type: 3, is_map } });
      }
    },
  }),
  shallow
);
