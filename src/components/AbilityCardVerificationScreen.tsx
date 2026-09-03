import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SkillCard } from '../types';
import { 
  Sparkles, 
  Check, 
  HelpCircle, 
  X, 
  Edit3, 
  RefreshCw, 
  ArrowRight, 
  CheckCircle2,
  Tag,
  Clock,
  ShieldCheck,
  SlidersHorizontal,
  Compass,
  AlertCircle,
  PlusCircle,
  RotateCw,
  Crosshair,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Layers } from 'lucide-react';
import { CandidateAbilityCard, getCandidateEvidenceLabel } from './CandidateAbilityCard';
import type { ApiExperienceSummary } from '../types/api';

interface AbilityCardVerificationScreenProps {
  initialCards: SkillCard[];
  initialExperience: ApiExperienceSummary | null;
  allAccumulatedCards: SkillCard[];
  onConfirmAndSaveToPool: (newCards: SkillCard[]) => Promise<void> | void;
  onWithdrawConfirmedCard: (cardId: string) => Promise<void> | void;
  onContinueSupplement: () => void;
  onStartCareerExplore: () => void;
  onModifyExperience: () => void;
  onRegenerate: () => void;
  storageNamespace?: 'demo' | 'use';
}

// 3 verification states per card
export type VerificationStatus = 'confirmed' | 'unsure' | 'rejected';

export const AbilityCardVerificationScreen: React.FC<AbilityCardVerificationScreenProps> = ({
  initialCards,
  initialExperience,
  allAccumulatedCards,
  onConfirmAndSaveToPool,
  onWithdrawConfirmedCard,
  onContinueSupplement,
  onStartCareerExplore,
  onModifyExperience,
  onRegenerate,
  storageNamespace = 'use',
}) => {
  // Mode: 'verify' (Image 1: 验证卡牌) or 'added_pool' (Image 2/3: 已加入能力库展示)
  const [viewMode, setViewMode] = useState<'verify' | 'added_pool'>('verify');

  // Only display candidate cards returned by the profile analysis service.
  const [cards, setCards] = useState<SkillCard[]>(() => initialCards.slice(0, 3));

  // State mapping for each card: 'confirmed' (符合经历) | 'unsure' (暂不确定) | 'rejected' (不属于我)
  const [cardStatuses, setCardStatuses] = useState<Record<string, VerificationStatus>>(() => {
    const init: Record<string, VerificationStatus> = {};
    cards.forEach((c) => {
      init[c.id] = 'confirmed';
    });
    return init;
  });

  // Track newly confirmed cards in this round
  const [confirmedThisRound, setConfirmedThisRound] = useState<SkillCard[]>([]);

  // Flipped card IDs for interactive 3D inspection in library view
  const [flippedCardIds, setFlippedCardIds] = useState<Record<string, boolean>>({});

  // Inline editing state
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [mergeSelection, setMergeSelection] = useState<string[]>([]);
  const [experienceCard, setExperienceCard] = useState<ApiExperienceSummary | null>(initialExperience);
  const [experienceStatus, setExperienceStatus] = useState<'confirmed' | 'rejected'>(initialExperience ? 'confirmed' : 'rejected');
  const [isEditingExperience, setIsEditingExperience] = useState(false);
  const [experienceSaved, setExperienceSaved] = useState(false);

  // Status handlers
  const handleSetStatus = (cardId: string, status: VerificationStatus) => {
    if (status === 'rejected') setMergeSelection(current => current.filter(id => id !== cardId));
    setCardStatuses(prev => ({
      ...prev,
      [cardId]: status
    }));
  };

  const handleStartEdit = (card: SkillCard) => {
    setEditingCardId(card.id);
    setEditTitle(card.title);
    setEditDesc(card.description);
  };

  const handleSaveEdit = (cardId: string) => {
    if (!editTitle.trim()) return;
    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        return {
          ...c,
          title: editTitle.trim(),
          description: editDesc.trim() || c.description,
        };
      }
      return c;
    }));
    setEditingCardId(null);
  };

  const handleToggleMergeSelection = (cardId: string) => {
    if (cardStatuses[cardId] === 'rejected') return;
    setMergeSelection(current => current.includes(cardId)
      ? current.filter(id => id !== cardId)
      : current.length < 2 ? [...current, cardId] : current);
  };

  const handleMergeSelected = () => {
    if (mergeSelection.length !== 2) return;
    const selectedCards = mergeSelection
      .filter(cardId => cardStatuses[cardId] !== 'rejected')
      .map(cardId => cards.find(card => card.id === cardId))
      .filter((card): card is SkillCard => Boolean(card));
    if (selectedCards.length !== 2) return;
    const [first, second] = selectedCards;
    const merged: SkillCard = {
      ...first,
      id: `${first.id}-merged-${second.id}`,
      title: `${first.title}与${second.title}`,
      description: `${first.description}；${second.description}`,
      detail: [first.detail, second.detail].filter(Boolean).join('；'),
      matchReason: [first.matchReason, second.matchReason].filter(Boolean).join('；'),
      sourceRefs: Array.from(new Set([...(first.sourceRefs || []), ...(second.sourceRefs || [])])),
    };
    setCards(current => [...current.filter(card => !mergeSelection.includes(card.id)), merged]);
    setCardStatuses(current => {
      const next = { ...current };
      mergeSelection.forEach(cardId => delete next[cardId]);
      next[merged.id] = 'confirmed';
      return next;
    });
    setMergeSelection([]);
    handleStartEdit(merged);
  };

  // Toggle card flip
  const handleToggleFlip = (cardId: string) => {
    setFlippedCardIds(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Submit confirmed cards & transition to 'added_pool' library view
  const handleConfirmAndAdd = async () => {
    const confirmed = cards.filter(c => cardStatuses[c.id] === 'confirmed');
    if (confirmed.length === 0) {
      alert('请至少保留 1 张符合你的能力卡。');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await onConfirmAndSaveToPool(confirmed);
      const experienceStorageKey = `before-choosing:confirmed-experience:${storageNamespace}`;
      if (experienceCard && experienceStatus === 'confirmed') {
        window.localStorage.setItem(experienceStorageKey, JSON.stringify(experienceCard));
        setExperienceSaved(true);
      } else {
        window.localStorage.removeItem(experienceStorageKey);
        setExperienceSaved(false);
      }
      try {
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
      setConfirmedThisRound(confirmed);
      setViewMode('added_pool');
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : '保存能力卡失败，请稍后重试。');
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger regenerate
  const handleTriggerRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      onRegenerate();
      setIsRegenerating(false);
    }, 600);
  };

  const handleWithdrawConfirmedCard = async (cardId: string) => {
    setSaveError(null);
    try {
      await onWithdrawConfirmedCard(cardId);
      setConfirmedThisRound(current => current.filter(card => card.id !== cardId));
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : '撤回能力卡失败，请稍后重试。');
    }
  };

  const confirmedCount = Object.values(cardStatuses).filter(s => s === 'confirmed').length;
  
  // Total cards in pool after this confirmation
  const totalPoolCards = (() => {
    const existing = allAccumulatedCards.filter(
      ac => !confirmedThisRound.some(nc => nc.id === ac.id)
    );
    return [...existing, ...confirmedThisRound];
  })();

  const totalCardCount = totalPoolCards.length > 0 ? totalPoolCards.length : (allAccumulatedCards.length + confirmedCount);

  // Candidate confirmation follows the Demo's collectible cards and collection bar.
  // Keep candidate controls and evidence ownership separate from the saved-card pool.
  if (viewMode === 'verify') {
    const isAllSelected = cards.length > 0 && confirmedCount === cards.length;
    return (
      <div id="ability-card-verification-screen" className="candidate-verification mx-auto w-full max-w-[1240px] px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-800 bg-stone-900 shadow-sm">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="flex-1 rounded-2xl border border-stone-200 bg-white px-5 py-4 text-center shadow-sm">
            <h2 className="font-serif text-base font-medium text-stone-900 sm:text-lg">结合你的经历，我发现了几项值得关注的能力线索。</h2>
            <p className="mt-1 text-xs text-stone-500">所有内容目前都是候选项。只有确认保存的卡片才能进入后续职业推荐。</p>
          </div>
        </div>

        {experienceCard && (
          <details className="mt-4 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-800">
            <summary className="cursor-pointer text-xs marker:text-emerald-600">
              <span className="mr-3 font-medium text-emerald-800">候选项目经历卡</span>
              <span className="font-serif">{experienceCard.title}</span>
              <span className="ml-3 text-stone-500">{experienceStatus === 'rejected' ? '已排除 · 可恢复' : '展开核对来源与关键行动'}</span>
            </summary>
            <div className="mt-3 border-t border-stone-100 pt-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-stone-500">来源：{experienceCard.source_refs.join('、') || '当前对话与材料'}</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsEditingExperience(value => !value)} className="rounded-full border border-stone-200 px-3 py-1.5 text-xs">{isEditingExperience ? '完成修改' : '修改'}</button>
                  <button type="button" onClick={() => setExperienceStatus(current => current === 'confirmed' ? 'rejected' : 'confirmed')} className="rounded-full border border-stone-200 px-3 py-1.5 text-xs">
                    {experienceStatus === 'confirmed' ? '删除候选' : '恢复候选'}
                  </button>
                </div>
              </div>
              {isEditingExperience ? (
                <div className="mt-4 grid gap-3">
                  <input
                    value={experienceCard.title}
                    onChange={event => setExperienceCard(current => current ? ({ ...current, title: event.target.value }) : current)}
                    className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-400"
                    aria-label="项目经历名称"
                  />
                  <textarea
                    value={experienceCard.actions.join('\n')}
                    onChange={event => setExperienceCard(current => current ? ({ ...current, actions: event.target.value.split('\n').filter(Boolean) }) : current)}
                    rows={3}
                    className="resize-none rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs leading-5 text-stone-700 outline-none focus:border-emerald-400"
                    aria-label="项目关键行动"
                  />
                  <input
                    value={experienceCard.result || ''}
                    onChange={event => setExperienceCard(current => current ? ({ ...current, result: event.target.value }) : current)}
                    className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 outline-none focus:border-emerald-400"
                    aria-label="项目结果"
                  />
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="font-serif text-base text-stone-950">{experienceCard.title}</p>
                    <p className="mt-2 text-xs leading-5 text-stone-600">{experienceCard.result || '材料中尚未明确项目结果'}</p>
                  </div>
                  <div className="rounded-2xl border border-stone-100 p-4">
                    <p className="text-[10px] font-medium text-stone-500">材料中的关键行动</p>
                    <ul className="mt-2 space-y-1.5 text-xs leading-5 text-stone-700">
                      {experienceCard.actions.map(action => <li key={action}>· {action}</li>)}
                    </ul>
                  </div>
                </div>
              )}

            </div>
          </details>
        )}

        <section className="mt-5" aria-label="本轮候选能力卡">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-3">
              <h3 className="font-serif text-sm font-semibold text-stone-800">本轮已提取能力卡片（{cards.length}）</h3>
              <button type="button" onClick={() => setCardStatuses(Object.fromEntries(cards.map(card => [card.id, isAllSelected ? 'unsure' : 'confirmed'])))} className="text-xs text-stone-500 underline underline-offset-2">{isAllSelected ? '取消全选' : '全选'}</button>
            </div>
            <button type="button" onClick={onModifyExperience} className="flex items-center gap-1 text-xs text-stone-600"><Edit3 className="h-3.5 w-3.5" />修改经历</button>
          </div>
          <div className="flex flex-wrap justify-center gap-5 py-1 sm:gap-6">
            {cards.map((card, index) => (
              <CandidateAbilityCard key={card.id} card={card} index={index}
                status={cardStatuses[card.id] || 'unsure'} evidenceLabel={getCandidateEvidenceLabel(card)}
                flipped={!!flippedCardIds[card.id]} editing={editingCardId === card.id}
                editTitle={editTitle} editDesc={editDesc} mergeSelected={mergeSelection.includes(card.id)}
                onStatus={status => handleSetStatus(card.id, status)} onFlip={() => handleToggleFlip(card.id)}
                onEdit={() => handleStartEdit(card)} onEditTitle={setEditTitle} onEditDesc={setEditDesc}
                onSave={() => handleSaveEdit(card.id)} onCancel={() => setEditingCardId(null)}
                onMerge={() => handleToggleMergeSelection(card.id)}
              />
            ))}
            {cards.length === 0 && <p className="py-12 text-sm text-stone-500">还没有候选能力卡，请返回经历对话补充材料。</p>}
          </div>
          {mergeSelection.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-stone-600">
              <span>已选择 {mergeSelection.length}/2 张候选能力卡</span>
              <button type="button" onClick={handleMergeSelected} disabled={mergeSelection.length !== 2} className="rounded-full border border-stone-200 bg-white px-3 py-2 disabled:opacity-40">合并所选卡片</button>
            </div>
          )}
        </section>

        <section aria-label="收录能力卡" className="mt-6 flex flex-col justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-100"><Layers className="h-4 w-4 text-stone-700" /></div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-stone-900">收录至个人长期能力卡库</h3>
              <p className="mt-1 text-xs text-stone-500">已选 <strong className="text-stone-900">{confirmedCount}</strong> / {cards.length} 张能力卡 · 待确认与排除的卡片不会收录</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handleTriggerRegenerate} disabled={isRegenerating || isSaving} className="flex items-center gap-1 rounded-full border border-stone-200 px-3 py-2.5 text-xs text-stone-700 disabled:opacity-40"><RefreshCw className="h-3.5 w-3.5" />{isRegenerating ? '整理中…' : '重新整理'}</button>
            <button type="button" id="btn-save-cards-to-pool" onClick={handleConfirmAndAdd} disabled={isSaving || confirmedCount === 0 || !!editingCardId || isEditingExperience} className="flex items-center justify-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-xs font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40">
              <Layers className="h-3.5 w-3.5 text-stone-300" />{isSaving ? '保存中…' : `收录所选能力（${confirmedCount} 张）`}<ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </section>
        {(editingCardId || isEditingExperience) && <p className="mt-3 text-center text-xs text-stone-500">请先完成当前修改，再收录能力卡。</p>}
        {saveError && <p role="alert" className="mt-3 text-center text-xs text-rose-700">{saveError}</p>}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ADDED TO ABILITY LIBRARY VIEW (Strictly matching Image 2 & Image 3)
  // =========================================================================
  const isSufficientForCareer = totalCardCount >= 4;

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-between max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative">
      
      {/* Background Soft Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-50/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-stone-100/60 blur-3xl" />
      </div>

      <div className="space-y-6 sm:space-y-8 relative z-10">
        
        {/* 
          ======================================================================
          1. TOP AGENT SPEECH BANNER (Image 2/3: 很好，这一轮我已经从你的经历中确认了 X 张能力卡...)
          ======================================================================
        */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="craft-card w-full rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-white/85 backdrop-blur-xl border border-stone-200/50 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left"
        >
          {/* Agent Avatar Circle */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0 border border-stone-200/60">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
            </div>
          </div>

          {/* Agent Dialogue */}
          <div className="space-y-1.5 flex-1">
            <h2 className="text-base sm:text-lg font-normal text-stone-900 font-serif craft-serif tracking-tight">
              本轮材料确认了 <span className="text-amber-800 font-bold font-mono">{confirmedThisRound.length || confirmedCount}</span> 张能力卡。
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              只有你确认过的内容才会保存。后面的小任务会帮你看看这些优势如何用出来。
            </p>
          </div>
        </motion.div>

        {/* 
          ======================================================================
          2. MIDDLE: ACCUMULATED CARDS IN POOL (Image 2: 2 cards; Image 3: 5 cards)
          ======================================================================
        */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full py-2"
        >
          {experienceCard && experienceSaved && (
            <div className="mx-auto mb-5 flex max-w-3xl flex-col justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-serif text-sm text-stone-950">{experienceCard.title}</p>
                <p className="mt-1 text-[11px] text-stone-600">已确认的项目经历卡</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.localStorage.removeItem(`before-choosing:confirmed-experience:${storageNamespace}`);
                  setExperienceSaved(false);
                }}
                className="craft-btn-secondary px-3 py-2 text-[11px]"
              >
                撤回项目经历卡
              </button>
            </div>
          )}

          {/* Card Cards Grid: Flex or Grid depending on card count */}
          <div className={`grid gap-4 sm:gap-5 justify-center max-w-4xl mx-auto ${
            totalPoolCards.length <= 2 
              ? 'grid-cols-1 sm:grid-cols-2 max-w-lg' 
              : totalPoolCards.length === 3 
              ? 'grid-cols-1 sm:grid-cols-3 max-w-3xl' 
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
          }`}>
            {totalPoolCards.map((card, idx) => {
              const isFlipped = !!flippedCardIds[card.id];

              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => handleToggleFlip(card.id)}
                  className="group cursor-pointer perspective-1000 select-none"
                  title="点击翻转卡牌查看详情"
                >
                  <div className={`craft-card relative min-h-[220px] sm:min-h-[240px] rounded-2xl sm:rounded-3xl p-4 flex flex-col justify-between border transition-all duration-300 text-center ${
                    isFlipped
                      ? 'bg-stone-900 text-white border-stone-800 shadow-md'
                      : 'bg-white/95 hover:bg-white text-stone-800 border-stone-200/70 shadow-xs hover:shadow-md'
                  }`}>
                    {confirmedThisRound.some(item => item.id === card.id) && (
                      <button
                        type="button"
                        onClick={event => {
                          event.stopPropagation();
                          void handleWithdrawConfirmedCard(card.id);
                        }}
                        className="absolute right-3 top-3 z-10 rounded-full border border-stone-200 bg-white/90 px-2 py-1 text-[9px] text-stone-600 hover:text-rose-700"
                      >
                        撤回
                      </button>
                    )}
                    
                    {/* Front View */}
                    {!isFlipped ? (
                      <div className="flex flex-col justify-between h-full space-y-3">
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                            {card.category}
                          </span>
                          <h4 className="text-sm sm:text-base font-normal text-stone-900 font-serif craft-serif pt-1">
                            {card.title}
                          </h4>
                          <p className="text-[11px] text-stone-600 line-clamp-3 leading-relaxed font-normal pt-1">
                            {card.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-stone-100 space-y-1">
                          <p className="text-[10px] text-stone-400">
                            点击后翻转查看详情
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Back View (Detailed Information) */
                      <div className="flex flex-col justify-between h-full text-left space-y-2 p-1">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
                            <span className="text-[10px] font-mono text-amber-300 font-medium">这张卡怎么来的</span>
                            <RotateCw className="w-3 h-3 text-stone-400 group-hover:rotate-180 transition-transform" />
                          </div>
                          <p className="text-xs text-stone-300 leading-relaxed font-normal">
                            {card.detail}
                          </p>
                          {card.workplaceApplication && (
                            <p className="text-[10px] text-amber-200/90 leading-tight">
                              可以用在哪：{card.workplaceApplication}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 text-center text-[10px] text-stone-400 border-t border-stone-800">
                          再次点击翻回正面
                        </div>
                      </div>
                    )}

                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>

      {/* 
        ======================================================================
        3. BOTTOM ACTIONS & DESCRIPTIONS (Strictly matching Image 2 & Image 3)
        ======================================================================
      */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="pt-6 pb-2 flex flex-col items-center justify-center gap-3.5 relative z-10 text-center"
      >
        {/* Helper text based on card count */}
        <div className="space-y-0.5">
          <p className="text-xs sm:text-sm font-normal text-stone-800">
            现在共有 <span className="font-mono text-amber-800 font-bold text-sm sm:text-base">{totalCardCount}</span> 张能力卡
          </p>
          <p className="text-[11px] sm:text-xs text-stone-500 font-normal">
            {isSufficientForCareer 
                ? '可以带着这些卡去看看方向了'
              : '再补充一段经历，建议会更贴近你'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
          {!isSufficientForCareer ? (
            <>
              {/* Primary: 继续补充经历 */}
              <button
                onClick={onContinueSupplement}
                className="craft-btn-black w-full py-3 px-6 text-sm text-center flex items-center justify-center gap-2"
                id="btn-continue-supplement"
              >
                <PlusCircle className="w-4 h-4 text-stone-200" />
                <span>继续补充材料</span>
              </button>

              {/* Secondary: 开始职业探索 */}
              <button
                onClick={onStartCareerExplore}
                className="craft-btn-secondary w-full py-2.5 px-6 text-xs sm:text-sm text-center"
                id="btn-start-career-explore"
              >
                看看职业方向
              </button>
            </>
          ) : (
            <>
              {/* Primary: 开始职业探索 (Emphasized in Image 3) */}
              <button
                onClick={onStartCareerExplore}
                className="craft-btn-black w-full py-3 px-6 text-sm sm:text-base text-center flex items-center justify-center gap-2"
                id="btn-start-career-explore"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>看看职业方向</span>
              </button>

              {/* Secondary: 继续补充经历 */}
              <button
                onClick={onContinueSupplement}
                className="craft-btn-secondary w-full py-2.5 px-6 text-xs sm:text-sm text-center"
                id="btn-continue-supplement"
              >
                继续补充材料
              </button>
            </>
          )}
        </div>

      </motion.div>

    </div>
  );
};
