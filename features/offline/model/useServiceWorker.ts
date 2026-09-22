import { useEffect } from 'react';

import { devLog } from '@/shared/lib/devLog';

const SERVICE_WORKER_URL = '/sw.js';
const UPDATE_INTERVAL_MS = 60 * 60 * 1000;

// The service worker caches hashed build assets, so in dev it would serve stale
// chunks and break HMR. Opt in with NEXT_PUBLIC_ENABLE_SW=1 to test locally.
function isServiceWorkerEnabled(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_SW === '1';
}

export function useServiceWorker(): void {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    if (!isServiceWorkerEnabled()) {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(
            registrations
              .filter((item) => item.active?.scriptURL.endsWith(SERVICE_WORKER_URL))
              .map((item) => item.unregister())
          )
        )
        .catch(() => undefined);

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
