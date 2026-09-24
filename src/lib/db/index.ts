import "server-only";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });
const sqlite = new Database(process.env.DATABASE_URL ?? path.join(dataDir, "learn.db"));
sqlite.pragma("journal_mode = WAL");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS lesson_progress (lesson_id TEXT PRIMARY KEY, status TEXT NOT NULL DEFAULT 'available', position TEXT NOT NULL DEFAULT 'intro', percent INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS exercise_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, exercise_id TEXT NOT NULL, response TEXT, score REAL, self_rating INTEGER, created_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS mastery_results (id INTEGER PRIMARY KEY AUTOINCREMENT, lesson_id TEXT NOT NULL, skill_scores TEXT NOT NULL, passed INTEGER NOT NULL, created_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS review_cards (id TEXT PRIMARY KEY, objective_id TEXT NOT NULL, kind TEXT NOT NULL, due INTEGER NOT NULL, stability REAL NOT NULL, difficulty REAL NOT NULL, elapsed_days INTEGER NOT NULL, scheduled_days INTEGER NOT NULL, reps INTEGER NOT NULL, lapses INTEGER NOT NULL, state INTEGER NOT NULL, last_review INTEGER);
  CREATE TABLE IF NOT EXISTS review_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, card_id TEXT NOT NULL, rating TEXT NOT NULL, reviewed_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS saved_sentences (id TEXT PRIMARY KEY, english TEXT NOT NULL, korean TEXT NOT NULL, source_id TEXT, created_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS personal_errors (id TEXT PRIMARY KEY, original TEXT NOT NULL, corrected TEXT NOT NULL, category TEXT NOT NULL, explanation_ko TEXT NOT NULL, explanation_vi TEXT, status TEXT NOT NULL DEFAULT 'New', review_card_id TEXT);
  CREATE TABLE IF NOT EXISTS user_preferences (id INTEGER PRIMARY KEY, english_level TEXT NOT NULL DEFAULT 'A1', korean_level TEXT NOT NULL DEFAULT 'beginner', daily_minutes INTEGER NOT NULL DEFAULT 20, vietnamese_support INTEGER NOT NULL DEFAULT 0, assist_mode TEXT NOT NULL DEFAULT 'on-demand', accent TEXT NOT NULL DEFAULT 'US');
  CREATE TABLE IF NOT EXISTS voice_preferences (id INTEGER PRIMARY KEY, us_voice_uri TEXT, uk_voice_uri TEXT, ko_voice_uri TEXT, rate REAL NOT NULL DEFAULT 1);
  CREATE TABLE IF NOT EXISTS recording_metadata (id TEXT PRIMARY KEY, activity_id TEXT NOT NULL, mime_type TEXT NOT NULL, duration INTEGER NOT NULL, retained INTEGER NOT NULL DEFAULT 0, deleted_at INTEGER, created_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS shadowing_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, line_id TEXT NOT NULL, recording_id TEXT, rating TEXT NOT NULL, retained INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS listening_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, exercise_id TEXT NOT NULL, response TEXT NOT NULL, score REAL NOT NULL, created_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS branching_progress (scenario_id TEXT PRIMARY KEY, node_id TEXT NOT NULL, history TEXT NOT NULL, outcome TEXT, updated_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS saved_difficult_lines (id TEXT PRIMARY KEY, line TEXT NOT NULL, source_id TEXT NOT NULL, review_card_id TEXT, created_at INTEGER NOT NULL);
  INSERT OR IGNORE INTO voice_preferences (id) VALUES (1);
  INSERT OR IGNORE INTO user_preferences (id) VALUES (1);
`);
const preferenceColumns=sqlite.prepare("PRAGMA table_info(user_preferences)").all() as Array<{name:string}>;
if(!preferenceColumns.some(column=>column.name==="assist_mode"))sqlite.exec("ALTER TABLE user_preferences ADD COLUMN assist_mode TEXT NOT NULL DEFAULT 'on-demand'");
if(!preferenceColumns.some(column=>column.name==="explanation_mode"))sqlite.exec("ALTER TABLE user_preferences ADD COLUMN explanation_mode TEXT NOT NULL DEFAULT 'both'");

export const db = drizzle(sqlite, { schema });
export { sqlite };
