import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Bot, Check, CircleHelp, Clock3, FileText, LockKeyhole, RefreshCw, Send, ShieldCheck } from 'lucide-react';
import { useA02TrialTask } from '../hooks/useA02TrialTask';
import type {
  ApiA02Answer,
  ApiA02Task,
  ApiTrialSession,
  TrialAttributionLayer,
  TrialConfidence,
} from '../types/api';

interface A02TrialTaskScreenProps {
  onBackToExplore: () => void;
  onEnterProfile: () => void;
  onOpenAgentChat?: (agentId?: string) => void;
}

const EMPTY_ANSWER: ApiA02Answer = {
  attributions: [],
  priority_case_ids: [],
  evidence: [],
  validation_plans: [],
  event_decision: null,
  event_priority_case_ids: [],
  event_reason: '',
};

const STEP_LABELS = ['归因', '优先级', '取证', '验证计划', '事件后复答'];

function createInitialAnswer(task: ApiA02Task): ApiA02Answer {
  return {
    ...EMPTY_ANSWER,
    attributions: task.bad_cases.map((item) => ({
      case_id: item.id,
      layer: '暂无法判断',
      confidence: '中',
    })),
  };
}

function mergeAnswer(task: ApiA02Task, answer: ApiA02Answer): ApiA02Answer {
  if (answer.attributions.length > 0) return answer;
  return createInitialAnswer(task);
}

function canAdvance(step: number, answer: ApiA02Answer, session: ApiTrialSession | null) {
  if (step === 1) return answer.attributions.length === 8;
  if (step === 2) return answer.priority_case_ids.length === 2;
  if (step === 3) {
    const evidenceById = new Map(answer.evidence.map((item) => [item.source_id, item]));
    return evidenceById.size >= 2 && answer.priority_case_ids.every((id) => (
      Boolean(evidenceById.get(id)?.explanation.trim())
    ));
  }
  if (step === 4) {
    const plans = new Map(answer.validation_plans.map((item) => [item.case_id, item]));
    return answer.priority_case_ids.every((id) => {
      const plan = plans.get(id);
      return Boolean(plan?.action.trim() && plan.expected_signal.trim());
    });
  }
  return Boolean(
    session?.event_revealed
      && answer.event_decision
      && answer.event_priority_case_ids.length === 2
      && answer.event_reason.trim(),
  );
}

export const A02TrialTaskScreen: React.FC<A02TrialTaskScreenProps> = ({
  onBackToExplore,
  onEnterProfile,
  onOpenAgentChat,
}) => {
  const { task, session, status, error, saveAnswer, revealEvent, submit } = useA02TrialTask();
  const [answer, setAnswer] = useState<ApiA02Answer>(EMPTY_ANSWER);
  const [step, setStep] = useState(1);
  const [coachLevel, setCoachLevel] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (task && session) {
      setAnswer(mergeAnswer(task, session.answer));
      if (session.event_revealed) setStep((current) => Math.max(current, 5));
    }
  }, [task, session?.id, session?.event_revealed]);

  const isBusy = status === 'saving' || status === 'submitting';
  const taskError = localError || error;

  const selectedPriorityCases = useMemo(
    () => (task ? task.bad_cases.filter((item) => answer.priority_case_ids.includes(item.id)) : []),
    [answer.priority_case_ids, task],
  );

  const updateAttribution = (caseId: string, key: 'layer' | 'confidence', value: string) => {
    setAnswer((current) => ({
      ...current,
      attributions: current.attributions.map((item) => (
        item.case_id === caseId ? { ...item, [key]: value } : item
      )),
    }));
  };

  const updatePriority = (index: number, caseId: string) => {
    setAnswer((current) => {
      const next = [...current.priority_case_ids];
      const otherIndex = next.findIndex((value, currentIndex) => value === caseId && currentIndex !== index);
      if (otherIndex >= 0) next[otherIndex] = next[index] || '';
      next[index] = caseId;
      return { ...current, priority_case_ids: next.filter(Boolean) };
    });
  };

  const updateEventPriority = (index: number, caseId: string) => {
    setAnswer((current) => {
      const next = [...current.event_priority_case_ids];
      const otherIndex = next.findIndex((value, currentIndex) => value === caseId && currentIndex !== index);
      if (otherIndex >= 0) next[otherIndex] = next[index] || '';
      next[index] = caseId;
      return { ...current, event_priority_case_ids: next.filter(Boolean) };
    });
  };

  const toggleEvidence = (sourceId: string, sourceType: 'case' | 'metric') => {
    setAnswer((current) => {
      const exists = current.evidence.some((item) => item.source_id === sourceId);
      return {
        ...current,
        evidence: exists
          ? current.evidence.filter((item) => item.source_id !== sourceId)
          : [...current.evidence, { source_id: sourceId, source_type: sourceType, explanation: '' }],
      };
    });
  };

  const updateEvidenceExplanation = (sourceId: string, explanation: string) => {
    setAnswer((current) => ({
      ...current,
      evidence: current.evidence.map((item) => (
        item.source_id === sourceId ? { ...item, explanation } : item
      )),
    }));
  };

  const updateValidationPlan = (caseId: string, key: 'action' | 'expected_signal', value: string) => {
    setAnswer((current) => {
      const existing = current.validation_plans.find((item) => item.case_id === caseId);
      const nextPlan = existing
        ? { ...existing, [key]: value }
        : { case_id: caseId, action: key === 'action' ? value : '', expected_signal: key === 'expected_signal' ? value : '' };
      return {
        ...current,
        validation_plans: [
          ...current.validation_plans.filter((item) => item.case_id !== caseId),
          nextPlan,
        ],
      };
    });
  };

  const handleNext = async () => {
    if (!task || !session) return;
    setLocalError(null);
    if (!canAdvance(step, answer, session)) {
      setLocalError(step === 1 ? '请为 8 个 Bad Case 完成归因和置信度选择。' : '请先完成当前步骤的必填内容。');
      return;
    }
    try {
      await saveAnswer(answer);
      if (step === 4 && !session.event_revealed) {
        await revealEvent();
      }
      setStep((current) => Math.min(5, current + 1));
    } catch {
      // Hook exposes the request error in the page-level alert.
    }
  };

  const handleSubmit = async () => {
    if (!task || !session) return;
    setLocalError(null);
    if (!canAdvance(5, answer, session)) {
      setLocalError('请完成事件后的重新决策、Top 2 和理由。');
      return;
    }
    try {
      await saveAnswer(answer);
      await submit();
    } catch {
      // Hook exposes the request error in the page-level alert.
    }
  };

  if (!task || !session) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
        <div className="craft-card max-w-md w-full rounded-3xl p-7 bg-white/90 border border-stone-200 text-center space-y-3">
          {status === 'loading' ? <RefreshCw className="w-6 h-6 mx-auto animate-spin text-stone-500" /> : <AlertCircle className="w-6 h-6 mx-auto text-rose-600" />}
          <h2 className="text-base font-bold text-stone-900">{status === 'loading' ? '正在加载 A-02 试路任务' : '试路任务暂时不可用'}</h2>
          {taskError && <p role="alert" className="text-xs text-rose-700">{taskError}</p>}
          <button onClick={onBackToExplore} className="craft-btn-secondary px-4 py-2 text-xs">返回职业探索</button>
        </div>
      </div>
    );
  }

  if (session.status === 'submitted' && session.evaluation && session.observed_evidence) {
    return (
      <div className="min-h-[calc(100vh-64px)] max-w-5xl mx-auto px-4 sm:px-6 py-8 relative">
        <div className="craft-card bg-white/90 rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] text-emerald-700 font-mono font-bold">OBSERVED EVIDENCE · A-02</p>
              <h1 className="text-2xl font-serif craft-serif text-stone-900 mt-1">任务复盘已完成</h1>
              <p className="text-sm text-stone-600 mt-2">{session.evaluation.summary}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-mono">置信度：{session.evaluation.confidence}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {session.evaluation.dimensions.map((item) => (
              <div key={item.dimension} className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-stone-800">{item.dimension}</span>
                  <span className="text-sm font-mono font-bold text-amber-800">{item.score}</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed mt-2">{item.evidence}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 space-y-2">
            <p className="text-xs font-bold text-emerald-900">已记录的 Observed Evidence</p>
            <p className="text-xs text-emerald-900/80 leading-relaxed">{session.observed_evidence.statement}</p>
            <p className="text-[11px] text-emerald-800/70">{session.observed_evidence.caveats.join(' · ')}</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2 border-t border-stone-100">
            <p className="text-xs text-stone-500">下一步：{session.evaluation.next_step}</p>
            <div className="flex gap-2">
              <button onClick={onBackToExplore} className="craft-btn-secondary px-4 py-2 text-xs">返回职业探索</button>
              <button onClick={onEnterProfile} className="craft-btn-black px-4 py-2 text-xs">查看个人档案</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activePrompt = task.coach_prompts[coachLevel] || task.coach_prompts[0];
  const sourceOptions = [
    ...task.metrics.map((metric) => ({ id: metric.id, type: 'metric' as const, label: metric.label, detail: `${metric.current}（上周 ${metric.previous}）` })),
    ...task.bad_cases.map((badCase) => ({ id: badCase.id, type: 'case' as const, label: `Case ${badCase.id.replace('case-', '')} · ${badCase.title}`, detail: badCase.description })),
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] max-w-[1500px] mx-auto px-3 sm:px-5 py-5 sm:py-7 relative">
      <div className="space-y-4 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2">
            <button onClick={onBackToExplore} className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> 返回职业探索
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-mono font-bold">A-02</span>
              <span className="px-2 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-mono">{task.role_type}</span>
              <span className="px-2 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-mono flex items-center gap-1"><Clock3 className="w-3 h-3" /> {task.estimated_minutes}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif craft-serif text-stone-900 tracking-tight">{task.title}</h1>
            <p className="text-sm text-stone-600 max-w-3xl leading-relaxed">{task.subtitle}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-xs text-stone-600 max-w-sm">
            <div className="flex items-center gap-2 text-stone-900 font-bold"><ShieldCheck className="w-4 h-4 text-emerald-600" />模拟试路材料</div>
            <p className="mt-1 leading-relaxed">{task.source_note}</p>
          </div>
        </div>

        {taskError && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">{taskError}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-[270px_minmax(0,1fr)_270px] gap-4 items-start">
          <aside className="space-y-3">
            <div className="craft-card bg-white/90 rounded-2xl border border-stone-200 p-4 space-y-3">
              <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-purple-600" /><h2 className="text-sm font-bold text-stone-900">任务材料</h2></div>
              <p className="text-xs text-stone-600 leading-relaxed">{task.role}</p>
              <p className="text-xs text-stone-600 leading-relaxed">{task.background}</p>
              <div className="pt-2 border-t border-stone-100 space-y-1.5">
                <p className="text-[10px] font-mono text-stone-400">本次目标</p>
                <p className="text-xs text-stone-800 leading-relaxed">{task.goal}</p>
              </div>
            </div>
            <div className="craft-card bg-white/90 rounded-2xl border border-stone-200 p-4 space-y-3">
              <h2 className="text-xs font-bold text-stone-900">运行指标（模拟）</h2>
              <div className="grid grid-cols-1 gap-1.5">
                {task.metrics.map((metric) => (
                  <div key={metric.id} className="rounded-xl bg-stone-50 border border-stone-100 px-2.5 py-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-stone-600">{metric.label}</span>
                    <span className="text-[10px] font-mono text-stone-900">{metric.current} <span className="text-stone-400">/ {metric.previous}</span></span>
                  </div>
                ))}
              </div>
            </div>
            <div className="craft-card bg-white/90 rounded-2xl border border-stone-200 p-4 space-y-2">
              <h2 className="text-xs font-bold text-stone-900">初始约束</h2>
              {task.constraints.map((constraint) => <p key={constraint} className="text-[11px] text-stone-600 leading-relaxed">• {constraint}</p>)}
            </div>
          </aside>

          <main className="craft-card bg-white/95 rounded-2xl border border-stone-200 p-4 sm:p-6 space-y-5 min-w-0">
            <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <p className="text-[10px] font-mono text-purple-700 font-bold">STEP {step} / 5</p>
                <h2 className="text-base font-bold text-stone-900 mt-1">{STEP_LABELS[step - 1]}</h2>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">{status === 'saving' ? '自动保存中…' : session.updated_at ? `已保存 ${new Date(session.updated_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}` : '未保存'}</span>
            </div>

            {step === 1 && (
              <div className="space-y-3">
                <p className="text-xs text-stone-600">对 8 个 Bad Case 分别选择归因层和置信度。允许选择“暂无法判断”，不强迫猜答案。</p>
                <div className="overflow-x-auto rounded-xl border border-stone-200">
                  <table className="w-full text-xs min-w-[680px]">
                    <thead className="bg-stone-50 text-stone-500"><tr><th className="text-left p-2.5 font-medium">Bad Case</th><th className="text-left p-2.5 font-medium">归因层</th><th className="text-left p-2.5 font-medium">置信度</th></tr></thead>
                    <tbody>
                      {task.bad_cases.map((badCase) => {
                        const current = answer.attributions.find((item) => item.case_id === badCase.id);
                        return <tr key={badCase.id} className="border-t border-stone-100 align-top">
                          <td className="p-2.5"><div className="font-bold text-stone-800">{badCase.id.replace('case-', 'Case ')} · {badCase.title}</div><div className="text-[11px] text-stone-500 mt-1 leading-relaxed">{badCase.description}</div></td>
                          <td className="p-2.5"><select value={current?.layer || '暂无法判断'} onChange={(event) => updateAttribution(badCase.id, 'layer', event.target.value)} className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-[11px] text-stone-700"><option value="暂无法判断">暂无法判断</option>{task.attribution_layers.filter((layer) => layer !== '暂无法判断').map((layer) => <option key={layer} value={layer}>{layer}</option>)}</select></td>
                          <td className="p-2.5"><select value={current?.confidence || '中'} onChange={(event) => updateAttribution(badCase.id, 'confidence', event.target.value as TrialConfidence)} className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-[11px] text-stone-700"><option value="低">低</option><option value="中">中</option><option value="高">高</option></select></td>
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-stone-600">从系统性问题中选出 Priority 1 和 Priority 2，不能只按单个 Case 的严重程度排序。</p>
                {[0, 1].map((index) => <label key={index} className="block space-y-1.5"><span className="text-xs font-bold text-stone-800">Priority {index + 1}</span><select value={answer.priority_case_ids[index] || ''} onChange={(event) => updatePriority(index, event.target.value)} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs text-stone-700"><option value="">请选择 Case</option>{task.bad_cases.map((badCase) => <option key={badCase.id} value={badCase.id} disabled={answer.priority_case_ids.includes(badCase.id) && answer.priority_case_ids[index] !== badCase.id}>{badCase.id.replace('case-', 'Case ')} · {badCase.title}</option>)}</select></label>)}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-stone-600">分别为 Top 2 引用 Case 或运行指标，并用短句说明为什么支持这个优先级。</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sourceOptions.map((source) => {
                    const selected = answer.evidence.some((item) => item.source_id === source.id);
                    return <label key={source.id} className={`rounded-xl border p-3 cursor-pointer transition ${selected ? 'border-purple-300 bg-purple-50/70' : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100'}`}><div className="flex items-start gap-2"><input type="checkbox" checked={selected} onChange={() => toggleEvidence(source.id, source.type)} className="mt-0.5 accent-purple-600" /><span><span className="block text-xs font-bold text-stone-800">{source.label}</span><span className="block text-[11px] text-stone-500 leading-relaxed mt-1">{source.detail}</span></span></div>{selected && <input value={answer.evidence.find((item) => item.source_id === source.id)?.explanation || ''} onChange={(event) => updateEvidenceExplanation(source.id, event.target.value)} onClick={(event) => event.stopPropagation()} placeholder="这条材料如何支持判断" className="mt-2 w-full rounded-lg border border-purple-200 bg-white px-2 py-1.5 text-[11px] outline-none" />}</label>;
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="text-xs text-stone-600">为 Top 2 各写一个先怎么验证的动作。验证动作需要能区分至少两个可能原因。</p>
                {selectedPriorityCases.map((badCase) => {
                  const plan = answer.validation_plans.find((item) => item.case_id === badCase.id);
                  return <div key={badCase.id} className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 space-y-3"><div className="text-xs font-bold text-stone-800">{badCase.id.replace('case-', 'Case ')} · {badCase.title}</div><textarea rows={2} value={plan?.action || ''} onChange={(event) => updateValidationPlan(badCase.id, 'action', event.target.value)} placeholder="验证动作，例如查看调用日志、权限和状态读取记录" className="w-full rounded-xl border border-stone-200 bg-white p-2.5 text-xs outline-none resize-none" /><input value={plan?.expected_signal || ''} onChange={(event) => updateValidationPlan(badCase.id, 'expected_signal', event.target.value)} placeholder="预期信号：什么结果可以区分假设" className="w-full rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-xs outline-none" /></div>;
                })}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-2"><div className="flex items-center gap-2 text-xs font-bold text-amber-900"><LockKeyhole className="w-4 h-4" />{task.event.actor}</div><p className="text-xs text-amber-900/80 leading-relaxed">{task.event.message}</p><p className="text-xs font-medium text-amber-900 leading-relaxed">{task.event.instruction}</p></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><label className="space-y-1.5 text-xs font-bold text-stone-800">事件后结论<select value={answer.event_decision || ''} onChange={(event) => setAnswer((current) => ({ ...current, event_decision: event.target.value as '维持' | '调整' }))} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-normal"><option value="">请选择</option><option value="维持">维持</option><option value="调整">调整</option></select></label>{[0, 1].map((index) => <label key={index} className="space-y-1.5 text-xs font-bold text-stone-800">事件后 Priority {index + 1}<select value={answer.event_priority_case_ids[index] || ''} onChange={(event) => updateEventPriority(index, event.target.value)} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-normal"><option value="">请选择</option>{task.bad_cases.map((badCase) => <option key={badCase.id} value={badCase.id}>{badCase.id.replace('case-', 'Case ')} · {badCase.title}</option>)}</select></label>)}</div>
                <textarea rows={4} value={answer.event_reason} onChange={(event) => setAnswer((current) => ({ ...current, event_reason: event.target.value }))} placeholder="说明哪项假设被削弱或保留，以及优先级为什么变化" className="w-full rounded-2xl border border-stone-200 bg-white p-3 text-xs leading-relaxed outline-none resize-none" />
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-100">
              <button onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1 || isBusy} className="craft-btn-secondary px-4 py-2 text-xs disabled:opacity-40">上一步</button>
              {step < 5 ? <button onClick={() => void handleNext()} disabled={isBusy} className="craft-btn-black px-4 py-2 text-xs flex items-center gap-1.5 disabled:opacity-60">{step === 4 ? '保存并触发事件' : '保存并继续'} <ArrowRight className="w-3.5 h-3.5" /></button> : <button onClick={() => void handleSubmit()} disabled={isBusy} className="craft-btn-black px-4 py-2 text-xs flex items-center gap-1.5 disabled:opacity-60"><Send className="w-3.5 h-3.5" />{status === 'submitting' ? '评价中…' : '提交任务'}</button>}
            </div>
          </main>

          <aside className="space-y-3">
            <div className="craft-card bg-stone-900 text-white rounded-2xl border border-stone-800 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><Bot className="w-4 h-4 text-purple-300" /><h2 className="text-sm font-bold">Coach Agent</h2></div><button onClick={() => onOpenAgentChat?.('task_coach')} className="text-[10px] text-stone-300 hover:text-white cursor-pointer">打开对话</button></div>
              <p className="text-[11px] text-stone-300 leading-relaxed">默认不直接给结论，只提供材料澄清、概念解释和有限提示。</p>
              <div className="flex gap-1.5">{task.coach_prompts.map((prompt, index) => <button key={prompt.level} onClick={() => setCoachLevel(index)} className={`px-2 py-1 rounded-full text-[10px] cursor-pointer ${coachLevel === index ? 'bg-purple-500 text-white' : 'bg-white/10 text-stone-300'}`}>{prompt.level}级</button>)}</div>
              <div className="rounded-xl bg-white/10 p-3"><div className="text-[10px] text-purple-200 font-bold">{activePrompt.title}</div><p className="text-xs text-stone-200 leading-relaxed mt-1.5">{activePrompt.content}</p></div>
            </div>
            <div className="craft-card bg-white/90 rounded-2xl border border-stone-200 p-4 space-y-3"><h2 className="text-xs font-bold text-stone-900 flex items-center gap-2"><CircleHelp className="w-4 h-4 text-purple-600" />作答进度</h2><div className="space-y-1.5">{STEP_LABELS.map((label, index) => { const number = index + 1; const complete = number < step || (number === 5 && session.event_revealed && canAdvance(5, answer, session)); return <button key={label} onClick={() => number <= step && setStep(number)} className="w-full flex items-center gap-2 text-left text-xs cursor-pointer"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${complete ? 'bg-emerald-100 text-emerald-700' : number === step ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-400'}`}>{complete ? <Check className="w-3 h-3" /> : number}</span><span className={number === step ? 'text-stone-900 font-bold' : 'text-stone-500'}>{label}</span></button>; })}</div></div>
          </aside>
        </div>
      </div>
    </div>
  );
};
