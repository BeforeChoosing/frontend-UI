import React from 'react';
import { ArrowRight, CheckCircle2, FileText, Layers, Target } from 'lucide-react';
import type { SkillCard } from '../types';
import type { ApiProfileEvidence } from '../types/api';

interface EvidenceChainProps {
  record: ApiProfileEvidence;
  cards: SkillCard[];
}

export const EvidenceChain: React.FC<EvidenceChainProps> = ({ record, cards }) => {
  const observed = record.observed_evidence;
  const evaluation = record.evaluation;
  const cardMap = new Map<string, SkillCard>(cards.map(card => [card.id, card] as [string, SkillCard]));
  const selectedCards = (observed.selected_card_ids || []).map(id => cardMap.get(id)?.title || id);
  const evidenceItems = observed.evidence_items || [];
  const evidenceRefs = evaluation?.evidence_refs || observed.evidence_refs || [];
  const taskEvidence = observed.completed_steps?.length
    ? observed.completed_steps
    : (evaluation?.process_evidence || []).slice(0, 3);
  const evidenceLabels = evidenceItems.length
    ? evidenceItems.map(item => item.label || item.id)
    : evidenceRefs;

  const nodes = [
    { title: '已确认能力', icon: Layers, items: selectedCards.length ? selectedCards : ['本次未选择能力卡'] },
    { title: '任务作答', icon: Target, items: taskEvidence.length ? taskEvidence : ['已提交任务答案'] },
    { title: '可核验证据', icon: FileText, items: evidenceLabels.length ? evidenceLabels : ['暂无独立证据引用'] },
    { title: '评价结论', icon: CheckCircle2, items: evaluation?.dimensions?.slice(0, 3).map(item => `${item.dimension} ${item.score}分`) || ['等待评价'] },
  ];

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3" aria-label="证据链">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="font-bold text-stone-900">证据链</h5>
          <p className="text-[11px] text-stone-500 mt-0.5">能力卡 → 作答过程 → 证据引用 → 评价依据</p>
        </div>
        <span className="text-[11px] text-stone-500">{evidenceLabels.length} 条引用</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-stretch">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          return (
            <React.Fragment key={node.title}>
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 min-h-[92px]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700"><Icon className="w-3.5 h-3.5 text-emerald-600" />{node.title}</div>
                <ul className="mt-2 space-y-1 text-[11px] text-stone-600">
                  {node.items.slice(0, 3).map((item, itemIndex) => <li key={`${item}-${itemIndex}`} className="truncate" title={item}>{item}</li>)}
                </ul>
              </div>
              {index < nodes.length - 1 && <ArrowRight className="hidden sm:block self-center w-4 h-4 text-stone-300" />}
            </React.Fragment>
          );
        })}
      </div>
      {evaluation?.next_step && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs text-emerald-900">
          下一步改进：{evaluation.next_step}
        </div>
      )}
    </section>
  );
};
