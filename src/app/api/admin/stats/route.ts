import { json, needUser } from "@/lib/server/api";
import { vnDay } from "@/lib/server/quota";

/** Overview numbers for the admin page. */
export async function GET() {
  const ctx = await needUser({ admin: true });
  if (ctx instanceof Response) return ctx;
  const week = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const since = vnDay(new Date(Date.now() - 13 * 86_400_000));
  const users = await ctx.db
    .prepare(
      `SELECT COUNT(*) AS total,
        SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS new_week,
        SUM(CASE WHEN last_login_at >= ? THEN 1 ELSE 0 END) AS active_week,
        SUM(CASE WHEN status = 'locked' THEN 1 ELSE 0 END) AS locked,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS admins
       FROM users`,
    )
    .bind(week, week)
    .first<Record<string, number>>();
  const today = await ctx.db
    .prepare("SELECT feature, level, SUM(count) AS count, COUNT(DISTINCT user_id) AS users FROM ai_usage WHERE day = ? GROUP BY feature, level ORDER BY feature, level")
    .bind(vnDay())
    .all();
  const days = await ctx.db
    .prepare("SELECT day, SUM(count) AS count FROM ai_usage WHERE day >= ? AND feature != 'transcribe' GROUP BY day ORDER BY day")
    .bind(since)
    .all();
  return json({ users, today: today.results, days: days.results });
}
