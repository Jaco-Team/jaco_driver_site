import { beforeEach, describe, expect, it } from 'vitest';

import type { Order } from '@/entities/order/model/order.types';

import type { OrderRecommendationResult } from './orderRecommendation.types';
import { useOrderRecommendationStore } from './orderRecommendation.store';

const recommendation: OrderRecommendationResult = {
  st: true,
  take: [
    { id: 1, seq: 1, reason: 'Первый' },
    { id: 2, seq: 2, reason: 'Второй' },
  ],
  route: {
    stops: [
      { id: 1, kind: 'pickup', seq: 1 },
      { id: 2, kind: 'pickup', seq: 2 },
    ],
  },
};

const orders = [{ id: 1, id_text: '#1' } as Order, { id: 2, id_text: '#2' } as Order];

describe('orderRecommendation.store', () => {
  beforeEach(() => {
    const store = useOrderRecommendationStore.getState();
    store.reset();
    const requestVersion = useOrderRecommendationStore.getState().start();
    useOrderRecommendationStore
      .getState()
      .succeed(requestVersion, recommendation, 'signature', 'map', 1, orders);
    useOrderRecommendationStore.getState().finish(requestVersion);
  });

  it('keeps the recommendation after taking a recommended order', () => {
    useOrderRecommendationStore.getState().applySuccessfulOrderAction(1, 'take');

    expect(useOrderRecommendationStore.getState()).toMatchObject({
      result: recommendation,
      isRouteVisible: true,
      acceptedOrderIds: [1],
    });
  });

  it('marks only the missing order unavailable and keeps accepted orders', () => {
    useOrderRecommendationStore.getState().applySuccessfulOrderAction(1, 'take');
    useOrderRecommendationStore.getState().reconcileOrders([], [1]);

    expect(useOrderRecommendationStore.getState()).toMatchObject({
      result: recommendation,
      acceptedOrderIds: [1],
      unavailableOrderIds: [2],
    });
  });

  it('resets the recommendation after taking an unrelated order', () => {
    useOrderRecommendationStore.getState().applySuccessfulOrderAction(99, 'take');

    expect(useOrderRecommendationStore.getState()).toMatchObject({
      result: null,
      isRouteVisible: false,
      orderSnapshots: {},
    });
  });

  it('ignores a recommendation response cancelled by taking an order', () => {
    useOrderRecommendationStore.getState().reset();
    const requestVersion = useOrderRecommendationStore.getState().start();

    useOrderRecommendationStore.getState().cancelPending();
    useOrderRecommendationStore
      .getState()
      .succeed(requestVersion, recommendation, 'stale-signature', 'map', 1, orders);
    useOrderRecommendationStore.getState().finish(requestVersion);

    expect(useOrderRecommendationStore.getState()).toMatchObject({
      isLoading: false,
      result: null,
      isRouteVisible: false,
    });
  });

  it('does not cancel a newer analysis when an earlier take finishes late', () => {
    useOrderRecommendationStore.getState().reset();
    useOrderRecommendationStore.getState().start();
    useOrderRecommendationStore.getState().cancelPending();

    const requestVersion = useOrderRecommendationStore.getState().start();
    useOrderRecommendationStore.getState().applySuccessfulOrderAction(1, 'take');

    expect(useOrderRecommendationStore.getState()).toMatchObject({
      isLoading: true,
      requestVersion,
    });

    useOrderRecommendationStore
      .getState()
      .succeed(requestVersion, recommendation, 'next-signature', 'map', 1, orders);
    useOrderRecommendationStore.getState().finish(requestVersion);

    expect(useOrderRecommendationStore.getState()).toMatchObject({
      result: recommendation,
      isRouteVisible: true,
    });
  });
});
