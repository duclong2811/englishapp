import { grammarFiles as a1Files } from "@/content/grammar/a1";
import { grammarFiles as a2Files } from "@/content/grammar/a2";
import { grammarFiles as b1Files } from "@/content/grammar/b1";
import { GRAMMAR_LEVELS, type GrammarLevel } from "@/content/grammar/syllabus";
import { grammarLessonSchema, type GrammarLesson } from "./schema";

export const GRAMMAR_LEVEL_IDS = Object.keys(GRAMMAR_LEVELS) as GrammarLevel[];

let cache: GrammarLesson[] | null = null;

/** Every written lesson, all levels, in syllabus order. */
export function getGrammarLessons(): GrammarLesson[] {
  cache ??= [...a1Files, ...a2Files, ...b1Files].map((f) => grammarLessonSchema.parse(f));
  return cache;
}

export function getGrammarLesson(id: string) {
  return getGrammarLessons().find((l) => l.id === id);
}

/** The whole syllabus of one level, with the lessons that exist so far. */
export function getSyllabus(level: GrammarLevel = "A1") {
  const ready = new Set(getGrammarLessons().map((l) => l.id));
  return GRAMMAR_LEVELS[level].syllabus.map((s, i) => ({ ...s, number: i + 1, ready: ready.has(s.id) }));
}

/** Previous and next written lessons in the same level, for navigation. */
export function neighbours(id: string) {
  const level = getGrammarLesson(id)?.level ?? "A1";
  const written = getSyllabus(level).filter((s) => s.ready);
  const i = written.findIndex((s) => s.id === id);
  return { prev: written[i - 1] ?? null, next: written[i + 1] ?? null };
}
