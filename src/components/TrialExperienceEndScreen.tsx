import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Award, Compass, Crosshair, Eye, Layers, RotateCw, Sparkles } from 'lucide-react';
import type { SkillCard } from '../types';
import type { ApiTrialEvaluation } from '../types/api';

interface TrialExperienceEndScreenProps {
  updatedCards: SkillCard[];
  allAccumulatedCards: SkillCard[];
  onEnterProfile: () => void;
  onContinueExplore: () => void;
  evaluation?: ApiTrialEvaluation | null;
}

const CARD_ICONS = { Layers, Eye, Award, Crosshair, Compass } as const;

function CardIcon({ card, className }: { card: SkillCard; className: string }) {
  const Icon = CARD_ICONS[card.icon as keyof typeof CARD_ICONS] || Sparkles;
  return <Icon className={className} />;
}

export const TrialExperienceEndScreen: React.FC<TrialExperienceEndScreenProps> = ({
  updatedCards,
  allAccumulatedCards,
  onEnterProfile,
  onContinueExplore,
  evaluation,
}) => {
  const [flippedCardIds, setFlippedCardIds] = useState<Record<string, boolean>>({});
  const totalPoolCards = useMemo(() => {
    const updatedIds = new Set(updatedCards.map(card => card.id));
    return [...allAccumulatedCards.filter(card => !updatedIds.has(card.id)), ...updatedCards];
  }, [allAccumulatedCards, updatedCards]);
  const pendingAbilityResults = useMemo(
    () => (evaluation?.ability_applications || []).filter(application => application.card_id.startsWith('pending:')),
    [evaluation],
  );

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col justify-between px-4 py-6 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-stone-100/50 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-stone-100/30 blur-3xl" />
      </div>

      <div className="relative z-10 space-y-6 sm:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="craft-card flex w-full flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 text-center shadow-2xs sm:flex-row sm:gap-6 sm:rounded-3xl sm:p-7 sm:text-left"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-stone-100 text-stone-800 sm:h-14 sm:w-14">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-stone-900 text-white shadow-xs sm:h-8 sm:w-8">
              <Sparkles className="h-3.5 w-3.5 text-orange-400 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            <h2 className="craft-serif font-serif text-base font-normal tracking-tight text-stone-900 sm:text-lg">
              {evaluation?.summary || `本轮任务总结已生成，形成 ${updatedCards.length} 张能力卡更新。`}
            </h2>
            <p className="text-xs font-normal leading-relaxed text-stone-600 sm:text-sm">
              {updatedCards.length > 0
                ? `能力库已成功同步更新 ${updatedCards.length} 张卡片，实战证据将持续丰富你的职业画像。`
                : '本次结果已保留。当前没有足够的能力应用证据，因此不会改写已有能力卡。'}
            </p>
          </div>
        </motion.div>

        {evaluation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-xs sm:grid-cols-3 sm:rounded-3xl sm:p-5"
          >
            <div>
              <p className="text-[10px] font-medium text-stone-400">本轮表现</p>
              <p className="mt-1 text-sm text-stone-800">{evaluation.observed_level} · {evaluation.confidence}置信度</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-stone-400">做得比较好的地方</p>
              <p className="mt-1 text-xs leading-5 text-stone-700">{evaluation.strengths?.[0] || '暂未形成明确优势证据'}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-stone-400">下一步</p>
              <p className="mt-1 text-xs leading-5 text-stone-700">{evaluation.next_step}</p>
            </div>
          </motion.div>
        )}

        {pendingAbilityResults.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
            className="rounded-2xl border border-amber-200 bg-amber-50/45 p-4 text-left sm:rounded-3xl sm:p-5"
          >
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-stone-900">待验证能力的本轮结果</p>
                <p className="mt-1 text-[11px] leading-5 text-stone-600">任务中出现了相关证据，但不会因为完成一次任务就自动写入长期能力库。</p>
              </div>
              <span className="rounded-full border border-amber-200 bg-white/70 px-2.5 py-1 text-[10px] text-amber-800">候选证据</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {pendingAbilityResults.map(application => (
                <article key={application.card_id} className="rounded-2xl border border-amber-100 bg-white/80 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-stone-900">{application.card_title}</p>
                    <span className="shrink-0 text-[10px] text-amber-800">{application.status}</span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-5 text-stone-600">{application.basis}</p>
                  <p className="mt-1 text-[10px] leading-4 text-stone-500">下一步：{application.next_step}</p>
                </article>
              ))}
            </div>
          </motion.section>
        )}

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="w-full py-2">
          <div className={`mx-auto grid max-w-4xl justify-center gap-4 sm:gap-5 ${totalPoolCards.length <= 2 ? 'max-w-lg grid-cols-1 sm:grid-cols-2' : totalPoolCards.length === 3 ? 'max-w-3xl grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
            {totalPoolCards.map((card, index) => {
              const flipped = Boolean(flippedCardIds[card.id]);
              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => setFlippedCardIds(current => ({ ...current, [card.id]: !current[card.id] }))}
                  className="group h-[290px] cursor-pointer select-none [perspective:1000px] sm:h-[310px]"
                  title="点击翻转卡牌查看详情"
                >
                  <div className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
                    <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-3.5 text-stone-900 shadow-xs transition-all duration-200 [backface-visibility:hidden] hover:border-orange-300 hover:bg-stone-50/50 hover:shadow-md sm:p-4">
                      <div className="flex shrink-0 items-center justify-between gap-1 border-b border-stone-100 pb-1.5">
                        <span className="rounded-md border border-stone-200 bg-stone-100 px-2 py-0.5 font-mono text-[10px] font-medium text-stone-800">{card.category}</span>
                        <span className="font-mono text-[9px] text-stone-400">#0{index + 1}</span>
                      </div>
                      <div className="my-auto flex flex-col items-center py-1 text-center">
                        <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200 bg-stone-100 text-stone-800 shadow-2xs">
                          <CardIcon card={card} className="h-4 w-4 text-stone-700" />
                        </div>
                        <h4 className="craft-serif mb-1 font-serif text-sm font-semibold leading-snug text-stone-900">{card.title}</h4>
                        <p className="line-clamp-2 px-1 text-[11px] leading-relaxed text-stone-600">{card.description}</p>
                      </div>
                      <div className="flex shrink-0 items-center justify-between border-t border-stone-100 pt-2 text-[10px] text-stone-500">
                        <span>点击翻转详情</span>
                        <RotateCw className="h-3 w-3 text-stone-400 transition-transform duration-300 group-hover:rotate-180" />
                      </div>
                    </div>

                    <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-stone-800 bg-stone-900 p-4 text-white shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
                          <span className="flex items-center gap-1 font-mono text-[10px] font-medium text-stone-200"><Sparkles className="h-3 w-3 text-orange-400" />能力落地解析</span>
                          <span className="font-mono text-[9px] text-stone-400">#0{index + 1}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-stone-300">{card.detail || card.description}</p>
                        {card.workplaceApplication && (
                          <div className="rounded-xl border border-stone-700 bg-stone-800 p-2 text-[10px] leading-tight text-stone-300">
                            <span className="mb-0.5 block font-medium text-orange-400">职场应用：</span>
                            {card.workplaceApplication}
                          </div>
                        )}
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
        <div className="space-y-0.5">
          <p className="text-xs font-normal text-stone-800 sm:text-sm">当前已积累 <span className="font-mono text-sm font-bold text-stone-900 sm:text-base">{totalPoolCards.length}</span> 张能力卡</p>
          <p className="text-[11px] font-normal text-stone-500 sm:text-xs">你可以进入个人档案查阅完整技能雷达，或继续探索更多职业</p>
        </div>
        <div className="flex w-full max-w-sm flex-col items-center justify-center gap-3 sm:flex-row">
          <button type="button" onClick={onEnterProfile} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-center text-sm text-white shadow-sm transition hover:bg-black hover:shadow-md"><Sparkles className="h-4 w-4 text-orange-400" />进入我的档案</button>
          <button type="button" onClick={onContinueExplore} className="craft-btn-secondary w-full px-6 py-2.5 text-center text-xs sm:text-sm">继续探索其他职业</button>
        </div>
      </motion.div>
    </div>
  );
};
