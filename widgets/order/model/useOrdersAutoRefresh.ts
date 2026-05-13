import { useEffect } from 'react';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { devLog } from '@/shared/lib/devLog';
import type { UseOrdersAutoRefreshOptions } from './useOrdersAutoRefresh.type';

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
        devLog('orders_auto_refresh', 'Auto-refreshing orders', update_interval);
        try {
          getOrders(false);
        } catch (error) {
          devLog('orders_auto_refresh_error', 'Auto-refresh error', error);
          onError?.(error as Error);
        }
      }
    }, intervalTime);

    return () => {
      devLog('orders_auto_refresh_clear', 'Clearing auto-refresh interval');
      clearInterval(interval);
    };
  }, [getOrders, update_interval, is_load, isEnabled, onError]);
};
