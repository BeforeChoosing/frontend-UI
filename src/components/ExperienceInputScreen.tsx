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
  Award,
  ShieldCheck,
  Briefcase,
  Compass,
  Target,
  Zap,
  BookOpen,
  Check,
  Pencil,
  Sprout,
  MessageSquare,
} from 'lucide-react';
import { SkillCard } from '../types';
import { mapProfileProposalToSkillCards } from '../features/profile/profileAdapter';
import { useExperienceAnalysis } from '../hooks/useExperienceAnalysis';
import { useProfileExploration } from '../hooks/useProfileExploration';
import { extractProfileMaterial, extractProfileMultimodalEvidence } from '../api/profile';
import { auditEvent } from '../api/client';
import { findProfileSkill, PROFILE_SKILLS, type ProfileSkillId } from '../features/profile/profileSkills';
import type { ApiExperienceSummary } from '../types/api';

interface ExperienceInputScreenProps {
  onGenerateCards: (cards: SkillCard[], experience: ApiExperienceSummary) => void;
  onBackToLanding: () => void;
  demoMode?: boolean;
  demoCards?: SkillCard[];
  demoExperienceText?: string;
  focusRequest?: number;
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
  content: '你好！分享一段过往经历（一次校园项目、一段长期热爱、一次重要选择或突发协调）。你可以直接在下方控制台输入或使用快捷指令，我会陪你下钻追问并提炼能力卡。',
  timestamp: '刚刚',
  detectedSignals: [],
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

type UploadedMaterial = {
  name: string;
  size: string;
  type: 'resume' | 'portfolio' | 'link';
};

type TargetCareerState = 'unselected' | 'has_target' | 'no_target';

const DEFAULT_TARGET_ROLE = 'AI 产品经理';

type DemoProbingRound = {
  title: string;
  question: string;
  options: string[];
  defaultAnswer: string;
  clues: string[];
};

const DEMO_PROBING_REPLY = '这段经历已经包含清晰的问题识别、方案取舍、协作推进和结果验证。接下来我会通过四轮追问，补齐你的判断依据与可迁移能力。';

const DEMO_PROBING_ROUNDS: DemoProbingRound[] = [
  {
    title: '情境与动机下钻',
    question: '在当时着手解决这个问题的最初阶段，最直接触发你去推进它的痛点或契机是什么？当时大家普遍的反应是怎样的？',
    options: [
      '大家都在抱怨但没人动手，我发现核心矛盾是信任和履约成本',
      '信息极度不对称，迫切需要一个统一透明的流转规则',
      '最初只是帮身边朋友解决麻烦，后来发现是普遍刚需',
    ],
    defaultAnswer: '大家都在抱怨但没人动手，我发现核心矛盾是信任和履约成本',
    clues: ['底层问题归因', '敏锐痛点捕捉'],
  },
  {
    title: '关键行动与决策权衡',
    question: '面对实际落地中的具体阻力，你采取了哪些最关键的行动？在多种可能中你放弃了什么、坚守了什么？',
    options: [
      '主动找舍管沟通，用标准交接单化解安全顾虑',
      '放弃复杂的线上支付，用最轻量的面对面转交快速验证',
      '建立履约评价机制，让表现稳定的用户获得更高优先级',
    ],
    defaultAnswer: '主动找舍管沟通，用标准交接单化解安全顾虑',
    clues: ['关键路径决策', '利益协同破局'],
  },
  {
    title: '成效度量与客观反馈',
    question: '这些行动最终带来了哪些可验证的结果？团队或用户的反馈如何？',
    options: [
      '首月完成 800 余笔书籍流转，交易双方的沟通成本明显降低',
      '模式获得辅导员和社团骨干认可，随后扩展到其他宿舍楼',
      '团队形成了可复用的交接文档与数据复盘方法',
    ],
    defaultAnswer: '首月完成 800 余笔书籍流转，交易双方的沟通成本明显降低',
    clues: ['闭环交付度量', '长期价值沉淀'],
  },
  {
    title: '胜任力模式提炼',
    question: '结合这段经历，最能代表你做事方式的核心优势是什么？',
    options: [
      '能快速穿透表象，找到最小成本的高杠杆解法',
      '擅长站在他人角度沟通，把阻力转化为可协作的条件',
      '会主动建立指标与复盘机制，让方案在真实结果中得到验证',
    ],
    defaultAnswer: '能快速穿透表象，找到最小成本的高杠杆解法',
    clues: ['高阶胜任力画像', '自我认知清晰度'],
  },
];

const DEMO_EXPERIENCE_SUMMARY: ApiExperienceSummary = {
  title: '校园二手书流转产品实践',
  actions: ['访谈学生并归纳信任成本与碰面效率问题', '推动集中交接点与评分机制上线'],
  result: '上线首月完成 800 余笔书籍流转',
  source_refs: ['示例个人简历.pdf', '校园二手书项目补充材料.pdf'],
};

function explorationStorageKey(
  demoMode: boolean,
  field: 'evidence' | 'messages' | 'materials' | 'consent' | 'target-state' | 'target-role',
): string {
  const versionedField = field === 'messages'
    ? 'messages-v3'
    : field === 'evidence'
      ? 'evidence-v3'
      : field === 'materials'
        ? 'attachments-v3'
        : field;
  return `before-choosing:profile-exploration:${demoMode ? 'demo' : 'use'}:${versionedField}`;
}

function loadTargetCareerState(demoMode: boolean): TargetCareerState {
  const value = window.localStorage.getItem(explorationStorageKey(demoMode, 'target-state'));
  if (value === 'has_target' || value === 'no_target' || value === 'unselected') return value;
  return demoMode ? 'has_target' : 'unselected';
}

function loadTargetRole(demoMode: boolean): string {
  const value = window.localStorage.getItem(explorationStorageKey(demoMode, 'target-role'))?.trim();
  return value || (demoMode ? DEFAULT_TARGET_ROLE : '');
}

function loadExplorationMessages(demoMode: boolean): ChatMessage[] {
  try {
    const raw = window.localStorage.getItem(explorationStorageKey(demoMode, 'messages'));
    if (!raw) return [INITIAL_CHAT_MESSAGE];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed.slice(-30).map(message => message.id === INITIAL_CHAT_MESSAGE.id ? INITIAL_CHAT_MESSAGE : message)
      : [INITIAL_CHAT_MESSAGE];
  } catch {
    return [INITIAL_CHAT_MESSAGE];
  }
}

function loadUploadedMaterials(demoMode: boolean): UploadedMaterial[] {
  try {
    const raw = window.localStorage.getItem(explorationStorageKey(demoMode, 'materials'));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UploadedMaterial[];
    return Array.isArray(parsed) ? parsed.filter(item => item?.name && item?.type) : [];
  } catch {
    return [];
  }
}

function upsertMaterialEvidence(
  current: string,
  type: 'resume' | 'portfolio',
  fileName: string,
  text: string,
): string {
  const label = type === 'resume' ? '个人简历' : '项目补充材料';
  const start = `【${label}开始】`;
  const end = `【${label}结束】`;
  const startIndex = current.indexOf(start);
  const endIndex = current.indexOf(end);
  const withoutPrevious = startIndex >= 0 && endIndex >= startIndex
    ? `${current.slice(0, startIndex)}${current.slice(endIndex + end.length)}`.trim()
    : current.trim();
  const boundedText = text.slice(0, 5200);
  return [withoutPrevious, `${start}\n文件：${fileName}\n${boundedText}\n${end}`]
    .filter(Boolean)
    .join('\n\n')
    .slice(0, 12000);
}

function formatMultimodalEvidence(
  items: Array<{
    source_ref: string;
    page: number;
    bbox: number[];
    quote: string;
  }>,
): string {
  return items
    .map(item => `[${item.source_ref} | 第${item.page}页 | bbox:${item.bbox.join(',')}] ${item.quote}`)
    .join('\n');
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
  focusRequest = 0,
}) => {
  const [inputText, setInputText] = useState(() => (
    window.localStorage.getItem(explorationStorageKey(demoMode, 'evidence')) || ''
  ));
  const [coachInput, setCoachInput] = useState(() => (
    demoMode && !window.localStorage.getItem(explorationStorageKey(true, 'evidence'))
      ? demoExperienceText
      : ''
  ));
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [targetCareerState, setTargetCareerState] = useState<TargetCareerState>(() => (
    loadTargetCareerState(demoMode)
  ));
  const [targetRole, setTargetRole] = useState(() => loadTargetRole(demoMode));
  const [targetRoleDraft, setTargetRoleDraft] = useState(() => loadTargetRole(demoMode));
  const [isEditingTargetRole, setIsEditingTargetRole] = useState(false);
  const [showCommandsMenu, setShowCommandsMenu] = useState(false);
  const [commandNotice, setCommandNotice] = useState<string | null>(null);
  const [demoProbingActive, setDemoProbingActive] = useState(false);
  const [isDemoReplying, setIsDemoReplying] = useState(false);
  const [demoProbingRoundIndex, setDemoProbingRoundIndex] = useState(0);
  const [demoProbingInput, setDemoProbingInput] = useState('');
  const [demoProbingHistory, setDemoProbingHistory] = useState<Array<{
    round: number;
    question: string;
    answer: string;
  }>>([]);
  
  // Real-time Chat Messages state
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadExplorationMessages(demoMode));
  const [isAiThinking, setIsAiThinking] = useState(false);

  // File Upload Dialog & Drawer state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTab, setUploadTab] = useState<'resume' | 'portfolio' | 'link'>('resume');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedMaterial[]>(() => loadUploadedMaterials(demoMode));
  const [linkInput, setLinkInput] = useState('');
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parsingStep, setParsingStep] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Expand dialogue history
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const { analyze: analyzeExperience, error: analysisError } = useExperienceAnalysis();
  const {
    explore: exploreProfile,
    status: explorationStatus,
    error: explorationError,
    queueStatus,
    cancel: cancelExploration,
    reset: resetExploration,
  } = useProfileExploration();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const demoTypingTimerRef = useRef<number | null>(null);
  const demoTransitionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!focusRequest) return;
    const frame = window.requestAnimationFrame(() => textareaRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [focusRequest]);

  const focusedConversationActive = messages.some(message => message.role === 'user');

  useEffect(() => {
    if (!focusedConversationActive) return;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [focusedConversationActive]);

  useEffect(() => {
    if (!focusedConversationActive || !chatScrollRef.current) return;
    chatScrollRef.current.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: 'instant',
    });
  }, [focusedConversationActive, demoProbingHistory, demoProbingRoundIndex, messages]);

  useEffect(() => () => {
    if (demoTypingTimerRef.current !== null) window.clearInterval(demoTypingTimerRef.current);
    if (demoTransitionTimerRef.current !== null) window.clearTimeout(demoTransitionTimerRef.current);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(explorationStorageKey(demoMode, 'evidence'), inputText);
  }, [demoMode, inputText]);

  useEffect(() => {
    window.localStorage.setItem(
      explorationStorageKey(demoMode, 'messages'),
      JSON.stringify(messages.slice(-30)),
    );
  }, [demoMode, messages]);

  useEffect(() => {
    window.localStorage.setItem(
      explorationStorageKey(demoMode, 'materials'),
      JSON.stringify(uploadedFiles),
    );
  }, [demoMode, uploadedFiles]);

  useEffect(() => {
    window.localStorage.setItem(
      explorationStorageKey(demoMode, 'target-state'),
      targetCareerState,
    );
  }, [demoMode, targetCareerState]);

  useEffect(() => {
    window.localStorage.setItem(
      explorationStorageKey(demoMode, 'target-role'),
      targetRole.trim(),
    );
  }, [demoMode, targetRole]);

  const handleNewBlankConversation = async () => {
    if (explorationStatus === 'loading') await cancelExploration();
    setInputText('');
    setCoachInput(demoExperienceText);
    setSelectedPresetId(null);
    setMessages([INITIAL_CHAT_MESSAGE]);
    setUploadedFiles([]);
    setShowUploadModal(false);
    setLinkInput('');
    setUploadError(null);
    setVoiceNotice(null);
    setTargetCareerState('has_target');
    setTargetRole(DEFAULT_TARGET_ROLE);
    setTargetRoleDraft(DEFAULT_TARGET_ROLE);
    setIsEditingTargetRole(false);
    setShowCommandsMenu(false);
    setCommandNotice(null);
    setDemoProbingActive(false);
    setIsDemoReplying(false);
    setDemoProbingRoundIndex(0);
    setDemoProbingInput('');
    setDemoProbingHistory([]);
    if (demoTypingTimerRef.current !== null) window.clearInterval(demoTypingTimerRef.current);
    if (demoTransitionTimerRef.current !== null) window.clearTimeout(demoTransitionTimerRef.current);
    setIsChatExpanded(true);
    resetExploration();
    if (!demoMode) void auditEvent('profile.conversation.new', 'profile-exploration');
    textareaRef.current?.focus();
  };

  const handleSendCoachMessage = async () => {
    const text = coachInput.trim();
    if (!text || isDemoReplying || isAnalyzing || explorationStatus === 'loading') return;
    const nextEvidenceText = [inputText.trim(), text].filter(Boolean).join('\n\n').slice(0, 12000);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp,
    };
    setMessages(prev => [...prev, userMessage].slice(-30));
    setInputText(nextEvidenceText);
    setCoachInput('');
    setSelectedPresetId(null);
    setIsChatExpanded(true);
    setIsAiThinking(true);

    if (demoMode) {
      setIsDemoReplying(true);
      const replyId = `ai-demo-${Date.now()}`;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setMessages(prev => [...prev, {
        id: replyId,
        role: 'ai',
        content: prefersReducedMotion ? DEMO_PROBING_REPLY : '',
        timestamp,
        detectedSignals: prefersReducedMotion ? ['判断依据', '行动取舍', '可迁移能力'] : [],
      }].slice(-30));
      setIsAiThinking(false);

      const enterProbing = () => {
        setIsDemoReplying(false);
        setDemoProbingActive(true);
        setDemoProbingRoundIndex(0);
        setDemoProbingInput(DEMO_PROBING_ROUNDS[0].defaultAnswer);
        setDemoProbingHistory([]);
        setIsChatExpanded(false);
      };

      if (prefersReducedMotion) {
        demoTransitionTimerRef.current = window.setTimeout(enterProbing, 240);
        return;
      }

      let visibleCharacters = 0;
      demoTypingTimerRef.current = window.setInterval(() => {
        visibleCharacters = Math.min(visibleCharacters + 2, DEMO_PROBING_REPLY.length);
        const completed = visibleCharacters >= DEMO_PROBING_REPLY.length;
        setMessages(prev => prev.map(message => (
          message.id === replyId
            ? {
                ...message,
                content: DEMO_PROBING_REPLY.slice(0, visibleCharacters),
                detectedSignals: completed ? ['判断依据', '行动取舍', '可迁移能力'] : [],
              }
            : message
        )));
        if (!completed) return;
        if (demoTypingTimerRef.current !== null) {
          window.clearInterval(demoTypingTimerRef.current);
          demoTypingTimerRef.current = null;
        }
        demoTransitionTimerRef.current = window.setTimeout(enterProbing, 420);
      }, 24);
      return;
    }

    try {
      const conversation = messages.slice(-11).map(message => ({
        role: message.role === 'ai' ? 'assistant' as const : 'user' as const,
        content: message.content,
      }));
      conversation.push({ role: 'user', content: text });
      const response = await exploreProfile({
        experience_text: nextEvidenceText,
        messages: conversation,
        target_role: targetCareerState === 'has_target'
          ? (targetRole.trim() || DEFAULT_TARGET_ROLE)
          : undefined,
        request_id: `profile-${Date.now()}`,
      });
      setMessages(prev => [...prev, {
        id: `ai-${response.trace_id}`,
        role: 'ai',
        content: response.reply,
        timestamp,
        detectedSignals: [
          EXPLORATION_FOCUS_LABELS[response.focus_dimension],
          ...response.evidence_found.slice(0, 2),
        ],
      }].slice(-30));
    } catch {
      // The hook exposes the backend/Qwen error beside the exploration composer.
    } finally {
      setIsAiThinking(false);
    }
  };

  // Quick Preset Click Handler
  const handleSelectPreset = (preset: QuickPreset) => {
    setSelectedPresetId(preset.id);
    setCoachInput(preset.sampleText);

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
          if (demoMode && demoProbingActive) {
            setDemoProbingInput(prev => prev + transcript);
          } else {
            setCoachInput(prev => prev + transcript);
          }
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
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    const allowedExtensions = uploadTab === 'resume'
      ? ['.pdf', '.png', '.jpg', '.jpeg', '.webp']
      : ['.pdf', '.docx', '.txt', '.md', '.png', '.jpg', '.jpeg', '.webp'];
    if (!allowedExtensions.includes(extension)) {
      setUploadError(uploadTab === 'resume'
        ? '个人简历支持 PDF、PNG、JPG 和 WebP。'
        : '项目补充材料支持 PDF、Word、Markdown、TXT、PNG、JPG 和 WebP。');
      e.target.value = '';
      return;
    }
    setUploadError(null);
    setIsParsingFile(true);
    setParsingStep('正在读取材料中的文字与页面证据...');
    try {
      const fileSize = `${(file.size / 1024 / 1024).toFixed(1)} MB`;
      const materialType = uploadTab === 'resume' ? 'resume' : 'portfolio';
      const newFile: UploadedMaterial = { name: file.name, size: fileSize, type: materialType };
      setUploadedFiles(prev => [...prev.filter(item => item.type !== materialType), newFile]);
      const isImage = file.type.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp'].includes(extension);
      let extractedText = '';
      let extractionNotice = '';
      let detectedSignals: string[] = ['文字已读出', '等你确认', '还没有保存到档案'];
      if (isImage) {
        setParsingStep('正在定位图片中的项目行动与结果...');
        const evidence = await extractProfileMultimodalEvidence(file);
        extractedText = formatMultimodalEvidence(evidence.items);
        extractionNotice = `已用 ${evidence.model} 定位 ${evidence.items.length} 条候选证据，保留页码与区域引用。`;
        detectedSignals = evidence.items.length > 0
          ? [`${evidence.items.length} 条区域证据`, '等待你核对', '还没有保存到档案']
          : ['未定位到可核对片段', '等待你补充', '还没有保存到档案'];
      } else {
        try {
          const extracted = await extractProfileMaterial(file);
          extractedText = extracted.text;
          extractionNotice = `已提取 ${extracted.char_count} 字可复制文本${extracted.truncated ? '（内容较长，已截取前 12000 字）' : ''}。`;
        } catch (cause) {
          // Scanned PDFs have no text layer. Only this known case falls back
          // to one Qwen-VL call; network and format errors are not retried.
          const message = cause instanceof Error ? cause.message : '';
          if (extension !== '.pdf' || !message.includes('没有可复制文本')) throw cause;
          setParsingStep('未发现文字层，正在用 Qwen-VL 定位扫描页证据...');
          const evidence = await extractProfileMultimodalEvidence(file);
          extractedText = formatMultimodalEvidence(evidence.items);
          extractionNotice = `已用 ${evidence.model} 定位 ${evidence.items.length} 条扫描页候选证据，保留页码与区域引用。`;
          detectedSignals = evidence.items.length > 0
            ? [`${evidence.items.length} 条页面证据`, '等待你核对', '还没有保存到档案']
            : ['未定位到可核对片段', '等待你补充', '还没有保存到档案'];
        }
      }
      setInputText(prev => upsertMaterialEvidence(
        prev,
        materialType,
        file.name,
        extractedText || '材料中暂未定位到可引用文字，请补充说明。',
      ));
      setMessages(prev => [...prev, {
        id: `user-upload-${Date.now()}`,
        role: 'user',
        content: `【上传了${materialType === 'resume' ? '个人简历' : '项目补充材料'}】${file.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachedFile: newFile,
      }, {
        id: `ai-upload-${Date.now()}`,
        role: 'ai',
        content: `${extractionNotice} 材料内容目前仅作为候选证据，确认前不会进入职业推荐。`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detectedSignals,
      }].slice(-30));
      setIsChatExpanded(true);
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
  const handleStartAnalysis = async (pendingEvidence = '') => {
    const normalizedPendingEvidence = pendingEvidence.trim();
    const combinedContent = [inputText.trim(), normalizedPendingEvidence]
      .filter(Boolean)
      .join('\n\n')
      .slice(0, 12000);
    if (!combinedContent || isAnalyzing) return;

    if (normalizedPendingEvidence) {
      setInputText(combinedContent);
      setCoachInput('');
      setMessages(prev => [...prev, {
        id: `user-extract-${Date.now()}`,
        role: 'user',
        content: normalizedPendingEvidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }].slice(-30));
    }

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
        onGenerateCards(demoCards, DEMO_EXPERIENCE_SUMMARY);
        return;
      }
      const proposal = await analyzeExperience({
        experience_text: combinedContent,
        target_role: targetCareerState === 'has_target'
          ? (targetRole.trim() || DEFAULT_TARGET_ROLE)
          : undefined,
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
      onGenerateCards(cards, proposal.experience);
    } catch {
      // The hook exposes the actionable backend/Qwen error below the CTA.
      setAnalysisStep('');
    } finally {
      setIsAnalyzing(false);
      setIsAiThinking(false);
    }
  };

  const openTargetRoleEditor = () => {
    const currentRole = targetRole.trim() || DEFAULT_TARGET_ROLE;
    setTargetCareerState('has_target');
    setTargetRole(currentRole);
    setTargetRoleDraft(currentRole);
    setIsEditingTargetRole(true);
    setCommandNotice(null);
  };

  const confirmTargetRoleEditor = () => {
    const nextRole = targetRoleDraft.trim() || DEFAULT_TARGET_ROLE;
    setTargetRole(nextRole);
    setTargetRoleDraft(nextRole);
    setIsEditingTargetRole(false);
  };

  const cancelTargetRoleEditor = () => {
    setTargetRoleDraft(targetRole.trim() || DEFAULT_TARGET_ROLE);
    setIsEditingTargetRole(false);
  };

  const executeProfileSkill = (skillId: ProfileSkillId) => {
    const activeInput = demoProbingActive ? demoProbingInput : coachInput;
    const inputMethod = activeInput.trim().startsWith('/') ? 'typed' : 'menu';
    const skill = PROFILE_SKILLS.find(item => item.id === skillId);
    if (!skill) return;
    void auditEvent('profile_skill_invoked', skillId, {
      input_method: inputMethod,
      target_state: targetCareerState,
      command: skill.command,
      outcome: skill.outcome,
    });
    setShowCommandsMenu(false);
    setCommandNotice(null);

    if (skillId === 'experience') {
      setUploadTab('portfolio');
      setShowUploadModal(true);
      if (coachInput.trim().startsWith('/')) setCoachInput('');
      return;
    }

    if (skillId === 'target') {
      openTargetRoleEditor();
      if (coachInput.trim().startsWith('/')) setCoachInput('');
      return;
    }

    const pendingEvidence = activeInput.trim().startsWith('/') ? '' : activeInput;
    if (skill.requiresEvidence && !inputText.trim() && !pendingEvidence.trim()) {
      setCommandNotice('请先提供一段经历或引用项目材料。');
      if (coachInput.trim().startsWith('/')) setCoachInput('');
      return;
    }
    void handleStartAnalysis(pendingEvidence);
  };

  const handleComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return;

    const commandText = coachInput.trim().toLowerCase();
    if (commandText.startsWith('/')) {
      event.preventDefault();
      const skill = findProfileSkill(commandText);
      if (skill) {
        executeProfileSkill(skill.id);
      } else {
        setShowCommandsMenu(true);
        setCommandNotice('请从列表中选择有效 Skill。');
      }
      return;
    }

    event.preventDefault();
    void handleSendCoachMessage();
  };

  const currentDemoRound = DEMO_PROBING_ROUNDS[demoProbingRoundIndex] || DEMO_PROBING_ROUNDS[0];

  const handleDemoProbingSubmit = (answerOverride?: string) => {
    const answer = (answerOverride ?? demoProbingInput).trim();
    if (!answer || !currentDemoRound) return;
    const evidenceLine = `【第 ${demoProbingRoundIndex + 1} 轮追问：${currentDemoRound.title}】${answer}`;

    setDemoProbingHistory(prev => [...prev, {
      round: demoProbingRoundIndex + 1,
      question: currentDemoRound.question,
      answer,
    }]);
    setDemoProbingInput('');

    if (demoProbingRoundIndex < DEMO_PROBING_ROUNDS.length - 1) {
      setInputText(prev => [prev.trim(), evidenceLine].filter(Boolean).join('\n\n').slice(0, 12000));
      const nextRoundIndex = demoProbingRoundIndex + 1;
      setDemoProbingRoundIndex(nextRoundIndex);
      setDemoProbingInput(DEMO_PROBING_ROUNDS[nextRoundIndex].defaultAnswer);
      return;
    }

    void handleStartAnalysis(evidenceLine);
  };

  const handleExperienceComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    const activeInput = demoProbingActive ? demoProbingInput : coachInput;
    if (event.key === 'Enter' && !event.shiftKey && activeInput.trim().startsWith('/')) {
      event.preventDefault();
      const skill = findProfileSkill(activeInput.trim().toLowerCase());
      if (skill) {
        executeProfileSkill(skill.id);
        if (demoProbingActive) setDemoProbingInput('');
      } else {
        setShowCommandsMenu(true);
        setCommandNotice('请从列表中选择有效 Skill。');
      }
      return;
    }
    if (demoMode && demoProbingActive) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleDemoProbingSubmit();
      }
      return;
    }
    handleComposerKeyDown(event);
  };

  const latestAiMessage = [...messages].reverse().find(m => m.role === 'ai') || messages[0];
  const submittedExperience = messages.find(message => message.role === 'user')?.content || inputText;
  const focusedConversationMessages = (() => {
    const firstUserIndex = messages.findIndex(message => message.role === 'user');
    return firstUserIndex >= 0 ? messages.slice(firstUserIndex + 1) : messages;
  })();

  const handleModifySubmittedExperience = () => {
    const experience = submittedExperience.trim();
    setCoachInput(experience);
    if (demoProbingActive) setDemoProbingInput(experience);
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const conversationThread = (
        <section aria-label="成长陪伴对话记录">
          <div className="mx-auto max-w-5xl space-y-5 py-2">
            <div className="ml-auto max-w-[92%] rounded-2xl rounded-tr-md bg-stone-900 px-5 py-4 text-stone-100 shadow-sm sm:max-w-[88%]">
              <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2 text-[10px] text-stone-400">
                <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />已提交自述经历</span>
                <button type="button" onClick={handleModifySubmittedExperience} className="transition hover:text-white">补充自述</button>
              </div>
              <p className="text-xs leading-6 sm:text-sm">{submittedExperience}</p>
            </div>

            {demoProbingActive ? <>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-[11px] font-semibold text-stone-700 shadow-sm">AI</span>
              <div className="max-w-[86%] rounded-2xl rounded-tl-md border border-stone-200 bg-white px-4 py-3 text-xs leading-6 text-stone-700 shadow-sm sm:text-sm">{DEMO_PROBING_REPLY}</div>
            </div>

            {demoProbingHistory.map(item => {
              const round = DEMO_PROBING_ROUNDS[item.round - 1];
              return (
                <div key={item.round} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-[11px] font-semibold text-stone-700 shadow-sm">AI</span>
                    <div className="max-w-[86%] rounded-2xl rounded-tl-md border border-stone-200 bg-white px-4 py-3 shadow-sm">
                      <p className="font-mono text-[10px] text-stone-500">第 {item.round} 轮追问 · {round?.title}</p>
                      <p className="mt-1 text-xs leading-6 text-stone-800 sm:text-sm">{item.question}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <div className="max-w-[82%] rounded-2xl rounded-tr-md bg-stone-900 px-4 py-3 text-xs leading-6 text-stone-100 shadow-sm sm:text-sm">{item.answer}</div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-100 text-[11px] font-semibold text-stone-700">我</span>
                  </div>
                </div>
              );
            })}

            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-emerald-300 shadow-sm"><Sprout className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-sm text-stone-900">第 {demoProbingRoundIndex + 1} 轮 · {currentDemoRound.title}</h3>
                    <span className="rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 font-mono text-[9px] text-stone-600">进度 {demoProbingRoundIndex + 1}/4</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-stone-500"><span>线索捕获：</span>{currentDemoRound.clues.map(clue => <span key={clue} className="rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5">◆ {clue}</span>)}</div>
                </div>
                <p className="py-4 text-sm leading-7 text-stone-800">{currentDemoRound.question}</p>
                <div className="space-y-2 border-t border-stone-100 pt-3">
                  <p className="flex items-center gap-1.5 text-[10px] text-stone-500"><MessageSquare className="h-3 w-3" />点击参考思路填入，双击直接提交</p>
                  {currentDemoRound.options.map(option => (
                    <button key={option} type="button" onClick={() => setDemoProbingInput(option)} onDoubleClick={() => handleDemoProbingSubmit(option)} className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-xs transition ${demoProbingInput === option ? 'border-emerald-300 bg-emerald-50 text-emerald-950' : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50'}`}>
                      <span>{option}</span><ArrowRight className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            </> : <>
              {focusedConversationMessages.map(message => (
                <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'ai' && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-[11px] font-semibold text-stone-700 shadow-sm">AI</span>}
                  <div className={`max-w-[86%] rounded-2xl px-4 py-3 text-xs leading-6 shadow-sm sm:text-sm ${message.role === 'user' ? 'rounded-tr-md bg-stone-900 text-stone-100' : 'rounded-tl-md border border-stone-200 bg-white text-stone-700'}`}>
                    {message.attachedFile && <p className="mb-2 border-b border-current/10 pb-2 text-[10px] opacity-70">附件 · {message.attachedFile.name}</p>}
                    <p>{message.content}</p>
                    {message.detectedSignals && message.detectedSignals.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{message.detectedSignals.map(signal => <span key={signal} className="rounded-md bg-stone-100 px-2 py-0.5 text-[9px] text-stone-600">{signal}</span>)}</div>}
                  </div>
                  {message.role === 'user' && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-100 text-[11px] font-semibold text-stone-700">我</span>}
                </div>
              ))}
              {isAiThinking && <div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-[11px] font-semibold text-stone-700 shadow-sm">AI</span><span className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs text-stone-500"><RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />正在梳理经历中的行动与证据…</span></div>}
            </>}
          </div>
        </section>
  );

  return (
    <div className="experience-screen h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] flex flex-col justify-between max-w-4xl mx-auto px-3 sm:px-6 py-2 sm:py-3.5 relative overflow-hidden" data-focused={focusedConversationActive}>
      
      {/* Background Soft Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-50/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-stone-100/60 blur-3xl" />
      </div>

      <div className="experience-layout flex min-h-0 flex-1 flex-col justify-between gap-3 relative z-10">
        <div ref={chatScrollRef} className="profile-chat-scroll min-h-0 flex-1 overflow-y-auto space-y-3.5 pr-1.5 pb-3 custom-scrollbar" tabIndex={focusedConversationActive ? 0 : undefined} aria-label="经历对话滚动区域">
        
        {/* Profile assistant conversation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="profile-intro relative flex w-full flex-col"
        >
          {/* Main Top Header Line */}
          <div className="flex w-full items-start gap-3">
            <div className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-800 bg-stone-900 text-white shadow-sm">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 ring-1 ring-emerald-500/20" />
            </div>

            <div className="min-w-0 flex-1 space-y-2.5 rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-sm sm:rounded-3xl sm:p-4">
              <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2">
                <h2 className="text-sm sm:text-base font-normal text-stone-900 font-serif craft-serif tracking-tight flex items-center gap-2">
                  <span>成长陪伴 Agent · 经历深度挖掘</span>
                  <span className="rounded-md border border-stone-200 bg-stone-100 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold text-stone-700">
                    <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />对话探索
                  </span>
                </h2>
                
                <div className="flex items-center gap-3">
                  {!focusedConversationActive && <span className="text-[10px] text-stone-500">还原真实决策与隐性胜任力</span>}
                  {focusedConversationActive && (
                    <button
                      type="button"
                      onClick={() => void handleNewBlankConversation()}
                      className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-stone-500 transition hover:text-stone-800"
                    >
                      <FilePlus className="h-3 w-3" />
                      <span>新建空白对话</span>
                    </button>
                  )}
                  {!focusedConversationActive && messages.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setIsChatExpanded(!isChatExpanded)}
                      className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-stone-500 transition hover:text-stone-800"
                    >
                      <span>{isChatExpanded ? '收起历史' : `查看全部对话 (${messages.length})`}</span>
                      {isChatExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>

              {focusedConversationActive ? (
                <p className="max-w-3xl text-xs font-normal leading-6 text-stone-700 sm:text-sm">
                  通过多轮交流还原经历中的行动、判断与结果，整理可核验的能力线索。
                </p>
              ) : !isChatExpanded ? (
                <div className="space-y-2 pt-0.5">
                  <p className="max-w-3xl text-xs font-normal leading-6 text-stone-700 sm:text-sm">
                    {latestAiMessage.content}
                  </p>

                  {latestAiMessage.detectedSignals && latestAiMessage.detectedSignals.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-stone-500 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-emerald-600" />
                        <span>捕捉到的线索：</span>
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
                <div 
                  className="max-h-64 space-y-3 overflow-y-auto pr-1 scrollbar-thin"
                >
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`text-xs leading-relaxed ${
                        msg.role === 'user' 
                          ? 'max-w-[85%] rounded-2xl rounded-tr-md bg-stone-900 px-3.5 py-2.5 text-stone-100'
                          : 'w-full max-w-3xl border-b border-stone-100 pb-3 text-stone-700 last:border-b-0 last:pb-0'
                      }`}>
                        {msg.attachedFile && (
                          <div className="mb-1.5 pb-1.5 border-b border-stone-700/40 flex items-center gap-1.5 text-[11px] text-emerald-300">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{msg.attachedFile.name} ({msg.attachedFile.size})</span>
                          </div>
                        )}
                        <p>{msg.content}</p>
                        {msg.detectedSignals && msg.detectedSignals.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {msg.detectedSignals.map((s, idx) => (
                              <span key={idx} className="rounded-md bg-stone-100 px-2 py-0.5 text-[9px] text-stone-600">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
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

          <div className="flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3 text-xs">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-stone-600">
              <Target className="h-3.5 w-3.5" />
              探索目标：
            </span>

            <div className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-100 p-1 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  const currentRole = targetRole.trim() || DEFAULT_TARGET_ROLE;
                  setTargetCareerState('has_target');
                  setTargetRole(currentRole);
                  setTargetRoleDraft(currentRole);
                  setCommandNotice(null);
                }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                  targetCareerState === 'has_target'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-white hover:text-stone-900'
                }`}
                aria-pressed={targetCareerState === 'has_target'}
              >
                <Briefcase className="h-3.5 w-3.5" />
                我有目标职业
              </button>
              <button
                type="button"
                onClick={() => {
                  setTargetCareerState('no_target');
                  setIsEditingTargetRole(false);
                  setCommandNotice(null);
                }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                  targetCareerState === 'no_target'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-white hover:text-stone-900'
                }`}
                aria-pressed={targetCareerState === 'no_target'}
              >
                <Compass className="h-3.5 w-3.5" />
                我还没有明确方向
              </button>
            </div>

            {targetCareerState === 'has_target' && (
              isEditingTargetRole ? (
                <div className="flex min-h-9 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/70 px-2.5 text-[11px] shadow-sm ring-2 ring-emerald-100/60">
                  <span className="shrink-0 font-medium text-emerald-900">目标岗位</span>
                  <input
                    type="text"
                    value={targetRoleDraft}
                    onChange={event => setTargetRoleDraft(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        confirmTargetRoleEditor();
                      }
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        cancelTargetRoleEditor();
                      }
                    }}
                    onFocus={event => event.currentTarget.select()}
                    maxLength={40}
                    autoFocus
                    aria-label="目标岗位"
                    className="w-32 min-w-0 border-0 bg-transparent px-1 py-1 font-semibold text-stone-900 outline-none"
                  />
                  <span className="h-4 w-px bg-emerald-200" />
                  <button
                    type="button"
                    onClick={confirmTargetRoleEditor}
                    aria-label="确认目标岗位"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-white transition hover:bg-emerald-800"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelTargetRoleEditor}
                    aria-label="取消修改目标岗位"
                    className="flex h-6 w-6 items-center justify-center rounded-full text-stone-400 transition hover:bg-white hover:text-stone-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openTargetRoleEditor}
                  className="group flex min-h-8 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 text-[11px] text-stone-600 transition hover:border-emerald-200 hover:bg-emerald-50/50"
                >
                  <span>目标岗位：</span>
                  <span className="font-semibold text-stone-900">{targetRole.trim() || DEFAULT_TARGET_ROLE}</span>
                  <span className="ml-0.5 flex items-center gap-0.5 text-stone-400 transition group-hover:text-emerald-700">
                    <Pencil className="h-3 w-3" />
                    修改
                  </span>
                </button>
              )
            )}
          </div>
            </div>
          </div>

        </motion.div>

        {focusedConversationActive && conversationThread}
        </div>

        {/* Single chat composer with inline attachments */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="profile-composer z-20 shrink-0"
        >
          <div className="profile-composer-card relative flex w-full flex-col gap-2 rounded-2xl border border-stone-200/90 bg-white p-2.5 shadow-lg sm:rounded-3xl sm:p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowCommandsMenu(current => !current);
                    setCommandNotice(null);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-stone-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-black"
                  aria-expanded={showCommandsMenu}
                  aria-controls="profile-skill-menu"
                >
                  <Zap className="h-3.5 w-3.5 text-emerald-300" />
                  快捷指令
                  <ChevronDown className={`h-3 w-3 transition-transform ${showCommandsMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showCommandsMenu && (
                    <motion.div
                      id="profile-skill-menu"
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute bottom-full left-0 z-40 mb-2 w-72 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl"
                    >
                      <p className="px-2 py-1 text-[10px] font-semibold tracking-wide text-stone-500">职业能力分析快捷指令</p>
                      {PROFILE_SKILLS.map(skill => {
                        const Icon = skill.command === '/extract'
                          ? Sparkles
                          : skill.command === '/experience'
                            ? BookOpen
                            : Briefcase;
                        return (
                          <button
                            key={skill.command}
                            type="button"
                            onClick={() => executeProfileSkill(skill.id)}
                            className="flex w-full items-start gap-2 rounded-xl p-2 text-left transition hover:bg-stone-50"
                          >
                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-stone-600" />
                            <span className="min-w-0">
                              <span className="block font-mono text-[11px] font-semibold text-stone-900">{skill.command}</span>
                              <span className="block text-[10px] text-stone-500">{skill.name} · {skill.description}</span>
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={handleTriggerUpload} className="relative flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] font-medium text-stone-700 transition hover:bg-stone-50" title="引用简历或项目材料">
                  <Paperclip className="h-3 w-3" /><span>引用材料</span>
                  {uploadedFiles.length > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 text-[9px] text-white">{uploadedFiles.length}</span>}
                </button>
                <button type="button" onClick={handleToggleVoice} className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition ${isRecording ? 'border-rose-600 bg-rose-500 text-white' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'}`}>
                  {isRecording ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}<span>{isRecording ? '录音中…' : '语音'}</span>
                </button>
              </div>
            </div>

            <div className="profile-composer-main flex items-end gap-2 rounded-xl border border-stone-200/90 bg-white p-1.5 shadow-xs transition-all sm:rounded-2xl sm:p-2">
              <div className="flex min-w-0 flex-1 flex-col">
                {voiceNotice && <p className="mb-2 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs text-emerald-900">{voiceNotice}</p>}
                {commandNotice && <p className="mb-2 rounded-lg bg-amber-50 px-2.5 py-1 text-xs text-amber-900">{commandNotice}</p>}
                <textarea
                  ref={textareaRef}
                  value={demoMode && demoProbingActive ? demoProbingInput : coachInput}
                  onChange={event => {
                    const value = event.target.value;
                    if (demoMode && demoProbingActive) {
                      setDemoProbingInput(value);
                      setShowCommandsMenu(value.trimStart().startsWith('/'));
                      setCommandNotice(null);
                      return;
                    }
                    setCoachInput(value);
                    setShowCommandsMenu(value.trimStart().startsWith('/'));
                    setCommandNotice(null);
                    if (selectedPresetId) setSelectedPresetId(null);
                  }}
                  onKeyDown={handleExperienceComposerKeyDown}
                  rows={2}
                  maxLength={3000}
                  placeholder={demoMode && demoProbingActive
                    ? '随心输入'
                    : '描述一段经历事实（发生了什么、遇到了什么挑战、你怎么解决的），按 Enter 发送开启深度追问…'}
                  aria-label="经历对话输入"
                  className="profile-composer-input max-h-20 w-full resize-none bg-transparent px-1 py-0.5 text-xs leading-relaxed text-stone-900 outline-none placeholder:text-stone-400 sm:text-sm"
                />
                {explorationError && <p role="alert" className="mt-2 text-[10px] text-rose-700">{explorationError}</p>}
                {explorationStatus === 'loading' && queueStatus && (
                  <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-950" role="status" aria-live="polite">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-700" />
                      {queueStatus.state === 'queued'
                        ? queueStatus.ahead > 0
                          ? `排队中，前方还有 ${queueStatus.ahead} 个请求`
                          : '已进入队列，正在等待处理'
                        : queueStatus.state === 'running'
                          ? '当前正在处理'
                          : '正在取消请求…'}
                    </span>
                    {queueStatus.can_cancel && (
                      <button type="button" onClick={() => void cancelExploration()} className="shrink-0 rounded-full border border-amber-300 bg-white px-2.5 py-1 font-medium text-amber-900 transition hover:bg-amber-100">
                        取消
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (demoMode && demoProbingActive) {
                    handleDemoProbingSubmit();
                  } else {
                    void handleSendCoachMessage();
                  }
                }}
                disabled={demoMode && demoProbingActive
                  ? !demoProbingInput.trim() || demoProbingInput.trim().startsWith('/') || isAnalyzing
                  : !coachInput.trim() || coachInput.trim().startsWith('/') || explorationStatus === 'loading' || isDemoReplying || isAnalyzing}
                className="flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-stone-900 px-3 text-xs font-medium text-white shadow-xs transition hover:bg-black disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none sm:h-9 sm:px-4"
              >
                {explorationStatus === 'loading' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {demoMode && demoProbingActive ? '提交' : '发送交流'}
              </button>
            </div>
          </div>

          <div className="profile-composer-footer flex items-center justify-between px-1 pt-0.5 text-[10.5px] text-stone-500">
              <span>{focusedConversationActive
                ? demoProbingActive ? `第 ${demoProbingRoundIndex + 1}/4 轮追问` : `已交流 ${messages.filter(message => message.role === 'user').length} 轮`
                : `已输入 ${coachInput.length} 字`}</span>
              <button
                type="button"
                onClick={() => void handleStartAnalysis(demoProbingActive ? demoProbingInput : coachInput.trim().startsWith('/') ? '' : coachInput)}
                disabled={isAnalyzing || explorationStatus === 'loading' || isDemoReplying}
                className="font-medium text-stone-800 transition hover:text-black"
              >
                {focusedConversationActive ? '提前生成能力卡' : '跳过追问，直接生成能力卡'} →
              </button>
          </div>
          {analysisError && (
            <p role="alert" className="mt-2 text-xs text-rose-800">{analysisError}</p>
          )}
        </motion.div>

      </div>
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
                aria-label="关闭附件弹窗"
                className="absolute top-5 right-5 text-stone-400 hover:text-stone-800 p-1 rounded-full hover:bg-stone-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8DDD0] text-stone-800 text-xs font-bold">
                  <UploadCloud className="w-3.5 h-3.5 text-amber-700" />
                  <span>对话附件</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-serif craft-serif">
                  在对话中添加附件
                </h3>
                <p className="text-xs text-stone-600">
                    可以上传简历或项目补充材料。解析后的正文会进入当前对话的证据上下文。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#EAE2D7] p-1 rounded-xl text-xs font-medium text-stone-700">
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
                  <span>项目补充材料</span>
                </button>
              </div>

              {uploadTab !== 'link' && (
                <div className="space-y-4">
                  {/* Drag & Drop Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#D5C6B5] hover:border-stone-600 rounded-2xl p-6 text-center bg-white/70 hover:bg-white transition cursor-pointer group space-y-2"
                  >
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept={uploadTab === 'resume' ? '.pdf,.png,.jpg,.jpeg,.webp' : '.pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp'}
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
                        {uploadTab === 'resume'
                          ? '支持 PDF、PNG、JPG 和 WebP；扫描 PDF 会保留页码与区域证据'
                          : '支持 PDF、Word、Markdown、TXT 及常见图片；扫描材料可定位候选证据'}
                      </p>
                    </div>
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
