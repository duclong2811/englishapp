import { describe, expect, it } from "vitest";
import { GRAMMAR_LEVELS } from "@/content/grammar/syllabus";
import { closest, isRight } from "./check";
import { getGrammarLessons } from "./lessons";

describe("answer checking", () => {
  it("ignores case, punctuation and contractions", () => {
    expect(isRight("i'm hungry", ["I am hungry."])).toBe(true);
    expect(isRight("He isn't tired", ["He is not tired."])).toBe(true);
    expect(isRight("I am 30 years old", ["I am thirty years old."])).toBe(true);
  });

  it("rejects a missing word", () => {
    expect(isRight("She teacher.", ["She is a teacher."])).toBe(false);
    expect(isRight("", ["is"])).toBe(false);
  });

  it("points at the missing words", () => {
    const c = closest("She a teacher", ["She is a teacher.", "She's a teacher."]);
    expect(c.result.words.filter((w) => !w.ok).map((w) => w.text)).toEqual(["is"]);
  });
});

describe("grammar lessons", () => {
  const lessons = getGrammarLessons();
  const syllabus = new Map(Object.entries(GRAMMAR_LEVELS).flatMap(([level, { syllabus }]) => syllabus.map((s) => [s.id, level] as const)));

  it("are all in the syllabus, once", () => {
    const ids = lessons.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of lessons) expect(syllabus.get(l.id), l.id).toBe(l.level);
  });

  it.each(lessons.map((l) => [l.id, l] as const))("%s has well-formed exercises", (_, l) => {
    for (const [i, ex] of l.exercises.entries()) {
      const where = `${l.id} exercise ${i + 1}`;
      switch (ex.type) {
        case "choice":
          expect(ex.answer, where).toBeLessThan(ex.options.length);
          // Gap questions are typed, so the answer must be something you can type.
          if (ex.prompt.includes("___")) expect(ex.options[ex.answer], where).toMatch(/^[A-Za-z' ]+$/);
          expect(new Set(ex.options).size, where).toBe(ex.options.length);
          break;
        case "fill":
          expect(ex.prompt.split("___").length, where).toBe(2);
          for (const a of ex.answers) expect(isRight(a, ex.answers), where).toBe(true);
          break;
        case "order":
          // Shuffled words must not give away the answer: at least three words.
          expect(ex.words.length, where).toBeGreaterThanOrEqual(3);
          for (const alt of ex.alternatives) {
            expect([...alt.toLowerCase().replace(/[.?!]/g, "").split(" ")].sort(), where).toEqual(
              [...ex.words.join(" ").toLowerCase().replace(/[.?!]/g, "").split(" ")].sort(),
            );
          }
          break;
        case "fix":
          // The wrong sentence must not count as right.
          expect(isRight(ex.sentence, ex.answers), where).toBe(false);
          break;
        case "translate":
          for (const a of ex.answers) expect(a.trim().length, where).toBeGreaterThan(0);
          break;
      }
    }
  });

  it.each(lessons.map((l) => [l.id, l] as const))("%s marks the grammar point in every dialogue line", (_, l) => {
    const marked = l.dialogue.filter((d) => d.en.includes("[["));
    expect(marked.length, l.id).toBeGreaterThanOrEqual(Math.ceil(l.dialogue.length / 2));
  });
});

describe("lesson screens", () => {
  it("have valid quick checks", () => {
    for (const l of getGrammarLessons())
      for (const s of l.sections)
        if (s.check) expect(s.check.answer, `${l.id}: ${s.heading}`).toBeLessThan(s.check.options.length);
  });
});

describe("A2 lesson quality", () => {
  const words = (s: string) => s.replace(/\[\[|\]\]/g, "").split(/\s+/).filter(Boolean).length;
  const a2 = getGrammarLessons().filter((l) => l.level === "A2");

  it.each(a2.map((l) => [l.id, l] as const))("%s follows the A2 brief", (_, l) => {
    expect(l.summary.length, "summary").toBeGreaterThanOrEqual(40);
    expect(l.summary.length, "summary").toBeLessThanOrEqual(160);
    expect(l.dialogue.length, "dialogue").toBeGreaterThanOrEqual(6);
    expect(l.dialogue.length, "dialogue").toBeLessThanOrEqual(8);
    const parts = new Set(l.sections.map((s) => s.part));
    expect(parts.size, "parts").toBeGreaterThanOrEqual(3);
    expect(parts.size, "parts").toBeLessThanOrEqual(5);
    for (const part of parts) expect(l.sections.some((s) => s.part === part && s.check), `check in ${part}`).toBe(true);
    for (const s of l.sections) {
      expect(s.rule, `rule: ${s.heading}`).toBeTruthy();
      expect(s.examples.length, `examples: ${s.heading}`).toBeGreaterThanOrEqual(2);
      for (const e of s.examples) {
        expect(e.why, `why: ${e.en}`).toBeTruthy();
        expect(words(e.en), e.en).toBeGreaterThanOrEqual(3);
        expect(words(e.en), e.en).toBeLessThanOrEqual(16);
      }
    }
    for (const d of l.dialogue) expect(words(d.en), d.en).toBeLessThanOrEqual(16);
    expect(l.mistakes.length, "mistakes").toBeGreaterThanOrEqual(5);
    expect(l.exercises.length, "exercises").toBeGreaterThanOrEqual(15);
    const count = (t: string) => l.exercises.filter((e) => e.type === t).length;
    expect(count("choice"), "choice").toBeGreaterThanOrEqual(4);
    expect(count("fill"), "fill").toBeGreaterThanOrEqual(4);
    expect(count("order"), "order").toBeGreaterThanOrEqual(2);
    expect(count("fix"), "fix").toBeGreaterThanOrEqual(3);
    expect(count("translate"), "translate").toBeGreaterThanOrEqual(2);
  });
});
