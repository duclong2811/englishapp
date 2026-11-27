import "server-only";

import { GRAMMAR_LEVELS, type GrammarLevel } from "@/content/grammar/syllabus";
import { getGrammarLessons } from "@/lib/grammar/lessons";
import type { Exercise } from "@/lib/grammar/schema";
import { getVocabData, toPracticeWord } from "@/lib/vocab/data";
import type { Bank, GrammarItem } from "./bank";

export const TEST_LEVELS: GrammarLevel[] = ["A1", "A2"];

export function toTestLevel(param: string): GrammarLevel | undefined {
  return TEST_LEVELS.find((l) => l.toLowerCase() === param);
}

/** Quick checks from the lesson screens can join the bank when they can be answered by typing. */
function checkAsExercise(check: { prompt: string; options: string[]; answer: number; explain: string }): Exercise | null {
  if (check.prompt.includes("___") && !/^[A-Za-z' ]+$/.test(check.options[check.answer])) return null;
  return { type: "choice", ...check };
}

/** Everything a level's tests can draw from: its topic words and its grammar exercises. */
export async function buildBank(level: GrammarLevel): Promise<Bank> {
  const { getTopics, getStudyWord } = await getVocabData();
  const topics = getTopics(level);
  const words = topics.flatMap((t) =>
    t.words.map((id) => ({ ...toPracticeWord(getStudyWord(id)!), topic: t.id })),
  );

  const { units, syllabus } = GRAMMAR_LEVELS[level];
  const unitOf = new Map(units.flatMap((u) => u.lessons.map((l) => [l, u.id] as const)));
  const lessons = getGrammarLessons().filter((l) => l.level === level);
  const grammar: GrammarItem[] = lessons.flatMap((l) => {
    const unit = unitOf.get(l.id)!;
    const fromExercises = l.exercises.map((ex, i) => ({ id: `g:${l.id}:${i}`, lesson: l.id, unit, ex }));
    const fromChecks = l.sections.flatMap((s, i) => {
      const ex = s.check ? checkAsExercise(s.check) : null;
      return ex ? [{ id: `g:${l.id}:c${i}`, lesson: l.id, unit, ex }] : [];
    });
    return [...fromExercises, ...fromChecks];
  });

  const written = new Set(lessons.map((l) => l.id));
  const tags: Bank["tags"] = {};
  for (const t of topics) tags[t.id] = { title: t.title, href: `/vocabulary/topic/${t.id}` };
  for (const s of syllabus) if (written.has(s.id)) tags[s.id] = { title: s.title, href: `/lessons/${s.id}` };

  return {
    level,
    words,
    grammar,
    tags,
    units: units.map((u) => ({ ...u, lessons: u.lessons.filter((l) => written.has(l)) })).filter((u) => u.lessons.length),
    topics: topics.map((t) => ({ id: t.id, title: t.title })),
  };
}
