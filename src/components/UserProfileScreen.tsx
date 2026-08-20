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
import { SkillCard, UserAuth, ScreenMode } from '../types';
import type { ApiProfileEvidence, ProfileCardPatchRequest } from '../types/api';

interface UserProfileScreenProps {
  persistedCards?: SkillCard[];
  profileEvidence?: ApiProfileEvidence[];
  profileVersion?: number;
  profileUpdatedAt?: string | null;
  auth: UserAuth;
  onNavigate: (screen: ScreenMode) => void;
  onOpenCardDetail: (card: SkillCard) => void;
  onUpdateCard?: (cardId: string, patch: ProfileCardPatchRequest) => Promise<void> | void;
  onDeleteCard?: (cardId: string) => Promise<void> | void;
  initialArchTab?: 'insight' | 'cards' | 'paths' | 'reports';
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  persistedCards = [],
  profileEvidence = [],
  profileVersion = 0,
  profileUpdatedAt = null,
  auth,
  onNavigate,
  onOpenCardDetail,
  onUpdateCard,
  onDeleteCard,
  initialArchTab = 'insight'
}) => {
  // Bottom Arch Navigation State (4 states from the Figma wireframe: 'insight' | 'cards' | 'paths' | 'reports')
  const [activeArchTab, setActiveArchTab] = useState<'insight' | 'cards' | 'paths' | 'reports'>(initialArchTab);

  // Cards category filter
  const [selectedCardCategory, setSelectedCardCategory] = useState<string>('all');
  
  // User Profile Info
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userName, setUserName] = useState(auth.user?.name || '探索者');
  const [userBackground, setUserBackground] = useState('尚未填写背景');
  const [userStatus, setUserStatus] = useState('状态：本机探索中');
  const [userProgressIntro, setUserProgressIntro] = useState('完成经历提取并确认能力卡后，档案会显示真实记录。');

  // Persisted card editing state
  const [editingCard, setEditingCard] = useState<(SkillCard & { statusTag: string; addedDate: string }) | null>(null);
  const [editCardTitle, setEditCardTitle] = useState('');
  const [editCardDescription, setEditCardDescription] = useState('');
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [cardActionError, setCardActionError] = useState<string | null>(null);

  const formatEvidenceDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '时间未记录';
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const liveReports = profileEvidence.map(record => {
    const evaluation = record.evaluation;
    return {
      id: record.session_id,
      role: 'AI 产品经理试路',
      title: `${record.task_id} 任务复盘`,
      date: formatEvidenceDate(record.created_at),
      timeSpent: '以工作台记录为准',
      keyDiscovery: evaluation?.summary || record.observed_evidence.statement,
      radarScores: evaluation?.dimensions || [],
      mentorComment: evaluation?.next_step || '本次任务已形成可追溯的过程证据。',
      strengths: evaluation?.strengths || [],
      recommendations: evaluation?.gaps || [],
      observedLevel: record.observed_evidence.observed_level || '证据不足',
      confidence: record.observed_evidence.confidence || '未记录',
      score: null as number | null,
      grade: null as string | null,
    };
  });

  const livePaths = profileEvidence.length > 0
    ? [{
        id: 'path-ai-pm',
        title: 'AI 产品经理',
        englishTitle: 'AI Product Manager',
        status: '进行中',
        statusTag: `已完成 ${profileEvidence.length} 个小任务`,
        statusColor: 'bg-amber-100 text-amber-900 border-amber-200',
        description: '把确认过的能力卡和做过的小任务放在一起，看看自己正在积累什么。',
        completedChallenges: profileEvidence.length,
        totalChallenges: 12,
        latestActivity: `最近记录：${profileEvidence[0].task_id} 任务评价已写入档案`,
        icon: 'Briefcase',
        colorTone: 'amber',
      }]
    : [];

  const liveObservations = profileEvidence.slice(0, 3).map(record => ({
    id: record.session_id,
    quote: record.evaluation?.summary || record.observed_evidence.statement,
    timestamp: `记录于 ${formatEvidenceDate(record.created_at)}`,
    context: `${record.task_id} 任务复盘`,
    tag: record.observed_evidence.observed_level || '过程证据',
    tagColor: 'bg-emerald-100 text-emerald-800',
  }));

  const profileProgressIntro = `已确认 ${persistedCards.length} 张能力卡，完成 ${profileEvidence.length} 个小任务，最近一次记录来自${profileEvidence.length > 0 ? `「${profileEvidence[0].task_id}」` : '尚未提交的任务'}`;

  // The profile shows only cards confirmed through the backend. Landing-page
  // examples are intentionally not presented as personal evidence.
  const allDisplayCards = persistedCards.map(card => ({
    ...card,
    statusTag: '已确认',
    addedDate: '已同步',
  }));
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
    if (!window.confirm('确定删除这张能力卡吗？这次修改会保留在版本记录里。')) return;
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
                {persistedCards.length > 0 || profileEvidence.length > 0 ? profileProgressIntro : userProgressIntro}
              </p>
            </div>

            {/* Quick Agent Consult Pill */}
            <div className="shrink-0 pt-2 sm:pt-0">
              <button
                onClick={() => setActiveArchTab('reports')}
                className="craft-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-orange-600" />
                <span>查看任务复盘</span>
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
                  01 · 记录
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-normal text-stone-900 tracking-tight font-serif craft-serif">
                记录新的经历
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-normal">
                写下新的经历或想法，让个人档案更完整。
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
                    setActiveArchTab('insight');
                  }}
                  className="craft-btn-secondary px-3.5 py-2 text-xs"
                  id="btn-review-reflection"
                >
                  查看成长记录
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
                  <span>小任务</span>
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
             - State 0: Insight Overview（近期成长观察）
             - State 1: Active on "能力卡库 (14)"
             - State 2: Active on "职业路径 (2)"
             - State 3: Active on "探索报告" (包含能力画像)
          ========================================================================
        */}
        <div className="space-y-4 pt-2">
          
          {/* Quick Tab Header / Explanatory Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-800 tracking-tight">我的记录与成长</span>
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
              <span>成长观察</span>
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
                      {allDisplayCards.length > 0 ? `已确认 ${allDisplayCards.length} 张能力卡片` : '尚未确认能力卡片'}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      能力卡来自后端保存的用户确认结果，点击卡片查看详情
                    </p>
                    {profileVersion > 0 && (
                      <p className="text-[10px] text-stone-400 font-mono mt-1">
                        档案版本 v{profileVersion}{profileUpdatedAt ? ` · 最近更新 ${formatProfileUpdatedAt(profileUpdatedAt)}` : ''}
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
                  {filteredDisplayCards.length > 0 ? filteredDisplayCards.map((card) => (
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
                  )) : (
                    <div className="md:col-span-2 rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 p-5 text-sm text-stone-500">
                      完成经历提取并确认能力卡后，个人档案会在这里显示真实卡片。
                    </div>
                  )}
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
              <div className="text-2xl font-black tracking-tight">{livePaths.length}</div>
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
                    {livePaths.length > 0 ? `已记录 ${livePaths.length} 条职业路径` : '尚未形成职业路径记录'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    这里只记录你确认过的卡和做过的任务，不会给出没有依据的岗位匹配分。
                  </p>
                </div>

                {/* Paths List */}
                <div className="space-y-3">
                  {livePaths.length > 0 ? livePaths.map((path) => (
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
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          已形成任务证据
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {path.description}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-stone-200/50 text-xs">
                        <span className="text-stone-500 text-[11px]">{path.latestActivity}</span>
                        <button
                          onClick={() => {
                            if (path.id === 'path-ai-pm') onNavigate('stage2');
                            else onNavigate('stage2');
                          }}
                          className="text-stone-900 font-bold hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>去做一个相关任务 ➔</span>
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 p-5 text-sm text-stone-500">
                      完成至少一个小任务后，这里会显示真实的方向进度与最近活动。
                    </div>
                  )}
                </div>

                {/* Bottom Link Action */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <span className="text-stone-400">已记录 {livePaths.length} 条职业路径</span>
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
              ARCH BUTTON 3: 探索报告（包含能力画像）
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
              <div className="text-2xl font-black tracking-tight">{liveReports.length}</div>
              <div className="text-xs font-bold">任务记录</div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeArchTab === 'reports' ? 'bg-white/20 text-stone-200' : 'bg-stone-100 text-stone-500'
              }`}>
                含成长回看
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
                      {liveReports.length > 0 ? `已完成 ${liveReports.length} 次任务复盘` : '还没有完成任务复盘'}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      这里只记录你在任务里做过什么，不代表岗位认证或录用结论。
                    </p>
                  </div>

                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 shrink-0">
                    仅展示有来源的评价结果
                  </span>
                </div>

                {/* Reports List */}
                <div className="space-y-4">
                  {liveReports.length > 0 ? liveReports.map((report) => (
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
                            {report.observedLevel} · 置信度 {report.confidence}
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
                          <span className="font-bold">下一步建议：</span>
                          <span>{report.mentorComment}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-200/50 text-xs">
                        <span className="text-stone-500 text-[11px]">完成用时：{report.timeSpent}</span>
                        <button
                          onClick={() => onNavigate('stage2')}
                          className="text-stone-900 font-bold hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>继续完成下一项任务 ➔</span>
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 p-5 text-sm text-stone-500">
                      完成并提交小任务后，评价结果会自动显示在这里。
                    </div>
                  )}
                </div>

                {/* Merged Potential Report Summary Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-emerald-500/10 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-stone-900">这次任务已经记入个人档案</div>
                    <div className="text-stone-600">完成任务后，本次表现和改进建议会自动保存到本机。</div>
                  </div>
                  <button
                    onClick={() => onNavigate('stage2')}
                    className="craft-btn-black px-4 py-2 text-xs font-bold rounded-full cursor-pointer shrink-0"
                  >
                    再做一个小任务
                  </button>
                </div>
              </motion.div>
            )}

            {/* 
              DEFAULT STATE (State 0): 近期成长观察
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
                      <span>近期成长观察</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                        {liveObservations.length} 条记录
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500">
                      根据你已经完成的任务整理
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveArchTab('reports')}
                    className="text-xs font-semibold text-stone-700 hover:text-stone-950 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 transition cursor-pointer flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span>查看任务复盘</span>
                  </button>
                </div>

                {/* AI Observation Quotes List matching Figma Wireframe */}
                <div className="space-y-3">
                  {liveObservations.length > 0 ? liveObservations.map((obs) => (
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
                          onClick={() => setActiveArchTab('reports')}
                          className="text-amber-800 font-bold hover:underline cursor-pointer"
                        >
                          查看任务评价 ➔
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 p-5 text-sm text-stone-500">
                      提交小任务后，这里会根据真实评价结果整理成长观察。
                    </div>
                  )}
                </div>

                {/* Bottom Guidance */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-400">
                  <span>点击左侧卡片可查看能力卡、职业方向和任务复盘</span>
                  <button
                    onClick={() => setActiveArchTab('reports')}
                    className="text-stone-700 font-bold hover:text-stone-950 flex items-center gap-1 cursor-pointer"
                  >
                    <span>查看任务复盘 ↗</span>
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
                <p className="text-xs text-stone-500 mt-1">修改会保存到本机，并生成新的版本记录。</p>
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

    </div>
  );
};
