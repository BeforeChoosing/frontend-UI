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
const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const authModalSource = readFileSync(new URL('../src/components/AuthModal.tsx', import.meta.url), 'utf8');

test('01 使用完整聊天记录、单一输入框和对话附件建立候选证据', () => {
  assert.match(experienceSource, /const \[coachInput, setCoachInput\]/);
  assert.equal(experienceSource.match(/<textarea/g)?.length, 1);
  assert.match(experienceSource, /event\.key === 'Enter' && !event\.shiftKey/);
  assert.match(experienceSource, /profile-composer-main flex items-end gap-2/);
  assert.doesNotMatch(experienceSource, /handleSendMessage/);
  assert.match(experienceSource, /uploadedFiles\.length/);
  assert.match(experienceSource, /我会用几个问题陪你把细节补完整/);
  assert.match(explorationHookSource, /你刚才发送的内容已经保留/);
  assert.match(explorationHookSource, /cause instanceof Error \? cause\.message/);
  assert.match(experienceSource, /handleTriggerUpload/);
  assert.match(experienceSource, /发送交流/);
  assert.match(experienceSource, /直接根据材料生成候选能力卡/);
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
  assert.match(experienceSource, /setDemoProbingInput\(''\)/);
  assert.match(experienceSource, /window\.setInterval/);
  assert.match(experienceSource, /prefers-reduced-motion/);
  assert.match(experienceSource, /if \(demoMode\) \{/);
  assert.match(experienceSource, /setDemoProbingActive\(true\)/);
  assert.match(experienceSource, /成长陪伴 Agent · 经历深度挖掘/);
  assert.match(experienceSource, /第 \$\{demoProbingRoundIndex \+ 1\}\/4 轮追问/);
  assert.ok(experienceSource.indexOf('if (demoMode) {') < experienceSource.indexOf('const response = await exploreProfile'));
});

test('成长陪伴隐藏内部标签并把下一步建议只追加到输入框', () => {
  assert.doesNotMatch(experienceSource, /message\.detectedSignals\.map/);
  assert.doesNotMatch(experienceSource, /latestAiMessage\.detectedSignals/);
  assert.doesNotMatch(experienceSource, /msg\.detectedSignals\.map/);
  assert.match(experienceSource, /suggestedReplies: response\.suggested_replies/);
  assert.match(experienceSource, /下一步回复建议 · 点击填入后可继续编辑/);
  assert.match(experienceSource, /current\.trimEnd\(\).*\\n.*suggestion/s);
  assert.match(experienceSource, /requestAnimationFrame\(\(\) => textareaRef\.current\?\.focus\(\)\)/);
  assert.doesNotMatch(experienceSource, /onDoubleClick=\{\(\) => handleDemoProbingSubmit/);
  assert.match(experienceSource, /message\.model.*缓存命中.*实时生成/);
});

test('正式对话最多四轮 STAR 追问，恢复历史后仍保留边界', () => {
  assert.match(experienceSource, /starDimension: response\.star_dimension/);
  assert.match(experienceSource, /deriveStarHistory\(conversation\.messages\)/);
  assert.match(experienceSource, /if \(starHistory\.length >= 4\)/);
  assert.match(experienceSource, /继续整理当前经历/);
  assert.match(experienceSource, /即刻生成能力卡/);
  assert.doesNotMatch(experienceSource, /await handleStartAnalysis\(nextEvidenceText/);
});

test('01 首段提交后锁定页面，仅允许对话记录滚动', () => {
  assert.match(experienceSource, /focusedConversationActive/);
  assert.match(experienceSource, /document\.documentElement\.style\.overflow = 'hidden'/);
  assert.match(styleSource, /height: 100dvh/);
  assert.match(styleSource, /\.profile-chat-scroll \{[\s\S]*?overflow-y: auto;[\s\S]*?overscroll-behavior: contain;/);
  assert.match(experienceSource, /className="profile-composer z-20 shrink-0"/);
  assert.doesNotMatch(experienceSource, /React\.createElement\('textarea'/);
  assert.doesNotMatch(experienceSource, /if \(focusedConversationActive\) \{\s*return/);
  assert.match(experienceSource, /\{showUploadModal &&/);
  assert.match(experienceSource, /成长陪伴对话记录/);
  assert.match(experienceSource, /当前正在处理/);
  assert.doesNotMatch(experienceSource, /已轮到你，Agent 正在处理/);
  assert.match(styleSource, /\.experience-screen \{[\s\S]*?max-width: 896px;/);
  assert.doesNotMatch(styleSource, /--profile-composer-height/);
  assert.match(experienceSource, /profile-composer-main flex items-end gap-2/);
  assert.match(experienceSource, /flex h-8 shrink-0 items-center justify-center/);
  assert.doesNotMatch(styleSource, /\.experience-screen \.profile-composer-input[\s\S]*?max-height: 64px/);
});

test('正式模式可新建真正空白对话，并从页面恢复账号内历史', () => {
  assert.match(experienceSource, /setCoachInput\(demoMode \? demoExperienceText : ''\)/);
  assert.match(experienceSource, /setTargetCareerState\(demoMode \? 'has_target' : 'unselected'\)/);
  assert.match(experienceSource, /setTargetRole\(demoMode \? DEFAULT_TARGET_ROLE : ''\)/);
  assert.match(experienceSource, /conversations-v1/);
  assert.match(experienceSource, /历史对话/);
  assert.match(experienceSource, /restoreConversation/);
  assert.match(experienceSource, /!demoMode && !userId/);
});

test('整理后由用户决定继续当前经历或保留历史并新建对话', () => {
  assert.match(verificationSource, /继续当前经历/);
  assert.match(verificationSource, /更换一段经历/);
  assert.match(appSource, /setProfileNewConversationRequest\(value => value \+ 1\)/);
  assert.match(experienceSource, /handledNewConversationRequestRef/);
});

test('正式对话同步服务器并展示本轮实际模型与缓存状态', () => {
  assert.match(experienceSource, /messages\.slice\(-49\)/);
  assert.match(experienceSource, /listProfileConversationSnapshots\(50\)/);
  assert.match(experienceSource, /upsertProfileConversationSnapshot/);
  assert.match(experienceSource, /缓存命中/);
  assert.match(experienceSource, /实时生成/);
  assert.match(profileApiSource, /\/profile\/conversation-snapshots/);
});

test('正式首页不强制登录，进入阶段时才打开可关闭登录层', () => {
  assert.match(appSource, /screen !== 'landing'/);
  assert.match(appSource, /setPendingScreen\(screen\)/);
  assert.match(appSource, /isOpen=\{isAuthOpen\}/);
  assert.doesNotMatch(appSource, /isOpen=\{isAuthOpen \|\|/);
  assert.match(authModalSource, /onClick=\{onClose\}/);
  assert.match(authModalSource, /忘记密码/);
  assert.match(authModalSource, /6 位邮箱验证码/);
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

test('03 能力应用支持当前任务生成的待验证能力', () => {
  assert.match(cardPlaySource, /answer\.pending_abilities/);
  assert.match(cardPlaySource, /待验证能力/);
  assert.match(cardPlaySource, /border-dashed border-amber-300/);
  assert.match(cardPlaySource, /availableCards/);
  assert.doesNotMatch(cardPlaySource, /filter\(ability => ability\.challenge_id === challenge\.id\)/);
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
