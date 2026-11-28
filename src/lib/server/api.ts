import "server-only";
import { z } from "zod";
import { getViewer, type User } from "./auth";
import { getDb, type SqlDb } from "./db";

export function jsonError(status: number, error: string) {
  return Response.json({ error }, { status, headers: { "cache-control": "no-store" } });
}

export function json(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, { ...init, headers: { "cache-control": "no-store", ...init.headers } });
}

/** Rejects calls from other websites (browsers always send this header). */
export function fromOtherSite(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  return site !== null && site !== "same-origin" && site !== "none";
}

export async function readBody<T>(request: Request, schema: z.ZodType<T>): Promise<T | null> {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  return parsed.success ? parsed.data : null;
}

export const NO_ACCOUNTS = "Trang web chưa bật tài khoản.";

/** The database, or an error response when accounts are not set up. */
export async function needDb(): Promise<SqlDb | Response> {
  return (await getDb()) ?? jsonError(503, NO_ACCOUNTS);
}

/** The signed-in user (and the database), or an error response. */
export async function needUser(opts: { admin?: boolean } = {}): Promise<{ db: SqlDb; user: User } | Response> {
  const db = await getDb();
  if (!db) return jsonError(503, NO_ACCOUNTS);
  const viewer = await getViewer();
  if (viewer.kind !== "member" && viewer.kind !== "admin") return jsonError(401, "Bạn cần đăng nhập.");
  if (opts.admin && viewer.kind !== "admin") return jsonError(403, "Chỉ quản trị viên mới xem được.");
  return { db, user: viewer.user };
}
