// Flashcards for quick self-checks: one card per grammar rule, per typical
// mistake and per word. The learner looks at the front, recalls, flips,
// and says whether they remembered.

import type { GrammarLesson } from "@/lib/grammar/schema";

export type RuleCard = {
  kind: "rule";
  id: string;
  /** What to recall, e.g. "Been to hay gone to?". */
  cue: string;
  /** Step of the lesson the rule comes from ("Cấu tạo", "Cách dùng"…). */
  part: string | null;
  lesson: string;
  rule: string;
  formula: string[];
  example: { en: string; vi: string; why?: string } | null;
  /** For rules taught with a table instead of examples (first rows only). */
  table: { head: string[]; rows: string[][] } | null;
};

export type MistakeCard = { kind: "mistake"; id: string; lesson: string; wrong: string; right: string; why: string };

export type WordCard = {
  kind: "word";
  id: string;
  headword: string;
  ipa: string | null;
  meaning: string;
  /** How the word is used: collocations, patterns, words it is confused with. */
  note: string;
  example: { en: string; vi: string } | null;
};

export type Flashcard = RuleCard | MistakeCard | WordCard;

/** Headings sometimes start with a step number ("1. Thói quen…"): the card does not need it. */
function cue(heading: string) {
  return heading.replace(/^\d+\.\s*/, "");
}

/** Every rule of the lesson, then its three most typical mistakes. */
export function lessonCards(lesson: GrammarLesson): Flashcard[] {
  const rules: Flashcard[] = lesson.sections.flatMap((s, i) =>
    s.rule
      ? [
          {
            kind: "rule" as const,
            id: `${lesson.id}:r${i}`,
            cue: cue(s.heading),
            part: s.part ?? null,
            lesson: lesson.id,
            rule: s.rule,
            formula: s.formula.filter((f) => !f.label).map((f) => f.text).slice(0, 2),
            example: s.examples[0] ?? null,
            table: !s.examples.length && s.table ? { head: s.table.head, rows: s.table.rows.slice(0, 4) } : null,
          },
        ]
      : [],
  );
  const mistakes: Flashcard[] = lesson.mistakes.slice(0, 3).map((m, i) => ({
    kind: "mistake",
    id: `${lesson.id}:m${i}`,
    lesson: lesson.id,
    ...m,
  }));
  return [...rules, ...mistakes];
}

export function wordCard(w: {
  id: string;
  headword: string;
  ipa: string | null;
  meanings: { vi: string }[];
  note: string;
  examples: { en: string; vi: string }[];
}): WordCard {
  return {
    kind: "word",
    id: w.id,
    headword: w.headword,
    ipa: w.ipa,
    meaning: w.meanings.map((m) => m.vi).join("; "),
    note: w.note,
    example: w.examples[0] ? { en: w.examples[0].en, vi: w.examples[0].vi } : null,
  };
}
