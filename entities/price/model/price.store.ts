import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { fetchPriceBetween } from '@/entities/price/api/price.api';
import type { PriceGiveHistoryRow, PriceStat } from '@/entities/price/api/price.api';

interface PriceState {
  statPrice: PriceStat | null;
  give_hist: PriceGiveHistoryRow[];
}

interface PriceActions {
  getStatBetween: (dateStart: string, dateEnd: string) => Promise<void>;
}

type PriceStore = PriceState & PriceActions;

const priceBetweenRequests = new Map<
  string,
  Promise<Awaited<ReturnType<typeof fetchPriceBetween>>>
>();

export const usePriceStore = createWithEqualityFn<PriceStore>(
  (set) => ({
    statPrice: null,
    give_hist: [],

    getStatBetween: async (dateStart, dateEnd) => {
      const requestKey = `${dateStart}:${dateEnd}`;
      let request = priceBetweenRequests.get(requestKey);

      if (!request) {
        request = fetchPriceBetween(dateStart, dateEnd).finally(() => {
          priceBetweenRequests.delete(requestKey);
        });
        priceBetweenRequests.set(requestKey, request);
      }

      const json = await request;

      set({
        statPrice: json?.stat ?? null,
        give_hist: Array.isArray(json?.give_hist) ? json.give_hist : [],
      });
    },
  }),
  shallow
);
