import type { AppMode } from './appMode';

export function shouldAttachAccessToken(mode: AppMode): boolean {
  return mode === 'use';
}

export function isApiRequestAllowedInMode(path: string, mode: AppMode): boolean {
  return mode === 'use' || path.startsWith('/auth/');
}
