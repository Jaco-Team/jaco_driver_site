import { useEffect } from 'react';

import { isConnectivityError } from '@/shared/lib/offline/isConnectivityError';

const RETRY_DELAY_MS = 10_000;

/** Refresh visible server data on reconnect, retrying only temporary request failures. */
export function useRetryOnlineRequest(enabled: boolean, request: () => Promise<unknown>): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    let disposed = false;
    let inFlight = false;
    let retryTimer: number | undefined;

    const run = async () => {
      if (disposed || inFlight || navigator.onLine === false) {
        return;
      }

      inFlight = true;
      try {
        const result = await request();
        if (result === false && !disposed) {
          retryTimer = window.setTimeout(() => void run(), RETRY_DELAY_MS);
        }
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (!disposed && (isConnectivityError(error) || (status != null && status >= 500))) {
          retryTimer = window.setTimeout(() => void run(), RETRY_DELAY_MS);
        }
      } finally {
        inFlight = false;
      }
    };

    const handleOnline = () => {
      window.clearTimeout(retryTimer);
      void run();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('focus', handleOnline);
    void run();

    return () => {
      disposed = true;
      window.clearTimeout(retryTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleOnline);
    };
  }, [enabled, request]);
}
