import { useEffect } from 'react';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { isAppOnline } from '@/features/offline/model/connectivity.store';
import { devLog } from '@/shared/lib/devLog';

// visibilitychange и focus обычно приходят вместе при одном возвращении.
export const ORDERS_RETURN_REFRESH_COALESCE_MS = 1000;

/**
 * Сразу обновляет заказы, когда курьер возвращается на вкладку или разворачивает
 * браузер. Мобильные браузеры останавливают таймер автообновления на скрытой
 * странице, и без этого новые данные (например, уведомление об отменённых
 * заказах) пришли бы только со следующим тиком таймера.
 */
export const useOrdersRefreshOnReturn = (isEnabled = true) => {
  useEffect(() => {
    if (!isEnabled) return undefined;

    let lastRefreshAt = 0;

    const refresh = () => {
      if (document.visibilityState !== 'visible' || !isAppOnline()) return;

      const { getOrders, is_load } = useOrdersStore.getState();
      // Действие с заказом само обновит список после ответа.
      if (is_load) return;

      const now = Date.now();
      if (now - lastRefreshAt < ORDERS_RETURN_REFRESH_COALESCE_MS) return;
      lastRefreshAt = now;

      devLog('orders_return_refresh', 'Refreshing orders after returning to the page');
      void getOrders(false);
    };

    // Обычная загрузка страницы сама запрашивает заказы; нужен только возврат из bfcache.
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) refresh();
    };

    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [isEnabled]);
};
