import { beforeEach, describe, expect, it, vi } from 'vitest';

import { hideDelOrders, normalizeOrdersResponse } from './order.api';

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock('@/shared/api/connector', () => ({
  connector: {
    rest: {
      post: mocks.post,
    },
  },
}));

vi.mock('@/shared/api/routes', () => ({
  apiRoutes: {
    orders: {
      hideDeletedOrders: '/api/v1/orders/hide_del_orders',
    },
  },
}));

describe('order api adapter', () => {
  beforeEach(() => {
    mocks.post.mockReset();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 });
  });

  it('sends backend id_list shape when hiding deleted orders', async () => {
    mocks.post.mockResolvedValue({ st: true });

    await hideDelOrders('', [10, 20]);

    expect(mocks.post).toHaveBeenCalledWith('/api/v1/orders/hide_del_orders', {
      id_list: '[10,20]',
    });
  });

  it('normalizes orders response for list and map consumers', () => {
    const normalized = normalizeOrdersResponse({
      orders: [{ id: '7', xy: { latitude: '55.7', longitude: '37.6' }, point_text: 'A1' }],
      arr_del_list: [{ id: '8' }],
      update_interval: 45,
      limit: '1/5',
      limit_count: '2',
      driver_pay: true,
      driver_need_gps: '1' as any,
      home: { latitude: 55.7, longitude: 37.6 },
    });

    expect(normalized.orders).toHaveLength(1);
    expect(normalized.orders[0].id).toBe(7);
    expect(normalized.home?.center).toEqual([55.7, 37.6]);
    expect(normalized.home?.zoom).toBe(12);
    expect(normalized.del_orders[0].id).toBe(8);
    expect(normalized.driver_need_gps).toBe(true);
  });
});
