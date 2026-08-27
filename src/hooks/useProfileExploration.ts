import { useCallback, useRef, useState } from 'react';
import { createProfileExplorationMessage } from '../api/profile';
import type { ProfileExplorationRequest, ProfileExplorationResponse } from '../types/api';

type ExplorationStatus = 'idle' | 'loading' | 'success' | 'error';

export function useProfileExploration() {
  const [status, setStatus] = useState<ExplorationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const pendingRef = useRef<Promise<ProfileExplorationResponse> | null>(null);

  const explore = useCallback((request: ProfileExplorationRequest) => {
    if (pendingRef.current) return pendingRef.current;
    const pending = (async () => {
      setStatus('loading');
      setError(null);
      try {
        const response = await createProfileExplorationMessage(request);
        setStatus('success');
        return response;
      } catch (cause) {
        const message = '这次整理没有完成，你刚才发送的内容已经保留。稍后可以再次发送。';
        setStatus('error');
        setError(message);
        throw cause;
      } finally {
        pendingRef.current = null;
      }
    })();
    pendingRef.current = pending;
    return pending;
  }, []);

  const reset = useCallback(() => {
    if (pendingRef.current) return;
    setStatus('idle');
    setError(null);
  }, []);

  return { explore, status, error, reset };
}
