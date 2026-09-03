import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useDynamicTrialTask } from '../hooks/useDynamicTrialTask';
import { getDynamicTrialCatalog } from '../api/trial';
import { getLocalDemoTrialCatalog } from '../data/demoTrialCatalog';
import type { SkillCard } from '../types';
import type {
  ApiDynamicTrialAnswer,
  ApiObservedEvidence,
  ApiTrialEvaluation,
  ApiTrialTaskDefinition,
  TrialTaskId,
} from '../types/api';
import { TrialCardPlayScreen } from './TrialCardPlayScreen';
import { TrialWorkbenchScreen } from './TrialWorkbenchScreen';
import { TrialTaskMapScreen } from './TrialTaskMapScreen';
import { TrialExperienceEndScreen } from './TrialExperienceEndScreen';
import { trialStepKey } from '../services/demoProgress';
import {
  createDemoObservedEvidence,
  createDemoTrialAnswer,
  createDemoTrialEvaluation,
  evaluateDemoCardPlayRound,
} from '../data/demoMode';

interface DynamicTrialTaskScreenProps {
  taskId: TrialTaskId;
  confirmedCards: SkillCard[];
  onBackToExplore: () => void;
  onEnterProfile: () => void;
  onOpenCardDetail: (card: SkillCard) => void;
  onTaskChange?: (taskId: TrialTaskId) => void;
  onTrialComplete?: () => Promise<unknown> | void;
  onUpdateCardsFromTrial?: (cards: SkillCard[]) => Promise<unknown> | void;
  onFocusModeChange?: (focused: boolean) => void;
  demoMode?: boolean;
  userId?: string;
}

interface TrialEvaluationViewProps {
  task: ApiTrialTaskDefinition;
  evaluation: ApiTrialEvaluation;
  observedEvidence: ApiObservedEvidence;
  onBackToExplore: () => void;
  onEnterProfile: () => void;
}

function deriveTrialUpdateCards(
  task: ApiTrialTaskDefinition,
  evaluation: ApiTrialEvaluation,
  confirmedCards: SkillCard[],
): SkillCard[] {
  const applications = evaluation.ability_applications || [];
  const cards = applications
    .map(application => {
      const card = confirmedCards.find(item => item.id === application.card_id);
      if (!card) return null;
      return {
        ...card,
        detail: `${card.detail}\n\n本轮 ${task.id} 证据：${application.basis}`,
        matchReason: `${card.matchReason || '来自已确认能力卡'}；${task.id} ${application.status}`,
        nextVerification: application.next_step,
      };
    })
    .filter(Boolean) as SkillCard[];
  // Only cards explicitly referenced by the evaluation are updated.  A task
  // with no matching evidence must still show its summary, but must not
  // silently rewrite the first cards in the user's profile.
  return cards;
}

function AutomaticTrialAbilityUpdate({
  task,
  evaluation,
  confirmedCards,
  onUpdateCards,
  onEnterProfile,
  onContinueExplore,
}: {
  task: ApiTrialTaskDefinition;
  evaluation: ApiTrialEvaluation;
  confirmedCards: SkillCard[];
  onUpdateCards?: (cards: SkillCard[]) => Promise<unknown> | void;
  onEnterProfile: () => void;
  onContinueExplore: () => void;
}) {
  const [updatedCards] = useState(() => deriveTrialUpdateCards(task, evaluation, confirmedCards));
  const pendingApplications = useMemo(
    () => (evaluation.ability_applications || []).filter(item => item.card_id.startsWith('pending:')),
    [evaluation],
  );
  const [pendingDecisions, setPendingDecisions] = useState<Record<string, 'candidate' | 'new' | 'merge'>>(
    () => Object.fromEntries(pendingApplications.map(item => [item.card_id, 'candidate'])),
  );
  const [mergeTargets, setMergeTargets] = useState<Record<string, string>>(
    () => Object.fromEntries(pendingApplications.map(item => [item.card_id, confirmedCards[0]?.id || ''])),
  );
  const [syncStatus, setSyncStatus] = useState<'choosing' | 'syncing' | 'ready' | 'error'>(
    pendingApplications.length > 0 ? 'choosing' : 'syncing',
  );
  const syncStartedRef = useRef(false);

  const syncCards = (cards: SkillCard[]) => {
    setSyncStatus('syncing');
    void Promise.resolve(onUpdateCards?.(cards))
      .then(() => setSyncStatus('ready'))
      .catch(() => setSyncStatus('error'));
  };

  useEffect(() => {
    if (syncStartedRef.current || pendingApplications.length > 0) return;
    syncStartedRef.current = true;
    syncCards(updatedCards);
  }, [pendingApplications.length, updatedCards]);

  const confirmPendingDecisions = () => {
    const pendingCards = pendingApplications.flatMap((application, index) => {
      const decision = pendingDecisions[application.card_id] || 'candidate';
      if (decision === 'candidate') return [];
      const targetId = mergeTargets[application.card_id];
      if (decision === 'merge' && !targetId) return [];
      const card: SkillCard = {
        id: `trial-${task.id}-${application.card_id.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
        title: application.card_title,
        category: '技术落地',
        description: application.basis,
        detail: `来自 ${task.id} 试路任务：${application.basis}`,
        icon: 'Sparkles',
        colorTone: 'amber',
        matchReason: `${task.id} ${application.status}`,
        workplaceApplication: application.next_step,
        evidenceQuote: application.basis,
        sourceRefs: application.evidence_refs,
        claimLevel: 'interpretation',
        evidenceType: 'self_report',
        pendingVerification: application.status !== '已应用',
        nextVerification: application.next_step,
        experienceId: `trial:${task.id}`,
        resolution: decision === 'merge' ? 'merge' : 'new',
        mergeTargetCardId: decision === 'merge' ? targetId : null,
        evidenceHistory: [{
          experienceId: `trial:${task.id}`,
          evidenceQuote: application.basis,
          sourceRefs: application.evidence_refs,
        }],
      };
      return [{ ...card, id: `${card.id}-${index + 1}` }];
    });
    syncCards([...updatedCards, ...pendingCards]);
  };

  if (syncStatus === 'choosing') {
    return (
      <div className="mx-auto min-h-[calc(100vh-64px)] max-w-4xl px-5 py-8">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="font-serif text-xl text-stone-900">决定本轮待验证能力如何保存</p>
          <p className="mt-2 text-xs leading-5 text-stone-500">任务结果已经生成。你可以把证据合并到已有能力、新增长期能力卡，或暂时只保留为候选证据。</p>
          <div className="mt-5 space-y-3">
            {pendingApplications.map(application => {
              const decision = pendingDecisions[application.card_id] || 'candidate';
              return <div key={application.card_id} className="rounded-2xl border border-stone-200 p-4">
                <p className="text-sm font-semibold text-stone-900">{application.card_title}</p>
                <p className="mt-1 text-xs leading-5 text-stone-600">{application.basis}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {([['candidate', '保留为待验证'], ['new', '新增长期能力'], ['merge', '合并到已有能力']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setPendingDecisions(current => ({ ...current, [application.card_id]: value }))} className={`rounded-full border px-3 py-1.5 text-xs ${decision === value ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600'}`}>{label}</button>)}
                </div>
                {decision === 'merge' && <select value={mergeTargets[application.card_id] || ''} onChange={event => setMergeTargets(current => ({ ...current, [application.card_id]: event.target.value }))} className="mt-3 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700"><option value="">选择要合并的能力卡</option>{confirmedCards.map(card => <option key={card.id} value={card.id}>{card.title}</option>)}</select>}
              </div>;
            })}
          </div>
          <button type="button" onClick={confirmPendingDecisions} className="mt-5 rounded-full bg-stone-900 px-5 py-2.5 text-sm text-white">确认去向并保存</button>
        </div>
      </div>
    );
  }

  if (syncStatus !== 'ready') {
    return (
      <div className="grid min-h-[calc(100vh-64px)] place-items-center px-6 text-center">
        <div>
          <p className="font-serif text-lg text-stone-900">{syncStatus === 'syncing' ? '正在同步本轮能力卡…' : '能力卡同步失败'}</p>
          <p className="mt-2 text-xs text-stone-500">{syncStatus === 'syncing' ? '任务已完成，正在把实战证据写入能力库。' : '本次任务结果已保留，请稍后重新进入。'}</p>
        </div>
      </div>
    );
  }

  return (
    <TrialExperienceEndScreen
      updatedCards={updatedCards}
      allAccumulatedCards={confirmedCards}
      evaluation={evaluation}
      onEnterProfile={onEnterProfile}
      onContinueExplore={onContinueExplore}
    />
  );
}

function TrialEvaluationView({
  task,
  evaluation,
  observedEvidence,
  onBackToExplore,
  onEnterProfile,
}: TrialEvaluationViewProps) {
  const evidenceItems = observedEvidence.evidence_items || [];
  const applications = evaluation.ability_applications || [];
  const deliveryEvidence = evidenceItems.filter(item => (
    item.kind === 'deliverable' || item.kind === 'observed' || item.kind === 'reference'
  ));
  const evidenceLabel = (ref: string) => evidenceItems.find(item => item.id === ref)?.label || ref;
  const statusClassName: Record<NonNullable<ApiTrialEvaluation['ability_applications']>[number]['status'], string> = {
    已应用: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    部分应用: 'border-amber-200 bg-amber-50 text-amber-800',
    未形成证据: 'border-stone-200 bg-stone-100 text-stone-600',
  };
  return (
    <div className="mx-auto min-h-[calc(100vh-64px)] max-w-6xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="font-mono text-[10px] font-bold text-emerald-700">本次任务 · {task.id}</p>
            <h1 className="mt-1 font-serif text-2xl text-stone-900">本次任务表现</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">{evaluation.summary}</p>
          </div>
          <div className="shrink-0 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-[10px] text-emerald-700">主要观察 · {evaluation.primary_ability}</p>
            <p className="mt-1 text-xl font-bold text-emerald-950">{evaluation.observed_level}</p>
            <p className="mt-1 text-[10px] text-emerald-800">置信度 {evaluation.confidence} · {evaluation.coach_dependency}</p>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
          <p className="text-xs font-bold text-stone-900">结果依据</p>
          <p className="mt-1.5 text-xs leading-relaxed text-stone-600">{evaluation.level_reason}</p>
        </div>
        {evaluation.verification && (
          <div className={`mt-3 rounded-2xl border p-4 ${evaluation.verification.status === 'accepted' ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-200 bg-amber-50/70'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-stone-900">证据校验</p>
              <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${evaluation.verification.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                {evaluation.verification.status === 'accepted' ? '已通过' : '需要复核'}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-stone-600">
              证据覆盖率 {Math.round(evaluation.verification.evidence_coverage * 100)}%{evaluation.verification.model_reviewed ? ' · 已完成校验模型复核' : ' · 已完成本地规则校验'}。
            </p>
            {evaluation.verification.review_summary && <p className="mt-1 text-[11px] leading-relaxed text-stone-500">{evaluation.verification.review_summary}</p>}
          </div>
        )}
        <section className="mt-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-stone-900">本次使用的能力</h2>
              <p className="mt-1 text-[11px] text-stone-500">能力卡只作为任务前计划，是否真正应用以任务交付物中的证据为准。</p>
            </div>
            <span className="shrink-0 text-[10px] text-stone-400">{applications.length} 张能力卡</span>
          </div>
          {applications.length > 0 ? (
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {applications.map((application, index) => (
                <motion.div
                  key={application.card_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 30, mass: 0.75, delay: index * 0.04 }}
                  className="rounded-2xl border border-stone-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] text-stone-400">能力卡</p>
                      <h3 className="mt-1 text-sm font-bold text-stone-900">{application.card_title}</h3>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium ${statusClassName[application.status]}`}>
                      {application.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-stone-600">{application.basis}</p>
                  {application.evidence_refs.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {application.evidence_refs.slice(0, 4).map(ref => (
                        <span key={ref} className="rounded-full bg-stone-100 px-2 py-1 text-[10px] text-stone-500">
                          {evidenceLabel(ref)}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 border-t border-stone-100 pt-3 text-[11px] leading-relaxed text-stone-500">
                    下一步：{application.next_step}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-500">本次评价没有可核对的能力卡应用记录。</p>
          )}
        </section>
        <section className="mt-6 rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-stone-900">本次交付证据</h2>
              <p className="mt-1 text-[11px] text-stone-500">来源包括五步作答、事件处理和主动引用的任务材料。</p>
            </div>
            <span className="shrink-0 text-[10px] text-stone-400">{deliveryEvidence.length} 条</span>
          </div>
          {deliveryEvidence.length > 0 ? (
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {deliveryEvidence.slice(0, 10).map(item => (
                <div key={item.id} className="rounded-xl border border-stone-200/80 bg-white px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <p className="text-[11px] font-bold text-stone-800">{item.label}</p>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-600">{item.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-stone-500">尚未形成可展示的交付物证据。</p>
          )}
        </section>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {evaluation.dimensions.map((item, index) => (
            <motion.div
              key={item.dimension}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 30, mass: 0.75, delay: index * 0.04 }}
              className="rounded-2xl border border-stone-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-stone-800">{item.dimension} <span className="font-normal text-stone-400">{item.weight}%</span></span>
                <span className="font-mono text-sm font-bold text-amber-800">{item.score}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">{item.evidence}</p>
              {item.evidence_refs && item.evidence_refs.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-stone-100 pt-2.5">
                  <span className="text-[10px] text-stone-400">评分依据</span>
                  {item.evidence_refs.slice(0, 4).map(ref => (
                    <span key={ref} className="rounded-full bg-amber-50 px-2 py-1 text-[10px] text-amber-800">{evidenceLabel(ref)}</span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="text-xs font-bold text-emerald-900">做得清楚的地方</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-emerald-900/80">
              {evaluation.strengths.map(item => <li key={item}>· {item}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
            <p className="text-xs font-bold text-amber-900">仍需补足</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-amber-900/80">
              {evaluation.gaps.map(item => <li key={item}>· {item}</li>)}
            </ul>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="text-xs font-bold text-emerald-900">本次观察到的能力</p>
            <p className="mt-1.5 text-xs leading-relaxed text-emerald-900/80">{observedEvidence.statement}</p>
            <p className="mt-2 text-[10px] leading-relaxed text-emerald-800/70">{observedEvidence.caveats.join(' · ')}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
            <p className="text-xs font-bold text-stone-900">后续验证方向</p>
            <p className="mt-1.5 text-xs leading-relaxed text-stone-600">{evaluation.next_step}</p>
            <p className="mt-2 text-[10px] text-stone-400">单次任务只记录本次表现，不代表长期水平或岗位匹配度。</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col justify-between gap-3 border-t border-stone-100 pt-4 sm:flex-row">
          <button onClick={onBackToExplore} className="craft-btn-secondary px-4 py-2 text-xs">返回方向建议</button>
          <button onClick={onEnterProfile} className="craft-btn-black px-4 py-2 text-xs">查看个人档案</button>
        </div>
      </div>
    </div>
  );
}

export const DynamicTrialTaskScreen: React.FC<DynamicTrialTaskScreenProps> = ({
  taskId,
  confirmedCards,
  onBackToExplore,
  onEnterProfile,
  onOpenCardDetail,
  onTaskChange,
  onTrialComplete,
  onUpdateCardsFromTrial,
  onFocusModeChange,
  demoMode = false,
  userId,
}) => {
  const progressMode = demoMode ? 'demo' : 'use';
  const [activeTaskId, setActiveTaskId] = useState<TrialTaskId>(taskId);
  const [selectedMapTaskId, setSelectedMapTaskId] = useState<TrialTaskId>(taskId);
  const [showTaskMap, setShowTaskMap] = useState(true);
  const [taskCatalog, setTaskCatalog] = useState<ApiTrialTaskDefinition[]>([]);
  const [taskCatalogStatus, setTaskCatalogStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [taskCatalogError, setTaskCatalogError] = useState<string | null>(null);
  const [taskCatalogReloadNonce, setTaskCatalogReloadNonce] = useState(0);
  const { task, session, status, error, save, revealEvent, requestCoach, submit, retry, restart } = useDynamicTrialTask(activeTaskId, progressMode, userId);
  const [stepIndex, setStepIndex] = useState(() => {
    const saved = Number(window.localStorage.getItem(trialStepKey(activeTaskId, progressMode, userId)));
    return Number.isInteger(saved) && saved >= 0 && saved < 5 ? saved : 0;
  });
  const [answer, setAnswer] = useState<ApiDynamicTrialAnswer | null>(null);
  const [coachText, setCoachText] = useState<string | null>(null);
  const [coachLoadingLevel, setCoachLoadingLevel] = useState<1 | 2 | 3 | null>(null);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoCompletedStepIds, setDemoCompletedStepIds] = useState<string[]>([]);
  const [workbenchActive, setWorkbenchActive] = useState(false);
  const [phase, setPhase] = useState<'card-play' | 'workbench'>('card-play');
  const initializedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (taskId === activeTaskId) return;
    setActiveTaskId(taskId);
    setSelectedMapTaskId(taskId);
    setShowTaskMap(true);
    initializedSessionRef.current = null;
  }, [activeTaskId, progressMode, taskId]);

  useEffect(() => {
    if (demoMode) {
      setTaskCatalog(getLocalDemoTrialCatalog());
      setTaskCatalogStatus('ready');
      setTaskCatalogError(null);
      return undefined;
    }
    let cancelled = false;
    setTaskCatalogStatus('loading');
    setTaskCatalogError(null);
    void getDynamicTrialCatalog()
      .then(tasks => {
        if (cancelled) return;
        setTaskCatalog(tasks);
        setTaskCatalogStatus('ready');
      })
      .catch(cause => {
        if (cancelled) return;
        setTaskCatalogStatus('error');
        setTaskCatalogError(cause instanceof Error ? cause.message : '试路任务目录加载失败。');
      });
    return () => { cancelled = true; };
  }, [demoMode, progressMode, taskCatalogReloadNonce]);

  const demoAnswer = useMemo(() => demoMode && task ? createDemoTrialAnswer(task) : null, [demoMode, task]);

  useEffect(() => {
    if (!session) return;
    if (!demoMode) setAnswer(session.answer);
  }, [demoMode, session]);

  useEffect(() => {
    if (!session || !task) return;
    const initializationKey = `${progressMode}:${session.id}:${activeTaskId}`;
    if (initializedSessionRef.current === initializationKey) return;
    initializedSessionRef.current = initializationKey;

    const nextAnswer = demoAnswer || session.answer;
    setAnswer(nextAnswer);
    setWorkbenchActive(false);
    onFocusModeChange?.(false);
    if (demoMode) {
      setDemoSubmitted(false);
      setDemoCompletedStepIds([]);
      setPhase('card-play');
      setStepIndex(0);
      window.localStorage.setItem(trialStepKey(activeTaskId, progressMode, userId), '0');
      return;
    }
    // Entering 03 always returns to the three-challenge overview. Completed
    // rounds stay visible and the user explicitly continues to the briefing.
    setPhase('card-play');
    const savedStep = Number(window.localStorage.getItem(trialStepKey(activeTaskId, progressMode, userId)));
    if (Number.isInteger(savedStep) && savedStep >= 0 && savedStep < task.steps.length) {
      setStepIndex(savedStep);
    } else {
      const firstIncomplete = task.steps.findIndex(step => !nextAnswer.step_answers[step.id]?.trim());
      setStepIndex(firstIncomplete === -1 ? task.steps.length - 1 : firstIncomplete);
    }
  }, [activeTaskId, demoAnswer, demoMode, onFocusModeChange, progressMode, session, task, userId]);

  useEffect(() => {
    if (phase === 'card-play') {
      setWorkbenchActive(false);
      onFocusModeChange?.(false);
    }
  }, [onFocusModeChange, phase]);

  useEffect(() => {
    if (!demoMode && !userId) return;
    window.localStorage.setItem(trialStepKey(activeTaskId, progressMode, userId), String(stepIndex));
  }, [activeTaskId, demoMode, progressMode, stepIndex, userId]);

  useEffect(() => () => onFocusModeChange?.(false), [onFocusModeChange]);

  const isBusy = status === 'saving' || status === 'submitting';

  const mapTasks = useMemo(() => {
    const byId = new Map(taskCatalog.map(item => [item.id, item]));
    if (task && !byId.has(task.id)) byId.set(task.id, task);
    return Array.from(byId.values());
  }, [task, taskCatalog]);

  if (showTaskMap) {
    return (
      <TrialTaskMapScreen
        tasks={mapTasks}
        selectedTaskId={selectedMapTaskId}
        loading={taskCatalogStatus === 'loading' && mapTasks.length === 0}
        error={taskCatalogStatus === 'error' ? taskCatalogError : null}
        onRetry={() => setTaskCatalogReloadNonce(value => value + 1)}
        onStart={(taskId) => {
          const restartingCurrentTask = activeTaskId === taskId;
          if (restartingCurrentTask) {
            // The map is also the explicit entry point for redoing a task.
            // Clear the current in-memory answer before loading a new local
            // demo session or a new server workbench session.
            restart();
            setAnswer(null);
            setCoachText(null);
            setDemoSubmitted(false);
            setDemoCompletedStepIds([]);
            setStepIndex(0);
            setPhase('card-play');
          }
          setSelectedMapTaskId(taskId);
          setActiveTaskId(taskId);
          initializedSessionRef.current = null;
          onTaskChange?.(taskId);
          setShowTaskMap(false);
        }}
        onBack={onBackToExplore}
      />
    );
  }

  if (status === 'error') {
    return (
      <div className="grid min-h-[calc(100vh-64px)] place-items-center px-6 text-center">
        <div className="max-w-md rounded-3xl border border-stone-200 bg-white px-8 py-7 shadow-sm">
          <p className="font-serif text-lg text-stone-900">试路任务暂时无法打开</p>
          <p className="mt-2 text-sm leading-6 text-stone-500">{error || '加载失败，请稍后重试。'}</p>
          <div className="mt-5 flex justify-center gap-2">
            <button type="button" onClick={retry} className="craft-btn-black px-4 py-2 text-xs">重新加载</button>
            <button type="button" onClick={() => setShowTaskMap(true)} className="craft-btn-secondary px-4 py-2 text-xs">返回任务地图</button>
          </div>
        </div>
      </div>
    );
  }

  if (!task || task.id !== activeTaskId || !session || session.task_id !== activeTaskId || !answer || status === 'loading') {
    return <div className="grid min-h-[calc(100vh-64px)] place-items-center text-sm text-stone-500">正在准备小任务…</div>;
  }

  const evaluation = demoSubmitted
    ? createDemoTrialEvaluation(task, answer, confirmedCards)
    : session.evaluation;
  const observedEvidence = demoSubmitted
    ? createDemoObservedEvidence(task, answer, confirmedCards)
    : session.observed_evidence;
  const showEvaluation = (demoSubmitted || session.status === 'submitted') && Boolean(evaluation && observedEvidence);

  const handleCardPlayEvaluate = async () => {
    const challenge = task.ability_challenges[answer.card_play_current_index];
    const round = answer.card_play_rounds.find(item => item.challenge_id === challenge?.id);
    if (!challenge || !round?.selected_card_ids.length) return;
    if (demoMode) {
      const cardsById = new Map(confirmedCards.map(card => [card.id, card]));
      const selectedCards = round.selected_card_ids.map(cardId => cardsById.get(cardId)).filter((card): card is SkillCard => Boolean(card));
      const evaluatedRound = evaluateDemoCardPlayRound(challenge, selectedCards);
      const nextRounds = answer.card_play_rounds.map(item => item.challenge_id === challenge.id ? evaluatedRound : item);
      setAnswer({ ...answer, selected_card_ids: Array.from(new Set(nextRounds.flatMap(item => item.selected_card_ids))), card_play_rounds: nextRounds, card_play_completed: task.ability_challenges.every(item => nextRounds.some(roundItem => roundItem.challenge_id === item.id && roundItem.match_level)) });
      return;
    }
    const completedChallengeIds = new Set(answer.card_play_rounds.map(item => item.challenge_id));
    const isLastChallenge = answer.card_play_current_index === task.ability_challenges.length - 1;
    const completedAnswer = { ...answer, card_play_completed: isLastChallenge && task.ability_challenges.every(item => completedChallengeIds.has(item.id)) };
    setAnswer(completedAnswer);
    setAnswer((await save(completedAnswer)).answer);
  };

  const handleSelectCardPlayChallenge = async (index: number) => {
    if (index < 0 || index >= task.ability_challenges.length || index === answer.card_play_current_index) return;
    const firstIncompleteIndex = task.ability_challenges.findIndex(challenge => (
      !answer.card_play_rounds.some(round => round.challenge_id === challenge.id && round.match_level)
    ));
    const lastUnlockedIndex = firstIncompleteIndex === -1
      ? task.ability_challenges.length - 1
      : firstIncompleteIndex;
    if (index > lastUnlockedIndex) return;
    const nextAnswer = { ...answer, card_play_current_index: index };
    setAnswer(nextAnswer);
    if (!demoMode) setAnswer((await save(nextAnswer)).answer);
  };

  const handleEnterWorkbench = () => {
    if (!answer.card_play_completed) return;
    setWorkbenchActive(false);
    onFocusModeChange?.(false);
    setPhase('workbench');
  };

  const handleBackToTaskMap = () => {
    setWorkbenchActive(false);
    onFocusModeChange?.(false);
    setPhase('card-play');
    setShowTaskMap(true);
    setSelectedMapTaskId(activeTaskId);
  };

  const currentStep = task.steps[stepIndex];
  const completedStepIds = demoMode ? demoCompletedStepIds : task.steps.filter(step => Boolean(answer.step_answers[step.id]?.trim())).map(step => step.id);
  const updateStepAnswer = (value: string) => setAnswer(current => current ? ({ ...current, step_answers: { ...current.step_answers, [currentStep.id]: value }, step_revisions: { ...current.step_revisions, [currentStep.id]: (current.step_revisions[currentStep.id] || 0) + 1 } }) : current);
  const openMaterial = (materialId: string) => setAnswer(current => current ? ({ ...current, viewed_material_ids: current.viewed_material_ids.includes(materialId) ? current.viewed_material_ids : [...current.viewed_material_ids, materialId] }) : current);
  const toggleEvidence = (materialId: string) => setAnswer(current => {
    if (!current) return current;
    const selected = current.evidence_refs.includes(materialId);
    return { ...current, evidence_refs: selected ? current.evidence_refs.filter(id => id !== materialId) : [...current.evidence_refs, materialId] };
  });

  const handleNext = async () => {
    if (!answer.step_answers[currentStep.id]?.trim()) return;
    if (demoMode) setDemoCompletedStepIds(current => current.includes(currentStep.id) ? current : [...current, currentStep.id]);
    else {
      await save(answer);
      if (stepIndex === task.steps.length - 2 && !session.event_revealed) await revealEvent();
    }
    setStepIndex(index => Math.min(task.steps.length - 1, index + 1));
  };

  const handleSubmit = async () => {
    if (!answer.step_answers[currentStep.id]?.trim()) return;
    if (demoMode) {
      setDemoCompletedStepIds(current => current.includes(currentStep.id) ? current : [...current, currentStep.id]);
      setWorkbenchActive(false);
      onFocusModeChange?.(false);
      setDemoSubmitted(true);
      return;
    }
    await save(answer);
    await submit();
    setWorkbenchActive(false);
    onFocusModeChange?.(false);
    await onTrialComplete?.();
  };

  const handleCoach = async (level: 1 | 2 | 3) => {
    if (coachLoadingLevel !== null) return;
    setCoachLoadingLevel(level);
    try {
      if (demoMode) {
        const prompt = task.coach_prompts[level - 1] || '请先整理当前判断、证据来源和待验证项。';
        setCoachText(prompt);
        setAnswer(current => current ? ({ ...current, coach_usage: [...current.coach_usage, { level, prompt, used_at: new Date().toISOString() }] }) : current);
        return;
      }
      setCoachText(await requestCoach(level, answer));
    } finally {
      setCoachLoadingLevel(null);
    }
  };

  const changeFocusMode = (focused: boolean) => {
    setWorkbenchActive(focused);
    onFocusModeChange?.(focused);
  };

  return (
    <AnimatePresence initial={false} mode="sync">
      {showEvaluation && evaluation && observedEvidence ? (
        <motion.div
          key="evaluation"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: 'spring', stiffness: 280, damping: 30, mass: 0.8 }}
          className="block"
        >
          <AutomaticTrialAbilityUpdate
            task={task}
            evaluation={evaluation}
            confirmedCards={confirmedCards}
            onUpdateCards={onUpdateCardsFromTrial}
            onEnterProfile={onEnterProfile}
            onContinueExplore={onBackToExplore}
          />
        </motion.div>
      ) : phase === 'card-play' ? (
        <motion.div
          key="card-play"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.75 }}
          className="block"
        >
          <TrialCardPlayScreen
            task={task}
            cards={confirmedCards}
            answer={answer}
            error={error}
            saving={!demoMode && status === 'saving'}
            onChange={setAnswer}
            onEvaluate={() => void handleCardPlayEvaluate()}
            onSelectChallenge={index => void handleSelectCardPlayChallenge(index)}
            onEnterWorkbench={handleEnterWorkbench}
            onBackToMap={handleBackToTaskMap}
            onBack={onBackToExplore}
            onOpenCardDetail={onOpenCardDetail}
          />
        </motion.div>
      ) : (
        <motion.div
          key="workbench"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.75 }}
          className="block"
        >
          <TrialWorkbenchScreen
            task={task}
            answer={answer}
            stepIndex={stepIndex}
            completedStepIds={completedStepIds}
            active={workbenchActive}
            busy={isBusy}
            coachText={coachText}
            coachLoadingLevel={coachLoadingLevel}
            onActiveChange={changeFocusMode}
            onBackToExplore={onBackToExplore}
            onBackToMap={handleBackToTaskMap}
            onStepChange={setStepIndex}
            onStepAnswerChange={updateStepAnswer}
            onOpenMaterial={openMaterial}
            onToggleEvidence={toggleEvidence}
            onPrevious={() => setStepIndex(index => Math.max(0, index - 1))}
            onNext={() => void handleNext()}
            onSubmit={() => void handleSubmit()}
            onCoach={level => void handleCoach(level)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
