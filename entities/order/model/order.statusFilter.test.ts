import { describe, expect, it } from 'vitest';

import { ORDER_STATUS_TYPES, TYPE_STATUS_MAP, type Order } from './order.types';
import { filterOrdersByTypes, restoreOrderStatusSelection } from './order.utils';

describe('order status filter compatibility', () => {
  it('keeps the existing Собран selection separate from the new assembly option', () => {
    const kitchenReady = { id: 1, status: 'Готов на кухне' } as Order;
    const collected = { id: 2, status: 'Собран' } as Order;

    expect(ORDER_STATUS_TYPES.map((status) => status.text)).toEqual([
      'В очереди',
      'Готовится',
      'На сборке',
      'Собран',
    ]);
    expect(filterOrdersByTypes([kitchenReady, collected], ['4'], TYPE_STATUS_MAP)).toEqual([
      kitchenReady,
    ]);
    expect(filterOrdersByTypes([kitchenReady, collected], ['3'], TYPE_STATUS_MAP)).toEqual([
      collected,
    ]);
  });

  it('restores old all-selected caches as all four options', () => {
    expect(restoreOrderStatusSelection(['3', '1', '2'])).toEqual(['1', '2', '4', '3']);
    expect(restoreOrderStatusSelection()).toEqual(['1', '2', '4', '3']);
  });

  it('preserves saved partial selections', () => {
    expect(restoreOrderStatusSelection(['3'])).toEqual(['3']);
    expect(restoreOrderStatusSelection(['1', '2'])).toEqual(['1', '2']);
    expect(restoreOrderStatusSelection(['4'])).toEqual(['4']);
    expect(restoreOrderStatusSelection(['1', '2', '3'], 2)).toEqual(['1', '2', '3']);
  });
});
