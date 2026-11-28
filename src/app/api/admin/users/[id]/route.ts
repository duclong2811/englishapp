import { z } from "zod";
import { fromOtherSite, json, jsonError, needUser, readBody } from "@/lib/server/api";
import { endAllSessions, findUser, hashPassword } from "@/lib/server/auth";
import { vnDay } from "@/lib/server/quota";

const body = z.object({
  role: z.enum(["member", "admin"]).optional(),
  status: z.enum(["active", "locked"]).optional(),
  resetPassword: z.literal(true).optional(),
});

/** Readable temporary password: no 0/O or 1/l. */
function tempPassword() {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => chars[b % chars.length]).join("");
}

/** Changes a user's role or status, or resets their password (the new one is shown once). */
export async function PATCH(request: Request, ctxRoute: RouteContext<"/api/admin/users/[id]">) {
  if (fromOtherSite(request)) return jsonError(403, "Forbidden");
  const ctx = await needUser({ admin: true });
  if (ctx instanceof Response) return ctx;
  const id = Number((await ctxRoute.params).id);
  const data = await readBody(request, body);
  if (!Number.isInteger(id) || !data) return jsonError(400, "Dữ liệu không hợp lệ.");
  const target = await findUser(ctx.db, id);
  if (!target) return jsonError(404, "Không tìm thấy người dùng.");
  if (id === ctx.user.id && (data.role === "member" || data.status === "locked")) {
    return jsonError(400, "Bạn không thể tự hạ quyền hoặc tự khóa mình.");
  }

  if (data.role) await ctx.db.prepare("UPDATE users SET role = ? WHERE id = ?").bind(data.role, id).run();
  if (data.status) {
    await ctx.db.prepare("UPDATE users SET status = ? WHERE id = ?").bind(data.status, id).run();
    if (data.status === "locked") await endAllSessions(ctx.db, id);
  }
  let password: string | undefined;
  if (data.resetPassword) {
    password = tempPassword();
    const { hash, salt } = await hashPassword(password);
    await ctx.db.prepare("UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?").bind(hash, salt, id).run();
    await endAllSessions(ctx.db, id);
  }
  return json({ user: await findUser(ctx.db, id), password });
}

/** One learner: account, synced progress, and 14 days of AI use and cost. */
export async function GET(_request: Request, ctxRoute: RouteContext<"/api/admin/users/[id]">) {
  const ctx = await needUser({ admin: true });
  if (ctx instanceof Response) return ctx;
  const id = Number((await ctxRoute.params).id);
  const user = Number.isInteger(id) ? await findUser(ctx.db, id) : null;
  if (!user) return jsonError(404, "Không tìm thấy người dùng.");
  const since = vnDay(new Date(Date.now() - 13 * 86_400_000));
  const [progress, stats, usage, cost] = await Promise.all([
    ctx.db.prepare("SELECT key, value, updated_at FROM progress WHERE user_id = ?").bind(id).all<{ key: string; value: string; updated_at: string }>(),
    ctx.db.prepare("SELECT words, lessons, tests, active_at FROM user_stats WHERE user_id = ?").bind(id).first(),
    ctx.db
      .prepare("SELECT day, feature, level, count FROM ai_usage WHERE user_id = ? AND day >= ? ORDER BY day")
      .bind(id, since)
      .all(),
    ctx.db
      .prepare("SELECT day, feature, model, input_tokens, output_tokens, micro_usd FROM ai_cost WHERE user_id = ? AND day >= ? ORDER BY day")
      .bind(id, since)
      .all(),
  ]);
  return json({
    user,
    stats,
    values: Object.fromEntries(progress.results.map((r) => [r.key, r.value])),
    syncedAt: progress.results.reduce<string | null>((a, r) => (!a || r.updated_at > a ? r.updated_at : a), null),
    usage: usage.results,
    cost: cost.results,
  });
}
