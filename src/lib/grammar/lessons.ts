import { grammarFiles } from "@/content/grammar/a1";
import { A1_SYLLABUS } from "@/content/grammar/syllabus";
import { grammarLessonSchema, type GrammarLesson } from "./schema";

let cache: GrammarLesson[] | null = null;

export function getGrammarLessons(): GrammarLesson[] {
  cache ??= grammarFiles.map((f) => grammarLessonSchema.parse(f));
  return cache;
}

export function getGrammarLesson(id: string) {
  return getGrammarLessons().find((l) => l.id === id);
}

/** The whole syllabus, with the lessons that exist so far. */
export function getSyllabus() {
  const ready = new Set(getGrammarLessons().map((l) => l.id));
  return A1_SYLLABUS.map((s, i) => ({ ...s, number: i + 1, ready: ready.has(s.id) }));
}

/** Previous and next written lessons, for navigation. */
export function neighbours(id: string) {
  const written = getSyllabus().filter((s) => s.ready);
  const i = written.findIndex((s) => s.id === id);
  return { prev: written[i - 1] ?? null, next: written[i + 1] ?? null };
}
