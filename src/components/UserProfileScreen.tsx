import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
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
  Trash2,
  Settings,
  X
} from 'lucide-react';
import { SkillCard, UserAuth, ScreenMode } from '../types';
import type { ApiProfileEvidence, ProfileCardPatchRequest } from '../types/api';
import { EvidenceChain } from './EvidenceChain';

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
  readOnly?: boolean;
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
  initialArchTab = 'insight',
  readOnly = false,
}) => {
  const reduceMotion = useReducedMotion();
  const [hoveredCard, setHoveredCard] = useState<'cards' | 'paths' | 'reports' | null>(
    initialArchTab === 'insight' ? null : initialArchTab,
  );
  const [activeArchive, setActiveArchive] = useState<'cards' | 'reports' | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interactiveAreaRef = useRef<HTMLElement>(null);

  useEffect(() => () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  }, []);

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
  const recentEvidence = [...profileEvidence]
    .sort((a, b) => (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0))
    .slice(0, 3);

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

  const handleCardHover = (tab: 'cards' | 'paths' | 'reports' | null) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredCard(tab);
  };

  const handleInteractiveAreaLeave = () => {
    if (interactiveAreaRef.current?.contains(document.activeElement)) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setHoveredCard(null), 150);
  };

  const panelMotion = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, transform: 'translateX(-16px) scale(0.95)' },
        animate: { opacity: 1, transform: 'translateX(0) scale(1)' },
        exit: { opacity: 0, transform: 'translateX(-16px) scale(0.95)' },
      };

  return (
    <div className="profile-dashboard h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-y-auto p-3 sm:p-4 lg:p-5 relative selection:bg-orange-100 text-stone-900 font-sans bg-[#FBFBFA]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-orange-100/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-amber-100/25 blur-3xl" />
      </div>

      <div className="profile-dashboard-content w-full max-w-7xl h-full mx-auto min-h-0 flex flex-col justify-start gap-3 sm:gap-4 relative z-10">
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(-10px)' }}
          animate={{ opacity: 1, transform: 'translateY(0)' }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="craft-card bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 border border-orange-200/50 shadow-2xs shrink-0"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-orange-950 flex items-center justify-center font-bold text-base sm:text-lg border border-orange-200/80 shadow-2xs font-serif craft-serif shrink-0">
                {userName.slice(0, 1) || '林'}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-stone-900">
                  <span className="font-bold text-sm sm:text-base tracking-tight font-serif craft-serif">{userName}</span>
                  <span className="text-orange-300 text-xs">|</span>
                  <span className="text-xs text-stone-700 truncate">{userBackground}</span>
                  <span className="text-orange-300 text-xs">|</span>
                  <span className="text-xs font-medium text-orange-950 bg-orange-50/80 px-2 py-0.5 rounded-full border border-orange-200/60">
                    {userStatus}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed max-w-3xl">
                  <span className="text-orange-700 font-semibold font-mono">（进度简介）</span>
                  {persistedCards.length > 0 || profileEvidence.length > 0 ? profileProgressIntro : userProgressIntro}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="craft-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer hover:bg-orange-50/60 hover:border-orange-300 transition shrink-0"
              aria-label="打开个人设置"
            >
              <Settings className="w-3.5 h-3.5 text-orange-700" />
              <span className="hidden sm:inline">设置</span>
            </button>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 shrink-0">
          <motion.section
            initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(10px)' }}
            animate={{ opacity: 1, transform: 'translateY(0)' }}
            transition={{ duration: 0.35, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="craft-card bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 border border-orange-200/60 hover:border-orange-300 shadow-2xs flex flex-col justify-between gap-2.5 group transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <h2 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight font-serif craft-serif flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  更新我的能力画像
                </h2>
                <p className="text-xs text-stone-600 leading-snug">分享新的经历或反思，让 Agent 继续完善对你的理解。</p>
              </div>
              <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity select-none shrink-0 pt-0.5" aria-hidden="true">
                <div className="flex -space-x-2">
                  <div className="w-5 h-7 rounded bg-orange-50 border border-orange-200 -rotate-6" />
                  <div className="w-5 h-7 rounded bg-amber-50 border border-amber-200 rotate-3" />
                </div>
                <span className="text-orange-400 font-mono text-[10px]">⟶</span>
                <div className="w-6 h-8 rounded-lg bg-orange-100/80 border border-orange-300 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-3 h-3 text-orange-600" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1.5 border-t border-orange-100/70">
              <button type="button" onClick={() => onNavigate('input-experience')} className="bg-black hover:bg-stone-900 text-white rounded-full px-4 py-1.5 text-xs font-bold shadow-xs transition cursor-pointer">
                添加新经历
              </button>
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-agent-chat', { detail: { agentId: 'growth_companion' } }))} className="craft-btn-secondary px-3.5 py-1.5 text-xs text-stone-600 hover:text-orange-950 hover:bg-orange-50/60 hover:border-orange-300">
                回顾引导
              </button>
            </div>
          </motion.section>

          <motion.section
            initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(10px)' }}
            animate={{ opacity: 1, transform: 'translateY(0)' }}
            transition={{ duration: 0.35, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="craft-card bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 border border-orange-200/60 hover:border-orange-300 shadow-2xs flex flex-col justify-between gap-2.5 group transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <h2 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight font-serif craft-serif flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  继续探索职业路径
                </h2>
                <p className="text-xs text-stone-600 leading-snug">回到正在进行的职业方向，继续完成挑战或开启新的路径。</p>
              </div>
              <div className="text-right shrink-0 space-y-0.5 hidden sm:block">
                <div className="text-[11px] text-stone-700">当前探索：<span className="font-bold text-orange-950 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/60">{livePaths[0]?.title || '尚未形成'}</span></div>
                <div className="text-[10px] text-orange-700/80 font-mono">当前进度：{livePaths[0]?.statusTag || '等待任务证据'}</div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-orange-100/70">
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" onClick={() => onNavigate('stage2')} className="bg-orange-950 hover:bg-black text-white rounded-full px-4 py-1.5 text-xs font-bold shadow-xs transition cursor-pointer">继续任务</button>
                <button type="button" onClick={() => onNavigate('career-explore')} className="craft-btn-secondary px-3.5 py-1.5 text-xs text-stone-600 hover:text-orange-950 hover:bg-orange-50/60 hover:border-orange-300">探索新方向</button>
              </div>
              <div className="hidden lg:flex items-center gap-2 text-[10px] select-none shrink-0" aria-label="职业探索进度">
                <ProfileMilestone state="done" label="经历提取" />
                <span className="w-8 h-[2px] bg-orange-300 -mt-2" />
                <ProfileMilestone state="active" label="试路任务" />
                <span className="w-8 h-[1px] border-b border-dashed border-orange-200 -mt-2" />
                <ProfileMilestone state="pending" label="综合报告" />
              </div>
            </div>
          </motion.section>
        </div>

        <motion.section
          ref={interactiveAreaRef}
          layout={!reduceMotion}
          className="profile-interactive min-h-0 flex items-stretch gap-3 sm:gap-4"
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
          }}
          onMouseLeave={handleInteractiveAreaLeave}
        >
          <ArchCardItem
            id="arch-card-skills"
            icon={<Layers className="w-6 h-6 text-orange-800 stroke-[1.75]" />}
            count={allDisplayCards.length}
            title="能力卡库"
            isTilted={hoveredCard === 'cards'}
            reduceMotion={Boolean(reduceMotion)}
            onMouseEnter={() => handleCardHover('cards')}
            onClick={() => handleCardHover(hoveredCard === 'cards' ? null : 'cards')}
          />
          <AnimatePresence mode="popLayout">
            {hoveredCard === 'cards' && (
              <motion.div key="panel-skills" layout={!reduceMotion} {...panelMotion} transition={{ type: 'spring', stiffness: 340, damping: 28, mass: 0.7 }} className="profile-hover-panel">
                <div>
                  <h3 className="text-xs sm:text-sm text-stone-800 leading-snug">你已经确认 <strong className="text-orange-950 font-mono">{allDisplayCards.length}</strong> 张能力卡</h3>
                  <div className="mt-2.5 space-y-2">
                    {allDisplayCards.slice(0, 3).map((card) => (
                      <div key={card.id} className="flex items-start gap-2.5 group p-1.5 -mx-1.5 rounded-xl hover:bg-orange-50/50 transition">
                        <span className="w-6 h-6 rounded-full bg-orange-100 border border-orange-200/70 flex items-center justify-center shrink-0"><span className="w-2 h-2 rounded-full bg-orange-600" /></span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <button type="button" onClick={() => onOpenCardDetail(card)} className="font-bold text-xs text-left text-stone-900 group-hover:text-orange-950 truncate">{card.title}</button>
                            {!readOnly && <button type="button" onClick={(event) => { event.stopPropagation(); handleStartCardEdit(card); }} className="p-1 text-stone-400 hover:text-orange-900" aria-label={`编辑${card.title}`}><Edit3 className="w-3 h-3" /></button>}
                          </div>
                          <p className="text-[11px] text-stone-500 truncate mt-0.5">{card.description}</p>
                        </div>
                      </div>
                    ))}
                    {allDisplayCards.length === 0 && <EmptyProfileState text="完成经历提取并确认后，能力卡会自动进入这里。" />}
                  </div>
                </div>
                <div className="flex justify-end pt-1.5 border-t border-orange-100/80">
                  <button type="button" onClick={() => setActiveArchive('cards')} className="craft-btn-secondary px-3 py-1.5 text-xs text-orange-950 hover:bg-orange-50 hover:border-orange-300 font-bold">查看全部能力卡库 ➔</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ArchCardItem
            id="arch-card-paths"
            icon={<Compass className="w-6 h-6 text-orange-800 stroke-[1.75]" />}
            count={livePaths.length}
            title="职业路径"
            isTilted={hoveredCard === 'paths'}
            reduceMotion={Boolean(reduceMotion)}
            onMouseEnter={() => handleCardHover('paths')}
            onClick={() => handleCardHover(hoveredCard === 'paths' ? null : 'paths')}
          />
          <AnimatePresence mode="popLayout">
            {hoveredCard === 'paths' && (
              <motion.div key="panel-paths" layout={!reduceMotion} {...panelMotion} transition={{ type: 'spring', stiffness: 340, damping: 28, mass: 0.7 }} className="profile-hover-panel">
                <div>
                  <h3 className="text-xs sm:text-sm text-stone-800 leading-snug">你已经形成 <strong className="text-orange-950 font-mono">{livePaths.length}</strong> 条有任务证据的职业路径</h3>
                  <div className="mt-3 space-y-2.5">
                    {livePaths.slice(0, 2).map((path) => (
                      <button key={path.id} type="button" onClick={() => onNavigate('stage2')} className="w-full flex items-start gap-2.5 text-left p-1.5 -mx-1.5 rounded-xl hover:bg-orange-50/50 transition">
                        <span className="w-7 h-7 rounded-full bg-orange-100 border border-orange-200/70 flex items-center justify-center shrink-0"><span className="w-2.5 h-2.5 rounded-full bg-orange-600" /></span>
                        <span className="min-w-0"><strong className="block text-xs text-stone-900">{path.title}</strong><span className="block text-[11px] text-stone-500 truncate">{path.description}</span><span className="block text-[10px] text-orange-800 font-mono mt-0.5">{path.statusTag}</span></span>
                      </button>
                    ))}
                    {livePaths.length === 0 && <EmptyProfileState text="完成至少一个试路任务后，这里会形成真实方向记录。" />}
                  </div>
                </div>
                <div className="flex justify-end pt-1.5 border-t border-orange-100/80"><button type="button" onClick={() => onNavigate('career-explore')} className="craft-btn-secondary px-3 py-1.5 text-xs text-orange-950 hover:bg-orange-50 hover:border-orange-300 font-bold">查看全部职业路径 ➔</button></div>
              </motion.div>
            )}
          </AnimatePresence>

          <ArchCardItem
            id="arch-card-reports"
            icon={<Award className="w-6 h-6 text-orange-800 stroke-[1.75]" />}
            count={liveReports.length}
            title="探索报告"
            isTilted={hoveredCard === 'reports'}
            reduceMotion={Boolean(reduceMotion)}
            onMouseEnter={() => handleCardHover('reports')}
            onClick={() => handleCardHover(hoveredCard === 'reports' ? null : 'reports')}
          />
          <AnimatePresence mode="popLayout">
            {hoveredCard === 'reports' && (
              <motion.div key="panel-reports" layout={!reduceMotion} {...panelMotion} transition={{ type: 'spring', stiffness: 340, damping: 28, mass: 0.7 }} className="profile-hover-panel">
                <div>
                  <h3 className="text-xs sm:text-sm text-stone-800 leading-snug">你已经积累 <strong className="text-orange-950 font-mono">{liveReports.length}</strong> 份可追溯任务复盘</h3>
                  <div className="mt-2.5 space-y-2.5">
                    {liveReports.slice(0, 2).map((report) => (
                      <button key={report.id} type="button" onClick={() => setActiveArchive('reports')} className="w-full flex items-start gap-2.5 text-left p-1.5 -mx-1.5 rounded-xl hover:bg-orange-50/50 transition">
                        <span className="w-7 h-7 rounded-full bg-orange-100 border border-orange-200/70 flex items-center justify-center shrink-0"><span className="w-2.5 h-2.5 rounded-full bg-orange-600" /></span>
                        <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="text-xs text-stone-900 truncate">{report.title}</strong><span className="text-[10px] font-mono text-orange-950 bg-orange-100 border border-orange-200 px-1.5 rounded">{report.observedLevel}</span></span><span className="block text-[11px] text-stone-500 truncate mt-0.5">{report.keyDiscovery}</span></span>
                      </button>
                    ))}
                    {liveReports.length === 0 && <EmptyProfileState text="完成并提交试路任务后，复盘会自动保存在这里。" />}
                  </div>
                </div>
                <div className="flex justify-end pt-1.5 border-t border-orange-100/80"><button type="button" onClick={() => setActiveArchive('reports')} className="craft-btn-secondary px-3 py-1.5 text-xs text-orange-950 hover:bg-orange-50 hover:border-orange-300 font-bold">查看全部探索报告 ➔</button></div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {hoveredCard === null && (
              <motion.div key="panel-default-insights" layout={!reduceMotion} {...panelMotion} transition={{ type: 'spring', stiffness: 340, damping: 28, mass: 0.7 }} className="profile-hover-panel min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-orange-100 shrink-0">
                  <h3 className="text-xs sm:text-sm font-bold text-orange-950 font-serif craft-serif flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-orange-500" />AI 最近注意到……</h3>
                  <button type="button" onClick={() => setActiveArchive('reports')} className="craft-btn-secondary px-3 py-1 text-xs text-stone-600 hover:text-orange-950 hover:bg-orange-50 hover:border-orange-300">查看更多洞察</button>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col gap-3 pt-4">
                  {liveObservations.map((obs) => <ObservationRow key={obs.id} quote={obs.quote} meta={`${obs.timestamp} · ${obs.context}`} />)}
                  {liveObservations.length === 0 && <EmptyProfileState text="完成任务后，AI 会从真实评价中整理近期观察。" />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
        <section aria-labelledby="growth-activity-title" className="mt-auto shrink-0 rounded-2xl border border-stone-200/70 bg-white/80 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="growth-activity-title" className="flex items-center gap-2 text-sm font-semibold text-stone-800"><Clock className="h-4 w-4 text-orange-600" />最近成长记录</h2>
            {recentEvidence.length > 0 && <button type="button" onClick={() => setActiveArchive('reports')} className="flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs text-stone-600 hover:bg-orange-50 hover:text-orange-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600 active:scale-[.97]">查看任务证据<ArrowRight className="h-3.5 w-3.5" /></button>}
          </div>
          {recentEvidence.length > 0 ? (
            <ol className="mt-2 grid gap-3 md:grid-cols-3">
              {recentEvidence.map(record => <li key={record.session_id} className="flex min-w-0 items-start gap-2.5 border-l-2 border-orange-200 pl-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-medium text-stone-800">完成 {record.task_id} 试路任务<span className="ml-2 text-orange-800">观察等级 {record.observed_evidence.observed_level || '证据不足'}</span></p>
                  <p className="text-[11px] leading-relaxed text-stone-500">{formatEvidenceDate(record.created_at)} · 已形成任务证据</p>
                </div>
              </li>)}
            </ol>
          ) : <p className="mt-2 text-xs leading-relaxed text-stone-500">还没有任务记录。完成一次试路任务后，这里会留下时间、观察等级与对应证据。</p>}
        </section>
      </div>

        {activeArchive && (
          <ProfileArchiveModal
            activeArchive={activeArchive}
            cards={filteredDisplayCards}
            reports={liveReports}
            profileEvidence={profileEvidence}
            persistedCards={persistedCards}
            readOnly={readOnly}
            isSavingCard={isSavingCard}
            error={cardActionError}
            profileMeta={`档案版本 ${profileVersion}${profileUpdatedAt ? ` · 更新于 ${formatProfileUpdatedAt(profileUpdatedAt)}` : ''}`}
            categories={categories}
            selectedCategory={selectedCardCategory}
            onSelectCategory={setSelectedCardCategory}
            onClose={() => setActiveArchive(null)}
            onOpenCard={(card) => { setActiveArchive(null); onOpenCardDetail(card); }}
            onEditCard={(card) => { setActiveArchive(null); handleStartCardEdit(card); }}
            onDeleteCard={handleDeleteCard}
            onNavigate={onNavigate}
          />
        )}

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
      {editingCard && !readOnly && (
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

interface ArchCardItemProps {
  id: string;
  icon: React.ReactNode;
  count: number;
  title: string;
  isTilted: boolean;
  reduceMotion: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}

const ArchCardItem: React.FC<ArchCardItemProps> = ({
  id,
  icon,
  count,
  title,
  isTilted,
  reduceMotion,
  onMouseEnter,
  onClick,
}) => (
  <motion.button
    type="button"
    layout={!reduceMotion}
    id={id}
    onMouseEnter={() => {
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) onMouseEnter();
    }}
    onClick={onClick}
    animate={reduceMotion ? { transform: 'none' } : {
      transform: isTilted ? 'translateY(-8px) rotate(-3.5deg) scale(1.02)' : 'translateY(0) rotate(0deg) scale(1)',
    }}
    transition={{ type: 'spring', stiffness: 360, damping: 26, mass: 0.7 }}
    className={`profile-arch-card w-[145px] sm:w-[165px] lg:w-[180px] h-[210px] sm:h-[236px] lg:h-[256px] shrink-0 bg-[#FFFDF9] rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 border flex flex-col items-center justify-between cursor-pointer select-none relative transition-[border-color,box-shadow,background-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600 ${
      isTilted
        ? 'border-orange-400/90 ring-2 ring-orange-500/20 shadow-xl z-20 bg-white'
        : 'border-orange-200/80 shadow-2xs hover:shadow-md hover:border-orange-300'
    }`}
    aria-pressed={isTilted}
  >
    <span className="absolute inset-1.5 rounded-xl sm:rounded-2xl border border-orange-100 pointer-events-none" />
    <span className="w-full h-full rounded-t-[36px] sm:rounded-t-[44px] rounded-b-xl sm:rounded-b-2xl bg-orange-50/40 border border-orange-200/50 p-2.5 sm:p-3 flex flex-col items-center justify-between relative z-10">
      <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white flex items-center justify-center shadow-2xs border border-orange-200/70 mt-1">{icon}</span>
      <span className="text-3xl sm:text-4xl font-normal text-orange-950 tracking-tight font-serif craft-serif my-auto">{count}</span>
      <span className="text-center pb-0.5">
        <span className="text-xs sm:text-sm font-bold text-stone-900 tracking-tight block">{title}</span>
        <span className="text-[9px] font-mono text-orange-700/60 block mt-0.5 font-medium">{isTilted ? '点击收起' : '悬停展开'}</span>
      </span>
    </span>
  </motion.button>
);

const ProfileMilestone: React.FC<{ state: 'done' | 'active' | 'pending'; label: string }> = ({ state, label }) => (
  <span className="flex flex-col items-center">
    <span className={`w-5 h-5 rounded-full flex items-center justify-center border shadow-2xs ${
      state === 'done'
        ? 'bg-orange-100 text-orange-800 border-orange-300'
        : state === 'active'
          ? 'bg-orange-950 text-white border-orange-900'
          : 'bg-stone-100 text-stone-400 border-stone-200'
    }`}>
      {state === 'done' ? <Check className="w-3 h-3 stroke-[2.5]" /> : <span className={`w-1.5 h-1.5 rounded-full ${state === 'active' ? 'bg-orange-300 animate-pulse motion-reduce:animate-none' : 'bg-stone-300'}`} />}
    </span>
    <span className={`text-[9px] mt-0.5 scale-90 whitespace-nowrap ${state === 'active' ? 'font-bold text-orange-950' : state === 'done' ? 'text-orange-800' : 'text-stone-400'}`}>{label}</span>
  </span>
);

const EmptyProfileState: React.FC<{ text: string }> = ({ text }) => (
  <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/30 px-3 py-4 text-center text-[11px] text-stone-500">{text}</div>
);

const ObservationRow: React.FC<{ quote: string; meta: string }> = ({ quote, meta }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-orange-100/80 bg-orange-50/40 p-3 sm:p-4">
    <span className="w-4 h-4 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center shrink-0 mt-1 shadow-2xs"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /></span>
    <div className="flex-1 text-left space-y-2 min-w-0">
      <p className="text-xs sm:text-sm font-medium text-stone-800 leading-relaxed break-words">{quote}</p>
      <p className="text-[11px] text-stone-500 leading-relaxed">{meta}</p>
    </div>
  </div>
);

interface ProfileReportSummary {
  id: string;
  title: string;
  date: string;
  keyDiscovery: string;
  mentorComment: string;
  observedLevel: string;
  confidence: string;
  radarScores: Array<{ dimension: string; score: number }>;
}

interface ProfileArchiveModalProps {
  activeArchive: 'cards' | 'reports';
  cards: Array<SkillCard & { statusTag: string; addedDate: string }>;
  reports: ProfileReportSummary[];
  profileEvidence: ApiProfileEvidence[];
  persistedCards: SkillCard[];
  readOnly: boolean;
  isSavingCard: boolean;
  error: string | null;
  profileMeta: string;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onClose: () => void;
  onOpenCard: (card: SkillCard) => void;
  onEditCard: (card: SkillCard & { statusTag: string; addedDate: string }) => void;
  onDeleteCard: (card: SkillCard & { statusTag: string; addedDate: string }) => Promise<void>;
  onNavigate: (screen: ScreenMode) => void;
}

const ProfileArchiveModal: React.FC<ProfileArchiveModalProps> = ({
  activeArchive,
  cards,
  reports,
  profileEvidence,
  persistedCards,
  readOnly,
  isSavingCard,
  error,
  profileMeta,
  categories,
  selectedCategory,
  onSelectCategory,
  onClose,
  onOpenCard,
  onEditCard,
  onDeleteCard,
  onNavigate,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
  <dialog ref={dialogRef} aria-labelledby="profile-archive-title"
    className="profile-archive-dialog fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-4xl max-h-[82vh] p-0 border-0 rounded-3xl bg-transparent"
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onKeyDown={(event) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); }
    }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
  >
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(12px) scale(0.98)' }}
      animate={{ opacity: 1, transform: 'translateY(0) scale(1)' }}
      exit={{ opacity: 0, transform: 'translateY(8px) scale(0.98)' }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-4xl max-h-[82vh] bg-[#FFFEFC] rounded-3xl shadow-2xl border border-orange-200/80 overflow-hidden flex flex-col"
    >
      <header className="px-5 py-4 border-b border-orange-100 flex items-center justify-between gap-3 bg-white/90">
        <div>
          <h3 id="profile-archive-title" className="text-base font-bold text-stone-900 font-serif craft-serif">{activeArchive === 'cards' ? '能力卡库' : '探索报告'}</h3>
          <p className="text-xs text-stone-500 mt-0.5">{activeArchive === 'cards' ? '只展示已经确认并保存的能力卡。' : '每条结论均可回到任务答案与证据目录。'}</p>
          <p className="text-[11px] text-stone-500 mt-1">{profileMeta}</p>
        </div>
        <button type="button" onClick={onClose} className="w-9 h-9 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition" aria-label="关闭"><X className="w-4 h-4" /></button>
      </header>
      <div className="p-5 overflow-y-auto min-h-0">
        {error && <p role="alert" className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
        {activeArchive === 'cards' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((category) => <button key={category} type="button" onClick={() => onSelectCategory(category)} className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition ${selectedCategory === category ? 'bg-orange-950 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-orange-300'}`}>{category === 'all' ? '全部' : category}</button>)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cards.map((card) => (
                <article key={card.id} className="rounded-2xl border border-orange-100 bg-white p-4 hover:border-orange-300 hover:shadow-sm transition">
                  <div className="flex items-start justify-between gap-3">
                    <button type="button" onClick={() => onOpenCard(card)} className="min-w-0 flex-1 text-left"><span className="text-[10px] text-orange-800 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">{card.category}</span><span className="block text-sm font-bold text-stone-900 mt-2">{card.title}</span><span className="block text-xs text-stone-500 mt-1 line-clamp-2">{card.description}</span></button>
                    {!readOnly && <div className="flex items-center gap-1 shrink-0"><button type="button" onClick={(event) => { event.stopPropagation(); onEditCard(card); }} className="p-2 rounded-full text-stone-400 hover:text-orange-900 hover:bg-orange-50" aria-label={`编辑${card.title}`}><Edit3 className="w-3.5 h-3.5" /></button><button type="button" disabled={isSavingCard} onClick={(event) => { event.stopPropagation(); void onDeleteCard(card); }} className="p-2 rounded-full text-stone-400 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-40" aria-label={`删除${card.title}`}><Trash2 className="w-3.5 h-3.5" /></button></div>}
                  </div>
                </article>
              ))}
              {cards.length === 0 && <div className="md:col-span-2"><EmptyProfileState text="当前分类还没有已确认能力卡。" /></div>}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const evidence = profileEvidence.find((item) => item.session_id === report.id);
              return (
                <article key={report.id} className="rounded-2xl border border-orange-100 bg-white p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="text-sm font-bold text-stone-900">{report.title}</h4><p className="text-[11px] text-stone-500 mt-0.5">{report.date}</p></div><span className="text-[10px] font-mono text-orange-950 bg-orange-100 border border-orange-200 px-2 py-1 rounded-full">{report.observedLevel} · 置信度 {report.confidence}</span></div>
                  <p className="text-xs text-stone-700 leading-relaxed"><strong>核心发现：</strong>{report.keyDiscovery}</p>
                  {report.radarScores.length > 0 && <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{report.radarScores.map((score) => <div key={score.dimension} className="rounded-xl border border-stone-100 bg-stone-50 p-2 text-center"><div className="text-[10px] text-stone-500 truncate">{score.dimension}</div><div className="text-sm font-bold text-stone-900">{score.score}分</div></div>)}</div>}
                  {evidence && <EvidenceChain record={evidence} cards={persistedCards} />}
                  <div className="rounded-xl bg-orange-50/70 border border-orange-100 px-3 py-2 text-xs text-orange-950"><strong>下一步：</strong>{report.mentorComment}</div>
                </article>
              );
            })}
            {reports.length === 0 && <EmptyProfileState text="完成并提交试路任务后，这里会生成可追溯报告。" />}
            <div className="flex justify-end"><button type="button" onClick={() => onNavigate('stage2')} className="bg-orange-950 text-white rounded-full px-4 py-2 text-xs font-bold">继续试路任务</button></div>
          </div>
        )}
      </div>
    </motion.div>
  </dialog>
);
};
