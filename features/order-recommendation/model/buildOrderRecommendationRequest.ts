import type { Order } from '@/entities/order/model/order.types';

import type {
  OrderRecommendationRequest,
  RecommendationCoordinates,
  RecommendationLimit,
} from './orderRecommendation.types';

function toInteger(value: unknown): number {
  const parsed = parseInt(String(value ?? 0), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toBooleanFlag(value: unknown): boolean {
  return toInteger(value) === 1;
}

function toCoordinates(
  latitude: unknown,
  longitude: unknown
): RecommendationCoordinates | null {
  const lat = Number(latitude);
  const lon = Number(longitude);

  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
}

function toLimit(value: string): RecommendationLimit {
  const numbers = value.match(/\d[\d\s]*/g)?.map((item) => Number(item.replace(/\s/g, ''))) ?? [];

  if (numbers.length >= 2) {
    return {
      current: numbers[0],
      max: numbers[numbers.length - 1],
      raw: value,
    };
  }

  return {
    current: null,
    max: numbers[0] ?? null,
    raw: value,
  };
}

function toNullableText(value: unknown): string | null {
  const normalized = String(value ?? '').trim();
  return normalized || null;
}

function toNullableNumber(value: unknown): number | null {
  const normalized = String(value ?? '')
    .replace(/\s/g, '')
    .replace(',', '.');
  const parsed = Number(normalized);
  return normalized && Number.isFinite(parsed) ? parsed : null;
}

export function buildOrderRecommendationRequest({
  orders,
  pointId,
  limit,
  limitCount,
  courier,
  now = new Date(),
}: {
  orders: Order[];
  pointId: number | null;
  limit: string;
  limitCount: string;
  courier: RecommendationCoordinates | null;
  now?: Date;
}): OrderRecommendationRequest {
  return {
    now: now.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Moscow',
    point_id: pointId !== null && Number.isFinite(pointId) ? pointId : null,
    courier,
    limits: {
      sum: toLimit(limit),
      count: toLimit(limitCount),
    },
    orders: orders.map((order) => ({
      id: order.id,
      status: toInteger(order.status_order),
      is_preorder: toBooleanFlag(order.is_pred),
      is_mine: toBooleanFlag(order.is_my),
      ready_at: toNullableText(order.time_start_order ?? order.time_start_mini),
      deliver_by: toNullableText(order.need_time ?? order.close_time_),
      remaining_time: toNullableText(order.to_time),
      amount: toNullableNumber(order.sum_order),
      volume: {
        pizza: toInteger(order.count_pizza),
        pasta: toInteger(order.count_pasta),
        rolls: toInteger(order.count_other),
        drinks: toInteger(order.count_drink),
      },
      payment:
        order.online_pay === undefined || order.online_pay === null
          ? 'unknown'
          : toBooleanFlag(order.online_pay)
            ? 'online'
            : 'cash',
      xy: toCoordinates(order.xy?.latitude ?? order.xy?.lat, order.xy?.longitude ?? order.xy?.lon),
    })),
  };
}
