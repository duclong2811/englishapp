import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { getStudyWords } = await import("@/lib/vocab/data");
const { buildSession, makeCloze } = await import("./practice");

const words = getStudyWords().map((w) => ({
  id: w.id,
  headword: w.headword,
  ipa: w.ipa,
  meaning: w.meanings[0].vi,
  pos: w.meanings.map((m) => m.pos),
  forms: w.forms,
  examples: w.examples.map(({ en, vi }) => ({ en, vi })),
}));

describe("vocabulary practice", () => {
  it("can blank out every study word in one of its examples", () => {
    for (const w of words) expect(makeCloze(w), w.id).not.toBeNull();
  });

  it("builds questions with four distinct options and a valid answer", () => {
    for (let run = 0; run < 300; run++) {
      const session = buildSession(words, words, true);
      expect(session).toHaveLength(10);
      for (const q of session) {
        expect(q.options).toHaveLength(4);
        expect(new Set(q.options.map((o) => o.toLowerCase())).size, `${q.word.id}: ${q.options}`).toBe(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("distractors", () => {
  it("never offers a near-synonym of the answer", () => {
    const byId = new Map(words.map((w) => [w.id, w]));
    const big = byId.get("big")!;
    for (let run = 0; run < 300; run++) {
      for (const q of buildSession([big], words, true)) {
        expect(q.options.map((o) => o.toLowerCase())).not.toContain("large");
        expect(q.options).not.toContain("lớn, rộng");
      }
    }
  });
});

describe("cloze distractors", () => {
  it("only uses inflected forms of words taught in that part of speech", () => {
    const byId = new Map(words.map((w) => [w.id, w]));
    const put = byId.get("put")!;
    for (let run = 0; run < 300; run++) {
      for (const q of buildSession([put], words, false)) {
        if (q.kind === "cloze") expect(q.options).not.toContain("placed");
      }
    }
  });
});

describe("topic-sized pools", () => {
  it("never offers hello as a distractor for hi (chào / xin chào)", () => {
    const byId = new Map(words.map((w) => [w.id, w]));
    const greetings = ["hello", "hi", "bye", "good-morning", "welcome", "thank", "please", "sorry"].map((id) => byId.get(id)!);
    for (let run = 0; run < 300; run++) {
      for (const q of buildSession([byId.get("hi")!], greetings, true, 1)) {
        expect(q.options.map((o) => o.toLowerCase())).not.toContain("hello");
        expect(q.options.some((o) => o.startsWith("lời chào"))).toBe(false);
      }
    }
  });
});
