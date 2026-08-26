import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const experienceSource = readFileSync(new URL('../src/components/ExperienceInputScreen.tsx', import.meta.url), 'utf8');
const profileApiSource = readFileSync(new URL('../src/api/profile.ts', import.meta.url), 'utf8');
const trialScreenSource = readFileSync(new URL('../src/components/DynamicTrialTaskScreen.tsx', import.meta.url), 'utf8');
const cardPlaySource = readFileSync(new URL('../src/components/TrialCardPlayScreen.tsx', import.meta.url), 'utf8');

test('经历草稿与能力教练交流使用独立输入状态', () => {
  assert.match(experienceSource, /const \[inputText, setInputText\]/);
  assert.match(experienceSource, /const \[coachInput, setCoachInput\]/);
  assert.doesNotMatch(experienceSource, /Enter 发送/);
  assert.doesNotMatch(experienceSource, /handleSendMessage/);
  assert.match(experienceSource, /发送给能力教练/);
  assert.match(profileApiSource, /\/profile\/exploration\/messages/);
});

test('进入 03 时先恢复三轮挑战，再由用户进入任务简报', () => {
  assert.match(trialScreenSource, /useState<'card-play' \| 'workbench'>\('card-play'\)/);
  assert.match(trialScreenSource, /initializedSessionRef/);
  assert.doesNotMatch(trialScreenSource, /trialPhaseKey/);
  assert.match(cardPlaySource, /index > lastUnlockedIndex/);
  assert.match(cardPlaySource, /查看任务简报/);
});
