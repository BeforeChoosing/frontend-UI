import type { DragEvent as ReactDragEvent } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Layers3,
  RotateCcw,
  Target,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { SkillCard } from '../types';
import type {
  ApiDynamicTrialAnswer,
  ApiDynamicTrialCardPlayRound,
  ApiTrialTaskDefinition,
} from '../types/api';
import { PlayableAbilityCard } from './PlayableAbilityCard';

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
  onBack,
  onOpenCardDetail,
}: TrialCardPlayScreenProps) {
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
  const ready = currentRound.selected_card_ids.length > 0
    && currentRound.selected_card_ids.length <= challenge.max_cards
    && missingCardIds.length === 0;

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

  const removeMissingCard = (cardId: string) => {
    updateRound({
      ...currentRound,
      selected_card_ids: currentRound.selected_card_ids.filter(id => id !== cardId),
      match_level: null,
      matched_card_ids: [],
      matched_skills: [],
      feedback: '',
    });
  };

  const ignoreDrag = (event: ReactDragEvent<HTMLElement>) => event.preventDefault();
  const matchStyle = currentRound.match_level ? MATCH_LABELS[currentRound.match_level] : null;

  return (
    <div className="min-h-[calc(100vh-64px)] max-w-[1380px] mx-auto px-4 sm:px-6 py-7">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <button onClick={onBack} className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900">
            <ArrowLeft className="h-3.5 w-3.5" />返回职业探索
          </button>
          <p className="mt-5 text-[10px] font-mono font-bold tracking-[0.18em] text-purple-700">03 · 阶段 1 / 2</p>
          <h1 className="mt-2 text-3xl font-serif craft-serif text-stone-950">能力应用推演</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
            从完整能力卡库中选择可用于当前任务要求的能力。三轮结果只记录任务前判断，不计入最终能力评分。
          </p>
        </div>
        <div className="w-full lg:w-[390px] rounded-2xl border border-stone-200 bg-white/90 p-4">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-purple-700"><Target className="h-3.5 w-3.5" />已选任务 · {task.id}</div>
          <h2 className="mt-1.5 text-base font-bold text-stone-950">{task.title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-stone-600">主要验证：{task.primary_skill}</p>
        </div>
      </div>

      {error && <div role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">{error}</div>}

      <div className="mt-5 flex items-center gap-2">
        {task.ability_challenges.map((item, index) => {
          const round = answer.card_play_rounds.find(entry => entry.challenge_id === item.id);
          const complete = Boolean(round?.match_level);
          const active = index === challengeIndex;
          return (
            <button
              key={item.id}
              onClick={() => onSelectChallenge(index)}
              disabled={saving}
              className={`flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-[10px] font-mono font-bold transition ${active ? 'border-stone-900 bg-stone-900 text-white' : complete ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-stone-200 bg-white text-stone-500'}`}
            >
              {complete ? <Check className="h-3.5 w-3.5" /> : `0${index + 1}`}
            </button>
          );
        })}
        <span className="ml-1 text-[10px] font-mono text-stone-500">
          已完成 {answer.card_play_rounds.filter(item => item.match_level).length}/3
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-5 items-start">
        <section className="craft-card rounded-3xl border border-stone-200 bg-white/95 p-5 sm:p-6">
          <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
            <p className="text-[10px] font-mono font-bold text-purple-700">{challenge.title}</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-800">{challenge.scenario}</p>
            <p className="mt-2 text-xs text-stone-500">{challenge.prompt}</p>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-stone-950"><Layers3 className="h-4 w-4 text-purple-600" />完整能力卡库</h2>
              <p className="mt-1 text-xs text-stone-500">本轮选择 1–{challenge.max_cards} 张已确认能力卡，再次点击可以收回。</p>
            </div>
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-mono text-stone-600">{currentRound.selected_card_ids.length}/{challenge.max_cards}</span>
          </div>

          {cards.length > 0 ? (
            <div className="mt-6 flex min-h-[190px] flex-wrap items-start justify-center gap-3 sm:justify-start">
              {cards.map((card, index) => (
                <PlayableAbilityCard
                  key={card.id}
                  card={card}
                  index={index}
                  total={cards.length}
                  selected={currentRound.selected_card_ids.includes(card.id)}
                  onPlay={() => toggleCard(card.id)}
                  onOpenDetail={() => onOpenCardDetail(card)}
                  onDragStart={ignoreDrag}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-5 py-12 text-center">
              <p className="text-sm font-bold text-stone-800">还没有已确认能力卡</p>
              <p className="mt-1 text-xs text-stone-500">返回“认识自己”完成经历整理和能力卡确认后再进入试路任务。</p>
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {Array.from({ length: challenge.max_cards }, (_, index) => {
              const card = selectedCards[index];
              const missingId = missingCardIds[index - selectedCards.length];
              return (
                <motion.div
                  layout
                  key={card?.id || missingId || `empty-${index}`}
                  className={`min-h-20 rounded-2xl border p-3 ${card ? 'border-purple-200 bg-purple-50/70' : missingId ? 'border-rose-200 bg-rose-50/70' : 'border-dashed border-stone-200 bg-stone-50/60'}`}
                >
                  <p className="text-[9px] font-mono text-stone-400">卡位 0{index + 1}</p>
                  {card && <p className="mt-2 text-xs font-bold leading-snug text-stone-900">{card.title}</p>}
                  {missingId && (
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-xs font-bold text-rose-800"><AlertTriangle className="h-3 w-3" />失效卡位</span>
                      <button onClick={() => removeMissingCard(missingId)} className="text-[10px] text-rose-700 underline underline-offset-2">移除</button>
                    </div>
                  )}
                  {!card && !missingId && <p className="mt-2 text-xs text-stone-400">等待出牌</p>}
                </motion.div>
              );
            })}
          </div>
        </section>

        <aside className="craft-card rounded-3xl border border-stone-200 bg-white/95 p-5 space-y-5">
          <div>
            <p className="text-[10px] font-mono font-bold text-purple-700">能力应用反馈</p>
            <h2 className="mt-1 text-lg font-bold text-stone-950">任务要求与能力对应关系</h2>
          </div>

          {matchStyle ? (
            <div className={`rounded-2xl border p-4 ${matchStyle.className}`}>
              <div className="flex items-center gap-2 text-xs font-bold"><Check className="h-4 w-4" />{matchStyle.label}</div>
              <p className="mt-2 text-xs leading-relaxed">{currentRound.feedback}</p>
              {currentRound.matched_skills.length > 0 && (
                <p className="mt-3 border-t border-current/10 pt-3 text-[10px]">对应能力：{currentRound.matched_skills.join('、')}</p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 text-xs leading-relaxed text-stone-600">
              提交本轮选择后，系统根据固定任务评价维度给出匹配结果。该过程不调用大模型。
            </div>
          )}

          {missingCardIds.length > 0 && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-[11px] leading-relaxed text-rose-800">
              当前记录包含已经从能力库移除的卡牌。清理失效卡位后可以继续提交。
            </div>
          )}

          {!evaluated && (
            <button
              onClick={onEvaluate}
              disabled={!ready || saving}
              className="craft-btn-black flex w-full items-center justify-center gap-2 px-4 py-3 text-xs disabled:opacity-40"
            >
              {saving ? '正在保存…' : '提交本轮选择'}<ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}

          {evaluated && !isLastChallenge && (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => updateRound({ ...currentRound, match_level: null, matched_card_ids: [], matched_skills: [], feedback: '' })} disabled={saving} className="craft-btn-secondary flex items-center justify-center gap-1 px-3 py-3 text-xs"><RotateCcw className="h-3.5 w-3.5" />调整选择</button>
              <button onClick={() => onSelectChallenge(challengeIndex + 1)} disabled={saving} className="craft-btn-black flex items-center justify-center gap-1 px-3 py-3 text-xs">下一项挑战<ArrowRight className="h-3.5 w-3.5" /></button>
            </div>
          )}

          {evaluated && isLastChallenge && answer.card_play_completed && (
            <button onClick={onEnterWorkbench} disabled={saving} className="craft-btn-black flex w-full items-center justify-center gap-2 px-4 py-3 text-xs">
              进入真实任务<ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}

          <p className="border-t border-stone-100 pt-4 text-[10px] leading-relaxed text-stone-500">
            阶段 1 只记录能力应用判断。阶段 2 的五步任务产出和事件响应是最终评价依据。
          </p>
        </aside>
      </div>
    </div>
  );
}
