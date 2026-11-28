// Turns stored progress (the synced localStorage values) into per-level
// progress and weak spots. Used by the learner's page and the admin profile.

export type LearningCatalog = {
  levels: {
    level: string;
    /** Vocabulary topics in learning order; sets are the ~10-word study sets. */
    topics: { id: string; title: string; sets: string[][] }[];
    /** Written grammar lessons in syllabus order. */
    lessons: { id: string; title: string }[];
    /** Grammar chapters (lesson ids, written or not). */
    units: { id: string; title: string; lessons: string[] }[];
  }[];
  /** Vocabulary topics that have a speaking lesson. */
  speaking: { topic: string; title: string }[];
};

type Card = { lapses?: number; state?: number; due?: string };
type Score = { best: number; at: string };

export type ProgressState = {
  cards: Record<string, Card>;
  grammar: Record<string, Score>;
  tests: Record<string, Score>;
};

export const PASS = 80;

/** Reads the synced values (JSON strings by key) into one state. */
export function readProgress(values: Record<string, string | null | undefined>): ProgressState {
  const parse = <T,>(raw: string | null | undefined, fallback: T): T => {
    try {
      const v = raw ? JSON.parse(raw) : null;
      return v && typeof v === "object" ? (v as T) : fallback;
    } catch {
      return fallback;
    }
  };
  const srs = parse<{ cards?: Record<string, Card> }>(values["vocab:srs:v1"], {});
  return {
    cards: srs.cards ?? {},
    grammar: parse<Record<string, Score>>(values["grammar:a1:v1"], {}),
    tests: parse<Record<string, Score>>(values["tests:scores:v1"], {}),
  };
}

export type LevelSummary = {
  level: string;
  words: { learned: number; total: number };
  lessons: { passed: number; total: number };
  levelTest: number | null;
};

export type WeakLesson = { id: string; title: string; level: string; best: number };
export type WeakTopic = { id: string; title: string; level: string; forgotten: number; due: number };

export function summarize(catalog: LearningCatalog, state: ProgressState, now = new Date()) {
  const levels: LevelSummary[] = catalog.levels.map((l) => {
    const ids = l.topics.flatMap((t) => t.sets.flat());
    return {
      level: l.level,
      words: { learned: ids.filter((id) => state.cards[id]).length, total: ids.length },
      lessons: { passed: l.lessons.filter((x) => (state.grammar[x.id]?.best ?? 0) >= PASS).length, total: l.lessons.length },
      levelTest: state.tests[`level:${l.level}`]?.best ?? null,
    };
  });

  const weakLessons: WeakLesson[] = catalog.levels
    .flatMap((l) => l.lessons.map((x) => ({ ...x, level: l.level, best: state.grammar[x.id]?.best })))
    .filter((x): x is WeakLesson => x.best !== undefined && x.best < PASS)
    .sort((a, b) => a.best - b.best)
    .slice(0, 5);

  const weakTopics: WeakTopic[] = catalog.levels
    .flatMap((l) =>
      l.topics.map((t) => {
        let forgotten = 0;
        let due = 0;
        for (const id of t.sets.flat()) {
          const c = state.cards[id];
          if (!c) continue;
          if ((c.lapses ?? 0) > 0) forgotten++;
          if (c.due && new Date(c.due) <= now) due++;
        }
        return { id: t.id, title: t.title, level: l.level, forgotten, due };
      }),
    )
    .filter((t) => t.forgotten > 0 || t.due > 0)
    .sort((a, b) => b.forgotten - a.forgotten || b.due - a.due)
    .slice(0, 5);

  /** The level being worked on: the first with words or lessons left, among those started. */
  const started = levels.filter((l) => l.words.learned || l.lessons.passed);
  const current =
    started.find((l) => l.words.learned < l.words.total || l.lessons.passed < l.lessons.total) ?? started.at(-1) ?? levels[0];

  return { levels, weakLessons, weakTopics, current: current?.level ?? null };
}

/** Totals kept per user for the admin list. */
export function totals(state: ProgressState) {
  return {
    words: Object.keys(state.cards).length,
    lessons: Object.values(state.grammar).filter((s) => s.best >= PASS).length,
    tests: Object.keys(state.tests).length,
  };
}
