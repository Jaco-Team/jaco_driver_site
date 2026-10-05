import { useEffect } from 'react';

import { devLog } from '@/shared/lib/devLog';

const SERVICE_WORKER_URL = '/sw.js';
const UPDATE_INTERVAL_MS = 60 * 60 * 1000;
const DISABLED_CACHE_PREFIXES = ['jaco-pages-', 'jaco-assets-', 'jaco-offline-app-'];

// A service worker must not control next dev: cached development chunks and
// navigations conflict with Turbopack HMR and can trigger repeated full reloads.
// Offline behavior is tested with a production build instead.
function isServiceWorkerEnabled(): boolean {
  return process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ENABLE_SW !== '0';
}

export function useServiceWorker(): void {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    if (!isServiceWorkerEnabled()) {
      const unregisterWorkers = navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(
            registrations
              .filter((item) => item.active?.scriptURL.endsWith(SERVICE_WORKER_URL))
              .map((item) => item.unregister())
          )
        );
      const clearRuntimeCaches =
        'caches' in window
          ? caches
              .keys()
              .then((keys) =>
                Promise.all(
                  keys
                    .filter((key) =>
                      DISABLED_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix))
                    )
                    .map((key) => caches.delete(key))
                )
              )
          : Promise.resolve([]);

      void Promise.all([unregisterWorkers, clearRuntimeCaches]).catch(() => undefined);

      return;
    }

    let disposed = false;
    let registration: ServiceWorkerRegistration | null = null;
    let pendingUpdate: Promise<unknown> | null = null;

    const updateWorker = () => {
      if (disposed || navigator.onLine === false || pendingUpdate) return;

      const task = registration
        ? registration.update()
        : navigator.serviceWorker
            .register(SERVICE_WORKER_URL, { scope: '/', updateViaCache: 'none' })
            .then((nextRegistration) => {
              registration = nextRegistration;
            });

      pendingUpdate = task
        .catch((error) => {
          devLog('service_worker_register_failed', 'Service worker update failed', error);
        })
        .finally(() => {
          pendingUpdate = null;
        });
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') updateWorker();
    };

    window.addEventListener('online', updateWorker);
    document.addEventListener('visibilitychange', onVisibilityChange);
    const intervalId = window.setInterval(updateWorker, UPDATE_INTERVAL_MS);
    updateWorker();

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      window.removeEventListener('online', updateWorker);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);
}
