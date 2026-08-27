import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const stageTransitionSource = readFileSync(new URL('../src/components/StageTransition.tsx', import.meta.url), 'utf8');
const workbenchSource = readFileSync(new URL('../src/components/TrialWorkbenchScreen.tsx', import.meta.url), 'utf8');

test('整页切换保留弹簧，但不再执行全屏模糊或无限背景动画', () => {
  assert.match(stageTransitionSource, /type: 'spring'/);
  assert.doesNotMatch(stageTransitionSource, /filter\s*:/);
  assert.doesNotMatch(stageTransitionSource, /blur\(/);
  assert.doesNotMatch(appSource, /repeat:\s*Infinity/);
  assert.doesNotMatch(appSource, /mode="wait"/);
});

test('真实任务包含资料简报和独立工作台', () => {
  assert.match(workbenchSource, /阶段 03 · 真实工作台实战模拟/);
  assert.match(workbenchSource, /工作台资料库/);
  assert.match(workbenchSource, /实战工作台/);
  assert.match(workbenchSource, /任务教练/);
});
