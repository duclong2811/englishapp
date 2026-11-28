import { z } from "zod";
import { fromOtherSite, json, jsonError, needUser } from "@/lib/server/api";
import { mergeValues, SYNC_KEYS } from "@/lib/sync/merge";

const MAX_BYTES = 1_500_000;
const body = z.object({ values: z.record(z.string(), z.string()) });

/**
 * Syncs learning progress: the browser sends what it has, the server merges it
 * with what other devices sent, stores the result and returns it.
 */
export async function POST(request: Request) {
  if (fromOtherSite(request)) return jsonError(403, "Forbidden");
  const ctx = await needUser();
  if (ctx instanceof Response) return ctx;
  const text = await request.text();
  if (text.length > MAX_BYTES) return jsonError(413, "Dữ liệu tiến độ quá lớn.");
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return jsonError(400, "Dữ liệu không hợp lệ.");
  }
  const parsed = body.safeParse(raw);
  if (!parsed.success) return jsonError(400, "Dữ liệu không hợp lệ.");

  const stored = await ctx.db
    .prepare("SELECT key, value FROM progress WHERE user_id = ?")
    .bind(ctx.user.id)
    .all<{ key: string; value: string }>();
  const server = new Map(stored.results.map((r) => [r.key, r.value]));
  const now = new Date().toISOString();
  const values: Record<string, string> = {};
  for (const key of SYNC_KEYS) {
    const local = parsed.data.values[key];
    const remote = server.get(key);
    if (local === undefined && remote === undefined) continue;
    const merged = mergeValues(key, remote, local);
    values[key] = merged;
    if (merged !== remote) {
      await ctx.db
        .prepare(
          "INSERT INTO progress (user_id, key, value, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT (user_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
        )
        .bind(ctx.user.id, key, merged, now)
        .run();
    }
  }
  return json({ values });
}
