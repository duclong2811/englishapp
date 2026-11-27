import { expect, it } from "vitest";
import { GRAMMAR_LEVELS } from "@/content/grammar/syllabus";

it.each(Object.entries(GRAMMAR_LEVELS))("groups each %s lesson in exactly one unit while preserving teaching order", (_, { syllabus, units }) => {
  expect(units.flatMap((unit) => unit.lessons)).toEqual(syllabus.map((lesson) => lesson.id));
});

it("uses each lesson id in one level only", () => {
  const ids = Object.values(GRAMMAR_LEVELS).flatMap(({ syllabus }) => syllabus.map((s) => s.id));
  expect(new Set(ids).size).toBe(ids.length);
});
