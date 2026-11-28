import { describe, expect, it } from "vitest";
import { mergeValues } from "./merge";

describe("progress merge", () => {
  it("keeps the more recently reviewed card and the larger new-word count", () => {
    const a = JSON.stringify({ cards: { x: { reps: 1, last_review: "2026-01-01T00:00:00Z" }, y: { reps: 1 } }, newByDay: { d: 3 } });
    const b = JSON.stringify({ cards: { x: { reps: 2, last_review: "2026-02-01T00:00:00Z" }, z: { reps: 1 } }, newByDay: { d: 5, e: 1 } });
    const m = JSON.parse(mergeValues("vocab:srs:v1", a, b));
    expect(m.cards.x.reps).toBe(2);
    expect(Object.keys(m.cards).sort()).toEqual(["x", "y", "z"]);
    expect(m.newByDay).toEqual({ d: 5, e: 1 });
    expect(JSON.parse(mergeValues("vocab:srs:v1", b, a)).cards.x.reps).toBe(2);
  });

  it("keeps the best score", () => {
    const a = JSON.stringify({ l1: { best: 90, at: "2026-01-01" }, l2: { best: 50, at: "2026-01-01" } });
    const b = JSON.stringify({ l1: { best: 70, at: "2026-03-01" }, l2: { best: 60, at: "2026-02-01" } });
    expect(JSON.parse(mergeValues("grammar:a1:v1", a, b))).toEqual({ l1: { best: 90, at: "2026-01-01" }, l2: { best: 60, at: "2026-02-01" } });
  });

  it("unions seen questions and survives bad data", () => {
    const m = JSON.parse(mergeValues("tests:seen:v1", JSON.stringify({ A1: ["a", "b"] }), JSON.stringify({ A1: ["b", "c"], A2: ["d"] })));
    expect(m).toEqual({ A1: ["a", "b", "c"], A2: ["d"] });
    expect(mergeValues("tests:scores:v1", "not json", null)).toBe("{}");
  });
});
