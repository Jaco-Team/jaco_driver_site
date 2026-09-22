import { useEffect, useRef } from 'react';

import { useOrdersStore } from '@/entities/order/model/order.store';
import { useSettingsStore } from '@/entities/settings';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { useHeaderStore } from '@/features/header/model/header.store';
import { useConnectivityStore } from '@/features/offline/model/connectivity.store';
import { devLog } from '@/shared/lib/devLog';

export function useConnectivityWatch(): boolean {
  const isOnline = useConnectivityStore((state) => state.isOnline);
  const startConnectivityWatch = useConnectivityStore((state) => state.startConnectivityWatch);
  const wasOnlineRef = useRef(isOnline);

  useEffect(() => {
    return startConnectivityWatch();
  }, [startConnectivityWatch]);

  useEffect(() => {
    const wasOnline = wasOnlineRef.current;
    wasOnlineRef.current = isOnline;

    if (!isOnline || wasOnline) {
      return;
    }

    void (async () => {
      const result = await useAuthStore.getState().refreshSession();

      if (result.isAuth !== true && useAuthStore.getState().session.isAuth !== true) {
        return;
      }

      const token = useAuthStore.getState().session.token;
      const pointId = useSettingsStore.getState().pointId;

      try {
        await useSettingsStore.getState().getMySetting(token);
      } catch (error) {
        devLog('offline_settings_resync_failed', 'Settings resync after reconnect failed', error);
      }

      await Promise.allSettled([
        useOrdersStore.getState().getOrders(false),
        useHeaderStore.getState().getStat(token, pointId),
      ]);
    })();
  }, [isOnline]);

  return isOnline;
}
