import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { STAGE_TWO_SIMULATION, WORKPLACE_DOCUMENTS } from '../data/mockData';
import { WorkplaceDoc, EvaluationReport } from '../types';
import {
  FileText,
  Code2,
  Table,
  FileCheck,
  Paperclip,
  Mic,
  Send,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  Maximize2,
  Minimize2,
  X,
  Copy,
  Check,
  Folder,
  Layers,
  Sparkle,
  Eye,
  ArrowRight,
  ChevronRight,
  HelpCircle,
  Award,
  CheckCheck,
  FileUp,
  RefreshCw,
  Plus,
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowLeft,
  Quote,
  Zap,
  ExternalLink,
  MessageSquare,
  Clock,
  LogOut,
  Target,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StageTwoSimulationProps {
  onOpenDoc?: (doc: WorkplaceDoc) => void;
  onBackToStageOne?: () => void;
  onNavigate?: (screen: string) => void;
  onSubmitSuccess: (report: EvaluationReport) => void;
  onFocusModeChange?: (isFocus: boolean) => void;
}

interface ChatMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  timestamp: string;
  isAction?: boolean;
}

export const StageTwoSimulation: React.FC<StageTwoSimulationProps> = ({
  onOpenDoc,
  onBackToStageOne,
  onNavigate,
  onSubmitSuccess,
  onFocusModeChange,
}) => {
  const task = STAGE_TWO_SIMULATION;

  // Focus Mode toggle: Starts in briefing view (false), clicks to enter active workspace (true)
  const [isFocusMode, setIsFocusModeState] = useState<boolean>(false);

  const setIsFocusMode = (val: boolean) => {
    setIsFocusModeState(val);
    if (onFocusModeChange) {
      onFocusModeChange(val);
    }
  };

  // Top context bar / drawer state
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState<boolean>(false);

  // Active open documents
  const [activeDocId, setActiveDocId] = useState<string>('doc-user-feedback');
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  // PRD Deliverables matching the 3 core requirements
  // 1. 找出核心问题
  const [problemAnalysis, setProblemAnalysis] = useState(
    '1. 核心痛点聚类：短Query回答过于冗长繁复（工单抱怨占比46%），缺少结构化提炼与结论先行；\n2. 技术因果归因：System Prompt中详尽性权重失衡（v1.4_verbose），缺少多轮意图澄清机制；\n3. 业务影响量化：第2-3轮重新生成率飙升至42.1%，导致用户断崖式跳出流失（跳出率达58.2%）。'
  );

  // 2. 提出优化方向
  const [solutionStrategy, setSolutionStrategy] = useState(
    '1. 意图分流架构：引入轻量意图识别分类器，将Query精准分流为「直接速答」与「深度研究」双模式；\n2. 主动澄清交互：引入“主动追问澄清卡片”（Pill Tags），当输入歧义时提供3个一键选项降低输入成本；\n3. 渐进式呈现：默认输出精简核心结论，将详尽推演折叠为「展开详细依据」按需取用。'
  );

  // 3. 说明设计理由
  const [roiAndRationale, setRoiAndRationale] = useState(
    '1. 用户体验价值：首屏有效信息获取效率提升60%，显著降低多轮无效交互摩擦；\n2. 技术成本优化：速答模式与精简Prompt预计节省59% Token调用开销（月省¥104,000）；\n3. 预期核心指标：降低第2轮重新生成率15%，将次周留存率由52.1%提升至74.5%。'
  );

  // Active section in output area (1: 核心问题, 2: 优化方向, 3: 设计理由, 'all': 完整方案)
  const [outputTab, setOutputTab] = useState<1 | 2 | 3 | 'all'>(1);

  // Citation modal & voice simulation
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Right Side AI Mentor chat conversation
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent',
      text: '你好！我是你的任务教练 Agent。你可以浏览上方项目资料，遇到不确定的业务逻辑或数据归因，随时点击快捷提示或直接向我提问。',
      timestamp: '15:20'
    }
  ]);
  const [userChatInput, setUserChatInput] = useState('');

  // Preview Modal on Briefing View
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);
  const previewDoc = WORKPLACE_DOCUMENTS.find((d) => d.id === previewDocId) || null;

  // Post-submission evaluation report
  const [evaluationResult, setEvaluationResult] = useState<EvaluationReport | null>(null);

  // Currently active document object
  const activeDoc = WORKPLACE_DOCUMENTS.find((d) => d.id === activeDocId) || WORKPLACE_DOCUMENTS[0];

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle Mentor Quick Prompts
  const handleMentorQuickAction = (action: 'explain' | 'analyze' | 'solution-hint' | 'review-draft') => {
    let userText = '';
    let agentReply = '';

    if (action === 'explain') {
      userText = '请解析任务核心考核点与交付要求';
      agentReply =
        '📌 **任务核心目标**：\n你需要定位 AI 助手在用户问短句时回答冗长且跳出率飙升的根因。\n\n**三大交付物**：\n1. **找出核心问题**：从工单与Trace定位问题根因；\n2. **提出优化方向**：设计意图分流、Prompt约束与主动追问澄清卡片；\n3. **说明设计理由**：量化用户体验收益与算力Token成本节省。';
    } else if (action === 'analyze') {
      userText = '帮我交叉分析当前项目资料的关键数据';
      agentReply =
        '🔍 **资料交叉归因要点**：\n· **工单反馈**：46%用户抱怨短句回答冗长，32%抱怨没有主动追问；\n· **Trace日志**：证实 System Prompt 强制启用 "v1.4_verbose" 详尽模式；\n· **会话漏斗**：第 2-3 轮重新生成率飙升至 42.1%，导致跳出率突破 58%；\n· **竞品方案**：推荐引入 "主动澄清卡片（Pill Tags）" 与 "渐进式折叠"。';
    } else if (action === 'solution-hint') {
      userText = '优化方案有什么推荐的高分落地结构？';
      agentReply =
        '💡 **高分 AI 产品方案结构建议**：\n1. **轻量分类器分流**：区分「事实速答」与「深度推演」；\n2. **主动澄清卡片**：模糊输入时提供 2-3 个一键澄清选项；\n3. **Prompt工程规范**：Few-shot 示例 + JSON Schema 输出防冗余；\n4. **算力与留存 ROI**：测算预计节省 59% Token 开销与留存提升。';
    } else if (action === 'review-draft') {
      userText = '请帮我预审一下当前的方案草稿';
      agentReply =
        '🌟 **草稿预审诊断（S级潜力）**：\n方案逻辑闭环非常完整！不仅准确找出了 46% 冗长抱怨与 Trace 冗余根因，还提出了极具实操性的意图分流与主动澄清卡片，同时量化了月省 10 万算力的商业收益。可直接点击提交方案！';
    }

    setChatMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: `agent-${Date.now() + 1}`,
        sender: 'agent',
        text: agentReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Send custom chat message to Agent Mentor
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatInput.trim()) return;

    const query = userChatInput.trim();
    setUserChatInput('');

    setChatMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setTimeout(() => {
      let reply = `非常好的思考！针对“${query.slice(0, 15)}...”，建议在方案第2部分补充具体的人机交互卡片（Pill Chips）设计，并在第3部分结合《业务Q3目标与算力ROI测算.sheet》进行量化佐证。`;
      if (query.includes('怎么做') || query.includes('思路') || query.includes('模板')) {
        reply = '你可以直接参考我们为你准备的标准 PRD 模版，依次把「1. 核心问题」、「2. 优化方向」和「3. 设计理由与ROI」填满，点击底部提交即可获得深度评估！';
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 600);
  };

  // Extract / Cite document snippet into output area
  const handleCiteDocSnippet = (targetSection: 1 | 2 | 3, text: string) => {
    if (targetSection === 1) {
      setProblemAnalysis((prev) => prev + `\n· [引用: ${activeDoc.title}] ${text}`);
    } else if (targetSection === 2) {
      setSolutionStrategy((prev) => prev + `\n· [引用: ${activeDoc.title}] ${text}`);
    } else {
      setRoiAndRationale((prev) => prev + `\n· [引用: ${activeDoc.title}] ${text}`);
    }

    setChatMessages((prev) => [
      ...prev,
      {
        id: `cite-${Date.now()}`,
        sender: 'agent',
        text: `已将《${activeDoc.title}》的关键信息引用至方案第 ${targetSection} 部分。`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Voice recording simulation
  const handleVoiceSimulate = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setSolutionStrategy(
        (prev) =>
          prev +
          '\n4. 容错与反馈兜底：当模型置信度低于0.6时，主动触发澄清气泡，支持用户一键切换「简短速答 / 详尽深度」模式。'
      );
      setChatMessages((prev) => [
        ...prev,
        {
          id: `voice-${Date.now()}`,
          sender: 'agent',
          text: '🎙️ 语音输入解析完成！已自动将「容错与反馈兜底策略」补充至优化方向中。',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  // Submit Deliverable to Evaluation
  const handleSubmit = () => {
    setIsEvaluating(true);

    setTimeout(() => {
      setIsEvaluating(false);

      const generatedReport: EvaluationReport = {
        score: 98,
        grade: 'S',
        summary:
          '你的方案展现出卓越的 AI 产品经理业务直觉与结构化落地功底！准确通过数据漏斗与 Trace 日志溯源，并提出了高 ROI 的意图分流与主动澄清卡片闭环。',
        radarScores: [
          { dimension: '用户同理与痛点洞察', score: 98, description: '精准命中46%冗长回答抱怨，提出结论先行与渐进折叠' },
          { dimension: 'AI架构与技术理解', score: 96, description: '提出轻量分类器分流与Prompt降耗，技术边界把控严密' },
          { dimension: '交互体验与微创新', score: 96, description: '引入主动追问澄清Pill芯片，显著降低用户多轮交互成本' },
          { dimension: '商业价值与ROI度量', score: 97, description: '清晰量化Token降本59%与次周留存提升至74.5%，商业逻辑严密' },
        ],
        strengths: [
          '逻辑严密：从工单定性到漏斗定量，形成了完美的数据与技术双向归因',
          '懂AI边界：善用主动澄清交互卡片弥补模型意图理解的不确定性',
          '交付感强：PRD结构清晰完整，研发与设计同学能够直接落地执行',
        ],
        recommendations: [
          '可进一步补充多模态（如表格与代码导出）的细粒度复制交互规范',
          '可增加灰度A/B测试方案的分组比例与防穿帮指标（Guardrail Metrics）',
        ],
        careerFitAdvice: '你非常适合 AI 产品经理（AI PM）及 AI 体验架构师岗位，具备极强的端到端产品定义力！',
      };

      setEvaluationResult(generatedReport);

      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }, 800);
  };

  // Helper to render doc content safely
  const renderDocContent = (content: WorkplaceDoc['content']) => {
    if (typeof content === 'string') {
      return <p className="text-xs text-stone-700 leading-relaxed font-normal whitespace-pre-wrap">{content}</p>;
    }
    if (Array.isArray(content)) {
      return (
        <div className="space-y-2.5">
          {content.map((block: any, idx: number) => {
            if (typeof block === 'string') {
              return <p key={idx} className="text-xs text-stone-700 leading-relaxed font-normal">{block}</p>;
            }
            if (block.type === 'heading') {
              return (
                <h4 key={idx} className="text-xs font-semibold text-stone-900 font-serif craft-serif pt-1">
                  {block.text}
                </h4>
              );
            }
            if (block.type === 'bullet') {
              return (
                <div key={idx} className="flex items-start gap-1.5 text-xs text-stone-600 pl-1">
                  <span className="text-stone-400 mt-0.5">•</span>
                  <span>{block.text}</span>
                </div>
              );
            }
            if (block.type === 'callout') {
              return (
                <div key={idx} className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-900 space-y-0.5">
                  <span className="font-medium font-mono text-[10px] text-amber-800">📌 重点关注</span>
                  <p>{block.text}</p>
                </div>
              );
            }
            if (block.type === 'code') {
              return (
                <pre key={idx} className="p-2.5 rounded-xl bg-stone-900 text-stone-200 text-[11px] font-mono overflow-x-auto">
                  {block.text}
                </pre>
              );
            }
            if (block.type === 'table') {
              return (
                <div key={idx} className="overflow-x-auto border border-stone-200 rounded-xl">
                  <table className="w-full text-[11px] text-stone-700 text-left">
                    <thead className="bg-stone-50 border-b border-stone-200 font-medium text-stone-900">
                      <tr>
                        {block.headers?.map((h: string, hIdx: number) => (
                          <th key={hIdx} className="px-2.5 py-1.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {block.rows?.map((r: string[], rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-stone-50/50">
                          {r.map((cell: string, cIdx: number) => (
                            <td key={cIdx} className="px-2.5 py-1.5">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
            return (
              <p key={idx} className="text-xs text-stone-700 leading-relaxed font-normal">
                {block.text || JSON.stringify(block)}
              </p>
            );
          })}
        </div>
      );
    }
    return <p className="text-xs text-stone-500">无法渲染文档内容</p>;
  };

  // =========================================================================
  // VIEW 1: STAGE 3 BRIEFING SCREEN (When not in focus mode)
  // =========================================================================
  if (!isFocusMode) {
    return (
      <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col justify-between max-w-6xl mx-auto px-4 sm:px-6 py-5 relative select-none">
        
        {/* Soft Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-50/50 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-stone-100/60 blur-3xl" />
        </div>

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-serif text-sm shadow-xs">
              03
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="craft-chip-blue text-[10px] font-mono font-medium px-2 py-0.5 rounded-full">
                  阶段 03 · 试路验证
                </span>
                <span className="text-[11px] text-stone-500 font-normal">
                  真实工作台实战模拟
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-normal text-stone-900 tracking-tight mt-0.5 font-serif craft-serif">
                AI 助手交互体验痛点归因与方案设计
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onBackToStageOne) onBackToStageOne();
              }}
              className="craft-btn-secondary py-1.5 px-3.5 text-xs text-stone-700"
            >
              返回探索
            </button>
            <button
              onClick={() => setIsFocusMode(true)}
              className="craft-btn-black py-2 px-5 text-xs sm:text-sm flex items-center gap-1.5 shadow-xs"
              id="btn-enter-simulation"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>进入实战工作台</span>
            </button>
          </div>
        </div>

        {/* Middle Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 my-3.5 min-h-0 relative z-10">
          
          {/* Left Column: Background & 3 Deliverables (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3 h-full">
            
            {/* Task Background Card */}
            <div className="craft-card rounded-2xl p-4.5 bg-white/90 border border-stone-200/60 flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-stone-900">📋 任务背景与核心矛盾</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200/60 font-medium">高优先级</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  业务线 AI 助手近期多轮跳出率飙升至 58.2%。大量用户反馈短输入时回答过于冗长，且无法理解意图。作为 AI 产品经理，你需要通过桌面 6 份真实资料完成归因并输出优化 PRD。
                </p>
              </div>

              {/* 3 Core Deliverables */}
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <span className="text-[11px] font-mono font-medium text-stone-800">🎯 三项核心交付物</span>
                <div className="space-y-1.5 text-xs text-stone-600 font-normal">
                  <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-mono shrink-0">1</span>
                    <span><strong>找出核心问题</strong>：工单定性与 Trace 日志根因</span>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-mono shrink-0">2</span>
                    <span><strong>提出优化方向</strong>：意图分流与主动追问澄清卡片</span>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/50 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-mono shrink-0">3</span>
                    <span><strong>说明设计理由</strong>：体验提升与 Token 降本 ROI 测算</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment Criteria Note */}
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex items-center justify-between text-xs text-blue-950">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="font-normal text-[11px]">考核维度：用户洞察 · AI边界理解 · 交互微创新 · 商业ROI</span>
              </div>
              <span className="text-[10px] font-mono font-medium text-blue-800">4项雷达指标</span>
            </div>

          </div>

          {/* Right Column: 6 Workplace Documents (7 cols) */}
          <div className="lg:col-span-7 craft-card rounded-2xl p-4.5 bg-white/90 border border-stone-200/60 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-mono font-semibold text-stone-900">工作台资料库（共 6 份文件）</span>
                </div>
                <span className="text-[10px] text-stone-400 font-normal">点击快速查阅</span>
              </div>

              {/* 6 Files Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3">
                {WORKPLACE_DOCUMENTS.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setPreviewDocId(doc.id)}
                    className="p-2.5 rounded-xl bg-stone-50/80 hover:bg-white border border-stone-200/60 hover:border-stone-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between min-h-[90px]"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-[10px] font-mono text-stone-500">{doc.tag}</span>
                        <FileText className="w-3.5 h-3.5 text-stone-400" />
                      </div>
                      <h4 className="text-xs font-medium text-stone-900 line-clamp-1">{doc.title}</h4>
                      <p className="text-[10px] text-stone-500 line-clamp-2 mt-0.5">{doc.summary}</p>
                    </div>
                    <span className="text-[9px] text-blue-600 font-medium pt-1">点击预览 &rarr;</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Helper Bar */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="text-[11px]">💡 进入实战后可随时向右侧任务教练请求数据分析与草稿预审</span>
              <button
                onClick={() => setIsFocusMode(true)}
                className="craft-btn-black py-1.5 px-4 text-xs flex items-center gap-1"
              >
                <span>立即进入</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

        {/* Quick Doc Preview Modal in Briefing Mode */}
        <AnimatePresence>
          {previewDoc && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setPreviewDocId(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[80vh] flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      {previewDoc.tag} · {previewDoc.fileSize}
                    </span>
                    <h3 className="text-base font-normal text-stone-900 font-serif craft-serif mt-1">
                      {previewDoc.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setPreviewDocId(null)}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                  {renderDocContent(previewDoc.content)}
                </div>

                <div className="pt-3 border-t border-stone-100 flex justify-end">
                  <button
                    onClick={() => {
                      setPreviewDocId(null);
                      setIsFocusMode(true);
                    }}
                    className="craft-btn-black py-2 px-5 text-xs flex items-center gap-1.5"
                  >
                    <span>在工作台中查看此文件</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE CRAFT WORKBENCH (Fits 100vh, Clean 70/30 Two-Column Layout)
  // =========================================================================
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FAF9F6] text-stone-900 flex flex-col font-sans select-none relative">
      
      {/* 
        ========================================================================
        1. TOP RESTRAINED WORKBENCH NAV BAR (Thin, Light, Craft Capsule Style)
        ========================================================================
      */}
      <div className="h-11 bg-white/80 backdrop-blur-xl border-b border-stone-200/70 px-4 flex items-center justify-between shrink-0 z-40">
        
        {/* Left: Brand / Task Identifier */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-stone-900 font-serif text-sm">
            <span className="w-5 h-5 rounded-lg bg-stone-900 text-white flex items-center justify-center text-[10px] font-mono">
              03
            </span>
            <span className="font-medium font-serif craft-serif text-xs sm:text-sm">AI PM 试路工作台</span>
          </div>

          <div className="h-3.5 w-px bg-stone-200 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-600">
            <span className="font-normal text-stone-800 truncate max-w-xs sm:max-w-md">
              AI 助手交互体验痛点归因与方案设计
            </span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200/60">
              实战进行中
            </span>
          </div>
        </div>

        {/* Right: Drawer Trigger & Exit Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTaskDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/70 text-xs font-medium transition cursor-pointer"
            title="查看任务背景与三大约束要求"
          >
            <Sparkles className="w-3 h-3 text-amber-700" />
            <span>任务要求</span>
          </button>

          <button
            onClick={() => setIsFocusMode(false)}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-normal transition cursor-pointer border border-stone-200/70"
            title="退出工作台返回阶段概览"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">退出工作台</span>
          </button>
        </div>

      </div>

      {/* 
        ========================================================================
        2. MAIN TWO-COLUMN SPLIT: LEFT 70% (MAIN WORKBENCH) | RIGHT 30% (AGENT PANEL)
        ========================================================================
      */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        
        {/* ====================================================================
            LEFT COLUMN (70%): MAIN WORKSPACE (DOC READER + PRD EDITOR)
            ==================================================================== */}
        <div className="w-full lg:w-[70%] flex flex-col gap-3 h-full overflow-hidden">
          
          {/* Upper Card: 资料阅读区 (Document Reader) */}
          <div className="craft-card rounded-2xl p-3 sm:p-4 bg-white/90 border border-stone-200/60 flex flex-col justify-between flex-1 min-h-0 overflow-hidden">
            
            {/* Top Document Switcher Tabs */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 shrink-0 gap-2 overflow-x-auto custom-scrollbar">
              <div className="flex items-center gap-1.5">
                {WORKPLACE_DOCUMENTS.map((doc) => {
                  const isActive = doc.id === activeDocId;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setActiveDocId(doc.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                        isActive
                          ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                          : 'bg-stone-50 hover:bg-white text-stone-600 border-stone-200/60'
                      }`}
                    >
                      <FileText className={`w-3 h-3 ${isActive ? 'text-blue-300' : 'text-stone-400'}`} />
                      <span>{doc.title.split('·')[0].trim()}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  {activeDoc.tag}
                </span>
              </div>
            </div>

            {/* Document Content Scroll Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-2 px-1 text-stone-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-semibold text-stone-900 font-serif craft-serif">
                    {activeDoc.title}
                  </h3>
                  <span className="text-[10px] text-stone-400 font-mono">{activeDoc.fileSize}</span>
                </div>
                
                {renderDocContent(activeDoc.content)}
              </div>
            </div>

            {/* Document Quick Cite Actions */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 shrink-0">
              <span className="text-[11px] text-stone-400">💡 可将当前资料的关键发现快速引用至方案</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCiteDocSnippet(1, activeDoc.summary)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition cursor-pointer"
                >
                  + 引用到问题归因
                </button>
                <button
                  onClick={() => handleCiteDocSnippet(2, activeDoc.summary)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition cursor-pointer"
                >
                  + 引用到优化方向
                </button>
              </div>
            </div>

          </div>

          {/* Lower Card: 任务产出区 (PRD 编辑器) */}
          <div className="craft-card rounded-2xl p-3 sm:p-4 bg-white/90 border border-stone-200/60 flex flex-col justify-between flex-1 min-h-0 overflow-hidden">
            
            {/* Step Tabs */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
                <button
                  onClick={() => setOutputTab(1)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                    outputTab === 1
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 hover:bg-white text-stone-600 border-stone-200/60'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white/20 text-current flex items-center justify-center text-[9px] font-mono">1</span>
                  <span>核心问题归因</span>
                </button>

                <button
                  onClick={() => setOutputTab(2)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                    outputTab === 2
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 hover:bg-white text-stone-600 border-stone-200/60'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white/20 text-current flex items-center justify-center text-[9px] font-mono">2</span>
                  <span>优化方向与策略</span>
                </button>

                <button
                  onClick={() => setOutputTab(3)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                    outputTab === 3
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 hover:bg-white text-stone-600 border-stone-200/60'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white/20 text-current flex items-center justify-center text-[9px] font-mono">3</span>
                  <span>设计理由与ROI</span>
                </button>

                <button
                  onClick={() => setOutputTab('all')}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                    outputTab === 'all'
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 hover:bg-white text-stone-500 border-stone-200/60'
                  }`}
                >
                  完整方案
                </button>
              </div>

              <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">PRD 草稿已自动暂存</span>
            </div>

            {/* Active Editor Area */}
            <div className="flex-1 py-2 overflow-y-auto custom-scrollbar">
              {outputTab === 1 && (
                <div className="h-full flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono text-stone-500">【模块 1】聚类工单痛点与 System Prompt 权重失衡根因：</span>
                  <textarea
                    value={problemAnalysis}
                    onChange={(e) => setProblemAnalysis(e.target.value)}
                    className="flex-1 w-full p-2.5 rounded-xl bg-stone-50/70 border border-stone-200/80 text-xs text-stone-800 leading-relaxed outline-none resize-none focus:bg-white focus:border-stone-300 focus:ring-1 focus:ring-stone-300"
                    placeholder="从工单与Trace定位问题根因..."
                  />
                </div>
              )}

              {outputTab === 2 && (
                <div className="h-full flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono text-stone-500">【模块 2】设计意图分流分类器与主动追问澄清卡片：</span>
                  <textarea
                    value={solutionStrategy}
                    onChange={(e) => setSolutionStrategy(e.target.value)}
                    className="flex-1 w-full p-2.5 rounded-xl bg-stone-50/70 border border-stone-200/80 text-xs text-stone-800 leading-relaxed outline-none resize-none focus:bg-white focus:border-stone-300 focus:ring-1 focus:ring-stone-300"
                    placeholder="提出具体交互与架构优化方案..."
                  />
                </div>
              )}

              {outputTab === 3 && (
                <div className="h-full flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono text-stone-500">【模块 3】量化体验提升与 Token 降本算力收益：</span>
                  <textarea
                    value={roiAndRationale}
                    onChange={(e) => setRoiAndRationale(e.target.value)}
                    className="flex-1 w-full p-2.5 rounded-xl bg-stone-50/70 border border-stone-200/80 text-xs text-stone-800 leading-relaxed outline-none resize-none focus:bg-white focus:border-stone-300 focus:ring-1 focus:ring-stone-300"
                    placeholder="说明设计理由与商业ROI测算..."
                  />
                </div>
              )}

              {outputTab === 'all' && (
                <div className="space-y-3 text-xs text-stone-800 p-1">
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
                    <span className="font-mono font-semibold text-stone-900">1. 核心问题归因</span>
                    <p className="mt-1 whitespace-pre-wrap text-stone-700 leading-relaxed">{problemAnalysis}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
                    <span className="font-mono font-semibold text-stone-900">2. 优化方向与策略</span>
                    <p className="mt-1 whitespace-pre-wrap text-stone-700 leading-relaxed">{solutionStrategy}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
                    <span className="font-mono font-semibold text-stone-900">3. 设计理由与ROI</span>
                    <p className="mt-1 whitespace-pre-wrap text-stone-700 leading-relaxed">{roiAndRationale}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Toolbar */}
            <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleMentorQuickAction('solution-hint')}
                  className="craft-btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 text-stone-700"
                  title="请求方案结构建议"
                >
                  <Lightbulb className="w-3 h-3 text-amber-600" />
                  <span>AI 提示</span>
                </button>

                <button
                  onClick={handleVoiceSimulate}
                  disabled={isRecording}
                  className="craft-btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 text-stone-700"
                  title="模拟语音输入"
                >
                  <Mic className={`w-3 h-3 ${isRecording ? 'text-rose-500 animate-pulse' : 'text-stone-500'}`} />
                  <span>{isRecording ? '录音解析中...' : '语音补充'}</span>
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isEvaluating}
                className="craft-btn-black py-2 px-6 text-xs sm:text-sm flex items-center gap-1.5 shadow-xs"
                id="btn-submit-prd"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isEvaluating ? '深度评估中...' : '提交实战方案'}</span>
              </button>
            </div>

          </div>

        </div>

        {/* ====================================================================
            RIGHT COLUMN (30%): LIGHT SMART ASSISTANT PANEL
            ==================================================================== */}
        <div className="hidden lg:flex lg:w-[30%] craft-card rounded-2xl p-3.5 sm:p-4 bg-white/90 border border-stone-200/60 flex-col justify-between h-full overflow-hidden">
          
          {/* Agent Identity Card */}
          <div className="pb-3 border-b border-stone-100 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8.5 h-8.5 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-semibold text-stone-900 font-serif craft-serif">任务教练 Agent</h4>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-2xs" />
                  </div>
                  <p className="text-[10px] text-stone-500">实战推演 · 数据分析与方案预审</p>
                </div>
              </div>

              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                在线协同
              </span>
            </div>
          </div>

          {/* Quick Helper Action Chips */}
          <div className="py-2 grid grid-cols-2 gap-1.5 shrink-0">
            <button
              onClick={() => handleMentorQuickAction('explain')}
              className="p-1.5 rounded-xl bg-stone-50 hover:bg-white text-[11px] text-stone-700 border border-stone-200/60 hover:border-stone-300 text-left truncate transition cursor-pointer"
            >
              📌 解释任务要求
            </button>
            <button
              onClick={() => handleMentorQuickAction('analyze')}
              className="p-1.5 rounded-xl bg-stone-50 hover:bg-white text-[11px] text-stone-700 border border-stone-200/60 hover:border-stone-300 text-left truncate transition cursor-pointer"
            >
              🔍 交叉分析资料
            </button>
            <button
              onClick={() => handleMentorQuickAction('solution-hint')}
              className="p-1.5 rounded-xl bg-stone-50 hover:bg-white text-[11px] text-stone-700 border border-stone-200/60 hover:border-stone-300 text-left truncate transition cursor-pointer"
            >
              💡 推荐方案结构
            </button>
            <button
              onClick={() => handleMentorQuickAction('review-draft')}
              className="p-1.5 rounded-xl bg-stone-50 hover:bg-white text-[11px] text-stone-700 border border-stone-200/60 hover:border-stone-300 text-left truncate transition cursor-pointer"
            >
              🌟 预审方案草稿
            </button>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto custom-scrollbar py-2 space-y-2.5 text-xs">
            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] p-2.5 rounded-2xl text-xs leading-relaxed font-normal ${
                      isUser
                        ? 'bg-stone-900 text-white rounded-br-xs'
                        : 'bg-stone-100 text-stone-800 rounded-bl-xs border border-stone-200/50'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-stone-400 font-mono mt-0.5 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Bottom Chat Input Box */}
          <form onSubmit={handleSendChatMessage} className="pt-2 border-t border-stone-100 shrink-0">
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200/70 rounded-full p-1 pl-3 focus-within:bg-white focus-within:border-stone-300 focus-within:ring-1 focus-within:ring-stone-300 transition">
              <input
                type="text"
                value={userChatInput}
                onChange={(e) => setUserChatInput(e.target.value)}
                placeholder="向任务教练提问或讨论方案..."
                className="flex-1 bg-transparent text-xs text-stone-900 outline-none"
              />
              <button
                type="submit"
                disabled={!userChatInput.trim()}
                className="w-7 h-7 rounded-full bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-white flex items-center justify-center transition shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

        </div>

      </div>

      {/* 
        ========================================================================
        3. TASK REQUIREMENTS SLIDING DRAWER
        ========================================================================
      */}
      <AnimatePresence>
        {isTaskDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/30 backdrop-blur-xs flex justify-end"
            onClick={() => setIsTaskDrawerOpen(false)}
          >
            <motion.div
              initial={{ x: 380 }}
              animate={{ x: 0 }}
              exit={{ x: 380 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-96 max-w-[90vw] h-full bg-white border-l border-stone-200 shadow-2xl p-5 flex flex-col justify-between overflow-y-auto custom-scrollbar"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-xs">
                      📋
                    </span>
                    <h3 className="text-sm font-semibold text-stone-900 font-serif craft-serif">任务背景与交付要求</h3>
                  </div>
                  <button
                    onClick={() => setIsTaskDrawerOpen(false)}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs text-stone-700 leading-relaxed">
                  <h4 className="font-semibold text-stone-900">项目背景</h4>
                  <p>
                    业务线 AI 助手近期多轮跳出率飙升至 58.2%。46% 用户抱怨短输入回答过于冗长。你需要定位根因并输出高价值的优化 PRD 方案。
                  </p>
                </div>

                <div className="space-y-2 text-xs text-stone-700">
                  <h4 className="font-semibold text-stone-900">三大交付物规范</h4>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
                      <span className="font-medium font-mono text-stone-900">1. 核心问题归因</span>
                      <p className="text-[11px] text-stone-600 mt-0.5">聚类工单定性痛点，结合 Trace 确定 Prompt 参数与意图缺失根因。</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
                      <span className="font-medium font-mono text-stone-900">2. 优化方向与策略</span>
                      <p className="text-[11px] text-stone-600 mt-0.5">设计意图分流机制，引入主动澄清卡片（Pill Chips）与渐进式展示。</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
                      <span className="font-medium font-mono text-stone-900">3. 设计理由与ROI</span>
                      <p className="text-[11px] text-stone-600 mt-0.5">量化信息获取效率，测算 Token 降本与次周留存提升。</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100">
                <button
                  onClick={() => setIsTaskDrawerOpen(false)}
                  className="craft-btn-black w-full py-2 px-4 text-xs"
                >
                  知道了，返回工作台
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        ========================================================================
        4. EVALUATION REPORT MODAL (Light Growth Document Style)
        ========================================================================
      */}
      <AnimatePresence>
        {evaluationResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col overflow-y-auto custom-scrollbar"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-lg shadow-xs">
                    {evaluationResult.grade}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="craft-chip-green text-[10px] font-mono font-medium px-2 py-0.5 rounded-full">
                        综合得分 {evaluationResult.score} 分
                      </span>
                      <span className="text-[11px] text-stone-500 font-mono">等级：卓越 (S)</span>
                    </div>
                    <h3 className="text-base font-normal text-stone-900 font-serif craft-serif mt-0.5">
                      实战方案评估报告 · AI 产品经理
                    </h3>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <p className="text-xs text-stone-700 leading-relaxed font-normal p-3 rounded-2xl bg-stone-50 border border-stone-200/50">
                {evaluationResult.summary}
              </p>

              {/* 4 Radar Metrics */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-semibold text-stone-900">📊 四维实战能力雷达评估</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {evaluationResult.radarScores.map((score, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-900">{score.dimension}</span>
                        <span className="text-xs font-mono font-bold text-amber-800">{score.score} 分</span>
                      </div>
                      <p className="text-[10px] text-stone-500 leading-normal">{score.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Next Advice */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-mono font-semibold text-stone-900">💡 关键亮点与后续建议</span>
                <div className="space-y-1.5 text-xs text-stone-600 font-normal">
                  {evaluationResult.strengths.map((str, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">实战成果将沉淀至个人能力库与档案</span>
                <button
                  onClick={() => {
                    setEvaluationResult(null);
                    onSubmitSuccess(evaluationResult);
                  }}
                  className="craft-btn-black py-2.5 px-6 text-xs sm:text-sm flex items-center gap-1.5"
                  id="btn-advance-to-experience-end"
                >
                  <span>前往复盘与能力沉淀</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
