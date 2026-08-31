import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { selectMapTasks } from '../src/components/TrialTaskMapScreen';
import type { ApiTrialTaskDefinition, TrialTaskId } from '../src/types/api';

const experienceSource = readFileSync(new URL('../src/components/ExperienceInputScreen.tsx', import.meta.url), 'utf8');
const profileSkillsSource = readFileSync(new URL('../src/features/profile/profileSkills.ts', import.meta.url), 'utf8');
const explorationHookSource = readFileSync(new URL('../src/hooks/useProfileExploration.ts', import.meta.url), 'utf8');
const profileApiSource = readFileSync(new URL('../src/api/profile.ts', import.meta.url), 'utf8');
const trialScreenSource = readFileSync(new URL('../src/components/DynamicTrialTaskScreen.tsx', import.meta.url), 'utf8');
const trialMapSource = readFileSync(new URL('../src/components/TrialTaskMapScreen.tsx', import.meta.url), 'utf8');
const styleSource = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
const cardPlaySource = readFileSync(new URL('../src/components/TrialCardPlayScreen.tsx', import.meta.url), 'utf8');
const verificationSource = readFileSync(new URL('../src/components/AbilityCardVerificationScreen.tsx', import.meta.url), 'utf8');

test('01 使用完整聊天记录、单一输入框和对话附件建立候选证据', () => {
  assert.match(experienceSource, /const \[coachInput, setCoachInput\]/);
  assert.equal(experienceSource.match(/<textarea/g)?.length, 1);
  assert.match(experienceSource, /Enter \{demoMode && demoProbingActive \? '提交' : '发送'\}/);
  assert.match(experienceSource, /Shift\+Enter 换行/);
  assert.doesNotMatch(experienceSource, /handleSendMessage/);
  assert.match(experienceSource, /附件和文字都会进入当前对话记录/);
  assert.match(experienceSource, /我会陪你下钻追问并提炼能力卡/);
  assert.match(explorationHookSource, /你刚才发送的内容已经保留/);
  assert.match(explorationHookSource, /cause instanceof Error \? cause\.message/);
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

test('01 探索目标与斜杠快捷指令接入现有分析链路', () => {
  assert.match(experienceSource, /我有目标职业/);
  assert.match(experienceSource, /我还没有明确方向/);
  assert.match(experienceSource, /target_role: targetCareerState === 'has_target'/);
  assert.match(profileSkillsSource, /command: '\/extract'/);
  assert.match(profileSkillsSource, /command: '\/experience'/);
  assert.match(profileSkillsSource, /command: '\/target'/);
  assert.match(profileSkillsSource, /requiresEvidence/);
  assert.match(profileSkillsSource, /outcome: 'candidate-cards'/);
  assert.match(experienceSource, /executeProfileSkill/);
  assert.match(experienceSource, /auditEvent\('profile_skill_invoked'/);
  assert.match(experienceSource, /快捷指令/);
  assert.match(experienceSource, /coachInput\.trim\(\)\.startsWith\('\/'\)/);
});

test('演示模式固定回复后进入四轮成长陪伴追问且不调用模型', () => {
  assert.match(experienceSource, /const DEMO_PROBING_REPLY/);
  assert.match(experienceSource, /const DEMO_PROBING_ROUNDS/);
  assert.match(experienceSource, /defaultAnswer:/);
  assert.match(experienceSource, /setDemoProbingInput\(DEMO_PROBING_ROUNDS\[0\]\.defaultAnswer\)/);
  assert.match(experienceSource, /setDemoProbingInput\(DEMO_PROBING_ROUNDS\[nextRoundIndex\]\.defaultAnswer\)/);
  assert.match(experienceSource, /window\.setInterval/);
  assert.match(experienceSource, /prefers-reduced-motion/);
  assert.match(experienceSource, /if \(demoMode\) \{/);
  assert.match(experienceSource, /setDemoProbingActive\(true\)/);
  assert.match(experienceSource, /成长陪伴 Agent · 经历深度挖掘/);
  assert.match(experienceSource, /第 \$\{demoProbingRoundIndex \+ 1\}\/4 轮追问/);
  assert.ok(experienceSource.indexOf('if (demoMode) {') < experienceSource.indexOf('const response = await exploreProfile'));
});

test('01 首段提交后锁定页面，仅允许对话记录滚动', () => {
  assert.match(experienceSource, /focusedConversationActive/);
  assert.match(experienceSource, /document\.documentElement\.style\.overflow = 'hidden'/);
  assert.match(styleSource, /height: 100dvh/);
  assert.match(styleSource, /\.profile-chat-scroll \{[\s\S]*?overflow-y: auto;[\s\S]*?overscroll-behavior: contain;/);
  assert.match(styleSource, /\.profile-composer \{[\s\S]*?flex: 0 0 auto;/);
  assert.doesNotMatch(experienceSource, /React\.createElement\('textarea'/);
  assert.doesNotMatch(experienceSource, /if \(focusedConversationActive\) \{\s*return/);
  assert.match(experienceSource, /\{showUploadModal &&/);
  assert.match(experienceSource, /成长陪伴对话记录/);
  assert.match(experienceSource, /当前正在处理/);
  assert.doesNotMatch(experienceSource, /已轮到你，Agent 正在处理/);
  assert.match(styleSource, /--profile-composer-height: clamp\(180px, 22vh, 224px\)/);
  assert.match(experienceSource, /profile-composer-main flex min-h-0 flex-1 items-end gap-2/);
  assert.match(experienceSource, /className="craft-btn-black flex shrink-0 items-center/);
  assert.doesNotMatch(styleSource, /\.experience-screen \.profile-composer-input[\s\S]*?max-height: 64px/);
});

test('03 试路地图采用 Demo 的八环节路径与三张直接启动任务卡', () => {
  assert.match(trialMapSource, /发现 AI 机会/);
  assert.match(trialMapSource, /设计 Agent 工作流/);
  assert.match(trialMapSource, /Bad Case 诊断/);
  assert.match(trialMapSource, /模型评测/);
  assert.match(trialMapSource, /Application \/ Agent PM 试路地图/);
  assert.match(trialMapSource, /推荐从以下 3 个代表性工作片段开始体验/);
  assert.match(trialMapSource, /onStart\(task\.id\)/);
  assert.match(trialScreenSource, /onStart=\{\(taskId\) =>/);
});

test('进入 03 时先恢复三轮挑战，再由用户进入任务简报', () => {
  assert.match(trialScreenSource, /useState<'card-play' \| 'workbench'>\('card-play'\)/);
  assert.match(trialScreenSource, /initializedSessionRef/);
  assert.doesNotMatch(trialScreenSource, /trialPhaseKey/);
  assert.match(cardPlaySource, /index > lastUnlockedIndex/);
  assert.match(cardPlaySource, /查看任务简报/);
});

const mapFixtures = (ids: TrialTaskId[]) => ids.map(id => ({ id, title: `${id} 原始任务`, goal: `${id} 原始目标` } as ApiTrialTaskDefinition));

test('地图按 Demo 顺序展示三个任务，保留后端原始内容', () => {
  const tasks = mapFixtures(['A-01', 'M-02', 'F-01', 'A-02']);
  const displayed = selectMapTasks(tasks, 'A-02');
  assert.deepEqual(displayed.map(task => task.id), ['F-01', 'A-02', 'A-01']);
  for (const task of displayed) assert.equal(task, tasks.find(original => original.id === task.id));
});

test('02 推荐的非默认任务不会在地图中丢失', () => {
  assert.deepEqual(selectMapTasks(mapFixtures(['F-01', 'A-02', 'A-01', 'M-02']), 'M-02').map(task => task.id), ['F-01', 'A-02', 'M-02']);
});

test('目录缺项时地图仅使用可用任务，不重复或虚构任务', () => {
  assert.deepEqual(selectMapTasks(mapFixtures(['M-02', 'A-01']), 'F-01').map(task => task.id), ['A-01', 'M-02']);
  assert.deepEqual(selectMapTasks([], 'F-01'), []);
});
