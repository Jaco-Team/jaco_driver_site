import type { useHeaderStore } from '@/features/header/model/header.store';
import type { useOrdersStore } from '@/entities/order/model/order.store';

type HeaderState = ReturnType<typeof useHeaderStore.getState>;
type OrdersState = ReturnType<typeof useOrdersStore.getState>;

export interface UseAppHeaderResult {
  pathname: string;
  pageTitle: string;
  globalFontSize: number;
  setOpenMenu: HeaderState['setOpenMenu'];
  showModalTypeDop: OrdersState['showModalTypeDop'];
  getOrders: OrdersState['getOrders'];
  isOrdersActionsVisible: boolean;
  handleLogout: () => void;
}
