import { json, needUser } from "@/lib/server/api";
import { vnDay } from "@/lib/server/quota";

const PAGE = 50;

/** Users, newest first, with today's AI use. ?q= searches email and name. */
export async function GET(request: Request) {
  const ctx = await needUser({ admin: true });
  if (ctx instanceof Response) return ctx;
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase().slice(0, 100);
  const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);
  const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const rows = await ctx.db
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, u.status, u.created_at, u.last_login_at,
        COALESCE((SELECT SUM(count) FROM ai_usage a WHERE a.user_id = u.id AND a.day = ?), 0) AS ai_today
       FROM users u WHERE (? = '' OR lower(u.email) LIKE ? ESCAPE '\\' OR lower(u.name) LIKE ? ESCAPE '\\')
       ORDER BY u.id DESC LIMIT ? OFFSET ?`,
    )
    .bind(vnDay(), q, like, like, PAGE + 1, offset)
    .all();
  return json({ users: rows.results.slice(0, PAGE), more: rows.results.length > PAGE, offset });
}
