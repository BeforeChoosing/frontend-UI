import { createDemoTrialAnswer } from './demoMode';
import type {
  ApiA02RubricCriterion,
  ApiDynamicTrialSession,
  ApiTrialTaskDefinition,
  TrialTaskId,
} from '../types/api';

type DemoTaskSeed = Omit<ApiTrialTaskDefinition, 'ability_challenges'>;

function buildTask(seed: DemoTaskSeed): ApiTrialTaskDefinition {
  return {
    ...seed,
    ability_challenges: seed.rubric.slice(0, 3).map((criterion, index) => ({
      id: `${seed.id}-C${String(index + 1).padStart(2, '0')}`,
      title: `挑战 ${String(index + 1).padStart(2, '0')} · ${criterion.dimension}`,
      scenario: `${seed.goal}\n本轮重点：${criterion.observable_behavior}`,
      prompt: '选择可用于完成这一任务要求的能力卡。',
      target_skills: [criterion.dimension],
      reference_behavior: criterion.observable_behavior,
      max_cards: 3,
    })),
  };
}

const A01_RUBRIC: ApiA02RubricCriterion[] = [
  { dimension: 'AI产品化', weight: 45, observable_behavior: '能根据失败成本和信息充分性设计自动化边界、确认与回退。' },
  { dimension: '方案与交互', weight: 20, observable_behavior: '流程端到端清楚，用户在关键节点拥有控制感。' },
  { dimension: '用户洞察', weight: 15, observable_behavior: '理解“节省翻找时间”与“避免错催”这两个真实目标。' },
  { dimension: '跨团队落地', weight: 15, observable_behavior: '工具、权限、数据延迟等依赖被纳入流程。' },
  { dimension: '数据驱动', weight: 5, observable_behavior: '能提出任务成功、错误催促等可观测指标。' },
];

const A02_RUBRIC: ApiA02RubricCriterion[] = [
  { dimension: 'AI产品化', weight: 40, observable_behavior: '能区分Prompt、模型、数据、工具、记忆、流程、交互等层级，并设计验证。' },
  { dimension: '数据驱动', weight: 20, observable_behavior: '结合频率、指标与影响面做优先级，而非按“看起来严重”排序。' },
  { dimension: '模型评测', weight: 15, observable_behavior: '能把单个失败与模型能力证据分开，不轻率归因。' },
  { dimension: '方案与交互', weight: 15, observable_behavior: '识别 UI 误导、错误恢复等非模型问题。' },
  { dimension: '跨团队落地', weight: 10, observable_behavior: '验证动作可交给相应团队执行，并有清晰先后顺序。' },
];

const A03_RUBRIC: ApiA02RubricCriterion[] = [
  { dimension: 'AI产品化', weight: 45, observable_behavior: '能把技术能力边界转成产品策略取舍，并设计回退和升级。' },
  { dimension: '跨团队落地', weight: 20, observable_behavior: '考虑工程实现、调试、维护和上线约束。' },
  { dimension: '数据驱动', weight: 15, observable_behavior: '用失败频率、影响和验证结果决定策略，而非技术偏好。' },
  { dimension: '创新趋势', weight: 10, observable_behavior: '理解子 Agent 等新路径但不因新奇而滥用。' },
  { dimension: '商业意识', weight: 10, observable_behavior: '把成本和稳定性纳入长期可持续性。' },
];

const DEMO_TRIAL_CATALOG: ApiTrialTaskDefinition[] = [
  buildTask({
    id: 'A-01',
    track: 'agent',
    title: '这个任务应该让 Agent 自动做到哪一步？',
    subtitle: '划分自动执行、用户确认与禁止自动化的边界',
    role_type: 'Agent 产品经理',
    work_stage: '流程设计',
    primary_skill: 'AI 产品化',
    supporting_skills: ['方案与交互', '风险判断'],
    estimated_minutes: '15–18 分钟',
    difficulty: '进阶',
    role: '你负责一个需要多步完成工作的 Agent。',
    background: '团队希望提升自动化程度，但任务中包含信息缺失、外部操作和不可逆决策。',
    goal: '设计 Agent 工作流并明确自动化边界。',
    constraints: ['工作流控制在六到八步', '最多允许两次澄清', '必须定义失败降级和完成条件'],
    materials: [
      { id: 'tools', title: '可用能力', kind: 'capability', content: '项目群聊天可读取授权工作群消息；项目文档同步可能延迟；成员目录可能过期；消息发送属于真实外部动作；Memory 可能过期或错误。', is_simulated: true },
      { id: 'expectations', title: '用户期望', kind: 'feedback', content: '希望自动汇总信息，但不要未经确认替用户催人；同时需要明确标记不确定信息。', is_simulated: true },
      { id: 'risks', title: '风险线索', kind: 'constraint', content: '文档同步存在延迟；没有找到周报不等于没有提交；错误催促会产生真实职场摩擦。', is_simulated: true },
    ],
    steps: [
      { id: 'workflow', title: '拆解工作流', input_mode: '流程', instruction: '给出六到八步工作流，并标注 Agent、用户和外部系统角色。', constraint: '总步骤不超过八步。' },
      { id: 'boundary', title: '划分自动化边界', input_mode: '三分类', instruction: '将关键动作分为自动执行、需用户确认和不得自动执行。', constraint: '每个关键动作必须归类。' },
      { id: 'clarify', title: '设计澄清', input_mode: '列表', instruction: '给出 Agent 必须询问的澄清问题。', constraint: '最多两次澄清。' },
      { id: 'failure', title: '定义失败处理', input_mode: '结构化文本', instruction: '指出失败节点、降级方案和完成条件。', constraint: '不能只写重试。' },
      { id: 'event', title: '延迟事件调整', input_mode: '保持或调整 + 说明', instruction: '外部系统同步延迟增加到二十分钟后重新设计。', constraint: '说明对自动化边界的影响。' },
    ],
    event: { actor: '技术负责人', message: '外部系统同步延迟可能达到二十分钟，且无法保证回调顺序。', instruction: '调整工作流、确认点或降级策略，并说明依据。' },
    coach_prompts: ['哪些动作失败后无法低成本撤回？', 'Agent 缺少什么信息时必须停下来问人？', '你定义的完成，是流程结束还是结果可用？'],
    rubric: A01_RUBRIC,
    level_anchors: {
      L1: '默认 Agent 可以全自动读取、判断并发送。',
      L2: '知道部分动作需要确认，但流程仍依赖理想数据。',
      L3: '能区分自动执行与必须确认，设计异常回退并处理数据不确定性。',
      L4: '能用失败成本、可撤销性和信息置信度决定自动化层级。',
      L5: '形成稳定的人机配置原则，并设计可监控、可追责的执行机制。',
    },
    source_note: '固定演示任务库',
  }),
  buildTask({
    id: 'A-02',
    track: 'agent',
    title: '这个 Agent 为什么总是失败？',
    subtitle: '从 Bad Case 归因到系统性 Top 2',
    role_type: 'Agent 产品经理',
    work_stage: '问题诊断',
    primary_skill: 'AI 产品化',
    supporting_skills: ['数据驱动', '模型评测'],
    estimated_minutes: '15–20 分钟',
    difficulty: '进阶',
    role: '你负责排查一个多步骤 Agent 的线上失败。',
    background: '团队整理了八个 Bad Case 和一组运行指标，需要判断最值得优先解决的系统性问题。',
    goal: '完成归因、选出系统性 Top 2，并给出可验证的改进动作。',
    constraints: ['八个案例都要归因', 'Top 2 必须唯一', '每个 Top 问题都要有可追溯证据与验证计划'],
    materials: [
      { id: 'metrics', title: '运行指标', kind: 'data', content: 'Task Success Rate：本周 61%，上周 73%。\nRetry Rate：本周 28%，上周 17%。\nHuman Override Rate：本周 34%，上周 22%。\nTool Failure Rate：本周 7%，上周 6%。', is_simulated: true },
      { id: 'cases', title: 'Bad Cases', kind: 'case', content: 'Case 01 偏好遗忘；Case 02 行业约束丢失；Case 03 工具未调用；Case 04 纠错未生效；Case 05 检索结果缺失；Case 06 幻觉补全；Case 07 交互误导；Case 08 权限失败。', is_simulated: true },
      { id: 'layers', title: '可归因层', kind: 'capability', content: 'Prompt、Model、RAG、Tool、Memory、Workflow、Interaction、Safety。', is_simulated: true },
    ],
    steps: [
      { id: 'attribution', title: '完成案例归因', input_mode: '案例分类 + 置信度', instruction: '为八个 Bad Case 选择归因并标注置信度。', constraint: '八个案例必须全部完成。' },
      { id: 'priority', title: '选择系统性 Top 2', input_mode: '双选', instruction: '选出两个最值得优先解决的系统性问题。', constraint: '只能选择两个且不得重复。' },
      { id: 'evidence', title: '引用证据', input_mode: '案例 + 指标 + 说明', instruction: '使用案例和运行指标支持 Top 2 判断。', constraint: '两个问题都必须有证据。' },
      { id: 'validation', title: '制定验证计划', input_mode: '结构化文本', instruction: '为 Top 2 分别填写验证动作和预期信号。', constraint: '动作必须能够产生可观察信号。' },
      { id: 'event', title: '约束下重新排序', input_mode: '保持或调整 + 说明', instruction: '模型效果无明显退化且当前不能更换模型时重新排序。', constraint: '必须说明约束如何影响排序。' },
    ],
    event: { actor: '算法负责人', message: '离线评测显示模型效果没有明显退化，而且本周期无法更换基础模型。', instruction: '重新排列 Top 2，并说明保持或调整的依据。' },
    coach_prompts: ['这是单个案例的表象，还是能解释多个案例的系统性原因？', '你引用的证据能区分相关性和因果假设吗？', '在不能换模型的前提下，哪个验证动作信息增益最高？'],
    rubric: A02_RUBRIC,
    level_anchors: {
      L1: '所有问题都归因于模型或 Prompt，缺乏验证。',
      L2: '能分出几类原因，但每个案例只给一个武断结论。',
      L3: '能提出多假设、引用案例和运行数据，优先选择可验证且影响大的问题。',
      L4: '能识别跨案例共同根因，区分产品问题与模型能力问题。',
      L5: '能构建系统性故障地图，估计修复收益、代价和风险。',
    },
    source_note: '固定演示任务库',
  }),
  buildTask({
    id: 'A-03',
    track: 'agent',
    title: 'Prompt、RAG、Tool、子 Agent，还是先别做？',
    subtitle: '为问题选择最低成本且可验证的技术策略',
    role_type: 'Agent 产品经理',
    work_stage: '技术方案选择',
    primary_skill: 'AI 产品化',
    supporting_skills: ['技术理解', '风险判断'],
    estimated_minutes: '15–18 分钟',
    difficulty: '进阶',
    role: '你需要为一个 Agent 问题选择技术策略。',
    background: '团队提出 Prompt、RAG、规则、Planner、Tool、子 Agent 和换模型等多种方案。',
    goal: '比较至少三种策略，选出主方案和必要组合，并设计低成本验证。',
    constraints: ['至少比较三种候选策略', '必须明确不选什么', '需要说明组合复杂度与风险'],
    materials: [
      { id: 'failures', title: '主要失败模式', kind: 'data', content: '修改范围过大 18%；忽略内部组件规范 14%；错误 Tool 调用 9%；长任务目标漂移 12%。', is_simulated: true },
      { id: 'strategies', title: '候选策略', kind: 'capability', content: 'Prompt、RAG、工程规则、Planner + Executor、更换模型各有不同的效果、成本、时延与维护风险。', is_simulated: true },
      { id: 'limits', title: '现有约束', kind: 'constraint', content: '团队可改 Prompt、RAG 和工作流；换模型需要审批；关键动作可以增加工程 Guardrail。', is_simulated: true },
    ],
    steps: [
      { id: 'candidates', title: '选择候选策略', input_mode: '多选', instruction: '从候选技术中选择至少三项比较。', constraint: '至少三项。' },
      { id: 'matrix', title: '建立策略矩阵', input_mode: '矩阵', instruction: '比较各策略解决的问题、成本、时延、风险和验证方式。', constraint: '所有候选使用同一比较维度。' },
      { id: 'decision', title: '形成选择', input_mode: '主方案 + 组合 + 不选', instruction: '说明主方案、必要组合以及当前不选择的策略。', constraint: '不能把所有策略都列为主方案。' },
      { id: 'validation', title: '低成本验证', input_mode: '结构化文本', instruction: '给出主要风险和一个低成本验证方案。', constraint: '验证必须先于大规模开发。' },
      { id: 'event', title: '性能约束调整', input_mode: '保持或调整 + 说明', instruction: '加入 P95 小于四秒、成本增幅小于 20% 的约束后重新决策。', constraint: '同时满足时延和成本边界。' },
    ],
    event: { actor: '平台负责人', message: 'P95 响应时延必须小于四秒，单次成本增幅不得超过 20%。', instruction: '调整策略组合和验证优先级，并说明取舍。' },
    coach_prompts: ['你选择的技术是在解决根因，还是覆盖症状？', '哪一种策略能用最低成本先排除最大不确定性？', '组合策略增加的复杂度由什么收益来支付？'],
    rubric: A03_RUBRIC,
    level_anchors: {
      L1: '偏好热门技术，几乎不比较适用条件。',
      L2: '能列出多种策略优缺点，但仍只按效果最好选择。',
      L3: '能结合失败类型与约束选择主路径和兜底，并给出验证。',
      L4: '能设计分阶段策略、升级触发条件和回退机制。',
      L5: '能把复杂技术选择转为可维护的产品策略体系。',
    },
    source_note: '固定演示任务库',
  }),
];

export function getLocalDemoTrialCatalog(): ApiTrialTaskDefinition[] {
  return DEMO_TRIAL_CATALOG.map(task => structuredClone(task));
}

export function getLocalDemoTrialTask(taskId: TrialTaskId): ApiTrialTaskDefinition {
  const task = DEMO_TRIAL_CATALOG.find(item => item.id === taskId);
  if (!task) throw new Error('演示任务不存在。');
  return structuredClone(task);
}

export function createLocalDemoTrialSession(task: ApiTrialTaskDefinition): ApiDynamicTrialSession {
  const now = new Date().toISOString();
  return {
    id: `demo-local-${task.id}`,
    task_id: task.id,
    status: 'in_progress',
    event_revealed: false,
    answer: createDemoTrialAnswer(task),
    created_at: now,
    updated_at: now,
    submitted_at: null,
    observed_evidence: null,
    evaluation: null,
  };
}
