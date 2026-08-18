import { apiRequest } from './client';
import type {
  ProfileProposalRequest,
  ProfileProposalResponse,
} from '../types/api';

export function createProfileProposal(
  request: ProfileProposalRequest,
): Promise<ProfileProposalResponse> {
  return apiRequest<ProfileProposalResponse>('/profile/proposals', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
