import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ORDER_CARD_BUTTON_HEIGHT, ORDER_CARD_DELETED_BG, OrderCard } from './OrderCard';

vi.mock('@/components/analytics', () => ({
  log: vi.fn(),
  logTel: vi.fn(),
}));

const openOrder = {
  id: 866503,
  id_text: '#866503 В очереди 0%',
  is_delete: 0,
  is_my: 0,
  is_get: 0,
  status_order: 1,
  online_pay: 0,
  driver_pay: 0,
  addr: 'улица Мурысева, 75',
  pd: '4',
  et: '5',
  kv: '125',
  fake_dom: 1,
  need_time: '18:30 - 19:00',
  time_start_order: '17:50',
  to_time: '01:26',
  comment: 'Иметь сдачу с 5 тыс руб',
  sum_order: 1973,
  sdacha: 0,
  number: '89278993316',
  count_other: 1,
  count_pasta: 0,
  count_pizza: 0,
  count_drink: 0,
};

const myOrder = {
  ...openOrder,
  is_get: 1,
  is_my: 1,
};

function buttonSize(element: HTMLElement) {
  const style = getComputedStyle(element);

  return {
    height: style.height || `${ORDER_CARD_BUTTON_HEIGHT}px`,
    minHeight: style.minHeight || `${ORDER_CARD_BUTTON_HEIGHT}px`,
    maxHeight: style.maxHeight || `${ORDER_CARD_BUTTON_HEIGHT}px`,
  };
}

describe('OrderCard', () => {
  it('keeps phone and take buttons the same size', () => {
    render(<OrderCard item={openOrder} globalFontSize={16} />);

    const phone = screen.getByTestId('order-card-phone');
    const take = screen.getByTestId('order-card-take');

    expect(buttonSize(phone)).toEqual(buttonSize(take));
    expect(buttonSize(take).height).toBe(`${ORDER_CARD_BUTTON_HEIGHT}px`);
    expect(screen.queryByTestId('order-card-phone-duplicate')).not.toBeInTheDocument();
    expect(screen.getAllByText('89278993316')).toHaveLength(1);
  });

  it('keeps my-order action buttons the same height as take', () => {
    const { rerender } = render(<OrderCard item={openOrder} globalFontSize={16} />);
    const takeSize = buttonSize(screen.getByTestId('order-card-take'));

    rerender(<OrderCard item={myOrder} globalFontSize={16} />);

    expect(buttonSize(screen.getByTestId('order-card-cancel'))).toEqual(takeSize);
    expect(buttonSize(screen.getByTestId('order-card-finish'))).toEqual(takeSize);
    expect(buttonSize(screen.getByTestId('order-card-fake'))).toEqual(takeSize);
    expect(screen.getAllByText('89278993316')).toHaveLength(1);
  });

  it('takes an order without opening a confirm dialog from the card', () => {
    const onAction = vi.fn();

    render(<OrderCard item={openOrder} globalFontSize={16} onAction={onAction} />);

    fireEvent.click(screen.getByTestId('order-card-take'));

    expect(onAction).toHaveBeenCalledWith('take', 866503);
  });

  it('blocks repeated action clicks while the request is in flight', () => {
    const onAction = vi.fn();

    render(<OrderCard item={openOrder} globalFontSize={16} actionsDisabled onAction={onAction} />);

    fireEvent.click(screen.getByTestId('order-card-take'));

    expect(onAction).not.toHaveBeenCalled();
    expect(screen.getByTestId('order-card-take')).toBeDisabled();
  });

  it('does not show a comment call button when the comment has no phones', () => {
    render(<OrderCard item={openOrder} globalFontSize={16} />);

    expect(screen.queryByTestId('order-card-comment-call')).not.toBeInTheDocument();
  });

  it('calls the only phone found in the comment', () => {
    render(
      <OrderCard
        item={{ ...openOrder, comment: 'Домофон не работает, звонить 89178206693' }}
        globalFontSize={16}
      />
    );

    const callButton = screen.getByTestId('order-card-comment-call');

    expect(callButton).toHaveAttribute('href', 'tel:+79178206693');
    expect(screen.queryByTestId('order-card-comment-phones-drawer')).not.toBeInTheDocument();
  });

  it('opens a phone list when the comment has several numbers', () => {
    render(
      <OrderCard
        item={{
          ...openOrder,
          comment: 'звоните 89178206693 или 89171112233',
        }}
        globalFontSize={16}
      />
    );

    fireEvent.click(screen.getByTestId('order-card-comment-call'));

    expect(screen.getByTestId('order-card-comment-phones-drawer')).toBeInTheDocument();
    expect(screen.getByTestId('order-card-comment-phone-79178206693')).toHaveAttribute(
      'href',
      'tel:+79178206693'
    );
    expect(screen.getByTestId('order-card-comment-phone-79171112233')).toHaveAttribute(
      'href',
      'tel:+79171112233'
    );
  });

  it('turns the card red when the order is cancelled', () => {
    render(
      <OrderCard
        item={{ ...openOrder, is_delete: 1, delete_reason: 'Клиент отменил' }}
        globalFontSize={16}
      />
    );

    expect(screen.getByTestId('order-card')).toHaveStyle({
      backgroundColor: ORDER_CARD_DELETED_BG,
    });
    expect(screen.getByText('Клиент отменил')).toBeInTheDocument();
  });

  it('keeps a cancelled card red inside the map sheet', () => {
    render(
      <OrderCard
        item={{ ...openOrder, is_delete: 1, delete_reason: 'Клиент отменил' }}
        is_map
        globalFontSize={16}
      />
    );

    expect(screen.getByTestId('order-card')).toHaveStyle({
      backgroundColor: ORDER_CARD_DELETED_BG,
    });
  });
});
