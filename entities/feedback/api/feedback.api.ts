import type { ApiResponse } from '@/shared/api/client';
import { connector } from '@/shared/api/connector';
import { apiRoutes } from '@/shared/api/routes';
import { Feedback } from '@/entities/feedback/model/types';

export interface FeedbackResponse {
  data: Feedback[];
}

export async function getFeedbacks() {
  return connector.rest.get<FeedbackResponse>(apiRoutes.feedback.getFeedbacks);
}

export async function saveFeedbacks(req) {
  return connector.rest.post(apiRoutes.feedback.saveFeedbacks, req);
}
