import type { useOrdersStore } from '@/entities/order/model/order.store';

type OrdersState = ReturnType<typeof useOrdersStore.getState>;

export interface UseOrdersListReturn {
  orders: OrdersState['orders'];
  updateInterval: OrdersState['update_interval'];
  getOrders: OrdersState['getOrders'];
}
