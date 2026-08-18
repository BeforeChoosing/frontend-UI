import { useCallback, useState } from 'react';
import { createProfileProposal } from '../api/profile';
import type { ProfileProposalRequest, ProfileProposalResponse } from '../types/api';

type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

export function useExperienceAnalysis() {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (
    request: ProfileProposalRequest,
  ): Promise<ProfileProposalResponse> => {
    setStatus('loading');
    setError(null);
    try {
      const response = await createProfileProposal(request);
      setStatus('success');
      return response;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '经历分析失败，请稍后重试。';
      setStatus('error');
      setError(message);
      throw cause;
    }
  }, []);

  return { analyze, status, error };
}
