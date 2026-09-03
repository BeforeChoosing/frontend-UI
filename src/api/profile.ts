import { ApiClientError, apiFormRequest, apiRequest, apiStreamRequest } from './client';
import type {
  ApiCardProposal,
  MaterialUnderstandingRequest,
  MaterialUnderstandingResponse,
  MaterialExtractResponse,
  MultimodalEvidenceResponse,
  ProfileExplorationRequest,
  ProfileExplorationResponse,
  ProfileConversationSnapshot,
  ProfileConversationSnapshotUpsert,
  ProfileCardPatchRequest,
  ProfileCardsResponse,
  ProfileOverviewResponse,
  ProfileProposalRequest,
  ProfileProposalResponse,
} from '../types/api';

export function listProfileConversationSnapshots(limit = 50): Promise<ProfileConversationSnapshot[]> {
  return apiRequest<ProfileConversationSnapshot[]>(`/profile/conversation-snapshots?limit=${limit}`);
}

export function upsertProfileConversationSnapshot(
  conversationId: string,
  snapshot: ProfileConversationSnapshotUpsert,
): Promise<ProfileConversationSnapshot> {
  return apiRequest<ProfileConversationSnapshot>(
    `/profile/conversation-snapshots/${encodeURIComponent(conversationId)}`,
    { method: 'PUT', body: JSON.stringify(snapshot) },
  );
}

export function deleteProfileConversationSnapshot(conversationId: string): Promise<{ deleted: boolean }> {
  return apiRequest<{ deleted: boolean }>(
    `/profile/conversation-snapshots/${encodeURIComponent(conversationId)}`,
    { method: 'DELETE' },
  );
}

export function createProfileExplorationMessage(
  request: ProfileExplorationRequest,
  signal?: AbortSignal,
): Promise<ProfileExplorationResponse> {
  return apiRequest<ProfileExplorationResponse>('/profile/exploration/messages', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
}

export async function streamProfileExplorationMessage(
  request: ProfileExplorationRequest,
  onDelta: (text: string) => void,
  signal?: AbortSignal,
  onReset: () => void = () => {},
): Promise<ProfileExplorationResponse> {
  const response = await apiStreamRequest('/profile/exploration/messages/stream', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });
  if (!response.body) throw new ApiClientError('当前浏览器无法接收流式回复。');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result: ProfileExplorationResponse | null = null;

  const consume = (block: string) => {
    let event = 'message';
    const data: string[] = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
    }
    if (!data.length) return;
    const payload = JSON.parse(data.join('\n')) as Record<string, unknown>;
    if (event === 'delta') {
      const text = typeof payload.text === 'string' ? payload.text : '';
      if (text) onDelta(text);
      return;
    }
    if (event === 'reset') {
      onReset();
      return;
    }
    if (event === 'done') {
      result = payload as unknown as ProfileExplorationResponse;
      return;
    }
    if (event === 'error') {
      throw new ApiClientError(
        typeof payload.message === 'string' ? payload.message : '这次回复没有完成。',
        typeof payload.status === 'number' ? payload.status : 502,
        { requestId: typeof payload.request_id === 'string' ? payload.request_id : '' },
      );
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    buffer = buffer.replaceAll('\r\n', '\n');
    let boundary = buffer.indexOf('\n\n');
    while (boundary >= 0) {
      consume(buffer.slice(0, boundary));
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf('\n\n');
    }
    if (done) break;
  }
  if (buffer.trim()) consume(buffer);
  if (!result) throw new ApiClientError('流式回复已结束，但没有收到完整结果。', 502);
  return result;
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

export function understandProfileMaterial(
  request: MaterialUnderstandingRequest,
): Promise<MaterialUnderstandingResponse> {
  return apiRequest<MaterialUnderstandingResponse>('/profile/materials/understand', {
    method: 'POST',
    body: JSON.stringify(request),
  });
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
