import { useCallback, useRef, useState } from 'react';
import { createProfileExplorationMessage } from '../api/profile';
import { cancelMyLlmRequest, getMyLlmQueueStatus, type LlmQueueStatus } from '../api/llmQueue';
import type { ProfileExplorationRequest, ProfileExplorationResponse } from '../types/api';

type ExplorationStatus = 'idle' | 'loading' | 'success' | 'error';

export function useProfileExploration() {
  const [status, setStatus] = useState<ExplorationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [queueStatus, setQueueStatus] = useState<LlmQueueStatus | null>(null);
  const pendingRef = useRef<Promise<ProfileExplorationResponse> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  const explore = useCallback((request: ProfileExplorationRequest) => {
    if (pendingRef.current) return pendingRef.current;
    const pending = (async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setStatus('loading');
      setError(null);
      setQueueStatus({ state: 'queued', ahead: 0, can_cancel: true });
      const poll = async () => {
        try {
          setQueueStatus(await getMyLlmQueueStatus());
        } catch {
          // The original request remains authoritative; a status poll may race auth/session refresh.
        }
      };
      pollTimerRef.current = window.setInterval(() => void poll(), 800);
      window.setTimeout(() => void poll(), 120);
      try {
        const response = await createProfileExplorationMessage(request, controller.signal);
        setStatus('success');
        return response;
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === 'AbortError') {
          setStatus('idle');
          throw cause;
        }
        const detail = cause instanceof Error ? cause.message : '请稍后重试。';
        const message = `这次整理没有完成，你刚才发送的内容已经保留。\n${detail}`;
        setStatus('error');
        setError(message);
        throw cause;
      } finally {
        if (pollTimerRef.current !== null) window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
        abortRef.current = null;
        setQueueStatus(null);
        pendingRef.current = null;
      }
    })();
    pendingRef.current = pending;
    return pending;
  }, []);

  const cancel = useCallback(async () => {
    if (!pendingRef.current) return;
    try {
      await cancelMyLlmRequest();
    } finally {
      abortRef.current?.abort();
      setQueueStatus({ state: 'cancelling', ahead: 0, can_cancel: false });
    }
  }, []);

  const reset = useCallback(() => {
    if (pendingRef.current) return;
    setStatus('idle');
    setError(null);
  }, []);

  return { explore, status, error, queueStatus, cancel, reset };
}
