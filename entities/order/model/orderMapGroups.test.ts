import { describe, expect, it } from 'vitest';
import type { Order } from './order.types';
import { getOrderMarkerColor, groupOrdersByMapLocation } from './orderMapGroups';

const order = {
  id: 1,
  point_color: '#b5e737',
  color: '#a9203e',
  xy: { latitude: 53.2, longitude: 50.1 },
} as Order;

describe('order map colors', () => {
  it('uses status color in ordinary order categories', () => {
    expect(getOrderMarkerColor(order)).toBe('#b5e737');
    expect(groupOrdersByMapLocation([order])[0].statusColors).toEqual(['#b5e737']);
  });

  it('uses the courier color in the other-couriers category', () => {
    expect(getOrderMarkerColor(order, true)).toBe('#a9203e');
    expect(groupOrdersByMapLocation([order], true)[0].statusColors).toEqual(['#a9203e']);
  });

  it('uses the most urgent order as the group representative', () => {
    const later = { ...order, id: 1, to_time_sec_min: 45 };
    const urgent = { ...order, id: 2, to_time_sec_min: 20 };

    expect(groupOrdersByMapLocation([later, urgent])[0].representative.id).toBe(2);
  });

  it('keeps one marker color for every order, including repeated colors', () => {
    const second = { ...order, id: 2 };
    const third = { ...order, id: 3, point_color: '#42627d' };

    expect(groupOrdersByMapLocation([order, second, third])[0].statusColors).toEqual([
      '#b5e737',
      '#b5e737',
      '#42627d',
    ]);
  });
});
