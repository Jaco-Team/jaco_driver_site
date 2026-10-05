import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { isAppOnline, useConnectivityStore } from '@/features/offline/model/connectivity.store';
import { useOfflineMapStore } from '@/entities/offline-map/model/offlineMap.store';
import { getAuthToken } from '@/shared/api/token';
import { devLog } from '@/shared/lib/devLog';
import {
  scheduleOfflineMapDetailSync,
  YANDEX_OFFLINE_MAP_EVENT,
} from '@/shared/lib/offline/yandexOfflineMap';

interface DetailMap {
  getBounds: () => number[][] | null;
  getZoom?: () => number;
  events: {
    add: (event: string, handler: () => void) => void;
    remove: (event: string, handler: () => void) => void;
  };
}

export function useOfflineMapDetails(
  map: DetailMap | null,
  coordinates: readonly (readonly number[])[]
): void {
  const isOnline = useConnectivityStore((state) => state.isOnline);
  const isAuth = useAuthStore((state) => state.session.isAuth);
  const busyCityId = useOfflineMapStore((state) => state.busyCityId);

  useEffect(() => {
    if (!map || !isOnline || isAuth !== true || busyCityId) return;
    let timer: number | undefined;
    const download = () => {
      timer = undefined;
      const token = getAuthToken();
      if (!token || !isAppOnline() || document.visibilityState === 'hidden') return;
      const bounds = map.getBounds();
      void scheduleOfflineMapDetailSync({
        authToken: token,
        coordinates,
        viewport:
          bounds?.length === 2
            ? {
                south: Number(bounds[0][0]),
                west: Number(bounds[0][1]),
                north: Number(bounds[1][0]),
                east: Number(bounds[1][1]),
              }
            : undefined,
        zoom: map.getZoom?.(),
      }).catch((error) =>
        devLog('offline_map_details_error', 'Не удалось сохранить подробный участок карты', error)
      );
    };
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(download, 750);
    };
    const onProgress = (event: Event) => {
      const progress = (event as CustomEvent).detail;
      if (progress?.status === 'ready' && !String(progress.pointId).startsWith('detail:'))
        schedule();
    };
    schedule();
    map.events.add('boundschange', schedule);
    window.addEventListener(YANDEX_OFFLINE_MAP_EVENT, onProgress);
    document.addEventListener('visibilitychange', schedule);
    return () => {
      window.clearTimeout(timer);
      map.events.remove('boundschange', schedule);
      window.removeEventListener(YANDEX_OFFLINE_MAP_EVENT, onProgress);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, [map, coordinates, isOnline, isAuth, busyCityId]);
}
