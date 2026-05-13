import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { fetchPriceBetween } from '@/entities/price/api/price.api';
import type { PriceGiveHistoryRow, PriceStat } from '@/entities/price/api/price.api';

interface PriceState {
  statPrice: PriceStat | null;
  give_hist: PriceGiveHistoryRow[];
  isStatLoading: boolean;
}

interface PriceActions {
  getStatBetween: (dateStart: string, dateEnd: string) => Promise<void>;
}

type PriceStore = PriceState & PriceActions;

const priceBetweenRequests = new Map<
  string,
  Promise<Awaited<ReturnType<typeof fetchPriceBetween>>>
>();
let latestPriceRequestKey = '';

export const usePriceStore = createWithEqualityFn<PriceStore>(
  (set) => ({
    statPrice: null,
    give_hist: [],
    isStatLoading: false,

    getStatBetween: async (dateStart, dateEnd) => {
      const requestKey = `${dateStart}:${dateEnd}`;
      latestPriceRequestKey = requestKey;
      set({ isStatLoading: true });
      let request = priceBetweenRequests.get(requestKey);

      if (!request) {
        request = fetchPriceBetween(dateStart, dateEnd).finally(() => {
          priceBetweenRequests.delete(requestKey);
        });
        priceBetweenRequests.set(requestKey, request);
      }

      try {
        const json = await request;

        if (latestPriceRequestKey !== requestKey) {
          return;
        }

        set({
          statPrice: json?.stat ?? null,
          give_hist: Array.isArray(json?.give_hist) ? json.give_hist : [],
        });
      } finally {
        if (latestPriceRequestKey === requestKey) {
          set({ isStatLoading: false });
        }
      }
    },
  }),
  shallow
);
