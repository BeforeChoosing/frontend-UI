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
} from 'lucide-react';
import { SkillCard } from '../types';
import { mapProfileProposalToSkillCards } from '../features/profile/profileAdapter';
import { useExperienceAnalysis } from '../hooks/useExperienceAnalysis';
import { useProfileExploration } from '../hooks/useProfileExploration';
import { extractProfileMaterial } from '../api/profile';
import type { ApiExperienceSummary } from '../types/api';

interface ExperienceInputScreenProps {
  onGenerateCards: (cards: SkillCard[], experience: ApiExperienceSummary) => void;
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
  content: '告诉我一件对你有意义的经历，或者在对话中附上简历和项目材料。我会沿着你提供的事实补问，并整理其中的能力线索。',
  timestamp: '刚刚',
  detectedSignals: ['等待你的真实故事', '支持连续对话', '可以附加材料'],
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

const DEMO_EXPERIENCE_SUMMARY: ApiExperienceSummary = {
  title: '校园二手书流转产品实践',
  actions: ['访谈学生并归纳信任成本与碰面效率问题', '推动集中交接点与评分机制上线'],
  result: '上线首月完成 800 余笔书籍流转',
  source_refs: ['示例个人简历.pdf', '校园二手书项目补充材料.pdf'],
};

function explorationStorageKey(
  demoMode: boolean,
  field: 'evidence' | 'messages' | 'materials' | 'consent',
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

function loadExplorationMessages(demoMode: boolean): ChatMessage[] {
  try {
    const raw = window.localStorage.getItem(explorationStorageKey(demoMode, 'messages'));
    if (!raw) return [INITIAL_CHAT_MESSAGE];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed.slice(-30) : [INITIAL_CHAT_MESSAGE];
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

  const handleSendCoachMessage = async () => {
    const text = coachInput.trim();
    if (!text || explorationStatus === 'loading') return;
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
    try {
      const conversation = messages.slice(-11).map(message => ({
        role: message.role === 'ai' ? 'assistant' as const : 'user' as const,
        content: message.content,
      }));
      conversation.push({ role: 'user', content: text });
      const response = await exploreProfile({
        experience_text: nextEvidenceText,
        messages: conversation,
        target_role: 'AI Native 产品经理',
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
          setCoachInput(prev => prev + transcript);
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
    if (uploadTab === 'resume' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('个人简历需要使用包含可复制文本的 PDF 文件。');
      e.target.value = '';
      return;
    }
    setUploadError(null);
    setIsParsingFile(true);
    setParsingStep('正在读取文档中的可复制文本...');
    try {
      const extracted = await extractProfileMaterial(file);
      const fileSize = `${(file.size / 1024 / 1024).toFixed(1)} MB`;
      const materialType = uploadTab === 'resume' ? 'resume' : 'portfolio';
      const newFile: UploadedMaterial = { name: extracted.file_name, size: fileSize, type: materialType };
      setUploadedFiles(prev => [...prev.filter(item => item.type !== materialType), newFile]);
      setInputText(prev => upsertMaterialEvidence(prev, materialType, extracted.file_name, extracted.text));
      setMessages(prev => [...prev, {
        id: `user-upload-${Date.now()}`,
        role: 'user',
        content: `【上传了${materialType === 'resume' ? '个人简历' : '项目补充材料'}】${extracted.file_name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachedFile: newFile,
      }, {
        id: `ai-upload-${Date.now()}`,
        role: 'ai',
        content: `已提取 ${extracted.char_count} 字可复制文本${extracted.truncated ? '（内容较长，已截取前 12000 字）' : ''}。材料内容目前仅作为候选证据，确认前不会进入职业推荐。`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detectedSignals: ['文字已读出', '等你确认', '还没有保存到档案'],
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
  const handleStartAnalysis = async () => {
    const combinedContent = inputText.trim().slice(0, 12000);
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
        onGenerateCards(demoCards, DEMO_EXPERIENCE_SUMMARY);
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
      onGenerateCards(cards, proposal.experience);
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
                  <span>潜能挖掘助手</span>
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
                            助手
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

            </div>
          </div>

          {/* Quick upload guide prompt bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-stone-100 text-[11px] text-stone-600">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-400">💡 提示：</span>
              <span>可以在下方连续交流，也可以通过附件补充简历或项目材料。</span>
            </div>
            <button
              onClick={() => {
                setUploadTab('resume');
                handleTriggerUpload();
              }}
              className="text-stone-800 hover:text-stone-950 font-medium underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <span>引导上传简历 / 项目材料</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

        </motion.div>

        {/* Single chat composer with inline attachments */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="space-y-3"
        >
          <div className="craft-card flex min-h-[220px] w-full items-stretch gap-3.5 rounded-3xl border border-stone-200/50 bg-white/90 p-4 backdrop-blur-xl sm:p-5">
            <div className="flex shrink-0 flex-col items-center gap-2 border-r border-stone-100 pr-3.5 pt-0.5">
              <button
                type="button"
                onClick={handleTriggerUpload}
                title="在对话中附加简历或项目材料"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200/50 bg-stone-50 text-stone-700 transition hover:bg-stone-100"
              >
                <Paperclip className="h-4 w-4" />
                {uploadedFiles.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] text-white">{uploadedFiles.length}</span>}
              </button>
              <button
                type="button"
                onClick={handleToggleVoice}
                title="语音输入"
                className={`flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200/50 transition ${isRecording ? 'bg-rose-500 text-white' : 'bg-stone-50 text-stone-700 hover:bg-stone-100'}`}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              {voiceNotice && <p className="mb-2 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs text-emerald-900">{voiceNotice}</p>}
              <textarea
                ref={textareaRef}
                value={coachInput}
                onChange={event => {
                  setCoachInput(event.target.value);
                  if (selectedPresetId) setSelectedPresetId(null);
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void handleSendCoachMessage();
                  }
                }}
                rows={6}
                maxLength={3000}
                placeholder={'分享一次印象深刻的经历。\n可以写项目、实习、比赛或长期兴趣。\nEnter 发送，Shift+Enter 换行。'}
                className="min-h-[150px] w-full flex-1 resize-none bg-transparent px-1 text-sm leading-6 text-stone-900 outline-none placeholder:text-stone-400"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 text-[10px] text-stone-400">
                <span>{uploadedFiles.length > 0 ? `本轮对话已附加 ${uploadedFiles.length} 份材料` : '附件和文字都会进入当前对话记录'}</span>
                <div className="flex items-center gap-2">
                  <span>Enter 发送</span>
                  <button
                    type="button"
                    onClick={() => void handleSendCoachMessage()}
                    disabled={!coachInput.trim() || explorationStatus === 'loading'}
                    className="craft-btn-black flex items-center gap-1.5 px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {explorationStatus === 'loading' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    发送交流
                  </button>
                </div>
              </div>
              {explorationError && <p role="alert" className="mt-2 text-[10px] text-rose-700">{explorationError}</p>}
            </div>
          </div>

          <p className="text-center text-[11px] text-stone-500">整段用户对话和附件正文共同构成候选卡的证据来源。</p>

          <div className="space-y-2 pt-1 text-center">
            <p className="font-serif text-sm text-stone-900">快速开始</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PRESET_EXPERIENCES.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`truncate rounded-full border px-3 py-2 text-xs transition ${selectedPresetId === preset.id ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white/80 text-stone-700 hover:border-stone-400'}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
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
          disabled={!inputText.trim() || isAnalyzing}
          className={`w-full sm:w-64 py-3.5 px-8 rounded-full font-medium text-sm sm:text-base transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center gap-2 ${
            inputText.trim() && !isAnalyzing
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
              分析经历
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
                      accept={uploadTab === 'resume' ? '.pdf' : '.pdf,.docx,.txt,.md'}
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
                          ? '仅支持包含可复制文本的 PDF 简历，扫描件暂不支持 OCR'
                          : '支持 PDF、Word、Markdown 和 TXT，扫描件暂不支持 OCR'}
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
