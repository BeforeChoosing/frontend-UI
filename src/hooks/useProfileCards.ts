import { useCallback, useEffect, useState } from 'react';
import {
  confirmProfileCards,
  getProfileCards,
} from '../api/profile';
import {
  mapProfileCardsToSkillCards,
  mapSkillCardToApiProposal,
} from '../features/profile/profileAdapter';
import type { SkillCard } from '../types';

type ProfileCardsStatus = 'idle' | 'loading' | 'success' | 'error';

export function useProfileCards() {
  const [cards, setCards] = useState<SkillCard[]>([]);
  const [status, setStatus] = useState<ProfileCardsStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const response = await getProfileCards();
      const nextCards = mapProfileCardsToSkillCards(response);
      setCards(nextCards);
      setStatus('success');
      return nextCards;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '读取能力库失败，请稍后重试。';
      setStatus('error');
      setError(message);
      return [];
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const confirmCards = useCallback(async (nextCards: SkillCard[]) => {
    setStatus('loading');
    setError(null);
    try {
      const response = await confirmProfileCards(nextCards.map(mapSkillCardToApiProposal));
      const persistedCards = mapProfileCardsToSkillCards(response);
      setCards(persistedCards);
      setStatus('success');
      return persistedCards;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '保存能力卡失败，请稍后重试。';
      setStatus('error');
      setError(message);
      throw cause;
    }
  }, []);

  return { cards, status, error, refresh, confirmCards };
}
