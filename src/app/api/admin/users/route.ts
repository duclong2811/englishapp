import { json, needUser } from "@/lib/server/api";
import { vnDay } from "@/lib/server/quota";

const PAGE = 50;
const SORTS = {
  recent: "COALESCE(s.active_at, u.last_login_at, u.created_at) DESC",
  new: "u.id DESC",
  words: "COALESCE(s.words, 0) DESC, u.id DESC",
  ai: "ai_week DESC, u.id DESC",
  cost: "cost_week DESC, u.id DESC",
} as const;

/**
 * Users with their learning totals and last 7 days of AI use.
 * ?q= searches email and name; ?role=, ?status= filter; ?sort= orders.
 */
export async function GET(request: Request) {
  const ctx = await needUser({ admin: true });
  if (ctx instanceof Response) return ctx;
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase().slice(0, 100);
  const role = url.searchParams.get("role") ?? "";
  const status = url.searchParams.get("status") ?? "";
  const sortKey = (url.searchParams.get("sort") ?? "recent") as keyof typeof SORTS;
  const order = SORTS[sortKey] ?? SORTS.recent;
  const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);
  const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const week = vnDay(new Date(Date.now() - 6 * 86_400_000));
  const rows = await ctx.db
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, u.status, u.created_at, u.last_login_at,
        COALESCE(s.words, 0) AS words, COALESCE(s.lessons, 0) AS lessons, COALESCE(s.tests, 0) AS tests, s.active_at,
        COALESCE((SELECT SUM(count) FROM ai_usage a WHERE a.user_id = u.id AND a.day >= ? AND a.feature != 'transcribe'), 0) AS ai_week,
        COALESCE((SELECT SUM(micro_usd) FROM ai_cost c WHERE c.user_id = u.id AND c.day >= ?), 0) AS cost_week
       FROM users u LEFT JOIN user_stats s ON s.user_id = u.id
       WHERE (? = '' OR lower(u.email) LIKE ? ESCAPE '\\' OR lower(u.name) LIKE ? ESCAPE '\\')
         AND (? = '' OR u.role = ?) AND (? = '' OR u.status = ?)
       ORDER BY ${order} LIMIT ? OFFSET ?`,
    )
    .bind(week, week, q, like, like, role, role, status, status, PAGE + 1, offset)
    .all();
  return json({ users: rows.results.slice(0, PAGE), more: rows.results.length > PAGE, offset });
}
