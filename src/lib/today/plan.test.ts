import { describe, expect, it } from "vitest";
import type { LearningCatalog } from "@/lib/account/summary";
import { buildPlan, minutesToday, roadmap, week, type TodayState } from "./plan";

const catalog: LearningCatalog = {
  levels: [
    {
      level: "A1",
      topics: [
        { id: "food", title: "Đồ ăn", sets: [["a", "b"], ["c", "d"]] },
        { id: "home", title: "Nhà", sets: [["e"]] },
      ],
      lessons: [
        { id: "be", title: "To be" },
        { id: "have", title: "Have" },
        { id: "can", title: "Can" },
      ],
      units: [
        { id: "u1", title: "Cơ bản", lessons: ["be", "have"] },
        { id: "u2", title: "Khả năng", lessons: ["can", "unwritten"] },
      ],
    },
  ],
  speaking: [{ topic: "food", title: "Đồ ăn" }],
};

const now = new Date(2026, 10, 27, 20, 0); // Fri 27 Nov 2026, local time
const empty: TodayState = { cards: {}, newByDay: {}, grammar: {}, tests: {}, speak: {} };

describe("today plan", () => {
  it("starts a new learner with grammar, words and speaking", () => {
    const plan = buildPlan(catalog, empty, { level: "A1", goal: "level", minutes: 30 }, now);
    expect(plan.map((p) => p.kind)).toEqual(["grammar", "words", "speak"]);
    expect(plan[0]).toMatchObject({ title: "To be", href: "/lessons/be", label: "Ngữ pháp · Chương 1", done: false });
    expect(plan[1]).toMatchObject({ title: "Đồ ăn · bộ 1", href: "/vocabulary/topic/food/1" });
    expect(plan[2]).toMatchObject({ href: "/speaking/food" });
  });

  it("puts due reviews first and marks today's work done", () => {
    const state: TodayState = {
      ...empty,
      cards: { a: { due: "2026-11-20T00:00:00Z", last_review: "2026-11-19T00:00:00Z" }, b: { due: "2026-12-30T00:00:00Z" } },
      grammar: { be: { best: 90, at: now.toISOString() }, have: { best: 40, at: "2026-11-01T00:00:00Z" } },
    };
    const plan = buildPlan(catalog, state, { level: "A1", goal: "level", minutes: 60 }, now);
    expect(plan[0]).toMatchObject({ kind: "review", title: "Ôn 1 từ đến hạn", done: false });
    expect(plan.find((p) => p.kind === "grammar")).toMatchObject({ title: "To be", done: true });
    expect(plan.find((p) => p.kind === "words")?.title).toBe("Đồ ăn · bộ 2");
  });

  it("orders by goal and stops near the daily minutes", () => {
    const talk = buildPlan(catalog, empty, { level: "A1", goal: "talk", minutes: 15 }, now);
    expect(talk[0].kind).toBe("speak");
    expect(talk).toHaveLength(3);
  });

  it("offers the level test once most lessons are passed", () => {
    const g = { best: 85, at: "2026-11-01T00:00:00Z" };
    const state = { ...empty, grammar: { be: g, have: g, can: g } };
    const plan = buildPlan(catalog, state, { level: "A1", goal: "level", minutes: 90 }, now);
    expect(plan.find((p) => p.kind === "test")).toMatchObject({ href: "/tests/a1" });
  });

  it("builds the week, minutes and roadmap", () => {
    const state: TodayState = {
      ...empty,
      cards: { a: { last_review: new Date(2026, 10, 24, 9).toISOString() }, c: { last_review: now.toISOString() } },
      grammar: { be: { best: 90, at: now.toISOString() } },
    };
    const w = week(state, now);
    expect(w.map((d) => d.studied)).toEqual([false, true, false, false, true, false, false]);
    expect(w[4].today).toBe(true);
    expect(w[5].future).toBe(true);
    expect(minutesToday(state, now)).toBe(10);
    const r = roadmap(catalog, state, "A1");
    expect(r).toMatchObject({ percent: 36, words: { learned: 2, total: 5 }, lessons: { passed: 1, total: 3 }, current: "u1" });
    expect(r.units[1]).toMatchObject({ total: 1, passed: 0 });
  });
});
