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

// правка 10.08.2026 исрпавления ошибки  неявный типа req 
interface SaveFeedbackResponse {
  message?: string;
}

export async function saveFeedbacks(req: FormData) {
  return connector.rest.post<SaveFeedbackResponse, FormData>(
    apiRoutes.feedback.saveFeedbacks,
    req
  );
}