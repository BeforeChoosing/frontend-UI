import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const switcherSource = readFileSync(new URL('../src/components/AppModeSwitcher.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const experienceSource = readFileSync(new URL('../src/components/ExperienceInputScreen.tsx', import.meta.url), 'utf8');
const trialSource = readFileSync(new URL('../src/components/DynamicTrialTaskScreen.tsx', import.meta.url), 'utf8');
const workbenchSource = readFileSync(new URL('../src/components/TrialWorkbenchScreen.tsx', import.meta.url), 'utf8');
const landingSource = readFileSync(new URL('../src/components/LandingHero.tsx', import.meta.url), 'utf8');
const apiClientSource = readFileSync(new URL('../src/api/client.ts', import.meta.url), 'utf8');

test('生产默认使用同源 API，不会请求访问者电脑的 localhost', () => {
  assert.match(apiClientSource, /VITE_API_BASE_URL \|\| '\/api\/v1'/);
  assert.doesNotMatch(apiClientSource, /localhost:8000/);
});

test('运行模式显示为演示和正式', () => {
  assert.match(switcherSource, /'演示'\s*:\s*'正式'/);
  assert.match(switcherSource, /重新演示/);
  assert.match(appSource, /resetDemoReplayStorage\(\)/);
  assert.match(appSource, /setCurrentScreen\('landing'\)/);
  assert.doesNotMatch(switcherSource, /'使用'/);
});

test('首页完整呈现产品概览源码中的七段内容', () => {
  assert.match(landingSource, /before\.choosing 不只是为一件事/);
  assert.match(landingSource, /把真实经历变成可确认的能力证据/);
  assert.match(landingSource, /看见经历里/);
  assert.match(landingSource, /基于当前画像的方向比较/);
  assert.match(landingSource, /AI 产品经理：搜索改版方案/);
  assert.match(landingSource, /让行动改变画像/);
  assert.match(landingSource, /你的数字分身，会跟着经历一起变化/);
  assert.match(landingSource, /你的职业答案/);
  assert.match(landingSource, /职业数字分身与试路验证/);
  assert.doesNotMatch(landingSource, /人们如何使用「选择之前」/);
});

test('演示与正式流程不显示区别性操作文案', () => {
  const source = [experienceSource, trialSource, workbenchSource].join('\n');
  assert.doesNotMatch(source, /演示说明|演示数据|演示方案|整理演示经历|不调用 Qwen|无需输入|无需上传/);
  assert.match(experienceSource, /直接根据材料生成候选能力卡/);
  assert.match(experienceSource, /新建空白对话/);
  assert.match(workbenchSource, /提交任务并评价/);
});
