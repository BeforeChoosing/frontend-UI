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
  Eye,
  SlidersHorizontal,
  Compass,
  AlertCircle,
  PlusCircle,
  Layers,
  RotateCw,
  Award,
  Crosshair,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type VerificationStatus = 'confirmed' | 'unsure' | 'rejected';

interface ExperienceEndScreenProps {
  initialCards?: SkillCard[];
  allAccumulatedCards?: SkillCard[];
  onEnterProfile?: () => void;
  onContinueExplore?: () => void;
  onAddExperience?: () => void;
  onOpenAgentChat?: (agentId?: string) => void;
  onUpdateDeckSuccess?: (updatedCards: SkillCard[]) => void;
}

export const ExperienceEndScreen: React.FC<ExperienceEndScreenProps> = ({
  initialCards = [],
  allAccumulatedCards = [],
  onEnterProfile,
  onContinueExplore,
  onAddExperience,
  onOpenAgentChat,
  onUpdateDeckSuccess,
}) => {
  // Mode: 'verify' (验证实战沉淀卡牌) or 'added_pool' (已加入能力库展示)
  const [viewMode, setViewMode] = useState<'verify' | 'added_pool'>('verify');

  // 3 Capability cards extracted from the simulation
  const [cards, setCards] = useState<SkillCard[]>(() => {
    if (initialCards && initialCards.length >= 3) return initialCards.slice(0, 3);
    return [
      {
        id: 'clue-user-insight',
        title: '用户洞察与穿透挖掘',
        category: '洞察分析',
        description: '善于从用户反馈与真实业务痛点中提炼底层需求与核心矛盾',
        detail: '在 AI 产品任务中，通过深挖用户隐性诉求，制定高精准度的场景解法与核心指标。',
        icon: 'Eye',
        colorTone: 'rose',
        workplaceApplication: '在产品立项及需求定义阶段，穿透表象诉求，精准锚定用户价值闭环。',
        matchReason: '来源于 AI 产品实战模拟中的用户需求诊断与分析'
      },
      {
        id: 'clue-ai-abstract',
        title: 'AI能力抽象与模型分流',
        category: '系统架构',
        description: '权衡大模型推理算力成本与业务ROI，制定高可用分流与兜底方案',
        detail: '能针对高频简单任务采用轻量模型或规则，复杂长尾任务调用旗舰模型，兼顾质量与成本。',
        icon: 'Layers',
        colorTone: 'purple',
        workplaceApplication: '负责大模型应用架构中的路由网关设计、意图分类与异常兜底策略制定。',
        matchReason: '来源于 AI 任务推演中的成本收益权衡与方案架构'
      },
      {
        id: 'clue-prd-delivery',
        title: 'AI产品落地与PRD交付',
        category: '落地交付',
        description: '能够输出包含提示词规格、分流策略与边界守卫的高保真产品方案',
        detail: '具备完整将业务需求转化为工程开发可执行的技术规格与 PRD 文档能力。',
        icon: 'Award',
        colorTone: 'emerald',
        workplaceApplication: '撰写严密的 AI PRD 文档，与算法及前后端工程师进行无缝协作交付。',
        matchReason: '来源于高保真 PRD 方案撰写与实战交付物产出'
      }
    ];
  });

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

  // Toggle card flip
  const handleToggleFlip = (cardId: string) => {
    setFlippedCardIds(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Submit confirmed cards & transition to 'added_pool' library view
  const handleConfirmAndAdd = () => {
    const confirmed = cards.filter(c => cardStatuses[c.id] === 'confirmed');
    if (confirmed.length === 0) {
      alert('请至少保留 1 张确认符合经历的能力卡。');
      return;
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
    if (onUpdateDeckSuccess) {
      onUpdateDeckSuccess(confirmed);
    }
    setViewMode('added_pool');
  };

  // Trigger regenerate
  const handleTriggerRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 600);
  };

  const handleAgentClick = () => {
    if (onOpenAgentChat) {
      onOpenAgentChat('review_reflection');
    } else {
      window.dispatchEvent(new CustomEvent('open-agent-chat', { detail: { agentId: 'review_reflection' } }));
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
    if (card.matchReason?.includes('事实') || idx === 0) return '证据类型：实战推演提取';
    if (card.matchReason?.includes('架构') || idx === 1) return '证据类型：系统方案推导';
    return '证据类型：落地交付沉淀';
  };

  // =========================================================================
  // VIEW 1: VERIFICATION SCREEN (Exactly matching AbilityCardVerificationScreen)
  // =========================================================================
  if (viewMode === 'verify') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col justify-between max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative">
        
        {/* Background Soft Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-50/40 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-stone-100/60 blur-3xl" />
        </div>

        <div className="space-y-5 sm:space-y-6 relative z-10">
          
          {/* 
            ======================================================================
            1. TOP AGENT SPEECH BANNER (Clicking opens Agent Chat dialog)
            ======================================================================
          */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleAgentClick}
            className="craft-card w-full rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-white/85 backdrop-blur-xl border border-stone-200/50 flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-center sm:text-left cursor-pointer group transition-all"
            title="点击与 Agent 实时探讨能力卡判定"
          >
            {/* Agent Avatar Circle */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0 border border-stone-200/60 group-hover:scale-105 transition-transform relative">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center shadow-xs">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
            </div>

            {/* Agent Speech Text */}
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="craft-chip-rose text-[10px] font-mono font-medium px-2 py-0.5 rounded-full">
                  04 · 复盘沉淀
                </span>
                <span className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full flex items-center gap-1 group-hover:bg-stone-200 transition-colors border border-stone-200/60">
                  💬 点击与复盘 Agent 实时探讨
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-normal text-stone-900 font-serif craft-serif tracking-tight">
                通过这次真实任务模拟，我发现了你的能力画像出现了一些新的实战线索，看看这些变化是否符合你的感受？
              </h2>
            </div>
          </motion.div>

          {/* Subtitle instruction */}
          <p className="text-center text-[11px] sm:text-xs text-stone-500 font-normal">
            请选择你认可的能力卡，或修改卡牌内容后进行确认
          </p>

          {/* 
            ======================================================================
            2. MIDDLE: 3 ABILITY CARDS
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
                          <p>• 经历溯源：{card.matchReason || '来源于自述中的实际行动与成果'}</p>
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
                      <span>符合经历</span>
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
                      <span>暂不确定</span>
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
                      <span>不属于我</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* 
          ======================================================================
          3. BOTTOM SUMMARY & 3 ACTION BUTTONS (补充经历 | 重新分析 | 更新能力库)
          ======================================================================
        */}
        <div className="pt-6 pb-2 space-y-3 relative z-10">
          {/* Summary Text: 已确认 X/3 张卡牌 */}
          <div className="text-center text-xs text-stone-500 font-normal">
            已确认 <strong className="text-stone-900 font-bold font-mono">{confirmedCount}</strong>/3 张卡牌
          </div>

          {/* 3 Buttons in a Row */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto">
            {/* 补充经历 */}
            <button
              onClick={() => {
                if (onAddExperience) onAddExperience();
                else if (onContinueExplore) onContinueExplore();
              }}
              className="craft-btn-secondary flex-1 py-2.5 px-4 text-xs sm:text-sm text-center"
              id="btn-add-experience"
            >
              补充经历
            </button>

            {/* 重新分析 */}
            <button
              onClick={handleTriggerRegenerate}
              disabled={isRegenerating}
              className="craft-btn-secondary flex-1 py-2.5 px-4 text-xs sm:text-sm flex items-center justify-center gap-1.5"
              id="btn-reanalyze"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-stone-900' : 'text-stone-600'}`} />
              <span>{isRegenerating ? '分析中...' : '重新分析'}</span>
            </button>

            {/* 更新能力库 */}
            <button
              onClick={handleConfirmAndAdd}
              className="craft-btn-black flex-1 py-2.5 px-4 text-xs sm:text-sm text-center"
              id="btn-update-skill-deck"
            >
              更新能力库
            </button>
          </div>
        </div>

      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ADDED TO ABILITY LIBRARY VIEW (Matching AbilityCardVerificationScreen)
  // =========================================================================
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-between max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative">
      
      {/* Background Soft Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-50/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-stone-100/60 blur-3xl" />
      </div>

      <div className="space-y-6 sm:space-y-8 relative z-10">
        
        {/* 
          ======================================================================
          1. TOP AGENT SPEECH BANNER
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
              很好，这一轮我已经从你的实战推演中确认了 <span className="text-amber-800 font-bold font-mono">{confirmedThisRound.length || confirmedCount}</span> 张能力卡。
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              你的能力库已成功同步更新，实战证据将持续丰富你的职业画像与岗位适配度。
            </p>
          </div>
        </motion.div>

        {/* 
          ======================================================================
          2. MIDDLE: ACCUMULATED CARDS IN POOL
          ======================================================================
        */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full py-2"
        >
          {/* Card Cards Grid */}
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
                            <span className="text-[10px] font-mono text-amber-300 font-medium">能力详情解析</span>
                            <RotateCw className="w-3 h-3 text-stone-400 group-hover:rotate-180 transition-transform" />
                          </div>
                          <p className="text-xs text-stone-300 leading-relaxed font-normal">
                            {card.detail}
                          </p>
                          {card.workplaceApplication && (
                            <p className="text-[10px] text-amber-200/90 leading-tight">
                              🎯 职场应用：{card.workplaceApplication}
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
        3. BOTTOM ACTIONS & DESCRIPTIONS
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
            当前已积累 <span className="font-mono text-amber-800 font-bold text-sm sm:text-base">{totalCardCount}</span> 张能力卡
          </p>
          <p className="text-[11px] sm:text-xs text-stone-500 font-normal">
            你可以进入个人档案查阅完整技能雷达，或继续探索更多职业
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
          {/* Primary: 进入我的档案 */}
          <button
            onClick={() => {
              if (onEnterProfile) onEnterProfile();
            }}
            className="craft-btn-black w-full py-3 px-6 text-sm text-center flex items-center justify-center gap-2"
            id="btn-enter-profile"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>进入我的档案</span>
          </button>

          {/* Secondary: 继续探索其他职业 */}
          <button
            onClick={() => {
              if (onContinueExplore) onContinueExplore();
            }}
            className="craft-btn-secondary w-full py-2.5 px-6 text-xs sm:text-sm text-center"
            id="btn-continue-explore"
          >
            继续探索其他职业
          </button>
        </div>

      </motion.div>

    </div>
  );
};
