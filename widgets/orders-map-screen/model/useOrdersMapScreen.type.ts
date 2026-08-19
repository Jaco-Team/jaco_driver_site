import type { MutableRefObject } from 'react';

import type { useHeaderStore } from '@/features/header/model/header.store';
import type { useOrdersStore } from '@/entities/order/model/order.store';

export interface MapInstance {
  setCenter: (center: [number, number]) => void;
}

type HeaderState = ReturnType<typeof useHeaderStore.getState>;
type OrdersState = ReturnType<typeof useOrdersStore.getState>;

export type OrdersMapHeaderState = Pick<
  HeaderState,
  'globalFontSize' | 'theme' | 'mapScale' | 'night_map' | 'is_scaleMap'
>;

export type OrdersMapOrdersState = Pick<
  OrdersState,
  | 'type'
  | 'limit'
  | 'limit_count'
  | 'setType'
  | 'home'
  | 'location_driver'
  | 'type_location'
  | 'set_type_location'
  | 'location_driver_time_text'
  | 'modalConfirm'
  | 'order_finish_id'
  | 'type_confirm'
  | 'showErrOrder'
  | 'textErrOrder'
  | 'closeErrOrder'
  | 'setActiveConfirm'
  | 'actionFinishOrder'
  | 'actionCencelOrder'
  | 'actionGetOrder'
  | 'actionFakeOrder'
  | 'isClick'
  | 'is_load'
>;

export interface UseOrdersMapScreenResult {
  mapRef: MutableRefObject<MapInstance | null>;
  header: OrdersMapHeaderState;
  orders: OrdersMapOrdersState;
  iconColor: string;
  getHome: () => void;
  handleConfirm: () => void;
}
