import { useCallback, useEffect, useState } from 'react';
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

export function useProfileCards() {
  const [cards, setCards] = useState<SkillCard[]>([]);
  const [version, setVersion] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<ApiProfileEvidence[]>([]);
  const [status, setStatus] = useState<ProfileCardsStatus>('idle');
  const [error, setError] = useState<string | null>(null);

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
    setStatus('loading');
    setError(null);
    try {
      const response = await getProfileOverview();
      const nextCards = applyOverview(response);
      setStatus('success');
      return nextCards;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '读取能力库失败，请稍后重试。';
      setStatus('error');
      setError(message);
      return [];
    }
  }, [applyOverview]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const confirmCards = useCallback(async (nextCards: SkillCard[]) => {
    setStatus('loading');
    setError(null);
    try {
      const response = await confirmProfileCards(nextCards.map(mapSkillCardToApiProposal));
      const persistedCards = applyCardsResponse({ ...response, evidence });
      setStatus('success');
      return persistedCards;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '保存能力卡失败，请稍后重试。';
      setStatus('error');
      setError(message);
      throw cause;
    }
  }, [applyCardsResponse, evidence]);

  const updateCard = useCallback(async (
    cardId: string,
    patch: Parameters<typeof updateProfileCard>[1],
  ) => {
    setStatus('loading');
    setError(null);
    try {
      const response = await updateProfileCard(cardId, patch);
      const persistedCards = applyCardsResponse({ ...response, evidence });
      setStatus('success');
      return persistedCards;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '更新能力卡失败，请稍后重试。';
      setStatus('error');
      setError(message);
      throw cause;
    }
  }, [applyCardsResponse, evidence]);

  const removeCard = useCallback(async (cardId: string) => {
    setStatus('loading');
    setError(null);
    try {
      const response = await deleteProfileCard(cardId);
      const remainingCards = applyCardsResponse({ ...response, evidence });
      setStatus('success');
      return remainingCards;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '删除能力卡失败，请稍后重试。';
      setStatus('error');
      setError(message);
      throw cause;
    }
  }, [applyCardsResponse, evidence]);

  return {
    cards,
    version,
    updatedAt,
    evidence,
    status,
    error,
    refresh,
    confirmCards,
    updateCard,
    removeCard,
  };
}
