import { useEffect, useMemo, useRef, useState } from 'react';

import type { HomeLocation } from '@/entities/order/model/order.types';
import type { OrderMapGroup } from '@/entities/order/model/orderMapGroups';
import { sanitizeCssColor } from '@/shared/lib/escapeHtml';
import { devLog } from '@/shared/lib/devLog';
import { getOfflineMapRegionId } from '@/shared/lib/offline/offlineMapRegionId';
import {
  loadOfflineMapRuntime,
  type OfflineMapHandle,
  type OfflineRuntimeGroup,
} from '@/shared/lib/offline/offlineMapRuntime';
import type { MapViewport } from '../model/mapViewport';
import { OrdersMapCompass } from './OrdersMapCompass';
import { OrdersMapRasterFilter } from './OrdersMapRasterFilter';
import { OrdersMapOfflineList } from './OrdersMapOfflineList';

function getErrorText(error: unknown): string {
  devLog('offline_map_open_failed', 'Не удалось открыть офлайн-карту', error);
  return error instanceof Error && error.message
    ? error.message
    : 'Не удалось открыть сохранённую карту.';
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
          pointId: getOfflineMapRegionId(pointId, home),
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
  }, [dark, globalFontSize, home, homeCenter, mapScale, pointId, showZoomControls, theme]);

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
          <OrdersMapOfflineList
            mapError={error}
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
