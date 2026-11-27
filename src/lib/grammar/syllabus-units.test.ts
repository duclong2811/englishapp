import { expect, it } from "vitest";
import { A1_SYLLABUS, A1_UNITS } from "@/content/grammar/syllabus";

it("groups each A1 lesson in exactly one unit while preserving teaching order", () => {
  expect(A1_UNITS.flatMap((unit) => unit.lessons)).toEqual(A1_SYLLABUS.map((lesson) => lesson.id));
});
