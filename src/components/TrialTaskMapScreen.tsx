import { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  ArrowLeft,
  Box,
  Clock3,
  Compass,
  Cpu,
  GitBranch,
  Play,
  RefreshCw,
  Search,
  Target,
} from 'lucide-react';
import type { ApiTrialTaskDefinition, TrialTaskId } from '../types/api';

interface TrialTaskMapScreenProps {
  tasks: ApiTrialTaskDefinition[];
  selectedTaskId: TrialTaskId;
  loading?: boolean;
  error?: string | null;
  onStart: (taskId: TrialTaskId) => void;
  onBack: () => void;
}

const DEFAULT_TASK_IDS: TrialTaskId[] = ['F-01', 'A-02', 'A-01'];

const WORKFLOW_STEPS = [
  { title: '发现 AI 机会', icon: Compass },
  { title: '定义问题', icon: Target },
  { title: '设计 Agent 工作流', icon: GitBranch },
  { title: '搭建与验证', icon: Box },
  { title: '上线与监控', icon: Activity },
  { title: '产品迭代', icon: RefreshCw },
  { title: 'Bad Case 诊断', icon: Search },
  { title: '模型评测', icon: Cpu },
] as const;

export function selectMapTasks(tasks: ApiTrialTaskDefinition[], selectedTaskId: TrialTaskId) {
  const byId = new Map(tasks.map(task => [task.id, task]));
  // Keep the Demo order, but do not hide a task recommended by module 02.
  const representativeIds = DEFAULT_TASK_IDS.includes(selectedTaskId)
    ? DEFAULT_TASK_IDS
    : [DEFAULT_TASK_IDS[0], DEFAULT_TASK_IDS[1], selectedTaskId];
  return Array.from(new Set([...representativeIds, ...tasks.map(task => task.id)]))
    .map(taskId => byId.get(taskId))
    .filter((task): task is ApiTrialTaskDefinition => Boolean(task))
    .slice(0, 3);
}

export function TrialTaskMapScreen({
  tasks,
  selectedTaskId,
  loading = false,
  error = null,
  onStart,
  onBack,
}: TrialTaskMapScreenProps) {
  const mapTasks = useMemo(() => selectMapTasks(tasks, selectedTaskId), [selectedTaskId, tasks]);

  return (
    <div className="trial-map-screen mx-auto flex w-full max-w-5xl flex-col px-4 pb-5 pt-5 sm:px-6" id="stage2-map-view">
      <div className="mb-2 flex shrink-0 items-center justify-between">
        <p className="flex items-center gap-2 font-mono text-xs font-semibold text-stone-500"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />03 职业地图页（Agent PM）</p>
        <button type="button" onClick={onBack} className="flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-700 shadow-2xs transition hover:bg-stone-50"><ArrowLeft className="h-3.5 w-3.5" />返回组合矩阵</button>
      </div>

      <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:p-5">
        <header className="relative shrink-0 text-center">
          <button type="button" onClick={onBack} className="absolute left-0 top-0 hidden items-center gap-1 rounded-lg border border-stone-200 bg-stone-100 px-2.5 py-1 text-xs text-stone-700 transition hover:bg-stone-200 sm:flex"><ArrowLeft className="h-3.5 w-3.5" />返回</button>
          <h1 className="font-serif text-lg font-semibold tracking-tight text-stone-950">Application / Agent PM 试路地图</h1>
          <p className="mt-0.5 text-[11px] text-stone-500">AI Agent 产品经理在产品迭代中通常会经历以下工作环节</p>
        </header>

        <div className="relative mx-auto my-2 w-full max-w-4xl shrink-0 px-2 py-1 sm:px-6">
          <svg aria-hidden="true" className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block" viewBox="0 0 800 160" fill="none" preserveAspectRatio="none">
            <line x1="90" y1="36" x2="680" y2="36" stroke="#e2e0db" strokeWidth="2" strokeDasharray="5 3" />
            <path d="M680 36 C760 36 760 124 680 124" stroke="#e2e0db" strokeWidth="2" strokeDasharray="5 3" />
            <line x1="680" y1="124" x2="100" y2="124" stroke="#e2e0db" strokeWidth="2" strokeDasharray="5 3" />
            <path d="M105 119 L92 124 L105 129" stroke="#cac6be" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="relative z-10 space-y-5 sm:space-y-6">
            {[WORKFLOW_STEPS.slice(0, 4), [...WORKFLOW_STEPS.slice(4)].reverse()].map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {row.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div key={step.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 30, delay: (rowIndex * 4 + index) * 0.035 }} className="group flex flex-col items-center text-center">
                      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-stone-800 shadow-2xs transition group-hover:-translate-y-0.5 group-hover:bg-white group-hover:shadow-sm">
                        <Icon className="h-5 w-5" />
                        <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2 items-center justify-center rounded-full border border-stone-400 bg-white"><span className="h-1 w-1 rounded-full bg-stone-500" /></span>
                      </span>
                      <span className="mt-1 text-[11px] font-medium text-stone-800 sm:text-xs">{step.title}</span>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col border-t border-stone-100 pt-2">
          <h2 className="mb-2 shrink-0 font-serif text-xs font-semibold text-stone-900">推荐从以下 3 个代表性工作片段开始体验</h2>
          {error && <p role="alert" className="mb-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</p>}
          {loading ? (
            <div className="grid flex-1 place-items-center text-xs text-stone-500">正在读取挑战目录…</div>
          ) : mapTasks.length === 0 ? (
            <div className="grid flex-1 place-items-center text-xs text-stone-500">暂无可用试路任务。</div>
          ) : (
            <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-3">
              {mapTasks.map((task, index) => {
                return (
                  <motion.article key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 360, damping: 30, delay: index * 0.05 }} className="craft-card group flex min-h-[300px] flex-col justify-between rounded-2xl border border-stone-200/80 bg-white/95 p-3.5 shadow-2xs transition hover:border-blue-300 hover:shadow-sm">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 font-mono text-[10px] font-medium text-stone-800"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />任务 {String(index + 1).padStart(2, '0')}</span>
                        <span className="flex items-center gap-1 font-mono text-[10px] text-stone-400"><Clock3 className="h-3.5 w-3.5" />{task.estimated_minutes}</span>
                      </div>
                      <h3 className="my-2 font-serif text-sm font-semibold leading-snug text-stone-950">{task.title}</h3>
                      <p className="text-[11px] font-medium text-stone-500">{task.work_stage} · {task.primary_skill}</p>
                    </div>
                    <div className="mt-auto pt-5"><div className="rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-[11px] leading-relaxed text-stone-600">{task.goal}</div>
                    <button type="button" onClick={() => onStart(task.id)} className="craft-btn-black mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs"><span>开始体验</span><Play className="h-3 w-3 fill-current text-blue-400" /></button></div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
