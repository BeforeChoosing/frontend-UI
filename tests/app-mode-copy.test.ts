import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const switcherSource = readFileSync(new URL('../src/components/AppModeSwitcher.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const experienceSource = readFileSync(new URL('../src/components/ExperienceInputScreen.tsx', import.meta.url), 'utf8');
const trialSource = readFileSync(new URL('../src/components/DynamicTrialTaskScreen.tsx', import.meta.url), 'utf8');
const workbenchSource = readFileSync(new URL('../src/components/TrialWorkbenchScreen.tsx', import.meta.url), 'utf8');
const landingSource = readFileSync(new URL('../src/components/LandingHero.tsx', import.meta.url), 'utf8');

test('运行模式显示为演示和正式', () => {
  assert.match(switcherSource, /'演示'\s*:\s*'正式'/);
  assert.match(switcherSource, /重新演示/);
  assert.match(appSource, /resetDemoReplayStorage\(\)/);
  assert.match(appSource, /setCurrentScreen\('landing'\)/);
  assert.doesNotMatch(switcherSource, /'使用'/);
});

test('首页底部保留原 Demo 人物与奖项展示', () => {
  assert.match(landingSource, /人们如何使用「选择之前」/);
  assert.doesNotMatch(landingSource, /不同经历，都能从这里开始/);
  assert.match(landingSource, /能力迁移、目标清单、潜能验证/);
  assert.match(landingSource, /App Store 体验/);
  assert.match(landingSource, /></);
  assert.match(landingSource, /Apple 设计美学/);
  assert.match(landingSource, /Webby 奖项/);
  assert.match(landingSource, /德国设计奖/);
});

test('演示与正式流程不显示区别性操作文案', () => {
  const source = [experienceSource, trialSource, workbenchSource].join('\n');
  assert.doesNotMatch(source, /演示说明|演示数据|演示方案|整理演示经历|不调用 Qwen|无需输入|无需上传/);
  assert.match(experienceSource, /分析经历/);
  assert.match(experienceSource, /重新开始对话/);
  assert.match(workbenchSource, /提交任务并评价/);
});
