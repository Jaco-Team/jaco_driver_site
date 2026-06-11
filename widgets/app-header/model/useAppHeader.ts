import { useEffect } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { log } from '@/components/analytics';
import { logoutWeb } from '@/features/auth/api/auth.api';
import { useAuthStore, useSession } from '@/features/auth/model/auth.store';
import { useSettingsStore } from '@/entities/settings';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { useHeaderStore } from '@/features/header/model/header.store';
import { devLog } from '@/shared/lib/devLog';
import type { UseAppHeaderResult } from './useAppHeader.type';

type RouteTitles = Record<string, string>;

export function useAppHeader(routeTitles: RouteTitles): UseAppHeaderResult {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();
  const sessionToken = `${session?.token ?? ''}`.trim();

  const getMySetting = useSettingsStore((state) => state.getMySetting);
  const selectedPointId = useSettingsStore((state) => state.pointId);

  const [
    activePageRU,
    setOpenMenu,
    getStat,
    checkMyPos,
    globalFontSize,
    applySettings,
    getMyAvgTime,
  ] = useHeaderStore((state) => [
    state.activePageRU,
    state.setOpenMenu,
    state.getStat,
    state.checkMyPos,
    state.globalFontSize,
    state.applySettings,
    state.getMyAvgTime,
  ]);

  const [myCurrentLocation, showModalTypeDop, getOrders] = useOrdersStore((state) => [
    state.MyCurrentLocation,
    state.showModalTypeDop,
    state.getOrders,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      window.location.replace(
        `https:${window.location.href.substring(window.location.protocol.length)}`
      );
    }
  }, []);

  useEffect(() => {
    if (session?.isAuth !== true) {
      return;
    }

    void (async () => {
      let pointId: string | number | null | undefined;

      try {
        const settings = await getMySetting(sessionToken);
        applySettings(settings);
        pointId = settings?.point_id;
      } catch (error) {
        devLog('header_settings_load_failed', 'Header settings load failed', error);
      }

      await Promise.allSettled([
        getStat(sessionToken, pointId),
        getMyAvgTime(sessionToken, pointId),
        Promise.resolve(myCurrentLocation()),
      ]);
    })();
  }, [
    applySettings,
    getMyAvgTime,
    getMySetting,
    getStat,
    myCurrentLocation,
    session?.isAuth,
    sessionToken,
  ]);

  useEffect(() => {
    if (session?.isAuth !== true) {
      return;
    }

    void getStat(sessionToken, selectedPointId).catch((error) => {
      devLog('header_point_phones_load_failed', 'Header point phones load failed', error);
    });

    void getMyAvgTime(sessionToken, selectedPointId).catch((error) => {
      devLog('header_avg_time_load_failed', 'Header average time load failed', error);
    });
  }, [getMyAvgTime, getStat, selectedPointId, session?.isAuth, sessionToken]);

  useEffect(() => {
    if (session?.isAuth !== true) {
      return;
    }

    checkMyPos();

    const intervalId = window.setInterval(() => {
      checkMyPos();
      void getMyAvgTime(sessionToken);
    }, 120 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [checkMyPos, getMyAvgTime, session?.isAuth, sessionToken]);

  const handleLogout = () => {
    void logoutWeb().catch((error) => {
      devLog('logout_request_failed', 'Logout request failed', error);
    });

    useAuthStore.getState().setUnauthorized();
    useOrdersStore.setState({ token: '' });
    useHeaderStore.setState({ token: '', phones: null });

    let pushed = false;
    const go = () => {
      if (pushed) {
        return;
      }

      pushed = true;
      router.push('/auth', { scroll: false });
    };

    log('logout', 'Выход из аккаунта', undefined, { callback: go });
    setTimeout(go, 200);
  };

  const pageTitle = activePageRU || routeTitles[pathname] || '';
  const isOrdersActionsVisible = pathname === '/list_orders' || pathname === '/map_orders';

  return {
    pathname,
    pageTitle,
    globalFontSize,
    setOpenMenu,
    showModalTypeDop,
    getOrders,
    isOrdersActionsVisible,
    handleLogout,
  };
}
