import { GRAMMAR_LEVELS } from "@/content/grammar/syllabus";

/** Title of a grammar lesson in any level. */
export function findLessonTitle(id: string) {
  for (const { syllabus } of Object.values(GRAMMAR_LEVELS)) {
    const hit = syllabus.find((s) => s.id === id);
    if (hit) return hit.title;
  }
  return undefined;
}
