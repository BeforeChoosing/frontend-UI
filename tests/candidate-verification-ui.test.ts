import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { CandidateAbilityCard, getCandidateEvidenceLabel } from '../src/components/CandidateAbilityCard';
import { AbilityCardVerificationScreen } from '../src/components/AbilityCardVerificationScreen';
import { GrowthCompanionWidget } from '../src/components/GrowthCompanionWidget';
import { UserProfileScreen } from '../src/components/UserProfileScreen';
import { DEMO_SKILL_CARDS, DEMO_PROFILE_EVIDENCE } from '../src/data/demoMode';

const noop = () => {};
test('证据标签使用卡片元数据，不把第一张卡或自述提升为已证实事实', () => {
  assert.equal(getCandidateEvidenceLabel(DEMO_SKILL_CARDS[0]), '来自你的自述');
  assert.equal(getCandidateEvidenceLabel(DEMO_SKILL_CARDS[1]), '基于经历的解读，待你确认');
  assert.equal(getCandidateEvidenceLabel({ ...DEMO_SKILL_CARDS[0], claimLevel: 'hypothesis' }), '这是推测，待你确认');
  assert.equal(getCandidateEvidenceLabel({ ...DEMO_SKILL_CARDS[0], claimLevel: undefined, evidenceType: undefined }), '证据来源待核对');
});
const candidateProps = {
  card: DEMO_SKILL_CARDS[0], index: 0, status: 'confirmed' as const,
  evidenceLabel: '来自当前材料', flipped: false, editing: false, editTitle: '', editDesc: '', mergeSelected: false,
  onStatus: noop, onFlip: noop, onEdit: noop, onEditTitle: noop, onEditDesc: noop, onSave: noop, onCancel: noop, onMerge: noop,
};

test('Demo 风格候选卡保留选择、编辑、证据与合并入口', () => {
  const html = renderToStaticMarkup(React.createElement(CandidateAbilityCard, candidateProps));
  for (const label of ['翻转查证据', '选择合并', '待确认', '不像我', '来自当前材料']) assert.ok(html.includes(label));
  assert.match(html, /aria-label="收录用户痛点洞察" aria-pressed="true"/);
  assert.match(html, /aria-label="编辑用户痛点洞察"/);
  assert.ok(html.includes(DEMO_SKILL_CARDS[0].evidenceQuote!));
  assert.ok(html.includes(DEMO_SKILL_CARDS[0].sourceRefs![0]));
});

test('翻转后的隐藏卡面退出键盘和辅助技术交互', () => {
  const html = renderToStaticMarkup(React.createElement(CandidateAbilityCard, { ...candidateProps, flipped: true }));
  assert.match(html, /aria-hidden="true" inert=""/);
  assert.equal((html.match(/inert=""/g) || []).length, 1);
});

test('编辑状态展示名称和描述，空名称无法保存', () => {
  const html = renderToStaticMarkup(React.createElement(CandidateAbilityCard, { ...candidateProps, editing: true }));
  assert.match(html, /aria-label="能力名称"/);
  assert.match(html, /aria-label="能力一句话描述"/);
  assert.match(html, /disabled=""[^>]*>保存<\/button>/);
});

test('空候选列表不虚构卡片，也不能收录', () => {
  const html = renderToStaticMarkup(React.createElement(AbilityCardVerificationScreen, {
    initialCards: [], initialExperience: null, allAccumulatedCards: [],
    onConfirmAndSaveToPool: noop, onWithdrawConfirmedCard: noop, onContinueSupplement: noop,
    onStartCareerExplore: noop, onModifyExperience: noop, onRegenerate: noop,
  }));
  assert.ok(html.includes('还没有候选能力卡'));
  assert.match(html, /id="btn-save-cards-to-pool" disabled=""/);
  assert.doesNotMatch(html, /<article/);
});

test('成长陪伴显示为 Demo 风格浮动入口，并提供辅助对话面板', () => {
  const html = renderToStaticMarkup(React.createElement(GrowthCompanionWidget, { demoMode: true, currentScreen: 'input-experience', onContinue: noop }));
  assert.match(html, /fixed/);
  assert.match(html, /aria-label="成长陪伴 Agent" aria-expanded="false"/);
  assert.ok(html.includes('陪伴'));
  assert.ok(html.includes('growth-companion-panel'));
  const source = readFileSync(new URL('../src/components/GrowthCompanionWidget.tsx', import.meta.url), 'utf8');
  assert.match(source, /DEMO_REPLIES/);
  assert.match(source, /demoTypingTimerRef/);
  assert.match(source, /streamProfileExplorationMessage/);
  assert.match(source, /agent-stream-cursor/);
  assert.match(source, /profile-exploration.*evidence-v3/);
});

test('个人画像页采用 Demo 拱形卡、悬停详情与真实档案数量', () => {
  const source = readFileSync(new URL('../src/components/UserProfileScreen.tsx', import.meta.url), 'utf8');
  assert.match(source, /id="arch-card-skills"/);
  assert.match(source, /id="arch-card-paths"/);
  assert.match(source, /id="arch-card-reports"/);
  assert.match(source, /count=\{allDisplayCards\.length\}/);
  assert.match(source, /count=\{livePaths\.length\}/);
  assert.match(source, /count=\{liveReports\.length\}/);
  assert.match(source, /handleInteractiveAreaLeave/);
  assert.match(source, /setTimeout\(\(\) => setHoveredCard\(null\), 150\)/);
  assert.match(source, /useReducedMotion/);
  assert.match(source, /AI 最近注意到……/);
  assert.match(source, /ProfileArchiveModal/);
});

test('档案页只调整桌面布局，保留原有拱形卡与弹簧动画', () => {
  const profile = readFileSync(new URL('../src/components/UserProfileScreen.tsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(profile, /translateY\(-8px\) rotate\(-3\.5deg\) scale\(1\.02\)/);
  assert.match(profile, /type: 'spring', stiffness: 360, damping: 26, mass: 0\.7/);
  assert.match(profile, /<AnimatePresence mode="popLayout">/);
  assert.match(css, /grid-template-columns: repeat\(3, minmax\(142px, 180px\)\) minmax\(300px, 1fr\)/);
  assert.match(css, /\.profile-interactive \.profile-hover-panel \{\s*grid-column: 4;\s*grid-row: 1/);
  assert.doesNotMatch(profile, /growth-activity-title" className="mt-auto/);
});

test('成长档案空态不展示 Demo 数字，卡库统计随输入变化', () => {
  const props = { auth: { isLoggedIn: false }, onNavigate: noop, onOpenCardDetail: noop };
  const emptyHtml = renderToStaticMarkup(React.createElement(UserProfileScreen, props));
  assert.match(emptyHtml, /完成经历提取并确认能力卡后/);
  assert.match(emptyHtml, /完成任务后，AI 会从真实评价中整理近期观察/);
  assert.doesNotMatch(emptyHtml, /林曦|已累积 14/);
  const populatedHtml = renderToStaticMarkup(React.createElement(UserProfileScreen, { ...props, persistedCards: DEMO_SKILL_CARDS.slice(0, 2) }));
  assert.match(populatedHtml, /已确认 2 张能力卡，完成 0 个小任务/);
});

test('最近成长记录按时间倒序展示三条真实证据，空态不生成记录', () => {
  const props = { auth: { isLoggedIn: false }, onNavigate: noop, onOpenCardDetail: noop };
  const empty = renderToStaticMarkup(React.createElement(UserProfileScreen, props));
  assert.match(empty, /还没有任务记录/);
  const evidence = [1, 4, 2, 3].map(day => ({
    ...DEMO_PROFILE_EVIDENCE[0], session_id: `session-${day}`, task_id: `task-${day}`,
    created_at: `2026-08-0${day}T10:00:00+08:00`,
  }));
  const html = renderToStaticMarkup(React.createElement(UserProfileScreen, { ...props, profileEvidence: evidence }));
  const activity = html.slice(html.indexOf('<section aria-labelledby="growth-activity-title"'));
  assert.ok(activity.indexOf('task-4') < activity.indexOf('task-3'));
  assert.ok(activity.indexOf('task-3') < activity.indexOf('task-2'));
  assert.ok(!activity.includes('task-1'));
  assert.match(activity, /查看任务证据/);
  assert.deepEqual(evidence.map(record => record.task_id), ['task-1', 'task-4', 'task-2', 'task-3']);
});

test('档案入口接通陪伴，并保留键盘关闭及小屏详情布局', () => {
  const profile = readFileSync(new URL('../src/components/UserProfileScreen.tsx', import.meta.url), 'utf8');
  const companion = readFileSync(new URL('../src/components/GrowthCompanionWidget.tsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(profile, /CustomEvent\('open-agent-chat', \{ detail: \{ agentId: 'growth_companion'/);
  assert.match(companion, /addEventListener\('open-agent-chat', openCompanion\)/);
  assert.match(companion, /removeEventListener\('open-agent-chat', openCompanion\)/);
  assert.match(profile, /dialog\?\.showModal\(\)/);
  assert.match(profile, /onCancel=\{\(event\) => \{ event.preventDefault\(\); onClose\(\); \}\}/);
  assert.match(profile, /setActiveArchive\(null\); onOpenCardDetail\(card\)/);
  assert.match(profile, /\(hover: hover\) and \(pointer: fine\)/);
  assert.match(css, /\.profile-interactive \.profile-hover-panel \{\s*grid-column: 1 \/ -1/);
});

test('追问输入提示采用随心输入，保留既有回车提交处理', () => {
  const source = readFileSync(new URL('../src/components/ExperienceInputScreen.tsx', import.meta.url), 'utf8');
  assert.match(source, /placeholder=\{demoMode && demoProbingActive\s*\? '随心输入'/);
  assert.match(source, /handleExperienceComposerKeyDown/);
});

test('完成 03 后自动更新能力卡并直接进入 Demo 卡池结果页', () => {
  const dynamicSource = readFileSync(new URL('../src/components/DynamicTrialTaskScreen.tsx', import.meta.url), 'utf8');
  const endSource = readFileSync(new URL('../src/components/TrialExperienceEndScreen.tsx', import.meta.url), 'utf8');
  assert.match(dynamicSource, /AutomaticTrialAbilityUpdate/);
  assert.match(dynamicSource, /Promise\.resolve\(onUpdateCards\?\.\(updatedCards\)\)/);
  assert.match(dynamicSource, /onUpdateCards=\{onUpdateCardsFromTrial\}/);
  for (const label of ['能力库已成功同步更新', '进入我的档案', '继续探索其他职业']) assert.ok(endSource.includes(label));
  assert.doesNotMatch(endSource, /更新能力库|认可|待定|排除/);
});
