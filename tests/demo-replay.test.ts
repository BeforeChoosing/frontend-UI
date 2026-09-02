import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clearLegacyDemoTrialSessionStorage,
  resetDemoReplayStorage,
} from '../src/services/demoReplay';

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

test('升级后只清理旧演示服务端会话引用', () => {
  const storage = createStorage({
    'before-choosing:dynamic-trial:demo:A-01': 'legacy-demo-session',
    'before-choosing:trial-ui:demo:A-01:step': '2',
    'before-choosing:dynamic-trial:A-01:user-a': 'formal-session',
  });

  clearLegacyDemoTrialSessionStorage(storage);

  assert.equal(storage.has('before-choosing:dynamic-trial:demo:A-01'), false);
  assert.equal(storage.has('before-choosing:trial-ui:demo:A-01:step'), true);
  assert.equal(storage.has('before-choosing:dynamic-trial:A-01:user-a'), true);
});
