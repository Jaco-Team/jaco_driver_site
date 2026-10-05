export interface OfflineRuntimeGroup {
  key: string;
  coordinate: [number, number];
  orderId: number;
  idText: string;
  address: string;
  label: string;
  color: string;
  count: number;
  isLocation: boolean;
}

export interface OfflineMapHandle {
  destroy: () => void;
  updateGroups: (groups: OfflineRuntimeGroup[]) => void;
  centerOnCoordinate: (coordinate: [number, number]) => void;
}

export interface OfflineMapRuntime {
  version?: string;
  mount: (options: {
    container: HTMLElement;
    signal?: AbortSignal;
    pointId?: number | string | null;
    center?: [number, number];
    zoom?: number;
    groups: OfflineRuntimeGroup[];
    dark: boolean;
    theme: string;
    mapScale: string;
    globalFontSize: number;
    showZoomControls: boolean;
    onOrderClick: (id: number) => void;
    onHomeClick: () => void;
    onViewportChange: (viewport: {
      bounds: [[number, number], [number, number]];
      center: [number, number];
    }) => void;
    onReady: () => void;
    onError: (error: unknown) => void;
  }) => Promise<OfflineMapHandle>;
}

declare global {
  interface Window {
    JacoOfflineOrdersMap?: OfflineMapRuntime;
  }
}

export const OFFLINE_MAP_RUNTIME_VERSION = '27';
export const OFFLINE_MAP_RUNTIME_URL = `/offline-map/offline-orders-map.mjs?v=${OFFLINE_MAP_RUNTIME_VERSION}`;
const SCRIPT_ID = 'jaco-offline-orders-map-runtime';
let runtimePromise: Promise<OfflineMapRuntime> | null = null;

export function loadOfflineMapRuntime(): Promise<OfflineMapRuntime> {
  if (window.JacoOfflineOrdersMap?.version === OFFLINE_MAP_RUNTIME_VERSION) {
    return Promise.resolve(window.JacoOfflineOrdersMap);
  }
  if (runtimePromise) return runtimePromise;

  runtimePromise = new Promise<OfflineMapRuntime>((resolve, reject) => {
    document.getElementById(SCRIPT_ID)?.remove();
    const script = document.createElement('script');
    const cleanup = () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
    const handleLoad = () => {
      cleanup();
      if (window.JacoOfflineOrdersMap?.version === OFFLINE_MAP_RUNTIME_VERSION) {
        resolve(window.JacoOfflineOrdersMap);
      } else {
        reject(new Error('Модуль офлайн-карты загрузился без API.'));
      }
    };
    const handleError = () => {
      cleanup();
      reject(new Error('Не удалось загрузить модуль офлайн-карты. Откройте карту с интернетом.'));
    };

    script.id = SCRIPT_ID;
    script.type = 'module';
    script.src = OFFLINE_MAP_RUNTIME_URL;
    script.dataset.runtimeVersion = OFFLINE_MAP_RUNTIME_VERSION;
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    document.head.append(script);
  }).finally(() => {
    runtimePromise = null;
  });

  return runtimePromise;
}
