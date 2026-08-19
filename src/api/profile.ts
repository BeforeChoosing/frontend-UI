import { apiRequest } from './client';
import type {
  ApiCardProposal,
  ProfileCardPatchRequest,
  ProfileCardsResponse,
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

export function getProfileCards(): Promise<ProfileCardsResponse> {
  return apiRequest<ProfileCardsResponse>('/profile/cards');
}

export function confirmProfileCards(
  cards: ApiCardProposal[],
  traceId?: string,
): Promise<ProfileCardsResponse> {
  return apiRequest<ProfileCardsResponse>('/profile/cards/confirm', {
    method: 'POST',
    body: JSON.stringify({
      cards,
      ...(traceId ? { trace_id: traceId } : {}),
    }),
  });
}

export function updateProfileCard(
  cardId: string,
  patch: ProfileCardPatchRequest,
): Promise<ProfileCardsResponse> {
  return apiRequest<ProfileCardsResponse>(`/profile/cards/${encodeURIComponent(cardId)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export function deleteProfileCard(cardId: string): Promise<ProfileCardsResponse> {
  return apiRequest<ProfileCardsResponse>(`/profile/cards/${encodeURIComponent(cardId)}`, {
    method: 'DELETE',
  });
}
