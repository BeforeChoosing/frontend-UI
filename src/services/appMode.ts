export type AppMode = 'demo' | 'use';

const STORAGE_KEY = 'before-choosing:app-mode:v1';

export function loadAppMode(): AppMode {
  return window.localStorage.getItem(STORAGE_KEY) === 'demo' ? 'demo' : 'use';
}

export function saveAppMode(mode: AppMode): void {
  window.localStorage.setItem(STORAGE_KEY, mode);
}
