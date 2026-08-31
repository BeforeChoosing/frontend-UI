import { apiRequest } from './client';

export type LlmQueueStatus = {
  state: 'idle' | 'queued' | 'running' | 'cancelling';
  ahead: number;
  can_cancel: boolean;
  enqueued_at?: number;
  started_at?: number | null;
};

export function getMyLlmQueueStatus(): Promise<LlmQueueStatus> {
  return apiRequest<LlmQueueStatus>('/llm-queue/me');
}

export function cancelMyLlmRequest(): Promise<{ cancelled: boolean }> {
  return apiRequest<{ cancelled: boolean }>('/llm-queue/me', { method: 'DELETE' });
}
