import { useCallback, useEffect, useRef, useState } from 'react';
import {
  confirmProfileCards,
  deleteProfileCard,
  getProfileOverview,
  updateProfileCard,
} from '../api/profile';
import {
  mapProfileCardsToSkillCards,
  mapSkillCardToApiProposal,
} from '../features/profile/profileAdapter';
import type { SkillCard } from '../types';
import type { ApiProfileEvidence, ProfileOverviewResponse } from '../types/api';

type ProfileCardsStatus = 'idle' | 'loading' | 'success' | 'error';

export function useProfileCards(enabled = true, accountId?: string) {
  const [cards, setCards] = useState<SkillCard[]>([]);
  const [version, setVersion] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<ApiProfileEvidence[]>([]);
  const [status, setStatus] = useState<ProfileCardsStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const requestGenerationRef = useRef(0);

  const applyCardsResponse = useCallback((response: Awaited<ReturnType<typeof getProfileOverview>>) => {
    const nextCards = mapProfileCardsToSkillCards(response);
    setCards(nextCards);
    setVersion(response.version);
    setUpdatedAt(response.updated_at ?? null);
    setEvidence(response.evidence ?? []);
    return nextCards;
  }, []);

  const applyOverview = useCallback((response: ProfileOverviewResponse) => {
    const nextCards = mapProfileCardsToSkillCards(response);
    setCards(nextCards);
    setVersion(response.version);
    setUpdatedAt(response.updated_at ?? null);
    setEvidence(response.evidence ?? []);
    return nextCards;
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setCards([]);
      setVersion(0);
      setUpdatedAt(null);
      setEvidence([]);
      setOwnerId(null);
      setStatus('idle');
      setError(null);
      return [];
    }
    const requestGeneration = ++requestGenerationRef.current;
    setStatus('loading');
    setError(null);
    try {
      const response = await getProfileOverview();
      if (requestGenerationRef.current !== requestGeneration) return [];
      const nextCards = applyOverview(response);
      setOwnerId(accountId || null);
      setStatus('success');
      return nextCards;
    } catch (cause) {
      if (requestGenerationRef.current !== requestGeneration) return [];
      const message = cause instanceof Error ? cause.message : '读取能力库失败，请稍后重试。';
      setStatus('error');
      setError(message);
      return [];
    }
  }, [accountId, applyOverview, enabled]);

  useEffect(() => {
    if (enabled) {
      void refresh();
      return;
    }
    requestGenerationRef.current += 1;
    setCards([]);
    setVersion(0);
    setUpdatedAt(null);
    setEvidence([]);
    setOwnerId(null);
    setStatus('idle');
    setError(null);
  }, [enabled, refresh]);

  const confirmCards = useCallback(async (nextCards: SkillCard[]) => {
    if (!enabled) throw new Error('正式模式需要先登录。');
    setStatus('loading');
    setError(null);
    try {
      const response = await confirmProfileCards(nextCards.map(mapSkillCardToApiProposal));
      const persistedCards = applyCardsResponse({ ...response, evidence });
      setOwnerId(accountId || null);
      setStatus('success');
      return persistedCards;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '保存能力卡失败，请稍后重试。';
      setStatus('error');
      setError(message);
      throw cause;
    }
  }, [accountId, applyCardsResponse, enabled, evidence]);

  const updateCard = useCallback(async (
    cardId: string,
    patch: Parameters<typeof updateProfileCard>[1],
  ) => {
    if (!enabled) throw new Error('正式模式需要先登录。');
    setStatus('loading');
    setError(null);
    try {
      const response = await updateProfileCard(cardId, patch);
      const persistedCards = applyCardsResponse({ ...response, evidence });
      setOwnerId(accountId || null);
      setStatus('success');
      return persistedCards;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '更新能力卡失败，请稍后重试。';
      setStatus('error');
      setError(message);
      throw cause;
    }
  }, [accountId, applyCardsResponse, enabled, evidence]);

  const removeCard = useCallback(async (cardId: string) => {
    if (!enabled) throw new Error('正式模式需要先登录。');
    setStatus('loading');
    setError(null);
    try {
      const response = await deleteProfileCard(cardId);
      const remainingCards = applyCardsResponse({ ...response, evidence });
      setOwnerId(accountId || null);
      setStatus('success');
      return remainingCards;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '删除能力卡失败，请稍后重试。';
      setStatus('error');
      setError(message);
      throw cause;
    }
  }, [accountId, applyCardsResponse, enabled, evidence]);

  const reset = useCallback(() => {
    requestGenerationRef.current += 1;
    setCards([]);
    setVersion(0);
    setUpdatedAt(null);
    setEvidence([]);
    setOwnerId(accountId || null);
    setStatus(enabled ? 'success' : 'idle');
    setError(null);
  }, [accountId, enabled]);

  return {
    cards,
    version,
    updatedAt,
    evidence,
    status,
    error,
    ownerId,
    refresh,
    confirmCards,
    updateCard,
    removeCard,
    reset,
  };
}
