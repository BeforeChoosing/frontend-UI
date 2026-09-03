import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  FileText,
  Folder,
  Link2,
  LogOut,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import type { ApiDynamicTrialAnswer, ApiTrialTaskDefinition } from '../types/api';
import { TaskStepInput } from './TaskStepInput';

interface TrialWorkbenchScreenProps {
  task: ApiTrialTaskDefinition;
  answer: ApiDynamicTrialAnswer;
  stepIndex: number;
  completedStepIds: string[];
  active: boolean;
  busy: boolean;
  coachText: string | null;
  onActiveChange: (active: boolean) => void;
  onBackToExplore: () => void;
  onBackToMap?: () => void;
  onStepChange: (index: number) => void;
  onStepAnswerChange: (value: string) => void;
  onOpenMaterial: (materialId: string) => void;
  onToggleEvidence: (materialId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onCoach: (level: 1 | 2 | 3) => void;
}

const MATERIAL_KIND_LABELS: Record<string, string> = {
  feedback: '用户反馈',
  data: '数据资料',
  capability: '系统说明',
  constraint: '约束条件',
  case: '案例材料',
};

export function TrialWorkbenchScreen({
  task,
  answer,
  stepIndex,
  completedStepIds,
  active,
  busy,
  coachText,
  onActiveChange,
  onBackToExplore,
  onBackToMap,
  onStepChange,
  onStepAnswerChange,
  onOpenMaterial,
  onToggleEvidence,
  onPrevious,
  onNext,
  onSubmit,
  onCoach,
}: TrialWorkbenchScreenProps) {
  const [activeMaterialId, setActiveMaterialId] = useState(task.materials[0]?.id || '');
  const [previewMaterialId, setPreviewMaterialId] = useState<string | null>(null);
  const [showRequirements, setShowRequirements] = useState(false);
  const currentStep = task.steps[stepIndex];
  const activeMaterial = task.materials.find(material => material.id === activeMaterialId) || task.materials[0];
  const previewMaterial = task.materials.find(material => material.id === previewMaterialId) || null;
  const completionCount = completedStepIds.length;
  const sourceSummary = useMemo(
    () => task.materials.map(material => material.title).join('、'),
    [task.materials],
  );

  const selectMaterial = (materialId: string) => {
    setActiveMaterialId(materialId);
    onOpenMaterial(materialId);
  };

  if (!active) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[1500px] flex-col px-3 pb-5 pt-2 sm:px-5">
        <div className="craft-paper-surface flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm">
          <div className="flex min-h-14 items-center justify-between gap-3 border-b border-stone-200 px-4 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <span className="hidden font-mono text-[11px] text-stone-400 sm:inline">sim://{task.id.toLowerCase()}/briefing</span>
            </div>
            <div className="hidden items-center gap-2 text-xs font-medium text-stone-700 md:flex">
              <ShieldCheck className="h-4 w-4 text-stone-500" />阶段 03 · 真实工作台实战模拟
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onBackToMap || onBackToExplore} className="craft-btn-secondary flex items-center gap-1 px-3 py-2 text-xs"><ArrowLeft className="h-3.5 w-3.5" />{onBackToMap ? '返回任务地图' : '返回探索'}</button>
              <button onClick={() => onActiveChange(true)} className="craft-btn-black flex items-center gap-1.5 px-4 py-2 text-xs"><Sparkles className="h-3.5 w-3.5 text-amber-300" />进入工作台</button>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[minmax(320px,0.42fr)_minmax(0,0.58fr)]">
            <section className="flex min-h-[420px] flex-col rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h1 className="flex items-center gap-2 font-serif text-lg text-stone-950"><Target className="h-4 w-4 text-stone-600" />任务背景与目标</h1>
                <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-medium text-rose-800">{task.difficulty}</span>
              </div>
              <div className="mt-4 space-y-3 text-xs leading-6 text-stone-600">
                <p className="font-medium text-stone-900">{task.title}</p>
                <p>{task.role}</p>
                <p>{task.background}</p>
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-stone-800">{task.goal}</div>
              </div>
              <div className="mt-auto border-t border-stone-100 pt-4">
                <p className="text-[11px] font-bold text-stone-800">核心交付步骤</p>
                <div className="mt-2 space-y-2">
                  {task.steps.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-2 rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 text-xs text-stone-600">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-stone-900 font-mono text-[10px] text-white">{index + 1}</span>
                      <span><strong className="text-stone-900">{step.title}</strong> · {step.instruction}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="flex min-h-[420px] flex-col rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h2 className="flex items-center gap-2 font-serif text-lg text-stone-950"><Folder className="h-4 w-4 text-amber-700" />工作台资料库（{task.materials.length} 份）</h2>
                <span className="text-[10px] text-stone-400">点击材料预览</span>
              </div>
              <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 xl:grid-cols-3">
                {task.materials.map(material => (
                  <button key={material.id} onClick={() => setPreviewMaterialId(material.id)} className="min-h-32 rounded-2xl border border-stone-200 bg-stone-50/70 p-4 text-left transition-colors duration-150 hover:border-stone-300 hover:bg-white active:bg-stone-100">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-stone-200/70 px-2 py-0.5 text-[10px] text-stone-600">{MATERIAL_KIND_LABELS[material.kind] || material.kind}</span>
                      <FileText className="h-4 w-4 text-stone-400" />
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs font-bold leading-5 text-stone-900">{material.title}</p>
                    <p className="mt-1 line-clamp-3 text-[10px] leading-5 text-stone-500">{material.content}</p>
                    <span className="mt-3 block text-[10px] font-medium text-blue-700">预览材料</span>
                  </button>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4 text-[11px] text-stone-400">
                <span>工作台内可引用材料并获得分级思路提示</span>
                <button onClick={() => onActiveChange(true)} className="craft-btn-black flex items-center gap-1 px-4 py-2 text-xs">进入工作台<ArrowRight className="h-3.5 w-3.5" /></button>
              </div>
            </section>
          </div>

          <div className="mx-4 mb-4 flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-[11px] text-blue-900">
            <span>评价维度：{task.rubric.map(item => item.dimension).join(' · ')}</span>
            <span className="font-mono">{task.rubric.length} 项指标</span>
          </div>
        </div>

        <AnimatePresence>
          {previewMaterial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4"
            onClick={() => setPreviewMaterialId(null)}
          >
            <motion.section initial={{ opacity: 0, transform: 'translateY(8px) scale(0.98)' }} animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }} exit={{ opacity: 0, transform: 'translateY(5px) scale(0.985)' }} transition={{ type: 'spring', bounce: 0, duration: 0.28 }} className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl" onClick={event => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-3">
                <div><p className="text-[10px] text-stone-400">{MATERIAL_KIND_LABELS[previewMaterial.kind] || previewMaterial.kind}</p><h2 className="mt-1 font-serif text-lg text-stone-950">{previewMaterial.title}</h2></div>
                <button onClick={() => setPreviewMaterialId(null)} aria-label="关闭材料预览" className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500"><X className="h-4 w-4" /></button>
              </div>
              <p className="mt-4 max-h-[55vh] overflow-y-auto whitespace-pre-line text-xs leading-6 text-stone-700">{previewMaterial.content}</p>
              <div className="mt-5 flex justify-end"><button onClick={() => { selectMaterial(previewMaterial.id); setPreviewMaterialId(null); onActiveChange(true); }} className="craft-btn-black flex items-center gap-1.5 px-5 py-2.5 text-xs">在工作台打开<ArrowRight className="h-3.5 w-3.5" /></button></div>
            </motion.section>
          </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex h-screen w-screen flex-col overflow-hidden bg-[#FAF9F6] text-stone-900">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true"><span className="h-3 w-3 rounded-full bg-rose-400" /><span className="h-3 w-3 rounded-full bg-amber-400" /><span className="h-3 w-3 rounded-full bg-emerald-400" /></div>
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-stone-900 font-mono text-[10px] text-white">03</span>
          <strong className="hidden font-serif text-sm sm:inline">{task.role_type}实战工作台</strong>
          <span className="hidden h-4 w-px bg-stone-200 sm:block" />
          <span className="max-w-[42vw] truncate text-xs text-stone-600">{task.title}</span>
          <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 md:inline">本机自动暂存</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowRequirements(true)} className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-900"><Sparkles className="h-3.5 w-3.5" />任务要求</button>
          <button onClick={() => onActiveChange(false)} className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100 px-3 py-1.5 text-xs text-stone-700"><LogOut className="h-3.5 w-3.5" />退出</button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-3 p-3">
        <main className="flex min-w-0 flex-1 flex-col gap-3 lg:w-[70%]">
          <section className="flex min-h-0 flex-[0.9] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-stone-200 bg-stone-50/70 px-3 pt-2">
              {task.materials.map(material => (
                <button key={material.id} onClick={() => selectMaterial(material.id)} className={`flex shrink-0 items-center gap-1.5 rounded-t-xl border border-b-0 px-3 py-2 text-[11px] transition-colors duration-150 ${material.id === activeMaterial?.id ? 'border-stone-200 bg-white font-bold text-stone-900' : 'border-transparent text-stone-500 hover:bg-white/70 hover:text-stone-800'}`}>
                  <FileText className="h-3.5 w-3.5" />{material.title}
                </button>
              ))}
            </div>
            {activeMaterial && (
              <div className="flex min-h-0 flex-1 flex-col p-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div><p className="text-[10px] text-stone-400">{MATERIAL_KIND_LABELS[activeMaterial.kind] || activeMaterial.kind}</p><h2 className="mt-1 font-serif text-base text-stone-950">{activeMaterial.title}</h2></div>
                  <span className="text-[10px] text-stone-400">任务资料</span>
                </div>
                <p className="min-h-0 flex-1 overflow-y-auto whitespace-pre-line py-4 text-xs leading-6 text-stone-700">{activeMaterial.content}</p>
                <div className="flex shrink-0 items-center justify-between border-t border-stone-100 pt-3">
                  <span className="text-[10px] text-stone-400">引用状态会记录到本次任务答案</span>
                  <button onClick={() => onToggleEvidence(activeMaterial.id)} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-medium ${answer.evidence_refs.includes(activeMaterial.id) ? 'bg-purple-100 text-purple-800' : 'bg-stone-100 text-stone-700'}`}><Link2 className="h-3 w-3" />{answer.evidence_refs.includes(activeMaterial.id) ? '已引用到方案' : '引用到当前方案'}</button>
                </div>
              </div>
            )}
          </section>

          <section className="flex min-h-0 flex-[1.1] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <div className="flex shrink-0 items-center justify-between gap-3 overflow-x-auto border-b border-stone-200 px-3 pt-2">
              <div className="flex min-w-max items-center gap-1">
                {task.steps.map((step, index) => {
                  const complete = completedStepIds.includes(step.id);
                  return <button key={step.id} onClick={() => index <= stepIndex && onStepChange(index)} className={`flex items-center gap-1.5 rounded-t-xl border border-b-0 px-3 py-2 text-[11px] transition-colors duration-150 ${index === stepIndex ? 'border-stone-200 bg-stone-900 font-bold text-white' : complete ? 'border-transparent bg-emerald-50 text-emerald-700' : 'border-transparent text-stone-500'}`}><span className="flex h-4 w-4 items-center justify-center rounded-md bg-current/10 font-mono text-[9px]">{complete ? <Check className="h-3 w-3" /> : index + 1}</span>{step.title}</button>;
                })}
              </div>
              <span className="shrink-0 pb-2 text-[10px] font-mono text-stone-400">已完成 {completionCount}/{task.steps.length}</span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3"><p className="text-xs text-stone-700">{currentStep.instruction}</p><p className="mt-1 text-[10px] text-stone-400">{currentStep.input_mode} · {currentStep.constraint}</p></div>
              {stepIndex === task.steps.length - 1 && <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3"><p className="text-xs font-bold text-amber-900">{task.event.actor}</p><p className="mt-1 text-xs leading-5 text-amber-800">{task.event.message}</p><p className="mt-1 text-[11px] text-amber-900">{task.event.instruction}</p></div>}
              <div className="min-h-48 flex-1"><TaskStepInput value={answer.step_answers[currentStep.id] || ''} inputMode={currentStep.input_mode} instruction={currentStep.instruction} onChange={onStepAnswerChange} disabled={busy} /></div>
            </div>
            <div className="flex shrink-0 items-center justify-between border-t border-stone-200 px-4 py-3">
              <button onClick={onPrevious} disabled={stepIndex === 0 || busy} className="craft-btn-secondary px-4 py-2 text-xs disabled:opacity-40">上一步</button>
              {stepIndex < task.steps.length - 1 ? <button onClick={onNext} disabled={busy || !answer.step_answers[currentStep.id]?.trim()} className="craft-btn-black flex items-center gap-1.5 px-5 py-2 text-xs disabled:opacity-40">保存并继续<ArrowRight className="h-3.5 w-3.5" /></button> : <button onClick={onSubmit} disabled={busy || !answer.step_answers[currentStep.id]?.trim()} aria-busy={busy} className="craft-btn-black flex items-center gap-1.5 px-5 py-2 text-xs disabled:opacity-40"><Send className="h-3.5 w-3.5" />{busy ? '正在提交…' : '提交任务并评价'}</button>}
            </div>
          </section>
        </main>

        <aside className="hidden w-[30%] min-w-[300px] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white lg:flex">
          <div className="flex items-center justify-between border-b border-stone-100 p-4"><div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-amber-300"><Sparkles className="h-4 w-4" /></span><div><h2 className="font-serif text-sm text-stone-950">任务教练</h2><p className="text-[10px] text-stone-400">资料分析与方案提示</p></div></div><span className="h-2 w-2 rounded-full bg-emerald-500" /></div>
          <div className="grid grid-cols-1 gap-2 border-b border-stone-100 p-3 xl:grid-cols-3"><button onClick={() => onCoach(1)} disabled={busy} className="rounded-xl border border-stone-200 bg-stone-50 p-2 text-[10px] text-stone-700">解释要求</button><button onClick={() => onCoach(2)} disabled={busy} className="rounded-xl border border-stone-200 bg-stone-50 p-2 text-[10px] text-stone-700">帮助拆解</button><button onClick={() => onCoach(3)} disabled={busy} className="rounded-xl border border-stone-200 bg-stone-50 p-2 text-[10px] text-stone-700">查看示例</button></div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4"><div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 text-xs leading-6 text-stone-700">{coachText || '先阅读资料并完成当前步骤。需要提示时使用上方分级按钮，提示记录会保留在本次任务中。'}</div><div className="mt-3 text-[10px] leading-5 text-stone-400">已使用 {answer.coach_usage.length} 次提示<br />资料范围：{sourceSummary}</div></div>
          <div className="border-t border-stone-100 p-3"><div className="flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] text-stone-400"><Bot className="h-3.5 w-3.5" />使用上方按钮获取任务提示</div></div>
        </aside>
      </div>

      <AnimatePresence>
        {showRequirements && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/30"
            onClick={() => setShowRequirements(false)}
          >
            <motion.section
              initial={{ transform: 'translateX(100%)' }}
              animate={{ transform: 'translateX(0%)' }}
              exit={{ transform: 'translateX(100%)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
              className="h-full w-full max-w-sm border-l border-stone-200 bg-white p-6 shadow-2xl"
              onClick={event => event.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                <div><p className="text-[10px] text-stone-400">{task.id} · {task.estimated_minutes}</p><h2 className="mt-1 font-serif text-lg text-stone-950">任务要求</h2></div>
                <button onClick={() => setShowRequirements(false)} aria-label="关闭任务要求" className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500"><X className="h-4 w-4" /></button>
              </div>
              <p className="mt-4 text-xs leading-6 text-stone-700">{task.goal}</p>
              <div className="mt-4 space-y-2">{task.constraints.map(item => <p key={item} className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600">{item}</p>)}</div>
              <button onClick={() => setShowRequirements(false)} className="craft-btn-black mt-5 w-full px-4 py-2.5 text-xs">返回工作台</button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
