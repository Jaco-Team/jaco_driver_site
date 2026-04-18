import { api, ApiResponse, http } from '@/shared/api/client';
import { Order, DelOrder, PayData, HomeLocation } from '../model/order.types';
import { normalizeOrderRow } from '../model/order.utils';
import { SettingsData } from '@/entities/settings/model/types';

export interface GetOrdersResponse extends ApiResponse {
  orders?: any[];
  update_interval?: number;
  limit?: string;
  limit_count?: string;
  arr_del_list?: any[];
  driver_pay?: boolean;
  driver_need_gps?: number;
  home?: {
    latitude: number;
    longitude: number;
  };
}

export interface ActionOrderRequest {
  type: 'actionOrder';
  token: string;
  id: number;
  type_action: number;
  appToken: string;
  latitude: string;
  longitude: string;
}

export interface CheckFakeOrderRequest {
  type: 'checkFakeOrder';
  token: string;
  order_id: number;
  latitude: string;
  longitude: string;
}

export interface GetPayQrRequest {
  type: 'get_pay_qr';
  token: string;
  order_id: number;
}

export interface GetPayQrResponse extends ApiResponse {
  pay?: PayData;
}

export interface CheckCloseOrdersRequest {
  type: 'check_close_orders';
  token: string;
  idList: string;
}

export interface CheckPayOrderRequest {
  type: 'check_pay_order';
  token: string;
  order_id: number;
}

export interface GetOrdersRequest {
  point_id: number;
  type_orders: number;
}

export async function fetchOrders(request: GetOrdersRequest): Promise<GetOrdersResponse> {
  const response = await http.post('/api/v1/orders/get_orders', request);
  return response as GetOrdersResponse;
}

export async function actionOrder(request: ActionOrderRequest): Promise<ApiResponse> {
  const response = await api('orders', request);
  return response;
}

export async function checkFakeOrder(request: CheckFakeOrderRequest): Promise<ApiResponse> {
  const response = await api('orders', request);
  return response;
}

export async function getPayQr(request: GetPayQrRequest): Promise<GetPayQrResponse> {
  const response = await api('orders', request);
  return response as GetPayQrResponse;
}

export async function hideDelOrders(token: string, idList: number[]): Promise<ApiResponse> {
  const data: CheckCloseOrdersRequest = {
    type: 'check_close_orders',
    token,
    idList: JSON.stringify(idList),
  };
  return api('orders', data);
}

export async function checkPayOrder(token: string, order_id: number): Promise<ApiResponse> {
  const data: CheckPayOrderRequest = {
    type: 'check_pay_order',
    token,
    order_id,
  };
  return api('orders', data);
}

export function normalizeOrdersResponse(response: GetOrdersResponse): {
  orders: Order[];
  update_interval: number;
  limit: string;
  limit_count: string;
  del_orders: DelOrder[];
  driver_pay: boolean;
  driver_need_gps: boolean;
  home: HomeLocation | null;
  zoomSize: number;
} {
  const zoomSize = typeof window !== 'undefined' && window.innerWidth < 601 ? 12 : 11.5;

  let home: HomeLocation | null = null;
  if (response?.home?.latitude !== undefined && response?.home?.longitude !== undefined) {
    home = {
      center: [response.home.latitude, response.home.longitude],
      zoom: zoomSize,
      controls: [],
    };
  }

  return {
    orders: Array.isArray(response?.orders) ? response.orders.map(normalizeOrderRow) : [],
    update_interval: response?.update_interval ?? 30,
    limit: response?.limit ?? '',
    limit_count: response?.limit_count ?? '',
    del_orders: Array.isArray(response?.arr_del_list)
      ? response.arr_del_list.map(normalizeOrderRow)
      : [],
    driver_pay: response?.driver_pay ?? false,
    driver_need_gps: parseInt(response?.driver_need_gps as unknown as string) !== 0,
    home,
    zoomSize,
  };
}
