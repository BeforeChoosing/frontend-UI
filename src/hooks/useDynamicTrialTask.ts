import { useCallback, useEffect, useRef, useState } from 'react';
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
import {
  createLocalDemoTrialSession,
  getLocalDemoTrialTask,
} from '../data/demoTrialCatalog';

type DynamicTrialStatus = 'loading' | 'ready' | 'saving' | 'submitting' | 'error';

interface LoadedDynamicTrial {
  task: ApiTrialTaskDefinition;
  session: ApiDynamicTrialSession;
}

// React StrictMode intentionally re-runs effects in development. Keep the first
// request in flight so the second effect reuses it instead of creating a second
// local workbench session.
const pendingTrialLoads = new Map<string, Promise<LoadedDynamicTrial>>();

export function resetPendingDemoTrialLoads(): void {
  for (const key of pendingTrialLoads.keys()) {
    if (key.startsWith('demo:')) pendingTrialLoads.delete(key);
  }
}

function storageKey(taskId: TrialTaskId, namespace: 'demo' | 'use', userId?: string) {
  return namespace === 'use'
    ? `before-choosing:dynamic-trial:${taskId}${userId ? `:${encodeURIComponent(userId)}` : ''}`
    : `before-choosing:dynamic-trial:demo:${taskId}`;
}

async function resolveDynamicTrial(taskId: TrialTaskId, namespace: 'demo' | 'use', userId?: string): Promise<LoadedDynamicTrial> {
  if (namespace === 'demo') {
    const task = getLocalDemoTrialTask(taskId);
    return { task, session: createLocalDemoTrialSession(task) };
  }
  const task = await getDynamicTrialTask(taskId);
  let session: ApiDynamicTrialSession | null = null;
  const storedId = window.localStorage.getItem(storageKey(taskId, namespace, userId));

  if (storedId) {
    try {
      session = await getDynamicTrialSession(storedId);
      if (session.task_id !== taskId) session = null;
    } catch (cause) {
      if (!(cause instanceof ApiClientError) || cause.status !== 404) throw cause;
      window.localStorage.removeItem(storageKey(taskId, namespace, userId));
    }
  }

  if (!session) {
    session = await createDynamicTrialSession(taskId);
    window.localStorage.setItem(storageKey(taskId, namespace, userId), session.id);
  }

  return { task, session };
}

function loadDynamicTrial(taskId: TrialTaskId, namespace: 'demo' | 'use', userId?: string): Promise<LoadedDynamicTrial> {
  const pendingKey = `${namespace}:${userId || 'anonymous'}:${taskId}`;
  const pending = pendingTrialLoads.get(pendingKey);
  if (pending) return pending;

  const request = resolveDynamicTrial(taskId, namespace, userId).finally(() => {
    if (pendingTrialLoads.get(pendingKey) === request) pendingTrialLoads.delete(pendingKey);
  });
  pendingTrialLoads.set(pendingKey, request);
  return request;
}

export function useDynamicTrialTask(taskId: TrialTaskId, namespace: 'demo' | 'use' = 'use', userId?: string) {
  const [task, setTask] = useState<ApiTrialTaskDefinition | null>(null);
  const [session, setSession] = useState<ApiDynamicTrialSession | null>(null);
  const [status, setStatus] = useState<DynamicTrialStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const sessionActionRef = useRef<Promise<ApiDynamicTrialSession> | null>(null);
  const coachActionRef = useRef<Promise<string> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setStatus('loading');
      setError(null);
      try {
        const { task: taskResponse, session: sessionResponse } = await loadDynamicTrial(taskId, namespace, userId);
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
  }, [namespace, reloadNonce, taskId, userId]);

  const run = useCallback(async <T extends ApiDynamicTrialSession>(
    state: DynamicTrialStatus,
    action: () => Promise<T>,
  ) => {
    if (sessionActionRef.current) return sessionActionRef.current as Promise<T>;
    const request = (async () => {
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
      } finally {
        sessionActionRef.current = null;
      }
    })();
    sessionActionRef.current = request;
    return request;
  }, []);

  const save = useCallback((answer: ApiDynamicTrialAnswer) => {
    if (!session) throw new Error('试路会话尚未准备完成。');
    if (namespace === 'demo') {
      const next = { ...session, answer, updated_at: new Date().toISOString() };
      setSession(next);
      return Promise.resolve(next);
    }
    return run('saving', () => saveDynamicTrialAnswer(session.id, answer));
  }, [namespace, run, session]);

  const revealEvent = useCallback(() => {
    if (!session) throw new Error('试路会话尚未准备完成。');
    if (namespace === 'demo') {
      const next = { ...session, event_revealed: true, updated_at: new Date().toISOString() };
      setSession(next);
      return Promise.resolve(next);
    }
    return run('saving', () => revealDynamicTrialEvent(session.id));
  }, [namespace, run, session]);

  const requestCoach = useCallback(async (
    level: 1 | 2 | 3,
    draftAnswer: ApiDynamicTrialAnswer,
  ) => {
    if (!session) throw new Error('试路会话尚未准备完成。');
    if (namespace === 'demo') {
      const prompt = task?.coach_prompts[level - 1] || '请先整理当前判断、证据来源和待验证项。';
      return prompt;
    }
    if (coachActionRef.current) return coachActionRef.current;
    const request = (async () => {
      setStatus('saving');
      setError(null);
      try {
        const saved = await saveDynamicTrialAnswer(session.id, draftAnswer);
        setSession(saved);
        const response = await useDynamicTrialCoach(session.id, level);
        const next = await getDynamicTrialSession(session.id);
        setSession(next);
        setStatus('ready');
        return response.prompt;
      } catch (cause) {
        setStatus('error');
        setError(cause instanceof Error ? cause.message : 'Coach 提示加载失败。');
        throw cause;
      } finally {
        coachActionRef.current = null;
      }
    })();
    coachActionRef.current = request;
    return request;
  }, [namespace, session, task]);

  const submit = useCallback(() => {
    if (!session) throw new Error('试路会话尚未准备完成。');
    if (namespace === 'demo') {
      const now = new Date().toISOString();
      const next = { ...session, status: 'submitted' as const, updated_at: now, submitted_at: now };
      setSession(next);
      return Promise.resolve(next);
    }
    return run('submitting', () => submitDynamicTrialSession(session.id));
  }, [namespace, run, session]);

  const retry = useCallback(() => setReloadNonce(value => value + 1), []);

  return { task, session, status, error, save, revealEvent, requestCoach, submit, retry };
}
