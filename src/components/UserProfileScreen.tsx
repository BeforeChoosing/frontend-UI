import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Award, 
  Layers, 
  FileText, 
  Compass, 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight, 
  Edit3, 
  Share2, 
  Download, 
  Plus, 
  Bot, 
  Target, 
  Zap, 
  Bookmark, 
  Search, 
  Filter,
  Briefcase,
  Sliders,
  Check,
  CheckCircle,
  Play,
  Flame,
  Star,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { CompletedTrialTask, SkillCard, UserExperienceRecord, UserAuth, ScreenMode, EvaluationReport } from '../types';
import type { ProfileCardPatchRequest } from '../types/api';
import { COMPLETED_TRIAL_TASKS, HERO_FLOATING_CARDS, USER_PAST_EXPERIENCES } from '../data/mockData';
import { TrialTaskDetailModal } from './TrialTaskDetailModal';

interface UserProfileScreenProps {
  unlockedCards: SkillCard[];
  persistedCards?: SkillCard[];
  profileVersion?: number;
  profileUpdatedAt?: string | null;
  auth: UserAuth;
  onNavigate: (screen: ScreenMode) => void;
  onOpenCardDetail: (card: SkillCard) => void;
  onUpdateCard?: (cardId: string, patch: ProfileCardPatchRequest) => Promise<void> | void;
  onDeleteCard?: (cardId: string) => Promise<void> | void;
  onOpenAgentChat?: (agentId?: string) => void;
  onStartNewTask?: () => void;
  initialArchTab?: 'insight' | 'cards' | 'paths' | 'reports';
}

// 14 rich skill cards to match the wireframe specification
const ACCUMULATED_14_CARDS: Array<SkillCard & { statusTag: string; addedDate: string }> = [
  {
    id: 'card-user-insight',
    title: '用户洞察',
    category: '洞察分析',
    description: '穿透表层诉求，从痛点日志中提炼46%冗长回答抱怨，提出结论先行原则',
    detail: '擅长通过用户深访、语义聚类和体验地图，从散乱的反馈中提炼核心高价值痛点。',
    icon: 'Search',
    colorTone: 'purple',
    statusTag: '08.16 强化',
    addedDate: '2026.08.16'
  },
  {
    id: 'card-prod-analysis',
    title: '产品分析',
    category: '产品策略',
    description: '具备将抽象用户反馈拆解为结构化产品功能需求与业务边界的能力',
    detail: '善用因果链路图，将模糊的“产品不好用”精确定位到模块与交互参数。',
    icon: 'GitFork',
    colorTone: 'blue',
    statusTag: '08.16 新增',
    addedDate: '2026.08.16'
  },
  {
    id: 'card-data-analytics',
    title: '数据分析',
    category: '数据驱动',
    description: '擅长漏斗转化与A/B测试数据量化归因，以指标指导体验迭代',
    detail: '建立北极星指标体系，敏锐洞察漏斗流失拐点，用量化指标证明设计ROI。',
    icon: 'LineChart',
    colorTone: 'amber',
    statusTag: '08.02 新增',
    addedDate: '2026.08.02'
  },
  {
    id: 'card-ai-pm-prd',
    title: 'AI产品落地与PRD交付',
    category: '协作沟通',
    description: '将大模型能力转化为清晰的高质量PRD、交互状态机与研发对接规格',
    detail: '具备完整的架构分流定义、主动澄清卡片交互与ROI度量能力。',
    icon: 'Award',
    colorTone: 'emerald',
    statusTag: '08.16 新增',
    addedDate: '2026.08.16'
  },
  {
    id: 'card-problem-decompose',
    title: '问题拆解与归因',
    category: '产品策略',
    description: '将复杂模糊的业务命题拆解为MECE逻辑树与可落地的行动项',
    detail: '精通Badcase溯源与根因分析法。',
    icon: 'GitBranch',
    colorTone: 'blue',
    statusTag: '08.10 强化',
    addedDate: '2026.08.10'
  },
  {
    id: 'card-ai-prompt',
    title: 'AI能力抽象与Prompt工程',
    category: '技术落地',
    description: '连接大模型技术边界与用户真实交互心智，设计意图分流与Few-shot机制',
    detail: '熟悉温度调优、Token降本与模型输出边界兜底策略。',
    icon: 'Sparkles',
    colorTone: 'emerald',
    statusTag: '08.08 新增',
    addedDate: '2026.08.08'
  },
  {
    id: 'card-ux-flow',
    title: '渐进式交互与流式反馈',
    category: '交互体验',
    description: '设计低认知负荷的LUI与GUI融合交互，包含主动追问Pill与流式加载状态',
    detail: '深谙人机协同心理学，降低等待焦虑。',
    icon: 'Sparkles',
    colorTone: 'purple',
    statusTag: '08.05 新增',
    addedDate: '2026.08.05'
  },
  {
    id: 'card-figma-proto',
    title: '高保真交互原型',
    category: '交互体验',
    description: '熟练运用Figma构建动态交互原型与可复用的设计系统组件',
    detail: '高保真还原端到端核心操作路径。',
    icon: 'Layers',
    colorTone: 'rose',
    statusTag: '07.28 新增',
    addedDate: '2026.07.28'
  },
  {
    id: 'card-roi-metric',
    title: 'ROI投入产出度量',
    category: '数据驱动',
    description: '量化模型算力成本节省与次轮用户留存提升的商业价值模型',
    detail: '精准核算单次请求Token降幅与业务增长ROI。',
    icon: 'Target',
    colorTone: 'amber',
    statusTag: '08.16 新增',
    addedDate: '2026.08.16'
  },
  {
    id: 'card-cross-team',
    title: '跨职能协同推进',
    category: '协作沟通',
    description: '有效连接算法工程师、前端研发与业务方，对齐技术可行性与业务价值',
    detail: '主持敏捷需求评审与风险把控。',
    icon: 'Briefcase',
    colorTone: 'emerald',
    statusTag: '07.20 强化',
    addedDate: '2026.07.20'
  },
  {
    id: 'card-user-interview',
    title: '深度用户访谈',
    category: '洞察分析',
    description: '通过半结构化访谈还原用户真实操作受挫场景与隐藏诉求',
    detail: '掌握漏斗下钻提问与情绪捕捉技巧。',
    icon: 'User',
    colorTone: 'purple',
    statusTag: '07.15 新增',
    addedDate: '2026.07.15'
  },
  {
    id: 'card-error-recovery',
    title: '异常与容错兜底机制',
    category: '交互体验',
    description: '针对网络超时、模型拒答或幻觉设计优雅的一键重试与快捷转人工降级链路',
    detail: '确保极端网络和技术波动下的用户体验连续性。',
    icon: 'Zap',
    colorTone: 'rose',
    statusTag: '08.01 新增',
    addedDate: '2026.08.01'
  },
  {
    id: 'card-agile-mvp',
    title: '敏捷MVP快速定义',
    category: '产品策略',
    description: '在两周内锁定核心价值闭环，以最小成本验证产品核心假设',
    detail: '舍弃非核心冗余功能，聚焦高频价值。',
    icon: 'Target',
    colorTone: 'blue',
    statusTag: '07.10 新增',
    addedDate: '2026.07.10'
  },
  {
    id: 'card-competitor-eval',
    title: '竞品体验走查与差异化',
    category: '洞察分析',
    description: '深度对比行业前沿竞品交互体验，提炼差异化破局切入点',
    detail: '输出多维度竞品雷达与体验心智对照矩阵。',
    icon: 'Search',
    colorTone: 'purple',
    statusTag: '07.05 新增',
    addedDate: '2026.07.05'
  }
];

// Explored Career Paths Mock Data
const EXPLORED_CAREER_PATHS = [
  {
    id: 'path-ai-pm',
    title: 'AI产品经理',
    englishTitle: 'AI Product Manager (AI PM)',
    status: '进行中',
    statusTag: '试炼任务进行中 (2/3)',
    statusColor: 'bg-amber-100 text-amber-900 border-amber-200',
    description: '专注于LLM落地、意图分流与PRD需求交付，平衡技术边界、Token成本与交互心智。',
    matchScore: 96,
    completedChallenges: 2,
    totalChallenges: 3,
    latestActivity: '已完成「优化AI助手用户体验 (PRD与交互重构)」试路任务，实战评分 96分 (Grade S)',
    icon: 'Briefcase',
    colorTone: 'amber'
  },
  {
    id: 'path-ux-designer',
    title: '交互设计师',
    englishTitle: 'AI & Multimodal UX Designer',
    status: '已完成',
    statusTag: '阶段一与二已通关',
    statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    description: '专注于AI多模态与人机交互流设计，探索LUI与GUI融合、主动澄清与拟人反馈。',
    matchScore: 88,
    completedChallenges: 3,
    totalChallenges: 3,
    latestActivity: '已完成「智能客服冷启动与意图澄清机制设计」，实战评分 91分 (Grade A+)',
    icon: 'Sparkles',
    colorTone: 'purple'
  }
];

// Explored Reports Mock Data
const EXPLORED_REPORTS = [
  {
    id: 'report-ai-pm',
    role: 'AI产品经理 (AI PM)',
    title: 'AI产品经理试路评估报告',
    grade: 'S',
    score: 96,
    date: '2026.08.16',
    timeSpent: '28 分钟',
    keyDiscovery: '用户同理与产品落地能力表现突出，准确通过工单定性与会话漏斗定量双向归因，ROI测算极具商业说服力，已解锁「AI产品落地与PRD交付」卡牌。',
    radarSummary: '用户同理 98 · AI架构 94 · 交互体验 96 · 商业ROI 95',
    mentorComment: '结构极其清晰！兼备业务敏锐度与技术落地严谨性。不仅发现了定性抱怨，更通过定量漏斗证实了问题规模，给出的PRD方案研发团队可以直接拉会评审。',
    radarScores: [
      { dimension: '用户同理与痛点洞察', score: 98, description: '精准命中46%冗长回答抱怨，提出结论先行原则' },
      { dimension: 'AI架构与技术理解', score: 94, description: '提出意图识别分流与Prompt降耗，技术可行性高' },
      { dimension: '交互体验与微创新', score: 96, description: '引入主动追问澄清Pill芯片，显著提升人机交互流畅度' },
      { dimension: '商业价值与ROI度量', score: 95, description: '清晰量化Token降本25%与留存提升目标，具备商业闭环' }
    ],
    strengths: [
      '逻辑严密：从工单定性到漏斗定量，形成了完美的双向归因验证',
      '懂AI边界：没有盲目堆砌模型参数，而是善用交互卡片弥补模型的不确定性',
      '交付感强：PRD结构清晰，研发与设计同学能直接执行落地'
    ],
    recommendations: [
      '可进一步细化多模态（如表格与代码导出）的复制交互规格',
      '可增加灰度A/B测试方案的分组比例与防穿帮指标（Guardrail Metrics）'
    ]
  },
  {
    id: 'report-ux-designer',
    role: 'AI交互体验设计师',
    title: '交互体验进阶评估报告',
    grade: 'A+',
    score: 91,
    date: '2026.08.12',
    timeSpent: '22 分钟',
    keyDiscovery: '快速原型与用户痛点洞察较强，澄清卡片的设计有效化解了AI模型的不确定性，可进一步加强技术可行性分流。',
    radarSummary: '用户同理 92 · AI架构 88 · 交互体验 95 · 商业ROI 89',
    mentorComment: '对用户情绪和交互细节的把控非常出色，澄清卡片的设计有效化解了AI模型的不确定性。',
    radarScores: [
      { dimension: '用户同理与痛点洞察', score: 92, description: '深刻理解用户急躁情绪下的交互偏好' },
      { dimension: 'AI架构与技术理解', score: 88, description: '对置信度阈值与分支逻辑有清晰定义' },
      { dimension: '交互体验与微创新', score: 95, description: '气泡交互与微反馈细节处理非常细腻' },
      { dimension: '商业价值与ROI度量', score: 89, description: '有效量化了客服人力成本节省与满意度提升' }
    ],
    strengths: [
      '微交互细腻：流式加载与歧义气泡有效化解用户受挫感',
      '高保真呈现：状态机边界清晰'
    ],
    recommendations: [
      '可增加复杂会话分支下的全局撤销交互'
    ]
  }
];

// AI Recent Observations
const AI_RECENT_OBSERVATIONS = [
  {
    id: 'obs-1',
    quote: '“你最近连续两次在任务里优先关注用户反馈，而不是先找技术方案。”',
    timestamp: '更新于 2026年8月16日 14:32',
    context: '你在进行 AI产品经理工作台试炼 时',
    tag: '决策倾向',
    tagColor: 'bg-amber-100 text-amber-800'
  },
  {
    id: 'obs-2',
    quote: '“你对‘协调推进’的评价一直比较低，但在真实任务里其实完成得不错。”',
    timestamp: '更新于 2026年8月15日 19:10',
    context: '你在进行 阶段一能力推演 时',
    tag: '自我认知修正',
    tagColor: 'bg-emerald-100 text-emerald-800'
  },
  {
    id: 'obs-3',
    quote: '“你似乎比自己想象中更能接受模糊的问题，并能迅速建立MECE拆解框架。”',
    timestamp: '更新于 2026年8月14日 10:25',
    context: '你在进行 经历深度提取 时',
    tag: '潜能发现',
    tagColor: 'bg-purple-100 text-purple-800'
  }
];

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  unlockedCards,
  persistedCards = [],
  profileVersion = 0,
  profileUpdatedAt = null,
  auth,
  onNavigate,
  onOpenCardDetail,
  onUpdateCard,
  onDeleteCard,
  onOpenAgentChat,
  onStartNewTask,
  initialArchTab = 'insight'
}) => {
  // Bottom Arch Navigation State (4 states from the Figma wireframe: 'insight' | 'cards' | 'paths' | 'reports')
  const [activeArchTab, setActiveArchTab] = useState<'insight' | 'cards' | 'paths' | 'reports'>(initialArchTab);

  // Cards category filter
  const [selectedCardCategory, setSelectedCardCategory] = useState<string>('all');
  
  // Selected Report for full detailed view
  const [selectedReportDetail, setSelectedReportDetail] = useState<typeof EXPLORED_REPORTS[0] | null>(null);

  // Task detail modal state
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<CompletedTrialTask | null>(null);

  // User Profile Info
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userName, setUserName] = useState(auth.user?.name || '林曦');
  const [userBackground, setUserBackground] = useState('UI/UX 设计背景');
  const [userStatus, setUserStatus] = useState('状态：积极探索中（正在探索 AI产品经理 方向）');
  const [userProgressIntro, setUserProgressIntro] = useState('已积累 14 张能力卡片，探索 2 条职业路径，最近一次更新来自「AI 产品经理试路任务」');

  // Persisted card editing state
  const [editingCard, setEditingCard] = useState<(SkillCard & { statusTag: string; addedDate: string }) | null>(null);
  const [editCardTitle, setEditCardTitle] = useState('');
  const [editCardDescription, setEditCardDescription] = useState('');
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [cardActionError, setCardActionError] = useState<string | null>(null);

  // Merged cards list (defaults to 14 cards pool plus cards confirmed through the API)
  const allDisplayCards = (() => {
    const cardsById = new Map<string, SkillCard & { statusTag: string; addedDate: string }>();
    ACCUMULATED_14_CARDS.forEach(card => cardsById.set(card.id, card));
    persistedCards.forEach(card => cardsById.set(card.id, {
      ...card,
      statusTag: '已确认',
      addedDate: '已同步',
    }));
    return Array.from(cardsById.values());
  })();
  const persistedCardIds = new Set(persistedCards.map(card => card.id));
  const filteredDisplayCards = selectedCardCategory === 'all' 
    ? allDisplayCards 
    : allDisplayCards.filter(c => c.category === selectedCardCategory);

  const categories = ['all', '洞察分析', '产品策略', '技术落地', '数据驱动', '协作沟通', '交互体验'];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingProfile(false);
  };

  const formatProfileUpdatedAt = (value: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleStartCardEdit = (card: SkillCard & { statusTag: string; addedDate: string }) => {
    if (!persistedCardIds.has(card.id)) return;
    setCardActionError(null);
    setEditingCard(card);
    setEditCardTitle(card.title);
    setEditCardDescription(card.description);
  };

  const handleSaveCardEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingCard || !editCardTitle.trim() || !onUpdateCard) return;
    setIsSavingCard(true);
    setCardActionError(null);
    try {
      await onUpdateCard(editingCard.id, {
        title: editCardTitle.trim(),
        description: editCardDescription.trim() || editingCard.description,
      });
      setEditingCard(null);
    } catch (cause) {
      setCardActionError(cause instanceof Error ? cause.message : '更新能力卡失败，请稍后重试。');
    } finally {
      setIsSavingCard(false);
    }
  };

  const handleDeleteCard = async (card: SkillCard & { statusTag: string; addedDate: string }) => {
    if (!persistedCardIds.has(card.id) || !onDeleteCard) return;
    if (!window.confirm('将删除这张能力卡，并记录一次画像变更。')) return;
    setCardActionError(null);
    setIsSavingCard(true);
    try {
      await onDeleteCard(card.id);
    } catch (cause) {
      setCardActionError(cause instanceof Error ? cause.message : '删除能力卡失败，请稍后重试。');
    } finally {
      setIsSavingCard(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] p-3 sm:p-6 lg:p-8 flex flex-col justify-between relative selection:bg-orange-100 text-stone-900 font-sans">
      
      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-orange-50/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-stone-100/60 blur-3xl" />
      </div>

      <div className="w-full max-w-6xl mx-auto space-y-5 sm:space-y-6 relative z-10 my-auto">
        
        {/* 
          ========================================================================
          1. TOP PROFILE HEADER (Header / Avatar / Intro)
          Layout matching wireframe top bar:
          [Avatar Circle]   Name | Background | Status description
                            (Progress Intro)
          ========================================================================
        */}
        <div className="craft-card bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200/70 shadow-xs transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            
            {/* Left Circular Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl bg-stone-100 text-stone-800 flex items-center justify-center font-normal text-xl sm:text-2xl border border-stone-200 shadow-2xs font-serif craft-serif">
                {userName.slice(0, 1) || '林'}
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" title="状态正常" />
            </div>

            {/* Right: Info Lines */}
            <div className="space-y-1.5 flex-1 min-w-0">
              
              {/* Top Line: 姓名 | 设计背景 | 状态描述 */}
              <div className="flex flex-wrap items-center gap-2 text-stone-900">
                <span className="font-normal text-lg sm:text-xl tracking-tight font-serif craft-serif">
                  {userName}
                </span>
                <span className="text-stone-300 font-light">|</span>
                <span className="text-xs sm:text-sm font-normal text-stone-600">
                  {userBackground}
                </span>
                <span className="text-stone-300 font-light">|</span>
                <span className="craft-chip-orange text-xs font-mono font-medium px-2.5 py-0.5 rounded-full">
                  {userStatus}
                </span>

                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="p-1 text-stone-400 hover:text-stone-700 transition cursor-pointer ml-1"
                  title="编辑基本信息"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom Line: (进度简介) 已积累 14 张能力卡片，探索 2 条职业路径，最近一次更新来自「AI 产品经理试路任务」 */}
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-normal">
                <span className="text-stone-400 font-mono">(进度简介) </span>
                {userProgressIntro}
              </p>
            </div>

            {/* Quick Agent Consult Pill */}
            <div className="shrink-0 pt-2 sm:pt-0">
              <button
                onClick={() => {
                  if (onOpenAgentChat) onOpenAgentChat('growth_companion');
                  else window.dispatchEvent(new CustomEvent('open-agent-chat', { detail: { agentId: 'growth_companion' } }));
                }}
                className="craft-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5 text-orange-600" />
                <span>AI 顾问助手</span>
              </button>
            </div>

          </div>
        </div>

        {/* 
          ========================================================================
          2. TWO ACTION CARDS (SIDE BY SIDE)
          Card 1 (Left): 更新我的能力画像
          Card 2 (Right): 继续探索职业路径
          ========================================================================
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* 
            CARD 1: 更新我的能力画像
          */}
          <div className="craft-card bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-stone-200/70 shadow-xs flex flex-col justify-between gap-5 relative overflow-hidden group">
            
            {/* Header Content */}
            <div className="space-y-1 relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="craft-chip-green text-[10px] font-mono font-medium px-2 py-0.5 rounded-full">
                  01 · 沉淀
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-normal text-stone-900 tracking-tight font-serif craft-serif">
                更新我的能力画像
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-normal">
                分享新的经历或反思，让Agent继续完善对你的理解。
              </p>
            </div>

            {/* Bottom Row: Action Buttons (Left) + Synthesis Graphic (Right) */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-stone-100">
              
              {/* Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('input-experience')}
                  className="craft-btn-black px-4 py-2 text-xs"
                  id="btn-add-new-experience"
                >
                  添加新经历
                </button>
                <button
                  onClick={() => {
                    if (onOpenAgentChat) onOpenAgentChat('growth_companion');
                    else window.dispatchEvent(new CustomEvent('open-agent-chat', { detail: { agentId: 'growth_companion' } }));
                  }}
                  className="craft-btn-secondary px-3.5 py-2 text-xs"
                  id="btn-review-reflection"
                >
                  回顾问导
                </button>
              </div>

              {/* Graphic Illustration: Skill Card Synthesis [Card] [Card] ──> [★ Card] */}
              <div className="hidden sm:flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity select-none">
                <div className="w-7 h-10 rounded-lg bg-stone-100 border border-stone-200 flex flex-col justify-center items-center shadow-2xs">
                  <span className="w-3.5 h-1 bg-stone-300 rounded-full mb-1" />
                  <span className="w-2.5 h-0.5 bg-stone-200 rounded-full" />
                </div>
                <div className="w-7 h-10 rounded-lg bg-orange-50 border border-orange-200 flex flex-col justify-center items-center shadow-2xs -ml-3">
                  <span className="w-3.5 h-1 bg-orange-300 rounded-full mb-1" />
                  <span className="w-2.5 h-0.5 bg-orange-200 rounded-full" />
                </div>
                <span className="text-stone-300 font-bold text-xs px-0.5">➔</span>
                <div className="w-8 h-11 rounded-lg bg-stone-900 text-orange-300 font-bold flex flex-col justify-center items-center shadow-xs scale-105">
                  <Star className="w-3 h-3 fill-orange-300 text-orange-300" />
                </div>
              </div>

            </div>
          </div>

          {/* 
            CARD 2: 继续探索职业路径
          */}
          <div className="craft-card bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-stone-200/70 shadow-xs flex flex-col justify-between gap-5 relative overflow-hidden group">
            
            {/* Header Content with Right Status Text */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="craft-chip-orange text-[10px] font-mono font-medium px-2 py-0.5 rounded-full">
                    04 · 路径
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-normal text-stone-900 tracking-tight font-serif craft-serif">
                  继续探索职业路径
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-normal">
                  回到正在进行的职业方向，继续完成挑战或开启新的路径。
                </p>
              </div>

              {/* Status Meta on top right */}
              <div className="text-left sm:text-right shrink-0 bg-stone-50/80 sm:bg-transparent p-2 sm:p-0 rounded-2xl sm:rounded-none">
                <div className="text-xs font-normal text-stone-800 font-serif craft-serif">当前探索: AI产品经理</div>
                <div className="text-[11px] text-stone-500 font-mono">当前进度: 02-试炼任务交付</div>
              </div>
            </div>

            {/* Bottom Row: Action Buttons (Left) + Milestone Track (Right) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100">
              
              {/* Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onNavigate('stage2')}
                  className="craft-btn-black px-4 py-2 text-xs"
                  id="btn-continue-task"
                >
                  继续任务
                </button>
                <button
                  onClick={() => onNavigate('career-explore')}
                  className="craft-btn-secondary px-3.5 py-2 text-xs"
                  id="btn-explore-new-path"
                >
                  探索新方向
                </button>
              </div>

              {/* Milestone Progress Bar: [经历提取] ── [试路任务] ── [综合结算与报告] */}
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-600 bg-stone-50/90 px-3 py-1.5 rounded-full border border-stone-200/50 overflow-x-auto">
                <span className="flex items-center gap-1 text-emerald-700 font-normal whitespace-nowrap">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>经历提取</span>
                </span>
                <span className="text-stone-300">──</span>
                <span className="flex items-center gap-1 text-orange-700 font-normal whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
                  <span>试路任务</span>
                </span>
                <span className="text-stone-300">──</span>
                <span className="flex items-center gap-1 text-stone-400 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-300 inline-block" />
                  <span>综合结算与报告</span>
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* 
          ========================================================================
          3. BOTTOM INTERACTIVE SECTION:
             3 ARCH / TOMBSTONE BUTTONS + DYNAMIC EXPANDING CARD
             States:
             - State 0: Insight Overview ("AI 最近注意到……")
             - State 1: Active on "能力卡库 (14)"
             - State 2: Active on "职业路径 (2)"
             - State 3: Active on "探索报告 (2)" (Merged 潜能报告)
          ========================================================================
        */}
        <div className="space-y-4 pt-2">
          
          {/* Quick Tab Header / Explanatory Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-800 tracking-tight">探索资产与成长沉淀</span>
              <span className="text-[11px] text-stone-400">点击下方卡牌即可快速切换视图</span>
            </div>

            {/* AI Insights Quick Toggle Button */}
            <button
              onClick={() => setActiveArchTab(activeArchTab === 'insight' ? 'cards' : 'insight')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeArchTab === 'insight'
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>AI 洞察看板</span>
            </button>
          </div>

          {/* 
            DYNAMIC WIREFRAME LAYOUT WITH ARCH TABS 
          */}
          <div className="flex flex-col lg:flex-row items-stretch gap-4 sm:gap-5">
            
            {/* 
              ARCH BUTTON 1: 能力卡库 (14)
            */}
            <button
              onClick={() => setActiveArchTab(activeArchTab === 'cards' ? 'insight' : 'cards')}
              className={`w-full lg:w-[176px] lg:min-w-[176px] lg:max-w-[176px] p-5 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer border shrink-0 ${
                activeArchTab === 'cards'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-lg scale-[1.02]'
                  : 'bg-white hover:bg-stone-50/90 text-stone-800 border-stone-200/90 shadow-xs'
              }`}
              id="arch-btn-cards"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition ${
                activeArchTab === 'cards' ? 'bg-white/10 text-amber-300' : 'bg-amber-50 text-amber-700'
              }`}>
                <Layers className="w-6 h-6" />
              </div>
              <div className="text-2xl font-black tracking-tight">{allDisplayCards.length}</div>
              <div className="text-xs font-bold">能力卡库</div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeArchTab === 'cards' ? 'bg-white/20 text-stone-200' : 'bg-stone-100 text-stone-500'
              }`}>
                点击展开
              </span>
            </button>

            {/* 
              IF STATE 1: (Active on Cards) -> Render Cards Expansion Panel HERE
            */}
            {activeArchTab === 'cards' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex-1 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4"
              >
                {/* Panel Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-stone-900">
                      你已经积累了 <span className="text-amber-800">产品分析</span>、<span className="text-amber-800">用户洞察</span> 等 {allDisplayCards.length} 张能力卡片
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      来自你的个人经历拆解与试路任务推演，点击任意卡牌查看详情
                    </p>
                    {profileVersion > 0 && (
                      <p className="text-[10px] text-stone-400 font-mono mt-1">
                        画像版本 v{profileVersion}{profileUpdatedAt ? ` · 最近更新 ${formatProfileUpdatedAt(profileUpdatedAt)}` : ''}
                      </p>
                    )}
                  </div>

                  {/* Category Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCardCategory(cat)}
                        className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition cursor-pointer whitespace-nowrap ${
                          selectedCardCategory === cat
                            ? 'bg-stone-900 text-white font-bold'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                        }`}
                      >
                        {cat === 'all' ? '全部' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cards List matching wireframe bullet style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {filteredDisplayCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => onOpenCardDetail(card)}
                      className="p-3.5 rounded-xl bg-stone-50/90 hover:bg-stone-100 border border-stone-200/60 transition cursor-pointer flex flex-col justify-between gap-1.5 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <h4 className="text-xs font-bold text-stone-900 group-hover:text-amber-800 transition">
                            {card.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white text-stone-600 border border-stone-200">
                            {card.statusTag}
                          </span>
                          {persistedCardIds.has(card.id) && (
                            <>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleStartCardEdit(card);
                                }}
                                className="p-1 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-200 transition cursor-pointer"
                                title="编辑已确认能力卡"
                                aria-label={`编辑${card.title}`}
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handleDeleteCard(card);
                                }}
                                disabled={isSavingCard}
                                className="p-1 rounded-full text-stone-400 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                                title="删除已确认能力卡"
                                aria-label={`删除${card.title}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  ))}
                </div>

                {cardActionError && (
                  <p role="alert" className="text-xs text-rose-700">
                    {cardActionError}
                  </p>
                )}

                {/* Bottom Link Action */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <span className="text-stone-400">已展示 {filteredDisplayCards.length} 张能力卡</span>
                  <button
                    onClick={() => onNavigate('input-experience')}
                    className="text-amber-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>通过补充新经历提取更多能力卡 ↗</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* 
              ARCH BUTTON 2: 职业路径 (2)
            */}
            <button
              onClick={() => setActiveArchTab(activeArchTab === 'paths' ? 'insight' : 'paths')}
              className={`w-full lg:w-[176px] lg:min-w-[176px] lg:max-w-[176px] p-5 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer border shrink-0 ${
                activeArchTab === 'paths'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-lg scale-[1.02]'
                  : 'bg-white hover:bg-stone-50/90 text-stone-800 border-stone-200/90 shadow-xs'
              }`}
              id="arch-btn-paths"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition ${
                activeArchTab === 'paths' ? 'bg-white/10 text-purple-300' : 'bg-purple-50 text-purple-700'
              }`}>
                <Compass className="w-6 h-6" />
              </div>
              <div className="text-2xl font-black tracking-tight">{EXPLORED_CAREER_PATHS.length}</div>
              <div className="text-xs font-bold">职业路径</div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeArchTab === 'paths' ? 'bg-white/20 text-stone-200' : 'bg-stone-100 text-stone-500'
              }`}>
                点击展开
              </span>
            </button>

            {/* 
              IF STATE 2: (Active on Paths) -> Render Paths Expansion Panel HERE
            */}
            {activeArchTab === 'paths' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex-1 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4"
              >
                {/* Panel Header */}
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="text-sm sm:text-base font-bold text-stone-900">
                    你已经探索过 <span className="text-amber-800">交互设计师</span>、<span className="text-amber-800">AI产品经理</span> 等 {EXPLORED_CAREER_PATHS.length} 条职业路径
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    基于能力卡牌组推演与工作台实战交付，清晰记录各路径探索进度与能力匹配度
                  </p>
                </div>

                {/* Paths List */}
                <div className="space-y-3">
                  {EXPLORED_CAREER_PATHS.map((path) => (
                    <div
                      key={path.id}
                      className="p-4 rounded-2xl bg-stone-50/80 hover:bg-stone-100 border border-stone-200/70 transition space-y-2.5 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          <h4 className="font-bold text-stone-900 text-sm">{path.title}</h4>
                          <span className="text-xs text-stone-500 font-mono">({path.englishTitle})</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${path.statusColor}`}>
                            {path.statusTag}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            匹配度 {path.matchScore}%
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {path.description}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-stone-200/50 text-xs">
                        <span className="text-stone-500 text-[11px]">{path.latestActivity}</span>
                        <button
                          onClick={() => {
                            if (path.id === 'path-ai-pm') onNavigate('stage2');
                            else onNavigate('stage1');
                          }}
                          className="text-stone-900 font-bold hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>进入该方向实战 ➔</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Link Action */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <span className="text-stone-400">已探索 2 条前沿职业路径</span>
                  <button
                    onClick={() => onNavigate('career-explore')}
                    className="text-amber-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>探索更多新职业路径 ↗</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* 
              ARCH BUTTON 3: 探索报告 (2) (潜能报告并入)
            */}
            <button
              onClick={() => setActiveArchTab(activeArchTab === 'reports' ? 'insight' : 'reports')}
              className={`w-full lg:w-[176px] lg:min-w-[176px] lg:max-w-[176px] p-5 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer border shrink-0 ${
                activeArchTab === 'reports'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-lg scale-[1.02]'
                  : 'bg-white hover:bg-stone-50/90 text-stone-800 border-stone-200/90 shadow-xs'
              }`}
              id="arch-btn-reports"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition ${
                activeArchTab === 'reports' ? 'bg-white/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
              }`}>
                <Award className="w-6 h-6" />
              </div>
              <div className="text-2xl font-black tracking-tight">{EXPLORED_REPORTS.length}</div>
              <div className="text-xs font-bold">探索报告</div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeArchTab === 'reports' ? 'bg-white/20 text-stone-200' : 'bg-stone-100 text-stone-500'
              }`}>
                含潜能画像
              </span>
            </button>

            {/* 
              IF STATE 3: (Active on Reports) -> Render Reports & Merged Potential Report HERE
            */}
            {activeArchTab === 'reports' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex-1 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5"
              >
                {/* Panel Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-stone-900">
                      你已经积累了 <span className="text-amber-800">AI产品经理试路报告</span>、<span className="text-amber-800">交互设计潜能报告</span> 等 {EXPLORED_REPORTS.length} 份探索报告
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      潜能报告已并入个人档案，点击任意报告展开完整雷达维度、实战得分与导师建议
                    </p>
                  </div>

                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 shrink-0">
                    实战认证 Grade S / A+
                  </span>
                </div>

                {/* Reports List */}
                <div className="space-y-4">
                  {EXPLORED_REPORTS.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 sm:p-5 rounded-2xl bg-stone-50/80 border border-stone-200/80 space-y-3 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <h4 className="font-bold text-stone-900 text-sm sm:text-base">{report.title}</h4>
                          <span className="text-xs text-stone-500 font-mono">{report.date}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="px-3 py-1 rounded-full bg-stone-900 text-white text-xs font-bold font-mono">
                            Grade {report.grade} ({report.score}分)
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-stone-700 leading-relaxed">
                        <strong className="text-stone-900">核心发现：</strong> {report.keyDiscovery}
                      </p>

                      {/* Radar scores mini breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {report.radarScores.map((scoreItem) => (
                          <div key={scoreItem.dimension} className="p-2 rounded-xl bg-white border border-stone-200/70 text-center">
                            <div className="text-[10px] text-stone-500 truncate">{scoreItem.dimension}</div>
                            <div className="text-sm font-black text-stone-900">{scoreItem.score}分</div>
                          </div>
                        ))}
                      </div>

                      {/* Mentor comment */}
                      <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100/80 text-xs text-purple-900 flex items-start gap-2">
                        <Bot className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">导师复盘：</span>
                          <span>{report.mentorComment}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-200/50 text-xs">
                        <span className="text-stone-500 text-[11px]">实战耗时：{report.timeSpent}</span>
                        <button
                          onClick={() => {
                            const taskMatch = COMPLETED_TRIAL_TASKS.find(t => t.score === report.score);
                            if (taskMatch) setSelectedTaskForDetail(taskMatch);
                          }}
                          className="text-stone-900 font-bold hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>查看完整 PRD 与任务交付物 ➔</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Merged Potential Report Summary Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-emerald-500/10 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-stone-900">潜能报告已全面与个人档案打通</div>
                    <div className="text-stone-600">完成任意试路工作台模拟后，AI复盘Agent会自动将实战证据与雷达评测更新至此。</div>
                  </div>
                  <button
                    onClick={() => onNavigate('stage2')}
                    className="craft-btn-black px-4 py-2 text-xs font-bold rounded-full cursor-pointer shrink-0"
                  >
                    开启新试路测评
                  </button>
                </div>
              </motion.div>
            )}

            {/* 
              DEFAULT STATE (State 0): AI RECENT OBSERVATIONS ("AI 最近注意到……")
              When activeArchTab is 'insight'
            */}
            {activeArchTab === 'insight' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex-1 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
                      <span>AI 最近注意到……</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                        3 条新洞察
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500">
                      基于你在经历提取、出牌推演与工作台实战中的行为模式自动沉淀
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (onOpenAgentChat) onOpenAgentChat('growth_companion');
                      else window.dispatchEvent(new CustomEvent('open-agent-chat', { detail: { agentId: 'growth_companion' } }));
                    }}
                    className="text-xs font-semibold text-stone-700 hover:text-stone-950 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 transition cursor-pointer flex items-center gap-1"
                  >
                    <Bot className="w-3.5 h-3.5 text-purple-600" />
                    <span>查看更多洞察 / 与Agent对话</span>
                  </button>
                </div>

                {/* AI Observation Quotes List matching Figma Wireframe */}
                <div className="space-y-3">
                  {AI_RECENT_OBSERVATIONS.map((obs) => (
                    <div
                      key={obs.id}
                      className="p-4 rounded-2xl bg-stone-50/80 hover:bg-stone-100/90 border border-stone-200/70 transition space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-xs sm:text-sm font-semibold text-stone-800 leading-relaxed font-serif craft-serif">
                            {obs.quote}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${obs.tagColor}`}>
                          {obs.tag}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-500 pl-6 gap-2">
                        <span>{obs.timestamp} · {obs.context}</span>
                        <button
                          onClick={() => {
                            if (onOpenAgentChat) onOpenAgentChat('review_reflection');
                            else window.dispatchEvent(new CustomEvent('open-agent-chat', { detail: { agentId: 'review_reflection' } }));
                          }}
                          className="text-amber-800 font-bold hover:underline cursor-pointer"
                        >
                          深入探讨 ➔
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Guidance */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-400">
                  <span>点击左侧卡牌可展开「能力卡库」、「职业路径」或「探索报告」</span>
                  <button
                    onClick={() => setActiveArchTab('reports')}
                    className="text-stone-700 font-bold hover:text-stone-950 flex items-center gap-1 cursor-pointer"
                  >
                    <span>查看潜能报告全景 ↗</span>
                  </button>
                </div>
              </motion.div>
            )}

          </div>

        </div>

      </div>

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4"
          >
            <h3 className="text-base font-bold text-stone-900">编辑个人档案信息</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 font-bold mb-1">姓名</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold mb-1">设计/经历背景</label>
                <input
                  type="text"
                  value={userBackground}
                  onChange={(e) => setUserBackground(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold mb-1">当前状态描述</label>
                <input
                  type="text"
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold mb-1">进度简介</label>
                <textarea
                  rows={2}
                  value={userProgressIntro}
                  onChange={(e) => setUserProgressIntro(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="craft-btn-black px-5 py-2 font-bold cursor-pointer"
                >
                  保存
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Confirmed Card Edit Modal */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">编辑能力卡</h3>
                <p className="text-xs text-stone-500 mt-1">修改会写入本机画像，并生成新的版本记录。</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCard(null)}
                disabled={isSavingCard}
                className="text-xs text-stone-400 hover:text-stone-800 cursor-pointer disabled:opacity-50"
              >
                取消
              </button>
            </div>

            <form onSubmit={handleSaveCardEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 font-bold mb-1" htmlFor="profile-card-title">
                  能力名称
                </label>
                <input
                  id="profile-card-title"
                  type="text"
                  value={editCardTitle}
                  onChange={(event) => setEditCardTitle(event.target.value)}
                  maxLength={80}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-bold mb-1" htmlFor="profile-card-description">
                  一句话描述
                </label>
                <textarea
                  id="profile-card-description"
                  rows={3}
                  value={editCardDescription}
                  onChange={(event) => setEditCardDescription(event.target.value)}
                  maxLength={240}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                />
              </div>

              {cardActionError && (
                <p role="alert" className="text-xs text-rose-700">
                  {cardActionError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  disabled={isSavingCard}
                  className="px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium cursor-pointer disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSavingCard || !editCardTitle.trim()}
                  className="craft-btn-black px-5 py-2 font-bold cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                >
                  {isSavingCard ? '保存中…' : '保存修改'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Task PRD Detail Modal */}
      <TrialTaskDetailModal
        task={selectedTaskForDetail}
        isOpen={!!selectedTaskForDetail}
        onClose={() => setSelectedTaskForDetail(null)}
        onSelectCard={(c) => onOpenCardDetail(c)}
      />

    </div>
  );
};
