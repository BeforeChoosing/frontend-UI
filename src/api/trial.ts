import { apiRequest } from './client';
import type {
  ApiA02Answer,
  ApiA02Task,
  ApiTrialSession,
  ApiDynamicTrialAnswer,
  ApiDynamicTrialSession,
  ApiTrialTaskDefinition,
  TrialTaskId,
} from '../types/api';

export function getA02Task(): Promise<ApiA02Task> {
  return apiRequest<ApiA02Task>('/trial/tasks/A-02');
}

export function getDynamicTrialTask(taskId: TrialTaskId): Promise<ApiTrialTaskDefinition> {
  return apiRequest<ApiTrialTaskDefinition>(`/trial/catalog/${encodeURIComponent(taskId)}`);
}

export function createDynamicTrialSession(taskId: TrialTaskId): Promise<ApiDynamicTrialSession> {
  return apiRequest<ApiDynamicTrialSession>('/trial/workbench/sessions', {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId }),
  });
}

export function getDynamicTrialSession(sessionId: string): Promise<ApiDynamicTrialSession> {
  return apiRequest<ApiDynamicTrialSession>(`/trial/workbench/sessions/${encodeURIComponent(sessionId)}`);
}

export function saveDynamicTrialAnswer(
  sessionId: string,
  answer: ApiDynamicTrialAnswer,
): Promise<ApiDynamicTrialSession> {
  return apiRequest<ApiDynamicTrialSession>(`/trial/workbench/sessions/${encodeURIComponent(sessionId)}/answer`, {
    method: 'PUT',
    body: JSON.stringify({ answer }),
  });
}

export function revealDynamicTrialEvent(sessionId: string): Promise<ApiDynamicTrialSession> {
  return apiRequest<ApiDynamicTrialSession>(`/trial/workbench/sessions/${encodeURIComponent(sessionId)}/event`, {
    method: 'POST',
  });
}

export function useDynamicTrialCoach(
  sessionId: string,
  level: 1 | 2 | 3,
): Promise<{ prompt: string; usage: { level: 1 | 2 | 3; prompt: string; used_at: string } }> {
  return apiRequest(`/trial/workbench/sessions/${encodeURIComponent(sessionId)}/coach`, {
    method: 'POST',
    body: JSON.stringify({ level }),
  });
}

export function submitDynamicTrialSession(sessionId: string): Promise<ApiDynamicTrialSession> {
  return apiRequest<ApiDynamicTrialSession>(`/trial/workbench/sessions/${encodeURIComponent(sessionId)}/submit`, {
    method: 'POST',
  });
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
