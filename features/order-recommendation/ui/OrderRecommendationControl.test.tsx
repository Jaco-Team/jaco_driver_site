import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Order } from '@/entities/order/model/order.types';
import { useOrderRecommendationStore } from '../model/orderRecommendation.store';
import type { OrderRecommendationResult } from '../model/orderRecommendation.types';
import { OrderRecommendationControl } from './OrderRecommendationControl';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  push: vi.fn(),
  orders: {
    sourceOrders: [] as Order[],
    ordersByContext: {} as Record<string, Order[]>,
    types_dop: [{ id: 1 }, { id: 2 }, { id: 4 }, { id: 3 }],
    type_dop: ['3'],
    setTypeDop: vi.fn(),
    showModalTypeDop: vi.fn(),
  },
}));

vi.mock('next/router', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('@/entities/order/model/order.store', () => ({
  useOrdersStore: Object.assign(
    (selector: (state: typeof mocks.orders) => unknown) => selector(mocks.orders),
    { getState: () => mocks.orders }
  ),
}));
vi.mock('@/entities/settings', () => ({
  useSettingsStore: (selector: (state: unknown) => unknown) =>
    selector({ settings: { ai_recommend: 1 } }),
  normalizeBooleanSetting: (value: unknown) => Number(value) === 1,
}));
vi.mock('@/features/offline/model/connectivity.store', () => ({
  useConnectivityStore: (selector: (state: { isOnline: boolean }) => unknown) =>
    selector({ isOnline: true }),
}));
vi.mock('@/shared/lib/geolocation', () => ({
  readDriverPosition: vi.fn().mockResolvedValue({ latitude: 53.5, longitude: 49.4 }),
}));
vi.mock('@/components/analytics', () => ({ log: vi.fn() }));
vi.mock('@/shared/api/errors', () => ({
  getApiErrorInfo: () => ({ status: 500, message: 'Ошибка сервера' }),
}));
vi.mock('../api/orderRecommendation.api', () => ({ requestOrderRecommendation: mocks.request }));
vi.mock('./OrderRecommendationDrawer', () => ({ OrderRecommendationDrawer: () => null }));
vi.mock('./NoSuitableOrdersDrawer', () => ({ NoSuitableOrdersDrawer: () => null }));
vi.mock('@/shared/ui/SnackbarNotification/SnackbarNotification', () => ({
  SnackbarNotification: () => null,
}));

const recommendation: OrderRecommendationResult = {
  st: true,
  take: [{ id: 1, seq: 1, reason: 'Подходит' }],
};

function renderControl(filteredOrders: Order[]) {
  return render(
    <OrderRecommendationControl
      orders={filteredOrders}
      pointId={12}
      limit="0 / 70000"
      limitCount="0 / 6"
      globalFontSize={16}
      orderTypeId={1}
      surface="map"
    />
  );
}

describe('AI selection with an active status filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useOrderRecommendationStore.getState().reset();
    mocks.orders.sourceOrders = [
      { id: 1, status: 'В очереди', status_order: 1 },
      { id: 2, status: 'Готов на кухне', status_order: 3 },
      { id: 3, status: 'Собран', status_order: 4 },
    ] as Order[];
    mocks.orders.ordersByContext = { '12:1': mocks.orders.sourceOrders };
    mocks.orders.type_dop = ['3'];
    mocks.orders.setTypeDop.mockImplementation((selection: string[]) => {
      mocks.orders.type_dop = selection;
    });
    mocks.request.mockReset().mockResolvedValue(recommendation);
  });

  it('clears the filter and sends every active order, rather than the filtered render snapshot', async () => {
    let resolveResponse!: (result: OrderRecommendationResult) => void;
    mocks.request.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveResponse = resolve;
      })
    );
    renderControl([mocks.orders.sourceOrders[2]]);

    fireEvent.click(screen.getByRole('button', { name: 'Помочь с выбором' }));
    await waitFor(() => expect(mocks.request).toHaveBeenCalledTimes(1));
    expect(mocks.orders.setTypeDop).toHaveBeenCalledWith(['1', '2', '4', '3']);
    expect(mocks.orders.showModalTypeDop).toHaveBeenCalledWith(false);
    expect(mocks.request.mock.calls[0][0].orders.map((order: { id: number }) => order.id)).toEqual([
      1, 2, 3,
    ]);
    expect(useOrderRecommendationStore.getState().isLoading).toBe(true);

    await act(async () => {
      resolveResponse(recommendation);
    });
    await waitFor(() => expect(useOrderRecommendationStore.getState().isLoading).toBe(false));
    expect(Object.keys(useOrderRecommendationStore.getState().orderSnapshots)).toEqual([
      '1',
      '2',
      '3',
    ]);
  });

  it.each(['empty', 'error'])(
    'remains usable when the filter hides all orders and the outcome is %s',
    async (outcome) => {
      if (outcome === 'empty')
        mocks.request.mockResolvedValueOnce({ st: true, code: 'no_suitable_orders', take: [] });
      else mocks.request.mockRejectedValueOnce(new Error('Ошибка сервера'));
      renderControl([]);

      fireEvent.click(screen.getByRole('button', { name: 'Помочь с выбором' }));
      await waitFor(() => expect(mocks.request).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(useOrderRecommendationStore.getState().isLoading).toBe(false));

      expect(mocks.orders.type_dop).toEqual(['1', '2', '4', '3']);
      expect(useOrderRecommendationStore.getState().result).toBeNull();
      expect(screen.getByRole('button', { name: 'Помочь с выбором' })).toBeEnabled();
    }
  );

  it('opens existing details without starting a new analysis or changing the filter', () => {
    const store = useOrderRecommendationStore.getState();
    const version = store.start();
    store.succeed(version, recommendation, 'signature', 'map', 1, mocks.orders.sourceOrders);
    store.finish(version);
    renderControl([mocks.orders.sourceOrders[2]]);

    fireEvent.click(screen.getByRole('button', { name: 'Подробнее' }));

    expect(mocks.request).not.toHaveBeenCalled();
    expect(mocks.orders.setTypeDop).not.toHaveBeenCalled();
    expect(useOrderRecommendationStore.getState().isOpen).toBe(true);
  });
});
