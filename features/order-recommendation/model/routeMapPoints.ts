import type { Order } from '@/entities/order/model/order.types';

import type { RecommendationRouteStop } from './orderRecommendation.types';

export interface RouteMapPoint {
  key: string;
  seq: number;
  kind: RecommendationRouteStop['kind'];
  title: string;
  eta?: string | null;
  coordinates: [number, number];
}

export function routeStopLabel(stop: RecommendationRouteStop, order?: Order) {
  if (stop.kind === 'start') return 'Текущее местоположение';

  const action = stop.kind === 'pickup' ? 'Забрать' : 'Доставить';
  const orderLabel = order?.id_text || `№${stop.id}`;
  const address = stop.kind === 'delivery' && order?.addr ? ` · ${order.addr}` : '';
  return `${action} ${orderLabel}${address}`;
}

export function sortRouteStops(stops?: RecommendationRouteStop[] | null) {
  return (stops ?? []).slice().sort((a, b) => a.seq - b.seq);
}

export function buildRouteMapPoints(
  stops: RecommendationRouteStop[],
  orderById: Map<number, Order>
): RouteMapPoint[] {
  const points: RouteMapPoint[] = [];

  stops.forEach((stop, index) => {
    const lat = Number(stop.lat);
    const lon = Number(stop.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

    points.push({
      key: `${stop.kind}-${stop.id ?? 'start'}-${stop.seq}`,
      seq: index + 1,
      kind: stop.kind,
      title: routeStopLabel(stop, stop.id ? orderById.get(stop.id) : undefined),
      eta: stop.eta,
      coordinates: [lat, lon],
    });
  });

  return points;
}

export function buildYandexMapsRouteUrl(points: RouteMapPoint[]) {
  if (points.length < 2) return null;

  const rtext = points
    .map((point) => `${point.coordinates[0].toFixed(6)},${point.coordinates[1].toFixed(6)}`)
    .join('~');

  return `https://yandex.ru/maps/?rtext=${rtext}&rtt=auto`;
}
