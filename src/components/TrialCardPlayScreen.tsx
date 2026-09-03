import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { SkillCard } from '../types';
import type {
  ApiDynamicTrialAnswer,
  ApiDynamicTrialCardPlayRound,
  ApiTrialTaskDefinition,
} from '../types/api';

interface TrialCardPlayScreenProps {
  task: ApiTrialTaskDefinition;
  cards: SkillCard[];
  answer: ApiDynamicTrialAnswer;
  error: string | null;
  saving: boolean;
  onChange: (answer: ApiDynamicTrialAnswer) => void;
  onEvaluate: () => void;
  onSelectChallenge: (index: number) => void;
  onEnterWorkbench: () => void;
  onBackToMap?: () => void;
  onBack: () => void;
  onOpenCardDetail: (card: SkillCard) => void;
}

const MATCH_LABELS = {
  high: { label: '高度适用', className: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
  partial: { label: '部分适用', className: 'border-amber-200 bg-amber-50 text-amber-900' },
  low: { label: '关联较弱', className: 'border-stone-200 bg-stone-100 text-stone-700' },
} as const;

function emptyRound(challengeId: string): ApiDynamicTrialCardPlayRound {
  return {
    challenge_id: challengeId,
    selected_card_ids: [],
    match_level: null,
    matched_card_ids: [],
    matched_skills: [],
    feedback: '',
  };
}

export function TrialCardPlayScreen({
  task,
  cards,
  answer,
  error,
  saving,
  onChange,
  onEvaluate,
  onSelectChallenge,
  onEnterWorkbench,
  onBackToMap,
  onBack,
  onOpenCardDetail,
}: TrialCardPlayScreenProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showJudgementGuide, setShowJudgementGuide] = useState(false);
  const challengeIndex = Math.min(
    Math.max(answer.card_play_current_index || 0, 0),
    task.ability_challenges.length - 1,
  );
  const challenge = task.ability_challenges[challengeIndex];
  const currentRound = answer.card_play_rounds.find(item => item.challenge_id === challenge.id)
    || emptyRound(challenge.id);
  const cardsById = new Map(cards.map(card => [card.id, card]));
  const selectedCards = currentRound.selected_card_ids
    .map(cardId => cardsById.get(cardId))
    .filter((card): card is SkillCard => Boolean(card));
  const missingCardIds = currentRound.selected_card_ids.filter(cardId => !cardsById.has(cardId));
  const evaluated = Boolean(currentRound.match_level && currentRound.feedback);
  const isLastChallenge = challengeIndex === task.ability_challenges.length - 1;
  const completedCount = answer.card_play_rounds.filter(item => item.match_level).length;
  const firstIncompleteIndex = task.ability_challenges.findIndex(item => (
    !answer.card_play_rounds.some(round => round.challenge_id === item.id && round.match_level)
  ));
  const lastUnlockedIndex = firstIncompleteIndex === -1
    ? task.ability_challenges.length - 1
    : firstIncompleteIndex;
  const ready = currentRound.selected_card_ids.length > 0
    && currentRound.selected_card_ids.length <= challenge.max_cards
    && missingCardIds.length === 0;
  const matchStyle = currentRound.match_level ? MATCH_LABELS[currentRound.match_level] : null;

  const updateRound = (nextRound: ApiDynamicTrialCardPlayRound) => {
    const nextRounds = task.ability_challenges
      .map(item => item.id === challenge.id
        ? nextRound
        : answer.card_play_rounds.find(round => round.challenge_id === item.id))
      .filter((item): item is ApiDynamicTrialCardPlayRound => Boolean(item));
    const selectedIds = Array.from(new Set(nextRounds.flatMap(item => item.selected_card_ids)));
    onChange({
      ...answer,
      selected_card_ids: selectedIds,
      card_play_rounds: nextRounds,
      card_play_completed: false,
    });
  };

  const toggleCard = (cardId: string) => {
    const selected = currentRound.selected_card_ids.includes(cardId);
    if (!selected && currentRound.selected_card_ids.length >= challenge.max_cards) return;
    updateRound({
      ...currentRound,
      selected_card_ids: selected
        ? currentRound.selected_card_ids.filter(id => id !== cardId)
        : [...currentRound.selected_card_ids, cardId],
      match_level: null,
      matched_card_ids: [],
      matched_skills: [],
      feedback: '',
    });
  };

  const clearSelection = () => updateRound({
    ...currentRound,
    selected_card_ids: [],
    match_level: null,
    matched_card_ids: [],
    matched_skills: [],
    feedback: '',
  });

  const removeMissingCard = (cardId: string) => updateRound({
    ...currentRound,
    selected_card_ids: currentRound.selected_card_ids.filter(id => id !== cardId),
    match_level: null,
    matched_card_ids: [],
    matched_skills: [],
    feedback: '',
  });

  return (
    <div className="min-h-[calc(100vh-64px)] px-3 pb-5 pt-2 sm:px-5">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <button
            onClick={onBackToMap || onBack}
            className="craft-card group flex min-w-0 items-center gap-4 rounded-3xl border border-stone-200/70 bg-white/90 px-5 py-4 text-left shadow-xs backdrop-blur-xl"
          >
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-amber-300">
              <Bot className="h-5 w-5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2 text-[10px]">
                <span className="craft-chip-yellow rounded-full px-2.5 py-1 font-mono font-bold">03 · 能力应用</span>
                <span className="text-stone-400">任务推演导师</span>
              </span>
              <span className="mt-1.5 block truncate font-serif text-base text-stone-900 sm:text-lg">
                先判断现有能力如何应用，再进入真实任务验证。
              </span>
            </span>
            <span className="hidden items-center gap-1 rounded-full border border-stone-200 bg-stone-100 px-3 py-1.5 text-[10px] text-stone-600 sm:flex">
              <ArrowLeft className="h-3 w-3" />{onBackToMap ? '返回任务地图' : '返回方向建议'}
            </span>
          </button>

          <div className="flex flex-col items-start xl:items-end">
            <h1 className="font-serif text-xl text-stone-950">{task.role_type} · 阶段 1：能力验证</h1>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-stone-500">
              <div className="flex items-center gap-1.5">
                {task.ability_challenges.map((item, index) => {
                  const round = answer.card_play_rounds.find(entry => entry.challenge_id === item.id);
                  const complete = Boolean(round?.match_level);
                  const active = index === challengeIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectChallenge(index)}
                      disabled={saving || index > lastUnlockedIndex}
                      aria-label={`切换到挑战 ${index + 1}`}
                      className={`h-3 w-3 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-35 ${active ? 'border-stone-900 bg-stone-900 ring-2 ring-stone-200' : complete ? 'border-emerald-500 bg-emerald-500' : 'border-stone-300 bg-white'}`}
                    />
                  );
                })}
              </div>
              <span>已完成 {completedCount}/{task.ability_challenges.length} 个挑战</span>
            </div>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
            {error}
          </div>
        )}

        <div className="grid min-h-[460px] gap-4 xl:grid-cols-[300px_minmax(420px,1fr)_320px]">
          <motion.section
            key={`task-${challenge.id}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="craft-card flex min-h-[300px] flex-col justify-between rounded-3xl border border-stone-200/70 bg-white/92 p-5 shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h2 className="font-serif text-xl text-stone-950">任务卡</h2>
                <span className="craft-chip-yellow rounded-full px-2.5 py-1 font-mono text-[10px] font-bold">
                  CHALLENGE {String(challengeIndex + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="mt-5 rounded-2xl border border-stone-200/70 bg-stone-50/80 p-4">
                <p className="text-sm font-semibold leading-relaxed text-stone-800">{challenge.title}</p>
                <p className="mt-2 whitespace-pre-line text-xs leading-6 text-stone-600">{challenge.scenario}</p>
              </div>
              <p className="mt-5 font-serif text-sm leading-6 text-stone-900">{challenge.prompt}</p>
            </div>
            <div className="mt-5 border-t border-stone-100 pt-4 text-[11px] leading-relaxed text-stone-400">
              <span className="flex items-start gap-1.5"><Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />验证重点：{challenge.target_skills.join('、')}</span>
            </div>
          </motion.section>

          <section
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragOver(false);
              const cardId = event.dataTransfer.getData('text/card-id');
              if (cardId && cardsById.has(cardId) && !currentRound.selected_card_ids.includes(cardId)) {
                toggleCard(cardId);
              }
            }}
            className={`craft-card flex min-h-[360px] flex-col rounded-3xl border p-5 transition-all ${isDragOver ? 'border-stone-900 bg-amber-50/80 shadow-md' : selectedCards.length ? 'border-stone-200 bg-white/95 shadow-xs' : 'border-dashed border-stone-300 bg-white/55'}`}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="text-xs font-medium text-stone-600">能力组合 {currentRound.selected_card_ids.length}/{challenge.max_cards}</span>
              {currentRound.selected_card_ids.length > 0 && (
                <button onClick={clearSelection} className="text-[11px] text-stone-400 transition hover:text-stone-900">清空重选</button>
              )}
            </div>

            {selectedCards.length === 0 && missingCardIds.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 bg-stone-100 text-stone-500">
                  <Plus className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-medium text-stone-700">选择最相关的能力卡，放入验证区</p>
                <p className="mt-1.5 text-[11px] text-stone-400">点击下方能力卡，或拖拽至此处，最多 {challenge.max_cards} 张</p>
              </div>
            ) : (
              <div className="grid flex-1 content-center gap-3 sm:grid-cols-3">
                {selectedCards.map(card => (
                  <motion.div
                    layout
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.92, y: 14 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="group relative flex min-h-36 flex-col justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs"
                  >
                    <button
                      onClick={() => toggleCard(card.id)}
                      aria-label={`移除${card.title}`}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-stone-400 transition hover:bg-stone-900 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="pr-6">
                      <p className="font-mono text-[9px] text-stone-400">{card.category}</p>
                      <h3 className="mt-2 font-serif text-sm leading-snug text-stone-950">{card.title}</h3>
                      <p className="mt-2 line-clamp-3 text-[10px] leading-relaxed text-stone-500">{card.description}</p>
                    </div>
                    <button onClick={() => onOpenCardDetail(card)} className="mt-4 flex items-center justify-between border-t border-stone-100 pt-2 text-[10px] text-stone-400 hover:text-stone-900">
                      <span>查看详情</span><ChevronRight className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
                {missingCardIds.map(cardId => (
                  <div key={cardId} className="flex min-h-36 flex-col justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-rose-800"><AlertTriangle className="h-3.5 w-3.5" />失效卡位</span>
                    <button onClick={() => removeMissingCard(cardId)} className="text-left text-[10px] text-rose-700 underline underline-offset-2">移除失效记录</button>
                  </div>
                ))}
              </div>
            )}

            <p className="border-t border-stone-100 pt-3 text-center text-[10px] text-stone-400">能力选择可以随时调整，提交后记录本轮判断</p>
          </section>

          <aside className="craft-card flex min-h-[300px] flex-col justify-between rounded-3xl border border-stone-200/70 bg-white/95 p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <span className="flex items-center gap-2 font-serif text-sm text-stone-950"><span className="flex h-7 w-7 items-center justify-center rounded-xl bg-stone-100"><Sparkles className="h-3.5 w-3.5 text-amber-600" /></span>导师推演反馈</span>
                <span className="text-[10px] text-stone-400">即时反馈</span>
              </div>

              {matchStyle ? (
                <div className={`mt-4 rounded-2xl border p-4 ${matchStyle.className}`}>
                  <div className="flex items-center gap-2 text-xs font-bold"><Check className="h-4 w-4" />{matchStyle.label}</div>
                  <p className="mt-3 text-xs leading-6">{currentRound.feedback}</p>
                  {currentRound.matched_skills.length > 0 && (
                    <p className="mt-3 border-t border-current/10 pt-3 text-[10px]">对应能力：{currentRound.matched_skills.join('、')}</p>
                  )}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50/80 p-4 text-xs leading-6 text-stone-600">
                  从下方选择最适合当前挑战的能力卡。提交后，系统依据固定任务评价维度返回对应关系。
                </div>
              )}

              {missingCardIds.length > 0 && (
                <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-[11px] leading-relaxed text-rose-800">
                  当前记录包含已从能力库移除的卡牌，清理后可以继续提交。
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2">
              {!evaluated && (
                <>
                  <button type="button" onClick={() => setShowJudgementGuide(true)} className="craft-btn-secondary flex w-full items-center justify-center gap-2 px-4 py-3 text-xs" title="查看本轮任务的判断重点">
                    <CircleHelp className="h-3.5 w-3.5" />查看判断重点
                  </button>
                  <button onClick={onEvaluate} disabled={!ready || saving} className="craft-btn-black flex w-full items-center justify-center gap-2 px-4 py-3 text-xs disabled:opacity-40">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />{saving ? '正在保存…' : '提交本轮判断'}
                  </button>
                </>
              )}

              {evaluated && !isLastChallenge && (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => updateRound({ ...currentRound, match_level: null, matched_card_ids: [], matched_skills: [], feedback: '' })} disabled={saving} className="craft-btn-secondary flex items-center justify-center gap-1 px-3 py-3 text-xs"><RotateCcw className="h-3.5 w-3.5" />调整选择</button>
                  <button onClick={() => onSelectChallenge(challengeIndex + 1)} disabled={saving} className="craft-btn-black flex items-center justify-center gap-1 px-3 py-3 text-xs">下一项挑战<ArrowRight className="h-3.5 w-3.5" /></button>
                </div>
              )}

              {evaluated && isLastChallenge && answer.card_play_completed && (
                <button onClick={onEnterWorkbench} disabled={saving} className="craft-btn-black flex w-full items-center justify-center gap-2 px-4 py-3 text-xs">
                  查看任务简报<ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
              <p className="pt-2 text-[10px] leading-relaxed text-stone-400">本阶段只记录能力应用判断，最终评价以真实任务产出为准。</p>
            </div>
          </aside>
        </div>

        <div className="flex items-end gap-3">
          <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-600 shadow-xs md:flex"><Bot className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex min-w-max gap-3">
              {cards.map((card, index) => {
                const selected = currentRound.selected_card_ids.includes(card.id);
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.025, 0.18) }}
                    whileHover={!selected ? { y: -5 } : undefined}
                    draggable={!selected}
                    onDragStart={event => event.dataTransfer.setData('text/card-id', card.id)}
                    onClick={() => toggleCard(card.id)}
                    className={`flex h-[146px] w-[170px] shrink-0 cursor-pointer select-none flex-col justify-between rounded-3xl border p-4 transition ${selected ? 'border-stone-900 bg-stone-900 text-white shadow-md' : 'border-stone-200/80 bg-white/92 text-stone-900 shadow-2xs hover:border-stone-400'}`}
                  >
                    <div className="flex items-center justify-between font-mono text-[9px]">
                      <span className={selected ? 'text-stone-400' : 'text-stone-500'}>{card.category}</span>
                      {selected ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-stone-950"><Check className="h-3 w-3" /></span> : <span className="text-stone-300">0{index + 1}</span>}
                    </div>
                    <div>
                      <h3 className="font-serif text-sm leading-snug">{card.title}</h3>
                      <p className={`mt-1.5 line-clamp-2 text-[10px] leading-relaxed ${selected ? 'text-stone-400' : 'text-stone-500'}`}>{card.description}</p>
                    </div>
                    <button
                      onClick={event => {
                        event.stopPropagation();
                        onOpenCardDetail(card);
                      }}
                      className={`flex items-center justify-between border-t pt-2 text-[9px] ${selected ? 'border-stone-700 text-stone-400 hover:text-white' : 'border-stone-100 text-stone-400 hover:text-stone-900'}`}
                    >
                      <span>详情</span><ChevronRight className="h-3 w-3" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showJudgementGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <p className="font-mono text-[10px] font-bold text-amber-700">CHALLENGE {String(challengeIndex + 1).padStart(2, '0')}</p>
                  <h2 className="mt-1 font-serif text-lg text-stone-950">本轮判断重点</h2>
                </div>
                <button onClick={() => setShowJudgementGuide(false)} aria-label="关闭判断重点" className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition hover:bg-stone-900 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4">
                <p className="text-xs font-bold text-stone-900">目标能力：{challenge.target_skills.join('、')}</p>
                <p className="mt-2 text-xs leading-6 text-stone-700">{challenge.reference_behavior}</p>
              </div>
              <p className="mt-4 text-[11px] leading-relaxed text-stone-500">判断重点用于理解评价边界，不会替代能力卡选择。</p>
              <button onClick={() => setShowJudgementGuide(false)} className="craft-btn-black mt-5 w-full px-4 py-3 text-xs">返回选牌</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
