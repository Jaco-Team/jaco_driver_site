import type { Order } from './order.types';

const MAP_LOCATION_PRECISION = 5;
const DEFAULT_MARKER_COLOR = 'blue';

function getOrderCoordinate(order: Order): [number, number] | null {
  const latitude = Number(order.xy?.latitude);
  const longitude = Number(order.xy?.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return [latitude, longitude];
}

export function getOrderMarkerColor(order: Order, preferDriverColor = false): string {
  const color = preferDriverColor
    ? order.color || order.point_color
    : order.point_color || order.color;

  return typeof color === 'string' && color.trim() ? color.trim() : DEFAULT_MARKER_COLOR;
}

export interface OrderMapGroup {
  key: string;
  coordinate: [number, number];
  representative: Order;
  orders: Order[];
  count: number;
  statusColors: string[];
}

export function getOrderUrgency(order: Order): number {
  const seconds = Number(order.to_time_sec);
  if (Number.isFinite(seconds)) return seconds;

  const minutes = Number(order.to_time_sec_min);
  return Number.isFinite(minutes) ? minutes * 60 : Number.POSITIVE_INFINITY;
}

export function getOrderMapLocationKey(order: Order): string | null {
  const coordinate = getOrderCoordinate(order);

  if (!coordinate) {
    return null;
  }

  return coordinate.map((value) => value.toFixed(MAP_LOCATION_PRECISION)).join(':');
}

export function groupOrdersByMapLocation(
  orders: Order[],
  preferDriverColor = false
): OrderMapGroup[] {
  const groups = new Map<string, OrderMapGroup>();

  for (const order of orders) {
    const key = getOrderMapLocationKey(order);
    const coordinate = getOrderCoordinate(order);

    if (!key || !coordinate) {
      continue;
    }

    const color = getOrderMarkerColor(order, preferDriverColor);
    const existing = groups.get(key);

    if (existing) {
      existing.orders.push(order);
      existing.count += 1;

      if (getOrderUrgency(order) < getOrderUrgency(existing.representative)) {
        existing.representative = order;
      }

      existing.statusColors.push(color);

      continue;
    }

    groups.set(key, {
      key,
      coordinate,
      representative: order,
      orders: [order],
      count: 1,
      statusColors: [color],
    });
  }

  return Array.from(groups.values());
}
