import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  Clock3,
  FileText,
  Link2,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useDynamicTrialTask } from '../hooks/useDynamicTrialTask';
import type { SkillCard } from '../types';
import type { ApiDynamicTrialAnswer, TrialTaskId } from '../types/api';
import { TaskStepInput } from './TaskStepInput';
import { TrialCardPlayScreen } from './TrialCardPlayScreen';
import { trialPhaseKey, trialStepKey } from '../services/demoProgress';
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
  onTrialComplete?: () => Promise<unknown> | void;
  demoMode?: boolean;
}

export const DynamicTrialTaskScreen: React.FC<DynamicTrialTaskScreenProps> = ({
  taskId,
  confirmedCards,
  onBackToExplore,
  onEnterProfile,
  onOpenCardDetail,
  onTrialComplete,
  demoMode = false,
}) => {
  const progressMode = demoMode ? 'demo' : 'use';
  const { task, session, status, error, save, revealEvent, requestCoach, submit } = useDynamicTrialTask(taskId, progressMode);
  const [stepIndex, setStepIndex] = useState(() => {
    const saved = Number(window.localStorage.getItem(trialStepKey(taskId, progressMode)));
    return Number.isInteger(saved) && saved >= 0 && saved < 5 ? saved : 0;
  });
  const [answer, setAnswer] = useState<ApiDynamicTrialAnswer | null>(null);
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);
  const [coachText, setCoachText] = useState<string | null>(null);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoCompletedStepIds, setDemoCompletedStepIds] = useState<string[]>([]);
  const [phase, setPhase] = useState<'card-play' | 'workbench'>(() => (
    window.localStorage.getItem(trialPhaseKey(taskId, progressMode)) === 'workbench'
      ? 'workbench'
      : 'card-play'
  ));

  const demoAnswer = useMemo(
    () => demoMode && task ? createDemoTrialAnswer(task) : null,
    [demoMode, task],
  );

  useEffect(() => {
    if (session) {
      const nextAnswer = demoAnswer || session.answer;
      setAnswer(nextAnswer);
      if (demoMode) {
        setDemoSubmitted(false);
        setDemoCompletedStepIds([]);
        setPhase('card-play');
        setStepIndex(0);
        window.localStorage.setItem(trialPhaseKey(taskId, progressMode), 'card-play');
        window.localStorage.setItem(trialStepKey(taskId, progressMode), '0');
        return;
      }
      const savedPhase = window.localStorage.getItem(trialPhaseKey(taskId, progressMode));
      setPhase(
        session.status === 'submitted'
          ? 'workbench'
          : nextAnswer.card_play_completed && savedPhase === 'workbench'
            ? 'workbench'
            : 'card-play',
      );
      const savedStep = Number(window.localStorage.getItem(trialStepKey(taskId, progressMode)));
      if (Number.isInteger(savedStep) && savedStep >= 0 && savedStep < 5) {
        setStepIndex(savedStep);
      } else if (task) {
        const firstIncomplete = task.steps.findIndex(step => !nextAnswer.step_answers[step.id]?.trim());
        setStepIndex(firstIncomplete === -1 ? task.steps.length - 1 : firstIncomplete);
      }
    }
  }, [demoAnswer, demoMode, progressMode, session, task, taskId]);

  useEffect(() => {
    window.localStorage.setItem(trialPhaseKey(taskId, progressMode), phase);
  }, [phase, progressMode, taskId]);

  useEffect(() => {
    window.localStorage.setItem(trialStepKey(taskId, progressMode), String(stepIndex));
  }, [progressMode, stepIndex, taskId]);

  const currentStep = task?.steps[stepIndex];
  const isBusy = status === 'saving' || status === 'submitting';
  const completedCount = useMemo(() => {
    if (!task || !answer) return 0;
    if (demoMode) return demoCompletedStepIds.length;
    return task.steps.filter(step => answer.step_answers[step.id]?.trim()).length;
  }, [answer, demoCompletedStepIds.length, demoMode, task]);

  if (!task || !session || !answer || status === 'loading') {
    return <div className="min-h-[calc(100vh-64px)] grid place-items-center text-sm text-stone-500">正在准备小任务…</div>;
  }

  const evaluation = demoSubmitted ? createDemoTrialEvaluation(task) : session.evaluation;
  const observedEvidence = demoSubmitted ? createDemoObservedEvidence(task) : session.observed_evidence;

  if ((demoSubmitted || session.status === 'submitted') && evaluation && observedEvidence) {
    return (
      <div className="min-h-[calc(100vh-64px)] max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="craft-card rounded-3xl border border-stone-200 bg-white/95 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono font-bold text-emerald-700">本次任务 · {task.id}{demoMode ? ' · 演示数据' : ''}</p>
              <h1 className="mt-1 text-2xl font-serif craft-serif text-stone-900">完成了，来看看这次的表现</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">{evaluation.summary}</p>
            </div>
            <div className="shrink-0 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-[10px] text-emerald-700">主要观察 · {evaluation.primary_ability}</p>
              <p className="mt-1 text-xl font-bold text-emerald-950">{evaluation.observed_level}</p>
              <p className="mt-1 text-[10px] text-emerald-800">置信度 {evaluation.confidence} · {evaluation.coach_dependency}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
            <p className="text-xs font-bold text-stone-900">为什么得到这个结果</p>
            <p className="mt-1.5 text-xs leading-relaxed text-stone-600">{evaluation.level_reason}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {evaluation.dimensions.map((item, index) => (
              <motion.div
                key={item.dimension}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.28 }}
                className="rounded-2xl border border-stone-200 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-stone-800">{item.dimension} <span className="font-normal text-stone-400">{item.weight}%</span></span>
                  <span className="font-mono text-sm font-bold text-amber-800">{item.score}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-stone-600">{item.evidence}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="text-xs font-bold text-emerald-900">这次你表现出来的能力</p>
              <p className="mt-1.5 text-xs leading-relaxed text-emerald-900/80">{observedEvidence.statement}</p>
              <p className="mt-2 text-[10px] leading-relaxed text-emerald-800/70">{observedEvidence.caveats.join(' · ')}</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
              <p className="text-xs font-bold text-stone-900">下一步可以试试</p>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-600">{evaluation.next_step}</p>
              <p className="mt-2 text-[10px] text-stone-400">一次小任务只记录本次表现，不代表长期水平或岗位匹配度。</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 border-t border-stone-100 pt-4">
            <button onClick={onBackToExplore} className="craft-btn-secondary px-4 py-2 text-xs">返回方向建议</button>
            <button onClick={onEnterProfile} className="craft-btn-black px-4 py-2 text-xs">查看个人档案</button>
          </div>
        </div>
      </div>
    );
  }

  const handleCardPlayEvaluate = async () => {
    const challenge = task.ability_challenges[answer.card_play_current_index];
    const round = answer.card_play_rounds.find(item => item.challenge_id === challenge?.id);
    if (!challenge || !round?.selected_card_ids.length) return;
    if (demoMode) {
      const cardsById = new Map(confirmedCards.map(card => [card.id, card]));
      const selectedCards = round.selected_card_ids
        .map(cardId => cardsById.get(cardId))
        .filter((card): card is SkillCard => Boolean(card));
      const evaluatedRound = evaluateDemoCardPlayRound(challenge, selectedCards);
      const nextRounds = answer.card_play_rounds.map(item => (
        item.challenge_id === challenge.id ? evaluatedRound : item
      ));
      setAnswer({
        ...answer,
        selected_card_ids: Array.from(new Set(nextRounds.flatMap(item => item.selected_card_ids))),
        card_play_rounds: nextRounds,
        card_play_completed: task.ability_challenges.every(item => nextRounds.some(roundItem => roundItem.challenge_id === item.id && roundItem.match_level)),
      });
      return;
    }
    const completedChallengeIds = new Set(answer.card_play_rounds.map(item => item.challenge_id));
    const isLastChallenge = answer.card_play_current_index === task.ability_challenges.length - 1;
    const completedAnswer = {
      ...answer,
      card_play_completed: isLastChallenge
        && task.ability_challenges.every(item => completedChallengeIds.has(item.id)),
    };
    setAnswer(completedAnswer);
    const saved = await save(completedAnswer);
    setAnswer(saved.answer);
  };

  const handleSelectCardPlayChallenge = async (index: number) => {
    if (index < 0 || index >= task.ability_challenges.length || index === answer.card_play_current_index) return;
    const nextAnswer = { ...answer, card_play_current_index: index };
    setAnswer(nextAnswer);
    if (demoMode) return;
    const saved = await save(nextAnswer);
    setAnswer(saved.answer);
  };

  const handleEnterWorkbench = () => {
    if (!answer.card_play_completed) return;
    window.localStorage.setItem(trialPhaseKey(taskId, progressMode), 'workbench');
    setPhase('workbench');
  };

  if (phase === 'card-play') {
    return (
      <TrialCardPlayScreen
        task={task}
        cards={confirmedCards}
        answer={answer}
        error={error}
        saving={!demoMode && status === 'saving'}
        onChange={setAnswer}
        onEvaluate={() => void handleCardPlayEvaluate()}
        onSelectChallenge={(index) => void handleSelectCardPlayChallenge(index)}
        onEnterWorkbench={handleEnterWorkbench}
        onBack={onBackToExplore}
        onOpenCardDetail={onOpenCardDetail}
      />
    );
  }

  const updateStepAnswer = (value: string) => {
    if (!currentStep) return;
    setAnswer(current => current ? ({
      ...current,
      step_answers: { ...current.step_answers, [currentStep.id]: value },
      step_revisions: {
        ...current.step_revisions,
        [currentStep.id]: (current.step_revisions[currentStep.id] || 0) + 1,
      },
    }) : current);
  };

  const openMaterial = (materialId: string) => {
    setActiveMaterialId(materialId);
    setAnswer(current => current ? ({
      ...current,
      viewed_material_ids: current.viewed_material_ids.includes(materialId)
        ? current.viewed_material_ids
        : [...current.viewed_material_ids, materialId],
    }) : current);
  };

  const toggleEvidence = (materialId: string) => {
    setAnswer(current => {
      if (!current) return current;
      const selected = current.evidence_refs.includes(materialId);
      return {
        ...current,
        evidence_refs: selected
          ? current.evidence_refs.filter(id => id !== materialId)
          : [...current.evidence_refs, materialId],
      };
    });
  };

  const handleNext = async () => {
    if (!currentStep || !answer.step_answers[currentStep.id]?.trim()) return;
    if (demoMode) {
      setDemoCompletedStepIds(current => current.includes(currentStep.id) ? current : [...current, currentStep.id]);
    } else {
      await save(answer);
      if (stepIndex === 3 && !session.event_revealed) await revealEvent();
    }
    const nextStepIndex = Math.min(task.steps.length - 1, stepIndex + 1);
    window.localStorage.setItem(trialStepKey(taskId, progressMode), String(nextStepIndex));
    setStepIndex(nextStepIndex);
  };

  const handleSubmit = async () => {
    if (!currentStep || !answer.step_answers[currentStep.id]?.trim() || !answer.event_decision || !answer.event_response.trim()) return;
    if (demoMode) {
      setDemoCompletedStepIds(current => current.includes(currentStep.id) ? current : [...current, currentStep.id]);
      setDemoSubmitted(true);
      return;
    }
    await save(answer);
    await submit();
    await onTrialComplete?.();
  };

  const handleCoach = async (level: 1 | 2 | 3) => {
    if (demoMode) {
      const prompt = task.coach_prompts[level - 1] || '请先整理当前判断、证据来源和待验证项。';
      setCoachText(prompt);
      setAnswer(current => current ? ({
        ...current,
        coach_usage: [...current.coach_usage, { level, prompt, used_at: new Date().toISOString() }],
      }) : current);
      return;
    }
    const prompt = await requestCoach(level, answer);
    setCoachText(prompt);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] max-w-[1520px] mx-auto px-3 sm:px-5 py-5 sm:py-7">
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <button onClick={onBackToExplore} className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900"><ArrowLeft className="w-3.5 h-3.5" />返回职业探索</button>
              <button onClick={() => {
                window.localStorage.setItem(trialPhaseKey(taskId, progressMode), 'card-play');
                setPhase('card-play');
              }} className="text-xs text-purple-700 hover:text-purple-950">返回能力出牌</button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sky-100 px-2 py-1 text-[10px] font-mono font-bold text-sky-800">03 · 阶段 2 / 2</span>
              <span className="rounded-full bg-purple-100 px-2 py-1 text-[10px] font-mono font-bold text-purple-800">{task.id}</span>
              <span className="rounded-full bg-stone-100 px-2 py-1 text-[10px] font-mono text-stone-600">{task.role_type}</span>
              <span className="flex items-center gap-1 rounded-full bg-stone-100 px-2 py-1 text-[10px] font-mono text-stone-600"><Clock3 className="w-3 h-3" />{task.estimated_minutes}</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-serif craft-serif tracking-tight text-stone-900">{task.title}</h1>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-stone-600">{task.subtitle}</p>
          </div>
          <div className="w-full lg:w-[320px] shrink-0 rounded-2xl border border-stone-200 bg-white/85 px-4 py-3 text-xs text-stone-600">
            <p className="flex items-center gap-2 font-bold text-stone-900"><ShieldCheck className="w-4 h-4 text-emerald-600" />练习材料</p>
            <p className="mt-1 leading-relaxed">{task.source_note}</p>
          </div>
        </div>

        {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">{error}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_280px] gap-4 items-start">
          <aside className="xl:w-[280px] space-y-3">
            <div className="craft-card rounded-2xl border border-stone-200 bg-white/95 p-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-stone-900"><FileText className="w-4 h-4 text-purple-600" />你要做什么</h2>
              <p className="mt-3 text-xs leading-relaxed text-stone-700">{task.role}</p>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">{task.background}</p>
              <div className="mt-3 border-t border-stone-100 pt-3"><p className="text-[10px] font-mono text-stone-400">完成目标</p><p className="mt-1 text-xs leading-relaxed text-stone-800">{task.goal}</p></div>
            </div>
            <div className="craft-card rounded-2xl border border-stone-200 bg-white/95 p-3 space-y-2">
              <h2 className="px-1 text-xs font-bold text-stone-900">参考资料</h2>
              {task.materials.map(material => {
                const active = activeMaterialId === material.id;
                const cited = answer.evidence_refs.includes(material.id);
                return <div key={material.id} className={`rounded-xl border p-2.5 ${active ? 'border-purple-200 bg-purple-50/60' : 'border-stone-200 bg-stone-50/50'}`}>
                  <button onClick={() => openMaterial(material.id)} className="w-full text-left"><span className="block text-[11px] font-bold text-stone-800">{material.title}</span><span className="mt-1 block whitespace-pre-line text-[10px] leading-relaxed text-stone-500 line-clamp-5">{material.content}</span></button>
                  <button onClick={() => toggleEvidence(material.id)} className={`mt-2 flex items-center gap-1 text-[10px] font-medium ${cited ? 'text-purple-700' : 'text-stone-500'}`}><Link2 className="w-3 h-3" />{cited ? '已引用' : '引用材料'}</button>
                </div>;
              })}
            </div>
          </aside>

          <main className="craft-card min-w-0 rounded-2xl border border-stone-200 bg-white/95 p-4 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div><p className="text-[10px] font-mono font-bold text-purple-700">STEP {stepIndex + 1} / 5</p><h2 className="mt-1 text-base font-bold text-stone-900">{currentStep?.title}</h2></div>
              <span className="text-[10px] font-mono text-stone-400">已完成 {completedCount}/5 · {status === 'saving' ? '保存中…' : '本机自动续接'}</span>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentStep?.id}
                initial={{ opacity: 0, x: 18, filter: 'blur(5px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -12, filter: 'blur(4px)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="space-y-5"
              >
                <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                  <p className="text-xs leading-relaxed text-stone-700">{currentStep?.instruction}</p>
                  <div className="mt-2 flex flex-wrap gap-2"><span className="rounded-full bg-white px-2 py-1 text-[10px] text-stone-500">填写方式：{currentStep?.input_mode}</span><span className="rounded-full bg-white px-2 py-1 text-[10px] text-stone-500">注意：{currentStep?.constraint}</span></div>
                </div>

                {stepIndex === 4 && (demoMode || session.event_revealed) && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                    <p className="text-xs font-bold text-amber-900">{task.event.actor}</p>
                    <p className="mt-1 text-xs leading-relaxed text-amber-900/80">{task.event.message}</p>
                    <p className="mt-2 text-xs font-medium leading-relaxed text-amber-950">{task.event.instruction}</p>
                  </div>
                )}

                <TaskStepInput
                  value={answer.step_answers[currentStep?.id || ''] || ''}
                  inputMode={currentStep?.input_mode || '结构化文本'}
                  instruction={currentStep?.instruction || ''}
                  onChange={updateStepAnswer}
                  disabled={isBusy}
                />

                {stepIndex === 4 && (
                  <div className="grid grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)] gap-3">
                    <label className="text-xs font-bold text-stone-800">看到变化后怎么做<select value={answer.event_decision || ''} onChange={event => setAnswer(current => current ? ({ ...current, event_decision: event.target.value as '维持' | '调整' }) : current)} className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-normal"><option value="">请选择</option><option value="维持">维持原判断</option><option value="调整">调整原判断</option></select></label>
                    <label className="text-xs font-bold text-stone-800">为什么<textarea maxLength={500} rows={3} value={answer.event_response} onChange={event => setAnswer(current => current ? ({ ...current, event_response: event.target.value }) : current)} className="mt-2 w-full resize-none rounded-xl border border-stone-200 bg-white p-2.5 text-xs font-normal" placeholder="哪条新信息影响了你？你准备怎么调整？" /></label>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
              <button onClick={() => setStepIndex(index => Math.max(0, index - 1))} disabled={stepIndex === 0 || isBusy} className="craft-btn-secondary px-4 py-2 text-xs disabled:opacity-40">上一步</button>
              {stepIndex < 4 ? <button onClick={() => void handleNext()} disabled={isBusy || !answer.step_answers[currentStep?.id || '']?.trim()} className="craft-btn-black flex items-center gap-1.5 px-4 py-2 text-xs disabled:opacity-50">{stepIndex === 3 ? '保存并接收事件' : '保存并继续'}<ArrowRight className="w-3.5 h-3.5" /></button> : <button onClick={() => void handleSubmit()} disabled={isBusy || !answer.step_answers[currentStep?.id || '']?.trim() || !answer.event_decision || !answer.event_response.trim()} className="craft-btn-black flex items-center gap-1.5 px-4 py-2 text-xs disabled:opacity-50"><Send className="w-3.5 h-3.5" />{demoMode ? '查看演示评价' : status === 'submitting' ? 'Qwen 评价中…' : '提交任务并评价'}</button>}
            </div>
          </main>

          <aside className="xl:w-[280px] space-y-3">
            <div className="rounded-2xl border border-stone-800 bg-stone-900 p-4 text-white shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold"><Bot className="w-4 h-4 text-purple-300" />思路提示</h2>
              <p className="mt-2 text-[11px] leading-relaxed text-stone-300">只帮你理清思路，不替你完成。用过的提示会留在这次记录中。</p>
              <div className="mt-3 grid grid-cols-3 gap-1.5">{([1, 2, 3] as const).map(level => <button key={level} onClick={() => void handleCoach(level)} disabled={isBusy} className="rounded-full bg-white/10 px-2 py-1.5 text-[10px] text-stone-200 hover:bg-white/15">{level === 1 ? '给个方向' : level === 2 ? '帮我拆解' : '看个小例子'}</button>)}</div>
              <AnimatePresence initial={false}>{coachText && <motion.div key={coachText} initial={{ opacity: 0, y: 8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -4, height: 0 }} className="mt-3 overflow-hidden rounded-xl bg-white/10 p-3 text-xs leading-relaxed text-stone-200">{coachText}</motion.div>}</AnimatePresence>
              <p className="mt-3 text-[10px] text-stone-400">已使用 {answer.coach_usage.length} 次</p>
            </div>
            <div className="craft-card rounded-2xl border border-stone-200 bg-white/95 p-4">
              <h2 className="text-xs font-bold text-stone-900">完成进度</h2>
              <div className="mt-3 space-y-2">{task.steps.map((step, index) => { const complete = demoMode ? demoCompletedStepIds.includes(step.id) : Boolean(answer.step_answers[step.id]?.trim()); return <button key={step.id} onClick={() => index <= stepIndex && setStepIndex(index)} className="flex w-full items-center gap-2 text-left text-xs"><span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${complete ? 'bg-emerald-100 text-emerald-700' : index === stepIndex ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-400'}`}>{complete ? <Check className="w-3 h-3" /> : index + 1}</span><span className={index === stepIndex ? 'font-bold text-stone-900' : 'text-stone-500'}>{step.title}</span></button>; })}</div>
            </div>
            <div className="craft-card rounded-2xl border border-stone-200 bg-white/95 p-4"><h2 className="text-xs font-bold text-stone-900">需要注意</h2><div className="mt-2 space-y-1.5">{task.constraints.map(item => <p key={item} className="text-[11px] leading-relaxed text-stone-600">• {item}</p>)}</div></div>
          </aside>
        </div>
      </div>
    </div>
  );
};
