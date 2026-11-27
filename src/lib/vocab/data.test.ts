import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { getStudyWords, getLevelCounts, LEVELS } = await import("./data");

describe("vocabulary content", () => {
  const study = getStudyWords();

  it("loads and validates every level", () => {
    const counts = getLevelCounts();
    for (const level of LEVELS) expect(counts[level].total).toBeGreaterThan(500);
  });

  it("has 400 study words at A1, each with meaning, IPA and two examples", () => {
    expect(study).toHaveLength(400);
    for (const w of study) {
      expect(w.level, w.id).toBe("A1");
      expect(w.ipa, w.id).toBeTruthy();
      expect(w.examples.length, w.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("uses the headword (or one of its forms) in every example", () => {
    for (const w of study) {
      const forms = [w.headword, ...Object.values(w.forms)].map((f) => f.toLowerCase());
      for (const ex of w.examples) {
        const tokens: string[] = ex.en.toLowerCase().match(/[a-z]+/g) ?? [];
        expect(
          forms.some((f) => tokens.includes(f)),
          `${w.id}: "${ex.en}"`,
        ).toBe(true);
      }
    }
  });

  it("has no duplicate study ids", () => {
    const ids = study.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
