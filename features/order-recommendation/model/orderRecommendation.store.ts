import { create } from 'zustand';

import type { Order } from '@/entities/order/model/order.types';
import type { SuccessfulOrderActionType } from '@/shared/lib/orderActionEvents';

import type { OrderRecommendationResult } from './orderRecommendation.types';

export type OrderRecommendationSurface = 'list' | 'map';

interface OrderRecommendationState {
  result: OrderRecommendationResult | null;
  signature: string | null;
  orderTypeId: number | null;
  presenter: OrderRecommendationSurface | null;
  isOpen: boolean;
  isLoading: boolean;
  requestVersion: number;
  isRouteVisible: boolean;
  acceptedOrderIds: number[];
  unavailableOrderIds: number[];
  orderSnapshots: Record<number, Order>;
  open: (presenter: OrderRecommendationSurface) => void;
  close: () => void;
  showRoute: () => void;
  hideRoute: () => void;
  reset: () => void;
  cancelPending: () => void;
  applySuccessfulOrderAction: (orderId: number, type: SuccessfulOrderActionType) => void;
  reconcileOrders: (availableOrderIds: number[], myOrderIds: number[]) => void;
  start: () => number;
  succeed: (
    requestVersion: number,
    result: OrderRecommendationResult,
    signature: string,
    presenter: OrderRecommendationSurface,
    orderTypeId: number,
    orders: Order[]
  ) => void;
  finish: (requestVersion: number) => void;
}

export const useOrderRecommendationStore = create<OrderRecommendationState>((set, get) => ({
  result: null,
  signature: null,
  orderTypeId: null,
  presenter: null,
  isOpen: false,
  isLoading: false,
  requestVersion: 0,
  isRouteVisible: false,
  acceptedOrderIds: [],
  unavailableOrderIds: [],
  orderSnapshots: {},
  open: (presenter) => set({ isOpen: true, presenter }),
  close: () => set({ isOpen: false }),
  showRoute: () => set({ isOpen: false, isRouteVisible: true }),
  hideRoute: () => set({ isRouteVisible: false }),
  reset: () =>
    set((state) => ({
      result: null,
      signature: null,
      orderTypeId: null,
      presenter: null,
      isOpen: false,
      isLoading: false,
      isRouteVisible: false,
      acceptedOrderIds: [],
      unavailableOrderIds: [],
      orderSnapshots: {},
      requestVersion: state.requestVersion + 1,
    })),
  cancelPending: () =>
    set((state) =>
      state.isLoading
        ? {
            result: null,
            signature: null,
            orderTypeId: null,
            presenter: null,
            isOpen: false,
            isLoading: false,
            isRouteVisible: false,
            acceptedOrderIds: [],
            unavailableOrderIds: [],
            orderSnapshots: {},
            requestVersion: state.requestVersion + 1,
          }
        : state
    ),
  applySuccessfulOrderAction: (orderId, type) =>
    set((state) => {
      // The request active when Take started was already invalidated by
      // cancelPending. A later Take response must not cancel a newer analysis.
      const recommendedIds = new Set(state.result?.take?.map((item) => item.id) ?? []);
      if (!state.result) return state;

      if (type === 'take' && !recommendedIds.has(orderId)) {
        return {
          result: null,
          signature: null,
          orderTypeId: null,
          presenter: null,
          isOpen: false,
          isLoading: false,
          isRouteVisible: false,
          acceptedOrderIds: [],
          unavailableOrderIds: [],
          orderSnapshots: {},
        };
      }

      if (!recommendedIds.has(orderId)) return state;

      if (type === 'take') {
        return {
          acceptedOrderIds: [...new Set([...state.acceptedOrderIds, orderId])],
          unavailableOrderIds: state.unavailableOrderIds.filter((id) => id !== orderId),
        };
      }

      return {
        acceptedOrderIds: state.acceptedOrderIds.filter((id) => id !== orderId),
        unavailableOrderIds: [...new Set([...state.unavailableOrderIds, orderId])],
      };
    }),
  reconcileOrders: (availableOrderIds, myOrderIds) =>
    set((state) => {
      if (!state.result) return state;

      const recommendedIds = state.result.take?.map((item) => item.id) ?? [];
      const available = new Set(availableOrderIds);
      const mine = new Set(myOrderIds);
      const accepted = new Set(state.acceptedOrderIds);
      recommendedIds.forEach((id) => {
        if (mine.has(id)) accepted.add(id);
      });
      const unavailable = new Set(state.unavailableOrderIds);
      recommendedIds.forEach((id) => {
        if (!available.has(id) && !accepted.has(id)) unavailable.add(id);
      });

      if (recommendedIds.length > 0 && recommendedIds.every((id) => unavailable.has(id))) {
        return {
          result: null,
          signature: null,
          orderTypeId: null,
          presenter: null,
          isOpen: false,
          isLoading: false,
          isRouteVisible: false,
          acceptedOrderIds: [],
          unavailableOrderIds: [],
          orderSnapshots: {},
        };
      }

      return {
        acceptedOrderIds: [...accepted],
        unavailableOrderIds: [...unavailable],
      };
    }),
  start: () => {
    const requestVersion = get().requestVersion + 1;
    set({ requestVersion, isLoading: true, isRouteVisible: false });
    return requestVersion;
  },
  succeed: (requestVersion, result, signature, presenter, orderTypeId, orders) =>
    set((state) =>
      state.requestVersion === requestVersion
        ? {
            result,
            signature,
            orderTypeId,
            presenter,
            isOpen: false,
            isRouteVisible: true,
            acceptedOrderIds: [],
            unavailableOrderIds: [],
            orderSnapshots: Object.fromEntries(orders.map((order) => [order.id, order])),
          }
        : state
    ),
  finish: (requestVersion) =>
    set((state) => (state.requestVersion === requestVersion ? { isLoading: false } : state)),
}));
