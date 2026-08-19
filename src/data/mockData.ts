import { SkillCard } from '../types';

export const HERO_FLOATING_CARDS: SkillCard[] = [
  {
    id: 'card-insight',
    title: '用户洞察',
    category: '洞察分析',
    description: '穿透表层诉求，挖掘用户真实动机与隐性痛点',
    detail: '擅长通过用户深访、语义聚类和体验地图，从散乱的反馈中提炼核心高价值痛点。',
    icon: 'Search',
    colorTone: 'purple',
    workplaceApplication: '在产品立项与需求定义阶段，精准锁定MVP的核心价值主张。'
  },
  {
    id: 'card-problem',
    title: '问题拆解',
    category: '产品策略',
    description: '将复杂模糊的业务命题拆解为可落地的逻辑树',
    detail: '善用MECE原则与因果链路图，将模糊的“产品不好用”精确定位到模块与参数。',
    icon: 'GitFork',
    colorTone: 'blue',
    workplaceApplication: '面对跨部门协同的复杂阻力，能迅速理清依赖关系和主次矛盾。'
  },
  {
    id: 'card-ai-craft',
    title: 'AI能力抽象',
    category: '技术落地',
    description: '连接大模型技术边界与用户真实交互心智',
    detail: '精通Prompt工程、RAG机制与Agent编排逻辑，设计优雅的人机协作闭环。',
    icon: 'Sparkles',
    colorTone: 'emerald',
    workplaceApplication: '为业务场景定义AI能力的输入输出规范与兜底机制。'
  },
  {
    id: 'card-data-driven',
    title: '数据驱动',
    category: '数据驱动',
    description: '用量化指标指导产品迭代与收益归因',
    detail: '建立北极星指标体系，敏锐洞察漏斗流失拐点，用A/B测试验证设计假设。',
    icon: 'LineChart',
    colorTone: 'amber',
    workplaceApplication: '评估功能上线前后的转化提升与ROI投入产出比。'
  },
  {
    id: 'card-prd',
    title: '产品落地交付',
    category: '协作沟通',
    description: '清晰撰写PRD与设计交互规范，推进敏捷研发',
    detail: '输出高质量高可读性的产品原型与边界分支逻辑，确保研发准确理解。',
    icon: 'Layers',
    colorTone: 'rose',
    workplaceApplication: '确保需求在敏捷双周迭代中高品质交付上线。'
  }
];

export const CAREER_WIKI_ENTRIES = [
  {
    role: 'AI产品经理 (AI PM)',
    match: '岗位资料',
    description: '负责将前沿大语言模型与多模态能力转化为用户可感知的杀手级应用，平衡模型幻觉、Token成本与用户心智。',
    cityDistribution: '北京 (38%)、上海 (26%)、深圳 (20%)、杭州 (12%)',
    salaryRange: '25k~45k · 15~18薪 (年薪 35w~80w)',
    companyTypes: {
      bigTech: '互联网大厂：重点考核 Badcase 归因体系、灰度实验平台与单位用户算力成本把控。',
      unicorn: 'AI独角兽：要求全链路 Prompt/RAG/Agent 编排与行业痛点极其敏锐的原型交付。',
      startup: '初创企业：强调极速验证 MVP、兼顾市场获客与商业化定价闭环。'
    },
    coreSkills: ['意图建模与场景定义', 'Prompt/RAG/Agent链路架构', 'Badcase量化评测体系', '人机交互心智设计'],
    careerPath: '初级AI产品助理 → 场景AI PM → 垂类大模型业务Owner → 创新业务合伙人',
    citation: {
      source: '2026年中国AI前沿人才市场洞察报告 & 全网真实在招JD样本库 (N=4,820)',
      updatedAt: '2026年3月'
    }
  },
  {
    role: 'AI交互体验设计师 (UX/Agent Designer)',
    match: '岗位资料',
    description: '重新定义AI时代的人机交互模式，从传统GUI向LUI与智能体协同演进，设计流式加载、主动澄清与拟人反馈。',
    cityDistribution: '上海 (34%)、北京 (30%)、深圳 (22%)、广州/杭州 (14%)',
    salaryRange: '20k~38k · 14~16薪 (年薪 28w~60w)',
    companyTypes: {
      bigTech: '互联网大厂：负责设计全公司统一的 Agent 交互设计系统规范与多模态微交互。',
      unicorn: 'AI独角兽：打磨下一代生产力工具的画布与卡片流，追求极致丝滑。',
      startup: '初创企业：一人包揽从品牌视觉、原型动效到用户可用性走查。'
    },
    coreSkills: ['意图澄清界面设计', '实时流式动画与等待反馈', '多模态输入融合', '容错与信任机制构建'],
    careerPath: 'UI/UX设计师 → AI体验架构师 → 交互创新专家',
    citation: {
      source: '2026全球生成式交互体验趋势报告 (IXDC)',
      updatedAt: '2026年2月'
    }
  },
  {
    role: '数据与增长策略专家 (AI Growth)',
    match: '岗位资料',
    description: '通过数据挖掘用户对话与流失漏斗，通过精细化策略驱动模型对话深度、留存与付费转化。',
    cityDistribution: '北京 (35%)、深圳 (30%)、杭州 (22%)、上海 (13%)',
    salaryRange: '22k~40k · 15~17薪 (年薪 32w~68w)',
    companyTypes: {
      bigTech: '互联网大厂：主导十亿级请求的用户会话流失归因、A/B分流与Token消耗ROI模型。',
      unicorn: 'AI独角兽：通过自驱的增长黑客手段引爆海内外社媒传播与PLG产品驱动增长。',
      startup: '初创企业：通过精细化社群运营与KOL矩阵实现低成本获客。'
    },
    coreSkills: ['会话漏斗归因', 'A/B实验平台设计', '用户生命周期分层', 'ROI投入产出量化'],
    careerPath: '增长分析师 → 策略产品经理 → 商业化总监',
    citation: {
      source: '2026科技公司商业化与增长策略人才调研',
      updatedAt: '2026年3月'
    }
  }
];
