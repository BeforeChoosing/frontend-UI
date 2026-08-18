import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SkillCard } from '../types';
import { 
  Check, 
  ArrowRight, 
  Sparkles, 
  Plus, 
  X, 
  RotateCcw,
  CheckCircle2,
  Compass,
  Zap,
  Tag,
  ShieldCheck,
  Award,
  Sliders,
  Flame,
  ChevronRight,
  TrendingUp,
  FileText,
  Layers,
  Clock,
  Briefcase,
  Bot,
  HelpCircle,
  MessageSquare,
  Sparkle,
  Lightbulb
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StageOneValidationProps {
  onAdvanceToStageTwo: () => void;
  onOpenCardDetail: (card: SkillCard) => void;
  roleTitle?: string;
  onOpenAgentChat?: (agentId?: string) => void;
  onBackToExplore?: () => void;
}

interface ChallengeStep {
  id: number;
  title: string;
  userQuote: string;
  question: string;
  recommendedCardIds: string[];
  hint: string;
  aiCoachingEmpty: string;
  aiCoachingMatch: string;
  aiCoachingPartial: string;
}

const CHALLENGES: ChallengeStep[] = [
  {
    id: 1,
    title: '用户差评与需求归因',
    userQuote: '“AI助手回答经常不符合我的需求，很多用户觉得它不好用。”',
    question: '如果你负责优化这个产品，你第一步会怎么做？',
    recommendedCardIds: ['card-user-empathy', 'card-badcase-trace', 'card-problem-decompose'],
    hint: '优秀AI PM的第一步不是盲目调大模型参数，而是下潜到真实业务日志中做定性定量的Badcase归因与用户共情。',
    aiCoachingEmpty: '💡 请从下方选择你认为最适合应对当前挑战的能力卡牌，点击或拖入中间区域。',
    aiCoachingMatch: '🎯 逻辑非常清晰！你选择了【用户痛点同理心】与【Badcase 精准溯源】。面对笼统的“不好用”反馈，第一步必须拆解问答日志与用户报错工单，明确是Prompt失误、知识库召回缺陷还是意图识别不准。',
    aiCoachingPartial: '💡 思路不错！但别忘了，面对“回答不符合需求”的泛化抱怨，精准定位Badcase日志与一线用户受挫点是所有AI产品迭代的黄金基石。'
  },
  {
    id: 2,
    title: '交互重构与Prompt约束',
    userQuote: '“AI生成的输出像一篇长篇大论，我只想快速要一个结论，而且它有时候还会瞎编。”',
    question: '作为AI产品经理，你会如何通过交互与Prompt规则解决“冗长”和“幻觉”？',
    recommendedCardIds: ['card-ux-dialogue', 'card-prompt-optimize', 'card-ai-abstract'],
    hint: '运用人机交互设计（如主动澄清、结构化卡片展示）结合Few-shot与JSON Schema约束输出，降低幻觉感知。',
    aiCoachingEmpty: '💡 进入第2步挑战：请选择适合解决“输出冗长与幻觉”的能力卡牌。',
    aiCoachingMatch: '🎯 极佳的AI产品直觉！【人机交互设计】配合【Prompt 结构化约束】，能将长文本转为即插即用的结构化卡片与结论先行摘要，并用少样本示例压制幻觉。',
    aiCoachingPartial: '💡 交互设计很关键，同时可以配合Prompt的结构化Schema与Few-shot约束，让AI输出结论先行。'
  },
  {
    id: 3,
    title: '技术边界与ROI度量',
    userQuote: '“算法团队说每次调用需要8秒且GPU成本暴涨，但运营发现次日留存并没有显著提升。”',
    question: '你将如何平衡模型算力成本与业务ROI，推动团队敏捷交付？',
    recommendedCardIds: ['card-ai-abstract', 'card-biz-roi', 'card-agile-explore'],
    hint: 'AI产品经理需要具备技术抽象力，懂得用小模型做意图分类分流、大模型做深度推理，兼顾性能与成本。',
    aiCoachingEmpty: '💡 进入第3步挑战：请选择用于平衡算力成本、技术边界与业务ROI的能力卡。',
    aiCoachingMatch: '🎯 满分闭环！【AI能力抽象】与【商业价值度量】展现了资深AI PM的核心素养：不盲目依赖大模型，通过意图分流与缓存策略将Token成本降低70%，保障商业ROI。',
    aiCoachingPartial: '💡 考虑得很周全！进一步结合算力ROI测算与分流机制，能让方案更具工程可行性。'
  }
];

// Available candidate capability cards
const CANDIDATE_SKILL_CARDS: (SkillCard & { mastery?: number; cost?: number; date?: string })[] = [
  {
    id: 'card-user-empathy',
    title: '用户痛点同理心',
    category: '洞察分析',
    description: '深入一线体察真实用户受挫细节与隐性诉求',
    detail: '深入一线直接访谈差评与受挫用户，从吐槽与放弃步骤中提炼未被满足的真需求。',
    icon: 'Sparkles',
    colorTone: 'emerald',
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
    mastery: 92,
    cost: 2,
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
    mastery: 95,
    cost: 2,
    date: '2025-03'
  },
  {
    id: 'card-ux-dialogue',
    title: '人机交互设计',
    category: '交互体验',
    description: '设计主动追问、澄清标签与流式对话容错体验',
    detail: '擅长多轮对话交互、降低等待焦虑与减少模型幻觉感知。',
    icon: 'Sliders',
    colorTone: 'rose',
    mastery: 94,
    cost: 3,
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
    mastery: 88,
    cost: 2,
    date: '2024-12'
  },
  {
    id: 'card-biz-roi',
    title: '商业价值度量',
    category: '产品策略',
    description: '测算Token算力成本与业务ROI投产比平衡',
    detail: '平衡大模型响应时延、调用计费与用户留存转化率。',
    icon: 'TrendingUp',
    colorTone: 'amber',
    mastery: 86,
    cost: 2,
    date: '2024-10'
  },
  {
    id: 'card-agile-explore',
    title: '自驱敏捷探索',
    category: '协作沟通',
    description: '快速跨界吸收前沿AI知识，推动MVP极速验证',
    detail: '具备极强的主动性与好奇心，能将学术论文转化为产品功能。',
    icon: 'Zap',
    colorTone: 'emerald',
    mastery: 91,
    cost: 1,
    date: '2025-03'
  }
];

export const StageOneValidation: React.FC<StageOneValidationProps> = ({
  onAdvanceToStageTwo,
  onOpenCardDetail,
  roleTitle = 'AI 产品经理',
  onOpenAgentChat,
  onBackToExplore
}) => {
  // Current challenge index (0, 1, 2)
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState<number>(0);
  const currentChallenge = CHALLENGES[currentChallengeIndex];

  // Placed capability cards in center slot area
  const [placedCards, setPlacedCards] = useState<SkillCard[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);
  const [showHintModal, setShowHintModal] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);

  // Dynamic AI feedback based on currently placed cards
  const aiCoachFeedback = useMemo(() => {
    if (placedCards.length === 0) {
      return currentChallenge.aiCoachingEmpty;
    }
    const placedIds = placedCards.map(c => c.id);
    const matches = currentChallenge.recommendedCardIds.filter(id => placedIds.includes(id));
    
    if (matches.length >= 2) {
      return currentChallenge.aiCoachingMatch;
    } else if (matches.length === 1) {
      return currentChallenge.aiCoachingPartial;
    } else {
      return `💡 你放置了【${placedCards.map(c => c.title).join('、')}】。这些能力在产品生命周期中很有价值，但在当前挑战场景下，是否还有更直接切中问题核心的能力卡？`;
    }
  }, [placedCards, currentChallenge]);

  // Click card to place/remove
  const handleToggleCardPlacement = (card: SkillCard) => {
    const exists = placedCards.some(c => c.id === card.id);
    if (exists) {
      setPlacedCards(prev => prev.filter(c => c.id !== card.id));
    } else {
      if (placedCards.length < 3) {
        setPlacedCards(prev => [...prev, card]);
      } else {
        // replace last
        setPlacedCards(prev => [prev[0], prev[1], card]);
      }
    }
  };

  // Submit reasoning for current challenge
  const handleSubmitThoughts = () => {
    if (placedCards.length === 0) {
      setShowHintModal(true);
      return;
    }

    try {
      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.5 }
      });
    } catch {
      // ignore
    }

    if (!completedChallenges.includes(currentChallenge.id)) {
      setCompletedChallenges(prev => [...prev, currentChallenge.id]);
    }

    if (currentChallengeIndex < CHALLENGES.length - 1) {
      // Move to next challenge
      setTimeout(() => {
        setCurrentChallengeIndex(prev => prev + 1);
        setPlacedCards([]);
      }, 500);
    } else {
      // All 3 challenges completed -> Open completion modal leading to Stage 2
      setShowAdvanceModal(true);
    }
  };

  const handleAgentClick = () => {
    if (onOpenAgentChat) onOpenAgentChat('career_path');
    else window.dispatchEvent(new CustomEvent('open-agent-chat', { detail: { agentId: 'career_path' } }));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] p-3 sm:p-6 flex flex-col justify-between selection:bg-amber-100 relative">
      
      {/* Background Soft Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-50/50 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-stone-100/60 blur-3xl" />
      </div>

      {/* 
        ========================================================================
        TOP AGENT SPEECH BAR + TOP-RIGHT HEADER
        (Exact Wireframe Layout)
        ========================================================================
      */}
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-stretch md:items-start justify-between gap-4 shrink-0 relative z-10">
        
        {/* Top Agent Speaking Bubble (Left & Wide) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleAgentClick}
          className="craft-card flex-1 bg-white/85 backdrop-blur-xl hover:bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex items-center gap-4 cursor-pointer group transition-all border border-stone-200/60 shadow-xs"
          title="点击与 Agent 实时对话"
        >
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-stone-900 text-amber-300 flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="craft-chip-yellow text-[10px] font-mono font-medium px-2 py-0.5 rounded-full">
                02 · 确立坐标
              </span>
              <span className="text-[10px] text-stone-500 font-normal">
                岗位推演导师
              </span>
            </div>
            <p className="text-stone-900 text-sm sm:text-base font-normal leading-relaxed font-serif craft-serif">
              让我们先推演一次这个岗位中的真实破局挑战。
            </p>
          </div>

          <span className="text-[10px] text-stone-600 font-normal hidden sm:inline bg-stone-100 px-2.5 py-1 rounded-full group-hover:bg-stone-200 transition-colors border border-stone-200/60">
            💬 实时对话
          </span>
        </motion.div>

        {/* Top Right Header: AI产品经理探索 阶段1：能力验证 + Progress */}
        <div className="shrink-0 text-right flex flex-col items-end justify-center px-1">
          <h2 className="text-base sm:text-lg font-normal text-stone-900 tracking-tight font-serif craft-serif">
            {roleTitle || 'AI产品经理'}探索 · 阶段1：能力验证
          </h2>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-stone-500 font-mono">
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((stepNum) => (
                <span
                  key={stepNum}
                  onClick={() => {
                    setCurrentChallengeIndex(stepNum - 1);
                    setPlacedCards([]);
                  }}
                  className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
                    completedChallenges.includes(stepNum)
                      ? 'bg-emerald-500 ring-2 ring-emerald-100'
                      : stepNum === currentChallenge.id
                      ? 'bg-stone-900 ring-2 ring-stone-200'
                      : 'border border-stone-300 bg-transparent'
                  }`}
                  title={`挑战 0${stepNum}`}
                />
              ))}
            </div>
            <span>已完成 {completedChallenges.length}/3 个挑战</span>
          </div>
        </div>

      </div>

      {/* 
        ========================================================================
        MAIN CENTER AREA:
        Left: 任务卡
        Center: 选择最相关的能力卡，放置到该区域 (Dashed Droppable Box)
        Right: (根据放置的卡牌实时更新的ai对话)
        ========================================================================
      */}
      <div className="flex-1 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-stretch my-3 relative z-10">
        
        {/* LEFT: 任务卡 (3 cols) */}
        <motion.div
          key={`task-card-${currentChallenge.id}`}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="craft-card md:col-span-3 bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between min-h-[220px] sm:min-h-[260px] border border-stone-200/70 shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-normal text-stone-900 text-base sm:text-lg tracking-tight font-serif craft-serif">
                任务卡
              </h3>
              <span className="craft-chip-yellow text-[10px] font-mono font-medium px-2 py-0.5 rounded-full">
                CHALLENGE 0{currentChallenge.id}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal bg-stone-50/80 p-3 rounded-2xl border border-stone-200/50">
                用户反馈：{currentChallenge.userQuote}
              </p>
              <p className="text-xs sm:text-sm text-stone-900 font-normal leading-snug font-serif craft-serif">
                {currentChallenge.question}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-400 font-normal">
            🎯 目标：匹配契合该阶段破局的核心能力
          </div>
        </motion.div>

        {/* CENTER: 选择最相关的能力卡，放置到该区域 (6 cols - Dashed Box) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const cardId = e.dataTransfer.getData('text/card-id');
            const card = CANDIDATE_SKILL_CARDS.find(c => c.id === cardId);
            if (card && !placedCards.some(c => c.id === card.id)) {
              setPlacedCards(prev => [...prev.slice(0, 2), card]);
            }
          }}
          className={`craft-card md:col-span-6 rounded-2xl sm:rounded-3xl border border-dashed transition-all p-4 sm:p-5 flex flex-col justify-between min-h-[220px] sm:min-h-[260px] relative ${
            isDragOver
              ? 'border-stone-900 bg-amber-50/70 scale-101'
              : placedCards.length > 0
              ? 'border-stone-300 bg-white/95 shadow-xs'
              : 'border-stone-300/80 bg-white/40 hover:border-stone-400'
          }`}
        >
          {placedCards.length === 0 ? (
            /* Empty State matching wireframe text */
            <div className="my-auto flex flex-col items-center justify-center text-center p-4">
              <div className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500 mb-2 border border-stone-200/50">
                <Plus className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm font-normal text-stone-700">
                选择最相关的能力卡，放置到该区域
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                点击下方候选卡牌，或直接拖拽至此处（最多 3 张）
              </p>
            </div>
          ) : (
            /* Populated Placed Cards */
            <div className="w-full flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-xs font-normal text-stone-700 font-mono">
                    已选入能力组合 ({placedCards.length}/3)
                  </span>
                  <button
                    onClick={() => setPlacedCards([])}
                    className="text-[11px] text-stone-400 hover:text-stone-900 font-normal transition cursor-pointer"
                  >
                    清空重选
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
                  {placedCards.map((card) => (
                    <motion.div
                      key={`placed-${card.id}`}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="craft-card bg-white rounded-2xl p-3 border border-stone-200/80 shadow-2xs flex flex-col justify-between relative group hover:border-stone-400 transition"
                    >
                      <button
                        onClick={() => handleToggleCardPlacement(card)}
                        className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-stone-100 group-hover:bg-stone-900 group-hover:text-white text-stone-400 flex items-center justify-center transition cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>

                      <div>
                        <span className="text-[9px] font-mono text-stone-400 block mb-0.5">
                          {card.category}
                        </span>
                        <h5 className="text-xs font-normal text-stone-900 leading-tight font-serif craft-serif">
                          {card.title}
                        </h5>
                      </div>

                      <p className="text-[9px] text-stone-500 line-clamp-2 mt-1.5 leading-relaxed">
                        {card.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-center text-[10px] text-stone-400 font-normal">
                拖动卡牌或点击下方卡牌可随时替换
              </div>
            </div>
          )}

          {/* Subtitle helper */}
          <p className="text-center text-[10px] text-stone-400 pt-1">
            选择最相关的能力卡，放置到该区域
          </p>
        </div>

        {/* RIGHT: (根据放置的卡牌实时更新的ai对话) (3 cols) */}
        <motion.div
          key={`coach-panel-${currentChallenge.id}-${placedCards.length}`}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="craft-card md:col-span-3 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between min-h-[220px] sm:min-h-[260px] border border-stone-200/80 shadow-xs"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-xs border border-stone-200/50">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                </div>
                <span className="text-xs font-normal text-stone-900 font-serif craft-serif">
                  导师推演反馈
                </span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">
                实时评估
              </span>
            </div>

            <div className="bg-stone-50/90 p-3 rounded-2xl border border-stone-200/50 text-xs sm:text-[13px] text-stone-700 leading-relaxed font-normal">
              {aiCoachFeedback}
            </div>
          </div>

          <div className="pt-2 text-[10px] text-stone-400 flex items-center justify-between font-mono">
            <span>岗位匹配加成</span>
            <span className="font-bold text-stone-800">
              {placedCards.length === 0 ? '+0%' : placedCards.length >= 2 ? '+35% (高匹配)' : '+15%'}
            </span>
          </div>
        </motion.div>

      </div>

      {/* 
        ========================================================================
        BOTTOM: CANDIDATE CAPABILITY CARDS + ACTION BUTTONS
        (Exact Wireframe Layout)
        ========================================================================
      */}
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pt-2 shrink-0 relative z-10">
        
        {/* Left: Round Agent Avatar */}
        <div 
          onClick={handleAgentClick}
          className="shrink-0 hidden md:flex items-center justify-center w-11 h-11 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer shadow-xs transition border border-stone-200/60"
          title="点击与 Agent 对话"
        >
          <Bot className="w-5 h-5" />
        </div>

        {/* Center: Horizontal Hand Cards List */}
        <div className="flex-1 w-full overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-2.5 min-w-max justify-start md:justify-center px-1">
            {CANDIDATE_SKILL_CARDS.map((card) => {
              const isSelected = placedCards.some(c => c.id === card.id);

              return (
                <motion.div
                  key={card.id}
                  layout
                  whileHover={!isSelected ? { y: -6, scale: 1.02 } : undefined}
                  whileTap={!isSelected ? { scale: 0.98 } : undefined}
                  onClick={() => handleToggleCardPlacement(card)}
                  draggable={!isSelected}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/card-id', card.id);
                  }}
                  className={`craft-card w-[130px] sm:w-[145px] h-[135px] rounded-2xl sm:rounded-3xl p-3 select-none flex flex-col justify-between relative transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-md'
                      : 'bg-white/90 hover:bg-white text-stone-900 shadow-2xs border border-stone-200/70 cursor-grab active:cursor-grabbing'
                  }`}
                >
                  {/* Top category & select badge */}
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={isSelected ? 'text-stone-400' : 'text-stone-500'}>
                      {card.category}
                    </span>
                    {isSelected ? (
                      <span className="w-4 h-4 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-[10px]">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    ) : (
                      <span className="text-stone-400 font-mono text-[9px]">
                        {card.mastery || 95}%
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="my-auto py-0.5">
                    <h5 className={`font-normal text-xs leading-snug line-clamp-1 font-serif craft-serif ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                      {card.title}
                    </h5>
                    <p className={`text-[9px] line-clamp-2 mt-1 leading-relaxed ${isSelected ? 'text-stone-400' : 'text-stone-500'}`}>
                      {card.description}
                    </p>
                  </div>

                  {/* Bottom detail */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCardDetail(card);
                    }}
                    className={`flex items-center justify-between text-[9px] pt-1 border-t transition-colors ${
                      isSelected ? 'border-stone-800 text-stone-400 hover:text-white' : 'border-stone-100 text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    <span>详情</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: 2 Action Buttons [寻求帮助] [提交思路] */}
        <div className="shrink-0 flex items-center md:flex-col gap-2 w-full md:w-auto justify-end">
          {/* 寻求帮助 */}
          <button
            onClick={() => setShowHintModal(true)}
            className="craft-btn-secondary flex-1 md:flex-none w-full md:w-32 py-2 px-3 text-xs sm:text-sm text-center flex items-center justify-center gap-1.5"
            id="btn-stage1-help"
          >
            <HelpCircle className="w-3.5 h-3.5 text-stone-600" />
            <span>寻求帮助</span>
          </button>

          {/* 提交思路 */}
          <button
            onClick={handleSubmitThoughts}
            className="craft-btn-black flex-1 md:flex-none w-full md:w-32 py-2 px-3 text-xs sm:text-sm text-center flex items-center justify-center gap-1.5"
            id="btn-stage1-submit"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>提交思路</span>
          </button>
        </div>

      </div>

      {/* 
        ========================================================================
        HINT MODAL
        ========================================================================
      */}
      <AnimatePresence>
        {showHintModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-amber-700" />
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    AI 专家思路提示 · 挑战 0{currentChallenge.id}
                  </h4>
                </div>
                <button
                  onClick={() => setShowHintModal(false)}
                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-stone-800 leading-relaxed">
                {currentChallenge.hint}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
                <button
                  onClick={() => setShowHintModal(false)}
                  className="px-5 py-2 rounded-full bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition"
                >
                  我知道了
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 
        ========================================================================
        ADVANCE TO STAGE 2 MODAL (Completed all 3 challenges)
        ========================================================================
      */}
      <AnimatePresence>
        {showAdvanceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 16 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-stone-200 relative text-center"
            >
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-900 mx-auto flex items-center justify-center mb-3">
                <Award className="w-7 h-7 text-amber-700" />
              </div>

              <h3 className="text-xl font-bold text-stone-900">
                🎉 阶段 1：能力验证通过！
              </h3>

              <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
                你已成功理解并验证了 <span className="font-bold text-stone-900">{roleTitle}</span> 岗位的核心能力模型。现在，进入真实的桌面工作台进行端到端全真模拟！
              </p>

              <div className="mt-5 p-4 rounded-2xl bg-[#FAF9F5] border border-stone-200 flex items-center justify-around text-center">
                <div>
                  <span className="text-[10px] text-stone-500 block">挑战完成度</span>
                  <span className="text-lg font-black text-emerald-600 font-mono">3 / 3</span>
                </div>
                <div className="w-px h-8 bg-stone-200" />
                <div>
                  <span className="text-[10px] text-stone-500 block">综合胜任匹配</span>
                  <span className="text-lg font-black text-amber-600 font-mono">98%</span>
                </div>
                <div className="w-px h-8 bg-stone-200" />
                <div>
                  <span className="text-[10px] text-stone-500 block">下一步</span>
                  <span className="text-xs font-bold text-stone-800">阶段2：真实模拟</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setShowAdvanceModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs transition"
                >
                  返回检查
                </button>
                <button
                  onClick={() => {
                    setShowAdvanceModal(false);
                    onAdvanceToStageTwo();
                  }}
                  className="w-full sm:w-auto px-7 py-3 rounded-full bg-stone-900 hover:bg-black text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>进入阶段2：真实模拟</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
