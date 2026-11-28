import { z } from "zod";
import { fromOtherSite, json, jsonError, needUser, readBody } from "@/lib/server/api";
import { endAllSessions, findUserByEmail, hashPassword, PASSWORD_MIN, startSession, verifyPassword } from "@/lib/server/auth";

const body = z.object({ current: z.string().max(200), next: z.string().max(200) });

/** Changes the password and signs out other devices. */
export async function POST(request: Request) {
  if (fromOtherSite(request)) return jsonError(403, "Forbidden");
  const ctx = await needUser();
  if (ctx instanceof Response) return ctx;
  const data = await readBody(request, body);
  if (!data) return jsonError(400, "Dữ liệu không hợp lệ.");
  if (data.next.length < PASSWORD_MIN) return jsonError(400, `Mật khẩu mới cần ít nhất ${PASSWORD_MIN} ký tự.`);
  const full = (await findUserByEmail(ctx.db, ctx.user.email))!;
  if (!(await verifyPassword(data.current, full.password_hash, full.password_salt))) {
    return jsonError(400, "Mật khẩu hiện tại không đúng.");
  }
  const { hash, salt } = await hashPassword(data.next);
  await ctx.db.prepare("UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?").bind(hash, salt, ctx.user.id).run();
  await endAllSessions(ctx.db, ctx.user.id);
  await startSession(ctx.db, ctx.user.id);
  return json({ ok: true });
}
