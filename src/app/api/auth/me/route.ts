import { z } from "zod";
import { fromOtherSite, json, jsonError, needUser, readBody } from "@/lib/server/api";
import { getViewer, publicViewer } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { vnDay } from "@/lib/server/quota";

/** Who is signed in, and (for members) today's AI use. */
export async function GET() {
  const viewer = await getViewer();
  const out = publicViewer(viewer);
  if (viewer.kind !== "member" && viewer.kind !== "admin") return json(out);
  const db = (await getDb())!;
  const usage = await db
    .prepare("SELECT feature, level, count FROM ai_usage WHERE user_id = ? AND day = ?")
    .bind(viewer.user.id, vnDay())
    .all<{ feature: string; level: string; count: number }>();
  return json({
    ...out,
    user: { ...out.user, created_at: viewer.user.created_at },
    usage: usage.results,
  });
}

const patch = z.object({ name: z.string().trim().max(60) });

/** Changes the display name. */
export async function PATCH(request: Request) {
  if (fromOtherSite(request)) return jsonError(403, "Forbidden");
  const ctx = await needUser();
  if (ctx instanceof Response) return ctx;
  const data = await readBody(request, patch);
  if (!data) return jsonError(400, "Tên không hợp lệ.");
  await ctx.db.prepare("UPDATE users SET name = ? WHERE id = ?").bind(data.name, ctx.user.id).run();
  return json({ ok: true });
}
