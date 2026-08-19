import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  Plus, 
  X, 
  Compass, 
  Zap, 
  ChevronRight, 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SkillCard } from '../types';
import { createCareerRecommendation } from '../api/career';
import type { ApiCareerRecommendation } from '../types/api';
import type { TrialTaskId } from '../types/api';

interface CareerExploreScreenProps {
  unlockedCards?: SkillCard[];
  confirmedCards?: SkillCard[];
  onStartStageTwo: (taskId: TrialTaskId) => void;
  onOpenWikiModal: () => void;
  onOpenCardDetail: (card: SkillCard) => void;
  onSlotsChange?: (slots: (SkillCard | null)[]) => void;
}

export const CareerExploreScreen: React.FC<CareerExploreScreenProps> = ({
  confirmedCards = [],
  onStartStageTwo,
  onOpenWikiModal,
  onOpenCardDetail,
  onSlotsChange,
}) => {
  // 4 Slot State - Starts empty as requested
  const [deckSlots, setDeckSlots] = useState<(SkillCard | null)[]>([
    null,
    null,
    null,
    null
  ]);

  // Sort & Filter state for Hand Cards
  const [sortMode, setSortMode] = useState<'confidence' | 'category' | 'time'>('confidence');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState<number | null>(null);
  const [showExploreResultModal, setShowExploreResultModal] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<ApiCareerRecommendation | null>(null);
  const [recommendationStatus, setRecommendationStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  const isCardInDeck = (cardId: string) => deckSlots.some(s => s?.id === cardId);
  const equippedCount = deckSlots.filter(Boolean).length;

  // Processed Hand Cards
  const processedHandCards = useMemo(() => {
    const list = confirmedCards.map(card => ({ ...card }));
    if (sortMode === 'category') {
      list.sort((a, b) => a.category.localeCompare(b.category, 'zh-Hans-CN'));
    } else if (sortMode === 'time') {
      // The profile API does not expose a user-facing chronology label yet;
      // preserve confirmation order instead of inventing dates.
    }
    return list;
  }, [confirmedCards, sortMode]);

  // Click card to play (slides smoothly into first empty slot)
  const handleCardClick = (card: SkillCard) => {
    if (isCardInDeck(card.id)) {
      // Remove from slot
      const next = deckSlots.map(s => s?.id === card.id ? null : s);
      setDeckSlots(next);
      if (onSlotsChange) onSlotsChange(next);
    } else {
      // Equip into first empty slot
      const emptyIdx = deckSlots.findIndex(s => s === null);
      const next = [...deckSlots];
      if (emptyIdx !== -1) {
        next[emptyIdx] = card;
      } else {
        next[3] = card;
      }
      setDeckSlots(next);
      if (onSlotsChange) onSlotsChange(next);
    }
  };

  // Drag and drop handler
  const handleDropCardIntoSlot = (cardId: string, targetSlotIndex: number) => {
    const cardToSlot = confirmedCards.find(c => c.id === cardId);
    if (!cardToSlot) return;

    setDeckSlots(prev => {
      const next = [...prev];
      const existingIdx = next.findIndex(s => s?.id === cardId);
      if (existingIdx !== -1) {
        next[existingIdx] = null;
      }
      next[targetSlotIndex] = cardToSlot;
      if (onSlotsChange) onSlotsChange(next);
      return next;
    });
  };

  const handleRemoveSlot = (slotIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeckSlots(prev => {
      const next = [...prev];
      next[slotIndex] = null;
      if (onSlotsChange) onSlotsChange(next);
      return next;
    });
  };

  // Action: 一键装配
  const handleFastEquip = () => {
    const next: (SkillCard | null)[] = confirmedCards.slice(0, 4);
    while (next.length < 4) next.push(null);
    setDeckSlots(next);
    if (onSlotsChange) onSlotsChange(next);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.4 }
      });
    } catch {
      // ignore
    }
  };

  // Action: 清空槽位
  const handleClearSlots = () => {
    const next = [null, null, null, null];
    setDeckSlots(next);
    if (onSlotsChange) onSlotsChange(next);
    setShowExploreResultModal(false);
    setRecommendation(null);
    setRecommendationStatus('idle');
    setRecommendationError(null);
  };

  // Action: 出牌探索路径 -> 通过后端检索本地岗位知识并调用 Qwen
  const handleStartExplore = async () => {
    const selectedCardIds = deckSlots.filter((card): card is SkillCard => Boolean(card)).map(card => card.id);
    if (selectedCardIds.length === 0) return;
    setRecommendationStatus('loading');
    setRecommendationError(null);
    setRecommendation(null);
    setShowExploreResultModal(true);
    try {
      const nextRecommendation = await createCareerRecommendation(selectedCardIds);
      setRecommendation(nextRecommendation);
      confetti({
        particleCount: 55,
        spread: 75,
        origin: { y: 0.45 }
      });
      setRecommendationStatus('idle');
    } catch (cause) {
      setRecommendationStatus('error');
      setRecommendationError(cause instanceof Error ? cause.message : '职业推演失败，请稍后重试。');
    }
  };

  // Color mapper helper for slot indicators
  const getCategoryColor = (category: string) => {
    switch (category) {
      case '洞察分析': return { dot: 'bg-emerald-500', bar: 'bg-emerald-500', tag: 'bg-emerald-50 text-emerald-800' };
      case '数据驱动': return { dot: 'bg-blue-500', bar: 'bg-blue-500', tag: 'bg-blue-50 text-blue-800' };
      case '产品策略': return { dot: 'bg-amber-500', bar: 'bg-amber-500', tag: 'bg-amber-50 text-amber-800' };
      case '交互体验': return { dot: 'bg-rose-500', bar: 'bg-rose-500', tag: 'bg-rose-50 text-rose-800' };
      case '技术落地': return { dot: 'bg-purple-500', bar: 'bg-purple-500', tag: 'bg-purple-50 text-purple-800' };
      default: return { dot: 'bg-stone-500', bar: 'bg-stone-500', tag: 'bg-stone-50 text-stone-800' };
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] overflow-x-hidden p-3 sm:p-5 flex flex-col justify-between relative transition-colors duration-500">
      
      {/* Background Soft Glow & Confetti Dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-12 left-1/4 w-3 h-1 bg-amber-400/40 rounded-full rotate-45 animate-pulse" />
        <div className="absolute top-24 right-1/3 w-2.5 h-1.5 bg-rose-400/40 rounded-full -rotate-12 animate-pulse" />
        <div className="absolute top-1/2 left-12 w-3 h-1 bg-emerald-400/40 rounded-full rotate-12" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-indigo-400/30 rounded-full" />
      </div>

      {/* 当前阶段说明与岗位资料入口 */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-xl border border-stone-200/70 shrink-0 relative z-20 shadow-2xs">
        <div 
        className="flex items-center gap-3 min-w-0"
        >
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="bg-amber-100 text-amber-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
              阶段 02 · 职业路径推演
            </span>
            <span className="text-xs text-stone-500 hidden sm:inline font-normal">
              基于已确认能力卡形成下一步验证建议
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="text-xs font-normal text-stone-700 bg-stone-100/90 px-3 py-1 rounded-full border border-stone-200/50">
            已装配 <span className="text-amber-800 font-mono font-bold">{equippedCount}/4</span>
          </div>

          <button
            onClick={onOpenWikiModal}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 bg-indigo-50 hover:bg-indigo-100/80 px-3.5 py-1 rounded-full border border-indigo-200/70 transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>岗位资料库</span>
          </button>
        </div>
      </div>

      {/* 
        ========================================================================
        MIDDLE: 4 SLOTS + ACTION BUTTONS
        ========================================================================
      */}
      <div className={`flex-1 min-h-0 flex flex-col justify-center max-w-5xl mx-auto w-full relative z-10 py-3 sm:py-5 transition-all duration-300 ${
        showExploreResultModal ? 'lg:pr-[460px]' : ''
      }`}>
        
        <div className="text-center mb-3">
          <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight font-serif craft-serif">
            核心能力组合矩阵
          </h2>
        </div>

        {/* 4 SLOTS (SLOT 01 ~ SLOT 04) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5 w-full max-w-4xl mx-auto items-center">
          {deckSlots.map((slotCard, idx) => {
            const isDragOver = dragOverSlotIndex === idx;
            const categoryColors = slotCard ? getCategoryColor(slotCard.category) : null;

            return (
              <div
                key={`matrix-slot-${idx}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverSlotIndex(idx);
                }}
                onDragLeave={() => {
                  if (dragOverSlotIndex === idx) setDragOverSlotIndex(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const cardId = e.dataTransfer.getData('text/card-id');
                  if (cardId) {
                    handleDropCardIntoSlot(cardId, idx);
                  }
                  setDragOverSlotIndex(null);
                }}
                className="w-full aspect-[2.3/3.1] min-h-[155px] max-h-[195px] relative flex items-center justify-center"
              >
                <AnimatePresence mode="popLayout">
                  {slotCard ? (
                    /* POPULATED SLOT */
                    <motion.div
                      key={`matrix-card-${slotCard.id}`}
                      initial={{ scale: 0.85, opacity: 0, y: 15 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.85, opacity: 0, y: -15 }}
                      className="craft-card w-full h-full rounded-2xl sm:rounded-3xl bg-white p-3.5 flex flex-col justify-between relative border border-stone-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden cursor-pointer group"
                      onClick={() => onOpenCardDetail(slotCard)}
                    >
                      {/* Top status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${categoryColors?.dot || 'bg-stone-500'}`} />
                          <span className="text-[10px] font-bold text-stone-700">
                            {slotCard.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="bg-amber-100/90 text-amber-900 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded">
                            槽位 0{idx + 1}
                          </span>
                          <button
                            onClick={(e) => handleRemoveSlot(idx, e)}
                            className="w-4 h-4 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
                            title="移回手牌"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="my-auto py-1">
                        <h4 className="font-bold text-stone-900 text-xs sm:text-sm leading-snug line-clamp-2">
                          {slotCard.title}
                        </h4>
                        <p className="text-[10px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                          {slotCard.description}
                        </p>
                      </div>

                      {/* Bottom score & detail */}
                      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-stone-100">
                        <div className="flex items-center gap-1 text-stone-400 font-mono">
                          <span className="flex gap-0.5">
                            <span className={`w-1.5 h-1 rounded-sm ${categoryColors?.bar || 'bg-stone-400'}`} />
                            <span className={`w-1.5 h-1 rounded-sm ${categoryColors?.bar || 'bg-stone-400'}`} />
                            <span className={`w-1.5 h-1 rounded-sm ${categoryColors?.bar || 'bg-stone-400'}`} />
                          </span>
                          <span className="font-bold text-stone-700">
                            已确认
                          </span>
                        </div>

                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCardDetail(slotCard);
                          }}
                          className="text-stone-400 hover:text-stone-800 text-[10px] cursor-pointer"
                        >
                          详情
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    /* EMPTY SLOT WIREFRAME */
                    <motion.div
                      key={`matrix-empty-${idx}`}
                      className={`w-full h-full rounded-2xl sm:rounded-3xl border border-dashed transition-all flex flex-col items-center justify-center p-3 relative ${
                        isDragOver
                          ? 'border-stone-900 bg-amber-50/70 scale-102'
                          : 'border-stone-300/80 hover:border-stone-400 bg-white/50 backdrop-blur-sm'
                      }`}
                    >
                      {/* Top slot badge */}
                      <span className="absolute top-2.5 left-2.5 text-[9px] font-mono text-stone-400">
                        槽位 0{idx + 1}
                      </span>

                      <div className="flex flex-col items-center text-center mt-2">
                        <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-1 border border-stone-200/50">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-medium text-stone-600">
                          待装配能力
                        </span>
                        <span className="text-[10px] text-stone-400 mt-0.5">
                          拖入或点击卡牌
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* CENTER ACTION BUTTONS */}
        <div className="flex items-center justify-center gap-3 pt-3.5 sm:pt-4">
          <button
            onClick={handleStartExplore}
            disabled={equippedCount === 0 || recommendationStatus === 'loading'}
            className={`craft-btn-black px-6 py-2.5 text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                equippedCount === 0 || recommendationStatus === 'loading'
                ? 'opacity-40 pointer-events-none'
                : ''
            }`}
            id="btn-deduce-career"
          >
            <Compass className="w-4 h-4 text-stone-200" />
            <span>{recommendationStatus === 'loading' ? '正在推演…' : '出牌探索路径'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleFastEquip}
            disabled={confirmedCards.length === 0}
            className="craft-btn-secondary px-5 py-2 text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>一键装配</span>
          </button>

          {equippedCount > 0 && (
            <button
              onClick={handleClearSlots}
              className="px-3.5 py-2 rounded-full bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 text-xs transition-all flex items-center gap-1 cursor-pointer border border-stone-200 shadow-2xs"
              title="清空槽位"
            >
              <RotateCcw className="w-3 h-3" />
              <span>清空</span>
            </button>
          )}
        </div>

      </div>

      {/* 
        ========================================================================
        BOTTOM: 我的手牌库
        ========================================================================
      */}
      <div className={`w-full max-w-5xl mx-auto shrink-0 pt-1 pb-1 relative z-20 transition-all duration-300 ${
        showExploreResultModal ? 'lg:pr-[460px]' : ''
      }`}>
        
        {/* Hand Cards Header & Filter Tabs */}
        <div className="flex items-center justify-between px-2 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-stone-900 tracking-tight font-serif craft-serif">
              我的手牌库
            </span>
            <span className="text-[10px] text-stone-500 hidden sm:inline">
              拖拽或点击卡牌自动出牌滑入上方槽位
            </span>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1 bg-white/90 p-0.5 rounded-full shadow-2xs border border-stone-200/60">
            <button
              onClick={() => setSortMode('category')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer ${
                sortMode === 'category' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-black'
              }`}
            >
              类别
            </button>
            <button
              onClick={() => setSortMode('time')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer ${
                sortMode === 'time' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-black'
              }`}
            >
              时间
            </button>
            <button
              onClick={() => setSortMode('confidence')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                sortMode === 'confidence' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-black'
              }`}
            >
              {sortMode === 'confidence' && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />}
              <span>可信度</span>
            </button>
          </div>
        </div>

        {/* Fanned-out / Overlapping Hand Cards Deck */}
        <div className="w-full overflow-x-auto pb-2 pt-2 px-2 scrollbar-none">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-max justify-start sm:justify-center">
            {processedHandCards.length === 0 ? (
              <div className="w-full min-w-[280px] rounded-2xl border border-dashed border-stone-300 bg-white/60 px-5 py-6 text-center">
                <p className="text-sm font-semibold text-stone-700">还没有已确认的能力卡</p>
                <p className="mt-1 text-xs text-stone-500">先完成经历提炼并确认能力卡，再开始职业推演。</p>
              </div>
            ) : processedHandCards.map((card) => {
              const inDeck = isCardInDeck(card.id);
              const colors = getCategoryColor(card.category);

              return (
                <motion.div
                  key={card.id}
                  layout
                  onMouseEnter={() => setHoveredCardId(card.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  whileHover={!inDeck ? { y: -8, scale: 1.02, zIndex: 30 } : undefined}
                  whileTap={!inDeck ? { scale: 0.97 } : undefined}
                  onClick={() => handleCardClick(card)}
                  draggable={!inDeck}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/card-id', card.id);
                  }}
                  className={`craft-card w-[122px] sm:w-[136px] h-[134px] rounded-2xl p-2.5 select-none flex flex-col justify-between relative transition-all duration-200 cursor-pointer ${
                    inDeck
                      ? 'bg-stone-100/60 opacity-40 grayscale cursor-default shadow-none border border-stone-200/50'
                      : 'bg-white hover:bg-white border border-stone-200/80 shadow-2xs hover:shadow-md cursor-grab active:cursor-grabbing'
                  }`}
                >
                  {/* Top category & score */}
                  <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      <span className="text-stone-600 font-bold truncate max-w-[55px]">{card.category}</span>
                    </div>

                    <span className="text-stone-400 font-mono text-[9px]">
                      已确认
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="my-auto py-0.5">
                    <h5 className="font-bold text-stone-900 text-xs leading-snug line-clamp-2">
                      {card.title}
                    </h5>
                    <p className="text-[9px] text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  {/* Bottom detail action */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCardDetail(card);
                    }}
                    className="flex items-center justify-between text-[9px] text-stone-400 hover:text-stone-800 pt-1 border-t border-stone-100"
                  >
                    <div className="flex items-center gap-0.5">
                      <span className={`w-1 h-1 rounded-full ${colors.dot}`} />
                      <span className={`w-1 h-1 rounded-full ${colors.dot}`} />
                      <span className={`w-1 h-1 rounded-full ${colors.dot}`} />
                      <span className="ml-0.5 font-mono">已确认</span>
                    </div>
                    <span>详情</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 
        ========================================================================
        RIGHT-SIDE PANEL: 可比较职业路径推演 (Matching Screenshot)
        ========================================================================
      */}
      <AnimatePresence>
        {showExploreResultModal && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed right-3 sm:right-6 top-18 bottom-3 sm:bottom-6 w-full max-w-[440px] z-40 bg-white/95 backdrop-blur-2xl rounded-[30px] p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-stone-200/90 flex flex-col justify-between overflow-y-auto"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-900 text-base">
                        可比较职业路径推演
                      </h3>
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                        来源与任务依据
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      已结合你装配的 {equippedCount} 张能力卡与现实约束
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowExploreResultModal(false)}
                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 transition cursor-pointer"
                  title="收起"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Source-backed recommendation */}
              <div className="mt-3.5 space-y-3.5">
                {recommendationStatus === 'loading' && (
                  <div className="rounded-2xl bg-stone-50/80 border border-stone-200/70 p-5 text-center">
                    <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900" />
                    <p className="mt-3 text-sm font-semibold text-stone-800">正在检索岗位资料并生成推演</p>
                    <p className="mt-1 text-xs text-stone-500">仅使用已确认能力卡与本地知识库，结果会附带引用。</p>
                  </div>
                )}

                {recommendationStatus === 'error' && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm font-semibold text-rose-900">暂时无法完成职业推演</p>
                    <p className="mt-1 text-xs leading-relaxed text-rose-800">{recommendationError}</p>
                    <button
                      onClick={() => void handleStartExplore()}
                      className="mt-3 rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-black"
                    >
                      重新推演
                    </button>
                  </div>
                )}

                {recommendation && (
                  <div className="rounded-2xl bg-stone-50/80 border border-stone-200/70 p-4">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        证据支持的职业路径
                      </span>
                      <span className="text-[11px] font-medium text-stone-500">
                        依据强度：{recommendation.confidence}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-stone-900">{recommendation.role_title}</h4>
                    <p className="text-xs text-stone-500 mb-1">下一步验证任务：{recommendation.next_task_id} · {recommendation.next_task_title}</p>
                    <p className="text-[10px] leading-relaxed text-stone-500 mb-3">{recommendation.next_task_reason}</p>

                    <div className="space-y-2 text-xs text-stone-700 bg-white/70 p-3 rounded-xl border border-stone-100 leading-relaxed">
                      <p>
                        <strong className="text-stone-900 font-bold">推演摘要：</strong>
                        {recommendation.summary}
                      </p>
                      <div>
                        <strong className="text-stone-900 font-bold">已支持判断：</strong>
                        {recommendation.supported.length === 0 ? (
                          <span className="ml-1 text-stone-500">暂无足够材料形成明确判断。</span>
                        ) : (
                          <ul className="mt-1 space-y-1 pl-4 list-disc">
                            {recommendation.supported.map((item, index) => {
                              const cardNames = item.card_ids
                                .map(cardId => confirmedCards.find(card => card.id === cardId)?.title)
                                .filter(Boolean)
                                .join('、');
                              const citationNames = item.citation_ids
                                .map(citationId => recommendation.citations.find(citation => citation.id === citationId)?.source_locator)
                                .filter(Boolean)
                                .join('；');
                              return (
                                <li key={`${item.claim}-${index}`}>
                                  {item.claim}
                                  {(cardNames || citationNames) && (
                                    <span className="block text-[10px] text-stone-500">
                                      {cardNames ? `能力卡：${cardNames}` : ''}{cardNames && citationNames ? ' · ' : ''}{citationNames ? `引用：${citationNames}` : ''}
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                      <div>
                        <strong className="text-stone-900 font-bold">仍待验证：</strong>
                        <ul className="mt-1 space-y-1 pl-4 list-disc">
                          {recommendation.unknowns.map(item => <li key={item}>{item}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 text-[10px] leading-relaxed text-indigo-900">
                      <p className="font-semibold">引用片段（{recommendation.citations.length}）</p>
                      {recommendation.citations.slice(0, 3).map(citation => (
                        <div key={citation.id} className="mt-2 border-t border-indigo-100 pt-2">
                          <p className="font-medium">{citation.document_title} · {citation.source_locator}</p>
                          <p className="mt-0.5 text-indigo-800/80 line-clamp-3">{citation.content}</p>
                          <p className="mt-0.5 text-indigo-700/70">资料级别：{citation.trust_level}。{citation.source_note}</p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 text-[10px] leading-relaxed text-stone-500">{recommendation.notice}</p>
                    <button
                      onClick={() => {
                        onStartStageTwo(recommendation.next_task_id);
                      }}
                      className="mt-3 w-full py-2.5 rounded-full bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>进入 {recommendation.next_task_id} 试路验证</span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Panel Footer */}
            <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
              <span className="text-stone-400 flex items-center gap-1">
                <span>💡</span>
                <span>可在左侧继续调整卡牌，实时重新推演</span>
              </span>

              <button
                onClick={() => setShowExploreResultModal(false)}
                className="text-stone-500 hover:text-stone-900 font-medium cursor-pointer"
              >
                收起推演面板
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
