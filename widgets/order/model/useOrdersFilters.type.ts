import type { useOrdersStore } from '@/entities/order/model/order.store';

type OrdersState = ReturnType<typeof useOrdersStore.getState>;

export interface UseOrdersFiltersReturn {
  type: OrdersState['type'];
  limit: OrdersState['limit'];
  limitCount: OrdersState['limit_count'];
  setOpenMenu: OrdersState['setOpenMenu'];
  showModalTypeDop: OrdersState['showModalTypeDop'];
}
