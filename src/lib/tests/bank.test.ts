import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { isRight } from "@/lib/grammar/check";
import type { Exercise } from "@/lib/grammar/schema";
import { bankSize, drawLevelTest, drawTopicTest, drawUnitTest, LEVEL_BLUEPRINT, QUICK_SIZE, summarize, vocabItem, type Bank, type VocabKind } from "./bank";
import { buildBank, TEST_LEVELS } from "./build-bank";

const banks = new Map<string, Bank>();
async function bank(level: (typeof TEST_LEVELS)[number]) {
  if (!banks.has(level)) banks.set(level, await buildBank(level));
  return banks.get(level)!;
}

/** The answer the app accepts as right must be accepted by the checker. */
function selfConsistent(ex: Exercise) {
  if (ex.type === "choice") {
    expect(ex.answer).toBeLessThan(ex.options.length);
    expect(new Set(ex.options.map((o) => o.toLowerCase())).size).toBe(ex.options.length);
  }
  if (ex.type === "fill") {
    expect(ex.prompt.split("___").length).toBe(2);
    expect(isRight(ex.answers[0], ex.answers)).toBe(true);
  }
}

describe.each(TEST_LEVELS)("%s test bank", (level) => {
  it("has words from every topic and exercises from every unit", async () => {
    const b = await bank(level);
    expect(b.words.length).toBeGreaterThan(500);
    for (const t of b.topics) expect(b.words.some((w) => w.topic === t.id), t.id).toBe(true);
    for (const u of b.units) expect(b.grammar.some((g) => g.unit === u.id), u.id).toBe(true);
    for (const w of b.words) expect(b.tags[w.topic], w.topic).toBeTruthy();
    for (const g of b.grammar) expect(b.tags[g.lesson], g.lesson).toBeTruthy();
    expect(new Set(b.grammar.map((g) => g.id)).size).toBe(b.grammar.length);
    expect(bankSize(b)).toBeGreaterThan(2000);
  });

  it("builds a well-formed question of every kind for every word", async () => {
    const b = await bank(level);
    const kinds: VocabKind[] = ["meaning", "reverse", "cloze", "listen"];
    for (const w of b.words) {
      for (const kind of kinds) {
        const item = vocabItem(w, kind, b.words);
        selfConsistent(item.ex);
        if (item.ex.type === "choice") expect(item.ex.options.length, `${w.id} ${kind}`).toBe(4);
      }
    }
  });

  it("draws a level test that follows the blueprint and covers every unit", async () => {
    const b = await bank(level);
    const items = drawLevelTest(b, new Set());
    const count = (s: string) => items.filter((i) => i.section === s).length;
    expect(count("vocab")).toBe(LEVEL_BLUEPRINT.vocab);
    expect(count("listening")).toBe(LEVEL_BLUEPRINT.listening);
    expect(count("grammar")).toBe(LEVEL_BLUEPRINT.grammar);
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
    const units = new Set(items.filter((i) => i.section === "grammar").map((i) => b.grammar.find((g) => g.id === i.id)!.unit));
    expect(units.size).toBe(b.units.length);
    // Words come from many topics, not a few.
    expect(new Set(items.filter((i) => i.section !== "grammar").map((i) => i.tag)).size).toBeGreaterThanOrEqual(Math.min(20, b.topics.length));
  });

  it("puts unseen questions first", async () => {
    const b = await bank(level);
    const first = drawLevelTest(b, new Set());
    const second = drawLevelTest(b, new Set(first.map((i) => i.id)));
    const repeats = second.filter((i) => first.some((f) => f.id === i.id));
    expect(repeats.length).toBe(0);
  });

  it("draws quick tests for every unit and topic", async () => {
    const b = await bank(level);
    for (const u of b.units) {
      const items = drawUnitTest(b, u.id, new Set());
      expect(items.length, u.id).toBe(Math.min(QUICK_SIZE, b.grammar.filter((g) => g.unit === u.id).length));
      expect(new Set(items.map((i) => i.tag)).size, u.id).toBe(u.lessons.length);
    }
    for (const t of b.topics) {
      const items = drawTopicTest(b, t.id, new Set());
      expect(items.length, t.id).toBe(QUICK_SIZE);
      for (const i of items) selfConsistent(i.ex);
    }
  });
});

it("summarizes by section and weakest tag", () => {
  const ex: Exercise = { type: "fill", prompt: "a ___", answers: ["b"], explain: "" };
  const items = [
    { id: "1", section: "vocab" as const, tag: "x", ex },
    { id: "2", section: "grammar" as const, tag: "y", ex },
    { id: "3", section: "grammar" as const, tag: "y", ex },
  ];
  const s = summarize(items, [true, false, true]);
  expect(s.percent).toBe(67);
  expect(s.sections).toEqual([
    { section: "vocab", right: 1, total: 1 },
    { section: "grammar", right: 1, total: 2 },
  ]);
  expect(s.weak).toEqual([{ tag: "y", wrong: 1, total: 2 }]);
});
