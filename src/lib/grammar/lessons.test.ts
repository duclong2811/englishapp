import { describe, expect, it } from "vitest";
import { A1_SYLLABUS } from "@/content/grammar/syllabus";
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
  const syllabus = new Set(A1_SYLLABUS.map((s) => s.id));

  it("are all in the syllabus, once", () => {
    const ids = lessons.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(syllabus.has(id), id).toBe(true);
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
