import type { ScreenMode } from '../types';
import type { ApiCareerRecommendation, TrialTaskId } from '../types/api';

const STORAGE_KEY = 'before-choosing:demo-progress:v1';

const RESTORABLE_SCREENS: ScreenMode[] = [
  'landing',
  'input-experience',
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
}

const DEFAULT_PROGRESS: DemoProgress = {
  currentScreen: 'landing',
  selectedTrialTaskId: 'A-02',
  careerSelectedCardIds: [],
  careerRecommendation: null,
  careerRecommendationCardSignature: null,
};

export function loadDemoProgress(): DemoProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<DemoProgress>;
    return {
      currentScreen: RESTORABLE_SCREENS.includes(parsed.currentScreen as ScreenMode)
        ? parsed.currentScreen as ScreenMode
        : DEFAULT_PROGRESS.currentScreen,
      selectedTrialTaskId: TASK_IDS.includes(parsed.selectedTrialTaskId as TrialTaskId)
        ? parsed.selectedTrialTaskId as TrialTaskId
        : DEFAULT_PROGRESS.selectedTrialTaskId,
      careerSelectedCardIds: Array.isArray(parsed.careerSelectedCardIds)
        ? parsed.careerSelectedCardIds.filter((id): id is string => typeof id === 'string').slice(0, 4)
        : [],
      careerRecommendation: parsed.careerRecommendation || null,
      careerRecommendationCardSignature: typeof parsed.careerRecommendationCardSignature === 'string'
        ? parsed.careerRecommendationCardSignature
        : null,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveDemoProgress(progress: DemoProgress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // The backend session remains the source of truth when browser storage is unavailable.
  }
}

export function trialPhaseKey(taskId: TrialTaskId): string {
  return `before-choosing:trial-ui:${taskId}:phase`;
}

export function trialStepKey(taskId: TrialTaskId): string {
  return `before-choosing:trial-ui:${taskId}:step`;
}
