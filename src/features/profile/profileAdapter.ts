import type { SkillCard } from '../../types';
import type {
  ApiCardProposal,
  ApiProfileCard,
  ProfileCardsResponse,
  ProfileProposalResponse,
} from '../../types/api';

/**
 * Model proposals are displayed as compact, editable ability labels.  Keep
 * persisted cards untouched so a user can freely revise a title later; this
 * adapter only normalizes newly generated proposals for the first render.
 */
export function normalizeGeneratedAbilityTitle(value: string): string {
  const cleaned = value.replace(/[\s\n\r，。！？、,:：；;.!?]+/g, '').trim();
  if (!cleaned) return '待验证能力';
  const withoutSuffix = cleaned.endsWith('能力') ? cleaned.slice(0, -2) : cleaned;
  const compactCore = withoutSuffix.slice(0, 8);
  return `${compactCore || '待验证'}能力`.slice(0, 10);
}

export function mapApiCardToSkillCard(card: ApiCardProposal | ApiProfileCard): SkillCard {
  return {
    id: card.id,
    title: card.title,
    category: card.category,
    description: card.description,
    detail: card.detail,
    icon: card.icon,
    colorTone: card.color_tone,
    workplaceApplication: card.workplace_application,
    matchReason: card.match_reason,
    evidenceQuote: card.evidence_quote,
    sourceRefs: card.source_refs,
    claimLevel: card.claim_level,
    evidenceType: card.evidence_type,
    pendingVerification: card.pending_verification,
    nextVerification: card.next_verification,
  };
}

export function mapProfileProposalToSkillCards(
  proposal: ProfileProposalResponse,
): SkillCard[] {
  return proposal.card_proposals.map(card => mapApiCardToSkillCard({
    ...card,
    title: normalizeGeneratedAbilityTitle(card.title),
  }));
}

export function mapProfileCardsToSkillCards(
  response: ProfileCardsResponse,
): SkillCard[] {
  return response.cards.map(mapApiCardToSkillCard);
}

export function mapSkillCardToApiProposal(card: SkillCard): ApiCardProposal {
  return {
    id: card.id,
    title: card.title,
    category: card.category,
    description: card.description,
    detail: card.detail || card.description,
    icon: card.icon,
    color_tone: card.colorTone,
    claim_level: card.claimLevel ?? 'interpretation',
    evidence_type: card.evidenceType ?? 'self_report',
    evidence_quote: card.evidenceQuote ?? card.description,
    source_refs: card.sourceRefs ?? ['ui:confirmed-card'],
    pending_verification: card.pendingVerification ?? true,
    next_verification: card.nextVerification ?? '在后续任务中进一步验证',
    match_reason: card.matchReason ?? '用户确认的能力卡',
    workplace_application: card.workplaceApplication ?? '待在目标任务中验证',
  };
}
