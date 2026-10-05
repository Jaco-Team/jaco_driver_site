import { useEffect, useRef } from 'react';
import { useOfflineMapStore } from '@/entities/offline-map/model/offlineMap.store';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { useConnectivityStore } from '@/features/offline/model/connectivity.store';
import {
  YANDEX_OFFLINE_MAP_EVENT,
  type OfflineMapDownloadProgress,
} from '@/shared/lib/offline/yandexOfflineMap';

export function useOfflineCityDownloads(): void {
  const pageActive = useRef(true);
  const isOnline = useConnectivityStore((state) => state.isOnline);
  const isAuth = useAuthStore((state) => state.session.isAuth);
  const busyCityId = useOfflineMapStore((state) => state.busyCityId);

  useEffect(() => {
    const store = useOfflineMapStore.getState();
    store.hydrate();
    const onProgress = (event: Event) => {
      store.applyProgress((event as CustomEvent<OfflineMapDownloadProgress>).detail);
    };
    const onPageHide = () => {
      pageActive.current = false;
      store.pauseAll(true);
    };
    const onVisible = () => {
      if (
        pageActive.current &&
        document.visibilityState === 'visible' &&
        useConnectivityStore.getState().isOnline &&
        useAuthStore.getState().session.isAuth === true
      )
        store.resumePending();
    };
    const onPageShow = () => {
      pageActive.current = true;
      onVisible();
    };
    window.addEventListener(YANDEX_OFFLINE_MAP_EVENT, onProgress);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener(YANDEX_OFFLINE_MAP_EVENT, onProgress);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  useEffect(() => {
    const store = useOfflineMapStore.getState();
    if (isAuth === false) store.pauseAll(false);
    else if (!isOnline) store.pauseAll(true);
    else if (pageActive.current && isAuth === true && document.visibilityState === 'visible')
      store.resumePending();
  }, [isOnline, isAuth, busyCityId]);
}
