import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const courses = sqliteTable("courses", { id: text("id").primaryKey(), version: text("version").notNull() });
export const levels = sqliteTable("levels", { id: text("id").primaryKey(), courseId: text("course_id").notNull(), cefr: text("cefr").notNull() });
export const units = sqliteTable("units", { id: text("id").primaryKey(), levelId: text("level_id").notNull(), position: integer("position").notNull() });
export const lessonRecords = sqliteTable("lessons", { id: text("id").primaryKey(), unitId: text("unit_id").notNull(), position: integer("position").notNull() });
export const learningObjectives = sqliteTable("learning_objectives", { id: text("id").primaryKey(), lessonId: text("lesson_id").notNull(), skills: text("skills", { mode: "json" }).notNull() });
export const vocabularyItems = sqliteTable("vocabulary_items", { id: text("id").primaryKey(), lessonId: text("lesson_id").notNull(), headword: text("headword").notNull() });
export const grammarPoints = sqliteTable("grammar_points", { id: text("id").primaryKey(), lessonId: text("lesson_id").notNull(), title: text("title").notNull() });
export const exampleSentences = sqliteTable("example_sentences", { id: text("id").primaryKey(), ownerId: text("owner_id").notNull(), english: text("english").notNull(), korean: text("korean").notNull() });
export const dialogues = sqliteTable("dialogues", { id: text("id").primaryKey(), lessonId: text("lesson_id").notNull(), lines: text("lines", { mode: "json" }).notNull() });
export const exercises = sqliteTable("exercises", { id: text("id").primaryKey(), lessonId: text("lesson_id").notNull(), type: text("type").notNull(), payload: text("payload", { mode: "json" }).notNull() });

export const exerciseAttempts = sqliteTable("exercise_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }), exerciseId: text("exercise_id").notNull(), response: text("response", { mode: "json" }),
  score: real("score"), selfRating: integer("self_rating"), createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
export const lessonProgress = sqliteTable("lesson_progress", {
  lessonId: text("lesson_id").primaryKey(), status: text("status").notNull().default("available"), position: text("position").notNull().default("intro"),
  percent: integer("percent").notNull().default(0), updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
export const masteryResults = sqliteTable("mastery_results", {
  id: integer("id").primaryKey({ autoIncrement: true }), lessonId: text("lesson_id").notNull(), skillScores: text("skill_scores", { mode: "json" }).notNull(), passed: integer("passed", { mode: "boolean" }).notNull(), createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
export const reviewCards = sqliteTable("review_cards", {
  id: text("id").primaryKey(), objectiveId: text("objective_id").notNull(), kind: text("kind").notNull(), due: integer("due", { mode: "timestamp" }).notNull(),
  stability: real("stability").notNull(), difficulty: real("difficulty").notNull(), elapsedDays: integer("elapsed_days").notNull(), scheduledDays: integer("scheduled_days").notNull(), reps: integer("reps").notNull(), lapses: integer("lapses").notNull(), state: integer("state").notNull(), lastReview: integer("last_review", { mode: "timestamp" }),
});
export const reviewLogs = sqliteTable("review_logs", { id: integer("id").primaryKey({ autoIncrement: true }), cardId: text("card_id").notNull(), rating: text("rating").notNull(), reviewedAt: integer("reviewed_at", { mode: "timestamp" }).notNull() });
export const savedSentences = sqliteTable("saved_sentences", { id: text("id").primaryKey(), english: text("english").notNull(), korean: text("korean").notNull(), sourceId: text("source_id"), createdAt: integer("created_at", { mode: "timestamp" }).notNull() });
export const personalErrors = sqliteTable("personal_errors", { id: text("id").primaryKey(), original: text("original").notNull(), corrected: text("corrected").notNull(), category: text("category").notNull(), explanationKo: text("explanation_ko").notNull(), explanationVi: text("explanation_vi"), status: text("status").notNull().default("New"), reviewCardId: text("review_card_id") });
export const userPreferences = sqliteTable("user_preferences", { id: integer("id").primaryKey(), englishLevel: text("english_level").notNull().default("A1"), koreanLevel: text("korean_level").notNull().default("beginner"), dailyMinutes: integer("daily_minutes").notNull().default(20), vietnameseSupport: integer("vietnamese_support", { mode: "boolean" }).notNull().default(false), assistMode: text("assist_mode").notNull().default("on-demand"), explanationMode:text("explanation_mode").notNull().default("both"), accent: text("accent").notNull().default("US") });
export const voicePreferences=sqliteTable("voice_preferences",{id:integer("id").primaryKey(),usVoiceUri:text("us_voice_uri"),ukVoiceUri:text("uk_voice_uri"),koVoiceUri:text("ko_voice_uri"),rate:real("rate").notNull().default(1)});
export const recordingMetadata=sqliteTable("recording_metadata",{id:text("id").primaryKey(),activityId:text("activity_id").notNull(),mimeType:text("mime_type").notNull(),duration:integer("duration").notNull(),retained:integer("retained",{mode:"boolean"}).notNull().default(false),deletedAt:integer("deleted_at",{mode:"timestamp"}),createdAt:integer("created_at",{mode:"timestamp"}).notNull()});
export const shadowingAttempts=sqliteTable("shadowing_attempts",{id:integer("id").primaryKey({autoIncrement:true}),lineId:text("line_id").notNull(),recordingId:text("recording_id"),rating:text("rating").notNull(),retained:integer("retained",{mode:"boolean"}).notNull().default(false),createdAt:integer("created_at",{mode:"timestamp"}).notNull()});
export const listeningAttempts=sqliteTable("listening_attempts",{id:integer("id").primaryKey({autoIncrement:true}),exerciseId:text("exercise_id").notNull(),response:text("response").notNull(),score:real("score").notNull(),createdAt:integer("created_at",{mode:"timestamp"}).notNull()});
export const branchingProgress=sqliteTable("branching_progress",{scenarioId:text("scenario_id").primaryKey(),nodeId:text("node_id").notNull(),history:text("history",{mode:"json"}).notNull(),outcome:text("outcome"),updatedAt:integer("updated_at",{mode:"timestamp"}).notNull()});
export const savedDifficultLines=sqliteTable("saved_difficult_lines",{id:text("id").primaryKey(),line:text("line").notNull(),sourceId:text("source_id").notNull(),reviewCardId:text("review_card_id"),createdAt:integer("created_at",{mode:"timestamp"}).notNull()});
