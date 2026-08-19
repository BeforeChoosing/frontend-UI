import { apiRequest } from './client';
import type {
  ApiA02Answer,
  ApiA02Task,
  ApiTrialSession,
} from '../types/api';

export function getA02Task(): Promise<ApiA02Task> {
  return apiRequest<ApiA02Task>('/trial/tasks/A-02');
}

export function createA02TrialSession(): Promise<ApiTrialSession> {
  return apiRequest<ApiTrialSession>('/trial/sessions', {
    method: 'POST',
    body: JSON.stringify({ task_id: 'A-02' }),
  });
}

export function getTrialSession(sessionId: string): Promise<ApiTrialSession> {
  return apiRequest<ApiTrialSession>(`/trial/sessions/${encodeURIComponent(sessionId)}`);
}

export function saveTrialAnswer(
  sessionId: string,
  answer: ApiA02Answer,
): Promise<ApiTrialSession> {
  return apiRequest<ApiTrialSession>(`/trial/sessions/${encodeURIComponent(sessionId)}/answer`, {
    method: 'PUT',
    body: JSON.stringify({ answer }),
  });
}

export function revealTrialEvent(sessionId: string): Promise<ApiTrialSession> {
  return apiRequest<ApiTrialSession>(`/trial/sessions/${encodeURIComponent(sessionId)}/event`, {
    method: 'POST',
  });
}

export function submitTrialSession(sessionId: string): Promise<ApiTrialSession> {
  return apiRequest<ApiTrialSession>(`/trial/sessions/${encodeURIComponent(sessionId)}/submit`, {
    method: 'POST',
  });
}
