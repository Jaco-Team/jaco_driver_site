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

function pointer(target: HTMLElement, type: string, values: Record<string, number> = {}) {
  // jsdom may not implement PointerEvent; keep the real React pointer handlers.
  const event = new Event(type, { bubbles: true });
  Object.assign(event, {
    pointerId: 1,
    isPrimary: true,
    button: 0,
    clientX: 100,
    clientY: 100,
    ...values,
  });
  fireEvent(target, event);
}

describe('OrderMapDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.headerState.globalFontSize = 16;
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
    expect(drawer.className).not.toContain('MuiSwipeableDrawer');
    expect(paper.className).toContain('MuiDrawer-paper');
    expect(paper).toHaveStyle({
      top: 'auto',
      bottom: '0px',
      height: 'auto',
      maxHeight: '92dvh',
      overflow: 'hidden',
    });
    expect(screen.getByTestId('order-map-drawer-scroll')).toHaveStyle({
      minHeight: '0',
      flex: '0 1 auto',
      overflowY: 'auto',
      overflowX: 'hidden',
      overscrollBehaviorY: 'contain',
      touchAction: 'pan-y',
    });
  });

  it('uses a dark paper background when the app theme is dark', () => {
    renderDrawer('dark');

    expect(screen.getByTestId('order-map-drawer-paper')).toHaveStyle({
      backgroundColor: '#18232D',
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

  it('stacks group timing below the order details for large text', () => {
    mocks.headerState.globalFontSize = 26;
    const first = {
      ...defaultOrder,
      id: 900001,
      addr: 'улица Ленина, 85',
      point_text: '12:13 (48 мин.)',
    };
    mocks.orderState.showOrders = [first, { ...first, id: 900002 }];

    renderDrawer();

    expect(screen.getByTestId('order-map-group-order-900001')).toHaveStyle({
      gridTemplateColumns: 'minmax(0, 1fr)',
      maxWidth: '100%',
      overflow: 'hidden',
    });
  });

  it('keeps a long address group inside the vertical scroll area', () => {
    mocks.headerState.globalFontSize = 26;
    const first = {
      ...defaultOrder,
      id: 900001,
      addr: 'улица Новозаводская, 9',
      point_text: '12:13 (48 мин.)',
    };
    mocks.orderState.showOrders = Array.from({ length: 5 }, (_, index) => ({
      ...first,
      id: first.id + index,
      id_text: `#${first.id + index} Заказ`,
    }));

    renderDrawer();

    expect(screen.getAllByRole('button', { name: /Открыть заказ/ })).toHaveLength(5);
    expect(screen.getByTestId('order-map-drawer-scroll')).toHaveStyle({
      minHeight: '0',
      flex: '0 1 auto',
      overflowY: 'auto',
      touchAction: 'pan-y',
    });
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

    const handle = screen.getByTestId('order-map-drawer-handle');
    expect(handle).toBeDisabled();
    pointer(handle, 'pointerdown');
    pointer(handle, 'pointerup', { clientY: 180 });
    fireEvent.click(handle);

    expect(mocks.orderState.closeOrderMap).not.toHaveBeenCalled();
  });

  it.each(['light', 'dark'] as const)('provides a wide collapse target in %s mode', (mode) => {
    renderDrawer(mode);

    const handle = screen.getByRole('button', { name: 'Свернуть карточку заказа' });
    expect(handle).toHaveStyle({ width: '100%', height: '48px', touchAction: 'none' });
    expect(screen.getByTestId('order-map-drawer-scroll').contains(handle)).toBe(false);
    fireEvent.click(handle);
    expect(mocks.orderState.closeOrderMap).toHaveBeenCalledTimes(1);
  });

  it('closes on a downward header swipe without a second close from click', () => {
    renderDrawer();
    const handle = screen.getByTestId('order-map-drawer-handle');

    pointer(handle, 'pointerdown');
    pointer(handle, 'pointermove', { clientY: 160 });
    pointer(handle, 'pointerup', { clientY: 180 });
    fireEvent.click(handle, { detail: 1 });

    expect(mocks.orderState.closeOrderMap).toHaveBeenCalledTimes(1);
  });

  it.each([
    { clientX: 100, clientY: 120 },
    { clientX: 100, clientY: 20 },
    { clientX: 180, clientY: 160 },
  ])('does not close on a short, upward or sideways drag: %o', (end) => {
    renderDrawer();
    const handle = screen.getByTestId('order-map-drawer-handle');

    pointer(handle, 'pointerdown');
    pointer(handle, 'pointermove', end);
    pointer(handle, 'pointerup', end);
    fireEvent.click(handle, { detail: 1 });

    expect(mocks.orderState.closeOrderMap).not.toHaveBeenCalled();
  });

  it('ignores a cancelled drag and allows the next tap', () => {
    renderDrawer();
    const handle = screen.getByTestId('order-map-drawer-handle');

    pointer(handle, 'pointerdown');
    pointer(handle, 'pointermove', { clientY: 180 });
    pointer(handle, 'pointercancel');
    pointer(handle, 'pointerup', { clientY: 180 });
    fireEvent.click(handle, { detail: 1 });
    expect(mocks.orderState.closeOrderMap).not.toHaveBeenCalled();

    pointer(handle, 'pointerdown');
    pointer(handle, 'pointerup');
    fireEvent.click(handle, { detail: 1 });
    expect(mocks.orderState.closeOrderMap).toHaveBeenCalledTimes(1);
  });

  it('does not treat a swipe inside the card as a collapse gesture', () => {
    renderDrawer();
    const scroll = screen.getByTestId('order-map-drawer-scroll');

    pointer(scroll, 'pointerdown');
    pointer(scroll, 'pointermove', { clientY: 180 });
    pointer(scroll, 'pointerup', { clientY: 180 });

    expect(mocks.orderState.closeOrderMap).not.toHaveBeenCalled();
  });

  it('allows keyboard activation after an unfinished swipe', () => {
    renderDrawer();
    const handle = screen.getByTestId('order-map-drawer-handle');

    pointer(handle, 'pointerdown');
    pointer(handle, 'pointermove', { clientY: 120 });
    pointer(handle, 'pointerup', { clientY: 120 });
    fireEvent.click(handle, { detail: 0 });

    expect(mocks.orderState.closeOrderMap).toHaveBeenCalledTimes(1);
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
      backgroundColor: ORDER_CARD_DELETED_BG,
    });
    expect(screen.getByTestId('order-card')).toHaveStyle({
      backgroundColor: ORDER_CARD_DELETED_BG,
    });
  });
});
