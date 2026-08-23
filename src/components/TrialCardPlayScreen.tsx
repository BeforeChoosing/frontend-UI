import type { DragEvent as ReactDragEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, Layers3, Target } from 'lucide-react';
import { motion } from 'motion/react';
import type { SkillCard } from '../types';
import type { ApiDynamicTrialAnswer, ApiTrialTaskDefinition } from '../types/api';
import { PlayableAbilityCard } from './PlayableAbilityCard';

interface TrialCardPlayScreenProps {
  task: ApiTrialTaskDefinition;
  cards: SkillCard[];
  answer: ApiDynamicTrialAnswer;
  error: string | null;
  saving: boolean;
  onChange: (answer: ApiDynamicTrialAnswer) => void;
  onContinue: () => void;
  onBack: () => void;
  onOpenCardDetail: (card: SkillCard) => void;
}

export function TrialCardPlayScreen({
  task,
  cards,
  answer,
  error,
  saving,
  onChange,
  onContinue,
  onBack,
  onOpenCardDetail,
}: TrialCardPlayScreenProps) {
  const selectedCards = answer.selected_card_ids
    .map(cardId => cards.find(card => card.id === cardId))
    .filter((card): card is SkillCard => Boolean(card));
  const ready = selectedCards.length > 0
    && answer.card_play_rationale.trim().length > 0
    && answer.validation_hypothesis.trim().length > 0;

  const toggleCard = (cardId: string) => {
    const selected = answer.selected_card_ids.includes(cardId);
    if (!selected && answer.selected_card_ids.length >= 4) return;
    onChange({
      ...answer,
      selected_card_ids: selected
        ? answer.selected_card_ids.filter(id => id !== cardId)
        : [...answer.selected_card_ids, cardId],
      card_play_completed: false,
    });
  };

  const ignoreDrag = (event: ReactDragEvent<HTMLElement>) => event.preventDefault();

  return (
    <div className="min-h-[calc(100vh-64px)] max-w-[1380px] mx-auto px-4 sm:px-6 py-7">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <button onClick={onBack} className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900">
            <ArrowLeft className="h-3.5 w-3.5" />返回职业探索
          </button>
          <p className="mt-5 text-[10px] font-mono font-bold tracking-[0.18em] text-purple-700">03 · 阶段 1 / 2</p>
          <h1 className="mt-2 text-3xl font-serif craft-serif text-stone-950">先为这次任务出牌</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
            选择准备带入任务的能力卡，写下使用思路和待验证假设。这里记录的是任务前判断，不会直接计入能力评价。
          </p>
        </div>
        <div className="w-full lg:w-[390px] rounded-2xl border border-stone-200 bg-white/90 p-4">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-purple-700"><Target className="h-3.5 w-3.5" />已选任务 · {task.id}</div>
          <h2 className="mt-1.5 text-base font-bold text-stone-950">{task.title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-stone-600">主要验证：{task.primary_skill}</p>
        </div>
      </div>

      {error && <div role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">{error}</div>}

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-5 items-start">
        <section className="craft-card rounded-3xl border border-stone-200 bg-white/95 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-stone-950"><Layers3 className="h-4 w-4 text-purple-600" />我的能力手牌</h2>
              <p className="mt-1 text-xs text-stone-500">选择 1–4 张已确认能力卡。再次点击可以收回。</p>
            </div>
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-mono text-stone-600">{selectedCards.length}/4</span>
          </div>

          {cards.length > 0 ? (
            <div className="mt-6 flex min-h-[190px] flex-wrap items-start justify-center gap-3 sm:justify-start">
              {cards.map((card, index) => (
                <PlayableAbilityCard
                  key={card.id}
                  card={card}
                  index={index}
                  total={cards.length}
                  selected={answer.selected_card_ids.includes(card.id)}
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

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Array.from({ length: 4 }, (_, index) => {
              const card = selectedCards[index];
              return (
                <motion.div
                  layout
                  key={card?.id || `empty-${index}`}
                  className={`min-h-20 rounded-2xl border p-3 ${card ? 'border-purple-200 bg-purple-50/70' : 'border-dashed border-stone-200 bg-stone-50/60'}`}
                >
                  <p className="text-[9px] font-mono text-stone-400">卡位 0{index + 1}</p>
                  {card ? <p className="mt-2 text-xs font-bold leading-snug text-stone-900">{card.title}</p> : <p className="mt-2 text-xs text-stone-400">等待出牌</p>}
                </motion.div>
              );
            })}
          </div>
        </section>

        <aside className="craft-card rounded-3xl border border-stone-200 bg-white/95 p-5 space-y-5">
          <div>
            <p className="text-[10px] font-mono font-bold text-purple-700">出牌说明</p>
            <h2 className="mt-1 text-lg font-bold text-stone-950">把能力变成任务前假设</h2>
          </div>
          <label className="block text-xs font-bold text-stone-800">
            准备如何使用这些能力
            <textarea
              rows={5}
              maxLength={1200}
              value={answer.card_play_rationale}
              onChange={event => onChange({ ...answer, card_play_rationale: event.target.value, card_play_completed: false })}
              placeholder="说明这些能力准备在哪个任务环节发挥作用。"
              className="mt-2 w-full resize-none rounded-2xl border border-stone-200 bg-stone-50/60 p-3 text-xs font-normal leading-relaxed outline-none focus:border-purple-300 focus:bg-white"
            />
          </label>
          <label className="block text-xs font-bold text-stone-800">
            本次准备验证的假设
            <textarea
              rows={4}
              maxLength={600}
              value={answer.validation_hypothesis}
              onChange={event => onChange({ ...answer, validation_hypothesis: event.target.value, card_play_completed: false })}
              placeholder="例如：验证自己能否根据新约束及时调整方案范围。"
              className="mt-2 w-full resize-none rounded-2xl border border-stone-200 bg-stone-50/60 p-3 text-xs font-normal leading-relaxed outline-none focus:border-purple-300 focus:bg-white"
            />
          </label>
          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3 text-[11px] leading-relaxed text-amber-900">
            出牌记录只保存任务前预期。后续评价只依据真实任务中的作答、材料引用、修改和事件响应。
          </div>
          <button
            onClick={onContinue}
            disabled={!ready || saving}
            className="craft-btn-black flex w-full items-center justify-center gap-2 px-4 py-3 text-xs disabled:opacity-40"
          >
            {saving ? '保存出牌记录…' : '进入真实任务'}<ArrowRight className="h-3.5 w-3.5" />
          </button>
          {answer.card_play_completed && (
            <p className="flex items-center justify-center gap-1 text-[10px] text-emerald-700"><Check className="h-3 w-3" />出牌记录已保存</p>
          )}
        </aside>
      </div>
    </div>
  );
}
