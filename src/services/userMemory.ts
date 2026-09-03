const FORMAL_SHARED_KEYS = new Set([
  'before-choosing:flow-progress:use:v1',
  'before-choosing:confirmed-experience:use',
]);

export function isCurrentUserMemoryKey(key: string, userId: string): boolean {
  const owner = encodeURIComponent(userId);
  return FORMAL_SHARED_KEYS.has(key)
    || key.startsWith(`before-choosing:profile-exploration:use:${owner}:`)
    || key.startsWith(`before-choosing:growth-companion:use:${owner}:`)
    || key === `before-choosing:flow-progress:use:v1:${owner}`
    || (key.startsWith('before-choosing:dynamic-trial:') && key.endsWith(`:${owner}`))
    || (key.startsWith('before-choosing:trial-ui:') && key.endsWith(`:${owner}`));
}

export function clearCurrentUserMemoryStorage(
  userId: string,
  storage: Pick<Storage, 'key' | 'length' | 'removeItem'> = window.localStorage,
): void {
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key && isCurrentUserMemoryKey(key, userId)) keys.push(key);
  }
  keys.forEach(key => storage.removeItem(key));
}
