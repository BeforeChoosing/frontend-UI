import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
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
  const [activeView, setActiveView] = useState<'insight' | 'cards' | 'paths' | 'reports'>(initialArchTab);
  const [activeArchive, setActiveArchive] = useState<'cards' | 'reports' | null>(null);
  const viewOptions = [
    { id: 'insight', label: '近期洞察', icon: Sparkles },
    { id: 'cards', label: '能力卡库', icon: Layers },
    { id: 'paths', label: '职业路径', icon: Compass },
    { id: 'reports', label: '探索报告', icon: FileText },
  ] as const;
  const handleViewKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let target: number;
    if (event.key === 'ArrowRight') target = (index + 1) % viewOptions.length;
    else if (event.key === 'ArrowLeft') target = (index + viewOptions.length - 1) % viewOptions.length;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = viewOptions.length - 1;
    else return;
    event.preventDefault();
    setActiveView(viewOptions[target].id);
    document.getElementById(`profile-tab-${viewOptions[target].id}`)?.focus();
  };

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

  const viewCounts = { insight: null, cards: allDisplayCards.length, paths: livePaths.length, reports: liveReports.length };

  return (
    <div className="profile-dashboard profile-v2">
      <div className="profile-v2-container">
        <header className="profile-v2-header">
          <div>
            <p className="profile-v2-eyebrow">我的探索 · {userStatus.replace(/^状态[：:]\s*/, '')}</p>
            <h1>成长档案</h1>
            <p className="profile-v2-intro">{persistedCards.length > 0 || profileEvidence.length > 0 ? profileProgressIntro : userProgressIntro}</p>
          </div>
          <button type="button" onClick={() => setIsEditingProfile(true)} className="profile-v2-account" aria-label="打开个人设置">
            <span className="profile-v2-avatar">{userName.slice(0, 1) || '探'}</span>
            <span><strong>{userName}</strong><span>{userBackground}</span></span>
            <Settings size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="profile-v2-actions">
          <section className="profile-v2-resume">
            <div className="profile-v2-action-icon"><Compass size={23} aria-hidden="true" /></div>
            <div className="profile-v2-action-copy">
              <p className="profile-v2-eyebrow">继续上一次探索</p>
              <h2>{livePaths[0]?.title || '从一个小任务开始'}</h2>
              <p>{livePaths[0] ? `${livePaths[0].statusTag}，继续积累不同情境下的能力证据。` : '完成一次试路任务，了解自己的判断与行动方式。'}</p>
              <div className="profile-v2-button-row">
                <button type="button" onClick={() => onNavigate('stage2')} className="profile-v2-primary">继续任务<ArrowRight size={16} /></button>
                <button type="button" onClick={() => onNavigate('career-explore')} className="profile-v2-text-button">探索新方向</button>
              </div>
            </div>
          </section>
          <section className="profile-v2-add">
            <div className="profile-v2-action-icon neutral"><Plus size={23} aria-hidden="true" /></div>
            <div className="profile-v2-action-copy">
              <h2>补充一段新经历</h2>
              <p>项目、工作或日常中的新发现，都可以成为了解自己的线索。</p>
              <div className="profile-v2-button-row">
                <button type="button" onClick={() => onNavigate('input-experience')} className="profile-v2-secondary">添加新经历</button>
                <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-agent-chat', { detail: { agentId: 'growth_companion' } }))} className="profile-v2-text-button">回顾引导</button>
              </div>
            </div>
          </section>
        </div>

        <div className="profile-v2-workspace">
          <section className="profile-v2-library" aria-label="成长档案内容">
            <div className="profile-v2-tabs" role="tablist" aria-label="档案分类">
              {viewOptions.map((view, index) => <button key={view.id} type="button" role="tab"
                id={`profile-tab-${view.id}`} aria-controls="profile-content-panel"
                aria-selected={activeView === view.id} tabIndex={activeView === view.id ? 0 : -1}
                onClick={() => setActiveView(view.id)} onKeyDown={event => handleViewKeyDown(event, index)}>
                <view.icon size={17} aria-hidden="true" /><span>{view.label}</span>
                {viewCounts[view.id] !== null && <span className="profile-v2-count">{viewCounts[view.id]}</span>}
              </button>)}
            </div>
            <div id="profile-content-panel" role="tabpanel" aria-labelledby={`profile-tab-${activeView}`} tabIndex={0} className="profile-v2-panel">
              {activeView === 'insight' && <>
                <div className="profile-v2-section-heading"><div><h2>从实践中看见自己</h2><p>依据已完成的任务整理，不代表最终能力定论。</p></div></div>
                {liveObservations.length ? <div className="profile-v2-observations">{liveObservations.map(obs => <article key={obs.id}>
                  <span className="profile-v2-observation-icon"><Sparkles size={18} aria-hidden="true" /></span>
                  <div><p className="profile-v2-observation-quote">{obs.quote}</p><p className="profile-v2-meta">{obs.timestamp} · {obs.context}</p></div>
                </article>)}</div> : <EmptyProfileState text="完成任务后，AI 会从真实评价中整理近期观察。" />}
                <button type="button" onClick={() => setActiveArchive('reports')} className="profile-v2-text-button profile-v2-panel-link">查看洞察依据<ChevronRight size={16} /></button>
              </>}
              {activeView === 'cards' && <>
                <div className="profile-v2-section-heading"><div><h2>已确认的能力</h2><p>已确认 {allDisplayCards.length} 张。每张卡保留来源与核对记录。</p></div><button type="button" onClick={() => setActiveArchive('cards')} className="profile-v2-text-button">查看全部<ChevronRight size={16} /></button></div>
                <ul className="profile-v2-list">{allDisplayCards.slice(0, 4).map(card => <li key={card.id}>
                  <span className="profile-v2-list-icon"><Layers size={20} aria-hidden="true" /></span>
                  <button type="button" onClick={() => onOpenCardDetail(card)} className="profile-v2-list-main"><strong>{card.title}</strong><span>{card.description}</span></button>
                  {!readOnly && <button type="button" onClick={() => handleStartCardEdit(card)} className="profile-v2-icon-button" aria-label={`编辑${card.title}`}><Edit3 size={17} /></button>}
                  <ChevronRight size={16} className="profile-v2-chevron" aria-hidden="true" />
                </li>)}</ul>
                {!allDisplayCards.length && <EmptyProfileState text="完成经历提取并确认后，能力卡会自动进入这里。" />}
              </>}
              {activeView === 'paths' && <>
                <div className="profile-v2-section-heading"><div><h2>正在探索的方向</h2><p>以任务证据记录探索进度，不把推荐等同于结论。</p></div><button type="button" onClick={() => onNavigate('career-explore')} className="profile-v2-text-button">探索新方向<ChevronRight size={16} /></button></div>
                {livePaths.map(path => <article key={path.id} className="profile-v2-path">
                  <div className="profile-v2-path-heading"><Compass size={22} /><h3>{path.title}</h3><span className="profile-v2-badge">{path.status}</span></div>
                  <p>{path.description}</p><p className="profile-v2-meta">{path.statusTag}</p>
                  <button type="button" onClick={() => onNavigate('stage2')} className="profile-v2-secondary">继续试路<ArrowRight size={16} /></button>
                </article>)}
                {!livePaths.length && <EmptyProfileState text="完成至少一个试路任务后，这里会形成真实方向记录。" />}
              </>}
              {activeView === 'reports' && <>
                <div className="profile-v2-section-heading"><div><h2>任务复盘</h2><p>从作答、证据到评价依据，回看每一次实践。</p></div><button type="button" onClick={() => setActiveArchive('reports')} className="profile-v2-text-button">查看全部<ChevronRight size={16} /></button></div>
                <ul className="profile-v2-list">{liveReports.slice(0, 3).map(report => <li key={report.id}>
                  <span className="profile-v2-list-icon"><FileText size={20} aria-hidden="true" /></span>
                  <button type="button" onClick={() => setActiveArchive('reports')} className="profile-v2-list-main"><strong>{report.title}</strong><span>{report.keyDiscovery}</span><span className="profile-v2-meta">{report.date} · 观察等级 {report.observedLevel}</span></button>
                  <ChevronRight size={16} className="profile-v2-chevron" aria-hidden="true" />
                </li>)}</ul>
                {!liveReports.length && <EmptyProfileState text="完成并提交试路任务后，复盘会自动保存在这里。" />}
              </>}
            </div>
          </section>

          <aside className="profile-v2-sidebar">
            <section aria-labelledby="growth-activity-title" className="profile-v2-activity">
              <div className="profile-v2-section-heading"><h2 id="growth-activity-title">最近成长记录</h2><Clock size={18} className="profile-v2-chevron" aria-hidden="true" /></div>
              {recentEvidence.length ? <ol>{recentEvidence.map(record => <li key={record.session_id}>
                <span className="profile-v2-timeline-dot" aria-hidden="true" />
                <div><p className="profile-v2-meta">{formatEvidenceDate(record.created_at)}</p><h3>完成 {record.task_id} 试路任务</h3><p>观察等级 {record.observed_evidence.observed_level || '证据不足'} · 已形成任务证据</p></div>
              </li>)}</ol> : <p className="profile-v2-sidebar-empty">还没有任务记录。完成一次试路任务后，时间与观察等级会保存在这里。</p>}
              {recentEvidence.length > 0 && <button type="button" onClick={() => setActiveArchive('reports')} className="profile-v2-text-button">查看任务证据<ChevronRight size={16} /></button>}
            </section>
            <section className="profile-v2-next" aria-labelledby="profile-next-title">
              <span className="profile-v2-eyebrow">下一步</span><h2 id="profile-next-title">让发现经得起验证</h2>
              <p>{recentEvidence[0]?.evaluation?.next_step || '尝试一次新的任务，看看已确认的能力能否在不同情境下发挥作用。'}</p>
              <button type="button" onClick={() => onNavigate('stage2')} className="profile-v2-text-button">选择试路任务<ArrowRight size={16} /></button>
            </section>
          </aside>
        </div>
        <footer className="profile-v2-footer"><span>档案版本 {profileVersion}{profileUpdatedAt ? ` · 更新于 ${formatProfileUpdatedAt(profileUpdatedAt)}` : ''}</span><span>能力判断基于现有证据，可继续补充与修正。</span></footer>
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

const EmptyProfileState: React.FC<{ text: string }> = ({ text }) => (
  <div className="profile-v2-empty">{text}</div>
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
