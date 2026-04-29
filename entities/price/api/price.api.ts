import { connector } from '@/shared/api/connector';
import { apiRoutes } from '@/shared/api/routes';

type PriceStat = Record<string, number | string | null>;

type PriceGiveHistoryRow = {
  give?: number | string | null;
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
