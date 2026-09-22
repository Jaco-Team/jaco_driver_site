import { describe, expect, it } from 'vitest';

import type { Order } from '@/entities/order/model/order.types';

import { buildOrderRecommendationRequest } from './buildOrderRecommendationRequest';

describe('buildOrderRecommendationRequest', () => {
  it('sends routing data without customer personal data', () => {
    const order: Order = {
      id: 18452,
      id_text: 'Заказ 18452',
      addr: 'Секретный адрес',
      number: '+79990000000',
      comment: 'Позвонить клиенту',
      pd: '2',
      et: '5',
      kv: '18',
      driver_name: 'Иван',
      driver_login: '79991112233',
      drink_list: [{ name: 'Напиток клиента', count: 1 }],
      status_order: '2',
      is_pred: '0',
      is_my: '1',
      time_start_order: '10:25',
      need_time: '11:00',
      to_time: '45 мин',
      sum_order: '2 450,50',
      count_pizza: '2',
      count_pasta: '0',
      count_other: '1',
      count_drink: '1',
      online_pay: '1',
      xy: { latitude: 55.76, longitude: 37.61 },
    };

    const payload = buildOrderRecommendationRequest({
      orders: [order],
      pointId: 12,
      limit: '2 400 / 15 000 ₽',
      limitCount: '1 / 5',
      courier: { lat: 55.75, lon: 37.62 },
      now: new Date('2026-09-21T07:15:00.000Z'),
    });
    const serialized = JSON.stringify(payload);

    expect(payload.orders[0]).toEqual({
      id: 18452,
      status: 2,
      is_preorder: false,
      is_mine: true,
      ready_at: '10:25',
      deliver_by: '11:00',
      remaining_time: '45 мин',
      amount: 2450.5,
      volume: { pizza: 2, pasta: 0, rolls: 1, drinks: 1 },
      payment: 'online',
      xy: { lat: 55.76, lon: 37.61 },
    });
    expect(payload.limits).toMatchObject({
      sum: { current: 2400, max: 15000 },
      count: { current: 1, max: 5 },
    });
    expect(serialized).not.toContain('Секретный адрес');
    expect(serialized).not.toContain('+79990000000');
    expect(serialized).not.toContain('Позвонить клиенту');
    expect(serialized).not.toContain('Напиток клиента');
    expect(serialized).not.toContain('Иван');
    expect(serialized).not.toContain('79991112233');
  });
});
