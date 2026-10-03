import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import {
  fetchStatisticsShowData,
  type StatisticsSummaryRow,
} from '@/entities/statistics/api/statistics.api';
import { useSettingsStore } from '@/entities/settings';
import { isAppOnline } from '@/features/offline/model/connectivity.store';

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
let latestStatisticsRequestId = 0;

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
      if (!isAppOnline()) return;
      const requestId = ++latestStatisticsRequestId;
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

        if (requestId !== latestStatisticsRequestId || !isAppOnline()) return;

        set({
          svod: Array.isArray(json?.avg_orders) ? json.avg_orders : [],
          currentUserId: json?.user_id == null ? '' : `${json.user_id}`,
        });
      } finally {
        if (requestId === latestStatisticsRequestId) set({ isLoad: false });
      }
    },
  }),
  shallow
);
