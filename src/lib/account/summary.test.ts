import { describe, expect, it } from "vitest";
import { readProgress, summarize, totals } from "./summary";

const catalog = {
  levels: [
    { level: "A1", topics: [{ id: "food", title: "Đồ ăn", ids: ["a", "b", "c"] }], lessons: [{ id: "be", title: "To be" }, { id: "have", title: "Have" }] },
    { level: "A2", topics: [{ id: "work", title: "Công việc", ids: ["d", "e"] }], lessons: [{ id: "past", title: "Past" }] },
  ],
};

describe("progress summary", () => {
  const state = readProgress({
    "vocab:srs:v1": JSON.stringify({ cards: { a: { lapses: 2, due: "2026-01-01" }, b: {}, d: { lapses: 0, due: "2999-01-01" } } }),
    "grammar:a1:v1": JSON.stringify({ be: { best: 90, at: "" }, have: { best: 40, at: "" }, past: { best: 70, at: "" } }),
    "tests:scores:v1": JSON.stringify({ "level:A1": { best: 75, at: "" } }),
  });

  it("counts progress per level and finds weak spots", () => {
    const s = summarize(catalog, state, new Date("2026-06-01"));
    expect(s.levels[0]).toEqual({ level: "A1", words: { learned: 2, total: 3 }, lessons: { passed: 1, total: 2 }, levelTest: 75 });
    expect(s.weakLessons.map((l) => l.id)).toEqual(["have", "past"]);
    expect(s.weakTopics).toEqual([{ id: "food", title: "Đồ ăn", level: "A1", forgotten: 1, due: 1 }]);
    expect(s.current).toBe("A1");
    expect(totals(state)).toEqual({ words: 3, lessons: 1, tests: 1 });
  });

  it("survives empty or broken data", () => {
    const s = summarize(catalog, readProgress({ "vocab:srs:v1": "{bad" }));
    expect(s.levels[1].words.learned).toBe(0);
    expect(s.weakTopics).toEqual([]);
  });
});
