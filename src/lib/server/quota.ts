import "server-only";
import { AI_LIMIT_VI, AI_RULES, TRANSCRIBE_DAILY, type AiFeature, type PolicyLevel } from "@/lib/ai/policy";
import { getViewer, type Viewer } from "./auth";
import { getDb, type SqlDb } from "./db";

export type GatedFeature = AiFeature | "transcribe";

/** Today in Vietnam (UTC+7): limits reset at midnight local time. */
export function vnDay(now = new Date()) {
  return new Date(now.getTime() + 7 * 3_600_000).toISOString().slice(0, 10);
}

export function dailyLimit(feature: GatedFeature, level: PolicyLevel) {
  return feature === "transcribe" ? TRANSCRIBE_DAILY : AI_RULES[feature][level].daily;
}

export async function usedToday(db: SqlDb, userId: number, feature: GatedFeature, level: PolicyLevel) {
  const row = await db
    .prepare("SELECT count FROM ai_usage WHERE user_id = ? AND day = ? AND feature = ? AND level = ?")
    .bind(userId, vnDay(), feature, level)
    .first<{ count: number }>();
  return row?.count ?? 0;
}

async function addUse(db: SqlDb, userId: number, feature: GatedFeature, level: PolicyLevel) {
  await db
    .prepare(
      "INSERT INTO ai_usage (user_id, day, feature, level, count) VALUES (?, ?, ?, ?, 1) ON CONFLICT (user_id, day, feature, level) DO UPDATE SET count = count + 1",
    )
    .bind(userId, vnDay(), feature, level)
    .run();
}

export type Gate =
  | { ok: true; viewer: Viewer; /** Counts one use; call once the AI call is going ahead. */ consume: () => Promise<void> }
  | { ok: false; status: 401 | 429; error: string };

/**
 * May this request use an AI feature? Guests may not; members within their
 * daily limit; administrators always. Without an accounts database everything
 * is allowed, as before accounts existed.
 */
export async function aiGate(feature: GatedFeature, level: PolicyLevel, opts: { count?: boolean } = {}): Promise<Gate> {
  const viewer = await getViewer();
  const count = opts.count ?? true;
  if (viewer.kind === "open") return { ok: true, viewer, consume: async () => {} };
  if (viewer.kind === "guest") return { ok: false, status: 401, error: "Đăng nhập để dùng các tính năng AI." };
  const db = (await getDb())!;
  const consume = count ? () => addUse(db, viewer.user.id, feature, level) : async () => {};
  if (viewer.kind === "admin") return { ok: true, viewer, consume };
  const limit = dailyLimit(feature, level);
  if (count && (await usedToday(db, viewer.user.id, feature, level)) >= limit) {
    return {
      ok: false,
      status: 429,
      error: `Bạn đã dùng hết ${limit} ${AI_LIMIT_VI[feature]} (${level}) hôm nay. Lượt mới có lúc 0 giờ.`,
    };
  }
  return { ok: true, viewer, consume };
}
