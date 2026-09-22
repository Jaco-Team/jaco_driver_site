import { connector } from '@/shared/api/connector';
import { apiRoutes } from '@/shared/api/routes';

import type {
  OrderRecommendationRequest,
  OrderRecommendationResult,
} from '../model/orderRecommendation.types';

export async function requestOrderRecommendation(
  payload: OrderRecommendationRequest
): Promise<OrderRecommendationResult> {
  return connector.rest.post<OrderRecommendationResult, OrderRecommendationRequest>(
    apiRoutes.orders.suggestRoute,
    payload
  );
}
