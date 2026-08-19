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
  next_task_id: 'A-02';
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
}

export interface ApiTrialEvaluationDimension {
  dimension: string;
  score: number;
  evidence: string;
}

export interface ApiTrialEvaluation {
  summary: string;
  dimensions: ApiTrialEvaluationDimension[];
  strengths: string[];
  gaps: string[];
  next_step: string;
  confidence: TrialConfidence;
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
