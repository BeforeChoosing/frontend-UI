import type { SkillCard } from '../types';
import type {
  ApiCareerRecommendation,
  ApiDynamicTrialAnswer,
  ApiDynamicTrialCardPlayRound,
  ApiObservedEvidence,
  ApiProfileEvidence,
  ApiTrialAbilityApplication,
  ApiTrialEvidenceItem,
  ApiTrialAbilityChallenge,
  ApiTrialEvaluation,
  ApiTrialTaskDefinition,
} from '../types/api';

export const DEMO_EXPERIENCE_TEXT = '大三时我带队完成校园二手书流转产品。团队走访了 6 栋宿舍楼，确认核心问题是交易双方的信任成本和碰面履约效率。我们设计了宿舍楼集中转交点与交易评价机制，上线首月完成 800 多笔书籍流转。项目推进中，我负责用户访谈、问题归因、方案取舍、跨团队协调和上线后的数据复盘。';

export const DEMO_SKILL_CARDS: SkillCard[] = [
  {
    id: 'demo-user-insight',
    title: '用户痛点洞察',
    category: '洞察分析',
    description: '通过访谈、行为记录与数据交叉验证真实问题',
    detail: '从用户表达、行为路径和业务数据中区分表面诉求与根本问题。',
    icon: 'Search',
    colorTone: 'emerald',
    evidenceQuote: '走访 6 栋宿舍楼后，将问题从信息分散收敛为信任成本与履约效率。',
    sourceRefs: ['项目经历：校园二手书流转产品'],
    claimLevel: 'fact',
    evidenceType: 'self_report',
    pendingVerification: false,
    nextVerification: '在 Agent Bad Case 归因任务中验证问题识别能力',
    matchReason: '具备一手调研、问题收敛和证据交叉验证过程。',
    workplaceApplication: '支持需求分析、Bad Case 聚类与产品机会判断。',
  },
  {
    id: 'demo-problem-framing',
    title: '问题拆解与优先级',
    category: '产品策略',
    description: '将复杂问题拆成可验证假设并确定推进顺序',
    detail: '根据影响范围、证据充分度和实施成本形成明确优先级。',
    icon: 'Layers',
    colorTone: 'amber',
    evidenceQuote: '将交易体验拆为信任机制、交付地点和评价反馈三个环节。',
    sourceRefs: ['项目经历：校园二手书流转产品'],
    claimLevel: 'interpretation',
    evidenceType: 'self_report',
    pendingVerification: true,
    nextVerification: '在固定任务中验证系统性问题排序',
    matchReason: '经历中包含问题分层、范围收敛和方案取舍。',
    workplaceApplication: '支持产品范围定义、路线图排序和验证计划设计。',
  },
  {
    id: 'demo-data-validation',
    title: '数据验证与复盘',
    category: '数据驱动',
    description: '用过程指标与结果指标检验产品判断',
    detail: '为方案建立可观察指标，并根据实际结果调整下一轮行动。',
    icon: 'ChartNoAxesCombined',
    colorTone: 'blue',
    evidenceQuote: '上线首月记录并复盘 800 多笔书籍流转结果。',
    sourceRefs: ['项目经历：校园二手书流转产品'],
    claimLevel: 'fact',
    evidenceType: 'self_report',
    pendingVerification: false,
    nextVerification: '在任务中验证指标设计与证据引用质量',
    matchReason: '经历中包含可量化结果和上线复盘。',
    workplaceApplication: '支持实验设计、指标监控与产品效果复盘。',
  },
  {
    id: 'demo-ai-boundary',
    title: 'AI 能力边界判断',
    category: '技术落地',
    description: '区分模型、检索、工具、记忆和工作流问题',
    detail: '根据失败现象选择最低成本的验证路径，避免直接把问题归因于模型。',
    icon: 'SlidersHorizontal',
    colorTone: 'purple',
    evidenceQuote: '当前经历尚未形成直接的 AI 系统归因证据，需要通过任务验证。',
    sourceRefs: ['CoachAgent 固定任务库'],
    claimLevel: 'hypothesis',
    evidenceType: 'inference',
    pendingVerification: true,
    nextVerification: '完成 A-02 Agent Bad Case 归因任务',
    matchReason: '目标岗位需要判断技术边界，当前仍需通过任务验证。',
    workplaceApplication: '支持 Agent 故障归因、技术方案选择和风险控制。',
  },
  {
    id: 'demo-interaction',
    title: '人机交互设计',
    category: '交互体验',
    description: '为不确定输出设计确认、纠错和降级路径',
    detail: '通过清晰的状态、用户确认点和错误恢复降低 AI 不确定性。',
    icon: 'MousePointerClick',
    colorTone: 'rose',
    evidenceQuote: '当前经历包含流程设计证据，但 AI 交互判断仍需通过任务验证。',
    sourceRefs: ['CoachAgent 固定任务库'],
    claimLevel: 'hypothesis',
    evidenceType: 'inference',
    pendingVerification: true,
    nextVerification: '在交互任务中补充可观察证据',
    matchReason: '现有经历包含流程设计，但 AI 交互证据仍需补充。',
    workplaceApplication: '支持 AI 功能的确认机制、错误恢复和用户控制设计。',
  },
  {
    id: 'demo-collaboration',
    title: '跨团队协同交付',
    category: '协作沟通',
    description: '对齐目标、责任边界和交付节奏',
    detail: '将产品判断转成可执行任务，并推动不同角色按统一标准协作。',
    icon: 'Users',
    colorTone: 'emerald',
    evidenceQuote: '协调调研、方案、宿舍转交点和上线复盘工作。',
    sourceRefs: ['项目经历：校园二手书流转产品'],
    claimLevel: 'interpretation',
    evidenceType: 'self_report',
    pendingVerification: true,
    nextVerification: '在任务交付中验证协作边界表达',
    matchReason: '经历中包含多角色协调和方案落地。',
    workplaceApplication: '支持产品、研发、算法和运营之间的交付协同。',
  },
];

export const DEMO_CAREER_RECOMMENDATION: ApiCareerRecommendation = {
  role_id: 'ai_product_manager',
  role_title: 'AI 产品经理',
  summary: '现有能力组合能够支持用户问题识别、方案拆解和结果验证。下一步应通过固定 Agent Bad Case 任务，验证对 AI 系统边界和修复优先级的判断。',
  supported: [
    {
      claim: '用户洞察、问题拆解和数据验证能够迁移到 AI 产品的问题诊断环节。',
      card_ids: ['demo-user-insight', 'demo-problem-framing', 'demo-data-validation'],
      citation_ids: ['demo-role-source'],
    },
  ],
  unknowns: ['尚缺少对 Prompt、RAG、Tool、Memory 与 Workflow 的系统性归因证据。'],
  next_task_id: 'A-02',
  next_task_title: '这个 Agent 为什么总是失败？',
  next_task_reason: '该任务直接验证 AI 产品问题归因、证据引用和修复优先级判断。',
  confidence: '中',
  citations: [
    {
      id: 'demo-role-source',
      document_title: 'AI 产品经理岗位资料交叉归纳稿',
      source_locator: '本地岗位知识库',
      content: '岗位实践通常要求将用户问题、模型能力、检索、工具和工作流约束转化为可验证的产品判断。',
      trust_level: '公开资料交叉归纳',
      source_note: '岗位资料由本地知识库交叉归纳，不代表具体企业结论。',
    },
  ],
  notice: '推荐依据来自已确认能力卡和本地岗位知识片段，不等同于录用或胜任力结论。',
};

const DEMO_STEP_ANSWERS: Record<string, string> = {
  attribution: 'Memory：Case 01、02、04；Tool：Case 03、08；RAG：Case 05；Safety：Case 06；Interaction：Case 07。Case 03 同时保留工具权限配置假设。',
  priority: 'Top 1：Memory 长期状态失效，影响偏好、行业约束和纠错信息。Top 2：Tool 调用与权限链路不完整，影响岗位比较和简历读取。',
  evidence: '任务成功率由 73% 降至 61%，人工覆盖率由 22% 升至 34%。Case 01、02、04 支持 Memory 假设；Case 03、08 支持 Tool 与权限假设。',
  validation: '先回放 Case 01、02、04 的状态写入与读取日志，观察约束丢失位置；再检查 Case 03、08 的工具决策日志、权限状态和错误回传。',
  event: '调整验证顺序，但保持 Top 2。基础模型没有明显退化，应优先验证 Memory、Tool 和 Workflow 层，而不是更换模型。',
};

const DEMO_CATEGORY_SKILL_WEIGHTS: Record<string, Record<string, number>> = {
  洞察分析: { 用户洞察: 8, 数据驱动: 2, 模型评测: 1, 商业意识: 1 },
  产品策略: { 方案与交互: 7, 商业意识: 5, AI产品化: 4, 优先级判断: 8, 跨团队落地: 2 },
  技术落地: { AI产品化: 8, 模型评测: 5, 方案与交互: 2, 创新趋势: 7, 跨团队落地: 2 },
  数据驱动: { 数据驱动: 8, 模型评测: 6, 用户洞察: 2, 商业意识: 3, 优先级判断: 5 },
  协作沟通: { 跨团队落地: 8, 商业意识: 5, 方案与交互: 2, 优先级判断: 2 },
  交互体验: { 方案与交互: 8, 用户洞察: 5, AI产品化: 2, 跨团队落地: 1 },
};

export function evaluateDemoCardPlayRound(
  challenge: ApiTrialAbilityChallenge,
  selectedCards: SkillCard[],
): ApiDynamicTrialCardPlayRound {
  const scoredCards = selectedCards.map(card => ({
    card,
    score: Math.max(...challenge.target_skills.map(skill => DEMO_CATEGORY_SKILL_WEIGHTS[card.category]?.[skill] || 0), 0),
  }));
  const matchedCards = scoredCards.filter(item => item.score > 0).map(item => item.card);
  const matchedSkills = challenge.target_skills.filter(skill => (
    selectedCards.some(card => (DEMO_CATEGORY_SKILL_WEIGHTS[card.category]?.[skill] || 0) > 0)
  ));
  const directMatch = scoredCards.some(item => item.score >= 6);
  const matchLevel = directMatch || matchedCards.length >= 2
    ? 'high'
    : matchedCards.length > 0
      ? 'partial'
      : 'low';
  const skillText = challenge.target_skills.join('、');
  const feedback = matchLevel === 'high'
    ? `所选能力与“${skillText}”直接对应，可用于本轮任务要求。参考表现：${challenge.reference_behavior}`
    : matchLevel === 'partial'
      ? `所选能力可提供辅助支持，但与“${skillText}”的直接对应仍不充分。参考表现：${challenge.reference_behavior}`
      : `当前选择与“${skillText}”关联较弱。本轮参考表现：${challenge.reference_behavior}`;

  return {
    challenge_id: challenge.id,
    selected_card_ids: selectedCards.map(card => card.id),
    match_level: matchLevel,
    matched_card_ids: matchedCards.map(card => card.id),
    matched_skills: matchedSkills,
    feedback,
  };
}

export function createDemoTrialAnswer(task: ApiTrialTaskDefinition): ApiDynamicTrialAnswer {
  const rounds = task.ability_challenges.map(challenge => ({
    challenge_id: challenge.id,
    selected_card_ids: [],
    match_level: null,
    matched_card_ids: [],
    matched_skills: [],
    feedback: '',
  }));
  const materials = task.materials.slice(0, 3).map(material => material.id);
  return {
    selected_card_ids: [],
    card_play_rounds: rounds,
    card_play_current_index: 0,
    card_play_rationale: '优先使用用户洞察和问题拆解识别系统性原因，再用数据验证确定修复顺序。',
    validation_hypothesis: '如果问题主要来自 Memory 与 Tool 链路，修复后任务成功率应提升，人工覆盖率应下降。',
    card_play_completed: false,
    step_answers: Object.fromEntries(task.steps.map(step => [
      step.id,
      DEMO_STEP_ANSWERS[step.id] || `${step.instruction} 已按照任务约束填写。`,
    ])),
    viewed_material_ids: materials,
    evidence_refs: materials,
    step_revisions: Object.fromEntries(task.steps.map(step => [step.id, 0])),
    coach_usage: [],
    event_decision: '调整',
    event_response: '模型效果没有明显退化，因此保持 Memory 与 Tool 两项系统性问题，优先验证状态写入读取链路，再验证工具决策、权限和错误回传。',
  };
}

export function createDemoTrialEvaluation(
  task: ApiTrialTaskDefinition,
  answer: ApiDynamicTrialAnswer | null = null,
  cards: SkillCard[] = DEMO_SKILL_CARDS,
): ApiTrialEvaluation {
  return createDemoTrialEvaluationForAnswer(task, answer, cards);
}

function createDemoEvidenceBundle(
  task: ApiTrialTaskDefinition,
  answer: ApiDynamicTrialAnswer | null,
  cards: SkillCard[],
): { items: ApiTrialEvidenceItem[]; selectedCardIds: string[]; applications: ApiTrialAbilityApplication[]; refs: string[] } {
  const selectedCardIds = Array.from(new Set(answer?.selected_card_ids || []));
  const cardsById = new Map(cards.map(card => [card.id, card]));
  const items: ApiTrialEvidenceItem[] = [];
  const seen = new Set<string>();
  const add = (item: ApiTrialEvidenceItem) => {
    if (seen.has(item.id) || !item.content.trim()) return;
    seen.add(item.id);
    items.push(item);
  };

  selectedCardIds.forEach(cardId => {
    const card = cardsById.get(cardId);
    if (!card) return;
    add({
      id: `card:${card.id}`,
      source: 'ability_card',
      source_id: card.id,
      kind: 'planned',
      label: '选择的能力卡',
      content: `${card.title}：${card.description}`,
    });
  });

  const rounds = answer?.card_play_rounds || [];
  rounds.forEach(round => {
    const challenge = task.ability_challenges.find(item => item.id === round.challenge_id);
    if (!challenge) return;
    round.selected_card_ids.forEach(cardId => {
      const card = cardsById.get(cardId);
      if (!card) return;
      add({
        id: `card_play:${round.challenge_id}:${cardId}`,
        source: 'card_play',
        source_id: round.challenge_id,
        kind: 'planned',
        label: `${challenge.title} · 能力应用`,
        content: `选择「${card.title}」，本轮匹配结果为${round.match_level || '未评价'}。${round.feedback}`,
      });
    });
  });

  const answerRefs: string[] = [];
  task.steps.forEach(step => {
    const content = answer?.step_answers[step.id]?.trim();
    if (!content) return;
    const id = `answer:${step.id}`;
    answerRefs.push(id);
    add({ id, source: 'answer', source_id: step.id, kind: 'deliverable', label: step.title, content });
  });

  const materialRefs: string[] = [];
  const materialIds = Array.from(new Set([...(answer?.viewed_material_ids || []), ...(answer?.evidence_refs || [])]));
  materialIds.forEach(materialId => {
    const material = task.materials.find(item => item.id === materialId);
    if (!material) return;
    const id = `material:${material.id}`;
    materialRefs.push(id);
    add({ id, source: 'material', source_id: material.id, kind: 'reference', label: material.title, content: material.content });
  });

  const eventRefs: string[] = [];
  if (answer?.event_decision) {
    eventRefs.push('event:decision');
    add({ id: 'event:decision', source: 'event', source_id: 'event_decision', kind: 'observed', label: '事件后处理决定', content: answer.event_decision });
  }
  if (answer?.event_response?.trim()) {
    eventRefs.push('event:response');
    add({ id: 'event:response', source: 'event', source_id: 'event_response', kind: 'deliverable', label: '事件后调整依据', content: answer.event_response });
  }

  const applications = selectedCardIds.flatMap(cardId => {
    const card = cardsById.get(cardId);
    if (!card) return [];
    const cardRounds = rounds.filter(round => round.selected_card_ids.includes(cardId));
    const levels = cardRounds.map(round => round.match_level);
    const status = levels.includes('high') && answerRefs.length >= 3
      ? '已应用'
      : cardRounds.length > 0
        ? '部分应用'
        : '未形成证据';
    const basis = status === '已应用'
      ? `在${cardRounds.length}轮能力应用中得到直接匹配，且五步工作台已保存${answerRefs.length}条作答。`
      : status === '部分应用'
        ? '能力卡已出现在能力应用阶段，但交付物中仍缺少足够的对应行为证据。'
        : '能力卡已被选择，但能力应用记录中没有使用它。';
    return [{
      card_id: card.id,
      card_title: card.title,
      challenge_ids: cardRounds.map(round => round.challenge_id),
      evidence_refs: Array.from(new Set([`card:${card.id}`, ...cardRounds.flatMap(round => [`card_play:${round.challenge_id}:${card.id}`]), ...answerRefs.slice(0, 3), ...eventRefs.slice(0, 1)])).slice(0, 8),
      status,
      basis,
      next_step: status === '已应用'
        ? '在下一项任务中记录该能力带来的具体结果，检验跨场景稳定性。'
        : status === '部分应用'
          ? '在下一次作答中明确写出该能力如何影响判断和结果。'
          : '在任务交付物中补充该能力对应的具体行为和结果。',
    } satisfies ApiTrialAbilityApplication];
  });

  const refs = Array.from(new Set([
    ...selectedCardIds.map(cardId => `card:${cardId}`),
    ...answerRefs,
    ...eventRefs,
    ...materialRefs.slice(0, 1),
    ...items.filter(item => item.source === 'card_play').map(item => item.id).slice(0, 2),
  ])).slice(0, 12);
  return { items, selectedCardIds, applications, refs };
}

function createDemoTrialEvaluationForAnswer(
  task: ApiTrialTaskDefinition,
  answer: ApiDynamicTrialAnswer | null,
  cards: SkillCard[],
): ApiTrialEvaluation {
  const evidence = createDemoEvidenceBundle(task, answer, cards);
  if (!answer) {
    return {
      // The catalog preview is intentionally still populated so the demo can
      // show the same end-screen shape before a real answer is submitted.
      summary: '本次作答完成了 Bad Case 分层、Top 2 选择、证据引用和验证计划，并在新增约束下调整了验证顺序。',
      dimensions: task.rubric.map(criterion => ({
        dimension: criterion.dimension,
        weight: criterion.weight,
        score: 82,
        evidence: criterion.observable_behavior,
        evidence_refs: evidence.refs.slice(0, 5),
      })),
      primary_ability: task.primary_skill,
      observed_level: 'L3',
      level_reason: '演示任务提供了完整的示例证据链；正式任务会根据你的实际作答重新总结。',
      supporting_evidence: task.supporting_skills.map(skill => ({
        ability: skill,
        observed_level: 'L3',
        evidence: '演示任务包含对应步骤和材料引用。',
      })),
      process_evidence: task.steps.map(step => `已完成：${step.title}`),
      coach_dependency: '独立完成',
      strengths: ['归因层级清晰', '优先级有指标与案例依据'],
      gaps: ['提交任务步骤、判断依据和结果反馈后再做总结。'],
      next_step: '完成任务后查看基于实际作答的总结。',
      confidence: '中',
      evidence_refs: evidence.refs,
      ability_applications: evidence.applications,
      evaluation_protocol: 'trial-evidence-v1',
    };
  }

  const answerValues = [
    ...task.steps.map(step => answer.step_answers[step.id] || ''),
    answer.card_play_rationale,
    answer.validation_hypothesis,
    answer.event_response,
  ].map(value => value.trim());
  const nonEmpty = answerValues.filter(Boolean);
  const concreteSignals = /(因为|根据|依据|所以|因此|结果|反馈|数据|指标|提升|下降|完成|上线|验证|选择|调整|问题|行动|用户|团队|风险|约束|资源|时间)/;
  const concreteCount = nonEmpty.filter(value => concreteSignals.test(value)).length;
  const expectedCount = answerValues.length || 1;
  const completionRatio = nonEmpty.length / expectedCount;
  const detailRatio = concreteCount / Math.max(nonEmpty.length, 1);
  const cardEvidenceBonus = Math.min(0.2, evidence.selectedCardIds.length * 0.06);
  const qualityScore = Math.round(Math.min(100, completionRatio * 45 + detailRatio * 35 + cardEvidenceBonus * 100 + (evidence.refs.length > 2 ? 10 : 0)));
  const observedLevel: ApiTrialEvaluation['observed_level'] = qualityScore >= 72
    ? 'L3'
    : qualityScore >= 45
      ? 'L2'
      : qualityScore >= 18
        ? 'L1'
        : '证据不足';
  const levelReason = observedLevel === 'L3'
    ? '作答同时提供了行动、判断依据和结果线索，可以形成初步可核对证据。'
    : observedLevel === 'L2'
      ? '作答覆盖了部分任务步骤，但行动与结果之间的依据仍不完整。'
      : observedLevel === 'L1'
        ? '作答已被记录，但目前只有零散线索，尚不足以稳定判断能力表现。'
        : '作答内容较简略，当前只能确认提交发生，尚未形成可评价的能力证据。';
  const summary = observedLevel === 'L3'
    ? `本次作答围绕${task.primary_skill}完成了任务拆解，并提供了行动、依据和结果线索；能力应用记录将作为后续验证的起点。`
    : observedLevel === 'L2'
      ? `本次作答已完成部分${task.primary_skill}步骤，能够看到一些判断线索；行动与结果的联系还可以继续补充。`
      : `本次作答已经记录，但内容较为简略，当前只能总结出${task.primary_skill}的初步线索，暂不把它当作能力确认。`;
  const strengths = observedLevel === '证据不足'
    ? []
    : observedLevel === 'L1'
      ? ['完成了本轮任务提交']
      : observedLevel === 'L2'
        ? ['能围绕任务要求给出部分判断']
        : ['能把任务要求与行动、依据和结果联系起来'];
  const gaps = observedLevel === 'L3'
    ? ['仍需在后续任务中补充跨场景过程证据']
    : ['补充更具体的行动、判断依据和结果反馈'];
  const processEvidence = task.steps
    .filter(step => Boolean(answer.step_answers[step.id]?.trim()))
    .map(step => `已记录：${step.title}`);
  return {
    summary,
    dimensions: task.rubric.map((criterion, index) => ({
      dimension: criterion.dimension,
      weight: criterion.weight,
      score: Math.max(0, Math.min(100, qualityScore - index * 3)),
      evidence: nonEmpty[index] || '本项暂未提供具体作答证据。',
      evidence_refs: evidence.refs.slice(index, index + 5),
    })),
    primary_ability: task.primary_skill,
    observed_level: observedLevel,
    level_reason: levelReason,
    supporting_evidence: task.supporting_skills.map(skill => ({
      ability: skill,
      observed_level: observedLevel,
      evidence: nonEmpty[0] || '本轮暂未提供对应证据。',
    })),
    process_evidence: processEvidence,
    coach_dependency: '独立完成',
    strengths,
    gaps,
    next_step: observedLevel === 'L3'
      ? '继续完成同类任务，验证该能力在不同约束下的稳定性。'
      : '返回任务补充具体行动、判断依据或结果，再继续验证。',
    confidence: observedLevel === 'L3' ? '中' : '低',
    evidence_refs: evidence.refs,
    ability_applications: evidence.applications,
    evaluation_protocol: 'demo-local-evidence-summary-v2',
  };
}

export function createDemoObservedEvidence(
  task: ApiTrialTaskDefinition,
  answer: ApiDynamicTrialAnswer | null = null,
  cards: SkillCard[] = DEMO_SKILL_CARDS,
): ApiObservedEvidence {
  const evidence = createDemoEvidenceBundle(task, answer, cards);
  const evaluation = createDemoTrialEvaluation(task, answer, cards);
  const isPreview = !answer;
  return {
    task_id: task.id,
    statement: isPreview
      ? '本次作答展示了从 Bad Case 现象到系统性归因、优先级和验证动作的完整过程。'
      : evaluation.summary,
    completed_steps: isPreview
      ? task.steps.map(step => step.id)
      : task.steps
        .filter(step => Boolean(answer?.step_answers[step.id]?.trim()))
        .map(step => step.id),
    evidence_refs: evidence.refs,
    caveats: ['本次结果仅基于当前任务表现', '能力等级需要通过后续任务持续验证'],
    evidence_items: evidence.items,
    selected_card_ids: evidence.selectedCardIds,
    primary_ability: task.primary_skill,
    observed_level: isPreview ? 'L3' : evaluation.observed_level,
    level_reason: isPreview ? '演示任务提供了完整的示例证据链；正式任务会根据你的实际作答重新总结。' : evaluation.level_reason,
    confidence: isPreview ? '中' : evaluation.confidence,
    coach_dependency: '独立完成',
  };
}

export function createDemoProfileEvidence(task: ApiTrialTaskDefinition): ApiProfileEvidence {
  return {
    session_id: 'demo-session-a02',
    task_id: task.id,
    created_at: '2026-08-26T10:00:00+08:00',
    observed_evidence: createDemoObservedEvidence(task),
    evaluation: createDemoTrialEvaluation(task),
  };
}

export const DEMO_PROFILE_EVIDENCE: ApiProfileEvidence[] = [
  {
    session_id: 'demo-session-a02',
    task_id: 'A-02',
    created_at: '2026-08-26T10:00:00+08:00',
    observed_evidence: {
      task_id: 'A-02',
      statement: '作答展示了从 Bad Case 现象到系统性归因、优先级和验证动作的完整过程。',
      completed_steps: ['attribution', 'priority', 'evidence', 'validation', 'event'],
      evidence_refs: ['metrics', 'bad-cases', 'system-notes'],
      caveats: ['本次结果仅基于当前任务表现', '能力等级需要通过后续任务持续验证'],
      primary_ability: 'AI 产品问题归因',
      observed_level: 'L3',
      level_reason: '能够形成结构化归因和验证计划。',
      confidence: '中',
      coach_dependency: '独立完成',
    },
    evaluation: {
      summary: '作答完成了 Bad Case 分层、Top 2 选择、证据引用和验证计划，并在新增约束下调整了验证顺序。',
      dimensions: [
        { dimension: '归因结构', weight: 30, score: 91, evidence: '区分了 Memory、Tool、RAG、Safety 与 Interaction 层。' },
        { dimension: '证据使用', weight: 25, score: 89, evidence: '引用了任务成功率、人工覆盖率和具体 Bad Case。' },
        { dimension: '优先级判断', weight: 25, score: 87, evidence: 'Top 2 与影响范围和验证成本保持一致。' },
        { dimension: '验证计划', weight: 20, score: 85, evidence: '为状态链路与工具调用定义了可观察信号。' },
      ],
      primary_ability: 'AI 产品问题归因',
      observed_level: 'L3',
      level_reason: '能够区分系统层级并形成可执行验证方案。',
      supporting_evidence: [
        { ability: '数据验证', observed_level: 'L3', evidence: '使用过程指标与案例验证判断。' },
        { ability: '问题拆解', observed_level: 'L3', evidence: '将复杂失败现象拆分到不同系统层。' },
      ],
      process_evidence: ['已完成：问题归因', '已完成：优先级排序', '已完成：证据引用', '已完成：验证计划', '已完成：事件响应'],
      coach_dependency: '独立完成',
      strengths: ['归因层级清晰', '优先级有指标与案例依据', '验证动作具有可观察信号'],
      gaps: ['仍需在后续任务中补充跨场景过程证据'],
      next_step: '继续完成同类任务，验证该能力在不同约束下的稳定性。',
      confidence: '中',
    },
  },
];
