import type { ScreenMode, SkillCard } from '../types';
import type { ApiCareerRecommendation, ApiExperienceSummary, TrialTaskId } from '../types/api';

export type ProgressMode = 'demo' | 'use';

const LEGACY_STORAGE_KEY = 'before-choosing:demo-progress:v1';
const STORAGE_KEYS: Record<ProgressMode, string> = {
  demo: 'before-choosing:flow-progress:demo:v1',
  use: 'before-choosing:flow-progress:use:v1',
};

const RESTORABLE_SCREENS: ScreenMode[] = [
  'landing',
  'input-experience',
  'verify-cards',
  'career-explore',
  'stage2',
  'report',
  'profile',
];

const TASK_IDS: TrialTaskId[] = [
  'F-01', 'F-02', 'F-03',
  'A-01', 'A-02', 'A-03',
  'P-01', 'P-02', 'P-03',
  'M-01', 'M-02', 'M-03',
];

export interface DemoProgress {
  currentScreen: ScreenMode;
  selectedTrialTaskId: TrialTaskId;
  careerSelectedCardIds: string[];
  careerRecommendation: ApiCareerRecommendation | null;
  careerRecommendationCardSignature: string | null;
  draftCards: SkillCard[];
  draftExperience: ApiExperienceSummary | null;
}

const DEFAULT_PROGRESS: DemoProgress = {
  currentScreen: 'landing',
  selectedTrialTaskId: 'A-02',
  careerSelectedCardIds: [],
  careerRecommendation: null,
  careerRecommendationCardSignature: null,
  draftCards: [],
  draftExperience: null,
};

type ProgressStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function progressStorageKey(mode: ProgressMode, userId?: string | null): string {
  if (mode === 'use' && userId) return `${STORAGE_KEYS[mode]}:${encodeURIComponent(userId)}`;
  return STORAGE_KEYS[mode];
}

function isSkillCard(value: unknown): value is SkillCard {
  if (!value || typeof value !== 'object') return false;
  const card = value as Partial<SkillCard>;
  return typeof card.id === 'string'
    && typeof card.title === 'string'
    && typeof card.description === 'string';
}

function isExperienceSummary(value: unknown): value is ApiExperienceSummary {
  if (!value || typeof value !== 'object') return false;
  const experience = value as Partial<ApiExperienceSummary>;
  return typeof experience.title === 'string'
    && Array.isArray(experience.actions)
    && Array.isArray(experience.source_refs);
}

export function loadDemoProgress(
  mode: ProgressMode = 'use',
  fallback: Partial<DemoProgress> = {},
  storage: ProgressStorage = window.localStorage,
  userId?: string | null,
): DemoProgress {
  const defaultProgress = { ...DEFAULT_PROGRESS, ...fallback };
  try {
    const raw = userId === null
      ? null
      : storage.getItem(progressStorageKey(mode, userId))
        || (mode === 'use' && !userId ? storage.getItem(LEGACY_STORAGE_KEY) : null);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as Partial<DemoProgress>;
    return {
      currentScreen: RESTORABLE_SCREENS.includes(parsed.currentScreen as ScreenMode)
        ? parsed.currentScreen as ScreenMode
        : defaultProgress.currentScreen,
      selectedTrialTaskId: TASK_IDS.includes(parsed.selectedTrialTaskId as TrialTaskId)
        ? parsed.selectedTrialTaskId as TrialTaskId
        : defaultProgress.selectedTrialTaskId,
      careerSelectedCardIds: Array.isArray(parsed.careerSelectedCardIds)
        ? parsed.careerSelectedCardIds.filter((id): id is string => typeof id === 'string').slice(0, 4)
        : defaultProgress.careerSelectedCardIds,
      careerRecommendation: parsed.careerRecommendation || null,
      careerRecommendationCardSignature: typeof parsed.careerRecommendationCardSignature === 'string'
        ? parsed.careerRecommendationCardSignature
        : null,
      draftCards: Array.isArray(parsed.draftCards)
        ? parsed.draftCards.filter(isSkillCard).slice(0, 12)
        : defaultProgress.draftCards,
      draftExperience: isExperienceSummary(parsed.draftExperience)
        ? parsed.draftExperience
        : defaultProgress.draftExperience,
    };
  } catch {
    return defaultProgress;
  }
}

export function saveDemoProgress(
  progress: DemoProgress,
  mode: ProgressMode = 'use',
  storage: ProgressStorage = window.localStorage,
  userId?: string | null,
): void {
  try {
    if (userId === null) return;
    storage.setItem(progressStorageKey(mode, userId), JSON.stringify(progress));
  } catch {
    // The backend session remains the source of truth when browser storage is unavailable.
  }
}

export function trialStepKey(taskId: TrialTaskId, mode: 'demo' | 'use' = 'use', userId?: string | null): string {
  return mode === 'use'
    ? `before-choosing:trial-ui:${taskId}:step${userId ? `:${encodeURIComponent(userId)}` : ''}`
    : `before-choosing:trial-ui:demo:${taskId}:step`;
}
