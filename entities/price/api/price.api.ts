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

export async function fetchPriceBetween(
  dateStart: string,
  dateEnd: string
): Promise<PriceBetweenResponse> {
  return connector.rest.post<PriceBetweenResponse, { dateStart: string; dateEnd: string }>(
    apiRoutes.price.between,
    { dateStart, dateEnd }
  );
}
