import { useCallback, useEffect, useState } from 'react';
import { ApiClientError } from '../api/client';
import {
  createA02TrialSession,
  getA02Task,
  getTrialSession,
  revealTrialEvent,
  saveTrialAnswer,
  submitTrialSession,
} from '../api/trial';
import type {
  ApiA02Answer,
  ApiA02Task,
  ApiTrialSession,
} from '../types/api';

const SESSION_STORAGE_KEY = 'before-choosing:trial-session:A-02';

type TrialStatus = 'loading' | 'ready' | 'saving' | 'submitting' | 'error';

function readStoredSessionId(): string | null {
  try {
    return window.localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredSessionId(sessionId: string) {
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  } catch {
    // Local storage is an enhancement; the backend session remains authoritative.
  }
}

export function useA02TrialTask() {
  const [task, setTask] = useState<ApiA02Task | null>(null);
  const [session, setSession] = useState<ApiTrialSession | null>(null);
  const [status, setStatus] = useState<TrialStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setStatus('loading');
      setError(null);
      try {
        const taskResponse = await getA02Task();
        let sessionResponse: ApiTrialSession | null = null;
        const storedSessionId = readStoredSessionId();
        if (storedSessionId) {
          try {
            sessionResponse = await getTrialSession(storedSessionId);
          } catch (cause) {
            if (!(cause instanceof ApiClientError) || cause.status !== 404) {
              throw cause;
            }
          }
        }
        if (!sessionResponse) {
          sessionResponse = await createA02TrialSession();
          writeStoredSessionId(sessionResponse.id);
        }
        if (!cancelled) {
          setTask(taskResponse);
          setSession(sessionResponse);
          setStatus('ready');
        }
      } catch (cause) {
        if (!cancelled) {
          setStatus('error');
          setError(cause instanceof Error ? cause.message : '试路任务加载失败，请稍后重试。');
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveAnswer = useCallback(async (answer: ApiA02Answer) => {
    if (!session) throw new Error('试路会话尚未准备完成。');
    setStatus('saving');
    setError(null);
    try {
      const nextSession = await saveTrialAnswer(session.id, answer);
      setSession(nextSession);
      setStatus('ready');
      return nextSession;
    } catch (cause) {
      setStatus('error');
      setError(cause instanceof Error ? cause.message : '作答保存失败，请稍后重试。');
      throw cause;
    }
  }, [session]);

  const revealEvent = useCallback(async () => {
    if (!session) throw new Error('试路会话尚未准备完成。');
    setStatus('saving');
    setError(null);
    try {
      const nextSession = await revealTrialEvent(session.id);
      setSession(nextSession);
      setStatus('ready');
      return nextSession;
    } catch (cause) {
      setStatus('error');
      setError(cause instanceof Error ? cause.message : '中途事件加载失败，请稍后重试。');
      throw cause;
    }
  }, [session]);

  const submit = useCallback(async () => {
    if (!session) throw new Error('试路会话尚未准备完成。');
    setStatus('submitting');
    setError(null);
    try {
      const nextSession = await submitTrialSession(session.id);
      setSession(nextSession);
      setStatus('ready');
      return nextSession;
    } catch (cause) {
      setStatus('error');
      setError(cause instanceof Error ? cause.message : '任务提交失败，请稍后重试。');
      throw cause;
    }
  }, [session]);

  return {
    task,
    session,
    status,
    error,
    saveAnswer,
    revealEvent,
    submit,
  };
}
