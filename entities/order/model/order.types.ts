export type OrderFlag = number | string;

export interface DrinkItem {
  id?: number;
  name?: string;
  names?: string;
  count?: number;
  price?: number;
}

export interface OrderCoordinates {
  latitude: number;
  longitude: number;
  lat?: number;
  lon?: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
}

export interface Order {
  id: number;
  drink_list: DrinkItem[];
  pd: string;
  et: string;
  kv: string;
  comment: string;
  id_text?: string;
  number?: string;
  addr?: string;
  fake_dom?: OrderFlag;
  need_time?: string;
  time_start_order?: string;
  close_date_time_order?: string;
  to_time?: string;
  time_start_mini?: string;
  close_time_?: string;
  status?: string;
  status_order?: OrderFlag;
  online_pay?: OrderFlag;
  driver_pay?: OrderFlag;
  is_pred?: OrderFlag;
  is_my?: OrderFlag;
  is_get?: OrderFlag;
  is_delete?: OrderFlag;
  delete_reason?: string;
  sum_order?: number | string;
  sdacha?: OrderFlag;
  sum_sdacha?: number | string;
  count_other?: OrderFlag;
  count_pasta?: OrderFlag;
  count_pizza?: OrderFlag;
  count_drink?: OrderFlag;
  driver_name?: string;
  driver_login?: string | null;
  point_color?: string;
  color?: string;
  point_text?: string;
  xy?: OrderCoordinates;
}

export interface OrderType {
  id: number;
  text: string;
}

export interface HomeLocation {
  center: [number, number];
  zoom: number;
  controls: string[];
}

export interface PayCheckStatus {
  data: {
    order_id: number;
    is_map: boolean;
  };
  latitude?: string;
  longitude?: string;
}

export interface PayData {
  qr?: string;
  url?: string;
  check_data?: PayCheckStatus;
  confirmation?: {
    confirmation_data?: string;
  };
}

export type DelOrder = Order;

export const ORDER_TYPES: OrderType[] = [
  { id: 1, text: 'Активные' },
  { id: 3, text: 'Предзаказы' },
  { id: 2, text: 'Мои отмеченные' },
  { id: 5, text: 'У других курьеров' },
  { id: 6, text: 'Мои завершенные' },
];

export const ORDER_STATUS_TYPES: OrderType[] = [
  { id: 1, text: 'В очереди' },
  { id: 2, text: 'Готовится' },
  { id: 3, text: 'Собран' },
];

export const TYPE_STATUS_MAP: Record<number, string> = {
  1: 'В очереди',
  2: 'Готовится',
  3: 'Собран',
};

export const TYPE_SHOW_DEL_TO_INT: Record<string, number> = {
  min: 30,
  max: 120,
  full: 1440,
};

export const TYPE_SHOW_DEL_FROM_INT: Record<number, string> = {
  30: 'min',
  120: 'max',
  1440: 'full',
};
