export interface ProfileProposalRequest {
  experience_text: string;
  experience_id?: string;
  target_role?: string;
  existing_card_titles?: string[];
}

export type ProfileExplorationFocus =
  | 'ownership'
  | 'decision'
  | 'constraint'
  | 'collaboration'
  | 'result'
  | 'transfer'
  | 'evidence';

export type ProfileStarDimension = 'S' | 'T' | 'A' | 'R';

export interface ProfileExplorationMessage {
  role: 'user' | 'assistant';
  content: string;
  reasoning_content?: string;
  thinking_enabled?: boolean;
  thinking_model?: string | null;
  reasoning_tokens?: number | null;
  reasoning_status?: 'disabled' | 'streaming' | 'complete' | 'unavailable';
}

export type ProfileModelTier = 'fast' | 'balanced' | 'comprehensive' | 'thinking' | 'reasoning';

export interface ProfileExplorationRequest {
  experience_text: string;
  messages: ProfileExplorationMessage[];
  target_role?: string;
  existing_card_titles?: string[];
  request_id?: string;
  model_tier?: ProfileModelTier;
  round_number?: number;
  star_history?: ProfileStarDimension[];
  stop_requested?: boolean;
  /**
   * After the four STAR prompts, users may keep adding facts to the same
   * experience. This mode acknowledges the supplement without opening a
   * fifth guided question; card generation remains an explicit user action.
   */
  supplement_only?: boolean;
}

export interface ProfileExplorationResponse {
  trace_id: string;
  reply: string;
  focus_dimension: ProfileExplorationFocus;
  evidence_found: string[];
  evidence_gap: string;
  potential_hypotheses: string[];
  suggested_replies: string[];
  ready_for_proposal: boolean;
  model?: string | null;
  model_pool?: string | null;
  cache_hit: boolean;
  notice: string;
  star_dimension?: ProfileStarDimension;
  round_number?: number;
  next_action?: 'ask' | 'summarize';
  finalization_reason?: string | null;
  reasoning_content?: string;
  thinking_enabled?: boolean;
  thinking_model?: string | null;
  reasoning_tokens?: number | null;
  reasoning_status?: 'disabled' | 'streaming' | 'complete' | 'unavailable';
}

export interface ProfileConversationSnapshotMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp?: string;
  detected_signals?: string[];
  suggested_replies?: string[];
  model?: string | null;
  cache_hit?: boolean | null;
  star_dimension?: ProfileStarDimension | null;
  reasoning_content?: string;
  thinking_enabled?: boolean;
  thinking_model?: string | null;
  reasoning_tokens?: number | null;
  reasoning_status?: 'disabled' | 'streaming' | 'complete' | 'unavailable';
}

export interface ProfileConversationMaterial {
  name: string;
  size?: string;
  type: 'resume' | 'portfolio' | 'link';
  server_file_id?: string | null;
}

export interface ProfileConversationSnapshotUpsert {
  title: string;
  messages: ProfileConversationSnapshotMessage[];
  evidence?: string;
  materials?: ProfileConversationMaterial[];
  target_career_state?: 'unselected' | 'has_target' | 'no_target';
  target_role?: string;
  model_tier?: ProfileModelTier;
}

export interface ProfileConversationSnapshot extends ProfileConversationSnapshotUpsert {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialExtractResponse {
  file_name: string;
  text: string;
  char_count: number;
  truncated: boolean;
  stored_material_id: string;
  notice: string;
}

export interface AttachmentExperienceCandidate {
  id: string;
  title: string;
  excerpt: string;
  why_worth_exploring: string;
  suggested_focus: ProfileStarDimension;
  source_refs: string[];
}

export interface MaterialUnderstandingRequest {
  file_name: string;
  text: string;
  stored_material_id?: string | null;
}

export interface MaterialUnderstandingResponse {
  trace_id: string;
  file_name: string;
  summary: string;
  experience_candidates: AttachmentExperienceCandidate[];
  suggested_action: 'explore' | 'generate';
  model?: string | null;
  model_pool?: string | null;
  cache_hit: boolean;
  notice: string;
}

export interface MultimodalEvidenceItem {
  id: string;
  source_ref: string;
  page: number;
  bbox: [number, number, number, number];
  coordinate_space: 'normalized_1000';
  label: string;
  quote: string;
  evidence_type: 'documented_fact' | 'self_report' | 'inference';
  confidence: number;
  status: 'candidate' | 'confirmed' | 'rejected';
}

export interface MultimodalEvidenceResponse {
  file_name: string;
  file_sha256: string;
  mime_type: string;
  page_count: number;
  model: string;
  items: MultimodalEvidenceItem[];
  rejected_count: number;
  stored_material_id?: string | null;
  notice: string;
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
  experience_id?: string | null;
  resolution?: 'new' | 'merge';
  merge_target_card_id?: string | null;
  evidence_history?: Array<{
    experience_id: string;
    evidence_quote: string;
    source_refs: string[];
    trace_id?: string | null;
  }>;
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

export interface ApiProfileEvidence {
  session_id: string;
  task_id: string;
  created_at: string;
  observed_evidence: ApiObservedEvidence;
  evaluation?: ApiTrialEvaluation | null;
}

export interface ProfileOverviewResponse extends ProfileCardsResponse {
  evidence: ApiProfileEvidence[];
  completed_task_ids: string[];
}

export interface ProfileCardPatchRequest {
  title?: string;
  description?: string;
  detail?: string;
  workplace_application?: string;
}

export interface CareerRecommendationRequest {
  selected_card_ids: string[];
  target_role?: 'AI 产品经理';
}

export interface ApiCareerCitation {
  id: string;
  document_title: string;
  source_locator: string;
  content: string;
  trust_level: string;
  source_note: string;
}

export interface ApiCareerSupport {
  claim: string;
  card_ids: string[];
  citation_ids: string[];
}

export interface ApiCareerRecommendation {
  role_id: 'ai_product_manager';
  role_title: 'AI 产品经理';
  summary: string;
  supported: ApiCareerSupport[];
  unknowns: string[];
  next_task_id: TrialTaskId;
  next_task_title: string;
  next_task_reason: string;
  confidence: '低' | '中' | '高';
  citations: ApiCareerCitation[];
  notice: string;
}

export type TrialAttributionLayer =
  | 'Prompt / 指令层'
  | 'Model / 基础模型能力'
  | 'RAG / Retrieval'
  | 'Tool / 权限与调用'
  | 'Memory / 长期状态'
  | 'Workflow / 任务编排'
  | 'Interaction / UI 与用户控制'
  | 'Safety / 事实与风险机制'
  | '暂无法判断';

export type TrialConfidence = '低' | '中' | '高';
export type TrialTaskId =
  | 'F-01' | 'F-02' | 'F-03'
  | 'A-01' | 'A-02' | 'A-03'
  | 'P-01' | 'P-02' | 'P-03'
  | 'M-01' | 'M-02' | 'M-03';

export interface ApiA02Metric {
  id: string;
  label: string;
  current: string;
  previous: string;
}

export interface ApiA02BadCase {
  id: string;
  title: string;
  description: string;
}

export interface ApiA02CoachPrompt {
  level: string;
  title: string;
  content: string;
}

export interface ApiA02RubricCriterion {
  dimension: string;
  weight: number;
  observable_behavior: string;
}

export interface ApiA02Task {
  id: 'A-02';
  title: string;
  subtitle: string;
  role_type: string;
  work_stage: string;
  primary_skill: string;
  supporting_skills: string[];
  estimated_minutes: string;
  difficulty: string;
  role: string;
  background: string;
  goal: string;
  metrics: ApiA02Metric[];
  bad_cases: ApiA02BadCase[];
  attribution_layers: string[];
  constraints: string[];
  event: {
    actor: string;
    message: string;
    instruction: string;
  };
  coach_prompts: ApiA02CoachPrompt[];
  rubric: ApiA02RubricCriterion[];
  source_note: string;
}

export interface ApiA02Attribution {
  case_id: string;
  layer: TrialAttributionLayer;
  confidence: TrialConfidence;
}

export interface ApiA02EvidenceReference {
  source_id: string;
  source_type: 'case' | 'metric';
  explanation: string;
}

export interface ApiA02ValidationPlan {
  case_id: string;
  action: string;
  expected_signal: string;
}

export interface ApiA02Answer {
  attributions: ApiA02Attribution[];
  priority_case_ids: string[];
  evidence: ApiA02EvidenceReference[];
  validation_plans: ApiA02ValidationPlan[];
  event_decision?: '维持' | '调整' | null;
  event_priority_case_ids: string[];
  event_reason: string;
}

export interface ApiObservedEvidence {
  task_id: string;
  statement: string;
  completed_steps: string[];
  evidence_refs: string[];
  caveats: string[];
  evidence_items?: ApiTrialEvidenceItem[];
  selected_card_ids?: string[];
  primary_ability?: string | null;
  observed_level?: 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | '证据不足' | null;
  level_reason?: string | null;
  confidence?: TrialConfidence | null;
  coach_dependency?: '独立完成' | '轻度提示' | '方向性提示' | '强提示' | null;
}

export interface ApiTrialEvidenceItem {
  id: string;
  source: 'ability_card' | 'card_play' | 'answer' | 'material' | 'event' | 'coach';
  source_id: string;
  kind: 'planned' | 'observed' | 'deliverable' | 'reference' | 'interaction';
  label: string;
  content: string;
}

export interface ApiTrialAbilityApplication {
  card_id: string;
  card_title: string;
  challenge_ids: string[];
  evidence_refs: string[];
  status: '已应用' | '部分应用' | '未形成证据';
  basis: string;
  next_step: string;
}

export interface ApiTrialEvaluationDimension {
  dimension: string;
  weight: number;
  score: number;
  evidence: string;
  evidence_refs?: string[];
}

export interface ApiTrialVerification {
  status: 'accepted' | 'needs_review' | 'repaired';
  triggered: boolean;
  reason_codes: string[];
  evidence_coverage: number;
  invalid_evidence_ref_count: number;
  missing_dimension_count: number;
  score_without_evidence_count: number;
  model_reviewed: boolean;
  review_summary: string;
}

export interface ApiTrialEvaluation {
  summary: string;
  dimensions: ApiTrialEvaluationDimension[];
  primary_ability: string;
  observed_level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | '证据不足';
  level_reason: string;
  supporting_evidence: Array<{
    ability: string;
    observed_level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | '证据不足';
    evidence: string;
    evidence_refs?: string[];
  }>;
  process_evidence: string[];
  coach_dependency: '独立完成' | '轻度提示' | '方向性提示' | '强提示';
  strengths: string[];
  gaps: string[];
  next_step: string;
  confidence: TrialConfidence;
  evidence_refs?: string[];
  ability_applications?: ApiTrialAbilityApplication[];
  verification?: ApiTrialVerification | null;
  evaluation_protocol?: string;
}

export interface ApiTrialTaskStep {
  id: string;
  title: string;
  input_mode: string;
  instruction: string;
  constraint: string;
}

export interface ApiTrialTaskMaterial {
  id: string;
  title: string;
  kind: 'feedback' | 'data' | 'capability' | 'constraint' | 'case';
  content: string;
  is_simulated: boolean;
}

export interface ApiTrialAbilityChallenge {
  id: string;
  title: string;
  scenario: string;
  prompt: string;
  target_skills: string[];
  reference_behavior: string;
  max_cards: number;
}

export interface ApiTrialTaskDefinition {
  id: TrialTaskId;
  track: 'feature' | 'agent' | 'platform' | 'model';
  title: string;
  subtitle: string;
  role_type: string;
  work_stage: string;
  primary_skill: string;
  supporting_skills: string[];
  estimated_minutes: string;
  difficulty: string;
  role: string;
  background: string;
  goal: string;
  constraints: string[];
  materials: ApiTrialTaskMaterial[];
  steps: ApiTrialTaskStep[];
  event: { actor: string; message: string; instruction: string };
  coach_prompts: string[];
  rubric: ApiA02RubricCriterion[];
  ability_challenges: ApiTrialAbilityChallenge[];
  level_anchors: Record<'L1' | 'L2' | 'L3' | 'L4' | 'L5', string>;
  source_note: string;
}

export interface ApiDynamicTrialCoachUsage {
  level: 1 | 2 | 3;
  prompt: string;
  used_at: string;
  model?: string | null;
  model_pool?: string | null;
  cache_hit?: boolean;
  generation_mode?: 'model' | 'preset_fallback';
}

export interface ApiDynamicTrialCardPlayRound {
  challenge_id: string;
  selected_card_ids: string[];
  match_level?: 'high' | 'partial' | 'low' | null;
  matched_card_ids: string[];
  matched_skills: string[];
  feedback: string;
}

export interface ApiDynamicTrialPendingAbility {
  id: string;
  challenge_id: string;
  title: string;
  description: string;
  target_skills: string[];
  status: 'pending';
}

export interface ApiDynamicTrialAnswer {
  selected_card_ids: string[];
  card_play_rounds: ApiDynamicTrialCardPlayRound[];
  card_play_current_index: number;
  card_play_rationale: string;
  pending_abilities: ApiDynamicTrialPendingAbility[];
  validation_hypothesis: string;
  card_play_completed: boolean;
  step_answers: Record<string, string>;
  viewed_material_ids: string[];
  evidence_refs: string[];
  step_revisions: Record<string, number>;
  coach_usage: ApiDynamicTrialCoachUsage[];
  event_decision?: '维持' | '调整' | null;
  event_response: string;
}

export interface ApiDynamicTrialSession {
  id: string;
  task_id: TrialTaskId;
  status: 'in_progress' | 'submitted';
  event_revealed: boolean;
  answer: ApiDynamicTrialAnswer;
  created_at: string;
  updated_at: string;
  submitted_at?: string | null;
  observed_evidence?: ApiObservedEvidence | null;
  evaluation?: ApiTrialEvaluation | null;
}

export interface ApiTrialSession {
  id: string;
  task_id: 'A-02';
  status: 'in_progress' | 'submitted';
  event_revealed: boolean;
  answer: ApiA02Answer;
  created_at: string;
  updated_at: string;
  submitted_at?: string | null;
  observed_evidence?: ApiObservedEvidence | null;
  evaluation?: ApiTrialEvaluation | null;
}
