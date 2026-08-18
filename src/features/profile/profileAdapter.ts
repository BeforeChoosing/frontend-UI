import type { SkillCard } from '../../types';
import type { ApiCardProposal, ProfileProposalResponse } from '../../types/api';

function toSkillCard(card: ApiCardProposal): SkillCard {
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
  return proposal.card_proposals.map(toSkillCard);
}
