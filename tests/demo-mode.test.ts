import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createDemoObservedEvidence,
  createDemoTrialAnswer,
  createDemoTrialEvaluation,
  DEMO_SKILL_CARDS,
  evaluateDemoCardPlayRound,
} from '../src/data/demoMode';
import {
  loadDemoProgress,
  progressStorageKey,
  saveDemoProgress,
  trialStepKey,
} from '../src/services/demoProgress';
import type { ApiTrialTaskDefinition } from '../src/types/api';

const task: ApiTrialTaskDefinition = {
  id: 'A-02',
  track: 'agent',
  title: 'Agent Bad Case 归因',
  subtitle: '定位失败原因并制定验证顺序',
  role_type: 'AI 产品经理',
  work_stage: '问题诊断',
  primary_skill: 'AI 产品问题归因',
  supporting_skills: ['数据验证', '问题拆解'],
  estimated_minutes: '30 分钟',
  difficulty: '进阶',
  role: '负责 Agent 质量改进',
  background: '任务成功率下降，需要完成归因。',
  goal: '形成 Top 2 问题与验证计划。',
  constraints: ['仅使用给定材料'],
  materials: [
    { id: 'metrics', title: '指标', kind: 'data', content: '成功率下降', is_simulated: true },
    { id: 'bad-cases', title: '案例', kind: 'case', content: '八个失败案例', is_simulated: true },
    { id: 'system-notes', title: '系统说明', kind: 'capability', content: '系统分层', is_simulated: true },
  ],
  steps: [
    { id: 'attribution', title: '问题归因', input_mode: '结构化文本', instruction: '完成归因', constraint: '逐项填写' },
    { id: 'priority', title: '优先级', input_mode: '结构化文本', instruction: '选择 Top 2', constraint: '给出依据' },
    { id: 'evidence', title: '证据', input_mode: '结构化文本', instruction: '引用材料', constraint: '可追溯' },
    { id: 'validation', title: '验证计划', input_mode: '结构化文本', instruction: '定义验证动作', constraint: '可观察' },
    { id: 'event', title: '事件响应', input_mode: '结构化文本', instruction: '处理新增约束', constraint: '说明调整' },
  ],
  event: { actor: '研发负责人', message: '基础模型没有明显退化。', instruction: '更新验证顺序。' },
  coach_prompts: ['先区分现象和系统层。', '按影响范围拆解。', '用一个案例说明。'],
  rubric: [
    { dimension: '归因结构', weight: 40, observable_behavior: '能够区分不同系统层。' },
    { dimension: '验证计划', weight: 60, observable_behavior: '能够定义可观察信号。' },
  ],
  ability_challenges: [
    { id: 'c1', title: '挑战 1', scenario: '场景 1', prompt: '完成判断', target_skills: ['用户洞察'], reference_behavior: '识别问题层级。', max_cards: 3 },
    { id: 'c2', title: '挑战 2', scenario: '场景 2', prompt: '完成排序', target_skills: ['问题拆解'], reference_behavior: '形成优先级。', max_cards: 3 },
    { id: 'c3', title: '挑战 3', scenario: '场景 3', prompt: '完成验证', target_skills: ['数据验证'], reference_behavior: '定义观察信号。', max_cards: 3 },
  ],
  level_anchors: { L1: '初步', L2: '基础', L3: '独立', L4: '深入', L5: '专家' },
  source_note: '固定任务库',
};

test('演示任务准备示例草稿，但能力出牌从未完成状态开始', () => {
  const answer = createDemoTrialAnswer(task);

  assert.equal(answer.card_play_rounds.length, 3);
  assert.equal(answer.card_play_completed, false);
  assert.equal(answer.card_play_rounds.every(round => round.selected_card_ids.length === 0), true);
  assert.equal(answer.card_play_rounds.every(round => round.match_level === null), true);
  assert.equal(answer.pending_abilities.length, 5);
  assert.equal(new Set(answer.pending_abilities.map(item => item.title)).size, 5);
  assert.equal(task.steps.every(step => Boolean(answer.step_answers[step.id]?.trim())), true);
  assert.equal(answer.evidence_refs.length, 3);
  assert.equal(answer.event_decision, '调整');
  assert.notEqual(answer.event_response.trim(), '');
});

test('演示能力出牌根据实际选择返回对应等级', () => {
  const challenge = task.ability_challenges[0];
  const directMatch = evaluateDemoCardPlayRound(challenge, [DEMO_SKILL_CARDS[0]]);
  const weakMatch = evaluateDemoCardPlayRound(challenge, [DEMO_SKILL_CARDS[5]]);

  assert.equal(directMatch.match_level, 'high');
  assert.deepEqual(directMatch.matched_card_ids, DEMO_SKILL_CARDS.slice(0, 1).map(card => card.id));
  assert.equal(weakMatch.match_level, 'low');
});

test('演示评价和画像证据结构完整', () => {
  const evaluation = createDemoTrialEvaluation(task);
  const evidence = createDemoObservedEvidence(task);

  assert.equal(evaluation.dimensions.length, task.rubric.length);
  assert.equal(evaluation.dimensions.every(item => item.score > 0), true);
  assert.equal(evidence.completed_steps.length, task.steps.length);
  assert.equal(DEMO_SKILL_CARDS.every(card => Boolean(card.evidenceQuote && card.workplaceApplication)), true);
});

test('演示模式与正式模式采用独立的界面进度键', () => {
  assert.notEqual(trialStepKey('A-02', 'demo'), trialStepKey('A-02', 'use'));
});

test('普通模式切换分别保存并恢复演示与正式流程进度', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem(key: string) { return values.get(key) ?? null; },
    setItem(key: string, value: string) { values.set(key, value); },
  };
  const shared = {
    selectedTrialTaskId: 'A-02' as const,
    careerSelectedCardIds: [],
    careerRecommendation: null,
    careerRecommendationCardSignature: null,
    draftCards: [],
    draftExperience: null,
  };

  saveDemoProgress({ ...shared, currentScreen: 'career-explore' }, 'demo', storage);
  saveDemoProgress({ ...shared, currentScreen: 'input-experience' }, 'use', storage);

  assert.notEqual(progressStorageKey('demo'), progressStorageKey('use'));
  assert.equal(loadDemoProgress('demo', {}, storage).currentScreen, 'career-explore');
  assert.equal(loadDemoProgress('use', {}, storage).currentScreen, 'input-experience');
});

test('正式模式流程进度按账号隔离，且未登录不会恢复旧账号进度', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem(key: string) { return values.get(key) ?? null; },
    setItem(key: string, value: string) { values.set(key, value); },
  };
  const shared = {
    selectedTrialTaskId: 'A-02' as const,
    careerSelectedCardIds: [],
    careerRecommendation: null,
    careerRecommendationCardSignature: null,
    draftCards: [],
    draftExperience: null,
  };

  saveDemoProgress({ ...shared, currentScreen: 'profile' }, 'use', storage, 'account-a');

  assert.equal(loadDemoProgress('use', {}, storage, 'account-a').currentScreen, 'profile');
  assert.equal(loadDemoProgress('use', {}, storage, 'account-b').currentScreen, 'landing');
  assert.equal(loadDemoProgress('use', {}, storage, null).currentScreen, 'landing');
  assert.notEqual(progressStorageKey('use', 'account-a'), progressStorageKey('use', 'account-b'));
  assert.notEqual(trialStepKey('A-02', 'use', 'account-a'), trialStepKey('A-02', 'use', 'account-b'));
});
