const DEMO_STORAGE_PREFIXES = [
  'before-choosing:profile-exploration:demo:',
  'before-choosing:dynamic-trial:demo:',
  'before-choosing:trial-ui:demo:',
  'before-choosing:confirmed-experience:demo',
] as const;

export function isDemoReplayStorageKey(key: string): boolean {
  return DEMO_STORAGE_PREFIXES.some(prefix => key.startsWith(prefix));
}

export function resetDemoReplayStorage(
  storage: Pick<Storage, 'key' | 'length' | 'removeItem'> = window.localStorage,
): void {
  const keysToRemove: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key && isDemoReplayStorageKey(key)) keysToRemove.push(key);
  }
  keysToRemove.forEach(key => storage.removeItem(key));
}
