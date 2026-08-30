import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Award,
  Check,
  Compass,
  Crosshair,
  Edit3,
  Eye,
  HelpCircle,
  Layers,
  RefreshCw,
  RotateCw,
  Sparkles,
  X,
} from 'lucide-react';
import type { SkillCard } from '../types';

type VerificationStatus = 'confirmed' | 'unsure' | 'rejected';

interface TrialExperienceEndScreenProps {
  initialCards: SkillCard[];
  allAccumulatedCards: SkillCard[];
  onEnterProfile: () => void;
  onContinueExplore: () => void;
  onAddExperience: () => void;
  onUpdateDeckSuccess: (cards: SkillCard[]) => Promise<unknown> | void;
}

const CARD_ICONS = {
  Layers,
  Eye,
  Award,
  Crosshair,
  Compass,
} as const;

function CardIcon({ card, className }: { card: SkillCard; className: string }) {
  const Icon = CARD_ICONS[card.icon as keyof typeof CARD_ICONS] || Sparkles;
  return <Icon className={className} />;
}

function evidenceType(card: SkillCard, index: number) {
  if (card.matchReason?.includes('事实') || index === 0) return '证据类型：实战推演提取';
  if (card.matchReason?.includes('架构') || index === 1) return '证据类型：系统方案推导';
  return '证据类型：落地交付沉淀';
}

export const TrialExperienceEndScreen: React.FC<TrialExperienceEndScreenProps> = ({
  initialCards,
  allAccumulatedCards,
  onEnterProfile,
  onContinueExplore,
  onAddExperience,
  onUpdateDeckSuccess,
}) => {
  const [viewMode, setViewMode] = useState<'verify' | 'added_pool'>('verify');
  const [cards, setCards] = useState(() => initialCards.slice(0, 3));
  const [cardStatuses, setCardStatuses] = useState<Record<string, VerificationStatus>>(() => (
    Object.fromEntries(initialCards.slice(0, 3).map(card => [card.id, 'confirmed']))
  ));
  const [confirmedThisRound, setConfirmedThisRound] = useState<SkillCard[]>([]);
  const [flippedCardIds, setFlippedCardIds] = useState<Record<string, boolean>>({});
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const confirmedCount = Object.values(cardStatuses).filter(status => status === 'confirmed').length;
  const totalPoolCards = useMemo(() => {
    const updatedIds = new Set(confirmedThisRound.map(card => card.id));
    return [...allAccumulatedCards.filter(card => !updatedIds.has(card.id)), ...confirmedThisRound];
  }, [allAccumulatedCards, confirmedThisRound]);

  const startEdit = (card: SkillCard) => {
    setEditingCardId(card.id);
    setEditTitle(card.title);
    setEditDesc(card.description);
  };

  const saveEdit = (cardId: string) => {
    if (!editTitle.trim()) return;
    setCards(current => current.map(card => card.id === cardId ? {
      ...card,
      title: editTitle.trim(),
      description: editDesc.trim() || card.description,
    } : card));
    setEditingCardId(null);
  };

  const confirmAndAdd = async () => {
    const confirmed = cards.filter(card => cardStatuses[card.id] === 'confirmed');
    if (confirmed.length === 0 || isSaving) return;
    setIsSaving(true);
    try {
      await onUpdateDeckSuccess(confirmed);
      setConfirmedThisRound(confirmed);
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      setViewMode('added_pool');
    } finally {
      setIsSaving(false);
    }
  };

  const regenerate = () => {
    setIsRegenerating(true);
    window.setTimeout(() => setIsRegenerating(false), 600);
  };

  if (viewMode === 'verify') {
    return (
      <div className="relative mx-auto flex h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] w-full max-w-[1240px] flex-col justify-between overflow-hidden px-4 py-2 sm:px-6 sm:py-3">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-stone-100/50 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-stone-100/30 blur-3xl" />
        </div>

        <div className="relative z-10 w-full shrink-0 space-y-3 sm:space-y-3.5">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="craft-card flex w-full flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 text-center shadow-2xs sm:flex-row sm:gap-4 sm:p-3.5 sm:text-left"
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-stone-100 text-stone-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-stone-900 text-white shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-orange-400" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-orange-500" />
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <span className="flex items-center gap-1 rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 font-mono text-[10px] font-bold text-stone-800 shadow-2xs">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
                  04 · 实战复盘认证
                </span>
                <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                  点击与复盘 Agent 深度推演
                </span>
              </div>
              <h2 className="craft-serif font-serif text-xs font-normal tracking-tight text-stone-900 sm:text-sm">
                通过这次真实任务模拟，我从你的实战推演中沉淀了新的胜任力线索，看看这些能力卡是否符合你的自我评估？
              </h2>
            </div>
          </motion.div>

          <div className="flex items-center justify-between px-1">
            <span className="craft-serif flex items-center gap-1.5 font-serif text-xs font-semibold tracking-wide text-stone-800">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
              本轮实战提取能力卡片（{cards.length}）
            </span>
            <p className="text-right text-[11px] font-normal text-stone-500">请选择你认可的能力卡，或修改卡牌内容后进行确认</p>
          </div>

          <div className="mx-auto flex w-full max-w-4xl flex-wrap items-start justify-center gap-3 py-0.5 sm:gap-5 md:gap-6">
            {cards.map((card, index) => {
              const status = cardStatuses[card.id] || 'confirmed';
              const editing = editingCardId === card.id;
              return (
                <div key={card.id} className="flex w-[165px] shrink-0 select-none flex-col gap-1.5 sm:w-[185px] md:w-[205px]">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: status === 'rejected' ? 0.45 : status === 'unsure' ? 0.85 : 1, y: status === 'confirmed' ? -4 : 0 }}
                    className={`relative flex h-[223px] flex-col justify-between rounded-2xl border p-2.5 shadow-xs transition-all duration-200 sm:h-[250px] sm:p-3 md:h-[277px] ${
                      status === 'confirmed'
                        ? 'border-orange-300 bg-white ring-2 ring-orange-500/10 shadow-sm'
                        : status === 'unsure'
                          ? 'border-stone-300 bg-stone-50 shadow-2xs'
                          : 'border-stone-200 bg-stone-100 opacity-50'
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-1 rounded-xl border border-stone-200/60" />
                    <div className="relative z-10 flex shrink-0 items-center justify-between gap-1 border-b border-stone-100 pb-1">
                      <span className="max-w-[85px] truncate rounded-md border border-stone-200 bg-stone-100 px-1.5 py-0.5 font-mono text-[9px] font-medium text-stone-800 shadow-2xs sm:text-[10px]">{card.category}</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[8.5px] text-stone-400">#0{index + 1}</span>
                        <button type="button" onClick={() => startEdit(card)} className="cursor-pointer p-0.5 text-stone-400 transition hover:text-stone-800" aria-label={`编辑${card.title}`}>
                          <Edit3 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        </button>
                      </div>
                    </div>

                    {editing ? (
                      <div className="relative z-10 my-auto space-y-1.5">
                        <input autoFocus value={editTitle} onChange={event => setEditTitle(event.target.value)} className="w-full rounded-md border border-stone-300 bg-white px-1.5 py-0.5 text-[11px] font-medium text-stone-900 outline-none" aria-label="能力名称" />
                        <textarea value={editDesc} onChange={event => setEditDesc(event.target.value)} rows={2} className="w-full resize-none rounded-md border border-stone-300 bg-white p-1 text-[10px] text-stone-700 outline-none" aria-label="能力一句话描述" />
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => setEditingCardId(null)} className="rounded bg-stone-100 px-1.5 py-0.5 text-[9px] font-medium text-stone-700 hover:bg-stone-200">取消</button>
                          <button type="button" onClick={() => saveEdit(card.id)} disabled={!editTitle.trim()} className="rounded bg-stone-900 px-2 py-0.5 text-[9px] font-medium text-white shadow-xs disabled:opacity-40">保存</button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative z-10 my-auto flex flex-col items-center py-0.5 text-center">
                        <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-stone-100 text-stone-800 shadow-2xs sm:h-8 sm:w-8 sm:rounded-xl">
                          <CardIcon card={card} className="h-3.5 w-3.5 text-stone-700 sm:h-4 sm:w-4" />
                        </div>
                        <h3 className="craft-serif mb-0.5 font-serif text-xs font-semibold leading-tight text-stone-900 sm:text-sm">{card.title}</h3>
                        <p className="line-clamp-2 px-0.5 text-[9.5px] leading-snug text-stone-600 sm:text-[10px]">{card.description}</p>
                      </div>
                    )}

                    {!editing && (
                      <div className="relative z-10 shrink-0 space-y-0.5 rounded-lg border border-stone-200 bg-stone-50 p-1.5 text-[9px] leading-tight text-stone-600 sm:text-[9.5px]">
                        <p className="line-clamp-1"><span className="font-medium text-stone-400">落地：</span>{card.workplaceApplication || card.detail}</p>
                        <p className="line-clamp-1 text-stone-500"><span className="font-medium text-stone-400">溯源：</span>{card.matchReason || '来源于本次实战推演'}</p>
                      </div>
                    )}

                    <div className="relative z-10 flex shrink-0 items-center justify-between border-t border-stone-100 pt-1.5">
                      <span className="rounded-md border border-stone-200 bg-stone-100 px-1.5 py-0.5 font-mono text-[8.5px] text-stone-600 sm:text-[9px]">{evidenceType(card, index)}</span>
                      <span className={`font-mono text-[9px] font-medium ${status === 'confirmed' ? 'font-bold text-stone-900' : status === 'unsure' ? 'text-stone-600' : 'text-stone-400'}`}>
                        {status === 'confirmed' ? '✓ 待收录' : status === 'unsure' ? '？待定' : '✕ 剔除'}
                      </span>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-3 gap-1 px-0.5">
                    <button type="button" onClick={() => setCardStatuses(current => ({ ...current, [card.id]: 'confirmed' }))} className={`flex items-center justify-center gap-0.5 rounded-full border px-0.5 py-1 text-[9.5px] font-medium transition-all sm:text-[10px] ${status === 'confirmed' ? 'border-stone-900 bg-stone-900 text-white shadow-xs' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'}`}><Check className="h-2.5 w-2.5" />认可</button>
                    <button type="button" onClick={() => setCardStatuses(current => ({ ...current, [card.id]: 'unsure' }))} className={`flex items-center justify-center gap-0.5 rounded-full border px-0.5 py-1 text-[9.5px] font-medium transition-all sm:text-[10px] ${status === 'unsure' ? 'border-stone-800 bg-stone-800 text-white shadow-xs' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100'}`}><HelpCircle className="h-2.5 w-2.5" />待定</button>
                    <button type="button" onClick={() => setCardStatuses(current => ({ ...current, [card.id]: 'rejected' }))} className={`flex items-center justify-center gap-0.5 rounded-full border px-0.5 py-1 text-[9.5px] font-medium transition-all sm:text-[10px] ${status === 'rejected' ? 'border-stone-600 bg-stone-600 text-stone-200 shadow-xs' : 'border-stone-200 bg-white text-stone-500 hover:bg-stone-100'}`}><X className="h-2.5 w-2.5" />排除</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 shrink-0 space-y-2 pb-1 pt-2">
          <div className="text-center text-xs font-normal text-stone-500">已确认 <strong className="font-mono font-bold text-stone-900">{confirmedCount}</strong>/3 张卡牌</div>
          <div className="mx-auto flex max-w-xl items-center justify-center gap-3 sm:gap-4">
            <button type="button" onClick={onAddExperience} className="craft-btn-secondary flex-1 px-4 py-2.5 text-center text-xs sm:text-sm">补充经历</button>
            <button type="button" onClick={regenerate} disabled={isRegenerating} className="craft-btn-secondary flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm">
              <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin text-stone-900' : 'text-stone-600'}`} />
              {isRegenerating ? '分析中...' : '重新分析'}
            </button>
            <button type="button" onClick={() => void confirmAndAdd()} disabled={confirmedCount === 0 || isSaving} className="flex-1 cursor-pointer rounded-full border border-stone-900 bg-stone-900 px-4 py-2.5 text-center text-xs font-medium text-white shadow-sm transition hover:bg-black hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm">
              {isSaving ? '更新中...' : '更新能力库'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col justify-between px-4 py-6 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-stone-100/50 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-stone-100/30 blur-3xl" />
      </div>

      <div className="relative z-10 space-y-6 sm:space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="craft-card flex w-full flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 text-center shadow-2xs sm:flex-row sm:gap-6 sm:rounded-3xl sm:p-7 sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-stone-100 text-stone-800 sm:h-14 sm:w-14">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-stone-900 text-white shadow-xs sm:h-8 sm:w-8"><Sparkles className="h-3.5 w-3.5 text-orange-400 sm:h-4 sm:w-4" /></div>
          </div>
          <div className="flex-1 space-y-1.5">
            <h2 className="craft-serif font-serif text-base font-normal tracking-tight text-stone-900 sm:text-lg">很好，这一轮我已经从你的实战推演中确认了 <span className="font-mono font-bold">{confirmedThisRound.length}</span> 张能力卡。</h2>
            <p className="text-xs font-normal leading-relaxed text-stone-600 sm:text-sm">你的能力库已成功同步更新，实战证据将持续丰富你的职业画像与岗位适配度。</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="w-full py-2">
          <div className={`mx-auto grid max-w-4xl justify-center gap-4 sm:gap-5 ${totalPoolCards.length <= 2 ? 'max-w-lg grid-cols-1 sm:grid-cols-2' : totalPoolCards.length === 3 ? 'max-w-3xl grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
            {totalPoolCards.map((card, index) => {
              const flipped = Boolean(flippedCardIds[card.id]);
              return (
                <motion.div key={card.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: index * 0.05 }} onClick={() => setFlippedCardIds(current => ({ ...current, [card.id]: !current[card.id] }))} className="group h-[290px] cursor-pointer select-none [perspective:1000px] sm:h-[310px]" title="点击翻转卡牌查看详情">
                  <div className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
                    <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-3.5 text-stone-900 shadow-xs transition-all duration-200 [backface-visibility:hidden] hover:border-orange-300 hover:bg-stone-50/50 hover:shadow-md sm:p-4">
                      <div className="flex shrink-0 items-center justify-between gap-1 border-b border-stone-100 pb-1.5"><span className="rounded-md border border-stone-200 bg-stone-100 px-2 py-0.5 font-mono text-[10px] font-medium text-stone-800">{card.category}</span><span className="font-mono text-[9px] text-stone-400">#0{index + 1}</span></div>
                      <div className="my-auto flex flex-col items-center py-1 text-center">
                        <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200 bg-stone-100 text-stone-800 shadow-2xs"><CardIcon card={card} className="h-4 w-4 text-stone-700" /></div>
                        <h4 className="craft-serif mb-1 font-serif text-sm font-semibold leading-snug text-stone-900">{card.title}</h4>
                        <p className="line-clamp-2 px-1 text-[11px] leading-relaxed text-stone-600">{card.description}</p>
                      </div>
                      <div className="flex shrink-0 items-center justify-between border-t border-stone-100 pt-2 text-[10px] text-stone-500"><span>点击翻转详情</span><RotateCw className="h-3 w-3 text-stone-400 transition-transform duration-300 group-hover:rotate-180" /></div>
                    </div>
                    <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-stone-800 bg-stone-900 p-4 text-white shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-stone-800 pb-1.5"><span className="flex items-center gap-1 font-mono text-[10px] font-medium text-stone-200"><Sparkles className="h-3 w-3 text-orange-400" />能力落地解析</span><span className="font-mono text-[9px] text-stone-400">#0{index + 1}</span></div>
                        <p className="text-[11px] leading-relaxed text-stone-300">{card.detail || card.description}</p>
                        {card.workplaceApplication && <div className="rounded-xl border border-stone-700 bg-stone-800 p-2 text-[10px] leading-tight text-stone-300"><span className="mb-0.5 block font-medium text-orange-400">职场应用：</span>{card.workplaceApplication}</div>}
                      </div>
                      <div className="flex items-center justify-center gap-1 border-t border-stone-800 pt-2 text-center text-[10px] text-stone-400"><RotateCw className="h-2.5 w-2.5" />点击翻回正面</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="relative z-10 flex flex-col items-center justify-center gap-3.5 pb-2 pt-6 text-center">
        <div className="space-y-0.5"><p className="text-xs font-normal text-stone-800 sm:text-sm">当前已积累 <span className="font-mono text-sm font-bold text-stone-900 sm:text-base">{totalPoolCards.length}</span> 张能力卡</p><p className="text-[11px] font-normal text-stone-500 sm:text-xs">你可以进入个人档案查阅完整技能雷达，或继续探索更多职业</p></div>
        <div className="flex w-full max-w-sm flex-col items-center justify-center gap-3 sm:flex-row">
          <button type="button" onClick={onEnterProfile} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-center text-sm text-white shadow-sm transition hover:bg-black hover:shadow-md"><Sparkles className="h-4 w-4 text-orange-400" />进入我的档案</button>
          <button type="button" onClick={onContinueExplore} className="craft-btn-secondary w-full px-6 py-2.5 text-center text-xs sm:text-sm">继续探索其他职业</button>
        </div>
      </motion.div>
    </div>
  );
};
