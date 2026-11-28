// Question bank for tests. The bank holds raw material (words, grammar
// exercises); each test draws a fresh paper from it, so no two attempts are
// the same and nothing can be learned by heart from a previous attempt.

import { makeCloze, senses, sharesSense, shuffle, type PracticeWord } from "@/components/vocab/quiz";
import type { Exercise } from "@/lib/grammar/schema";
import type { OpenExercise, TestExercise } from "./skills";

export type Section = "vocab" | "listening" | "grammar" | "writing" | "speaking";

export const SECTION_VI: Record<Section, string> = {
  vocab: "Từ vựng",
  listening: "Nghe",
  grammar: "Ngữ pháp",
  writing: "Viết",
  speaking: "Nói",
};

const SECTION_ORDER: Section[] = ["vocab", "listening", "grammar", "writing", "speaking"];

export type BankWord = PracticeWord & { topic: string };
export type GrammarItem = { id: string; lesson: string; unit: string; ex: Exercise };
/** A sentence from a lesson to read aloud. */
export type ReadingItem = { id: string; lesson: string; unit: string; text: string; vi: string };
/** An open writing or speaking task, graded by AI. */
export type OpenItem = { id: string; lesson: string; ex: OpenExercise };

export type Bank = {
  level: string;
  words: BankWord[];
  grammar: GrammarItem[];
  reading: ReadingItem[];
  open: OpenItem[];
  /** Titles for result breakdowns: topic ids and lesson ids. */
  tags: Record<string, { title: string; href: string }>;
  units: { id: string; title: string; lessons: string[] }[];
  topics: { id: string; title: string }[];
};

export type TestItem = { id: string; section: Section; tag: string; ex: TestExercise };

export type VocabKind = "meaning" | "reverse" | "cloze" | "listen";

/** Every item id the bank can produce, for coverage ("đã gặp x% kho câu hỏi"). */
export function bankSize(bank: Pick<Bank, "words" | "grammar" | "reading" | "open">) {
  return bank.words.length * 3 + bank.grammar.length + bank.reading.length + bank.open.length;
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

/** Translating and correcting sentences are writing; the rest is grammar. */
export function isWriting(g: GrammarItem) {
  return g.ex.type === "translate" || g.ex.type === "fix";
}

export function grammarTestItem(g: GrammarItem): TestItem {
  return { id: g.id, section: isWriting(g) ? "writing" : "grammar", tag: g.lesson, ex: g.ex };
}

export function readingTestItem(r: ReadingItem): TestItem {
  return { id: r.id, section: "speaking", tag: r.lesson, ex: { type: "speak", text: r.text, vi: r.vi } };
}

export function openTestItem(o: OpenItem): TestItem {
  return { id: o.id, section: o.ex.mode === "write" ? "writing" : "speaking", tag: o.lesson, ex: o.ex };
}

/** Random order, but items not seen before come first. `key` may give several ids: seen if any of them was. */
function freshFirst<T>(items: T[], key: (t: T) => string | string[], seen: Set<string>) {
  const s = shuffle(items);
  const isSeen = (t: T) => ([] as string[]).concat(key(t)).some((k) => seen.has(k));
  return [...s.filter((t) => !isSeen(t)), ...s.filter(isSeen)];
}

/** A word counts as seen once any question about it was asked. */
const wordIds = (w: BankWord) => (["meaning", "reverse", "cloze"] as VocabKind[]).map((k) => vocabItemId(w.id, k));

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

export const LEVEL_BLUEPRINT = { vocab: 15, listening: 5, grammar: 16, writing: 7, speaking: 7 } as const;
export const SKILLS_BLUEPRINT = { translate: 4, open: 2, reading: 4, talk: 2 } as const;
export const QUICK_SIZE = 12;

/** Spread grammar-bank items over units, and inside each unit over lessons. */
function overUnits<T extends { unit: string; lesson: string; id: string }>(bank: Bank, items: T[], n: number, seen: Set<string>) {
  const units = bank.units.map((u) =>
    spread(groupBy(freshFirst(items.filter((g) => g.unit === u.id), (g) => g.id, seen), (g) => g.lesson), Infinity),
  );
  return spread(units, n);
}

function openItems(bank: Bank, mode: "write" | "speak", n: number, seen: Set<string>) {
  return freshFirst(bank.open.filter((o) => o.ex.mode === mode), (o) => o.id, seen).slice(0, n).map(openTestItem);
}

/** The level test: vocabulary over every topic, listening, grammar over every unit, then writing and speaking. */
export function drawLevelTest(bank: Bank, seen: Set<string>): TestItem[] {
  const B = LEVEL_BLUEPRINT;
  const byTopic = groupBy(freshFirst(bank.words, wordIds, seen), (w) => w.topic);
  const picked = spread(byTopic, B.vocab + B.listening);
  const vocab = vocabItems(picked.slice(0, B.vocab), bank.words, VOCAB_KINDS, seen);
  const listening = picked.slice(B.vocab).map((w) => vocabItem(w, "listen", bank.words));
  const grammar = overUnits(bank, bank.grammar.filter((g) => !isWriting(g)), B.grammar, seen).map(grammarTestItem);
  const writing = [
    ...overUnits(bank, bank.grammar.filter(isWriting), B.writing - 1, seen).map(grammarTestItem),
    ...openItems(bank, "write", 1, seen),
  ];
  const speaking = [...overUnits(bank, bank.reading, B.speaking - 1, seen).map(readingTestItem), ...openItems(bank, "speak", 1, seen)];
  return [...vocab, ...listening, ...grammar, ...writing, ...speaking];
}

/** Writing and speaking only: translate and correct, write freely, read aloud, talk freely. */
export function drawSkillsTest(bank: Bank, seen: Set<string>): TestItem[] {
  const B = SKILLS_BLUEPRINT;
  return [
    ...overUnits(bank, bank.grammar.filter(isWriting), B.translate, seen).map(grammarTestItem),
    ...openItems(bank, "write", B.open, seen),
    ...overUnits(bank, bank.reading, B.reading, seen).map(readingTestItem),
    ...openItems(bank, "speak", B.talk, seen),
  ];
}

/** Quick test for one grammar unit. */
export function drawUnitTest(bank: Bank, unitId: string, seen: Set<string>): TestItem[] {
  const items = freshFirst(bank.grammar.filter((g) => g.unit === unitId), (g) => g.id, seen);
  const reading = freshFirst(bank.reading.filter((r) => r.unit === unitId), (r) => r.id, seen).slice(0, 2).map(readingTestItem);
  const grammar = spread(groupBy(items, (g) => g.lesson), QUICK_SIZE - reading.length).map(grammarTestItem);
  return [...shuffle(grammar), ...reading];
}

/** Quick test for one vocabulary topic: every word once if possible, mixed question kinds. */
export function drawTopicTest(bank: Bank, topicId: string, seen: Set<string>): TestItem[] {
  const words = freshFirst(bank.words.filter((w) => w.topic === topicId), wordIds, seen);
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
  const sections = SECTION_ORDER
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
