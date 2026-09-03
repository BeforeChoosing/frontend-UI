import React from 'react';
import { motion } from 'motion/react';
import { Check, Edit3, Eye, HelpCircle, Layers, RotateCw, Sparkles, Target, X } from 'lucide-react';
import type { SkillCard } from '../types';
import type { VerificationStatus } from './AbilityCardVerificationScreen';

export function getCandidateEvidenceLabel(card: SkillCard): string {
  if (card.claimLevel === 'hypothesis' || card.evidenceType === 'inference') return '这是推测，待你确认';
  if (card.claimLevel === 'interpretation') return '基于经历的解读，待你确认';
  if (card.evidenceType === 'documented_fact') return '来自材料记录';
  if (card.evidenceType === 'self_report') return '来自你的自述';
  return '证据来源待核对';
}

interface CandidateAbilityCardProps {
  card: SkillCard;
  index: number;
  status: VerificationStatus;
  evidenceLabel: string;
  flipped: boolean;
  editing: boolean;
  editTitle: string;
  editDesc: string;
  mergeSelected: boolean;
  onStatus: (status: VerificationStatus) => void;
  onFlip: () => void;
  onEdit: () => void;
  onEditTitle: (value: string) => void;
  onEditDesc: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onMerge: () => void;
}

export const CandidateAbilityCard: React.FC<CandidateAbilityCardProps> = ({ card, index, status, evidenceLabel, flipped, editing,
  editTitle, editDesc, mergeSelected, onStatus, onFlip, onEdit, onEditTitle, onEditDesc,
  onSave, onCancel, onMerge }) => {
  const Icon = card.category === '洞察分析' ? Eye : card.category === '产品策略' ? Layers : card.category === '数据驱动' ? Target : Sparkles;
  const selected = status === 'confirmed';
  return (
    <motion.article
      aria-label={`候选能力卡：${card.title}`}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30, delay: index * 0.04 }}
      className="candidate-ability-card w-[270px] max-w-full shrink-0 space-y-3"
    >
      <div className="h-[360px] [perspective:1000px]">
        <div className={`candidate-card-turn relative h-full w-full [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
          <div aria-hidden={flipped} inert={flipped} data-selected={selected} className="candidate-card-face absolute inset-0 flex flex-col rounded-[24px] border p-5 [backface-visibility:hidden]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-medium text-stone-600"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 text-[#25765c]"><Icon className="h-4 w-4" /></span>{card.category}</span>
              <button type="button" aria-label={`收录${card.title}`} aria-pressed={selected} onClick={() => onStatus(selected ? 'unsure' : 'confirmed')}
                className="candidate-selection flex h-9 w-9 items-center justify-center rounded-full">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${selected ? 'border-[#25765c] bg-[#25765c] text-white' : 'border-stone-300 bg-white text-transparent'}`}><Check className="h-3.5 w-3.5" strokeWidth={2.5} /></span>
              </button>
            </div>
            {editing ? (
              <div className="relative flex min-h-0 flex-1 flex-col gap-3 pt-4">
                <label className="text-xs text-stone-600">能力名称<input autoFocus aria-label="能力名称" value={editTitle} onChange={e => onEditTitle(e.target.value)} className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900" /></label>
                <label className="text-xs text-stone-600">一句话描述<textarea aria-label="能力一句话描述" value={editDesc} onChange={e => onEditDesc(e.target.value)} rows={3} className="mt-1 w-full resize-none rounded-xl border border-stone-300 bg-white p-3 text-sm leading-5 text-stone-900" /></label>
                <div className="mt-auto flex justify-end gap-2 text-xs">
                  <button type="button" onClick={onCancel} className="rounded-full border border-stone-200 bg-white px-3 py-1.5">取消</button>
                  <button type="button" onClick={onSave} disabled={!editTitle.trim()} className="rounded-full bg-[#25765c] px-4 py-2 text-white disabled:opacity-40">保存</button>
                </div>
              </div>
            ) : <>
              <div className="flex-1 pt-5 text-left">
                <h3 title={card.title} className="line-clamp-2 text-[18px] font-semibold leading-[1.45] tracking-tight text-stone-950">{card.title}</h3>
                <p className="mt-2 line-clamp-3 text-[13px] leading-[1.7] text-stone-600">{card.description}</p>
              </div>
              <div className="rounded-xl bg-white/75 px-3 py-2.5 text-xs leading-5 text-stone-600">
                <p className="mb-1 text-[11px] font-medium text-[#25765c]">可以用在哪里</p>
                <p className="line-clamp-2">{card.workplaceApplication || card.detail || '尚待补充应用场景'}</p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-stone-200/70 pt-2">
                <button type="button" onClick={onFlip} className="flex min-h-9 items-center gap-1.5 rounded-lg text-xs font-medium text-[#25765c]"><RotateCw className="h-3.5 w-3.5" />翻转查证据</button>
                <button type="button" onClick={onEdit} aria-label={`编辑${card.title}`} className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 hover:bg-black/5"><Edit3 className="h-4 w-4" /></button>
              </div>
            </>}
          </div>
          <div aria-hidden={!flipped} inert={!flipped} className="absolute inset-0 flex flex-col rounded-[24px] border border-[#285448] bg-[#183d32] p-5 text-stone-100 shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="mb-2 flex items-center justify-between border-b border-stone-700 pb-2 text-[10px]"><span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-emerald-400" />能力线索与证据</span><span className="text-stone-400">{String(index + 1).padStart(2, '0')}</span></div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1 text-xs leading-5">
              <h4 className="font-serif text-sm font-semibold">{card.title}</h4>
              <span className="inline-block rounded-md border border-stone-600 px-1.5 text-[9px] text-stone-300">{evidenceLabel}</span>
              <p>{card.matchReason || card.detail || '暂未提供详细证据，请补充经历后再确认。'}</p>
              {card.evidenceQuote && <blockquote className="border-l-2 border-emerald-400 pl-2 text-stone-300">{card.evidenceQuote}</blockquote>}
              {card.detail && <p className="text-stone-300">{card.detail}</p>}
              {card.workplaceApplication && <p className="rounded-lg border border-stone-700 bg-stone-800 p-2 text-stone-200">应用：{card.workplaceApplication}</p>}
              {card.sourceRefs?.length ? <p className="text-stone-400">来源：{card.sourceRefs.join('、')}</p> : null}
            </div>
            <button type="button" onClick={onFlip} className="mt-2 flex shrink-0 items-center justify-center gap-1 rounded-lg border border-stone-700 bg-stone-800 py-1.5 text-[10px]"><RotateCw className="h-3 w-3" />翻回正面</button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 rounded-full bg-stone-100/90 p-1">
        {([{ value: 'confirmed', label: '这像我', icon: Check }, { value: 'unsure', label: '待确认', icon: HelpCircle }, { value: 'rejected', label: '不像我', icon: X }] as const).map(item => (
          <button key={item.value} type="button" onClick={() => onStatus(item.value)} aria-pressed={status === item.value} className={`flex min-h-9 items-center justify-center gap-1 rounded-full text-[11px] font-medium ${status === item.value ? item.value === 'confirmed' ? 'bg-[#25765c] text-white shadow-sm' : 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:bg-white/60'}`}><item.icon className="h-3 w-3" />{item.label}</button>
        ))}
      </div>
      <button type="button" onClick={onMerge} disabled={status === 'rejected'} aria-pressed={mergeSelected} className={`min-h-9 w-full rounded-xl text-center text-xs disabled:opacity-40 ${mergeSelected ? 'bg-emerald-50 font-medium text-emerald-800' : 'text-stone-500 hover:bg-stone-100'}`}>{mergeSelected ? '已选择合并' : '选择合并'}</button>
    </motion.article>
  );
};
