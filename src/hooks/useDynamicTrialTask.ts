import { useCallback, useEffect, useState } from 'react';
import { ApiClientError } from '../api/client';
import {
  createDynamicTrialSession,
  getDynamicTrialSession,
  getDynamicTrialTask,
  revealDynamicTrialEvent,
  saveDynamicTrialAnswer,
  submitDynamicTrialSession,
  useDynamicTrialCoach,
} from '../api/trial';
import type {
  ApiDynamicTrialAnswer,
  ApiDynamicTrialSession,
  ApiTrialTaskDefinition,
  TrialTaskId,
} from '../types/api';

type DynamicTrialStatus = 'loading' | 'ready' | 'saving' | 'submitting' | 'error';

interface LoadedDynamicTrial {
  task: ApiTrialTaskDefinition;
  session: ApiDynamicTrialSession;
}

// React StrictMode intentionally re-runs effects in development. Keep the first
// request in flight so the second effect reuses it instead of creating a second
// local workbench session.
const pendingTrialLoads = new Map<TrialTaskId, Promise<LoadedDynamicTrial>>();

function storageKey(taskId: TrialTaskId) {
  return `before-choosing:dynamic-trial:${taskId}`;
}

async function resolveDynamicTrial(taskId: TrialTaskId): Promise<LoadedDynamicTrial> {
  const task = await getDynamicTrialTask(taskId);
  let session: ApiDynamicTrialSession | null = null;
  const storedId = window.localStorage.getItem(storageKey(taskId));

  if (storedId) {
    try {
      session = await getDynamicTrialSession(storedId);
      if (session.task_id !== taskId) session = null;
    } catch (cause) {
      if (!(cause instanceof ApiClientError) || cause.status !== 404) throw cause;
      window.localStorage.removeItem(storageKey(taskId));
    }
  }

  if (!session) {
    session = await createDynamicTrialSession(taskId);
    window.localStorage.setItem(storageKey(taskId), session.id);
  }

  return { task, session };
}

function loadDynamicTrial(taskId: TrialTaskId): Promise<LoadedDynamicTrial> {
  const pending = pendingTrialLoads.get(taskId);
  if (pending) return pending;

  const request = resolveDynamicTrial(taskId).finally(() => {
    if (pendingTrialLoads.get(taskId) === request) pendingTrialLoads.delete(taskId);
  });
  pendingTrialLoads.set(taskId, request);
  return request;
}

export function useDynamicTrialTask(taskId: TrialTaskId) {
  const [task, setTask] = useState<ApiTrialTaskDefinition | null>(null);
  const [session, setSession] = useState<ApiDynamicTrialSession | null>(null);
  const [status, setStatus] = useState<DynamicTrialStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setStatus('loading');
      setError(null);
      try {
        const { task: taskResponse, session: sessionResponse } = await loadDynamicTrial(taskId);
        if (!cancelled) {
          setTask(taskResponse);
          setSession(sessionResponse);
          setStatus('ready');
        }
      } catch (cause) {
        if (!cancelled) {
          setStatus('error');
          setError(cause instanceof Error ? cause.message : '试路任务加载失败。');
        }
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [taskId]);

  const run = useCallback(async <T extends ApiDynamicTrialSession>(
    state: DynamicTrialStatus,
    action: () => Promise<T>,
  ) => {
    setStatus(state);
    setError(null);
    try {
      const next = await action();
      setSession(next);
      setStatus('ready');
      return next;
    } catch (cause) {
      setStatus('error');
      setError(cause instanceof Error ? cause.message : '请求失败，请稍后重试。');
      throw cause;
    }
  }, []);

  const save = useCallback((answer: ApiDynamicTrialAnswer) => {
    if (!session) throw new Error('试路会话尚未准备完成。');
    return run('saving', () => saveDynamicTrialAnswer(session.id, answer));
  }, [run, session]);

  const revealEvent = useCallback(() => {
    if (!session) throw new Error('试路会话尚未准备完成。');
    return run('saving', () => revealDynamicTrialEvent(session.id));
  }, [run, session]);

  const requestCoach = useCallback(async (level: 1 | 2 | 3) => {
    if (!session) throw new Error('试路会话尚未准备完成。');
    setStatus('saving');
    setError(null);
    try {
      const response = await useDynamicTrialCoach(session.id, level);
      const next = await getDynamicTrialSession(session.id);
      setSession(next);
      setStatus('ready');
      return response.prompt;
    } catch (cause) {
      setStatus('error');
      setError(cause instanceof Error ? cause.message : 'Coach 提示加载失败。');
      throw cause;
    }
  }, [session]);

  const submit = useCallback(() => {
    if (!session) throw new Error('试路会话尚未准备完成。');
    return run('submitting', () => submitDynamicTrialSession(session.id));
  }, [run, session]);

  return { task, session, status, error, save, revealEvent, requestCoach, submit };
}
