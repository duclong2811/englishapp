import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Minimal shape of the Workers AI binding we use. */
type AiBinding = { run: (model: string, input: Record<string, unknown>) => Promise<unknown> };

type SpeakEnv = {
  AI?: AiBinding;
  ANTHROPIC_API_KEY?: string;
  SPEAK_CHAT_MODEL?: string;
  SPEAK_FEEDBACK_MODEL?: string;
};

/** Cloudflare bindings and secrets in production; process.env in plain `next start`/`next dev`. */
export function speakEnv(): SpeakEnv {
  let cf: Record<string, unknown> = {};
  try {
    cf = getCloudflareContext().env as unknown as Record<string, unknown>;
  } catch {
    // not running on Cloudflare
  }
  const pick = (k: string) => (cf[k] as string | undefined) ?? process.env[k];
  return {
    AI: cf.AI as AiBinding | undefined,
    ANTHROPIC_API_KEY: pick("ANTHROPIC_API_KEY"),
    SPEAK_CHAT_MODEL: pick("SPEAK_CHAT_MODEL"),
    SPEAK_FEEDBACK_MODEL: pick("SPEAK_FEEDBACK_MODEL"),
  };
}

export const DEFAULT_MODEL = "claude-opus-5-5";

export function anthropic(env: SpeakEnv) {
  if (!env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}

export const WHISPER_MODEL = "@cf/openai/whisper-large-v3-turbo";

export function jsonError(status: number, error: string) {
  return Response.json({ error }, { status });
}
