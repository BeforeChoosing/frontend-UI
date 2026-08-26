import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Paperclip, 
  Mic, 
  MicOff,
  Send, 
  ArrowRight, 
  User, 
  RefreshCw, 
  RotateCcw,
  CheckCircle2,
  FileText,
  UploadCloud,
  FilePlus,
  Link as LinkIcon,
  X,
  Bot,
  Lightbulb,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FolderArchive,
  Award
} from 'lucide-react';
import { SkillCard } from '../types';
import { mapProfileProposalToSkillCards } from '../features/profile/profileAdapter';
import { useExperienceAnalysis } from '../hooks/useExperienceAnalysis';
import { useProfileExploration } from '../hooks/useProfileExploration';
import { extractProfileMaterial } from '../api/profile';

interface ExperienceInputScreenProps {
  onGenerateCards: (cards: SkillCard[]) => void;
  onBackToLanding: () => void;
  demoMode?: boolean;
  demoCards?: SkillCard[];
  demoExperienceText?: string;
}

export interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: string;
  detectedSignals?: string[];
  attachedFile?: {
    name: string;
    size: string;
    type: 'resume' | 'portfolio' | 'link';
  };
}

const INITIAL_CHAT_MESSAGE: ChatMessage = {
  id: 'msg-init',
  role: 'ai',
  content: '先整理一段经历，再通过补充交流还原你亲自完成的行动、判断依据和实际结果。',
  timestamp: '刚刚',
  detectedSignals: ['只依据你提供的内容', '潜能线索需要验证', '确认后再写入档案'],
};

const EXPLORATION_FOCUS_LABELS = {
  ownership: '本人职责',
  decision: '判断依据',
  constraint: '限制条件',
  collaboration: '协作过程',
  result: '实际结果',
  transfer: '可迁移行为',
  evidence: '证据完整度',
} as const;

function explorationStorageKey(demoMode: boolean, field: 'draft' | 'messages'): string {
  return `before-choosing:profile-exploration:${demoMode ? 'demo' : 'use'}:${field}`;
}

function loadExplorationMessages(demoMode: boolean): ChatMessage[] {
  try {
    const raw = window.localStorage.getItem(explorationStorageKey(demoMode, 'messages'));
    if (!raw) return [INITIAL_CHAT_MESSAGE];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed.slice(-12) : [INITIAL_CHAT_MESSAGE];
  } catch {
    return [INITIAL_CHAT_MESSAGE];
  }
}

interface QuickPreset {
  id: string;
  label: string;
  category: string;
  sampleText: string;
  analysisSummary: string;
  cards: SkillCard[];
}

const PRESET_EXPERIENCES: QuickPreset[] = [
  {
    id: 'project',
    label: '一次项目经历',
    category: '产品/实践',
    sampleText: '大三时我带队做了一个校园二手书流转小程序。最初大家都在抱怨买卖信息分散，我们花了一周走访了6栋宿舍楼，发现核心痛点是信任成本高和交易碰头麻烦。于是我们设计了宿舍楼集中转交点和评分机制，上线首月撮合了800多笔书籍流转。',
    analysisSummary: '该经历包含完整的调研、方案设计与结果验证链路。核心问题集中在信任成本与履约效率，已有机制设计和业务结果。可补充转交点协调的具体方法。',
    cards: [
      {
        id: 'card-problem-decompose',
        title: '问题拆解与底层归因',
        category: '产品策略',
        description: '穿透表层抱怨精准下钻至信任与履约瓶颈，找出高杠杆解',
        detail: '通过一手调研快速定位真实矛盾，避免在非关键功能上浪费研发与运营资源。',
        icon: 'Crosshair',
        colorTone: 'purple',
        workplaceApplication: '主导产品需求优先级排序与 MVP 最小可行性产品定义。',
        matchReason: '来源于通过宿舍走访发现信任与碰头核心矛盾的归因过程。'
      },
      {
        id: 'card-stakeholder-collab',
        title: '复杂利益协同与破局',
        category: '协作沟通',
        description: '主动预判各方诉求与顾虑，以规范化流程争取关键资源支持',
        detail: '具备出色的同理协调与规则设计能力，能推动跨职能团队达成共识。',
        icon: 'Users',
        colorTone: 'emerald',
        workplaceApplication: '在跨部门项目中协调业务、合规、算法与运营推进版本发布。',
        matchReason: '来源于与舍管后勤积极制定交接清单、化解安全顾虑的沟通行动。'
      },
      {
        id: 'card-mvp-delivery',
        title: '敏捷交付与闭环度量',
        category: '技术落地',
        description: '以最小成本搭建可用闭环，通过量化数据检验商业成效',
        detail: '短周期内完成从调研、规则设计到首月800单业务撮合的全流程验证。',
        icon: 'CheckCircle2',
        colorTone: 'blue',
        workplaceApplication: '推动敏捷迭代，用最短周期验证产品在真实市场的转化留存。',
        matchReason: '来源于首月达成800+笔流转的数据闭环验证。'
      }
    ]
  },
  {
    id: 'interest',
    label: '一个长期兴趣',
    category: '自驱/探索',
    sampleText: '我一直坚持摄影和视觉记录，平时会主动记录生活中的人和场景，研究光影表达。在拍摄人物纪实项目时，为了让被拍者放松，我会花很多时间先和他们聊天建立信任，才抓拍到最自然的微表情，并把它们整理成了有逻辑主线的图文故事集。',
    analysisSummary: '该经历体现持续实践、信任建立和信息组织能力。人物沟通与素材整理形成了从观察到结构化表达的完整过程。',
    cards: [
      {
        id: 'card-user-insight',
        title: '用户洞察与同理共情',
        category: '洞察分析',
        description: '善于捕捉细微情绪与人际信任，具备敏锐的一线共情力',
        detail: '通过长期摄影与沟通实践培养的敏锐感知，能快速捕捉用户在真实场景中的隐性诉求与防备心理。',
        icon: 'Eye',
        colorTone: 'purple',
        workplaceApplication: '在产品设计前期主导高精度深度访谈与 VOC 痛点还原。',
        matchReason: '来源于你在拍摄中耐心倾听、破冰建立信任的真实行动。'
      },
      {
        id: 'card-structure-thinking',
        title: '叙事架构与主题表达',
        category: '产品策略',
        description: '将碎片信息与情绪解构为具连贯性和感染力的结构化作品',
        detail: '能把杂乱无章的素材提炼为清晰的主线，具备从 0 到 1 组织复杂交付物的能力。',
        icon: 'Layers',
        colorTone: 'blue',
        workplaceApplication: '负责撰写清晰的业务 PRD 及人机交互规范，向团队传达产品愿景。',
        matchReason: '来源于将零散记录策划为有主题线索图文故事集的组织过程。'
      },
      {
        id: 'card-self-driven',
        title: '自驱探索与持续精进',
        category: '协作沟通',
        description: '在非专业考核领域保持长期好奇心，自主研究技能并产出成果',
        detail: '具有高度的主动学习韧性与交付意识，在未知领域能快速自我迭代。',
        icon: 'Award',
        colorTone: 'emerald',
        workplaceApplication: '在快速变化的 AI 领域敏捷自学前沿 Agent 工具与提示词工程。',
        matchReason: '来源于跨越多年、持续深耕摄影与视觉表达的自发热情。'
      }
    ]
  },
  {
    id: 'choice',
    label: '一次重要选择',
    category: '决策/判断',
    sampleText: '在面对考研与跨界进入科技行业的选择时，我没有随大流，而是用两个月时间系统拆解了 20 个目标岗位的招聘 JD、学习了 3 门前沿公开课并输出了 5 篇深度分析笔记，通过构建能力差距对照表，最终笃定选择了 AI 产品经理方向。',
    analysisSummary: '该经历形成了可复核的职业决策过程。岗位样本、课程学习和能力差距对照表共同构成选择依据。',
    cards: [
      {
        id: 'card-decision-matrix',
        title: '结构化决策与信息搜集',
        category: '产品策略',
        description: '在信息模糊时建立多维度评估矩阵，做出高信度理性决策',
        detail: '通过定量搜集 JD 与定性学习，将不确定性转化为清晰的行动路径。',
        icon: 'Compass',
        colorTone: 'blue',
        workplaceApplication: '在战略模糊期制定清晰的技术选型与业务演进路线。',
        matchReason: '来源于系统拆解20个岗位JD并建立决策矩阵的思考过程。'
      },
      {
        id: 'card-tech-acumen',
        title: '前沿技术敏锐度与自学',
        category: '技术落地',
        description: '自主构建新领域知识图谱，快速理解 AI 概念与落地边界',
        detail: '对新技术持有高度好奇与自学自驱力，能与算法工程师同频沟通。',
        icon: 'Sparkles',
        colorTone: 'purple',
        workplaceApplication: '评估 LLM、Agent 等前沿模型的业务落地可能性与 ROI。',
        matchReason: '来源于自学前沿课程并输出深度行业分析笔记的自驱行动。'
      },
      {
        id: 'card-problem-decompose',
        title: '业务建模与机会识别',
        category: '洞察分析',
        description: '善于从纷繁复杂的行业信息中抽丝剥茧，提取关键商业规律',
        detail: '具备宏观视野与微观拆解能力，能够清晰找准自身的核心杠杆点。',
        icon: 'Crosshair',
        colorTone: 'emerald',
        workplaceApplication: '负责新业务机会探索与市场竞品穿透分析。',
        matchReason: '来源于将行业趋势与个人优势严密对照的归因能力。'
      }
    ]
  },
  {
    id: 'coordination',
    label: '一次组织协调',
    category: '协作/领导',
    sampleText: '在举办百人跨校社团交流会时，原定场地临时被占用。我作为负责人，在2小时内紧急启用了备选方案，重新协调了周边3个小型共享会议室，并利用在线协同看板分流了各组讨论议程，最终活动按时顺利闭幕。',
    analysisSummary: '该经历体现突发情况下的资源重组与进度控制能力。备用场地、协同看板和议程分流形成了可执行的应急方案。',
    cards: [
      {
        id: 'card-crisis-response',
        title: '敏捷应急与风险处置',
        category: '协作沟通',
        description: '面对突发异常迅速启动兜底预案，最小化业务受损风险',
        detail: '高压环境下保持清醒，善于重组可用资源化险为夷。',
        icon: 'Shield',
        colorTone: 'emerald',
        workplaceApplication: '负责线上系统故障应急响应与业务降级策略落地。',
        matchReason: '来源于场地突发冲突时2小时内快速完成备用分流调度的行动。'
      },
      {
        id: 'card-stakeholder-collab',
        title: '多线程调度与项目把控',
        category: '产品策略',
        description: '通过数字化看板透明化任务流转，确保跨组织协同准时履约',
        detail: '善于把复杂的百人活动拆分为模块化的小组讨论，提升组织整体运转效率。',
        icon: 'Users',
        colorTone: 'blue',
        workplaceApplication: '推进大型跨职能项目的端到端交付把控。',
        matchReason: '来源于利用在线看板高效分流与调度现场讨论议程。'
      },
      {
        id: 'card-user-insight',
        title: '同理沟通与情绪安抚',
        category: '洞察分析',
        description: '快速感知参会者疑虑，以确定性信息传递安全感与信任',
        detail: '在混乱中成为团队的主心骨，维持各方对活动目标的聚焦。',
        icon: 'Eye',
        colorTone: 'purple',
        workplaceApplication: '在产品重大改版时负责核心用户预期管理与沟通。',
        matchReason: '来源于突发变动中对全场参与者的透明沟通与有序引导。'
      }
    ]
  },
  {
    id: 'selflearn',
    label: '一次跨界自学',
    category: '成长/学习',
    sampleText: '非计算机专业的我，出于对 AI 智能体的兴趣，花了一个月时间自学 Python 基础与 Dify/Coze 工作流搭建，独立做出了一个帮考研同学自动汇总高校招生简章的资讯机器人，帮助了 200 多位学弟学妹。',
    analysisSummary: '该经历体现从技术学习到实际交付的完整闭环。工具服务了明确用户群体，并产生可核验的使用结果。',
    cards: [
      {
        id: 'card-tech-acumen',
        title: '前沿技术敏锐度与自学',
        category: '技术落地',
        description: '自主构建新领域知识图谱，快速理解 AI 概念与落地边界',
        detail: '对新技术持有高度好奇与自学自驱力，能与算法工程师同频沟通。',
        icon: 'Sparkles',
        colorTone: 'purple',
        workplaceApplication: '评估 LLM、Agent 等前沿模型的业务落地可能性与 ROI。',
        matchReason: '来源于跨界自学并在1个月内做出资讯机器人的行动。'
      },
      {
        id: 'card-mvp-delivery',
        title: '敏捷交付与用户闭环',
        category: '产品策略',
        description: '快速将技术能力包装为低门槛可用产品，服务真实用户',
        detail: '不仅能跑通原型，更能实现 200+ 用户的实际价值落地。',
        icon: 'CheckCircle2',
        colorTone: 'blue',
        workplaceApplication: '打造高转化、交互流畅的创新 AI 消费级产品。',
        matchReason: '来源于为200+考研学子提供稳定简章汇总服务的成效。'
      },
      {
        id: 'card-problem-decompose',
        title: '痛点识别与工具化提效',
        category: '洞察分析',
        description: '敏锐洞察繁琐信息检索痛点，通过自动化工作流大幅解放人力',
        detail: '善于将重复低效的劳动转化为结构化自动化程序。',
        icon: 'Crosshair',
        colorTone: 'emerald',
        workplaceApplication: '优化内部业务流程效率，推进 AI Native 流程革新。',
        matchReason: '来源于将繁琐招生简章检索自动化提炼的核心思路。'
      }
    ]
  },
  {
    id: 'microfix',
    label: '一次微小改进',
    category: '细节/体验',
    sampleText: '在实验室做助教时，我发现每次实验前同学们总在重复问相同的仪器连线问题。我利用半天时间绘制了一张彩色的「3分钟避坑接线图」贴在每张实验台前，之后实验提问率下降了70%，大家完成速度普遍提前了15分钟。',
    analysisSummary: '该经历以轻量可视化改进降低了使用门槛，并通过提问率和完成时间验证效果。',
    cards: [
      {
        id: 'card-user-insight',
        title: '一线体验洞察与减负',
        category: '洞察分析',
        description: '敏锐识别用户重复受挫的高频痛点，以轻量设计消除认知阻力',
        detail: '善于从高频繁琐的咨询中发现系统性漏洞并做出优雅干预。',
        icon: 'Eye',
        colorTone: 'purple',
        workplaceApplication: '优化核心产品链路中的 Drop-off 流失环节。',
        matchReason: '来源于洞察仪器接线痛点并制作3分钟避坑图的细心举措。'
      },
      {
        id: 'card-structure-thinking',
        title: '信息可视化与极简表达',
        category: '产品策略',
        description: '将晦涩复杂的物理步骤转化为一眼即懂的清晰指引',
        detail: '具备极强的信息降维与视觉表达能力。',
        icon: 'Layers',
        colorTone: 'blue',
        workplaceApplication: '设计无门槛的新手引导（Onboarding）体验。',
        matchReason: '来源于彩色接线图带来提问率下降70%的直观成效。'
      },
      {
        id: 'card-mvp-delivery',
        title: '高 ROI 敏捷改进意识',
        category: '技术落地',
        description: '用半天极小时间投入换取全班效率提升的大幅收益',
        detail: '具备明确的投入产出比（ROI）意识。',
        icon: 'CheckCircle2',
        colorTone: 'emerald',
        workplaceApplication: '在有限研发资源下通过增长黑客式微调拉动核心指标。',
        matchReason: '来源于半天绘制图纸即让实验提前15分钟完成的高杠杆成果。'
      }
    ]
  },
  {
    id: 'conflict',
    label: '一次团队冲突化解',
    category: '沟通/共识',
    sampleText: '在做毕业设计小组作品时，两位组员分别坚持要做全功能复杂系统和极简Demo，争执不下导致进度停滞。我组织了一次量化打分会，将评分标准拆为「截止日前交付可行性」和「创新得分」，用客观矩阵化解了情绪对抗，最终达成一致。',
    analysisSummary: '该经历将主观分歧转换为可比较的评估标准，形成了明确的决策过程和团队共识。',
    cards: [
      {
        id: 'card-stakeholder-collab',
        title: '分歧调解与理性共识',
        category: '协作沟通',
        description: '跳出情绪对抗，引入客观量化标准推动多方达成共识',
        detail: '能平衡团队不同主张，保持项目节奏健康向前。',
        icon: 'Users',
        colorTone: 'emerald',
        workplaceApplication: '在跨部门评审中推动技术方案与产品诉求的有效平衡。',
        matchReason: '来源于制定量化评估矩阵化解组员方案分歧的实践。'
      },
      {
        id: 'card-decision-matrix',
        title: '多准则决策与优先级梳理',
        category: '产品策略',
        description: '将模糊争论拆解为交付风险与商业收益的双轴权衡',
        detail: '具备清晰的优先级意识，确保团队资源投入在刀刃上。',
        icon: 'Compass',
        colorTone: 'blue',
        workplaceApplication: '主导复杂业务线的需求排期与 Trade-off 权衡。',
        matchReason: '来源于拆解可行性与创新性评分标准的结构化思维。'
      },
      {
        id: 'card-problem-decompose',
        title: '同理倾听与团队领导力',
        category: '洞察分析',
        description: '关注各方底层动机，保障团队心理安全感与凝聚力',
        detail: '在团队动荡时成为稳定器，促使大家朝着统一目标努力。',
        icon: 'Eye',
        colorTone: 'purple',
        workplaceApplication: '带领跨职能 Squad 敏捷团队高效攻坚。',
        matchReason: '来源于耐心倾听双方诉求并组织理性打分会的领导行动。'
      }
    ]
  },
  {
    id: 'breakthrough',
    label: '一次探索突破',
    category: '探索/破局',
    sampleText: '初入职场接触陌生行业数据时，面对上百张口径不一的业务报表，我花了整整一个周末梳理出了核心数据血缘字典，并主动向主管汇报了数据不一致的根因，帮助团队在下季度消除了30%的报表重复开发。',
    analysisSummary: '该经历体现主动梳理底层数据并推动组织改进的能力，成果已反映在重复开发减少上。',
    cards: [
      {
        id: 'card-problem-decompose',
        title: '系统化梳理与底层治乱',
        category: '洞察分析',
        description: '面对无序混乱的信息源主动搭建标准底座，消除组织隐性内耗',
        detail: '具备从纷繁数据中提炼本质规则的卓越梳理能力。',
        icon: 'Crosshair',
        colorTone: 'purple',
        workplaceApplication: '负责核心业务指标体系与数据中台规则设计。',
        matchReason: '来源于周末主动梳理上百张报表数据血缘字典的自驱行动。'
      },
      {
        id: 'card-mvp-delivery',
        title: '自驱交付与组织影响力',
        category: '技术落地',
        description: '主动发现未被指派的隐性痛点，产出超出预期的基础设施成果',
        detail: '具备强烈的主人翁精神，能自下而上推动团队提效。',
        icon: 'CheckCircle2',
        colorTone: 'emerald',
        workplaceApplication: '推动新工具与新工作流在团队内部的自驱推广。',
        matchReason: '来源于主动汇报不一致根因、减少30%重复开发的突出贡献。'
      },
      {
        id: 'card-structure-thinking',
        title: '架构化思维与知识沉淀',
        category: '产品策略',
        description: '将个人探索沉淀为可复用的组织资产与规范文档',
        detail: '善于将经验标准化，具备极强的文档化与结构化输出能力。',
        icon: 'Layers',
        colorTone: 'blue',
        workplaceApplication: '撰写严谨规范的产品架构文档与业务白皮书。',
        matchReason: '来源于输出高质量数据血缘字典的沉淀过程。'
      }
    ]
  }
];

// Sample demo documents for instant 1-click loading
const SAMPLE_DOCS = [
  {
    name: '个人简历_创新项目与实习经历.pdf',
    size: '1.2 MB',
    type: 'resume' as const,
    summary: '包含3段核心实习：校园二手书流转产品负责人、AI资讯聚合机器人独立开发者、大厂用户体验研究助理。涵盖从 0 到 1 需求调研、数据看板搭建与跨团队协同交付。',
    presetId: 'project'
  },
  {
    name: '过去作品集_AI智能体与体验复盘.pdf',
    size: '4.8 MB',
    type: 'portfolio' as const,
    summary: '收录 2 款独立上线作品的原型演进与用户访谈纪要，附带针对 20+ 真实用户的痛点转化率数据对比与视觉故事表达。',
    presetId: 'selflearn'
  },
  {
    name: '实验室助教项目总结报告.docx',
    size: '860 KB',
    type: 'portfolio' as const,
    summary: '针对实验仪器连线高频痛点绘制「3分钟避坑彩色指南」，通过轻量可视化干预实现提问率下降70%、实验提速15分钟。',
    presetId: 'microfix'
  }
];

export const ExperienceInputScreen: React.FC<ExperienceInputScreenProps> = ({
  onGenerateCards,
  onBackToLanding,
  demoMode = false,
  demoCards = [],
  demoExperienceText = '',
}) => {
  const [inputText, setInputText] = useState(() => (
    window.localStorage.getItem(explorationStorageKey(demoMode, 'draft'))
    || (demoMode ? demoExperienceText : '')
  ));
  const [coachInput, setCoachInput] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  
  // Real-time Chat Messages state
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadExplorationMessages(demoMode));
  const [isAiThinking, setIsAiThinking] = useState(false);

  // File Upload Dialog & Drawer state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTab, setUploadTab] = useState<'resume' | 'portfolio' | 'link'>('resume');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; type: 'resume' | 'portfolio' | 'link' }>>([]);
  const [linkInput, setLinkInput] = useState('');
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parsingStep, setParsingStep] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Expand dialogue history
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const { analyze: analyzeExperience, error: analysisError } = useExperienceAnalysis();
  const { explore: exploreProfile, status: explorationStatus, error: explorationError } = useProfileExploration();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat inside the top bubble when new messages arrive
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isAiThinking]);

  useEffect(() => {
    window.localStorage.setItem(explorationStorageKey(demoMode, 'draft'), inputText);
  }, [demoMode, inputText]);

  useEffect(() => {
    window.localStorage.setItem(
      explorationStorageKey(demoMode, 'messages'),
      JSON.stringify(messages.slice(-12)),
    );
  }, [demoMode, messages]);

  const handleSendCoachMessage = async () => {
    const text = coachInput.trim();
    if (!text || inputText.trim().length < 20 || explorationStatus === 'loading') return;
    setIsAiThinking(true);
    try {
      const conversation = messages.slice(-11).map(message => ({
        role: message.role === 'ai' ? 'assistant' as const : 'user' as const,
        content: message.content,
      }));
      conversation.push({ role: 'user', content: text });
      const response = await exploreProfile({
        experience_text: inputText.trim().slice(0, 12000),
        messages: conversation,
        target_role: 'AI Native 产品经理',
        request_id: `profile-${Date.now()}`,
      });
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp,
      }, {
        id: `ai-${response.trace_id}`,
        role: 'ai',
        content: response.reply,
        timestamp,
        detectedSignals: [
          EXPLORATION_FOCUS_LABELS[response.focus_dimension],
          ...response.evidence_found.slice(0, 2),
        ],
      }].slice(-12));
      setCoachInput('');
      setIsChatExpanded(true);
    } catch {
      // The hook exposes the backend/Qwen error beside the exploration composer.
    } finally {
      setIsAiThinking(false);
    }
  };

  // Quick Preset Click Handler
  const handleSelectPreset = (preset: QuickPreset) => {
    setSelectedPresetId(preset.id);
    setInputText(preset.sampleText);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Use browser speech recognition when available; never insert fabricated speech.
  const handleToggleVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      setVoiceNotice(null);
      return;
    }

    setIsRecording(true);
    setVoiceNotice('正在接收语音输入…');

    // Web Speech API is optional and browser-dependent.
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        let recognitionFailed = false;
        recognition.lang = 'zh-CN';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((res: any) => res[0].transcript)
            .join('');
          setInputText(prev => prev + transcript);
        };

        recognition.onerror = () => {
          recognitionFailed = true;
          setIsRecording(false);
          setVoiceNotice('语音识别失败，请改用文字输入。');
        };

        recognition.onend = () => {
          setIsRecording(false);
          if (!recognitionFailed) setVoiceNotice(null);
        };

        recognition.start();
        return;
      } catch {
        setIsRecording(false);
        setVoiceNotice('当前浏览器无法启动语音识别，请改用文字输入。');
      }
    } else {
      setIsRecording(false);
      setVoiceNotice('当前浏览器不支持语音识别，请改用文字输入。');
    }
  };

  // File Upload Handlers
  const handleTriggerUpload = () => {
    setShowUploadModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadError(null);
    setIsParsingFile(true);
    setParsingStep('正在读取文档中的可复制文本...');
    try {
      const extracted = await extractProfileMaterial(file);
      const fileSize = `${(file.size / 1024 / 1024).toFixed(1)} MB`;
      const newFile = { name: extracted.file_name, size: fileSize, type: uploadTab };
      setUploadedFiles(prev => [...prev, newFile]);
      setInputText(prev => [
        prev.trim(),
        `【材料：${extracted.file_name}】\n${extracted.text}`,
      ].filter(Boolean).join('\n\n').slice(0, 12000));
      setMessages(prev => [...prev, {
        id: `user-upload-${Date.now()}`,
        role: 'user',
        content: `【上传了${uploadTab === 'resume' ? '简历' : '作品集'}】${extracted.file_name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachedFile: newFile,
      }, {
        id: `ai-upload-${Date.now()}`,
        role: 'ai',
        content: `已提取 ${extracted.char_count} 字可复制文本${extracted.truncated ? '（内容较长，已截取前 12000 字）' : ''}。请在输入框核对后再生成候选能力卡。`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detectedSignals: ['文字已读出', '等你确认', '还没有保存到档案'],
      }]);
      setShowUploadModal(false);
    } catch (cause) {
      setUploadError(cause instanceof Error ? cause.message : '材料解析失败，请稍后重试。');
    } finally {
      setIsParsingFile(false);
      setParsingStep('');
      e.target.value = '';
    }
  };

  const handleSelectSampleDoc = (doc: typeof SAMPLE_DOCS[0]) => {
    simulateParseFile(doc.name, doc.size, doc.type, doc.summary, doc.presetId);
  };

  const handleAddLink = () => {
    if (!linkInput.trim()) return;
    const value = linkInput.trim();
    try {
      new URL(value);
    } catch {
      setUploadError('请输入完整的 http:// 或 https:// 链接。');
      return;
    }
    const newFile = { name: value, size: '在线链接', type: 'link' as const };
    setUploadedFiles(prev => [...prev, newFile]);
    setInputText(prev => [prev.trim(), `作品链接：${value}`].filter(Boolean).join('\n\n'));
    setMessages(prev => [...prev, {
      id: `user-link-${Date.now()}`,
      role: 'user',
      content: `【记录了作品链接】${value}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedFile: newFile,
    }, {
      id: `ai-link-${Date.now()}`,
      role: 'ai',
      content: '链接已记录。当前版本不会自动抓取外部页面，请继续补充你在该作品中的具体行动与结果。',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      detectedSignals: ['链接已记录', '等待用户补充'],
    }]);
    setUploadError(null);
    setShowUploadModal(false);
    setLinkInput('');
  };

  const simulateParseFile = (
    fileName: string, 
    fileSize: string, 
    type: 'resume' | 'portfolio' | 'link',
    summaryText?: string,
    presetId?: string
  ) => {
    setIsParsingFile(true);
    setParsingStep('正在读取文档结构并解析经历事实...');

    setTimeout(() => {
      setParsingStep('正在提取关键项目行动、成果与能力线索...');
    }, 600);

    setTimeout(() => {
      setIsParsingFile(false);
      setShowUploadModal(false);

      const newFile = { name: fileName, size: fileSize, type };
      setUploadedFiles(prev => [...prev, newFile]);

      // Add to chat
      const userMsg: ChatMessage = {
        id: `user-upload-${Date.now()}`,
        role: 'user',
        content: `【上传了${type === 'resume' ? '简历' : type === 'portfolio' ? '作品集' : '在线作品'}】${fileName}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachedFile: newFile
      };

      setMessages(prev => [...prev, userMsg]);
      setIsAiThinking(true);

      setTimeout(() => {
        const docSummary = summaryText || (
          type === 'resume' 
            ? `已解析简历《${fileName}》，提取到 3 段关键项目：校园产品从 0 到 1、数据化看板运营与跨团队协同交付。`
            : `已解析作品文档《${fileName}》，提取到原型设计、用户研究和结果验证线索。`
        );

        if (presetId) {
          const matched = PRESET_EXPERIENCES.find(p => p.id === presetId);
          if (matched) {
            setInputText(matched.sampleText);
            setSelectedPresetId(presetId);
          }
        } else if (!inputText) {
          setInputText(docSummary);
        }

        const aiMsg: ChatMessage = {
          id: `ai-upload-${Date.now()}`,
          role: 'ai',
          content: `${docSummary} 可补充其中一段具体经历，或点击下方「分析经历」生成候选能力卡。`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          detectedSignals: ['结构化提取完毕', '高价值行动线索', '准备生成能力卡']
        };

        setMessages(prev => [...prev, aiMsg]);
        setIsAiThinking(false);
      }, 700);
    }, 1300);
  };

  // Trigger the real ProfileAgent flow. UI components only consume the domain result;
  // the API contract and backend DTO mapping live outside this screen.
  const handleStartAnalysis = async () => {
    const userMessages = messages
      .filter(message => message.role === 'user')
      .map(message => message.content)
      .join('\n');
    const combinedContent = [inputText.trim(), userMessages]
      .filter(Boolean)
      .join('\n\n')
      .slice(0, 12000);
    if (!combinedContent || isAnalyzing) return;

    setIsAnalyzing(true);
    setIsAiThinking(true);
    setAnalysisStep('正在整理你做过的事…');

    try {
      if (demoMode && demoCards.length > 0) {
        setMessages(prev => [...prev, {
          id: `ai-analysis-${Date.now()}`,
          role: 'ai',
          content: '校园二手书流转产品经历已经整理好了。接下来确认候选能力卡内容。',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          detectedSignals: demoCards.map(card => card.title),
        }]);
        onGenerateCards(demoCards);
        return;
      }
      const proposal = await analyzeExperience({
        experience_text: combinedContent,
        target_role: 'AI Native 产品经理',
      });
      const cards = mapProfileProposalToSkillCards(proposal);
      const aiMsg: ChatMessage = {
        id: `ai-analysis-${Date.now()}`,
        role: 'ai',
        content: `${proposal.experience.title} 已经整理好了。${proposal.next_question}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detectedSignals: cards.map(card => card.title),
      };
      setMessages(prev => [...prev, aiMsg]);
      onGenerateCards(cards);
    } catch {
      // The hook exposes the actionable backend/Qwen error below the CTA.
      setAnalysisStep('');
    } finally {
      setIsAnalyzing(false);
      setIsAiThinking(false);
    }
  };

  const latestAiMessage = [...messages].reverse().find(m => m.role === 'ai') || messages[0];

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-between max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative">
      
      {/* Background Soft Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-50/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-stone-100/60 blur-3xl" />
      </div>

      <div className="space-y-4 sm:space-y-6 relative z-10">
        
        {/* 
          ======================================================================
          1. TOP DYNAMIC AGENT CHAT BUBBLE (Conversational Agent Speech Area)
          ======================================================================
        */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="craft-card w-full rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-white/85 backdrop-blur-xl border border-stone-200/50 flex flex-col gap-3 relative"
        >
          {/* Main Top Header Line */}
          <div className="flex items-start gap-3.5 sm:gap-5">
            {/* Agent Avatar Circle */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0 border border-stone-200/60">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-stone-900 text-emerald-300 flex items-center justify-center shadow-xs">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
              </div>
            </div>

            {/* Agent Content and Real-time dialogue */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-normal text-stone-900 font-serif craft-serif tracking-tight flex items-center gap-2">
                  <span>先说说你的经历</span>
                  <span className="craft-chip-green text-[10px] font-medium px-2 py-0.5 rounded-full font-mono">
                    01 · 认识自己
                  </span>
                </h2>
                
                {/* Expand / Collapse Dialogue History Toggle if multiple messages */}
                {messages.length > 2 && (
                  <button
                    onClick={() => setIsChatExpanded(!isChatExpanded)}
                    className="text-[11px] text-stone-500 hover:text-stone-800 transition flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span>{isChatExpanded ? '收起历史' : `查看全部对话 (${messages.length})`}</span>
                    {isChatExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {/* Collapsed view: Latest AI response */}
              {!isChatExpanded ? (
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                    {latestAiMessage.content}
                  </p>

                  {/* Highlighted capability signals pill badges */}
                  {latestAiMessage.detectedSignals && latestAiMessage.detectedSignals.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-stone-500 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-emerald-600" />
                        <span>我注意到：</span>
                      </span>
                      {latestAiMessage.detectedSignals.map((signal, idx) => (
                        <span 
                          key={idx} 
                          className="text-[10px] font-medium py-0.5 px-2 rounded-full bg-emerald-50/80 border border-emerald-200/60 text-emerald-800"
                        >
                          {signal}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Expanded Dialogue List */
                <div 
                  ref={chatScrollRef}
                  className="max-h-60 overflow-y-auto space-y-3 pr-1 pt-1 scrollbar-thin"
                >
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'ai' && (
                        <div className="w-6 h-6 rounded-full bg-stone-900 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                            教练
                        </div>
                      )}
                      
                      <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-stone-900 text-stone-100 rounded-tr-xs' 
                          : 'bg-white/95 text-stone-800 border border-stone-200/80 rounded-tl-xs shadow-2xs'
                      }`}>
                        {msg.attachedFile && (
                          <div className="mb-1.5 pb-1.5 border-b border-stone-700/40 flex items-center gap-1.5 text-[11px] text-emerald-300">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{msg.attachedFile.name} ({msg.attachedFile.size})</span>
                          </div>
                        )}
                        <p>{msg.content}</p>
                        {msg.detectedSignals && (
                          <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-stone-100">
                            {msg.detectedSignals.map((s, idx) => (
                              <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {msg.role === 'user' && (
                        <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                          你
                        </div>
                      )}
                    </div>
                  ))}

                  {isAiThinking && (
                    <div className="flex items-center gap-2 text-xs text-stone-500 italic py-1">
                      <RefreshCw className="w-3 h-3 animate-spin text-emerald-700" />
                      <span>正在整理经历中的行动与结果…</span>
                    </div>
                  )}
                </div>
              )}

              {/* Uploaded File summary pill if any */}
              {uploadedFiles.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-stone-500">已附加材料：</span>
                  <div className="flex flex-wrap gap-1.5">
                    {uploadedFiles.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200/60">
                        <FileText className="w-3 h-3 text-stone-600" />
                        <span className="max-w-[140px] truncate">{f.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Quick upload guide prompt bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-stone-100 text-[11px] text-stone-600">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-400">💡 提示：</span>
              <span>可以直接写，也可以点左侧 📎 上传简历或作品</span>
            </div>
            <button
              onClick={handleTriggerUpload}
              className="text-stone-800 hover:text-stone-950 font-medium underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <span>上传材料</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="grid gap-2 border-t border-stone-100 pt-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="block text-[11px] font-medium text-stone-700">
              补充交流
              <textarea
                value={coachInput}
                onChange={event => setCoachInput(event.target.value)}
                rows={2}
                maxLength={1000}
                placeholder="补充你希望进一步梳理的行动、判断或结果。Enter 仅用于换行。"
                className="mt-1.5 w-full resize-none rounded-2xl border border-stone-200 bg-white/90 px-3 py-2 text-xs font-normal leading-5 text-stone-800 outline-none transition-colors focus:border-emerald-400"
              />
            </label>
            <button
              type="button"
              onClick={() => void handleSendCoachMessage()}
              disabled={!coachInput.trim() || inputText.trim().length < 20 || explorationStatus === 'loading'}
              className="craft-btn-black flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            >
              {explorationStatus === 'loading' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              发送给能力教练
            </button>
          </div>
          {inputText.trim().length < 20 && coachInput.trim() && (
            <p className="text-[10px] text-amber-700">先在经历草稿中补充至少 20 个字，再发送本轮交流。</p>
          )}
          {explorationError && <p role="alert" className="text-[10px] text-rose-700">{explorationError}</p>}

        </motion.div>

        {/* 
          ======================================================================
          2. MIDDLE MAIN INPUT CARD (Clean Canvas with Left Tools & Right Avatar)
          ======================================================================
        */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="space-y-2"
        >
          {/* The Large Input Board */}
          <div className="craft-card w-full rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-white/90 backdrop-blur-xl border border-stone-200/50 flex flex-col sm:flex-row gap-3.5 items-stretch">
            
            {/* Left Toolbar Icons */}
            <div className="flex sm:flex-col items-center justify-center sm:justify-start gap-2 shrink-0 pt-0.5 border-b sm:border-b-0 sm:border-r border-stone-100 pb-2 sm:pb-0 sm:pr-3.5">
              {/* Upload Button */}
              <button
                type="button"
                onClick={handleTriggerUpload}
                title="上传简历文档或作品集"
                className="w-9 h-9 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-950 flex items-center justify-center transition border border-stone-200/50 cursor-pointer group relative"
                id="btn-upload-attachment"
              >
                <Paperclip className="w-4 h-4 text-stone-700 group-hover:scale-110 transition-transform" />
                {uploadedFiles.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-600 text-[9px] text-white flex items-center justify-center font-mono font-bold">
                    {uploadedFiles.length}
                  </span>
                )}
              </button>

              {/* Voice Button */}
              <button
                type="button"
                onClick={handleToggleVoice}
                title="语音输入自述"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition border border-stone-200/50 cursor-pointer ${
                  isRecording 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-950'
                }`}
                id="btn-voice-input"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-stone-700" />}
              </button>
            </div>

            {/* Central persistent experience draft */}
            <div className="flex-1 min-h-[140px] sm:min-h-[160px] flex flex-col justify-between">
              
              {/* Voice feedback banner */}
              {voiceNotice && (
                <div className="mb-2 py-1 px-2.5 rounded-lg bg-emerald-50 text-emerald-900 text-xs font-medium flex items-center justify-between border border-emerald-200/50">
                  <span>🎙️ {voiceNotice}</span>
                  {isRecording && <span className="text-[10px] text-emerald-700">点击麦克风停止</span>}
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (selectedPresetId) setSelectedPresetId(null);
                }}
                rows={4}
                placeholder="写下一次项目、实习、比赛或长期兴趣。&#10;重点说说：你做了什么，后来发生了什么。"
                className="w-full h-full bg-transparent text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 leading-relaxed resize-none outline-none font-normal p-1"
              />

              {/* Word Count / persistent draft status */}
              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <span>{inputText ? `已输入 ${inputText.length} 字` : '可以从下方选择一个经历模板'}</span>
                  {inputText && (
                    <button
                      onClick={() => {
                        setInputText('');
                        setSelectedPresetId(null);
                      }}
                      className="text-stone-400 hover:text-stone-700 transition flex items-center gap-0.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>清空</span>
                    </button>
                  )}
                </div>

                <span className="text-[10px] text-stone-400">草稿自动保存在当前浏览器</span>
              </div>
            </div>

            {/* Right User Avatar Badge */}
            <div className="hidden sm:flex flex-col items-center justify-start shrink-0 pl-3.5 border-l border-stone-100 pt-0.5">
              <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-600 flex flex-col items-center justify-center border border-stone-200/50">
                <User className="w-4 h-4 text-stone-600" />
              </div>
              <span className="text-[10px] text-stone-400 font-medium mt-1">你</span>
            </div>

          </div>

          {/* Subtitle / Footnote */}
          <p className="text-center text-[11px] sm:text-xs text-stone-500 font-normal">
            整理后会得到几张候选能力卡，你可以保留、修改或删除。
          </p>
        </motion.div>

        {/* 
          ======================================================================
          3. BOTTOM QUICK START (Pill Chips Grid strictly from wireframe)
          ======================================================================
        */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-3 pt-1 text-center"
        >
          {/* Quick Start Title and Description */}
          <div>
            <h3 className="text-sm sm:text-base font-normal text-stone-900 font-serif craft-serif">
              快速开始
            </h3>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
              选一个开头，我们帮你把话题展开
            </p>
          </div>

          {/* 2 Rows of 4 Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 max-w-3xl mx-auto">
            {PRESET_EXPERIENCES.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`py-2 px-3 rounded-full text-xs font-normal transition-all duration-200 cursor-pointer border text-center truncate ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-white/80 hover:bg-white text-stone-700 hover:text-stone-950 border-stone-200/70 hover:border-stone-400'
                  }`}
                  title={preset.sampleText}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </motion.div>

      </div>

      {/* 
        ======================================================================
        4. BOTTOM CENTER CALL-TO-ACTION BUTTON (分析经历)
        ======================================================================
      */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="pt-6 pb-2 flex flex-col items-center justify-center gap-3 relative z-10"
      >
        <button
          onClick={handleStartAnalysis}
          disabled={(!inputText.trim() && messages.length <= 1) || isAnalyzing}
          className={`w-full sm:w-64 py-3.5 px-8 rounded-full font-medium text-sm sm:text-base transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center gap-2 ${
            (inputText.trim() || messages.length > 1) && !isAnalyzing
              ? 'bg-stone-900 hover:bg-black text-white active:scale-98'
              : 'bg-stone-200/80 text-stone-400 cursor-not-allowed'
          }`}
          id="btn-analyze-experience"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span className="text-white text-sm font-normal">
                {analysisStep || '正在整理经历…'}
              </span>
            </>
          ) : (
            <span className="tracking-wide text-white font-medium">
              帮我整理这段经历
            </span>
          )}
        </button>

        {analysisError && (
          <div
            role="alert"
            className="max-w-xl rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-center text-xs leading-relaxed text-rose-800"
          >
            {analysisError}
          </div>
        )}

        {/* Back Link */}
        <button
          onClick={onBackToLanding}
          className="text-xs text-stone-400 hover:text-stone-700 transition cursor-pointer font-normal"
        >
          ← 返回首页
        </button>
      </motion.div>

      {/* 
        ======================================================================
        5. MODAL: GUIDED FILE / RESUME / PORTFOLIO UPLOAD MODAL
        ======================================================================
      */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl bg-[#F8F5F0] rounded-3xl p-6 sm:p-7 border border-[#E3D8CC] shadow-2xl space-y-5 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-5 right-5 text-stone-400 hover:text-stone-800 p-1 rounded-full hover:bg-stone-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8DDD0] text-stone-800 text-xs font-bold">
                  <UploadCloud className="w-3.5 h-3.5 text-amber-700" />
                  <span>引导材料解析</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-serif craft-serif">
                  上传个人简历或过去作品
                </h3>
                <p className="text-xs text-stone-600">
                    系统将提炼文档中的客观事实、项目角色与核心产出，辅助完成能力提取。
                </p>
              </div>

              {/* Tabs: 简历 vs 过去作品 vs 在线链接 */}
              <div className="grid grid-cols-3 gap-2 bg-[#EAE2D7] p-1 rounded-xl text-xs font-medium text-stone-700">
                <button
                  onClick={() => setUploadTab('resume')}
                  className={`py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    uploadTab === 'resume' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'hover:text-stone-950'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>个人简历</span>
                </button>

                <button
                  onClick={() => setUploadTab('portfolio')}
                  className={`py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    uploadTab === 'portfolio' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'hover:text-stone-950'
                  }`}
                >
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>过去作品集</span>
                </button>

                <button
                  onClick={() => setUploadTab('link')}
                  className={`py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    uploadTab === 'link' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'hover:text-stone-950'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>在线作品链接</span>
                </button>
              </div>

              {/* Tab Content */}
              {uploadTab !== 'link' ? (
                <div className="space-y-4">
                  {/* Drag & Drop Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#D5C6B5] hover:border-stone-600 rounded-2xl p-6 text-center bg-white/70 hover:bg-white transition cursor-pointer group space-y-2"
                  >
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept=".pdf,.docx,.txt,.md"
                      className="hidden" 
                      onChange={handleFileUpload}
                    />
                    <div className="w-12 h-12 rounded-full bg-[#EDE5DB] group-hover:bg-[#E5D7C9] text-stone-800 flex items-center justify-center mx-auto transition">
                      <UploadCloud className="w-6 h-6 text-stone-700" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-stone-900">
                        点击选择文件，或将文件拖放到此处
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        支持 PDF、Word (.docx)、Markdown、TXT 文档 (最大 20MB；扫描件暂不支持 OCR)
                      </p>
                    </div>
                  </div>

                  {/* One-click Sample Demo Documents */}
                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-bold text-stone-800 flex items-center justify-between">
                      <span>或者选择预设文档快速开始：</span>
                      <span className="text-[10px] text-stone-500 font-normal">快速测试</span>
                    </div>

                    <div className="space-y-1.5">
                      {SAMPLE_DOCS.map((doc, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectSampleDoc(doc)}
                          className="p-2.5 rounded-xl bg-[#EDE7DF] hover:bg-[#E2D9CE] border border-[#DDD3C6] transition cursor-pointer flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-200 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-stone-900 truncate group-hover:text-amber-900">
                                {doc.name}
                              </p>
                              <p className="text-[10px] text-stone-500 truncate">
                                {doc.summary}
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] text-stone-600 font-bold px-2 py-1 rounded bg-white/80 shrink-0 ml-2 group-hover:bg-stone-900 group-hover:text-amber-200 transition">
                            载入解析
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Online Link Input View */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-800 block">
                      输入作品链接（如 GitHub、Figma、Notion、个人网站、飞书文档）
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        placeholder="https://github.com/your-project 或 Notion 链接"
                        className="flex-1 text-xs bg-white rounded-xl px-3.5 py-2.5 border border-stone-300 outline-none shadow-inner"
                      />
                      <button
                        onClick={handleAddLink}
                        disabled={!linkInput.trim()}
                        className="py-2.5 px-4 rounded-xl bg-stone-900 text-amber-200 text-xs font-bold hover:bg-stone-800 disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        记录链接
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#EDE7DF] text-xs text-stone-600 space-y-1">
                    <p className="font-bold text-stone-800">💡 提示：</p>
                    <p>当前版本仅记录链接，不会自动抓取外部页面；请同时补充你在作品中的具体行动与结果。</p>
                  </div>
                </div>
              )}

              {uploadError && (
                <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {uploadError}
                </p>
              )}

              {/* Parsing Loading Overlay */}
              {isParsingFile && (
                <div className="absolute inset-0 bg-[#F8F5F0]/95 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
                  <RefreshCw className="w-8 h-8 animate-spin text-amber-700" />
                  <p className="text-sm font-bold text-stone-900 font-serif craft-serif">
                    {parsingStep || '正在深度解析材料中的经历与产出...'}
                  </p>
                  <p className="text-xs text-stone-500">
                    提取客观事实、数据度量与关键行动线索
                  </p>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
