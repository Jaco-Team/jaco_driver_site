import { describe, expect, it } from 'vitest';

import type { Order } from '@/entities/order/model/order.types';

import type { RecommendationRouteStop } from './orderRecommendation.types';
import { buildRouteMapPoints, buildYandexMapsRouteUrl } from './routeMapPoints';

describe('buildRouteMapPoints', () => {
  it('keeps valid route coordinates', () => {
    const points = buildRouteMapPoints(
      [
        { id: null, kind: 'start', seq: 0, lat: 53.53, lon: 49.31 },
        { id: 10, kind: 'pickup', seq: 1, lat: 53.54, lon: 49.32 },
      ],
      new Map<number, Order>()
    );

    expect(points.map((point) => point.coordinates)).toEqual([
      [53.53, 49.31],
      [53.54, 49.32],
    ]);
    expect(points.map((point) => point.label)).toEqual(['1', '2']);
    expect(buildYandexMapsRouteUrl(points)).toContain(
      'rtext=53.530000,49.310000~53.540000,49.320000'
    );
  });

  it('drops missing, zero and out-of-range coordinates', () => {
    const stops = [
      { id: null, kind: 'start', seq: 0, lat: null, lon: null },
      { id: 10, kind: 'pickup', seq: 1, lat: 0, lon: 0 },
      { id: 10, kind: 'delivery', seq: 2, lat: 91, lon: 181 },
      { id: 11, kind: 'delivery', seq: 3, lat: 53.55, lon: 49.33 },
    ] as unknown as RecommendationRouteStop[];

    const points = buildRouteMapPoints(stops, new Map<number, Order>());

    expect(points).toHaveLength(1);
    expect(points[0].coordinates).toEqual([53.55, 49.33]);
    expect(points[0].label).toBe('4');
    expect(buildYandexMapsRouteUrl(points)).toBeNull();
  });

  it('groups consecutive stops with the same coordinates', () => {
    const stops: RecommendationRouteStop[] = [
      { id: null, kind: 'start', seq: 0, eta: '16:03', lat: 53.53, lon: 49.31 },
      { id: 1, kind: 'pickup', seq: 1, eta: '16:08', lat: 53.53, lon: 49.31 },
      { id: 2, kind: 'pickup', seq: 2, eta: '16:09', lat: 53.53, lon: 49.31 },
      { id: 1, kind: 'delivery', seq: 3, eta: '16:20', lat: 53.54, lon: 49.32 },
      { id: 2, kind: 'delivery', seq: 4, eta: '16:21', lat: 53.55, lon: 49.33 },
      { id: 3, kind: 'delivery', seq: 5, eta: '16:22', lat: 53.55, lon: 49.33 },
    ];

    const orders = new Map<number, Order>([
      [1, { id: 1, addr: 'улица Ленина, 85' } as Order],
      [2, { id: 2, addr: 'улица Победы, 10' } as Order],
      [3, { id: 3, addr: 'улица Победы, 10' } as Order],
    ]);
    const points = buildRouteMapPoints(stops, orders);

    expect(points.map((point) => point.label)).toEqual(['1–3', '4', '5–6']);
    expect(points.map((point) => point.kind)).toEqual(['pickup', 'delivery', 'delivery']);
    expect(points[0].title).toBe('Старт здесь · Забрать 2 заказа в кафе');
    expect(points[0].eta).toBe('16:03–16:09');
    expect(points[1].title).toBe('Доставить 1 заказ');
    expect(points[1].subtitle).toBe('улица Ленина, 85');
    expect(points[2].title).toBe('Доставить 2 заказа');
    expect(points[2].subtitle).toBe('улица Победы, 10');
    expect(points[2].eta).toBe('16:21–16:22');
    expect(buildYandexMapsRouteUrl(points)).toContain(
      'rtext=53.530000,49.310000~53.540000,49.320000~53.550000,49.330000'
    );
  });
});
