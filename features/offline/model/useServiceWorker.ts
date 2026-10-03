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

    let intervalId: number | undefined;

    void navigator.serviceWorker
      .register(SERVICE_WORKER_URL, { scope: '/', updateViaCache: 'none' })
      .then((registration) => {
        intervalId = window.setInterval(() => {
          void registration.update().catch(() => undefined);
        }, UPDATE_INTERVAL_MS);
      })
      .catch((error) => {
        devLog('service_worker_register_failed', 'Service worker registration failed', error);
      });

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);
}
