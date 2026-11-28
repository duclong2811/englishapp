import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/** The part of Cloudflare D1's API the app uses (tests provide the same over SQLite). */
export interface SqlStatement {
  bind(...values: unknown[]): SqlStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}
export interface SqlDb {
  prepare(sql: string): SqlStatement;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL,
    last_login_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)`,
  `CREATE TABLE IF NOT EXISTS ai_usage (
    user_id INTEGER NOT NULL,
    day TEXT NOT NULL,
    feature TEXT NOT NULL,
    level TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, day, feature, level)
  )`,
  `CREATE TABLE IF NOT EXISTS progress (
    user_id INTEGER NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (user_id, key)
  )`,
  `CREATE TABLE IF NOT EXISTS ai_cost (
    user_id INTEGER NOT NULL,
    day TEXT NOT NULL,
    feature TEXT NOT NULL,
    model TEXT NOT NULL,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    micro_usd INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, day, feature, model)
  )`,
  `CREATE TABLE IF NOT EXISTS user_stats (
    user_id INTEGER PRIMARY KEY,
    words INTEGER NOT NULL DEFAULT 0,
    lessons INTEGER NOT NULL DEFAULT 0,
    tests INTEGER NOT NULL DEFAULT 0,
    active_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
    email TEXT NOT NULL,
    hour TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (email, hour)
  )`,
];

const ready = new WeakSet<SqlDb>();

/** Creates the tables on first use, so a new D1 database needs no manual migration. */
export async function ensureSchema(db: SqlDb) {
  if (ready.has(db)) return;
  for (const sql of SCHEMA) await db.prepare(sql).run();
  ready.add(db);
}

let override: SqlDb | null | undefined;

/** Tests swap in their own database. */
export function setDbForTests(db: SqlDb | null | undefined) {
  override = db;
}

/**
 * The accounts database, or null when none is bound. Without a database the
 * app runs as before accounts existed: no sign-in, and AI is not gated.
 */
export async function getDb(): Promise<SqlDb | null> {
  let db: SqlDb | null = override ?? null;
  if (override === undefined) {
    try {
      db = ((getCloudflareContext().env as unknown as Record<string, unknown>).DB as SqlDb | undefined) ?? null;
    } catch {
      db = null;
    }
  }
  if (db) await ensureSchema(db);
  return db;
}
