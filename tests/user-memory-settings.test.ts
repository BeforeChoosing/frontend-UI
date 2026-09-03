import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  clearCurrentUserMemoryStorage,
  isCurrentUserMemoryKey,
} from '../src/services/userMemory';

class MemoryStorage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  has(key: string) {
    return this.values.has(key);
  }
}

test('清空记忆只移除当前账号的正式业务状态', () => {
  const currentUser = 'alice@example.com';
  const otherUser = 'bob@example.com';
  const currentOwner = encodeURIComponent(currentUser);
  const otherOwner = encodeURIComponent(otherUser);
  const storage = new MemoryStorage();
  const currentKeys = [
    `before-choosing:profile-exploration:use:${currentOwner}:v1`,
    `before-choosing:growth-companion:use:${currentOwner}:v1`,
    `before-choosing:flow-progress:use:v1:${currentOwner}`,
    `before-choosing:dynamic-trial:task-a:${currentOwner}`,
    `before-choosing:trial-ui:task-a:${currentOwner}`,
    'before-choosing:flow-progress:use:v1',
    'before-choosing:confirmed-experience:use',
  ];
  const retainedKeys = [
    `before-choosing:growth-companion:use:${otherOwner}:v1`,
    'before-choosing:growth-companion:demo:anonymous:v1',
    'before-choosing:auth-token',
  ];

  [...currentKeys, ...retainedKeys].forEach(key => storage.setItem(key, 'value'));
  clearCurrentUserMemoryStorage(currentUser, storage);

  currentKeys.forEach(key => assert.equal(storage.has(key), false, key));
  retainedKeys.forEach(key => assert.equal(storage.has(key), true, key));
  assert.equal(isCurrentUserMemoryKey(retainedKeys[0], currentUser), false);
});

test('设置页提供清空记忆二次确认并显示 1.1.0', () => {
  const settingsSource = readFileSync(
    new URL('../src/components/UserProfileScreen.tsx', import.meta.url),
    'utf8',
  );
  const packageJson = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
  ) as { version: string };

  assert.equal(packageJson.version, '1.1.0');
  assert.match(settingsSource, /清空所有记忆/);
  assert.match(settingsSource, /确认清空，从零开始/);
  assert.match(settingsSource, /版本 \{APP_VERSION\}/);
  assert.match(settingsSource, /role="alertdialog"/);
});

test('清空记忆接口使用不可误触的确认字串', () => {
  const apiSource = readFileSync(new URL('../src/api/profile.ts', import.meta.url), 'utf8');

  assert.match(apiSource, /method: 'DELETE'/);
  assert.match(apiSource, /confirmation: 'CLEAR_ALL_MEMORY'/);
});
