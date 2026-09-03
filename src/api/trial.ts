import { apiRequest } from './client';
import type {
  ApiA02Answer,
  ApiA02Task,
  ApiTrialSession,
  ApiDynamicTrialAnswer,
  ApiDynamicTrialCardPlayRound,
  ApiDynamicTrialSession,
  ApiTrialAbilityChallenge,
  ApiTrialTaskDefinition,
  TrialTaskId,
} from '../types/api';

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function normalizeAbilityChallenge(
  value: Partial<ApiTrialAbilityChallenge>,
  index: number,
  taskId: TrialTaskId,
): ApiTrialAbilityChallenge {
  return {
    id: typeof value.id === 'string' ? value.id : `${taskId}-C${String(index + 1).padStart(2, '0')}`,
    title: typeof value.title === 'string' ? value.title : `挑战 ${String(index + 1).padStart(2, '0')}`,
    scenario: typeof value.scenario === 'string' ? value.scenario : '',
    prompt: typeof value.prompt === 'string' ? value.prompt : '选择可用于完成这一任务要求的能力卡。',
    target_skills: stringArray(value.target_skills),
    reference_behavior: typeof value.reference_behavior === 'string' ? value.reference_behavior : '',
    max_cards: typeof value.max_cards === 'number' ? value.max_cards : 3,
  };
}

function normalizeDynamicTask(task: ApiTrialTaskDefinition): ApiTrialTaskDefinition {
  const supplied = Array.isArray(task.ability_challenges) ? task.ability_challenges : [];
  const rubric = Array.isArray(task.rubric) ? task.rubric : [];
  const fallback = rubric.slice(0, 3).map((criterion, index) => ({
    id: `${task.id}-C${String(index + 1).padStart(2, '0')}`,
    title: `挑战 ${String(index + 1).padStart(2, '0')} · ${criterion.dimension}`,
    scenario: `${task.goal}\n本轮重点：${criterion.observable_behavior}`,
    prompt: '选择可用于完成这一任务要求的能力卡。',
    target_skills: [criterion.dimension],
    reference_behavior: criterion.observable_behavior,
    max_cards: 3,
  }));
  return {
    ...task,
    materials: Array.isArray(task.materials) ? task.materials : [],
    steps: Array.isArray(task.steps) ? task.steps : [],
    coach_prompts: stringArray(task.coach_prompts),
    rubric,
    ability_challenges: (supplied.length ? supplied : fallback)
      .slice(0, 3)
      .map((item, index) => normalizeAbilityChallenge(item, index, task.id)),
  };
}

function normalizeCardPlayRound(value: Partial<ApiDynamicTrialCardPlayRound>): ApiDynamicTrialCardPlayRound {
  return {
    challenge_id: typeof value.challenge_id === 'string' ? value.challenge_id : '',
    selected_card_ids: stringArray(value.selected_card_ids),
    match_level: value.match_level || null,
    matched_card_ids: stringArray(value.matched_card_ids),
    matched_skills: stringArray(value.matched_skills),
    feedback: typeof value.feedback === 'string' ? value.feedback : '',
  };
}

function normalizeDynamicSession(session: ApiDynamicTrialSession): ApiDynamicTrialSession {
  const answer = session.answer || {} as ApiDynamicTrialAnswer;
  const currentIndex = Number(answer.card_play_current_index);
  return {
    ...session,
    answer: {
      ...answer,
      selected_card_ids: stringArray(answer.selected_card_ids),
      card_play_rounds: Array.isArray(answer.card_play_rounds)
        ? answer.card_play_rounds.map(normalizeCardPlayRound)
        : [],
      card_play_current_index: Number.isInteger(currentIndex) && currentIndex >= 0 && currentIndex <= 2
        ? currentIndex
        : 0,
      card_play_rationale: typeof answer.card_play_rationale === 'string' ? answer.card_play_rationale : '',
      pending_abilities: Array.isArray(answer.pending_abilities)
        ? answer.pending_abilities.filter(item => item && typeof item.id === 'string')
        : [],
      validation_hypothesis: typeof answer.validation_hypothesis === 'string' ? answer.validation_hypothesis : '',
      card_play_completed: Boolean(answer.card_play_completed),
      step_answers: answer.step_answers && typeof answer.step_answers === 'object' ? answer.step_answers : {},
      viewed_material_ids: stringArray(answer.viewed_material_ids),
      evidence_refs: stringArray(answer.evidence_refs),
      step_revisions: answer.step_revisions && typeof answer.step_revisions === 'object' ? answer.step_revisions : {},
      coach_usage: Array.isArray(answer.coach_usage) ? answer.coach_usage : [],
      event_response: typeof answer.event_response === 'string' ? answer.event_response : '',
    },
  };
}

export function getA02Task(): Promise<ApiA02Task> {
  return apiRequest<ApiA02Task>('/trial/tasks/A-02');
}

export async function getDynamicTrialTask(taskId: TrialTaskId): Promise<ApiTrialTaskDefinition> {
  const task = await apiRequest<ApiTrialTaskDefinition>(`/trial/catalog/${encodeURIComponent(taskId)}`);
  return normalizeDynamicTask(task);
}

export async function getDynamicTrialCatalog(): Promise<ApiTrialTaskDefinition[]> {
  const tasks = await apiRequest<ApiTrialTaskDefinition[]>('/trial/catalog');
  return tasks.map(normalizeDynamicTask);
}

export async function createDynamicTrialSession(taskId: TrialTaskId): Promise<ApiDynamicTrialSession> {
  const session = await apiRequest<ApiDynamicTrialSession>('/trial/workbench/sessions', {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId }),
  });
  return normalizeDynamicSession(session);
}

export async function getDynamicTrialSession(sessionId: string): Promise<ApiDynamicTrialSession> {
  const session = await apiRequest<ApiDynamicTrialSession>(`/trial/workbench/sessions/${encodeURIComponent(sessionId)}`);
  return normalizeDynamicSession(session);
}

export async function saveDynamicTrialAnswer(
  sessionId: string,
  answer: ApiDynamicTrialAnswer,
): Promise<ApiDynamicTrialSession> {
  const session = await apiRequest<ApiDynamicTrialSession>(`/trial/workbench/sessions/${encodeURIComponent(sessionId)}/answer`, {
    method: 'PUT',
    body: JSON.stringify({ answer }),
  });
  return normalizeDynamicSession(session);
}

export async function revealDynamicTrialEvent(sessionId: string): Promise<ApiDynamicTrialSession> {
  const session = await apiRequest<ApiDynamicTrialSession>(`/trial/workbench/sessions/${encodeURIComponent(sessionId)}/event`, {
    method: 'POST',
  });
  return normalizeDynamicSession(session);
}

export function useDynamicTrialCoach(
  sessionId: string,
  level: 1 | 2 | 3,
): Promise<{
  prompt: string;
  usage: {
    level: 1 | 2 | 3;
    prompt: string;
    used_at: string;
    model?: string | null;
    model_pool?: string | null;
    cache_hit?: boolean;
    generation_mode?: 'model' | 'preset_fallback';
  };
  model?: string | null;
  model_pool?: string | null;
  cache_hit?: boolean;
  generation_mode?: 'model' | 'preset_fallback';
}> {
  return apiRequest(`/trial/workbench/sessions/${encodeURIComponent(sessionId)}/coach`, {
    method: 'POST',
    body: JSON.stringify({ level }),
  });
}

export async function submitDynamicTrialSession(sessionId: string): Promise<ApiDynamicTrialSession> {
  const session = await apiRequest<ApiDynamicTrialSession>(`/trial/workbench/sessions/${encodeURIComponent(sessionId)}/submit`, {
    method: 'POST',
  });
  return normalizeDynamicSession(session);
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
