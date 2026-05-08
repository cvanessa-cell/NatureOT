export type ResultCategory =
  | "sensory_regulation"
  | "motor_coordination"
  | "attention_executive"
  | "social_participation"
  | "school_readiness"
  | "emotional_regulation"
  | "outdoor_confidence";

export interface QuizQuestion {
  id: string;
  category: ResultCategory;
  prompt: string;
  options: { label: string; value: number }[];
}

export interface EmailStep {
  dayOffset: number;
  subject: string;
  bodyHtml: string;
}

export interface LeadPayload {
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  childAgeRange: string;
  cityOrZip: string;
  mainConcern: string;
  consentMarketing: boolean;
  consentPrivacy: boolean;
  quizAnswers: { questionId: string; category: ResultCategory; value: number }[];
  primaryCategory: ResultCategory;
  scores: Record<ResultCategory, number>;
  sessionId?: string;
  referralCode?: string;
}
