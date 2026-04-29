import type { ApiResponse } from '@/shared/api/client';
import { connector } from '@/shared/api/connector';
import { apiRoutes } from '@/shared/api/routes';
import { Order, DelOrder, PayData, HomeLocation } from '../model/order.types';
import { normalizeOrderRow } from '../model/order.utils';

interface GetOrdersResponse extends ApiResponse {
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

interface ActionOrderRequest {
  type: 'actionOrder';
  id: number;
  point_id?: number;
  type_action: number;
  latitude: string;
  longitude: string;
}

interface CheckFakeOrderRequest {
  type: 'checkFakeOrder';
  token: string;
  order_id: number;
  latitude: string;
  longitude: string;
}

interface GetPayQrRequest {
  type: 'get_pay_qr';
  token: string;
  order_id: number;
}

interface GetPayQrResponse extends ApiResponse {
  pay?: PayData;
}

interface GetOrdersRequest {
  point_id?: number;
  type_orders: number;
}

export async function fetchOrders(request: GetOrdersRequest): Promise<GetOrdersResponse> {
  return connector.rest.post<GetOrdersResponse, GetOrdersRequest>(
    apiRoutes.orders.getOrders,
    request
  );
}

export async function actionOrder(request: ActionOrderRequest): Promise<ApiResponse> {
  return connector.rest.post<ApiResponse, ActionOrderRequest>(
    apiRoutes.orders.actionOrder,
    request
  );
}

export async function checkFakeOrder(request: CheckFakeOrderRequest): Promise<ApiResponse> {
  return connector.rest.post<ApiResponse, CheckFakeOrderRequest>(
    apiRoutes.orders.checkFakeOrder,
    request
  );
}

export async function getPayQr(request: GetPayQrRequest): Promise<GetPayQrResponse> {
  return connector.rest.post<GetPayQrResponse, GetPayQrRequest>(apiRoutes.orders.getPayQr, request);
}

export async function hideDelOrders(_token: string, idList: number[]): Promise<ApiResponse> {
  const data: { id_list: string } = {
    id_list: JSON.stringify(idList),
  };

  return connector.rest.post<ApiResponse, typeof data>(apiRoutes.orders.hideDeletedOrders, data);
}

export async function checkPayOrder(_token: string, order_id: number): Promise<ApiResponse> {
  const data: { order_id: number } = {
    order_id,
  };

  return connector.rest.post<ApiResponse, typeof data>(apiRoutes.orders.checkPayOrder, data);
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
