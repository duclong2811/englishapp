// The app's rules for AI use, in one place. docs/ai-policy.md explains them;
// the API routes read models and limits from here. Change the rules here,
// not in the routes.

export type PolicyLevel = "A1" | "A2" | "B1" | "B2";

/** Every paid AI call the app can make. */
export type AiFeature =
  /** The AI partner's replies in speaking practice (role-play and free chat). */
  | "speak-chat"
  /** Feedback after a speaking session. */
  | "speak-feedback"
  /** Grading an open writing answer in tests. */
  | "write-check"
  /** Grading an open spoken answer (after speech recognition) in tests. */
  | "talk-check";

export const AI_FEATURE_VI: Record<AiFeature, string> = {
  "speak-chat": "Trò chuyện với AI",
  "speak-feedback": "Nhận xét buổi nói",
  "write-check": "Chấm bài viết",
  "talk-check": "Chấm bài nói",
};

/** Model tiers. The exact model of each tier can be changed with an environment variable. */
export const MODEL_TIERS = {
  /** Short, well-framed jobs: grading A1–A2 answers, simple replies. */
  light: { model: "claude-haiku-5-5", env: "AI_LIGHT_MODEL" },
  /** Judgement and explanation: B1–B2 writing, session feedback. */
  standard: { model: "claude-sonnet-5-5", env: "AI_STANDARD_MODEL" },
} as const;

export type Tier = keyof typeof MODEL_TIERS;

type Rule = {
  /** null: no AI at this level; the app grades with answer keys and rubrics instead. */
  tier: Tier | null;
  effort: "low" | "medium";
  /** Ceiling for the whole reply, thinking included. */
  maxTokens: number;
  /** Calls per learner per day. Ads can add AD_BONUS more, up to AD_MAX_BONUS a day. */
  daily: number;
};

/**
 * Target rules. A1–A2 writing and speaking are graded with answer keys and
 * rubrics (no AI); until those keys are written, INTERIM_AI keeps the light
 * model on so the tests still work.
 */
export const AI_RULES: Record<AiFeature, Record<PolicyLevel, Rule>> = {
  "write-check": {
    A1: { tier: null, effort: "low", maxTokens: 3000, daily: 3 },
    A2: { tier: null, effort: "low", maxTokens: 3000, daily: 3 },
    B1: { tier: "standard", effort: "low", maxTokens: 4000, daily: 5 },
    B2: { tier: "standard", effort: "medium", maxTokens: 6000, daily: 2 },
  },
  "talk-check": {
    A1: { tier: null, effort: "low", maxTokens: 3000, daily: 3 },
    A2: { tier: null, effort: "low", maxTokens: 3000, daily: 3 },
    B1: { tier: "standard", effort: "low", maxTokens: 4000, daily: 5 },
    B2: { tier: "standard", effort: "medium", maxTokens: 6000, daily: 2 },
  },
  "speak-chat": {
    A1: { tier: "light", effort: "low", maxTokens: 1500, daily: 3 },
    A2: { tier: "light", effort: "low", maxTokens: 1500, daily: 3 },
    B1: { tier: "light", effort: "low", maxTokens: 2000, daily: 3 },
    B2: { tier: "standard", effort: "low", maxTokens: 2000, daily: 2 },
  },
  "speak-feedback": {
    A1: { tier: "light", effort: "low", maxTokens: 6000, daily: 3 },
    A2: { tier: "light", effort: "low", maxTokens: 6000, daily: 3 },
    B1: { tier: "standard", effort: "low", maxTokens: 8000, daily: 3 },
    B2: { tier: "standard", effort: "medium", maxTokens: 8000, daily: 2 },
  },
};

/** Watching one ad adds this many calls of a feature… */
export const AD_BONUS = 1;
/** …at most this many times a day per feature. */
export const AD_MAX_BONUS = 3;

/** Answers longer than this are refused before any AI call (characters). */
export const MAX_ANSWER_CHARS = { A1: 400, A2: 600, B1: 1200, B2: 1800 } as const;

/** Temporary: A1–A2 open answers still go to the light model until their rubrics exist. */
export const INTERIM_AI: Partial<Record<AiFeature, Tier>> = { "write-check": "light", "talk-check": "light" };

export type AiPlan = { model: string; effort: Rule["effort"]; maxTokens: number; daily: number };

/**
 * Which model a call may use, or null when the policy says this is graded
 * without AI. `env` holds the deployment's variables (model overrides).
 */
export function planFor(feature: AiFeature, level: PolicyLevel, env: { AI_LIGHT_MODEL?: string; AI_STANDARD_MODEL?: string } = {}): AiPlan | null {
  const rule = AI_RULES[feature][level];
  const tier = rule.tier ?? INTERIM_AI[feature] ?? null;
  if (!tier) return null;
  const { model, env: key } = MODEL_TIERS[tier];
  return { model: env[key] || model, effort: rule.effort, maxTokens: rule.maxTokens, daily: rule.daily };
}

/** Levels without their own rules use the nearest one (C1, C2 → B2). */
export function policyLevel(level: string): PolicyLevel {
  return (["A1", "A2", "B1", "B2"] as const).find((l) => l === level) ?? "B2";
}

/** Speech recognition (read aloud, speaking): cheap, but capped per member per day to stop abuse. */
export const TRANSCRIBE_DAILY = 300;

/** Shown to the learner, per feature. */
export const AI_LIMIT_VI: Record<AiFeature | "transcribe", string> = {
  "speak-chat": "buổi trò chuyện với AI",
  "speak-feedback": "lượt nhận xét buổi nói",
  "write-check": "lượt chấm bài viết",
  "talk-check": "lượt chấm bài nói",
  transcribe: "lượt nhận giọng nói",
};
