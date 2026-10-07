import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { OrderMapGroup } from '@/entities/order/model/orderMapGroups';
import type { Order } from '@/entities/order/model/order.types';
import { OrdersMapOfflineList } from './OrdersMapOfflineList';

vi.mock('@/shared/config/fonts', () => ({ roboto: { variable: 'roboto-test' } }));

describe('OrdersMapOfflineList', () => {
  it('shows the unified empty state when the map and saved orders are unavailable', () => {
    render(
      <OrdersMapOfflineList
        groups={[]}
        typeText="Активные"
        globalFontSize={16}
        onOpenOrders={vi.fn()}
      />
    );

    expect(screen.getByText('Карта недоступна')).toBeInTheDocument();
    expect(screen.getByText('Сохранённых заказов нет.')).toBeInTheDocument();
  });

  it('opens a saved order from the fallback list', () => {
    const onOpenOrders = vi.fn();
    const order: Order = {
      id: 71,
      addr: 'улица Мира, 82',
      id_text: '#71',
      status: 'В пути',
      drink_list: [],
      pd: '',
      et: '',
      kv: '',
      comment: '',
    };
    const groups: OrderMapGroup[] = [
      {
        key: '53.20000:50.10000',
        coordinate: [53.2, 50.1],
        representative: order,
        orders: [order],
        count: 1,
        statusColors: ['#b5e737'],
      },
    ];

    render(
      <OrdersMapOfflineList
        groups={groups}
        typeText="У других курьеров"
        globalFontSize={16}
        onOpenOrders={onOpenOrders}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /улица Мира, 82/ }));
    expect(onOpenOrders).toHaveBeenCalledWith(71);
  });
});
