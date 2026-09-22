import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

import { log } from '@/components/analytics';
import { http } from '@/shared/api/connector';
import { apiRoutes } from '@/shared/api/routes';
import { isConnectivityError } from '@/shared/lib/offline/isConnectivityError';

const CHECK_INTERVAL_MS = 15_000;
const CHECK_TIMEOUT_MS = 5_000;

interface ConnectivityState {
  isOnline: boolean;
}

interface ConnectivityActions {
  setOnline: (isOnline: boolean) => void;
  probeConnectivity: () => Promise<boolean>;
  startConnectivityWatch: () => () => void;
}

type ConnectivityStore = ConnectivityState & ConnectivityActions;

let watchStarted = false;
let interceptorBound = false;
let probeInFlight: Promise<boolean> | null = null;

function readNavigatorOnline(): boolean {
  if (typeof navigator === 'undefined') {
    return true;
  }

  return navigator.onLine !== false;
}

export const useConnectivityStore = createWithEqualityFn<ConnectivityStore>(
  (set, get) => ({
    isOnline: readNavigatorOnline(),

    setOnline: (isOnline) => {
      if (get().isOnline === isOnline) {
        return;
      }

      set({ isOnline });
      log(
        isOnline ? 'connectivity_online' : 'connectivity_offline',
        isOnline ? 'Интернет восстановлен' : 'Нет интернета'
      );
    },

    probeConnectivity: async () => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        get().setOnline(false);
        return false;
      }

      if (probeInFlight) {
        return probeInFlight;
      }

      probeInFlight = (async () => {
        try {
          await http.get(apiRoutes.auth.me, {
            timeout: CHECK_TIMEOUT_MS,
            validateStatus: () => true,
          });
          get().setOnline(true);
          return true;
        } catch (error) {
          if (isConnectivityError(error)) {
            get().setOnline(false);
            return false;
          }

          get().setOnline(true);
          return true;
        } finally {
          probeInFlight = null;
        }
      })();

      return probeInFlight;
    },

    startConnectivityWatch: () => {
      if (typeof window === 'undefined') {
        return () => undefined;
      }

      if (!interceptorBound) {
        interceptorBound = true;

        http.interceptors.response.use(
          (response) => {
            get().setOnline(true);
            return response;
          },
          (error) => {
            if (isConnectivityError(error)) {
              get().setOnline(false);
            }

            return Promise.reject(error);
          }
        );
      }

      if (watchStarted) {
        return () => undefined;
      }

      watchStarted = true;

      const handleOnline = () => {
        void get().probeConnectivity();
      };
      const handleOffline = () => {
        get().setOnline(false);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      void get().probeConnectivity();

      const intervalId = window.setInterval(() => {
        void get().probeConnectivity();
      }, CHECK_INTERVAL_MS);

      return () => {
        watchStarted = false;
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.clearInterval(intervalId);
      };
    },
  }),
  shallow
);

export function isAppOnline(): boolean {
  return useConnectivityStore.getState().isOnline;
}

export function markAppOffline(): void {
  useConnectivityStore.getState().setOnline(false);
}

export function markAppOnline(): void {
  useConnectivityStore.getState().setOnline(true);
}
