import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrderMapDrawer } from './OrderMapDrawer';
import { ORDER_CARD_DELETED_BG } from './OrderCard';

const mocks = vi.hoisted(() => ({
  headerState: {
    globalFontSize: 16,
  },
  orderState: {
    isOpenOrderMap: true,
    closeOrderMap: vi.fn(),
    showOrders: [
      {
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
        comment: '',
        sum_order: 1973,
        sdacha: 0,
        number: '89278993316',
        count_other: 1,
        count_pasta: 0,
        count_pizza: 0,
        count_drink: 0,
      },
    ],
    setActiveConfirm: vi.fn(),
    actionGetOrder: vi.fn(),
    actionPayOrder: vi.fn(),
    isClick: false,
    is_load: false,
  },
}));

vi.mock('@/features/header/model/header.store', () => ({
  useHeaderStore: (selector: (state: typeof mocks.headerState) => unknown) =>
    selector(mocks.headerState),
}));

vi.mock('@/entities/order/model/order.store', () => ({
  useOrdersStore: (selector: (state: typeof mocks.orderState) => unknown) =>
    selector(mocks.orderState),
}));

vi.mock('@/shared/config/fonts', () => ({
  roboto: { variable: 'roboto-variable' },
}));

describe('OrderMapDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.orderState.isOpenOrderMap = true;
    mocks.orderState.isClick = false;
    mocks.orderState.is_load = false;
  });

  it('anchors the order card to the bottom of the screen, not the top', () => {
    render(<OrderMapDrawer />);

    const drawer = screen.getByTestId('order-map-drawer');
    const paper = screen.getByTestId('order-map-drawer-paper');

    expect(drawer.className).toContain('MuiDrawer-anchorBottom');
    expect(drawer.className).not.toContain('MuiDrawer-anchorTop');
    expect(paper.className).toContain('MuiDrawer-paper');
    expect(paper).toHaveStyle({ top: 'auto', bottom: '0px' });
  });

  it('shows a spinner over the card while a request is in flight', () => {
    mocks.orderState.is_load = true;

    render(<OrderMapDrawer />);

    expect(screen.getByTestId('order-map-drawer-spinner')).toBeInTheDocument();
    expect(screen.getByTestId('order-card-take')).toBeDisabled();
  });

  it('takes an order immediately from the map card', () => {
    render(<OrderMapDrawer />);

    fireEvent.click(screen.getByTestId('order-card-take'));

    expect(mocks.orderState.actionGetOrder).toHaveBeenCalledWith(866503, true);
    expect(mocks.orderState.setActiveConfirm).not.toHaveBeenCalled();
  });

  it('opens confirm for cancel and finish, not for take', () => {
    mocks.orderState.showOrders = [
      {
        ...mocks.orderState.showOrders[0],
        is_get: 1,
        is_my: 1,
      },
    ];

    render(<OrderMapDrawer />);

    fireEvent.click(screen.getByTestId('order-card-cancel'));
    fireEvent.click(screen.getByTestId('order-card-finish'));

    expect(mocks.orderState.setActiveConfirm).toHaveBeenCalledWith(
      true,
      866503,
      true,
      'cancel',
      null
    );
    expect(mocks.orderState.setActiveConfirm).toHaveBeenCalledWith(
      true,
      866503,
      true,
      'finish',
      null
    );
    expect(mocks.orderState.actionGetOrder).not.toHaveBeenCalled();
  });

  it('does not close the card by the handle while a request is running', () => {
    mocks.orderState.is_load = true;

    render(<OrderMapDrawer />);

    fireEvent.click(screen.getByTestId('order-map-drawer-handle'));

    expect(mocks.orderState.closeOrderMap).not.toHaveBeenCalled();
  });

  it('turns the map sheet red when the order is cancelled', () => {
    mocks.orderState.showOrders = [
      {
        ...mocks.orderState.showOrders[0],
        is_delete: 1,
        delete_reason: 'Клиент отменил',
      },
    ];

    render(<OrderMapDrawer />);

    expect(screen.getByTestId('order-map-drawer-paper')).toHaveStyle({
      background: ORDER_CARD_DELETED_BG,
    });
    expect(screen.getByTestId('order-card')).toHaveStyle({
      backgroundColor: ORDER_CARD_DELETED_BG,
    });
  });
});
