// @vitest-environment node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { a2Lessons } from "@/content/a2-course";
import { errorCategoryTaxonomy } from "@/content/a2-lesson-factory";

/**
 * Regression test cho dữ liệu người học: tiến độ, mastery, thẻ FSRS, liên kết
 * Sổ lỗi và metadata bản ghi. Test dùng SQLite tạm, không chạm data/learn.db thật.
 */
const lesson = a2Lessons.find((item) => item.id === "a2-trip-plans")!;
const listeningExercise = lesson.listening[0];

let sqlite: import("better-sqlite3").Database;
let statePost: (request: Request) => Promise<Response>;
let stateGet: () => Promise<Response>;
let recordingsPost: (request: Request) => Promise<Response>;
let recordingsPatch: (request: Request) => Promise<Response>;
let recordingsDelete: (request: Request) => Promise<Response>;
let recordingsGet: () => Promise<Response>;
let activityPost: (request: Request) => Promise<Response>;
let schema: typeof import("./schema");

const jsonRequest = (body: unknown) => new Request("http://localhost/api", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const rows = <T,>(query: string, ...params: unknown[]) => sqlite.prepare(query).all(...params) as T[];

beforeAll(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "englishapp-db-"));
  process.env.DATABASE_URL = path.join(dir, "learn-test.db");
  const dbModule = await import("./index");
  sqlite = dbModule.sqlite;
  schema = await import("./schema");
  const state = await import("@/app/api/state/route");
  statePost = state.POST;
  stateGet = state.GET;
  const recordings = await import("@/app/api/recordings/route");
  recordingsPost = recordings.POST;
  recordingsPatch = recordings.PATCH;
  recordingsDelete = recordings.DELETE;
  recordingsGet = recordings.GET;
  const activity = await import("@/app/api/activity/route");
  activityPost = activity.POST;
});

describe("Regression dữ liệu học tập", () => {
  it("tiến độ bài học được upsert theo lessonId, không tạo bản ghi trùng", async () => {
    const first = await statePost(jsonRequest({ type: "progress", lessonId: lesson.id, status: "in-progress", position: "Hội thoại", percent: 14 }));
    expect(first.status).toBe(200);
    await statePost(jsonRequest({ type: "progress", lessonId: lesson.id, status: "in-progress", position: "Kiểm tra", percent: 100 }));

    const progress = rows<{ lessonId: string; position: string; percent: number }>("SELECT lesson_id as lessonId, position, percent FROM lesson_progress WHERE lesson_id = ?", lesson.id);
    expect(progress).toHaveLength(1);
    expect(progress[0]).toMatchObject({ position: "Kiểm tra", percent: 100 });
  });

  it("mastery chỉ tạo thẻ FSRS cho kỹ năng yếu và giữ liên kết objective", async () => {
    const scores = { vocabulary: 40, grammar: 90, listening: 50, writing: 100, speaking: 30, reading: 80 };
    const response = await statePost(jsonRequest({ type: "mastery", lessonId: lesson.id, scores }));
    expect(response.status).toBe(200);

    const cards = rows<{ id: string; objectiveId: string; kind: string }>("SELECT id, objective_id as objectiveId, kind FROM review_cards WHERE objective_id LIKE ?", `${lesson.id}:%`);
    expect(cards.map((card) => card.id).sort()).toEqual([`${lesson.id}-listening`, `${lesson.id}-speaking`, `${lesson.id}-vocabulary`].sort());
    for (const card of cards) expect(card.objectiveId).toBe(`${lesson.id}:${card.kind}`);
    expect(cards.some((card) => card.kind === "writing")).toBe(false);

    const masteryRows = rows<{ skillScores: string }>("SELECT skill_scores as skillScores FROM mastery_results WHERE lesson_id = ?", lesson.id);
    expect(masteryRows).toHaveLength(1);
    expect(JSON.parse(masteryRows[0].skillScores)).toMatchObject(scores);
  });

  it("thẻ FSRS đã tạo lịch ôn và ghi log khi người học tự đánh giá", async () => {
    const cardId = `${lesson.id}-vocabulary`;
    const before = rows<{ due: number; reps: number }>("SELECT due, reps FROM review_cards WHERE id = ?", cardId)[0];

    const { scheduleReview, generateReviewCards } = await import("@/lib/review");
    const weak = generateReviewCards(lesson.id, { vocabulary: 20, grammar: 100, listening: 100, writing: 100, speaking: 100, reading: 100 });
    expect(weak.map((seed) => seed.id)).toEqual([cardId]);

    const scheduled = scheduleReview(weak[0].card, "Good");
    expect(scheduled.due.getTime()).toBeGreaterThan(weak[0].card.due.getTime());

    const db = (await import("./index")).db;
    await db.update(schema.reviewCards).set({ due: scheduled.due }).where(eq(schema.reviewCards.id, cardId));
    await db.insert(schema.reviewLogs).values({ cardId, rating: "Good", reviewedAt: new Date() });

    const after = rows<{ due: number }>("SELECT due FROM review_cards WHERE id = ?", cardId)[0];
    expect(after.due).not.toBe(before.due);
    expect(rows("SELECT id FROM review_logs WHERE card_id = ?", cardId)).toHaveLength(1);
  });

  it("Sổ lỗi giữ liên kết tới thẻ ôn tập đã tạo", async () => {
    const cardId = `${lesson.id}-vocabulary`;
    const db = (await import("./index")).db;
    const category = lesson.errorCategories.find((item) => (errorCategoryTaxonomy as readonly string[]).includes(item)) ?? "grammar-form";
    await db.insert(schema.personalErrors).values({
      id: `${lesson.id}-error-1`,
      original: "I go to airport yesterday.",
      corrected: "I went to the airport yesterday.",
      category,
      explanationKo: "어제 일은 과거형으로 말해요.",
      explanationVi: "Việc đã xảy ra hôm qua nên dùng quá khứ đơn.",
      status: "New",
      reviewCardId: cardId,
    });

    const linked = rows<{ id: string; category: string; reviewCardId: string }>("SELECT id, category, review_card_id as reviewCardId FROM personal_errors WHERE review_card_id = ?", cardId);
    expect(linked).toHaveLength(1);
    expect(linked[0].category).toBe(category);
    expect((errorCategoryTaxonomy as readonly string[])).toContain(linked[0].category);
  });

  it("metadata bản ghi âm lưu theo activityId và xóa được theo yêu cầu", async () => {
    const recordingId = `${lesson.id}-rec-1`;
    const created = await recordingsPost(jsonRequest({ id: recordingId, activityId: lesson.id, mimeType: "audio/webm", duration: 12, retained: false }));
    expect(created.status).toBe(200);

    const listed = (await (await recordingsGet()).json()) as { recordings: Array<{ id: string; activityId: string; retained: boolean }> };
    const mine = listed.recordings.find((item) => item.id === recordingId);
    expect(mine).toMatchObject({ activityId: lesson.id, retained: false });

    await recordingsPatch(jsonRequest({ id: recordingId, retained: true }));
    expect(rows<{ retained: number }>("SELECT retained FROM recording_metadata WHERE id = ?", recordingId)[0].retained).toBe(1);

    await recordingsDelete(new Request(`http://localhost/api/recordings?id=${recordingId}`, { method: "DELETE" }));
    expect(rows("SELECT id FROM recording_metadata WHERE id = ?", recordingId)).toHaveLength(0);
  });

  it("bài nghe và shadowing lưu đúng exerciseId của nội dung A2", async () => {
    const attempt = await activityPost(jsonRequest({ type: "listening", exerciseId: listeningExercise.id, response: "Sai", score: 0 }));
    expect(attempt.status).toBe(200);
    expect(rows<{ exerciseId: string }>("SELECT exercise_id as exerciseId FROM listening_attempts WHERE exercise_id = ?", listeningExercise.id)).toHaveLength(1);
    expect(lesson.listening.map((item) => item.id)).toContain(listeningExercise.id);

    await activityPost(jsonRequest({ type: "shadowing", lineId: `${lesson.id}-shadowing`, recordingId: `${lesson.id}-rec-1`, rating: "Hard", retained: false }));
    expect(rows<{ lineId: string; rating: string }>("SELECT line_id as lineId, rating FROM shadowing_attempts WHERE line_id = ?", `${lesson.id}-shadowing`)[0]).toMatchObject({ rating: "Hard" });
  });

  it("API từ chối dữ liệu sai bằng thông báo tiếng Việt", async () => {
    const response = await statePost(jsonRequest({ type: "progress", lessonId: lesson.id, status: "in-progress", position: "intro", percent: 500 }));
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe("Dữ liệu gửi lên chưa hợp lệ.");
    expect(body.error).not.toMatch(/[\uac00-\ud7af]/);

    const progress = rows("SELECT lesson_id FROM lesson_progress WHERE lesson_id = ?", lesson.id);
    expect(progress).toHaveLength(1);
  });

  it("GET /api/state trả về tiến độ và tùy chọn hiện có", async () => {
    const payload = (await (await stateGet()).json()) as { progress: unknown[]; preferences: { explanationMode: string } };
    expect(payload.progress.length).toBeGreaterThan(0);
    expect(payload.preferences.explanationMode).toBeDefined();
  });
});
