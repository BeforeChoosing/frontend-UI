import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createLocalDemoTrialSession,
  getLocalDemoTrialCatalog,
  getLocalDemoTrialTask,
} from '../src/data/demoTrialCatalog';
import { isApiRequestAllowedInMode, shouldAttachAccessToken } from '../src/services/requestModePolicy';

test('演示试路目录和会话完全由前端构造', () => {
  const catalog = getLocalDemoTrialCatalog();
  const task = getLocalDemoTrialTask('A-02');
  const session = createLocalDemoTrialSession(task);

  assert.deepEqual(catalog.map(item => item.id), ['F-01', 'A-01', 'A-02', 'A-03']);
  assert.equal(session.task_id, 'A-02');
  assert.equal(session.id.startsWith('demo-local-'), true);
  assert.equal(session.answer.card_play_rounds.length, task.ability_challenges.length);
});

test('演示模式永远不自动携带正式账号令牌', () => {
  assert.equal(shouldAttachAccessToken('demo'), false);
  assert.equal(shouldAttachAccessToken('use'), true);
  assert.equal(isApiRequestAllowedInMode('/trial/workbench/sessions', 'demo'), false);
  assert.equal(isApiRequestAllowedInMode('/profile', 'demo'), false);
  assert.equal(isApiRequestAllowedInMode('/auth/login', 'demo'), true);
  assert.equal(isApiRequestAllowedInMode('/trial/workbench/sessions', 'use'), true);
});
