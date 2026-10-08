import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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
        drink_list: [],
        id_text: '#866503 В очереди 0%',
        is_delete: 0,
        delete_reason: '',
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

const defaultOrder = { ...mocks.orderState.showOrders[0] };

function renderDrawer(mode: 'light' | 'dark' = 'light') {
  return render(
    <ThemeProvider
      theme={createTheme({
        palette: {
          mode,
          background: {
            paper: mode === 'dark' ? '#18232D' : '#FFFFFF',
          },
        },
      })}
    >
      <OrderMapDrawer />
    </ThemeProvider>
  );
}

describe('OrderMapDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.orderState.isOpenOrderMap = true;
    mocks.orderState.isClick = false;
    mocks.orderState.is_load = false;
    mocks.orderState.showOrders = [{ ...defaultOrder }];
  });

  it('anchors the order card to the bottom of the screen, not the top', () => {
    renderDrawer();

    const drawer = screen.getByTestId('order-map-drawer');
    const paper = screen.getByTestId('order-map-drawer-paper');

    expect(drawer.className).toContain('MuiDrawer-anchorBottom');
    expect(drawer.className).not.toContain('MuiDrawer-anchorTop');
    expect(paper.className).toContain('MuiDrawer-paper');
    expect(paper).toHaveStyle({ top: 'auto', bottom: '0px' });
  });

  it('uses a dark paper background when the app theme is dark', () => {
    renderDrawer('dark');

    expect(screen.getByTestId('order-map-drawer-paper')).toHaveStyle({
      background: '#18232D',
    });
  });

  it.each(['light', 'dark'] as const)('keeps the order inside a framed card in %s mode', (mode) => {
    renderDrawer(mode);

    expect(screen.getByTestId('order-card')).toHaveStyle({
      borderRadius: '16px',
      borderWidth: '1px',
      padding: '16px',
      marginTop: '16px',
    });
  });

  it('shows a spinner over the card while a request is in flight', () => {
    mocks.orderState.is_load = true;

    renderDrawer();

    expect(screen.getByTestId('order-map-drawer-spinner')).toBeInTheDocument();
    expect(screen.getByTestId('order-card-take')).toBeDisabled();
  });

  it('takes an order immediately from the map card', () => {
    renderDrawer();

    fireEvent.click(screen.getByTestId('order-card-take'));

    expect(mocks.orderState.actionGetOrder).toHaveBeenCalledWith(866503, true);
    expect(mocks.orderState.setActiveConfirm).not.toHaveBeenCalled();
  });

  it('shows a compact address group and opens only the selected order', () => {
    const first = {
      ...mocks.orderState.showOrders[0],
      id: 900001,
      id_text: '#900001 В очереди 0%',
      addr: 'улица Ленина, 85',
      pd: '1',
      et: '5',
      kv: '12',
      point_text: '11:51 (48 мин.)',
      point_color: '#22A33A',
      is_delete: 0,
    };
    mocks.orderState.showOrders = [
      first,
      {
        ...first,
        id: 900002,
        id_text: '#900002 Готовится 0%',
        pd: '2',
        et: '3',
        kv: '41',
        point_text: '11:38 (45 мин.)',
        point_color: '#CC0033',
      },
    ];

    renderDrawer();

    expect(screen.getByTestId('order-map-group-title')).toHaveTextContent('2 заказа по адресу');
    expect(screen.getByTestId('order-map-group-address')).toHaveTextContent('улица Ленина, 85');
    expect(screen.queryByTestId('order-card')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('order-map-group-order-900002'));

    expect(screen.getAllByTestId('order-card')).toHaveLength(1);
    expect(screen.getByTestId('order-map-group-back-arrow')).toBeInTheDocument();
    expect(screen.getByTestId('order-map-group-back-label')).toHaveTextContent(
      'Все заказы по адресу (2)'
    );

    fireEvent.click(screen.getByTestId('order-map-group-back'));
    expect(screen.getByTestId('order-map-group-list')).toBeInTheDocument();
    expect(screen.queryByTestId('order-card')).not.toBeInTheDocument();
  });

  it('opens confirm for cancel and finish, not for take', () => {
    mocks.orderState.showOrders = [
      {
        ...mocks.orderState.showOrders[0],
        is_get: 1,
        is_my: 1,
      },
    ];

    renderDrawer();

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

    renderDrawer();

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

    renderDrawer();

    expect(screen.getByTestId('order-map-drawer-paper')).toHaveStyle({
      background: ORDER_CARD_DELETED_BG,
    });
    expect(screen.getByTestId('order-card')).toHaveStyle({
      backgroundColor: ORDER_CARD_DELETED_BG,
    });
  });
});
