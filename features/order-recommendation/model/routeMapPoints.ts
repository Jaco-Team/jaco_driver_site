import type { Order } from '@/entities/order/model/order.types';

import type { RecommendationRouteStop } from './orderRecommendation.types';
import { toRecommendationCoordinates } from './recommendationCoordinates';

export interface RouteMapPoint {
  key: string;
  seq: number;
  label: string;
  kind: RecommendationRouteStop['kind'];
  title: string;
  subtitle?: string;
  eta?: string | null;
  coordinates: [number, number];
  orderIds: number[];
  hasStart: boolean;
}

interface WorkingRouteMapPoint extends RouteMapPoint {
  pickupCount: number;
  deliveryCount: number;
  addresses: string[];
  etaStart?: string | null;
  etaEnd?: string | null;
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

function orderCountLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  const ending =
    mod10 === 1 && mod100 !== 11
      ? 'заказ'
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? 'заказа'
        : 'заказов';
  return `${count} ${ending}`;
}

function pointTitle(point: WorkingRouteMapPoint) {
  const parts: string[] = [];

  if (point.hasStart) parts.push('Старт здесь');
  if (point.pickupCount > 0) parts.push(`Забрать ${orderCountLabel(point.pickupCount)} в кафе`);
  if (point.deliveryCount > 0) parts.push(`Доставить ${orderCountLabel(point.deliveryCount)}`);

  return parts.join(' · ') || point.title;
}

function pointSubtitle(addresses: string[]) {
  const unique = [...new Set(addresses.filter(Boolean))];
  if (unique.length === 0) return undefined;
  if (unique.length === 1) return unique[0];
  return `${unique[0]} · ещё адресов: ${unique.length - 1}`;
}

export function buildRouteMapPoints(
  stops: RecommendationRouteStop[],
  orderById: Map<number, Order>
): RouteMapPoint[] {
  const points: WorkingRouteMapPoint[] = [];
  let previousCoordinateKey: string | null = null;

  stops.forEach((stop, index) => {
    const order = stop.id ? orderById.get(stop.id) : undefined;
    const orderCoordinates =
      stop.kind === 'delivery' && order?.xy
        ? toRecommendationCoordinates(
            order.xy.lat ?? order.xy.latitude,
            order.xy.lon ?? order.xy.longitude
          )
        : null;
    const coordinates = orderCoordinates ?? toRecommendationCoordinates(stop.lat, stop.lon);

    if (!coordinates) {
      previousCoordinateKey = null;
      return;
    }

    const seq = index + 1;
    const coordinateKey = `${coordinates.lat.toFixed(6)},${coordinates.lon.toFixed(6)}`;
    const title = routeStopLabel(stop, order);
    const address = stop.kind === 'delivery' ? order?.addr : undefined;
    const previousPoint = points.at(-1);

    if (previousPoint && coordinateKey === previousCoordinateKey) {
      previousPoint.label = `${previousPoint.seq}–${seq}`;
      if (stop.kind === 'delivery' || (stop.kind === 'pickup' && previousPoint.kind === 'start')) {
        previousPoint.kind = stop.kind;
      }
      previousPoint.hasStart ||= stop.kind === 'start';
      previousPoint.pickupCount += stop.kind === 'pickup' ? 1 : 0;
      previousPoint.deliveryCount += stop.kind === 'delivery' ? 1 : 0;
      if (address) previousPoint.addresses.push(address);
      if (stop.id !== null && !previousPoint.orderIds.includes(stop.id)) {
        previousPoint.orderIds.push(stop.id);
      }
      if (stop.eta) previousPoint.etaEnd = stop.eta;
      return;
    }

    points.push({
      key: `${stop.kind}-${stop.id ?? 'start'}-${stop.seq}`,
      seq,
      label: `${seq}`,
      kind: stop.kind,
      title,
      eta: stop.eta,
      coordinates: [coordinates.lat, coordinates.lon],
      orderIds: stop.id === null ? [] : [stop.id],
      hasStart: stop.kind === 'start',
      pickupCount: stop.kind === 'pickup' ? 1 : 0,
      deliveryCount: stop.kind === 'delivery' ? 1 : 0,
      addresses: address ? [address] : [],
      etaStart: stop.eta,
      etaEnd: stop.eta,
    });
    previousCoordinateKey = coordinateKey;
  });

  return points.map(
    ({ hasStart, pickupCount, deliveryCount, addresses, etaStart, etaEnd, ...point }) => ({
      ...point,
      hasStart,
      title: pointTitle({
        ...point,
        hasStart,
        pickupCount,
        deliveryCount,
        addresses,
        etaStart,
        etaEnd,
      }),
      subtitle: pointSubtitle(addresses),
      eta: etaStart && etaEnd && etaStart !== etaEnd ? `${etaStart}–${etaEnd}` : etaStart,
    })
  );
}

export function buildYandexMapsRouteUrl(points: RouteMapPoint[]) {
  if (points.length < 2) return null;

  const rtext = points
    .map((point) => `${point.coordinates[0].toFixed(6)},${point.coordinates[1].toFixed(6)}`)
    .join('~');

  return `https://yandex.ru/maps/?rtext=${rtext}&rtt=auto`;
}
