import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

import { log } from '@/components/analytics';

const CHECK_INTERVAL_MS = 15_000;

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

function readNavigatorOnline(): boolean {
  if (typeof navigator === 'undefined') {
    return true;
  }

  return navigator.onLine !== false;
}

export const useConnectivityStore = createWithEqualityFn<ConnectivityStore>(
  (set, get) => ({
    // The server and the first browser render must be identical for hydration.
    // useConnectivityWatch probes navigator immediately after the app mounts.
    isOnline: true,

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
      const isOnline = readNavigatorOnline();
      get().setOnline(isOnline);
      return isOnline;
    },

    startConnectivityWatch: () => {
      if (typeof window === 'undefined') {
        return () => undefined;
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
  useConnectivityStore.getState().setOnline(readNavigatorOnline());
}

export function markAppOnline(): void {
  useConnectivityStore.getState().setOnline(readNavigatorOnline());
}
