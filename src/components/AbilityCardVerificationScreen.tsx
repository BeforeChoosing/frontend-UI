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
    setMergeSelection(current => current.includes(cardId)
      ? current.filter(id => id !== cardId)
      : current.length < 2 ? [...current, cardId] : current);
  };

  const handleMergeSelected = () => {
    if (mergeSelection.length !== 2) return;
    const selectedCards = mergeSelection
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

  // Derive Evidence Type tag based on card category/attributes
  const getEvidenceTypeTag = (card: SkillCard, idx: number) => {
    if (card.matchReason?.includes('事实') || idx === 0) return '来自明确事实';
    if (card.matchReason?.includes('行动') || idx === 1) return '来自你做过的事';
    return '这是推测，待你确认';
  };

  // =========================================================================
  // VIEW 1: VERIFICATION SCREEN (Strictly matching Low-Fi Wireframe Image 1)
  // =========================================================================
  if (viewMode === 'verify') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col justify-between max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative">
        
        {/* Background Soft Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-50/40 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-stone-100/60 blur-3xl" />
        </div>

        <div className="space-y-5 sm:space-y-6 relative z-10">
          
          {/* 候选能力线索说明 */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="craft-card w-full rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-white/85 backdrop-blur-xl border border-stone-200/50 flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-center sm:text-left"
          >
            {/* Agent Avatar Circle */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0 border border-stone-200/60 group-hover:scale-105 transition-transform relative">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center shadow-xs">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            {/* Agent Speech Text */}
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="craft-chip-yellow text-[10px] font-mono font-medium px-2 py-0.5 rounded-full">
                  01 · 候选确认
                </span>
                <span className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-stone-200/60">
                  根据已上传材料整理
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-normal text-stone-900 font-serif craft-serif tracking-tight">
                以下是根据材料提炼的候选项目经历和能力线索，请逐项核对。
              </h2>
            </div>
          </motion.div>

          {/* Subtitle instruction */}
          <p className="text-center text-[11px] sm:text-xs text-stone-500 font-normal">
            所有内容目前都是候选项。只有确认保存的卡片才能进入后续职业推荐。
          </p>

          {experienceCard && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: experienceStatus === 'rejected' ? 0.55 : 1, y: 0 }}
              className="craft-card rounded-3xl border border-stone-200/70 bg-white/92 p-5 sm:p-6"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-[10px] text-emerald-800">候选项目经历卡</span>
                  <p className="mt-2 text-[11px] text-stone-500">来源：{experienceCard.source_refs.join('、') || '已上传材料'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsEditingExperience(value => !value)} className="craft-btn-secondary px-3 py-2 text-[11px]">修改</button>
                  <button
                    onClick={() => setExperienceStatus(current => current === 'confirmed' ? 'rejected' : 'confirmed')}
                    className={experienceStatus === 'confirmed' ? 'craft-btn-secondary px-3 py-2 text-[11px]' : 'craft-btn-black px-3 py-2 text-[11px]'}
                  >
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
            </motion.section>
          )}

          {/* 
            ======================================================================
            2. MIDDLE: 3 ABILITY CARDS (Image 1 Wireframe Layout)
            ======================================================================
          */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 w-full">
            {cards.map((card, idx) => {
              const status = cardStatuses[card.id] || 'confirmed';
              const isEditing = editingCardId === card.id;

              return (
                <div key={card.id} className="flex flex-col gap-2.5">
                  
                  {/* The Card Board */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ 
                      opacity: status === 'rejected' ? 0.45 : status === 'unsure' ? 0.8 : 1,
                      y: status === 'confirmed' ? -4 : 0,
                    }}
                    className={`min-h-[290px] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between border transition-all duration-200 ${
                      status === 'confirmed'
                        ? 'craft-card bg-white/95 border-stone-300/80 shadow-md ring-1 ring-amber-400/20'
                        : status === 'unsure'
                        ? 'craft-card bg-stone-50/90 border-stone-200/80 shadow-2xs'
                        : 'bg-stone-100/70 border-stone-200/60 grayscale opacity-45'
                    }`}
                  >
                    {/* Upper Area: Title & Summary */}
                    <div className="space-y-3">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full text-sm font-medium text-stone-900 bg-white rounded-xl px-2.5 py-1.5 outline-none border border-stone-300 shadow-inner"
                            placeholder="能力名称"
                            autoFocus
                          />
                          <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            rows={3}
                            className="w-full text-xs text-stone-700 bg-white rounded-xl p-2 outline-none resize-none border border-stone-300 shadow-inner"
                            placeholder="能力一句话描述"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setEditingCardId(null)}
                              className="text-[10px] px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer font-medium"
                            >
                              取消
                            </button>
                            <button
                              onClick={() => handleSaveEdit(card.id)}
                              className="text-[10px] px-3 py-1 rounded-full bg-stone-900 text-white font-medium cursor-pointer shadow-xs"
                            >
                              保存
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 text-center">
                          {/* Title: 能力名称 */}
                          <div className="flex items-center justify-center gap-1.5">
                            <h3 className="text-base sm:text-lg font-normal text-stone-900 font-serif craft-serif">
                              {card.title}
                            </h3>
                            <button
                              onClick={() => handleStartEdit(card)}
                              className="text-stone-400 hover:text-stone-800 transition cursor-pointer p-0.5"
                              title="编辑能力内容"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Subhead: 【能力描述】一句话概括 */}
                          <p className="text-xs text-stone-600 font-normal leading-relaxed px-1">
                            {card.description}
                          </p>
                        </div>
                      )}

                      {/* Body List Lines: 卡牌上的内容 */}
                      {!isEditing && (
                        <div className="pt-2 text-center space-y-1 text-xs text-stone-500 leading-relaxed font-normal">
                          <p>• {card.detail || '在复杂情境中快速定位核心矛盾并组织资源'}</p>
                          <p>• {card.workplaceApplication ? `职场落地：${card.workplaceApplication}` : '具备敏捷试错与闭环度量意识'}</p>
                          <p>• 这张卡怎么来的：{card.matchReason || '来自材料中的行动和结果'}</p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Badge: 证据类型 */}
                    <div className="pt-4 flex justify-center">
                      <span className="py-1 px-3 rounded-full bg-stone-100 text-stone-700 text-[10px] font-mono border border-stone-200/60">
                        {getEvidenceTypeTag(card, idx)}
                      </span>
                    </div>
                  </motion.div>

                  {/* 3 Status Pill Selection Buttons below each card (符合经历 | 暂不确定 | 不属于我) */}
                  <div className="grid grid-cols-3 gap-1.5 px-0.5">
                    {/* 符合经历 */}
                    <button
                      onClick={() => handleSetStatus(card.id, 'confirmed')}
                      className={`py-1.5 px-1 rounded-full text-xs font-normal transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer border ${
                        status === 'confirmed'
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                          : 'bg-white/80 hover:bg-white text-stone-700 border-stone-200/70'
                      }`}
                    >
                      <Check className="w-3 h-3 shrink-0" />
                      <span>这像我</span>
                    </button>

                    {/* 暂不确定 */}
                    <button
                      onClick={() => handleSetStatus(card.id, 'unsure')}
                      className={`py-1.5 px-1 rounded-full text-xs font-normal transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer border ${
                        status === 'unsure'
                          ? 'bg-stone-800 text-amber-200 border-stone-800 shadow-xs'
                          : 'bg-white/80 hover:bg-white text-stone-600 border-stone-200/70'
                      }`}
                    >
                      <HelpCircle className="w-3 h-3 shrink-0" />
                      <span>还不确定</span>
                    </button>

                    {/* 不属于我 */}
                    <button
                      onClick={() => handleSetStatus(card.id, 'rejected')}
                      className={`py-1.5 px-1 rounded-full text-xs font-normal transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer border ${
                        status === 'rejected'
                          ? 'bg-stone-600 text-stone-200 border-stone-600 shadow-xs'
                          : 'bg-white/80 hover:bg-white text-stone-500 border-stone-200/70'
                      }`}
                    >
                      <X className="w-3 h-3 shrink-0" />
                      <span>不像我</span>
                    </button>
                  </div>

                  {status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => handleToggleMergeSelection(card.id)}
                      className={`mx-auto text-[10px] underline underline-offset-2 ${mergeSelection.includes(card.id) ? 'font-medium text-amber-800' : 'text-stone-400'}`}
                    >
                      {mergeSelection.includes(card.id) ? '已选择合并' : '选择合并'}
                    </button>
                  )}

                </div>
              );
            })}
          </div>

        </div>

        {/* 
          ======================================================================
          3. BOTTOM SUMMARY & 3 ACTION BUTTONS (修改经历 | 重新生成 | 加入能力库)
          ======================================================================
        */}
        <div className="pt-6 pb-2 space-y-3 relative z-10">
          {/* Summary Text: 已确认 X/3 张卡牌 */}
          <div className="text-center text-xs text-stone-500 font-normal">
            已选择 <strong className="text-stone-900 font-bold font-mono">{confirmedCount}</strong>/{cards.length} 张卡
          </div>

          {mergeSelection.length > 0 && (
            <div className="flex items-center justify-center gap-3 text-xs text-stone-600">
              <span>已选择 {mergeSelection.length}/2 张候选能力卡</span>
              <button
                type="button"
                onClick={handleMergeSelected}
                disabled={mergeSelection.length !== 2}
                className="craft-btn-secondary px-3 py-1.5 text-[11px] disabled:opacity-40"
              >
                合并所选卡片
              </button>
            </div>
          )}

          {/* 3 Buttons in a Row */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto">
            {/* 修改经历 */}
            <button
              onClick={onModifyExperience}
              className="craft-btn-secondary flex-1 py-2.5 px-4 text-xs sm:text-sm text-center"
            >
              返回材料
            </button>

            {/* 重新生成 */}
            <button
              onClick={handleTriggerRegenerate}
              disabled={isRegenerating}
              className="craft-btn-secondary flex-1 py-2.5 px-4 text-xs sm:text-sm flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-stone-900' : 'text-stone-600'}`} />
              <span>{isRegenerating ? '整理中…' : '重新整理'}</span>
            </button>

            {/* 加入能力库 */}
            <button
              onClick={handleConfirmAndAdd}
              disabled={isSaving}
              className="craft-btn-black flex-1 py-2.5 px-4 text-xs sm:text-sm text-center disabled:opacity-60 disabled:cursor-wait"
            >
              {isSaving ? '保存中…' : '保存这些卡'}
            </button>
          </div>
          {saveError && (
            <p role="alert" className="text-center text-xs text-rose-700">
              {saveError}
            </p>
          )}
        </div>

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
