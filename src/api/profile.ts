import { apiFormRequest, apiRequest } from './client';
import type {
  ApiCardProposal,
  MaterialExtractResponse,
  MultimodalEvidenceResponse,
  ProfileExplorationRequest,
  ProfileExplorationResponse,
  ProfileCardPatchRequest,
  ProfileCardsResponse,
  ProfileOverviewResponse,
  ProfileProposalRequest,
  ProfileProposalResponse,
} from '../types/api';

export function createProfileExplorationMessage(
  request: ProfileExplorationRequest,
): Promise<ProfileExplorationResponse> {
  return apiRequest<ProfileExplorationResponse>('/profile/exploration/messages', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function extractProfileMaterial(file: File): Promise<MaterialExtractResponse> {
  const form = new FormData();
  form.append('file', file);
  return apiFormRequest<MaterialExtractResponse>('/profile/materials/extract', form);
}

export function extractProfileMultimodalEvidence(file: File): Promise<MultimodalEvidenceResponse> {
  const form = new FormData();
  form.append('file', file);
  return apiFormRequest<MultimodalEvidenceResponse>('/profile/materials/multimodal-extract', form);
}

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

export function getProfileOverview(): Promise<ProfileOverviewResponse> {
  return apiRequest<ProfileOverviewResponse>('/profile/overview');
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
