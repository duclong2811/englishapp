// Question building for vocabulary quizzes (practice mode and set learning).

export type PracticeWord = {
  id: string;
  headword: string;
  ipa: string | null;
  meaning: string;
  /** Parts of speech taught for this word (e.g. "verb"). */
  pos: string[];
  forms: Record<string, string>;
  examples: { en: string; vi: string }[];
};

export type Kind = "listen" | "cloze" | "meaning";

export type Question = {
  kind: Kind;
  word: PracticeWord;
  options: string[];
  answer: number;
  cloze?: { before: string; after: string; vi: string; full: string };
};

export const SESSION_SIZE = 10;

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Finds the first example that contains the word (or one of its forms) as a whole word. */
export function makeCloze(word: PracticeWord) {
  const candidates = [word.headword, ...Object.values(word.forms)].sort((a, b) => b.length - a.length);
  for (const ex of word.examples) {
    for (const form of candidates) {
      // Letter boundaries rather than \\b so "a.m.", "Mr." and "o'clock" match too.
      const re = new RegExp(`(?<![a-z])${escapeRegExp(form)}(?![a-z])`, "i");
      const m = re.exec(ex.en);
      if (m) {
        return {
          token: m[0],
          before: ex.en.slice(0, m.index),
          after: ex.en.slice(m.index + m[0].length),
          vi: ex.vi,
          full: ex.en,
        };
      }
    }
  }
  return null;
}

const FORM_POS: Record<string, string[]> = {
  past: ["verb"],
  pastParticiple: ["verb"],
  ing: ["verb"],
  thirdPerson: ["verb"],
  plural: ["noun"],
  comparative: ["adjective", "adverb"],
  superlative: ["adjective", "adverb"],
};

function senses(meaning: string): string[] {
  return meaning
    .replace(/\([^)]*\)/g, "")
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Two meanings clash if a sense equals or is contained in another ("chào" / "xin chào"). */
export function sharesSense(a: string[], b: string[]) {
  const within = (x: string, y: string) => ` ${y} `.includes(` ${x} `);
  return a.some((x) => b.some((y) => within(x, y) || within(y, x)));
}

export function buildSession(
  pool: PracticeWord[],
  all: PracticeWord[],
  canSpeak: boolean,
  size = SESSION_SIZE,
): Question[] {
  const kinds: Kind[] = canSpeak ? ["listen", "cloze", "meaning"] : ["cloze", "meaning"];
  const picked = shuffle(pool).slice(0, size);
  return picked.map((word, i) => {
    // Leave out near-synonyms (any shared Vietnamese sense, e.g. big/large "lớn",
    // begin/start "bắt đầu"), so there is exactly one right answer.
    const own = senses(word.meaning);
    const candidates = shuffle(all.filter((w) => w.id !== word.id && !sharesSense(own, senses(w.meaning))));
    /** Three distractors whose label differs from the answer and from each other. */
    const distinctFrom = (pool: PracticeWord[], answer: string, label: (w: PracticeWord) => string) => {
      const seen = new Set([answer.toLowerCase()]);
      const out: string[] = [];
      for (const w of pool) {
        const l = label(w);
        if (seen.has(l.toLowerCase())) continue;
        seen.add(l.toLowerCase());
        out.push(l);
        if (out.length === 3) break;
      }
      return out;
    };
    const distinct = (answer: string, label: (w: PracticeWord) => string) => distinctFrom(candidates, answer, label);

    let kind = kinds[i % kinds.length];
    const cloze = kind === "cloze" ? makeCloze(word) : null;
    if (kind === "cloze" && !cloze) kind = "meaning";

    if (kind === "cloze" && cloze) {
      const lower = cloze.token.toLowerCase();
      const isCapital = cloze.token[0] !== cloze.token[0].toLowerCase();
      const fit = (s: string) => (isCapital ? s[0].toUpperCase() + s.slice(1) : s);
      // Distractors in the same grammatical form as the answer (e.g. past "went" vs "came").
      const formKey = Object.entries(word.forms).find(([, v]) => v.toLowerCase() === lower)?.[0];
      const answer = fit(lower);
      // Only use a form of a word taught in that part of speech: "placed" must not
      // appear when "place" is taught as a noun.
      const needs = formKey ? FORM_POS[formKey] : null;
      const shaped = needs ? candidates.filter((w) => w.forms[formKey!] && needs.some((p) => w.pos.includes(p))) : [];
      const distractors =
        needs && shaped.length >= 3
          ? distinctFrom(shaped, answer, (w) => fit(w.forms[formKey!].toLowerCase()))
          : distinct(answer, (w) => fit(w.headword.toLowerCase()));
      const options = shuffle([answer, ...distractors]);
      return { kind, word, options, answer: options.indexOf(answer), cloze };
    }
    if (kind === "meaning") {
      const options = shuffle([word.headword, ...distinct(word.headword, (w) => w.headword)]);
      return { kind, word, options, answer: options.indexOf(word.headword) };
    }
    const options = shuffle([word.meaning, ...distinct(word.meaning, (w) => w.meaning)]);
    return { kind: "listen", word, options, answer: options.indexOf(word.meaning) };
  });
}
