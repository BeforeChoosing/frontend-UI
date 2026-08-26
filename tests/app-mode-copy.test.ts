import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const switcherSource = readFileSync(new URL('../src/components/AppModeSwitcher.tsx', import.meta.url), 'utf8');
const experienceSource = readFileSync(new URL('../src/components/ExperienceInputScreen.tsx', import.meta.url), 'utf8');
const trialSource = readFileSync(new URL('../src/components/DynamicTrialTaskScreen.tsx', import.meta.url), 'utf8');
const workbenchSource = readFileSync(new URL('../src/components/TrialWorkbenchScreen.tsx', import.meta.url), 'utf8');

test('运行模式显示为演示和正式', () => {
  assert.match(switcherSource, /'演示'\s*:\s*'正式'/);
  assert.doesNotMatch(switcherSource, /'使用'/);
});

test('演示与正式流程不显示区别性操作文案', () => {
  const source = [experienceSource, trialSource, workbenchSource].join('\n');
  assert.doesNotMatch(source, /演示说明|演示数据|演示方案|整理演示经历|不调用 Qwen|无需输入|无需上传/);
  assert.match(experienceSource, /生成候选证据卡/);
  assert.match(workbenchSource, /提交任务并评价/);
});
