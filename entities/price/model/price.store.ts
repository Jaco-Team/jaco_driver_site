import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { fetchPriceBetween } from '@/entities/price/api/price.api';
import type { PriceGiveHistoryRow, PriceStat } from '@/entities/price/api/price.api';
import { useSettingsStore } from '@/entities/settings';
import { isAppOnline } from '@/features/offline/model/connectivity.store';

interface PriceState {
  statPrice: PriceStat | null;
  give_hist: PriceGiveHistoryRow[];
  isStatLoading: boolean;
}

interface PriceActions {
  getStatBetween: (dateStart: string, dateEnd: string, pointId?: number | null) => Promise<void>;
}

type PriceStore = PriceState & PriceActions;

const priceBetweenRequests = new Map<
  string,
  Promise<Awaited<ReturnType<typeof fetchPriceBetween>>>
>();
let latestPriceRequestKey = '';
let latestPriceRequestId = 0;

function normalizePointId(value?: number | null): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  return Number.isFinite(value) && value > 0 ? value : null;
}

export const usePriceStore = createWithEqualityFn<PriceStore>(
  (set) => ({
    statPrice: null,
    give_hist: [],
    isStatLoading: false,

    getStatBetween: async (dateStart, dateEnd, pointId) => {
      if (!isAppOnline()) return;
      const selectedPointId = normalizePointId(pointId ?? useSettingsStore.getState().pointId);
      const requestKey = `${dateStart}:${dateEnd}:${selectedPointId ?? 'all'}`;
      latestPriceRequestKey = requestKey;
      const requestId = ++latestPriceRequestId;
      set({ isStatLoading: true });
      let request = priceBetweenRequests.get(requestKey);

      if (!request) {
        request = fetchPriceBetween(dateStart, dateEnd, selectedPointId).finally(() => {
          priceBetweenRequests.delete(requestKey);
        });
        priceBetweenRequests.set(requestKey, request);
      }

      try {
        const json = await request;

        if (
          latestPriceRequestKey !== requestKey ||
          requestId !== latestPriceRequestId ||
          !isAppOnline()
        ) {
          return;
        }

        set({
          statPrice: json?.stat ?? null,
          give_hist: Array.isArray(json?.give_hist) ? json.give_hist : [],
        });
      } finally {
        if (requestId === latestPriceRequestId) {
          set({ isStatLoading: false });
        }
      }
    },
  }),
  shallow
);
