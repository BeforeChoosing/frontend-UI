export type ScreenMode = 'landing' | 'auth' | 'input-experience' | 'verify-cards' | 'career-explore' | 'stage2' | 'report' | 'profile';

export type AgentType = 
  | 'growth_companion'   // 成长陪伴 Agent (产品 1)
  | 'career_path'         // 职业路径 Agent (产品 2)
  | 'industry_expert'     // 行业专家 Agent (产品 2)
  | 'task_coach'          // 任务教练 Agent (产品 3)
  | 'review_reflection';  // 复盘 Agent (产品 1 与 3 衔接)

export interface AgentDefinition {
  id: AgentType;
  name: string;
  shortName: string;
  role: string;
  productTag: string;
  productNumber: string;
  avatarIcon: string;
  themeColor: string;
  bgLight: string;
  textColor: string;
  description: string;
  responsibilities: string[];
}

export const AGENT_REGISTRY: Record<AgentType, AgentDefinition> = {
  growth_companion: {
    id: 'growth_companion',
    name: '成长陪伴 Agent',
    shortName: '陪伴',
    role: '经历拆解与胜任力提炼',
    productTag: '产品 1 负责',
    productNumber: '产品 1',
    avatarIcon: 'Sprout',
    themeColor: 'emerald',
    bgLight: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    textColor: 'text-emerald-700',
    description: '负责追问用户经历、提炼能力卡、区分事实/自述/推断，并请用户确认或修改。',
    responsibilities: [
      '追问挖掘普通经历背后的高阶能力点',
      '提炼可组合的能力卡牌（Skill Cards）',
      '清晰区分【客观事实 / 主观自述 / 潜力推断】',
      '主动向用户发起确认与微调'
    ]
  },
  career_path: {
    id: 'career_path',
    name: '职业路径 Agent',
    shortName: '路径',
    role: '能力适配与路径推演',
    productTag: '产品 2 负责',
    productNumber: '产品 2',
    avatarIcon: 'Compass',
    themeColor: 'amber',
    bgLight: 'bg-amber-50 text-amber-800 border-amber-200',
    textColor: 'text-amber-800',
    description: '负责结合用户能力、目标和现实条件，生成可比较的职业路径，并解释推荐依据和仍待验证的未知。',
    responsibilities: [
      '结合卡组与现实约束生成可比较路径',
      '清晰解释推荐依据（推荐匹配分与依据）',
      '指出关键短板与仍待验证的未知项',
      '指导用户前往工作台验证未决能力'
    ]
  },
  industry_expert: {
    id: 'industry_expert',
    name: '行业专家 Agent',
    shortName: '行业',
    role: '真实职场情报与行业洞察',
    productTag: '产品 2 负责',
    productNumber: '产品 2',
    avatarIcon: 'Building2',
    themeColor: 'purple',
    bgLight: 'bg-purple-50 text-purple-800 border-purple-200',
    textColor: 'text-purple-700',
    description: '负责回答具体行业、城市、公司类型和岗位的真实情况，所有职业事实尽量标明来源与更新时间。',
    responsibilities: [
      '解答具体行业、城市、公司类型的岗位真实生态',
      '提供真实薪资梯队与大厂/初创要求差异',
      '对输出的所有职业事实严格标明【数据来源】与【更新时间】',
      '避免空泛建议，给出落地求职与团队特征'
    ]
  },
  task_coach: {
    id: 'task_coach',
    name: '任务教练 Agent',
    shortName: '教练',
    role: '试路任务工作台导师',
    productTag: '产品 3 负责',
    productNumber: '产品 3',
    avatarIcon: 'Bot',
    themeColor: 'blue',
    bgLight: 'bg-blue-50 text-blue-800 border-blue-200',
    textColor: 'text-blue-700',
    description: '负责在“试路任务”中解释背景资料、澄清用户问题、给有限提示，但不直接替用户完成任务。',
    responsibilities: [
      '解释工单资料、VOC日志与业务背景上下文',
      '澄清用户对任务评判标准与产出要求的疑问',
      '提供结构化、有限的启发式思路提示',
      '坚决不直接替用户写完PRD或替代思考'
    ]
  },
  review_reflection: {
    id: 'review_reflection',
    name: '复盘 Agent',
    shortName: '复盘',
    role: '实战证据提炼与画像写回',
    productTag: '产品 1 & 3 共同衔接',
    productNumber: '产品 1 & 3 衔接',
    avatarIcon: 'Award',
    themeColor: 'rose',
    bgLight: 'bg-rose-50 text-rose-800 border-rose-200',
    textColor: 'text-rose-700',
    description: '负责根据用户的任务产出、过程和感受形成体验证据，说明能力画像与路径判断的更新依据。产品 3 定复盘内容，产品 1 写回画像。',
    responsibilities: [
      '提炼用户任务产出与思考过程中的【体验证据】',
      '产品 3 定复盘内容：形成过程量化与质性评价',
      '产品 1 写回画像：更新用户能力雷达与永久卡牌库',
      '详细解释能力画像跃升与职业路径演进的原因'
    ]
  }
};

export interface SkillCard {
  id: string;
  title: string;
  category: '洞察分析' | '产品策略' | '技术落地' | '数据驱动' | '协作沟通' | '交互体验';
  description: string;
  detail: string;
  icon: string;
  colorTone: 'purple' | 'blue' | 'emerald' | 'amber' | 'rose';
  isBackup?: boolean;
  matchReason?: string;
  workplaceApplication?: string;
  evidenceQuote?: string;
  sourceRefs?: string[];
  claimLevel?: 'fact' | 'interpretation' | 'hypothesis';
  evidenceType?: 'documented_fact' | 'self_report' | 'inference';
  pendingVerification?: boolean;
  nextVerification?: string;
}

export interface UserAuth {
  isLoggedIn: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    unlockedCards: SkillCard[];
  };
}
