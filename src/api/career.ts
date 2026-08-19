import { apiRequest } from './client';
import type {
  ApiCareerRecommendation,
  CareerRecommendationRequest,
} from '../types/api';

export function createCareerRecommendation(
  selectedCardIds: string[],
): Promise<ApiCareerRecommendation> {
  const request: CareerRecommendationRequest = {
    selected_card_ids: selectedCardIds,
    target_role: 'AI 产品经理',
  };
  return apiRequest<ApiCareerRecommendation>('/career/recommendations', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
