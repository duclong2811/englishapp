import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { getStudyWords, getLevelCounts, getTopics, splitIntoSets, LEVELS } = await import("./data");

describe("vocabulary content", () => {
  const study = getStudyWords();

  it("loads and validates every level", () => {
    const counts = getLevelCounts();
    for (const level of LEVELS) expect(counts[level].total).toBeGreaterThan(500);
  });

  it("has every A1 word and each study word has a meaning, IPA and two examples", () => {
    expect(study.filter((w) => w.level === "A1")).toHaveLength(1059);
    for (const w of study) {
      expect(["A1", "A2"], w.id).toContain(w.level);
      expect(w.ipa, w.id).toBeTruthy();
      expect(w.examples.length, w.id).toBeGreaterThanOrEqual(2);
      for (const m of w.meanings) expect(m.vi.trim().length, w.id).toBeGreaterThan(0);
    }
  });

  it("uses the headword (or one of its forms) in every example", () => {
    for (const w of study) {
      const forms = [w.headword, ...Object.values(w.forms)].map((f) => f.toLowerCase());
      for (const ex of w.examples) {
        // Whole-word match, like the fill-in-the-blank exercise ("Let's" contains "let").
        const found = forms.some((f) =>
          new RegExp(`(?<![a-z])${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z])`, "i").test(ex.en),
        );
        expect(found, `${w.id}: "${ex.en}"`).toBe(true);
      }
    }
  });

  it("has no duplicate study ids", () => {
    const ids = study.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("topics", () => {
  it("puts every study word in exactly one topic", () => {
    const topics = getTopics();
    const inTopics = topics.flatMap((t) => t.words);
    const levels = new Set(topics.map((t) => t.level));
    expect(new Set(inTopics).size).toBe(inTopics.length);
    expect(new Set(inTopics)).toEqual(new Set(getStudyWords().filter((w) => levels.has(w.level)).map((w) => w.id)));
  });

  it("splits topics into sets of 5 to 10 words", () => {
    for (const t of getTopics()) {
      expect(t.sets.flat()).toEqual(t.words);
      for (const set of t.sets) {
        expect(set.length, `${t.id}`).toBeGreaterThanOrEqual(5);
        expect(set.length, `${t.id}`).toBeLessThanOrEqual(10);
      }
    }
  });

  it("splits evenly", () => {
    expect(splitIntoSets(Array.from({ length: 47 }, (_, i) => String(i))).map((s) => s.length)).toEqual([9, 9, 10, 9, 10]);
  });
});
