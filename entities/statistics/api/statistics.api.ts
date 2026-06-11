import { connector } from '@/shared/api/connector';
import { apiRoutes } from '@/shared/api/routes';

type StatMetric = number | string | null;

export type StatisticsOtherStat = {
  all_count?: StatMetric;
  norm?: StatMetric;
  norm_percent?: StatMetric;
  fake?: StatMetric;
  fake_percent?: StatMetric;
  time_dist_true?: StatMetric;
  time_dist_true_percent?: StatMetric;
  true_dist?: StatMetric;
  true_dist_percent?: StatMetric;
  false_dist?: StatMetric;
  false_dist_percent?: StatMetric;
  time_dist_false?: StatMetric;
  time_dist_false_percent?: StatMetric;
};

export type StatisticsSummaryRow = {
  name?: string | null;
  driver_id?: StatMetric;
  user_id?: StatMetric;
  time2?: StatMetric;
  other_stat?: StatisticsOtherStat;
};

export type StatisticsShowDataResponse = {
  all_orders?: unknown[];
  avg_orders?: StatisticsSummaryRow[];
  user_id?: StatMetric;
};

type StatisticsShowDataRequest = {
  date_start: string;
  date_end: string;
  point_id?: number;
};

function normalizePointId(value?: string | number | null): number | null {
  if (value === undefined || value === null || `${value}`.trim() === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : parseInt(`${value}`, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function fetchStatisticsShowData(
  dateStart: string,
  dateEnd: string,
  pointId?: string | number | null
): Promise<StatisticsShowDataResponse> {
  const payload: StatisticsShowDataRequest = {
    date_start: dateStart,
    date_end: dateEnd,
  };
  const normalizedPointId = normalizePointId(pointId);

  if (normalizedPointId !== null) {
    payload.point_id = normalizedPointId;
  }

  return connector.rest.post<StatisticsShowDataResponse, StatisticsShowDataRequest>(
    apiRoutes.statistics.showData,
    payload
  );
}
