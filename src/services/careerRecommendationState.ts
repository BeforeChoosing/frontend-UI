import type { SkillCard } from '../types';

export function createCareerSelectionSignature(cards: SkillCard[]): string {
  return JSON.stringify(cards.map(card => ({
    id: card.id,
    title: card.title,
    category: card.category,
    description: card.description,
    detail: card.detail,
    workplaceApplication: card.workplaceApplication ?? null,
    claimLevel: card.claimLevel ?? null,
    pendingVerification: card.pendingVerification ?? false,
  })));
}

export function isCareerRecommendationCurrent(
  storedSignature: string | null | undefined,
  cards: SkillCard[],
): boolean {
  return Boolean(storedSignature)
    && storedSignature === createCareerSelectionSignature(cards);
}
