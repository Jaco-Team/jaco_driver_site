import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import {
  fetchStatisticsShowData,
  type StatisticsSummaryRow,
} from '@/entities/statistics/api/statistics.api';
import { useSettingsStore } from '@/entities/settings';

interface StatisticsState {
  svod: StatisticsSummaryRow[];
  currentUserId: string;
  isLoad: boolean;
}

interface StatisticsActions {
  getStatistics: (dateStart: string, dateEnd: string, pointId?: number | null) => Promise<void>;
}

type StatisticsStore = StatisticsState & StatisticsActions;

const statisticsRequests = new Map<
  string,
  Promise<Awaited<ReturnType<typeof fetchStatisticsShowData>>>
>();

function normalizePointId(value?: number | null): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  return Number.isFinite(value) && value > 0 ? value : null;
}

export const useStatisticsStore = createWithEqualityFn<StatisticsStore>(
  (set) => ({
    svod: [],
    currentUserId: '',
    isLoad: false,

    getStatistics: async (dateStart, dateEnd, pointId) => {
      set({ isLoad: true });

      try {
        const selectedPointId = normalizePointId(pointId ?? useSettingsStore.getState().pointId);
        const requestKey = `${dateStart}:${dateEnd}:${selectedPointId ?? 'all'}`;
        let request = statisticsRequests.get(requestKey);

        if (!request) {
          request = fetchStatisticsShowData(dateStart, dateEnd, selectedPointId).finally(() => {
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
