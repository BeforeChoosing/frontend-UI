import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  X, 
  Send, 
  ChevronRight, 
  Compass, 
  ArrowRight,
  Building2,
  Sprout,
  Award,
  Sparkle,
  FileText,
  Clock,
  ChevronDown,
  MessageSquare,
  Loader2,
  CornerDownLeft,
  Lightbulb,
  Target
} from 'lucide-react';
import { ScreenMode, SkillCard, AgentType, AGENT_REGISTRY } from '../types';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  agentId?: AgentType;
  text: string;
  timestamp: string;
  actionSuggestions?: string[];
  breakdown?: {
    fact?: string;
    selfReport?: string;
    inference?: string;
  };
  citation?: {
    source: string;
    updatedAt: string;
  };
}

interface GlobalAIAgentWidgetProps {
  currentScreen: ScreenMode;
  unlockedCards: SkillCard[];
  slottedCards?: (SkillCard | null)[];
  onNavigateToScreen?: (screenMode: ScreenMode) => void;
  onOpenWiki?: () => void;
}

// Map screen to primary default Agent
const SCREEN_DEFAULT_AGENT: Record<ScreenMode, AgentType> = {
  landing: 'growth_companion',
  auth: 'growth_companion',
  'input-experience': 'growth_companion',
  'verify-cards': 'growth_companion',
  'career-explore': 'career_path',
  stage1: 'industry_expert',
  stage2: 'task_coach',
  'experience-end': 'review_reflection',
  report: 'review_reflection',
  profile: 'review_reflection',
};

const AGENT_ICONS: Record<AgentType, React.ReactNode> = {
  growth_companion: <Sprout className="w-4 h-4" />,
  career_path: <Compass className="w-4 h-4" />,
  industry_expert: <Building2 className="w-4 h-4" />,
  task_coach: <Sparkles className="w-4 h-4" />,
  review_reflection: <Award className="w-4 h-4" />
};

// Dynamic Stage Aesthetic Palette (Synchronized with current screen colors)
interface StageTheme {
  stageLabel: string;
  subtitle: string;
  agentName: string;
  dotColor: string;
  pulseGlow: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  outerRingBg: string;
  outerRingBorder: string;
  capsuleBg: string;
  capsuleBorder: string;
  capsuleShadow: string;
  chatBtnBg: string;
  icon: React.ReactNode;
  lightBg: string;
  accentText: string;
  sendBtnBg: string;
  ambientRing: string;
  orbGradient: string;
  orbShadow: string;
  specularTint: string;
}

const getStageTheme = (screen: ScreenMode): StageTheme => {
  switch (screen) {
    case 'input-experience':
    case 'verify-cards':
      return {
        stageLabel: '阶段 01 · 经历解构',
        subtitle: '经历提取与能力沉淀',
        agentName: '成长伙伴 Agent',
        dotColor: 'bg-emerald-500',
        pulseGlow: 'bg-emerald-400',
        badgeBg: 'bg-[#DCF2E2]',
        badgeText: 'text-[#064E24]',
        badgeBorder: 'border-[#BBE3C6]',
        outerRingBg: 'bg-[#EBF7EE]',
        outerRingBorder: 'border-[#CCEBD3]',
        capsuleBg: 'bg-[#FAFDFB]/95',
        capsuleBorder: 'border-emerald-300/60',
        capsuleShadow: 'shadow-[0_8px_30px_rgba(16,185,129,0.14)]',
        chatBtnBg: 'bg-[#0E2916] hover:bg-black text-white',
        icon: <Sprout className="w-4 h-4 text-white" strokeWidth={1.8} />,
        lightBg: 'bg-emerald-50/70',
        accentText: 'text-emerald-800',
        sendBtnBg: 'bg-[#0E2916] hover:bg-black',
        ambientRing: 'ring-emerald-400/30',
        orbGradient: 'from-emerald-400/25 via-teal-300/15 to-white/70',
        orbShadow: 'shadow-[0_16px_36px_rgba(5,150,105,0.22),0_4px_12px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)]',
        specularTint: 'from-emerald-200/40 via-white/50 to-white/90',
      };
    case 'career-explore':
    case 'stage1':
      return {
        stageLabel: '阶段 02 · 路径推演',
        subtitle: '能力适配与路径推演',
        agentName: '职业路径 Agent',
        dotColor: 'bg-[#F59E0B]',
        pulseGlow: 'bg-amber-400',
        badgeBg: 'bg-[#FEF3C7]',
        badgeText: 'text-[#451A03]',
        badgeBorder: 'border-[#FDE68A]',
        outerRingBg: 'bg-[#FCF7EB]',
        outerRingBorder: 'border-[#F6E9C8]',
        capsuleBg: 'bg-[#FDFBF7]/95',
        capsuleBorder: 'border-amber-300/70',
        capsuleShadow: 'shadow-[0_8px_30px_rgba(245,158,11,0.16)]',
        chatBtnBg: 'bg-[#242320] hover:bg-black text-white',
        icon: <Compass className="w-4 h-4 text-white" strokeWidth={1.8} />,
        lightBg: 'bg-amber-50/70',
        accentText: 'text-amber-900',
        sendBtnBg: 'bg-stone-900 hover:bg-black',
        ambientRing: 'ring-amber-400/30',
        orbGradient: 'from-amber-400/25 via-yellow-300/15 to-white/70',
        orbShadow: 'shadow-[0_16px_36px_rgba(217,119,6,0.24),0_4px_12px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)]',
        specularTint: 'from-amber-200/40 via-white/50 to-white/90',
      };
    case 'stage2':
      return {
        stageLabel: '阶段 03 · 试路实战',
        subtitle: '真实工作台任务模拟',
        agentName: '任务教练 Agent',
        dotColor: 'bg-blue-500',
        pulseGlow: 'bg-blue-400',
        badgeBg: 'bg-[#DBEAFE]',
        badgeText: 'text-[#172554]',
        badgeBorder: 'border-[#BFDBFE]',
        outerRingBg: 'bg-[#EFF6FF]',
        outerRingBorder: 'border-[#CCE2FE]',
        capsuleBg: 'bg-[#F8FAFF]/95',
        capsuleBorder: 'border-blue-300/60',
        capsuleShadow: 'shadow-[0_8px_30px_rgba(59,130,246,0.16)]',
        chatBtnBg: 'bg-[#0F172A] hover:bg-black text-white',
        icon: <Sparkles className="w-4 h-4 text-white" strokeWidth={1.8} />,
        lightBg: 'bg-blue-50/70',
        accentText: 'text-blue-800',
        sendBtnBg: 'bg-blue-900 hover:bg-stone-900',
        ambientRing: 'ring-blue-400/30',
        orbGradient: 'from-blue-400/25 via-indigo-300/15 to-white/70',
        orbShadow: 'shadow-[0_16px_36px_rgba(37,99,235,0.22),0_4px_12px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)]',
        specularTint: 'from-blue-200/40 via-white/50 to-white/90',
      };
    case 'experience-end':
    case 'report':
    case 'profile':
      return {
        stageLabel: '阶段 04 · 画像中心',
        subtitle: '能力雷达与综合认证',
        agentName: '复盘认证 Agent',
        dotColor: 'bg-orange-500',
        pulseGlow: 'bg-orange-400',
        badgeBg: 'bg-[#FFE4D6]',
        badgeText: 'text-[#431407]',
        badgeBorder: 'border-[#FED7AA]',
        outerRingBg: 'bg-[#FFF3EC]',
        outerRingBorder: 'border-[#FEDCC8]',
        capsuleBg: 'bg-[#FFFBF8]/95',
        capsuleBorder: 'border-orange-300/60',
        capsuleShadow: 'shadow-[0_8px_30px_rgba(249,115,22,0.16)]',
        chatBtnBg: 'bg-[#3B1E05] hover:bg-black text-white',
        icon: <Award className="w-4 h-4 text-white" strokeWidth={1.8} />,
        lightBg: 'bg-rose-50/70',
        accentText: 'text-rose-900',
        sendBtnBg: 'bg-[#3B1E05] hover:bg-black',
        ambientRing: 'ring-rose-400/30',
        orbGradient: 'from-rose-400/25 via-orange-300/15 to-white/70',
        orbShadow: 'shadow-[0_16px_36px_rgba(225,29,72,0.22),0_4px_12px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)]',
        specularTint: 'from-rose-200/40 via-white/50 to-white/90',
      };
    default:
      return {
        stageLabel: 'AI 协同顾问',
        subtitle: '全流程职业潜能探索',
        agentName: '成长伙伴 Agent',
        dotColor: 'bg-amber-500',
        pulseGlow: 'bg-stone-400',
        badgeBg: 'bg-stone-100',
        badgeText: 'text-stone-900',
        badgeBorder: 'border-stone-200',
        outerRingBg: 'bg-[#FAF7F0]',
        outerRingBorder: 'border-stone-200',
        capsuleBg: 'bg-[#FAF9F5]/95',
        capsuleBorder: 'border-stone-300/80',
        capsuleShadow: 'shadow-[0_8px_24px_rgba(0,0,0,0.08)]',
        chatBtnBg: 'bg-stone-900 hover:bg-black text-white',
        icon: <Sparkles className="w-4 h-4 text-white" strokeWidth={1.8} />,
        lightBg: 'bg-stone-50/70',
        accentText: 'text-stone-800',
        sendBtnBg: 'bg-stone-900 hover:bg-black',
        ambientRing: 'ring-stone-400/20',
        orbGradient: 'from-stone-300/25 via-amber-100/20 to-white/70',
        orbShadow: 'shadow-[0_16px_36px_rgba(28,25,23,0.16),0_4px_12px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)]',
        specularTint: 'from-stone-200/40 via-white/50 to-white/90',
      };
  }
};

export const GlobalAIAgentWidget: React.FC<GlobalAIAgentWidgetProps> = ({
  currentScreen,
  unlockedCards,
  slottedCards = [],
  onOpenWiki,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeAgentId, setActiveAgentId] = useState<AgentType>(SCREEN_DEFAULT_AGENT[currentScreen] || 'growth_companion');
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showAgentSwitch, setShowAgentSwitch] = useState(false);
  const isDraggingRef = useRef(false);

  // Global Codex-like Selection Toolbar State (划词提问 / 加入对话)
  const [floatingToolbar, setFloatingToolbar] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // Global selection change & mouseup listener across ALL steps and modals
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        return;
      }
      const text = sel.toString().trim();
      if (text.length >= 2 && text.length < 500) {
        try {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setFloatingToolbar({
              text,
              x: Math.max(12, Math.min(window.innerWidth - 310, rect.left + rect.width / 2 - 145)),
              y: Math.max(12, rect.top - 46)
            });
          }
        } catch {
          // ignore range errors
        }
      }
    };

    const handleMouseUp = () => {
      setTimeout(handleSelectionChange, 30);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#global-selection-toolbar')) {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) {
          setFloatingToolbar(null);
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Handle Codex-style Quote Action (划词后加入对话)
  const handleQuoteAction = (actionType: 'ask' | 'explain' | 'analyze') => {
    if (!floatingToolbar) return;
    const quoteText = floatingToolbar.text;
    setFloatingToolbar(null);

    // Clear document selection
    try {
      window.getSelection()?.removeAllRanges();
    } catch {
      // ignore
    }

    // Open floating dialogue canvas
    setIsOpen(true);

    let prompt = '';
    if (actionType === 'explain') {
      prompt = `【划词释义】请帮我解释选中的内容：“${quoteText}”`;
    } else if (actionType === 'analyze') {
      prompt = `【划词推演】请从岗位技能与实战决策角度深度解析：“${quoteText}”`;
    } else {
      prompt = `【划词提问】针对：“${quoteText}”，请为我提供针对性的解答与行动建议。`;
    }

    handleSendMessage(prompt);
  };

  // Synchronize stage theme based on current screen
  const theme = useMemo(() => getStageTheme(currentScreen), [currentScreen]);

  // Auto-switch default agent when screen changes
  useEffect(() => {
    setActiveAgentId(SCREEN_DEFAULT_AGENT[currentScreen] || 'growth_companion');
  }, [currentScreen]);

  const activeAgent = AGENT_REGISTRY[activeAgentId];

  // Identify currently slotted cards for contextual suggestions
  const activeSlottedCards = useMemo(() => {
    const valid = slottedCards.filter((c): c is SkillCard => c !== null);
    if (valid.length > 0) return valid;
    return unlockedCards.slice(0, 3);
  }, [slottedCards, unlockedCards]);

  const slottedTitles = useMemo(() => activeSlottedCards.map(c => c.title), [activeSlottedCards]);

  // Contextual quick prompts per active agent
  const contextualPrompts = useMemo(() => {
    switch (activeAgentId) {
      case 'growth_companion':
        return [
          '帮我提炼这段经历里的客观事实与潜力推断',
          '如何区分我简历中的「主观自述」和「客观证据」？',
        ];
      case 'career_path':
        if (currentScreen === 'career-explore' && slottedTitles.length >= 2) {
          return [
            `分析【${slottedTitles[0]}】+【${slottedTitles[1]}】的核心推荐依据`,
            '对比「AI产品经理」与「解决方案架构」的路径差异',
          ];
        }
        return [
          '结合我的能力卡推荐最契合的职业路径',
          '进入试路任务前，我还需要验证哪些未知项？',
        ];
      case 'industry_expert':
        return [
          '北上深杭 AI 产品经理薪资与招聘要求真实分布',
          '大厂与初创团队对 AI PM 的核心能力要求差异',
        ];
      case 'task_coach':
        return [
          '工单日志中显示 46% 差评的深层原因是什么？',
          '给我一个思考框架提示（请不要直接给答案）',
        ];
      case 'review_reflection':
        return [
          '我的试路产出形成了哪些关键体验证据？',
          '产品 3 的实操数据是如何写回能力画像的？',
        ];
      default:
        return [
          '了解当前 Agent 的核心职责',
          '为我提供当前阶段的行动建议',
        ];
    }
  }, [activeAgentId, currentScreen, slottedTitles]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      agentId: 'growth_companion',
      text: `你好！我是【成长陪伴 Agent】。\n我会陪你追问经历细节，提炼专属能力卡，严格区分「客观事实 / 主观自述 / 潜力推断」由你确认后写入画像。`,
      timestamp: '刚刚',
      actionSuggestions: [
        '帮我拆解一段经历里的事实与推断',
        '如何提炼高含金量能力卡？'
      ],
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Switch agent
  const handleSelectAgent = (agentId: AgentType) => {
    setActiveAgentId(agentId);
    setShowAgentSwitch(false);
    const agent = AGENT_REGISTRY[agentId];
    
    let greeting = `已为你接入【${agent.name}】（${agent.productTag}）。\n${agent.description}`;
    if (agentId === 'career_path' && slottedTitles.length > 0) {
      greeting += `\n\n🎯 实时卡组连接：已同步【${slottedTitles.join('、')}】能力卡，准备进行路径推演。`;
    }

    setMessages(prev => [
      ...prev,
      {
        id: `agent-switch-${Date.now()}`,
        sender: 'ai',
        agentId: agentId,
        text: greeting,
        timestamp: '刚刚',
        actionSuggestions: contextualPrompts
      }
    ]);
  };

  // Listen for global open-agent-chat custom events from any speaking Agent component
  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent<{ agentId?: AgentType; initialPrompt?: string }>;
      const targetAgent = customEvent.detail?.agentId || SCREEN_DEFAULT_AGENT[currentScreen] || 'growth_companion';
      setActiveAgentId(targetAgent);
      setIsOpen(true);
      if (customEvent.detail?.initialPrompt) {
        handleSendMessage(customEvent.detail.initialPrompt);
      }
    };
    window.addEventListener('open-agent-chat', handleOpenChat);
    return () => window.removeEventListener('open-agent-chat', handleOpenChat);
  }, [currentScreen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText.trim();
    if (!query) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: '刚刚',
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsThinking(true);

    // Realistic AI inference pacing with thinking animation
    setTimeout(() => {
      let reply = '';
      let suggestions: string[] = [];
      let breakdown: Message['breakdown'] | undefined = undefined;
      let citation: Message['citation'] | undefined = undefined;

      if (query.includes('【划词') || query.includes('“')) {
        if (activeAgentId === 'task_coach') {
          reply = `🔍 **针对划词内容分析（任务教练视角）**：\n你选中的文本是典型的业务痛点/核心参数！在撰写 PRD 时：\n1. 可将其直接引用为「核心问题归因」的定性/定量论据；\n2. 在「优化方向」中设计意图分流与澄清追问卡片予以解决；\n3. 结合 ROI 测算表量化节省的 Token 开销。`;
          suggestions = ['如何将这段划词引用到方案中？', '需要补充哪些佐证数据？'];
        } else if (activeAgentId === 'growth_companion') {
          reply = `🌱 **针对划词经历解构（成长陪伴视角）**：\n这段描述中蕴含了关键的能力信号！我已为你标记为重要证据，可在经历卡片中转化为可量化的事实依据（Fact）与潜力推断（Inference）。`;
          breakdown = {
            fact: query.length > 50 ? query.slice(0, 50) + '...' : query,
            selfReport: '用户自主划选经历与行为描述',
            inference: '展现了优秀的业务拆解力与自主探索意愿'
          };
          suggestions = ['写入我的能力画像', '继续提炼其他经历证据'];
        } else if (activeAgentId === 'career_path') {
          reply = `🧭 **针对划词路径推演（路径规划视角）**：\n这段内容与 AI 产品经理 / 解决方案架构师的画像高度契合，建议在后续实战步骤中重点体现你对这一要点的方案解决能力。`;
          suggestions = ['查看契合度分析', '推演下一步能力卡组'];
        } else {
          reply = `💡 **针对选中文本深度分析**：\n针对“${query.slice(0, 40)}...”，在当前业务场景下需要重点关注其背后的用户意图与系统响应机制，确保方案逻辑自洽且兼顾产出 ROI。`;
          suggestions = ['为我提供进一步行动建议', '查看相关知识库'];
        }
      } else if (activeAgentId === 'growth_companion') {
        reply = `收到！针对你的描述，我已为你进行三层解构并提炼核心能力：`;
        breakdown = {
          fact: '走访 6 栋宿舍调研二手书痛点，设立集中转交点，首月撮合 800+ 笔真实流转。',
          selfReport: '“平时对摄影构图有长期兴趣，喜欢主动记录生活，善于从琐碎日常中观察规律。”',
          inference: '具备极强的一线「用户痛点同理心」与「MVP 敏捷闭环落地力」，可在 AI 业务中负责冷启动及工单归因。'
        };
        reply += `\n\n❓ 追问确认：提炼出的能力卡与你的真实体感是否吻合？你可在验证页面确认、微调或标记暂不确定。`;
        suggestions = ['确认并生成能力卡牌', '对潜力推断部分做微调'];
      } else if (activeAgentId === 'career_path') {
        reply = `为你进行路径推演分析：\n你的卡牌组合在「AI产品经理」路径契合度达 94%，核心优势在于兼具【用户痛点捕捉】与【技术落地执行】。`;
        reply += `\n\n建议重点关注：\n1. 如何将模型生成的不确定性转化为确定性的产品体验？\n2. 从需求分析到PRD撰写的端到端闭环能力。`;
        suggestions = ['查看AI产品经理技能雷达', '进入阶段03试路实战验证'];
        citation = {
          source: '2026 Q1 AI产品岗位人才画像调研 (样本量 N=420)',
          updatedAt: '2026-02-10'
        };
      } else if (activeAgentId === 'industry_expert') {
        reply = `行业一手洞察反馈：\n当前市场上「懂业务痛点 + 懂模型边界」的复合型 AI PM 极其稀缺。初创企业注重敏捷MVP，成熟大厂则更看重 ROI度量、Token成本优化与意图分流架构。`;
        suggestions = ['查看北上深杭薪酬区间', '了解一线团队面试高频考察点'];
        citation = {
          source: '前沿AI科技人才招聘白皮书',
          updatedAt: '2026-03-01'
        };
      } else if (activeAgentId === 'task_coach') {
        reply = `💡 试路任务教练点拨：\n请注意资料区中的工单采样与 Trace 日志：\n46% 的差评集中在“简单问题回答过长”。建议思考：是否可以通过「意图分类器」分流长短Query，并结合前端「追问澄清卡片」改善？`;
        suggestions = ['如何计算Token成本节省ROI？', '帮我检查当前PRD草案完整度'];
      } else {
        reply = `恭喜完成试路全流程！你的方案已形成结构化评测报告与高阶能力卡，并沉淀为可信画像。`;
        suggestions = ['查看完整能力评测报告', '导出职业证明卡组'];
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        agentId: activeAgentId,
        text: reply,
        timestamp: '刚刚',
        actionSuggestions: suggestions,
        breakdown,
        citation
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
    }, 900);
  };

  return (
    <>
      {/* 
        ========================================================================
        UNIVERSAL CODEX-STYLE FLOATING SELECTION TOOLBAR (划词提问 / 加入对话)
        (Active across all screens, cards, modals, and simulation views)
        ========================================================================
      */}
      <AnimatePresence>
        {floatingToolbar && (
          <motion.div
            id="global-selection-toolbar"
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 6 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: floatingToolbar.y,
              left: floatingToolbar.x,
              zIndex: 99999
            }}
            className="bg-stone-950/95 text-white rounded-full px-2 py-1 shadow-2xl border border-amber-400/50 flex items-center gap-1 backdrop-blur-md select-none pointer-events-auto ring-1 ring-white/10"
          >
            <button
              onClick={() => handleQuoteAction('ask')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-950" />
              <span>✨ 划词问 AI</span>
            </button>

            <button
              onClick={() => handleQuoteAction('explain')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-white/20 text-stone-200 text-xs transition cursor-pointer active:scale-95"
            >
              <span>🔍 解释概念</span>
            </button>

            <button
              onClick={() => handleQuoteAction('analyze')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-white/20 text-stone-200 text-xs transition cursor-pointer active:scale-95"
            >
              <span>💡 深度推演</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        ========================================================================
        DRAGGABLE FLOATING AI COPILOT DOCK
        (Small round ball feel, smooth drag across screen, flat Craft design)
        ========================================================================
      */}
      <div className="fixed top-[74px] right-3 sm:right-6 z-50 pointer-events-none">
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.08}
          onDragStart={() => {
            isDraggingRef.current = true;
          }}
          onDragEnd={() => {
            setTimeout(() => {
              isDraggingRef.current = false;
            }, 80);
          }}
          className="relative pointer-events-auto select-none"
        >
          <AnimatePresence mode="wait">
            {!isOpen ? (
              /* ===================================================================
                 COLLAPSED STATE: Draggable Floating Round Ball (可移动小圆球)
                 =================================================================== */
              <motion.div
                key="collapsed-dock-tab"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => {
                  if (!isDraggingRef.current) {
                    setIsOpen(true);
                  }
                }}
                className="cursor-grab active:cursor-grabbing group flex items-center justify-end select-none"
                id="global-ai-agent-tab"
                title={`点击唤起 ${theme.agentName} · 可按住随意拖拽移动`}
              >
                <div
                  className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white/95 hover:bg-white border border-stone-200/90 hover:border-stone-300 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {/* Flat Inner Icon Orb */}
                  <div className="w-8.5 h-8.5 rounded-full bg-stone-900 text-white flex items-center justify-center relative shadow-xs transition-transform duration-200 group-hover:scale-105">
                    {theme.icon}
                    {/* Status Dot */}
                    <span 
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${theme.dotColor} border-2 border-white`} 
                    />
                  </div>

                  {/* Hover Floating Pill Hint (Appears to the left of the round ball) */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: 8, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/90 text-white backdrop-blur-md shadow-lg border border-stone-700/50 whitespace-nowrap pointer-events-none"
                      >
                        <span className="text-xs font-serif craft-serif font-medium">{theme.agentName}</span>
                        <span className="text-[10px] text-stone-400 font-mono">· 点击对话</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              /* ===================================================================
                 EXPANDED DIALOGUE CANVAS: Draggable Craft-Style Window
                 =================================================================== */
              <motion.div
                key="expanded-canvas"
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.2 }}
                className="w-[360px] sm:w-[420px] max-w-[calc(100vw-24px)] h-[580px] max-h-[calc(100vh-95px)] rounded-3xl bg-white/98 backdrop-blur-xl shadow-xl border border-stone-200/90 flex flex-col overflow-hidden mr-1 mt-1"
              >
                {/* TOP HEADER: Clean Capsule Header with Drag Affordance */}
                <div className="px-5 py-3.5 bg-white/75 backdrop-blur-2xl flex items-center justify-between shrink-0 relative z-20 border-b border-stone-100/80 cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-8.5 h-8.5 rounded-2xl bg-stone-950 text-white flex items-center justify-center shadow-md">
                      {AGENT_ICONS[activeAgentId]}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${theme.dotColor} shadow-2xs`} />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setShowAgentSwitch(!showAgentSwitch)}
                        className="flex items-center gap-1 text-stone-900 font-bold text-sm tracking-tight font-serif craft-serif hover:opacity-80 transition cursor-pointer"
                        title="切换协同 Agent"
                      >
                        <span>{activeAgent.name}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${showAgentSwitch ? 'rotate-180' : ''}`} />
                      </button>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText} shadow-2xs`}>
                        {activeAgent.productTag}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 font-medium">
                      {theme.stageLabel} · 协同顾问
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {onOpenWiki && (
                    <button
                      onClick={onOpenWiki}
                      className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition shadow-2xs cursor-pointer"
                      title="查看岗位百科"
                    >
                      <Compass className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsHovered(false);
                    }}
                    className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-500 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                    title="收起浮窗"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* AGENT ROSTER DROPDOWN (Zero Border Glass Sheet) */}
              <AnimatePresence>
                {showAgentSwitch && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 py-2.5 bg-stone-50/95 backdrop-blur-xl shrink-0 space-y-1.5 border-b border-stone-200/60 shadow-inner"
                  >
                    <span className="text-[10px] font-bold text-stone-400 block px-1">
                      选择接入协同 Agent：
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(AGENT_REGISTRY) as AgentType[]).map((agentKey) => {
                        const item = AGENT_REGISTRY[agentKey];
                        const isSelected = activeAgentId === agentKey;
                        return (
                          <button
                            key={agentKey}
                            onClick={() => handleSelectAgent(agentKey)}
                            className={`p-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-stone-900 text-white shadow-sm'
                                : 'bg-white/80 hover:bg-white text-stone-700 shadow-2xs'
                            }`}
                          >
                            <span className="scale-80">{AGENT_ICONS[agentKey]}</span>
                            <span className="truncate">{item.shortName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 
                ================================================================
                UPPER SECTION: AI 消息流展示区 (带平滑自动滚动)
                ================================================================
              */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-gradient-to-b from-stone-50/40 via-white/20 to-white/60">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {/* Avatar / Tag Label for Sender */}
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      {msg.sender === 'ai' ? (
                        <>
                          <div className="w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center text-[9px] shadow-2xs">
                            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                          </div>
                          <span className="text-[10px] font-bold text-stone-600 font-serif craft-serif">
                            {msg.agentId ? AGENT_REGISTRY[msg.agentId].name : activeAgent.name}
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] font-medium text-stone-400">你</span>
                      )}
                      <span className="text-[9px] text-stone-400">{msg.timestamp}</span>
                    </div>

                    {/* Message Bubble Content */}
                    <div
                      className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-stone-900 text-white rounded-tr-xs shadow-md'
                          : 'bg-white/95 text-stone-900 rounded-tl-xs border border-stone-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03),0_1px_1px_rgba(255,255,255,0.95)_inset] space-y-2'
                      }`}
                    >
                      <div className="whitespace-pre-line font-normal">{msg.text}</div>

                      {/* Tri-part Breakdown */}
                      {msg.breakdown && (
                        <div className="pt-1.5 mt-1.5 space-y-1.5 text-[11px]">
                          {msg.breakdown.fact && (
                            <div className="p-2 rounded-xl bg-emerald-50/80 shadow-2xs">
                              <span className="font-bold text-emerald-900">📌 客观事实 (Fact)：</span>
                              <p className="text-stone-700 mt-0.5">{msg.breakdown.fact}</p>
                            </div>
                          )}
                          {msg.breakdown.selfReport && (
                            <div className="p-2 rounded-xl bg-blue-50/80 shadow-2xs">
                              <span className="font-bold text-blue-900">💬 主观自述 (Self-Report)：</span>
                              <p className="text-stone-700 mt-0.5">{msg.breakdown.selfReport}</p>
                            </div>
                          )}
                          {msg.breakdown.inference && (
                            <div className="p-2 rounded-xl bg-purple-50/80 shadow-2xs">
                              <span className="font-bold text-purple-900">💡 潜力推断 (Inference)：</span>
                              <p className="text-stone-700 mt-0.5">{msg.breakdown.inference}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Citation & Timestamp */}
                      {msg.citation && (
                        <div className="pt-1 mt-1 p-2 rounded-xl bg-purple-50/70 text-[10px] text-purple-950 flex flex-col gap-0.5 shadow-2xs">
                          <div className="flex items-center gap-1 font-bold">
                            <FileText className="w-3 h-3 text-purple-700" />
                            <span>来源：{msg.citation.source}</span>
                          </div>
                          <div className="flex items-center gap-1 text-purple-700">
                            <Clock className="w-3 h-3 text-purple-600" />
                            <span>更新：{msg.citation.updatedAt}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* High-Fidelity Dot-Matrix Wave Thinking Indicator (拟人化思考与点阵波动) */}
                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                    className="flex flex-col items-start gap-2 max-w-[92%]"
                  >
                    {/* Agent Identification Badge */}
                    <div className="flex items-center gap-1.5 pl-1">
                      <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-xs">
                        <Sparkles className="w-2.8 h-2.8 text-amber-300 animate-spin" />
                      </div>
                      <span className="text-[11px] font-bold text-stone-800 font-serif">
                        {activeAgent.name}
                      </span>
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder}`}>
                        深度思考中
                      </span>
                    </div>

                    {/* Frosted Glass Thinking Card with Dot-Matrix Wave */}
                    <div className="bg-white/95 backdrop-blur-xl border border-stone-200/80 rounded-2xl rounded-tl-xs p-3 shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,1)] space-y-2 w-full">
                      {/* Top: Dot Matrix Waveform Visual */}
                      <div className="flex items-center justify-between pb-1 border-b border-stone-100/90">
                        <div className="flex items-center gap-1.5">
                          {/* 5-Bar Dot Matrix Wave Equalizer */}
                          <div className="flex items-center gap-1 h-4 px-1">
                            {[
                              { delay: 0, minH: '4px', maxH: '14px' },
                              { delay: 0.15, minH: '6px', maxH: '16px' },
                              { delay: 0.3, minH: '3px', maxH: '12px' },
                              { delay: 0.45, minH: '8px', maxH: '16px' },
                              { delay: 0.6, minH: '4px', maxH: '14px' },
                            ].map((bar, idx) => (
                              <motion.span
                                key={idx}
                                animate={{
                                  height: [bar.minH, bar.maxH, bar.minH],
                                  opacity: [0.4, 1, 0.4]
                                }}
                                transition={{
                                  duration: 1.1,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                  delay: bar.delay
                                }}
                                className={`w-1 rounded-full ${theme.dotColor}`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-medium text-stone-700 tracking-tight">
                            正在结合上下文与卡包数据推演
                          </span>
                        </div>

                        {/* Animated Pulsing Orbit Status */}
                        <div className="flex items-center gap-1 pr-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor} animate-ping`} />
                          <span className="text-[9px] font-mono text-stone-400">AI INFERRING</span>
                        </div>
                      </div>

                      {/* Bottom: Simulated Step-by-Step Reasoning Hint */}
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-mono">
                        <span className="animate-pulse">⚡ 正在执行：客观事实检索 → 意图分流 → 方案 ROI 评估</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* 
                ================================================================
                LOWER SECTION: 用户输入与发送操作区 (典型聊天界面布局与加载反馈)
                ================================================================
              */}
              <div className="bg-white/95 backdrop-blur-2xl border-t border-stone-100/90 p-3.5 space-y-2 shrink-0">
                
                {/* Contextual Quick Prompts Stack */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[10px] font-bold text-stone-500 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-amber-600" />
                      <span>推荐追问</span>
                    </span>
                    <span className="text-[9px] text-stone-400 font-mono">
                      点击一键发送
                    </span>
                  </div>
                  
                  <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar pr-0.5">
                    {contextualPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        disabled={isThinking}
                        onClick={() => handleSendMessage(prompt)}
                        className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-xl bg-stone-50/90 hover:bg-stone-100 text-stone-800 font-medium border border-stone-100 transition-all flex items-center justify-between gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <Sparkle className={`w-2.5 h-2.5 ${theme.accentText} shrink-0`} />
                          <span className="truncate">{prompt}</span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-stone-400 group-hover:text-stone-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Box and Send Controls */}
                <div className="flex items-center gap-2 bg-stone-50/90 focus-within:bg-white p-1.5 rounded-2xl border border-stone-200/80 focus-within:border-stone-400 focus-within:ring-2 focus-within:ring-amber-500/10 transition-all">
                  <input
                    type="text"
                    disabled={isThinking}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isThinking) {
                        handleSendMessage();
                      }
                    }}
                    placeholder={isThinking ? `${activeAgent.name} 正在思考回复...` : `向 ${activeAgent.name} 提问 (按 Enter 发送)...`}
                    className="flex-1 bg-transparent text-stone-900 text-xs px-2.5 py-1.5 outline-none transition-all placeholder:text-stone-400 disabled:text-stone-400"
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isThinking}
                    title={isThinking ? '正在生成回复...' : '发送消息'}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 ${
                      isThinking
                        ? 'bg-stone-800 text-amber-300 cursor-wait shadow-sm'
                        : inputText.trim()
                          ? `${theme.sendBtnBg} text-white shadow-md active:scale-95`
                          : 'bg-stone-200/80 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    {isThinking ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Footer hint */}
                <div className="flex items-center justify-between text-[9px] text-stone-400 px-1 pt-0.5">
                  <span>支持对经历、能力卡与行业数据深度追问</span>
                  <span className="flex items-center gap-0.5">
                    <CornerDownLeft className="w-2.5 h-2.5" />
                    <span>Enter 发送</span>
                  </span>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
    </>
  );
};
