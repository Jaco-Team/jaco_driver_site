import { useEffect } from 'react';
import { useOrdersStore } from '@/entities/order/model/order.store';

export interface UseOrdersAutoRefreshOptions {
  isEnabled?: boolean;
  onError?: (error: Error) => void;
}

export const useOrdersAutoRefresh = (options: UseOrdersAutoRefreshOptions = {}) => {
  const { isEnabled = true, onError } = options;

  const { getOrders, update_interval, is_load } = useOrdersStore((state: any) => ({
    getOrders: state.getOrders,
    update_interval: state.update_interval,
    is_load: state.is_load,
  }));

  useEffect(() => {
    if (!isEnabled) return;

    const intervalTime = (update_interval || 10) * 1000;

    const interval = setInterval(() => {
      if (!is_load) {
        console.log(`Auto-refreshing orders (interval: ${update_interval}s)...`);
        try {
          getOrders(false);
        } catch (error) {
          console.error('Auto-refresh error:', error);
          onError?.(error as Error);
        }
      }
    }, intervalTime);

    return () => {
      console.log('Clearing auto-refresh interval');
      clearInterval(interval);
    };
  }, [getOrders, update_interval, is_load, isEnabled, onError]);
};
