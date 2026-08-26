import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const experienceSource = readFileSync(new URL('../src/components/ExperienceInputScreen.tsx', import.meta.url), 'utf8');
const explorationHookSource = readFileSync(new URL('../src/hooks/useProfileExploration.ts', import.meta.url), 'utf8');
const profileApiSource = readFileSync(new URL('../src/api/profile.ts', import.meta.url), 'utf8');
const trialScreenSource = readFileSync(new URL('../src/components/DynamicTrialTaskScreen.tsx', import.meta.url), 'utf8');
const cardPlaySource = readFileSync(new URL('../src/components/TrialCardPlayScreen.tsx', import.meta.url), 'utf8');
const verificationSource = readFileSync(new URL('../src/components/AbilityCardVerificationScreen.tsx', import.meta.url), 'utf8');

test('01 使用完整聊天记录、单一输入框和对话附件建立候选证据', () => {
  assert.match(experienceSource, /const \[coachInput, setCoachInput\]/);
  assert.equal(experienceSource.match(/<textarea/g)?.length, 1);
  assert.match(experienceSource, /Enter 发送/);
  assert.match(experienceSource, /Shift\+Enter 换行/);
  assert.doesNotMatch(experienceSource, /handleSendMessage/);
  assert.match(experienceSource, /整段用户对话和附件正文/);
  assert.match(experienceSource, /和你一起把其中的行动与能力线索理清/);
  assert.match(explorationHookSource, /你刚才发送的内容已经保留/);
  assert.match(experienceSource, /handleTriggerUpload/);
  assert.match(experienceSource, /发送交流/);
  assert.match(experienceSource, /分析经历/);
  assert.doesNotMatch(experienceSource, />\s*助手\s*</);
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
