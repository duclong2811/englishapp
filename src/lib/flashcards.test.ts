import { expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { lessonCards, wordCard } from "./flashcards";
import { getGrammarLessons } from "./grammar/lessons";

const allLessons = await getGrammarLessons();

it("gives every lesson rule cards with an example, and mistake cards", () => {
  for (const lesson of allLessons) {
    const cards = lessonCards(lesson);
    const rules = cards.filter((c) => c.kind === "rule");
    expect(rules.length, lesson.id).toBeGreaterThanOrEqual(2);
    expect(cards.filter((c) => c.kind === "mistake").length, lesson.id).toBe(3);
    for (const c of rules) {
      expect(c.cue, lesson.id).not.toMatch(/^\d/);
      expect(c.rule.length, `${lesson.id}: ${c.cue}`).toBeGreaterThan(10);
    }
    expect(new Set(cards.map((c) => c.id)).size).toBe(cards.length);
  }
});

it("joins every meaning of a word", () => {
  const card = wordCard({ id: "run", headword: "run", ipa: "rʌn", meanings: [{ vi: "chạy" }, { vi: "điều hành" }], note: "run a shop = điều hành cửa hàng.", examples: [] });
  expect(card.meaning).toBe("chạy; điều hành");
  expect(card.example).toBeNull();
});
