import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const experienceSource = readFileSync(new URL('../src/components/ExperienceInputScreen.tsx', import.meta.url), 'utf8');
const profileApiSource = readFileSync(new URL('../src/api/profile.ts', import.meta.url), 'utf8');
const trialScreenSource = readFileSync(new URL('../src/components/DynamicTrialTaskScreen.tsx', import.meta.url), 'utf8');
const cardPlaySource = readFileSync(new URL('../src/components/TrialCardPlayScreen.tsx', import.meta.url), 'utf8');
const verificationSource = readFileSync(new URL('../src/components/AbilityCardVerificationScreen.tsx', import.meta.url), 'utf8');

test('01 使用单一固定对话栏并以两类材料建立候选证据', () => {
  assert.match(experienceSource, /const \[coachInput, setCoachInput\]/);
  assert.equal(experienceSource.match(/<textarea/g)?.length, 1);
  assert.doesNotMatch(experienceSource, /Enter 发送/);
  assert.doesNotMatch(experienceSource, /写下一次项目、实习、比赛或长期兴趣/);
  assert.doesNotMatch(experienceSource, /handleSendMessage/);
  assert.match(experienceSource, /文本型 PDF 简历/);
  assert.match(experienceSource, /项目补充材料/);
  assert.match(experienceSource, /未确认内容不进入推荐/);
  assert.match(experienceSource, /发送回复/);
  assert.match(profileApiSource, /\/profile\/exploration\/messages/);
  assert.match(verificationSource, /候选项目经历卡/);
  assert.match(verificationSource, /合并所选卡片/);
  assert.match(verificationSource, /撤回项目经历卡/);
  assert.match(verificationSource, /onWithdrawConfirmedCard/);
});

test('进入 03 时先恢复三轮挑战，再由用户进入任务简报', () => {
  assert.match(trialScreenSource, /useState<'card-play' \| 'workbench'>\('card-play'\)/);
  assert.match(trialScreenSource, /initializedSessionRef/);
  assert.doesNotMatch(trialScreenSource, /trialPhaseKey/);
  assert.match(cardPlaySource, /index > lastUnlockedIndex/);
  assert.match(cardPlaySource, /查看任务简报/);
});
