// Question bank for tests. The bank holds raw material (words, grammar
// exercises); each test draws a fresh paper from it, so no two attempts are
// the same and nothing can be learned by heart from a previous attempt.

import { makeCloze, senses, sharesSense, shuffle, type PracticeWord } from "@/components/vocab/quiz";
import type { Exercise } from "@/lib/grammar/schema";

export type Section = "vocab" | "listening" | "grammar";

export const SECTION_VI: Record<Section, string> = {
  vocab: "Từ vựng",
  listening: "Nghe",
  grammar: "Ngữ pháp",
};

export type BankWord = PracticeWord & { topic: string };
export type GrammarItem = { id: string; lesson: string; unit: string; ex: Exercise };

export type Bank = {
  level: string;
  words: BankWord[];
  grammar: GrammarItem[];
  /** Titles for result breakdowns: topic ids and lesson ids. */
  tags: Record<string, { title: string; href: string }>;
  units: { id: string; title: string; lessons: string[] }[];
  topics: { id: string; title: string }[];
};

export type TestItem = { id: string; section: Section; tag: string; ex: Exercise };

export type VocabKind = "meaning" | "reverse" | "cloze" | "listen";

/** Every item id the bank can produce, for coverage ("đã gặp x% kho câu hỏi"). */
export function bankSize(bank: Pick<Bank, "words" | "grammar">) {
  return bank.words.length * 3 + bank.grammar.length;
}

export function vocabItemId(word: string, kind: VocabKind) {
  // Listening and meaning test the same knowledge (what the word means), so they share coverage.
  return `v:${word}:${kind === "listen" ? "meaning" : kind}`;
}

/** Up to three labels that differ from the answer, from each other, and do not share a sense with it. */
function distractors(word: BankWord, pool: BankWord[], label: (w: BankWord) => string) {
  const own = senses(word.meaning);
  const seen = new Set([label(word).toLowerCase()]);
  const out: string[] = [];
  for (const w of shuffle(pool)) {
    if (w.id === word.id || sharesSense(own, senses(w.meaning))) continue;
    const l = label(w);
    if (seen.has(l.toLowerCase())) continue;
    seen.add(l.toLowerCase());
    out.push(l);
    if (out.length === 3) break;
  }
  return out;
}

function choice(answer: string, wrong: string[], rest: Omit<Extract<Exercise, { type: "choice" }>, "type" | "options" | "answer">): Exercise {
  const options = shuffle([answer, ...wrong]);
  return { type: "choice", options, answer: options.indexOf(answer), ...rest };
}

/** One vocabulary question. Distractors come from the same topic first, then the whole level. */
export function vocabItem(word: BankWord, kind: VocabKind, all: BankWord[]): TestItem {
  const near = all.filter((w) => w.topic === word.topic);
  const pool = near.length >= 8 ? near : all;
  const explain = `${word.headword}: ${word.meaning}.`;
  const section: Section = kind === "listen" ? "listening" : "vocab";
  const id = vocabItemId(word.id, kind);

  if (kind === "cloze") {
    const c = makeCloze(word);
    if (c) {
      const base = c.token.toLowerCase() === word.headword.toLowerCase() ? word.meaning : `${word.headword}: ${word.meaning}`;
      return {
        id,
        section,
        tag: word.topic,
        ex: { type: "fill", prompt: `${c.before}___${c.after}`, hint: base, answers: [c.token], explain: `${explain} ${c.vi}` },
      };
    }
    kind = "reverse";
  }
  if (kind === "reverse") {
    return {
      id: vocabItemId(word.id, "reverse"),
      section,
      tag: word.topic,
      ex: choice(word.headword, distractors(word, pool, (w) => w.headword), {
        prompt: `Từ tiếng Anh nào nghĩa là “${word.meaning}”?`,
        explain,
      }),
    };
  }
  const wrong = distractors(word, pool, (w) => w.meaning);
  if (kind === "listen") {
    return {
      id,
      section,
      tag: word.topic,
      ex: choice(word.meaning, wrong, { prompt: "Bấm nghe rồi chọn nghĩa đúng của từ.", audio: word.headword, optionsLang: "vi", explain }),
    };
  }
  return {
    id,
    section,
    tag: word.topic,
    ex: choice(word.meaning, wrong, { prompt: `“${word.headword}” nghĩa là gì?`, optionsLang: "vi", explain }),
  };
}

export function grammarTestItem(g: GrammarItem): TestItem {
  return { id: g.id, section: "grammar", tag: g.lesson, ex: g.ex };
}

/** Random order, but items not seen before come first. */
function freshFirst<T>(items: T[], key: (t: T) => string, seen: Set<string>) {
  const s = shuffle(items);
  return [...s.filter((t) => !seen.has(key(t))), ...s.filter((t) => seen.has(key(t)))];
}

/**
 * Picks `n` items spread over groups (topics, units, lessons): one from each
 * group in turn, so every part of the syllabus gets its share.
 */
function spread<T>(groups: T[][], n: number): T[] {
  const queues = shuffle(groups.filter((g) => g.length).map((g) => [...g]));
  const out: T[] = [];
  while (out.length < n && queues.some((q) => q.length)) {
    for (const q of queues) {
      const next = q.shift();
      if (next !== undefined) out.push(next);
      if (out.length === n) break;
    }
  }
  return out;
}

function groupBy<T>(items: T[], key: (t: T) => string) {
  const m = new Map<string, T[]>();
  for (const t of items) m.set(key(t), [...(m.get(key(t)) ?? []), t]);
  return [...m.values()];
}

const VOCAB_KINDS: VocabKind[] = ["meaning", "cloze", "reverse"];

function vocabItems(words: BankWord[], all: BankWord[], kinds: VocabKind[], seen: Set<string>) {
  return words.map((w, i) => {
    // Prefer a kind of question this learner has not met for this word.
    const order = [...kinds.slice(i % kinds.length), ...kinds.slice(0, i % kinds.length)];
    const kind = order.find((k) => !seen.has(vocabItemId(w.id, k))) ?? order[0];
    return vocabItem(w, kind, all);
  });
}

export const LEVEL_BLUEPRINT = { vocab: 20, listening: 5, grammar: 25 } as const;
export const QUICK_SIZE = 12;

/** The level test: vocabulary over every topic, listening, then grammar over every unit. */
export function drawLevelTest(bank: Bank, seen: Set<string>): TestItem[] {
  const byTopic = groupBy(freshFirst(bank.words, (w) => vocabItemId(w.id, "meaning"), seen), (w) => w.topic);
  const picked = spread(byTopic, LEVEL_BLUEPRINT.vocab + LEVEL_BLUEPRINT.listening);
  const vocab = vocabItems(picked.slice(0, LEVEL_BLUEPRINT.vocab), bank.words, VOCAB_KINDS, seen);
  const listening = picked.slice(LEVEL_BLUEPRINT.vocab).map((w) => vocabItem(w, "listen", bank.words));

  // Grammar: one unit at a time, and inside each unit one lesson at a time.
  const units = bank.units.map((u) =>
    spread(groupBy(freshFirst(bank.grammar.filter((g) => g.unit === u.id), (g) => g.id, seen), (g) => g.lesson), Infinity),
  );
  const grammar = spread(units, LEVEL_BLUEPRINT.grammar).map(grammarTestItem);
  return [...vocab, ...listening, ...grammar];
}

/** Quick test for one grammar unit. */
export function drawUnitTest(bank: Bank, unitId: string, seen: Set<string>): TestItem[] {
  const items = freshFirst(bank.grammar.filter((g) => g.unit === unitId), (g) => g.id, seen);
  return shuffle(spread(groupBy(items, (g) => g.lesson), QUICK_SIZE)).map(grammarTestItem);
}

/** Quick test for one vocabulary topic: every word once if possible, mixed question kinds. */
export function drawTopicTest(bank: Bank, topicId: string, seen: Set<string>): TestItem[] {
  const words = freshFirst(bank.words.filter((w) => w.topic === topicId), (w) => vocabItemId(w.id, "meaning"), seen);
  const picked = words.length >= QUICK_SIZE ? words.slice(0, QUICK_SIZE) : [...words, ...shuffle(words)].slice(0, QUICK_SIZE);
  return shuffle(vocabItems(picked, bank.words, ["meaning", "cloze", "reverse", "listen"], seen));
}

export type Summary = {
  right: number;
  total: number;
  percent: number;
  sections: { section: Section; right: number; total: number }[];
  /** Tags with at least one wrong answer, weakest first. */
  weak: { tag: string; wrong: number; total: number }[];
};

export function summarize(items: TestItem[], right: boolean[]): Summary {
  const sections = (["vocab", "listening", "grammar"] as Section[])
    .map((section) => {
      const idx = items.flatMap((it, i) => (it.section === section ? [i] : []));
      return { section, right: idx.filter((i) => right[i]).length, total: idx.length };
    })
    .filter((s) => s.total > 0);
  const tags = new Map<string, { wrong: number; total: number }>();
  items.forEach((it, i) => {
    const t = tags.get(it.tag) ?? { wrong: 0, total: 0 };
    t.total++;
    if (!right[i]) t.wrong++;
    tags.set(it.tag, t);
  });
  const weak = [...tags.entries()]
    .filter(([, t]) => t.wrong > 0)
    .map(([tag, t]) => ({ tag, ...t }))
    .sort((a, b) => b.wrong / b.total - a.wrong / a.total || b.wrong - a.wrong);
  const n = right.filter(Boolean).length;
  return { right: n, total: items.length, percent: items.length ? Math.round((n / items.length) * 100) : 0, sections, weak };
}

export const PASS_PERCENT = 80;
