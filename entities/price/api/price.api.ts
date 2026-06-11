import { connector } from '@/shared/api/connector';
import { apiRoutes } from '@/shared/api/routes';

type PriceMetric = number | string | null;

export type PriceStat = {
  sum_cash?: PriceMetric;
  sum_bank?: PriceMetric;
  my_price?: PriceMetric;
  sdacha?: PriceMetric;
  my_cash?: PriceMetric;
  count_cash?: PriceMetric;
  count_bank?: PriceMetric;
  count?: PriceMetric;
  full_give?: PriceMetric;
};

export type PriceGiveHistoryRow = {
  give?: PriceMetric;
  time?: string | null;
};

type PriceBetweenResponse = {
  stat: PriceStat | null;
  give_hist: PriceGiveHistoryRow[];
};

type PriceBetweenRequest = {
  dateStart: string;
  dateEnd: string;
  point_id?: number;
};

function normalizePointId(value?: string | number | null): number | null {
  if (value === undefined || value === null || `${value}`.trim() === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : parseInt(`${value}`, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function fetchPriceBetween(
  dateStart: string,
  dateEnd: string,
  pointId?: string | number | null
): Promise<PriceBetweenResponse> {
  const payload: PriceBetweenRequest = { dateStart, dateEnd };
  const normalizedPointId = normalizePointId(pointId);

  if (normalizedPointId !== null) {
    payload.point_id = normalizedPointId;
  }

  return connector.rest.post<PriceBetweenResponse, PriceBetweenRequest>(
    apiRoutes.price.between,
    payload
  );
}
