import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { OrdersHeader } from './OrdersHeader';

vi.mock('./components/OrderStatusModal', () => ({
  OrderStatusModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="order-status-modal" /> : null,
}));

describe('OrdersHeader', () => {
  it('keeps the full status accessible while rendering it in a truncatable container', () => {
    const typeText = 'У других курьеров';

    render(
      <OrdersHeader
        typeText={typeText}
        limit="12500 / 70000"
        limitCount="1 / 6"
        globalFontSize={16}
        onOpenMenu={vi.fn()}
      />
    );

    const button = screen.getByRole('button', {
      name: `Выбрать тип заказов: ${typeText}`,
    });
    const label = button.querySelector('.list__statusText');

    expect(button).toHaveAttribute('title', typeText);
    expect(label).toHaveTextContent(typeText);

    fireEvent.click(button);
    expect(screen.getByTestId('order-status-modal')).toBeInTheDocument();
  });
});
