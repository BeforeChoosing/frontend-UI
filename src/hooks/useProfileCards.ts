import { useCallback, useEffect, useState } from 'react';
import {
  confirmProfileCards,
  deleteProfileCard,
  getProfileCards,
  updateProfileCard,
} from '../api/profile';
import {
  mapProfileCardsToSkillCards,
  mapSkillCardToApiProposal,
} from '../features/profile/profileAdapter';
import type { SkillCard } from '../types';

type ProfileCardsStatus = 'idle' | 'loading' | 'success' | 'error';

export function useProfileCards() {
  const [cards, setCards] = useState<SkillCard[]>([]);
  const [version, setVersion] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<ProfileCardsStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const applyResponse = useCallback((response: Awaited<ReturnType<typeof getProfileCards>>) => {
    const nextCards = mapProfileCardsToSkillCards(response);
    setCards(nextCards);
    setVersion(response.version);
    setUpdatedAt(response.updated_at ?? null);
    return nextCards;
  }, []);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const response = await getProfileCards();
      const nextCards = applyResponse(response);
      setStatus('success');
      return nextCards;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '读取能力库失败，请稍后重试。';
      setStatus('error');
      setError(message);
      return [];
    }
  }, [applyResponse]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const confirmCards = useCallback(async (nextCards: SkillCard[]) => {
    setStatus('loading');
    setError(null);
    try {
      const response = await confirmProfileCards(nextCards.map(mapSkillCardToApiProposal));
      const persistedCards = applyResponse(response);
      setStatus('success');
      return persistedCards;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '保存能力卡失败，请稍后重试。';
      setStatus('error');
      setError(message);
      throw cause;
    }
  }, [applyResponse]);

  const updateCard = useCallback(async (
    cardId: string,
    patch: Parameters<typeof updateProfileCard>[1],
  ) => {
    setStatus('loading');
    setError(null);
    try {
      const response = await updateProfileCard(cardId, patch);
      const persistedCards = applyResponse(response);
      setStatus('success');
      return persistedCards;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '更新能力卡失败，请稍后重试。';
      setStatus('error');
      setError(message);
      throw cause;
    }
  }, [applyResponse]);

  const removeCard = useCallback(async (cardId: string) => {
    setStatus('loading');
    setError(null);
    try {
      const response = await deleteProfileCard(cardId);
      const remainingCards = applyResponse(response);
      setStatus('success');
      return remainingCards;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '删除能力卡失败，请稍后重试。';
      setStatus('error');
      setError(message);
      throw cause;
    }
  }, [applyResponse]);

  return {
    cards,
    version,
    updatedAt,
    status,
    error,
    refresh,
    confirmCards,
    updateCard,
    removeCard,
  };
}
