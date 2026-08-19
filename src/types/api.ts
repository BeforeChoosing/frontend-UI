export interface ProfileProposalRequest {
  experience_text: string;
  target_role?: string;
  existing_card_titles?: string[];
}

export interface ApiExperienceSummary {
  title: string;
  actions: string[];
  result?: string | null;
  source_refs: string[];
}

export type ApiCardCategory =
  | '洞察分析'
  | '产品策略'
  | '技术落地'
  | '数据驱动'
  | '协作沟通'
  | '交互体验';

export interface ApiCardProposal {
  id: string;
  title: string;
  category: ApiCardCategory;
  description: string;
  detail: string;
  icon: string;
  color_tone: 'purple' | 'blue' | 'emerald' | 'amber' | 'rose';
  claim_level: 'fact' | 'interpretation' | 'hypothesis';
  evidence_type: 'documented_fact' | 'self_report' | 'inference';
  evidence_quote: string;
  source_refs: string[];
  pending_verification: boolean;
  next_verification: string;
  match_reason: string;
  workplace_application: string;
}

export interface ProfileProposalResponse {
  trace_id: string;
  experience: ApiExperienceSummary;
  card_proposals: ApiCardProposal[];
  next_question: string;
  notice: string;
}

export interface ApiProfileCard extends ApiCardProposal {
  status: 'confirmed';
  source_trace_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileCardsResponse {
  version: number;
  updated_at?: string | null;
  cards: ApiProfileCard[];
  notice: string;
}

export interface ProfileCardPatchRequest {
  title?: string;
  description?: string;
  detail?: string;
  workplace_application?: string;
}
