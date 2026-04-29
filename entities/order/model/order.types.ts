export interface Order {
  id: number;
  drink_list: DrinkItem[];
  pd: string;
  et: string;
  kv: string;
  comment: string;
  status?: string;
  status_order?: number;
  point_color?: string;
  color?: string;
  point_text?: string;
  xy?: {
    latitude: number;
    longitude: number;
  };
  is_pred?: number;
  is_my?: number;
  time_start_mini?: string;
  close_time_?: string;
}

export interface DrinkItem {
  id?: number;
  name?: string;
  count?: number;
  price?: number;
}

export interface OrderType {
  id: number;
  text: string;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface HomeLocation {
  center: [number, number];
  zoom: number;
  controls: any[];
}

export interface PayData {
  qr?: string;
  url?: string;
  check_data?: any;
  confirmation?: {
    confirmation_data?: string;
  };
}

export interface DelOrder {
  id: number;
  [key: string]: any;
}

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
