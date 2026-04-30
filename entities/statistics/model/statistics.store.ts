import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import {
  fetchStatisticsShowData,
  type StatisticsSummaryRow,
} from '@/entities/statistics/api/statistics.api';

interface StatisticsState {
  svod: StatisticsSummaryRow[];
  currentUserId: string;
  isLoad: boolean;
}

interface StatisticsActions {
  getStatistics: (dateStart: string, dateEnd: string) => Promise<void>;
}

type StatisticsStore = StatisticsState & StatisticsActions;

const statisticsRequests = new Map<
  string,
  Promise<Awaited<ReturnType<typeof fetchStatisticsShowData>>>
>();

export const useStatisticsStore = createWithEqualityFn<StatisticsStore>(
  (set) => ({
    svod: [],
    currentUserId: '',
    isLoad: false,

    getStatistics: async (dateStart, dateEnd) => {
      set({ isLoad: true });

      try {
        const requestKey = `${dateStart}:${dateEnd}`;
        let request = statisticsRequests.get(requestKey);

        if (!request) {
          request = fetchStatisticsShowData(dateStart, dateEnd).finally(() => {
            statisticsRequests.delete(requestKey);
          });
          statisticsRequests.set(requestKey, request);
        }

        const json = await request;

        set({
          svod: Array.isArray(json?.avg_orders) ? json.avg_orders : [],
          currentUserId: json?.user_id == null ? '' : `${json.user_id}`,
        });
      } finally {
        window.setTimeout(() => {
          set({ isLoad: false });
        }, 500);
      }
    },
  }),
  shallow
);
