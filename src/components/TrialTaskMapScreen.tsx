import { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Bot, Check, Clock3, Sparkles, Target } from 'lucide-react';
import type { ApiTrialTaskDefinition, TrialTaskId } from '../types/api';

interface TrialTaskMapScreenProps {
  tasks: ApiTrialTaskDefinition[];
  selectedTaskId: TrialTaskId;
  loading?: boolean;
  error?: string | null;
  onSelect: (taskId: TrialTaskId) => void;
  onContinue: () => void;
  onBack: () => void;
}

const SEMANTIC_THEME: Record<string, { label: string; description: string; accent: string }> = {
  'F-01': {
    label: 'AI 机会判断',
    description: '从用户问题和业务约束中判断 AI 真正值得介入的位置。',
    accent: 'border-emerald-200 bg-emerald-50/65 text-emerald-900',
  },
  'A-02': {
    label: 'Bad Case 诊断',
    description: '把零散失败案例归因成可验证的系统性问题。',
    accent: 'border-amber-200 bg-amber-50/70 text-amber-900',
  },
  'A-01': {
    label: '工作流边界设计',
    description: '在自动执行、人工确认和风险控制之间划定 Agent 边界。',
    accent: 'border-sky-200 bg-sky-50/70 text-sky-900',
  },
};

const DEFAULT_TASK_IDS: TrialTaskId[] = ['F-01', 'A-02', 'A-01'];

function taskTheme(task: ApiTrialTaskDefinition, index: number) {
  return SEMANTIC_THEME[task.id] || {
    label: task.work_stage,
    description: task.subtitle || task.goal,
    accent: index === 0
      ? 'border-emerald-200 bg-emerald-50/65 text-emerald-900'
      : index === 1
        ? 'border-amber-200 bg-amber-50/70 text-amber-900'
        : 'border-sky-200 bg-sky-50/70 text-sky-900',
  };
}

export function TrialTaskMapScreen({
  tasks,
  selectedTaskId,
  loading = false,
  error = null,
  onSelect,
  onContinue,
  onBack,
}: TrialTaskMapScreenProps) {
  const mapTasks = useMemo(() => {
    if (tasks.length === 0) return [];
    const byId = new Map(tasks.map(task => [task.id, task]));
    const orderedIds = [
      selectedTaskId,
      ...DEFAULT_TASK_IDS,
      ...tasks.map(task => task.id),
    ];
    const uniqueIds = Array.from(new Set(orderedIds));
    return uniqueIds
      .map(taskId => byId.get(taskId))
      .filter((task): task is ApiTrialTaskDefinition => Boolean(task))
      .slice(0, 3);
  }, [selectedTaskId, tasks]);

  return (
    <div className="min-h-[calc(100vh-64px)] px-3 pb-6 pt-2 sm:px-5">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4">
        <div className="craft-card flex items-center justify-between gap-4 rounded-3xl border border-stone-200/70 bg-white/90 px-5 py-4 shadow-xs backdrop-blur-xl">
          <button onClick={onBack} className="flex min-w-0 items-center gap-3 text-left">
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-amber-300">
              <Bot className="h-5 w-5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-sky-500 ring-2 ring-white" />
            </span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2 text-[10px]">
                <span className="craft-chip-blue rounded-full px-2.5 py-1 font-mono font-bold">03 · 试路验证</span>
                <span className="text-stone-400">选择一项真实挑战</span>
              </span>
              <span className="mt-1.5 block truncate font-serif text-base text-stone-900 sm:text-lg">先选定要验证的工作场景，再开始能力应用推演。</span>
            </span>
          </button>
          <span className="hidden items-center gap-1 rounded-full border border-stone-200 bg-stone-100 px-3 py-1.5 text-[10px] text-stone-600 sm:flex">
            <ArrowLeft className="h-3 w-3" />返回方向建议
          </span>
        </div>

        <section className="craft-card overflow-hidden rounded-3xl border border-stone-200/70 bg-white/92 shadow-xs">
          <div className="flex flex-col gap-3 border-b border-stone-100 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7">
            <div>
              <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-sky-700">TRIAL MAP · THREE CHALLENGES</p>
              <h1 className="mt-2 font-serif text-2xl text-stone-950 sm:text-3xl">选择一项挑战，进入真实工作流</h1>
              <p className="mt-2 max-w-2xl text-xs leading-6 text-stone-500">三项挑战来自现有试路任务目录，分别覆盖机会判断、失败诊断和 Agent 工作流边界。完成能力出牌后，才能进入对应的真实任务。</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-stone-500">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><Target className="h-3.5 w-3.5" /></span>
              <span>先选任务，再进入 3 轮能力应用</span>
            </div>
          </div>

          {error && <p role="alert" className="mx-5 mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 sm:mx-7">{error}</p>}

          <div className="relative px-5 py-7 sm:px-7 sm:py-9">
            <div aria-hidden="true" className="pointer-events-none absolute left-[12%] right-[12%] top-1/2 hidden h-px bg-gradient-to-r from-emerald-200 via-amber-200 to-sky-200 lg:block" />
            {loading ? (
              <div className="grid min-h-64 place-items-center text-xs text-stone-500">正在读取挑战目录…</div>
            ) : mapTasks.length === 0 ? (
              <div className="grid min-h-64 place-items-center text-xs text-stone-500">暂无可用试路任务。</div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-3">
                {mapTasks.map((task, index) => {
                  const selected = task.id === selectedTaskId;
                  const theme = taskTheme(task, index);
                  return (
                    <motion.button
                      key={task.id}
                      type="button"
                      layout
                      onClick={() => onSelect(task.id)}
                      initial={{ opacity: 0, transform: 'translateY(12px) scale(0.98)' }}
                      animate={{ opacity: 1, transform: selected ? 'translateY(-5px) scale(1.012)' : 'translateY(0px) scale(1)' }}
                      transition={{ type: 'spring', stiffness: 360, damping: 30, mass: 0.8, delay: index * 0.05 }}
                      className={`group relative flex min-h-[270px] flex-col rounded-3xl border p-5 text-left shadow-2xs transition-colors duration-150 ${selected ? 'border-stone-900 bg-stone-900 text-white shadow-lg' : 'border-stone-200 bg-white text-stone-900 hover:border-stone-400 hover:bg-stone-50/70'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold ${selected ? 'border-stone-700 bg-stone-800 text-stone-200' : theme.accent}`}>挑战 {String(index + 1).padStart(2, '0')}</span>
                        <span className={`text-[10px] font-mono ${selected ? 'text-stone-400' : 'text-stone-400'}`}>{task.id}</span>
                      </div>
                      <div className="mt-7">
                        <p className={`text-[10px] font-bold tracking-wide ${selected ? 'text-sky-300' : 'text-sky-700'}`}>{theme.label}</p>
                        <h2 className={`mt-2 font-serif text-xl leading-snug ${selected ? 'text-white' : 'text-stone-950'}`}>{task.title}</h2>
                        <p className={`mt-3 text-xs leading-6 ${selected ? 'text-stone-300' : 'text-stone-600'}`}>{theme.description}</p>
                      </div>
                      <div className={`mt-auto flex items-center justify-between border-t pt-4 text-[10px] ${selected ? 'border-stone-700 text-stone-400' : 'border-stone-100 text-stone-500'}`}>
                        <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{task.estimated_minutes}</span>
                        <span>{task.primary_skill}</span>
                      </div>
                      <AnimatePresence initial={false}>
                        {selected && <motion.span initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} className="absolute right-4 top-14 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-stone-950"><Check className="h-3.5 w-3.5" /></motion.span>}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-stone-100 px-5 py-5 sm:flex-row sm:px-7">
            <p className="text-[11px] leading-relaxed text-stone-500">选择后会进入能力应用阶段；当前不会自动提交或生成评价。</p>
            <button onClick={onContinue} disabled={!selectedTaskId || loading || mapTasks.length === 0} className="craft-btn-black flex items-center gap-2 px-5 py-3 text-xs disabled:cursor-not-allowed disabled:opacity-40"><Sparkles className="h-3.5 w-3.5 text-sky-300" />开始能力验证<ArrowRight className="h-3.5 w-3.5" /></button>
          </div>
        </section>
      </div>
    </div>
  );
}
