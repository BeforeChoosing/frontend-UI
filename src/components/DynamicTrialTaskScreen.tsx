import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useDynamicTrialTask } from '../hooks/useDynamicTrialTask';
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
  onTrialComplete?: () => Promise<unknown> | void;
  onFocusModeChange?: (focused: boolean) => void;
  demoMode?: boolean;
}

interface TrialEvaluationViewProps {
  task: ApiTrialTaskDefinition;
  evaluation: ApiTrialEvaluation;
  observedEvidence: ApiObservedEvidence;
  onBackToExplore: () => void;
  onEnterProfile: () => void;
}

function TrialEvaluationView({
  task,
  evaluation,
  observedEvidence,
  onBackToExplore,
  onEnterProfile,
}: TrialEvaluationViewProps) {
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
            </motion.div>
          ))}
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
  onTrialComplete,
  onFocusModeChange,
  demoMode = false,
}) => {
  const progressMode = demoMode ? 'demo' : 'use';
  const { task, session, status, error, save, revealEvent, requestCoach, submit } = useDynamicTrialTask(taskId, progressMode);
  const [stepIndex, setStepIndex] = useState(() => {
    const saved = Number(window.localStorage.getItem(trialStepKey(taskId, progressMode)));
    return Number.isInteger(saved) && saved >= 0 && saved < 5 ? saved : 0;
  });
  const [answer, setAnswer] = useState<ApiDynamicTrialAnswer | null>(null);
  const [coachText, setCoachText] = useState<string | null>(null);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoCompletedStepIds, setDemoCompletedStepIds] = useState<string[]>([]);
  const [workbenchActive, setWorkbenchActive] = useState(false);
  const [phase, setPhase] = useState<'card-play' | 'workbench'>('card-play');
  const initializedSessionRef = useRef<string | null>(null);

  const demoAnswer = useMemo(() => demoMode && task ? createDemoTrialAnswer(task) : null, [demoMode, task]);

  useEffect(() => {
    if (!session) return;
    if (!demoMode) setAnswer(session.answer);
  }, [demoMode, session]);

  useEffect(() => {
    if (!session || !task) return;
    const initializationKey = `${progressMode}:${session.id}:${taskId}`;
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
      window.localStorage.setItem(trialStepKey(taskId, progressMode), '0');
      return;
    }
    // Entering 03 always returns to the three-challenge overview. Completed
    // rounds stay visible and the user explicitly continues to the briefing.
    setPhase('card-play');
    const savedStep = Number(window.localStorage.getItem(trialStepKey(taskId, progressMode)));
    if (Number.isInteger(savedStep) && savedStep >= 0 && savedStep < task.steps.length) {
      setStepIndex(savedStep);
    } else {
      const firstIncomplete = task.steps.findIndex(step => !nextAnswer.step_answers[step.id]?.trim());
      setStepIndex(firstIncomplete === -1 ? task.steps.length - 1 : firstIncomplete);
    }
  }, [demoAnswer, demoMode, onFocusModeChange, progressMode, session, task, taskId]);

  useEffect(() => {
    if (phase === 'card-play') {
      setWorkbenchActive(false);
      onFocusModeChange?.(false);
    }
  }, [onFocusModeChange, phase]);

  useEffect(() => {
    window.localStorage.setItem(trialStepKey(taskId, progressMode), String(stepIndex));
  }, [progressMode, stepIndex, taskId]);

  useEffect(() => () => onFocusModeChange?.(false), [onFocusModeChange]);

  const isBusy = status === 'saving' || status === 'submitting';

  if (!task || !session || !answer || status === 'loading') {
    return <div className="grid min-h-[calc(100vh-64px)] place-items-center text-sm text-stone-500">正在准备小任务…</div>;
  }

  const evaluation = demoSubmitted ? createDemoTrialEvaluation(task) : session.evaluation;
  const observedEvidence = demoSubmitted ? createDemoObservedEvidence(task) : session.observed_evidence;
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
    if (!answer.step_answers[currentStep.id]?.trim() || !answer.event_decision || !answer.event_response.trim()) return;
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
    if (demoMode) {
      const prompt = task.coach_prompts[level - 1] || '请先整理当前判断、证据来源和待验证项。';
      setCoachText(prompt);
      setAnswer(current => current ? ({ ...current, coach_usage: [...current.coach_usage, { level, prompt, used_at: new Date().toISOString() }] }) : current);
      return;
    }
    setCoachText(await requestCoach(level, answer));
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
          <TrialEvaluationView
            task={task}
            evaluation={evaluation}
            observedEvidence={observedEvidence}
            onBackToExplore={onBackToExplore}
            onEnterProfile={onEnterProfile}
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
            onActiveChange={changeFocusMode}
            onBackToExplore={onBackToExplore}
            onStepChange={setStepIndex}
            onStepAnswerChange={updateStepAnswer}
            onEventDecisionChange={decision => setAnswer(current => current ? ({ ...current, event_decision: decision || null }) : current)}
            onEventResponseChange={value => setAnswer(current => current ? ({ ...current, event_response: value }) : current)}
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
