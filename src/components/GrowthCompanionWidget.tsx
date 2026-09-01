import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useDragControls } from 'motion/react';
import { ArrowRight, Loader2, Send, Sparkles, Sprout, X } from 'lucide-react';
import { AGENT_REGISTRY, type ScreenMode } from '../types';
import { createCompanionGesture } from '../services/companionGesture';
import type { ProfileModelTier } from '../types/api';

interface GrowthCompanionWidgetProps {
  demoMode: boolean;
  userId?: string;
  currentScreen: ScreenMode;
  existingCardTitles?: string[];
  onContinue: () => void;
}

interface CompanionMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  signals?: string[];
}

const INITIAL_MESSAGE: CompanionMessage = {
  id: 'companion-initial', role: 'assistant',
  content: '你好，我是成长陪伴 Agent。我会基于你已经提供的经历，继续帮你核对事实、判断和能力线索。',
  signals: ['事实优先', '由你确认'],
};

const QUICK_PROMPTS = ['帮我区分这段经历里的事实与推断', '我还缺少哪些可核验的证据？'];
const MODEL_TIERS: Array<{ id: ProfileModelTier; label: string }> = [
  { id: 'fast', label: '快速' },
  { id: 'balanced', label: '适中' },
  { id: 'reasoning', label: '思考' },
];
const SCREEN_LABELS: Record<ScreenMode, string> = {
  landing: '开始认识自己', auth: '建立个人档案', 'input-experience': '阶段 01 · 经历解构',
  'verify-cards': '阶段 01 · 能力确认', 'career-explore': '阶段 02 · 方向探索',
  stage2: '阶段 03 · 试路验证', report: '阶段 04 · 回看成长', profile: '长期能力画像',
};
const DEMO_REPLIES = [
  '从现有经历看，能够确认的是：你进行了用户访谈、推动方案上线，并记录了结果。至于“洞察力强”仍属于能力推断，需要由你确认，或补充更具体的判断依据。',
  '当前证据已经覆盖行动和结果。若要让能力卡更可信，可以再补充一个关键取舍：当时有哪些方案，你为什么放弃其中一些，并最终选择现在的做法？',
];

function storageKey(demoMode: boolean, userId?: string) {
  const namespace = demoMode ? 'demo' : userId ? `use:${encodeURIComponent(userId)}` : 'use:anonymous';
  return `before-choosing:growth-companion:${namespace}:messages-v1`;
}

function modelTierStorageKey(demoMode: boolean, userId?: string) {
  const namespace = demoMode ? 'demo' : userId ? `use:${encodeURIComponent(userId)}` : 'use:anonymous';
  return `before-choosing:growth-companion:${namespace}:model-tier-v1`;
}

function loadModelTier(demoMode: boolean, userId?: string): ProfileModelTier {
  if (typeof window === 'undefined') return 'balanced';
  const stored = window.localStorage.getItem(modelTierStorageKey(demoMode, userId));
  return stored === 'fast' || stored === 'reasoning' ? stored : 'balanced';
}

function loadMessages(demoMode: boolean, userId?: string): CompanionMessage[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey(demoMode, userId)) || '[]') as CompanionMessage[];
    return Array.isArray(parsed) && parsed.length ? parsed.slice(-20) : [INITIAL_MESSAGE];
  } catch { return [INITIAL_MESSAGE]; }
}

function loadProfileEvidence(demoMode: boolean, userId?: string): string {
  const namespace = demoMode ? 'demo' : userId ? `use:${encodeURIComponent(userId)}` : 'use:anonymous';
  return window.localStorage.getItem(`before-choosing:profile-exploration:${namespace}:evidence-v3`)?.trim() || '';
}

export const GrowthCompanionWidget: React.FC<GrowthCompanionWidgetProps> = ({ demoMode, userId, currentScreen, existingCardTitles = [], onContinue }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<CompanionMessage[]>(() => loadMessages(demoMode, userId));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingReplyId, setStreamingReplyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelTier, setModelTier] = useState<ProfileModelTier>(() => loadModelTier(demoMode, userId));
  const triggerRef = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const demoReplyTimerRef = useRef<number | null>(null);
  const demoTypingTimerRef = useRef<number | null>(null);
  const dragControls = useDragControls();
  const gesture = useRef(createCompanionGesture());
  const companion = AGENT_REGISTRY.growth_companion;
  const stageLabel = SCREEN_LABELS[currentScreen];
  const transcript = useMemo(() => messages.map(message => ({ role: message.role, content: message.content })), [messages]);

  useEffect(() => {
    const openCompanion = (event: Event) => {
      if ((event as CustomEvent<{ agentId?: string }>).detail?.agentId === 'growth_companion') setOpen(true);
    };
    window.addEventListener('open-agent-chat', openCompanion);
    return () => window.removeEventListener('open-agent-chat', openCompanion);
  }, []);

  useEffect(() => {
    if (!demoMode && !userId) return;
    window.localStorage.setItem(storageKey(demoMode, userId), JSON.stringify(messages.slice(-20)));
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [demoMode, messages, open, userId]);

  useEffect(() => {
    window.localStorage.setItem(modelTierStorageKey(demoMode, userId), modelTier);
  }, [demoMode, modelTier, userId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !open) return;
      setOpen(false); triggerRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => () => {
    if (demoReplyTimerRef.current !== null) window.clearTimeout(demoReplyTimerRef.current);
    if (demoTypingTimerRef.current !== null) window.clearInterval(demoTypingTimerRef.current);
  }, []);

  const send = async (preset?: string) => {
    const content = (preset ?? input).trim();
    if (!content || loading) return;
    const userMessage: CompanionMessage = { id: `companion-user-${Date.now()}`, role: 'user', content };
    const nextMessages = [...messages, userMessage].slice(-20);
    setMessages(nextMessages); setInput(''); setError(null); setLoading(true);
    if (demoMode) {
      demoReplyTimerRef.current = window.setTimeout(() => {
        const reply = DEMO_REPLIES[(nextMessages.filter(message => message.role === 'user').length - 1) % DEMO_REPLIES.length];
        const replyId = `companion-demo-${Date.now()}`;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setMessages(current => [...current, { id: replyId, role: 'assistant', content: reduceMotion ? reply : '' }].slice(-20));
        if (reduceMotion) { setLoading(false); return; }
        let visible = 0;
        demoTypingTimerRef.current = window.setInterval(() => {
          visible = Math.min(visible + 2, reply.length);
          const complete = visible >= reply.length;
          setMessages(current => current.map(message => message.id === replyId ? {
            ...message, content: reply.slice(0, visible), signals: complete ? ['证据边界', '下一步补充'] : undefined,
          } : message));
          if (!complete) return;
          if (demoTypingTimerRef.current !== null) window.clearInterval(demoTypingTimerRef.current);
          demoTypingTimerRef.current = null;
          setLoading(false);
        }, 22);
      }, 280);
      return;
    }
    try {
      const { streamProfileExplorationMessage } = await import('../api/profile');
      const replyId = `companion-stream-${Date.now()}`;
      const profileEvidence = loadProfileEvidence(demoMode, userId);
      const response = await streamProfileExplorationMessage(
        {
          experience_text: [profileEvidence, ...transcript.filter(message => message.role === 'user').map(message => message.content), content]
            .filter(Boolean).join('\n\n').slice(-12000),
          messages: [...transcript.slice(-9), { role: 'user', content }], existing_card_titles: existingCardTitles,
          request_id: `companion-${Date.now()}`,
          model_tier: modelTier,
        },
        delta => {
          setStreamingReplyId(replyId);
          setMessages(current => current.some(message => message.id === replyId)
            ? current.map(message => message.id === replyId
              ? { ...message, content: message.content + delta }
              : message)
            : [...current, { id: replyId, role: 'assistant', content: delta }].slice(-20));
        },
      );
      const finalMessage: CompanionMessage = {
        id: replyId, role: 'assistant', content: response.reply,
        signals: [response.evidence_found[0], response.evidence_gap].filter(Boolean).slice(0, 2),
      };
      setMessages(current => current.some(message => message.id === replyId)
        ? current.map(message => message.id === replyId ? finalMessage : message)
        : [...current, finalMessage].slice(-20));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '这次回复没有完成，请稍后再试。');
    } finally { setLoading(false); setStreamingReplyId(null); }
  };

  return (
    <div className="growth-companion-widget pointer-events-none fixed right-3 top-[78px] z-50 sm:right-6">
      <motion.div drag dragListener={false} dragControls={dragControls} dragMomentum={false} dragElastic={0.06}
        onDragStart={() => gesture.current.markDragged()}
        onPointerMoveCapture={event => gesture.current.move(event)}
        onPointerUpCapture={event => gesture.current.move(event)}
        onPointerCancelCapture={() => gesture.current.markDragged()}
        className="pointer-events-auto select-none">
        <AnimatePresence mode="wait" initial={false}>
          {!open ? (
            <motion.button key="companion-collapsed" ref={triggerRef} type="button" aria-label="成长陪伴 Agent" aria-expanded="false" aria-controls="growth-companion-panel"
              initial={{ opacity: 0, transform: 'scale(.96)' }} animate={{ opacity: 1, transform: 'scale(1)' }} exit={{ opacity: 0, transform: 'scale(.96)' }}
              transition={{ type: 'spring', duration: .32, bounce: .08 }}
              onClick={event => {
                if (!gesture.current.shouldOpen(event.detail)) { event.preventDefault(); event.stopPropagation(); return; }
                setOpen(true);
              }}
              onPointerDown={event => {
                if (!event.isPrimary || event.button !== 0) return;
                gesture.current.begin(event);
                dragControls.start(event);
              }}
              className="flex h-11 touch-none cursor-grab items-center gap-2 rounded-full border border-stone-700/70 bg-stone-900/95 px-3.5 text-xs text-white shadow-lg backdrop-blur-xl active:cursor-grabbing active:scale-[.97]">
              <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-stone-800"><Sprout className="h-4 w-4 text-emerald-400" /><span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-stone-900 bg-emerald-400" /></span>
              <span className="font-medium">{companion.shortName}</span><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </motion.button>
          ) : (
            <motion.section key="companion-panel" id="growth-companion-panel" aria-label="成长陪伴 Agent 对话"
              initial={{ opacity: 0, transform: 'scale(.96) translateY(4px)' }} animate={{ opacity: 1, transform: 'scale(1) translateY(0)' }} exit={{ opacity: 0, transform: 'scale(.96) translateY(4px)' }}
              transition={{ type: 'spring', duration: .36, bounce: .08 }}
              className="flex h-[510px] max-h-[calc(100vh-92px)] w-[292px] max-w-[calc(100vw-24px)] origin-top-right flex-col overflow-hidden rounded-[22px] border border-white/70 bg-[#f8f7f3]/95 text-stone-900 shadow-[0_24px_64px_rgba(28,35,31,.18)] backdrop-blur-2xl">
              <header onPointerDown={event => dragControls.start(event)} className="flex touch-none cursor-grab items-center justify-between border-b border-stone-200/70 bg-white/85 px-3 py-2.5 active:cursor-grabbing">
                <div className="flex min-w-0 items-center gap-2"><span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-900"><Sprout className="h-4 w-4 text-emerald-400" /><span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-emerald-400" /></span><span className="min-w-0"><strong className="block truncate text-xs">成长陪伴 Agent</strong><span className="block truncate text-[10px] text-stone-500">{stageLabel}</span></span></div>
                <button type="button" aria-label="收起成长陪伴" onPointerDown={event => event.stopPropagation()} onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 active:scale-[.96]"><X className="h-4 w-4" /></button>
              </header>
              <div className="flex items-center gap-2 border-b border-stone-200/60 bg-emerald-50/70 px-3 py-2 text-[10px] text-emerald-900"><Sparkles className="h-3 w-3" /><span>沿用你的经历与已确认能力，不编造证据</span></div>
              <div className="flex items-center justify-between border-b border-stone-200/60 bg-white/80 px-3 py-2">
                <span className="text-[10px] text-stone-500">响应档位</span>
                <div className="inline-flex rounded-full bg-stone-100 p-0.5" aria-label="选择模型响应档位">
                  {MODEL_TIERS.map(tier => <button key={tier.id} type="button" disabled={loading} onClick={() => setModelTier(tier.id)} aria-pressed={modelTier === tier.id} className={`rounded-full px-2 py-1 text-[9px] transition ${modelTier === tier.id ? 'bg-white font-semibold text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}>{tier.label}</button>)}
                </div>
              </div>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3" aria-live="polite">
                {messages.map(message => <div key={message.id} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}><span className="mb-1 px-1 text-[10px] text-stone-400">{message.role === 'user' ? '你' : '成长陪伴'}</span><div className={`max-w-[92%] rounded-2xl px-3 py-2.5 text-[11px] leading-[1.65] ${message.role === 'user' ? 'rounded-tr-md bg-stone-900 text-white' : 'rounded-tl-md border border-stone-200 bg-white text-stone-800 shadow-sm'}`}>{message.content}{streamingReplyId === message.id && <span aria-hidden="true" className="agent-stream-cursor" />}</div>{message.signals?.length ? <div className="mt-1.5 flex max-w-[92%] flex-wrap gap-1">{message.signals.map(signal => <span key={signal} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] text-emerald-800">{signal}</span>)}</div> : null}</div>)}
                {loading && !streamingReplyId && <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-2.5 text-[10px] text-stone-500"><Loader2 className="h-3 w-3 animate-spin" />正在整理证据边界…</div>}<div ref={endRef} />
              </div>
              <div className="border-t border-stone-200/70 bg-white/90 p-2.5">
                <div className="mb-2 space-y-1">{QUICK_PROMPTS.map(prompt => <button key={prompt} type="button" disabled={loading} onClick={() => void send(prompt)} className="flex min-h-8 w-full items-center justify-between rounded-lg bg-stone-50 px-2.5 text-left text-[10px] text-stone-700 hover:bg-stone-100 disabled:opacity-50"><span className="truncate">{prompt}</span><ArrowRight className="h-3 w-3 shrink-0" /></button>)}</div>
                <div className="flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 p-1 focus-within:border-emerald-500 focus-within:bg-white"><input aria-label="向成长陪伴提问" value={input} disabled={loading} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') void send(); }} placeholder="向陪伴提问…" className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-[11px] outline-none placeholder:text-stone-400" /><button type="button" aria-label="发送陪伴消息" onClick={() => void send()} disabled={!input.trim() || loading} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25765c] text-white disabled:bg-stone-200 disabled:text-stone-400"><Send className="h-3.5 w-3.5" /></button></div>
                {error && <p role="alert" className="mt-1.5 text-[9px] text-rose-700">{error}</p>}
                <button type="button" onClick={onContinue} className="mt-2 flex min-h-8 w-full items-center justify-center gap-1 text-[10px] font-medium text-stone-600 hover:text-stone-900">回到完整经历对话<ArrowRight className="h-3 w-3" /></button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
