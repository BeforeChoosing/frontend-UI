import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Layers, 
  CheckCircle2, 
  Plus, 
  X, 
  Compass, 
  Zap, 
  Sliders, 
  FileText, 
  ShieldCheck, 
  Clock, 
  Tag, 
  ChevronRight, 
  TrendingUp, 
  Award,
  Bot,
  Briefcase
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SkillCard } from '../types';

interface CareerExploreScreenProps {
  unlockedCards?: SkillCard[];
  onStartStageOne?: (careerTitle: string) => void;
  onStartStageTwo: () => void;
  onOpenWikiModal: () => void;
  onOpenCardDetail: (card: SkillCard) => void;
  onOpenAgentChat?: (agentId?: string) => void;
  onSlotsChange?: (slots: (SkillCard | null)[]) => void;
}

// Hand cards deck matching all user competencies
const HAND_CARDS_POOL: (SkillCard & { mastery?: number; cost?: number; date?: string; dotColor?: string; barColor?: string })[] = [
  {
    id: 'card-user-empathy',
    title: '用户痛点同理心',
    category: '洞察分析',
    description: '深入一线体察真实用户受挫细节与隐性诉求',
    detail: '深入一线直接访谈差评与受挫用户，从吐槽与放弃步骤中提炼未被满足的真需求。',
    icon: 'Sparkles',
    colorTone: 'emerald',
    dotColor: 'bg-emerald-500',
    barColor: 'bg-emerald-500',
    mastery: 96,
    cost: 1,
    date: '2025-01'
  },
  {
    id: 'card-badcase-trace',
    title: 'Badcase 精准溯源',
    category: '数据驱动',
    description: '通过问答日志与用户工单归因模型输出缺陷',
    detail: '能从海量对话日志中分类Prompt工程缺陷、检索召回失真与模型幻觉。',
    icon: 'TrendingUp',
    colorTone: 'blue',
    dotColor: 'bg-blue-500',
    barColor: 'bg-blue-500',
    mastery: 92,
    cost: 2,
    date: '2025-02'
  },
  {
    id: 'card-prompt-optimize',
    title: 'Prompt 结构化约束',
    category: '产品策略',
    description: '规范系统指令、少数样本示例与输出防幻觉防线',
    detail: '熟练掌握Few-shot、CoT链式思考框架与结构化JSON Schema格式输出。',
    icon: 'FileText',
    colorTone: 'amber',
    dotColor: 'bg-amber-500',
    barColor: 'bg-amber-500',
    mastery: 88,
    cost: 2,
    date: '2024-12'
  },
  {
    id: 'card-ux-dialogue',
    title: '人机交互设计',
    category: '交互体验',
    description: '设计主动追问、澄清标签与流式对话容错体验',
    detail: '擅长多轮对话交互、降低等待焦虑与减少模型幻觉感知。',
    icon: 'Sliders',
    colorTone: 'rose',
    dotColor: 'bg-rose-500',
    barColor: 'bg-rose-500',
    mastery: 94,
    cost: 3,
    date: '2025-02'
  },
  {
    id: 'card-user-insight',
    title: '用户洞察',
    category: '洞察分析',
    description: '穿透表层诉求，挖掘用户真实动机与隐性痛点',
    detail: '具备敏锐的同理心，能穿透用户提出的伪需求，找到底层价值驱动。',
    icon: 'Compass',
    colorTone: 'emerald',
    dotColor: 'bg-emerald-500',
    barColor: 'bg-emerald-500',
    mastery: 95,
    cost: 1,
    date: '2025-02'
  },
  {
    id: 'card-problem-decompose',
    title: '问题拆解',
    category: '产品策略',
    description: '将复杂模糊的业务命题拆解为可落地的逻辑树',
    detail: '善用MECE原则与逻辑树结构化拆解问题，分清轻重缓急与优先级。',
    icon: 'Layers',
    colorTone: 'amber',
    dotColor: 'bg-amber-500',
    barColor: 'bg-amber-500',
    mastery: 95,
    cost: 2,
    date: '2025-01'
  },
  {
    id: 'card-ai-abstract',
    title: 'AI能力抽象',
    category: '技术落地',
    description: '连接大模型技术边界与用户真实交互心智',
    detail: '深刻理解大语言模型的概率生成特性与技术边界，将技术能力转化为产品交互机制。',
    icon: 'Sliders',
    colorTone: 'purple',
    dotColor: 'bg-purple-500',
    barColor: 'bg-purple-500',
    mastery: 95,
    cost: 2,
    date: '2025-03'
  },
  {
    id: 'card-agile-explore',
    title: '自驱敏捷探索',
    category: '协作沟通',
    description: '快速跨界吸收前沿AI知识，推动MVP极速验证',
    detail: '具备极强的主动性与好奇心，能将学术论文转化为产品功能。',
    icon: 'Zap',
    colorTone: 'emerald',
    dotColor: 'bg-emerald-500',
    barColor: 'bg-emerald-500',
    mastery: 91,
    cost: 1,
    date: '2025-03'
  },
  {
    id: 'card-biz-roi',
    title: '商业价值度量',
    category: '产品策略',
    description: '测算Token算力成本与业务ROI投产比平衡',
    detail: '平衡大模型响应时延、调用计费与用户留存转化率。',
    icon: 'TrendingUp',
    colorTone: 'amber',
    dotColor: 'bg-amber-500',
    barColor: 'bg-amber-500',
    mastery: 86,
    cost: 2,
    date: '2024-10'
  }
];

export const CareerExploreScreen: React.FC<CareerExploreScreenProps> = ({
  unlockedCards = [],
  onStartStageOne,
  onStartStageTwo,
  onOpenWikiModal,
  onOpenCardDetail,
  onOpenAgentChat,
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

  const isCardInDeck = (cardId: string) => deckSlots.some(s => s?.id === cardId);
  const equippedCount = deckSlots.filter(Boolean).length;

  // Processed Hand Cards
  const processedHandCards = useMemo(() => {
    const list = [...HAND_CARDS_POOL];
    if (sortMode === 'category') {
      list.sort((a, b) => a.category.localeCompare(b.category, 'zh-Hans-CN'));
    } else if (sortMode === 'time') {
      list.sort((a, b) => (b.date || '2025-01').localeCompare(a.date || '2025-01'));
    } else {
      list.sort((a, b) => ((b.mastery || 90) - (a.mastery || 90)));
    }
    return list;
  }, [sortMode]);

  // Dynamic names of equipped cards for deduction
  const equippedNames = useMemo(() => {
    const valid = deckSlots.filter(Boolean);
    if (valid.length === 0) return '能力卡组';
    return valid.map(c => c!.title).join('、');
  }, [deckSlots]);

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
    const cardToSlot = HAND_CARDS_POOL.find(c => c.id === cardId);
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
    const next = [
      HAND_CARDS_POOL[0],
      HAND_CARDS_POOL[1],
      HAND_CARDS_POOL[2],
      HAND_CARDS_POOL[3]
    ];
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
  };

  // Action: 出牌探索路径 -> 弹出可比较推演面板并燃放五彩纸屑
  const handleStartExplore = () => {
    try {
      confetti({
        particleCount: 55,
        spread: 75,
        origin: { y: 0.45 }
      });
    } catch {
      // ignore
    }
    setShowExploreResultModal(true);
  };

  const handleAgentChat = () => {
    if (onOpenAgentChat) onOpenAgentChat('career_path');
    else window.dispatchEvent(new CustomEvent('open-agent-chat', { detail: { agentId: 'career_path' } }));
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

      {/* 
        ========================================================================
        TOP AGENT BAR (Matching Screenshot)
        ========================================================================
      */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-xl border border-stone-200/70 shrink-0 relative z-20 shadow-2xs">
        <div 
          onClick={handleAgentChat}
          className="flex items-center gap-3 cursor-pointer group min-w-0"
        >
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="bg-amber-100 text-amber-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
              阶段 02 · 职业路径 AGENT
            </span>
            <span className="text-xs text-stone-500 hidden sm:inline font-normal">
              产品 2 负责 · 出牌推演核心组合
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
            <span>行业专家 Agent 百科</span>
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
                          <span className="font-bold text-stone-700">{(slotCard as any).mastery || 95}%</span>
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
            disabled={equippedCount === 0}
            className={`craft-btn-black px-6 py-2.5 text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md ${
              equippedCount === 0
                ? 'opacity-40 pointer-events-none'
                : ''
            }`}
            id="btn-deduce-career"
          >
            <Compass className="w-4 h-4 text-stone-200" />
            <span>出牌探索路径</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleFastEquip}
            className="craft-btn-secondary px-5 py-2 text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs"
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
            {processedHandCards.map((card) => {
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
                      可信度 {card.mastery || 95}%
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
                      <span className="ml-0.5 font-mono">{card.mastery || 95}%</span>
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
                        职业路径 Agent
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

              {/* Deduction Cards List */}
              <div className="mt-3.5 space-y-3.5">
                
                {/* 1. 主推方案: AI 产品经理 */}
                <div className="rounded-2xl bg-stone-50/80 border border-stone-200/70 p-4 relative group hover:border-emerald-200 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      94% 契合 · 主推方案
                    </span>
                    <span className="text-[11px] font-mono font-medium text-stone-500">
                      S级最佳契合
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-stone-900">
                    AI 产品经理
                  </h4>
                  <p className="text-xs text-stone-500 mb-3">
                    大模型应用落地与多模态智能体架构
                  </p>

                  <div className="space-y-2 text-xs text-stone-700 bg-white/70 p-3 rounded-xl border border-stone-100 mb-3 leading-relaxed">
                    <p className="flex items-start gap-1.5">
                      <span className="shrink-0">🎯</span>
                      <span>
                        <strong className="text-stone-900 font-bold">推荐依据：</strong>
                        基于【{equippedNames}】的高维组合，能快速适应 AI 场景。
                      </span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="shrink-0">❓</span>
                      <span>
                        <strong className="text-stone-900 font-bold">待验证未知：</strong>
                        在【模型评估基准、成本时延把控】上的实战解题深度（需在阶段 3 试路任务中检验）。
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (onStartStageOne) onStartStageOne('AI 产品经理');
                      else onStartStageTwo();
                    }}
                    className="w-full py-2.5 rounded-full bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>进入阶段 3 试路验证</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </div>

                {/* 2. 备选路径: AI 交互体验架构师 */}
                <div className="rounded-2xl bg-stone-50/80 border border-stone-200/70 p-4 relative group hover:border-emerald-200 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      89% 契合 · 备选路径
                    </span>
                    <span className="text-[11px] font-mono font-medium text-stone-500">
                      A+级高协同
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-stone-900">
                    AI 交互体验架构师
                  </h4>
                  <p className="text-xs text-stone-500 mb-3">
                    智能体人机协同与LUI对话体验设计
                  </p>

                  <div className="space-y-2 text-xs text-stone-700 bg-white/70 p-3 rounded-xl border border-stone-100 mb-3 leading-relaxed">
                    <p className="flex items-start gap-1.5">
                      <span className="shrink-0">🎯</span>
                      <span>
                        <strong className="text-stone-900 font-bold">推荐依据：</strong>
                        基于【人机交互设计、自驱敏捷探索】的高维组合，能快速适应 AI 场景。
                      </span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="shrink-0">❓</span>
                      <span>
                        <strong className="text-stone-900 font-bold">待验证未知：</strong>
                        在【评估基准】上的实战解题深度（需在阶段 3 试路任务中检验）。
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (onStartStageOne) onStartStageOne('AI 交互体验架构师');
                      else onStartStageTwo();
                    }}
                    className="w-full py-2.5 rounded-full bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>进入阶段 3 试路验证</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </div>

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

