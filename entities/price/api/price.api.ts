import { connector } from '@/shared/api/connector';
import { apiRoutes } from '@/shared/api/routes';

export type PriceStat = Record<string, number | string | null>;

export type PriceGiveHistoryRow = {
  give?: number | string | null;
  time?: string | null;
};

export type PriceBetweenResponse = {
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
