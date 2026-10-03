import { useEffect, useMemo, useRef, useState } from 'react';

import type { HomeLocation } from '@/entities/order/model/order.types';
import type { OrderMapGroup } from '@/entities/order/model/orderMapGroups';
import { sanitizeCssColor } from '@/shared/lib/escapeHtml';
import type { MapViewport } from '../model/mapViewport';
import { OrdersMapCompass } from './OrdersMapCompass';
import { OrdersMapRasterFilter } from './OrdersMapRasterFilter';
import { OrdersMapOfflineList } from './OrdersMapOfflineList';

interface OfflineRuntimeGroup {
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

interface OfflineMapHandle {
  destroy: () => void;
  updateGroups: (groups: OfflineRuntimeGroup[]) => void;
  centerOnCoordinate: (coordinate: [number, number]) => void;
}

interface OfflineMapRuntime {
  version?: string;
  mount: (options: {
    container: HTMLElement;
    signal?: AbortSignal;
    pointId?: number | null;
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
    onViewportChange: (viewport: MapViewport) => void;
    onReady: () => void;
    onError: (error: unknown) => void;
  }) => Promise<OfflineMapHandle>;
}

declare global {
  interface Window {
    JacoOfflineOrdersMap?: OfflineMapRuntime;
  }
}

const RUNTIME_SCRIPT_ID = 'jaco-offline-orders-map-runtime';
const RUNTIME_VERSION = '25';
const RUNTIME_SCRIPT_URL = `/offline-map/offline-orders-map.mjs?v=${RUNTIME_VERSION}`;
let runtimePromise: Promise<OfflineMapRuntime> | null = null;

function loadOfflineMapRuntime(): Promise<OfflineMapRuntime> {
  if (window.JacoOfflineOrdersMap?.version === RUNTIME_VERSION) {
    return Promise.resolve(window.JacoOfflineOrdersMap);
  }

  if (runtimePromise) {
    return runtimePromise;
  }

  const loadPromise = new Promise<OfflineMapRuntime>((resolve, reject) => {
    let existing = document.getElementById(RUNTIME_SCRIPT_ID) as HTMLScriptElement | null;

    // `runtimePromise` is the only valid in-flight load. If it is empty, a tag
    // already present in the document belongs to an earlier failed attempt and
    // its `load` event will never fire again.
    if (existing) {
      existing.remove();
      existing = null;
      delete window.JacoOfflineOrdersMap;
    }

    const script = existing ?? document.createElement('script');

    const handleLoad = () => {
      if (window.JacoOfflineOrdersMap?.version === RUNTIME_VERSION) {
        resolve(window.JacoOfflineOrdersMap);
        return;
      }

      reject(new Error('Модуль офлайн-карты загрузился без API.'));
    };

    const handleError = () => reject(new Error('Не удалось загрузить модуль офлайн-карты.'));

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    if (!existing) {
      script.id = RUNTIME_SCRIPT_ID;
      script.type = 'module';
      script.src = RUNTIME_SCRIPT_URL;
      script.dataset.runtimeVersion = RUNTIME_VERSION;
      document.head.append(script);
    }
  }).catch((error) => {
    runtimePromise = null;
    throw error;
  });

  runtimePromise = loadPromise;
  return loadPromise;
}

function getErrorText(error: unknown): string {
  const message =
    error instanceof Error && error.message
      ? error.message
      : 'Не удалось открыть сохранённую карту.';
  const stack = error instanceof Error ? (error.stack ?? '') : '';
  const source = stack.match(/([\w.-]+\.m?js:\d+:\d+)/)?.[1];

  return `${message} · ${source ?? `runtime-v${RUNTIME_VERSION}`}`;
}

interface OrdersOfflineMapProps {
  pointId: number | null;
  groups: OrderMapGroup[];
  home: HomeLocation | null;
  dark: boolean;
  theme: string;
  mapScale: string;
  showZoomControls: boolean;
  typeText: string;
  globalFontSize: number;
  onOpenOrders: (id: number) => void;
  onHomeClick: () => void;
  showCompass?: boolean;
}

export function OrdersOfflineMap({
  pointId,
  groups,
  home,
  dark,
  theme,
  mapScale,
  showZoomControls,
  typeText,
  globalFontSize,
  onOpenOrders,
  onHomeClick,
  showCompass = true,
}: OrdersOfflineMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapHandleRef = useRef<OfflineMapHandle | null>(null);
  const onOpenOrdersRef = useRef(onOpenOrders);
  const onHomeClickRef = useRef(onHomeClick);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState('');
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  const runtimeGroups = useMemo<OfflineRuntimeGroup[]>(
    () =>
      groups.map((group) => ({
        key: group.key,
        coordinate: group.coordinate,
        orderId: group.representative.id,
        idText: group.representative.id_text || `#${group.representative.id}`,
        address: group.representative.addr || '',
        label:
          group.representative.point_text ||
          group.representative.id_text ||
          `#${group.representative.id}`,
        color: sanitizeCssColor(
          group.representative.point_color || group.representative.color || '#CC0033'
        ),
        count: group.count,
        isLocation: Boolean(group.representative.close_time_),
      })),
    [groups]
  );
  const runtimeGroupsRef = useRef(runtimeGroups);
  const homeLatitude = home?.center?.[0];
  const homeLongitude = home?.center?.[1];
  const homeCenter = useMemo<[number, number] | undefined>(
    () =>
      typeof homeLatitude === 'number' &&
      Number.isFinite(homeLatitude) &&
      typeof homeLongitude === 'number' &&
      Number.isFinite(homeLongitude)
        ? [homeLatitude, homeLongitude]
        : undefined,
    [homeLatitude, homeLongitude]
  );

  useEffect(() => {
    onOpenOrdersRef.current = onOpenOrders;
    onHomeClickRef.current = onHomeClick;
  }, [onHomeClick, onOpenOrders]);

  useEffect(() => {
    runtimeGroupsRef.current = runtimeGroups;
    mapHandleRef.current?.updateGroups(runtimeGroups);
  }, [runtimeGroups]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    let cancelled = false;
    let mapHandle: OfflineMapHandle | null = null;
    const abortController = new AbortController();

    setIsReady(false);
    setError('');
    setViewport(null);

    void loadOfflineMapRuntime()
      .then((runtime) =>
        runtime.mount({
          container,
          signal: abortController.signal,
          pointId,
          center: homeCenter,
          zoom: home?.zoom,
          groups: runtimeGroupsRef.current,
          dark,
          theme,
          mapScale,
          globalFontSize,
          showZoomControls,
          onOrderClick: (id) => onOpenOrdersRef.current(id),
          onHomeClick: () => onHomeClickRef.current(),
          onViewportChange: setViewport,
          onReady: () => {
            if (!cancelled) {
              setIsReady(true);
            }
          },
          onError: (runtimeError) => {
            if (!cancelled) {
              setError(getErrorText(runtimeError));
            }
          },
        })
      )
      .then((handle) => {
        if (cancelled) {
          handle.destroy();
          return;
        }

        mapHandle = handle;
        mapHandleRef.current = handle;
        handle.updateGroups(runtimeGroupsRef.current);
      })
      .catch((runtimeError) => {
        if (!cancelled) {
          setError(getErrorText(runtimeError));
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
      if (mapHandleRef.current === mapHandle) {
        mapHandleRef.current = null;
      }
      mapHandle?.destroy();
    };
  }, [dark, globalFontSize, homeCenter, home?.zoom, mapScale, pointId, showZoomControls, theme]);

  const centerOnCoordinate = (coordinate: [number, number]) => {
    mapHandleRef.current?.centerOnCoordinate(coordinate);
  };

  return (
    <div className="orders-offline-map-stage" data-map-theme={dark ? 'dark' : 'light'}>
      {dark ? <OrdersMapRasterFilter /> : null}
      <div
        ref={containerRef}
        className="orders-offline-map-stage__map"
        aria-label="Сохранённая офлайн-карта заказов"
      />

      {showCompass && isReady && !error ? (
        <OrdersMapCompass
          groups={groups}
          viewport={viewport}
          globalFontSize={globalFontSize}
          onCenter={centerOnCoordinate}
        />
      ) : null}

      {!isReady && !error ? (
        <div className="orders-offline-map-status">Открываем сохранённую карту…</div>
      ) : null}

      {error ? (
        <div className="orders-offline-map-stage__fallback">
          <div className="orders-offline-map-error">{error}</div>
          <OrdersMapOfflineList
            groups={groups}
            typeText={typeText}
            globalFontSize={globalFontSize}
            onOpenOrders={onOpenOrders}
          />
        </div>
      ) : null}
    </div>
  );
}
