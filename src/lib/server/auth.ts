import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import { getDb, type SqlDb } from "./db";

export type Role = "member" | "admin";
export type User = { id: number; email: string; name: string; role: Role; status: "active" | "locked"; created_at: string; last_login_at: string | null };

/**
 * Who is using the app:
 * - open: no accounts database is configured; the app behaves as before (AI not gated);
 * - guest: not signed in; AI features are off;
 * - member: signed in; AI within daily limits;
 * - admin: signed in as administrator; no limits.
 */
export type Viewer = { kind: "open" } | { kind: "guest" } | { kind: "member" | "admin"; user: User };

export const SESSION_COOKIE = "vta_session";
const SESSION_DAYS = 30;
/** PBKDF2 rounds. Kept modest so sign-in fits the Workers CPU budget; stored with each hash so it can be raised later. */
export const PBKDF2_ROUNDS = 60_000;

/** A deployment variable (Cloudflare) or process.env (local). */
export function serverVar(name: string): string | undefined {
  try {
    const v = (getCloudflareContext().env as unknown as Record<string, unknown>)[name];
    if (typeof v === "string") return v;
  } catch {
    // not on Cloudflare
  }
  return process.env[name];
}

const enc = new TextEncoder();
const toB64 = (bytes: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200;
}

async function pbkdf2(password: string, salt: Uint8Array, rounds: number) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: rounds }, key, 256);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const bits = await pbkdf2(password, salt, PBKDF2_ROUNDS);
  return { hash: `pbkdf2$${PBKDF2_ROUNDS}$${toB64(bits)}`, salt: toB64(salt) };
}

export async function verifyPassword(password: string, hash: string, salt: string) {
  const [scheme, rounds, expected] = hash.split("$");
  if (scheme !== "pbkdf2" || !rounds || !expected) return false;
  const bits = toB64(await pbkdf2(password, fromB64(salt), Number(rounds)));
  // Constant-time comparison.
  if (bits.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < bits.length; i++) diff |= bits.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

async function sha256(text: string) {
  return toB64(await crypto.subtle.digest("SHA-256", enc.encode(text)));
}

/** Emails listed in ADMIN_EMAILS (comma-separated) become administrators when they register or sign in. */
export function isAdminEmail(email: string) {
  return (serverVar("ADMIN_EMAILS") ?? "")
    .split(",")
    .map((e) => normalizeEmail(e))
    .filter(Boolean)
    .includes(normalizeEmail(email));
}

/** Starts a session and sets its cookie. */
export async function startSession(db: SqlDb, userId: number) {
  const token = toB64(crypto.getRandomValues(new Uint8Array(32)));
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 86_400_000);
  await db
    .prepare("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .bind(await sha256(token), userId, expires.toISOString(), now.toISOString())
    .run();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function endSession(db: SqlDb) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
  jar.delete(SESSION_COOKIE);
}

const USER_COLUMNS = "id, email, name, role, status, created_at, last_login_at";

export async function findUserByEmail(db: SqlDb, email: string) {
  return db
    .prepare(`SELECT ${USER_COLUMNS}, password_hash, password_salt FROM users WHERE email = ?`)
    .bind(normalizeEmail(email))
    .first<User & { password_hash: string; password_salt: string }>();
}

export async function findUser(db: SqlDb, id: number) {
  return db.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`).bind(id).first<User>();
}

/** The signed-in user from the session cookie, if the session is valid and the account active. */
export async function sessionUser(db: SqlDb): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = await db
    .prepare(
      `SELECT u.${USER_COLUMNS.split(", ").join(", u.")}, s.expires_at AS expires FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?`,
    )
    .bind(await sha256(token))
    .first<User & { expires: string }>();
  if (!row || row.expires < new Date().toISOString() || row.status !== "active") return null;
  const { expires: _expires, ...user } = row;
  void _expires;
  return user;
}

export async function getViewer(): Promise<Viewer> {
  const db = await getDb();
  if (!db) return { kind: "open" };
  const user = await sessionUser(db);
  if (!user) return { kind: "guest" };
  return { kind: user.role === "admin" ? "admin" : "member", user };
}

/** What the browser may know about the viewer. */
export function publicViewer(v: Viewer) {
  if (v.kind === "open" || v.kind === "guest") return { kind: v.kind } as const;
  return { kind: v.kind, user: { id: v.user.id, email: v.user.email, name: v.user.name, role: v.user.role } } as const;
}

/** Counts attempts per key per hour (failed sign-ins per email, sign-ups per address). */
export async function attemptsThisHour(db: SqlDb, key: string) {
  const hour = new Date().toISOString().slice(0, 13);
  const row = await db.prepare("SELECT count FROM login_attempts WHERE email = ? AND hour = ?").bind(key, hour).first<{ count: number }>();
  return row?.count ?? 0;
}

export async function recordAttempt(db: SqlDb, key: string) {
  const hour = new Date().toISOString().slice(0, 13);
  await db
    .prepare("INSERT INTO login_attempts (email, hour, count) VALUES (?, ?, 1) ON CONFLICT (email, hour) DO UPDATE SET count = count + 1")
    .bind(key, hour)
    .run();
}

export const MAX_LOGIN_FAILS_PER_HOUR = 10;
export const MAX_SIGNUPS_PER_HOUR = 5;
export const PASSWORD_MIN = 8;

/** The address a request came from (Cloudflare sets this header). */
export function clientIp(request: Request) {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

/** Signs out every session of a user (after a password change or reset, or when locked). */
export async function endAllSessions(db: SqlDb, userId: number) {
  await db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId).run();
}
