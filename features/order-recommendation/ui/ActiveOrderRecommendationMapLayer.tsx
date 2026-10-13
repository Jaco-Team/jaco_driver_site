import { Placemark, Polyline, useYMaps } from '@pbe/react-yandex-maps';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Order } from '@/entities/order/model/order.types';
import {
  appDarkPalette,
  appDarkSuccessPalette,
  appPalette,
  appSuccessPalette,
} from '@/shared/styles/appPalette';

import { useOrderRecommendationStore } from '../model/orderRecommendation.store';
import { buildRouteMapPoints, sortRouteStops, type RouteMapPoint } from '../model/routeMapPoints';

export type RecommendationRouteMapInstance = {
  geoObjects: {
    add: (object: object) => void;
    remove: (object: object) => void;
  };
};

type MultiRouteConstructor = new (
  model: {
    referencePoints: Array<[number, number]>;
    params: { routingMode: string; results: number };
  },
  options: Record<string, unknown>
) => {
  model: {
    events: { add: (event: string, handler: () => void) => void };
  };
};

function routeMarkerIcon(label: string, color: string, isAccepted: boolean) {
  const width = isAccepted ? 22 : 38;
  const height = isAccepted ? 22 : 26;
  const text = isAccepted ? '✓' : label;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${height / 2}" fill="${isAccepted ? color : '#fff'}" stroke="${color}" stroke-width="2"/><text x="${width / 2}" y="${isAccepted ? 15 : 17}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${isAccepted ? 13 : 12}" font-weight="700" fill="${isAccepted ? '#fff' : color}">${text}</text></svg>`;

  return {
    href: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    height,
    width,
  };
}

function ActiveRouteRoadLayer({
  map,
  points,
  routeColor,
  onRouteUnavailable,
}: {
  map: RecommendationRouteMapInstance | null;
  points: RouteMapPoint[];
  routeColor: string;
  onRouteUnavailable: () => void;
}) {
  const yMapsApi = useYMaps(['multiRouter.MultiRoute']) as {
    multiRouter?: { MultiRoute?: MultiRouteConstructor };
  } | null;
  const MultiRoute = yMapsApi?.multiRouter?.MultiRoute;
  const routeKey = points.map((point) => point.coordinates.join(',')).join('|');

  useEffect(() => {
    if (!map || !MultiRoute || points.length < 2) return undefined;

    let route: InstanceType<MultiRouteConstructor>;

    try {
      route = new MultiRoute(
        {
          referencePoints: points.map((point) => point.coordinates),
          params: { routingMode: 'auto', results: 1 },
        },
        {
          boundsAutoApply: true,
          wayPointVisible: false,
          viaPointVisible: false,
          routeActiveStrokeColor: routeColor,
          routeActiveStrokeWidth: 4,
          routeStrokeColor: 'rgba(107, 120, 131, 0.45)',
          routeStrokeWidth: 3,
          routeOpenBalloonOnClick: false,
        }
      );
    } catch {
      onRouteUnavailable();
      return undefined;
    }

    route.model.events.add('requestfail', onRouteUnavailable);
    map.geoObjects.add(route);

    return () => {
      map.geoObjects.remove(route);
    };
  }, [MultiRoute, map, onRouteUnavailable, points, routeColor, routeKey]);

  return null;
}

export function ActiveOrderRecommendationMapLayer({
  map,
  orders,
  isDark,
  orderTypeId,
  mapScale,
}: {
  map: RecommendationRouteMapInstance | null;
  orders: Order[];
  isDark: boolean;
  orderTypeId: number;
  mapScale: string;
}) {
  const result = useOrderRecommendationStore((state) => state.result);
  const isRouteVisible = useOrderRecommendationStore((state) => state.isRouteVisible);
  const resultOrderTypeId = useOrderRecommendationStore((state) => state.orderTypeId);
  const acceptedOrderIds = useOrderRecommendationStore((state) => state.acceptedOrderIds);
  const unavailableOrderIds = useOrderRecommendationStore((state) => state.unavailableOrderIds);
  const orderSnapshots = useOrderRecommendationStore((state) => state.orderSnapshots);
  const [unavailableRouteKey, setUnavailableRouteKey] = useState<string | null>(null);
  const orderById = useMemo(() => {
    const merged = new Map<number, Order>(
      Object.values(orderSnapshots).map((order) => [order.id, order])
    );
    orders.forEach((order) => merged.set(order.id, order));
    return merged;
  }, [orderSnapshots, orders]);
  const unavailableIds = useMemo(() => new Set(unavailableOrderIds), [unavailableOrderIds]);
  const acceptedIds = useMemo(() => new Set(acceptedOrderIds), [acceptedOrderIds]);
  const stops = useMemo(
    () =>
      sortRouteStops(result?.route?.stops).filter(
        (stop) => stop.id === null || !unavailableIds.has(stop.id)
      ),
    [result?.route?.stops, unavailableIds]
  );
  const points = useMemo(() => buildRouteMapPoints(stops, orderById), [orderById, stops]);
  const line = useMemo(() => points.map((point) => point.coordinates), [points]);
  const routeKey = useMemo(
    () => points.map((point) => point.coordinates.join(',')).join('|'),
    [points]
  );
  const routeColor = isDark ? appDarkPalette.aiRoute : appPalette.aiRoute;
  const acceptedColor = isDark ? appDarkSuccessPalette.main : appSuccessPalette.main;
  const numericMapScale = Number(mapScale);
  const markerScale = Number.isFinite(numericMapScale)
    ? Math.min(1.3, Math.max(0.5, numericMapScale))
    : 1;
  const isRouteUnavailable = unavailableRouteKey === routeKey;
  const handleRouteUnavailable = useCallback(() => setUnavailableRouteKey(routeKey), [routeKey]);

  if (!isRouteVisible || resultOrderTypeId !== orderTypeId || points.length === 0) return null;

  return (
    <>
      <ActiveRouteRoadLayer
        map={map}
        points={points}
        routeColor={routeColor}
        onRouteUnavailable={handleRouteUnavailable}
      />

      {isRouteUnavailable && line.length > 1 ? (
        <Polyline
          geometry={line}
          options={{
            strokeColor: routeColor,
            strokeWidth: 4,
            strokeStyle: 'shortdash',
            strokeOpacity: 0.85,
          }}
        />
      ) : null}

      {points.map((point, index) => {
        const isAccepted =
          point.orderIds.length > 0 && point.orderIds.every((orderId) => acceptedIds.has(orderId));
        const icon = routeMarkerIcon(
          point.label,
          isAccepted ? acceptedColor : routeColor,
          isAccepted
        );
        const markerOrder = point.orderIds.map((orderId) => orderById.get(orderId)).find(Boolean);
        const markerCenterOffsetY = point.hasStart
          ? -4
          : point.orderIds.length > 1
            ? -18 + 13 * markerScale
            : markerOrder?.close_time_
              ? -18 + 10 * markerScale
              : -16 + 10 * markerScale;
        return (
          <Placemark
            key={point.key}
            geometry={point.coordinates}
            options={{
              hasBalloon: false,
              hasHint: false,
              iconLayout: 'default#image',
              iconImageHref: icon.href,
              iconImageOffset: isAccepted
                ? [-icon.width / 2, markerCenterOffsetY - icon.height / 2]
                : [-icon.width - 20, markerCenterOffsetY - icon.height / 2],
              iconImageSize: [icon.width, icon.height],
              interactiveZIndex: false,
              interactivityModel: 'default#transparent',
              zIndex: 640 + index,
            }}
          />
        );
      })}
    </>
  );
}
