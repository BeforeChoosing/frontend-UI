import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { CandidateAbilityCard, getCandidateEvidenceLabel } from '../src/components/CandidateAbilityCard';
import { AbilityCardVerificationScreen } from '../src/components/AbilityCardVerificationScreen';
import { GrowthCompanionWidget } from '../src/components/GrowthCompanionWidget';
import { DEMO_SKILL_CARDS } from '../src/data/demoMode';

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
  assert.match(source, /createProfileExplorationMessage/);
  assert.match(source, /profile-exploration.*evidence-v3/);
});

test('追问输入提示采用随心输入，保留既有回车提交处理', () => {
  const source = readFileSync(new URL('../src/components/ExperienceInputScreen.tsx', import.meta.url), 'utf8');
  assert.match(source, /placeholder=\{demoMode && demoProbingActive\s*\? '随心输入'/);
  assert.match(source, /handleExperienceComposerKeyDown/);
});

test('03 评价后提供 Demo 同款能力卡更新环节', () => {
  const source = readFileSync(new URL('../src/components/DynamicTrialTaskScreen.tsx', import.meta.url), 'utf8');
  assert.match(source, /04 · 能力卡更新/);
  assert.match(source, /确认更新能力卡/);
  assert.match(source, /onUpdateCardsFromTrial/);
  assert.match(source, /能力卡已更新/);
});
