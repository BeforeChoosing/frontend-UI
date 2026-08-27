import assert from 'node:assert/strict';
import test from 'node:test';
import { resetDemoReplayStorage } from '../src/services/demoReplay';

function createStorage(initial: Record<string, string>) {
  const values = new Map(Object.entries(initial));
  return {
    get length() { return values.size; },
    key(index: number) { return Array.from(values.keys())[index] ?? null; },
    removeItem(key: string) { values.delete(key); },
    has(key: string) { return values.has(key); },
  };
}

test('重新演示只清除演示命名空间', () => {
  const storage = createStorage({
    'before-choosing:profile-exploration:demo:messages-v3': 'demo-chat',
    'before-choosing:dynamic-trial:demo:A-02': 'demo-session',
    'before-choosing:trial-ui:demo:A-02:step': '2',
    'before-choosing:confirmed-experience:demo': 'demo-experience',
    'before-choosing:flow-progress:demo:v1': 'demo-flow',
    'before-choosing:flow-progress:use:v1': 'formal-flow',
    'before-choosing:profile-exploration:use:messages-v3': 'formal-chat',
    'before-choosing:dynamic-trial:A-02': 'formal-session',
    'before-choosing:app-mode:v1': 'demo',
  });

  resetDemoReplayStorage(storage);

  assert.equal(storage.has('before-choosing:profile-exploration:demo:messages-v3'), false);
  assert.equal(storage.has('before-choosing:dynamic-trial:demo:A-02'), false);
  assert.equal(storage.has('before-choosing:trial-ui:demo:A-02:step'), false);
  assert.equal(storage.has('before-choosing:confirmed-experience:demo'), false);
  assert.equal(storage.has('before-choosing:flow-progress:demo:v1'), false);
  assert.equal(storage.has('before-choosing:flow-progress:use:v1'), true);
  assert.equal(storage.has('before-choosing:profile-exploration:use:messages-v3'), true);
  assert.equal(storage.has('before-choosing:dynamic-trial:A-02'), true);
  assert.equal(storage.has('before-choosing:app-mode:v1'), true);
});
