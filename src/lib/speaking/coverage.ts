import "server-only";
import { getStudyWord, getTopic } from "@/lib/vocab/data";
import type { Lesson } from "./lessons";

/** Spellings that count as using a word: the headword and its inflected forms. */
export function wordForms(id: string): string[] {
  const w = getStudyWord(id);
  const base = w ? [w.headword, ...Object.values(w.forms)] : [id.replace(/-/g, " ")];
  const all = base.flatMap((f) => (f.endsWith(".") && !f.slice(0, -1).includes(".") ? [f, f.slice(0, -1)] : [f]));
  return [...new Set(all)].sort((a, b) => b.length - a.length);
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Letter boundaries rather than \b so "a.m." and "o'clock" match too. */
export function formsPattern(forms: string[]) {
  return new RegExp(`(?<![a-z])(?:${forms.map(escapeRegExp).join("|")})(?![a-z])`, "i");
}

export function lessonCoverage(lesson: Lesson) {
  const topic = getTopic(lesson.topic);
  const ids = topic?.words ?? [];
  const text = lesson.lines.map((l) => l.en).join("\n");
  const covered: string[] = [];
  const missing: string[] = [];
  for (const id of ids) (formsPattern(wordForms(id)).test(text) ? covered : missing).push(id);
  return { covered, missing, ratio: ids.length ? covered.length / ids.length : 0 };
}

/** Words of the lesson's topic that appear in it, with their spellings and meaning, for highlighting. */
export function lessonVocab(lesson: Lesson) {
  return lessonCoverage(lesson).covered.map((id) => {
    const w = getStudyWord(id);
    return { id, forms: wordForms(id), vi: w?.meanings[0]?.vi ?? "" };
  });
}

/** Lessons must use at least this share of their topic's words. */
export const MIN_COVERAGE = 0.8;
