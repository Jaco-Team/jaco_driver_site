// widgets/order/model/useOrdersList.ts
import { useEffect } from 'react';
import { useOrdersStore } from '@/entities/order/model/order.store';

export interface UseOrdersListReturn {
  orders: any[];
  updateInterval: number;
  getOrders: (isReload?: boolean, pointId?: number) => Promise<void>;
}

export const useOrdersList = (): UseOrdersListReturn => {
  const { orders, getOrders, update_interval } = useOrdersStore((state) => ({
    orders: state.orders,
    getOrders: state.getOrders,
    update_interval: state.update_interval,
  }));

  useEffect(() => {
    const interval = setInterval(
      () => {
        getOrders();
      },
      parseInt(String(update_interval)) * 1000
    );

    return () => clearInterval(interval);
  }, [update_interval, getOrders]);

  return {
    orders,
    updateInterval: update_interval,
    getOrders,
  };
};
