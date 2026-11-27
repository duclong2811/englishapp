"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SpeakButton } from "@/components/speak-button";
import { getServerSnapshot, getSnapshot, subscribe } from "@/lib/vocab/srs-store";

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

type Kind = "listen" | "cloze" | "meaning";

type Question = {
  kind: Kind;
  word: PracticeWord;
  options: string[];
  answer: number;
  cloze?: { before: string; after: string; vi: string; full: string };
};

const SESSION_SIZE = 10;
const MIN_POOL = 4;

function shuffle<T>(items: T[]): T[] {
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
      const re = new RegExp(`\\b${escapeRegExp(form)}\\b`, "i");
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

export function buildSession(pool: PracticeWord[], all: PracticeWord[], canSpeak: boolean): Question[] {
  const kinds: Kind[] = canSpeak ? ["listen", "cloze", "meaning"] : ["cloze", "meaning"];
  const picked = shuffle(pool).slice(0, SESSION_SIZE);
  return picked.map((word, i) => {
    // Leave out near-synonyms (any shared Vietnamese sense, e.g. big/large "lớn",
    // begin/start "bắt đầu"), so there is exactly one right answer.
    const own = new Set(senses(word.meaning));
    const candidates = shuffle(all.filter((w) => w.id !== word.id && !senses(w.meaning).some((s) => own.has(s))));
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

const PROMPT: Record<Kind, string> = {
  listen: "Nghe và chọn nghĩa đúng",
  cloze: "Chọn từ điền vào chỗ trống",
  meaning: "Chọn từ tiếng Anh có nghĩa này",
};

const primary =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const noopSubscribe = () => () => {};

export function Practice({ words }: { words: PracticeWord[] }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const canSpeak = useSyncExternalStore(noopSubscribe, () => "speechSynthesis" in window, () => false);
  const [session, setSession] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [missed, setMissed] = useState<PracticeWord[]>([]);
  const nextRef = useRef<HTMLButtonElement>(null);
  const promptRef = useRef<HTMLHeadingElement>(null);

  const learned = state ? words.filter((w) => state.cards[w.id]) : [];
  const pool = learned.length >= MIN_POOL ? learned : words;
  const usingLearned = learned.length >= MIN_POOL;

  const q = session ? session[index] : null;
  const done = session !== null && index >= session.length;

  function start() {
    setSession(buildSession(pool, words, canSpeak));
    setIndex(0);
    setChosen(null);
    setMissed([]);
  }

  function choose(i: number) {
    if (!q || chosen !== null) return;
    setChosen(i);
    if (i !== q.answer) setMissed((m) => [...m, q.word]);
  }

  function next() {
    setChosen(null);
    setIndex((n) => n + 1);
  }

  // Move focus to the next action after answering, and back to the prompt for a new question.
  useEffect(() => {
    if (chosen !== null) nextRef.current?.focus();
    else promptRef.current?.focus();
  }, [chosen, index]);

  const chooseRef = useRef(choose);
  const nextFnRef = useRef(next);
  const chosenRef = useRef(chosen);
  useEffect(() => {
    chooseRef.current = choose;
    nextFnRef.current = next;
    chosenRef.current = chosen;
  });
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (chosenRef.current === null && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        chooseRef.current(Number(e.key) - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!session) {
    return (
      <section className="max-w-[42rem]">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Luyện tập từ vựng</h1>
        <p className="mt-3 text-lg text-ink-soft text-pretty">
          {SESSION_SIZE} câu trộn ba dạng: nghe chọn nghĩa, điền từ vào câu, và nhìn nghĩa chọn từ.
        </p>
        <p className="mt-2 text-ink-soft text-pretty" aria-live="polite">
          {state === null
            ? "Đang tải…"
            : usingLearned
              ? `Câu hỏi lấy từ ${learned.length} từ bạn đã học.`
              : `Bạn chưa học đủ ${MIN_POOL} từ nên câu hỏi lấy từ cả ${words.length} từ cốt lõi.`}
        </p>
        <button type="button" onClick={start} disabled={state === null} className={`${primary} mt-8 disabled:opacity-50`}>
          Bắt đầu
        </button>
      </section>
    );
  }

  if (done || !q) {
    const correct = session.length - missed.length;
    return (
      <section className="max-w-[42rem]" aria-live="polite">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Đúng {correct}/{session.length} câu
        </h1>
        {missed.length > 0 ? (
          <>
            <p className="mt-3 text-lg text-ink-soft">Xem lại những từ bạn chọn sai:</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {missed.map((w) => (
                <li key={w.id}>
                  <Link
                    href={`/vocabulary/word/${w.id}`}
                    lang="en"
                    className="en inline-flex min-h-11 items-center rounded-full border border-mistake/40 bg-sheet px-4 text-lg text-mistake hover:bg-mistake/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {w.headword}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-3 text-lg text-ink-soft">Không sai câu nào. Làm tốt lắm.</p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={start} className={primary}>
            Luyện thêm 10 câu
          </button>
          <Link
            href="/vocabulary"
            className="inline-flex min-h-12 items-center rounded-full border border-line bg-sheet px-6 font-semibold hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Về trang từ vựng
          </Link>
        </div>
      </section>
    );
  }

  const answered = chosen !== null;
  const right = answered && chosen === q.answer;

  return (
    <div className="mx-auto max-w-[42rem]">
      <div className="mb-4 flex items-center justify-between text-sm text-ink-soft">
        <Link href="/vocabulary" className="back-link">
          ← Dừng
        </Link>
        <span className="tabular-nums">
          Câu {index + 1}/{session.length}
        </span>
      </div>

      <section className="oli rounded-2xl border border-line p-6 sm:p-8" aria-labelledby="prompt">
        <h1 id="prompt" ref={promptRef} tabIndex={-1} className="text-sm font-medium text-ink-soft outline-none">
          {PROMPT[q.kind]}
        </h1>

        {q.kind === "listen" ? (
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <SpeakButton key={`${index}`} text={q.word.headword} label="Nghe từ" />
            {answered ? (
              <span lang="en" className="en text-4xl">
                {q.word.headword}
              </span>
            ) : null}
          </div>
        ) : null}

        {q.kind === "cloze" && q.cloze ? (
          <>
            <p lang="en" className="en mt-4 text-2xl leading-snug text-pretty sm:text-3xl">
              {q.cloze.before}
              <span
                className={`inline-block min-w-[4ch] border-b-2 px-1 text-center ${
                  answered ? (right ? "border-correct text-correct" : "border-mistake text-mistake") : "border-ink-soft"
                }`}
              >
                {answered ? q.options[q.answer] : <span className="sr-only">chỗ trống</span>}
              </span>
              {q.cloze.after}
            </p>
            <p className="mt-3 text-ink-soft">{q.cloze.vi}</p>
          </>
        ) : null}

        {q.kind === "meaning" ? <p className="mt-4 text-3xl font-semibold text-pretty">{q.word.meaning}</p> : null}
      </section>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          const isAnswer = i === q.answer;
          const isChosen = i === chosen;
          const english = q.kind !== "listen";
          let tone = "border-line bg-sheet hover:border-accent";
          if (answered && isAnswer) tone = "border-correct bg-correct/15 text-ink";
          else if (answered && isChosen) tone = "border-mistake bg-mistake/15 text-ink";
          else if (answered) tone = "border-line bg-sheet opacity-50";
          const tag = answered && isAnswer ? "Đúng" : answered && isChosen ? "Bạn chọn" : null;
          return (
            <li key={`${index}-${opt}`}>
              <button
                type="button"
                onClick={() => choose(i)}
                disabled={answered}
                aria-pressed={isChosen}
                className={`flex min-h-14 w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${tone}`}
              >
                <span
                  aria-hidden="true"
                  className="hidden size-7 shrink-0 place-items-center rounded-md border border-current text-sm tabular-nums opacity-70 [@media(pointer:fine)]:grid"
                >
                  {i + 1}
                </span>
                <span
                  lang={english ? "en" : undefined}
                  className={`min-w-0 flex-1 ${english ? "en text-xl" : "text-lg font-medium"}`}
                >
                  {opt}
                </span>
                {tag ? (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-sm font-semibold ${
                      isAnswer ? "bg-correct text-paper" : "bg-mistake text-paper"
                    }`}
                  >
                    {tag}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      {answered ? (
        <div
          aria-live="polite"
          className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] mt-6 border-t border-line bg-paper/95 py-3 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:backdrop-blur-none"
        >
          <p className={`font-semibold ${right ? "text-correct" : "text-mistake"}`}>
            {right ? "Đúng rồi." : `Chưa đúng. Đáp án: ${q.options[q.answer]}`}
          </p>
          <p className="mt-1 truncate">
            <span lang="en" className="en text-lg">
              {q.word.headword}
            </span>
            {q.word.ipa ? (
              <span translate="no" className="ml-2 text-ink-soft">
                /{q.word.ipa}/
              </span>
            ) : null}
            <span className="ml-2">= {q.word.meaning}</span>
          </p>
          <button ref={nextRef} type="button" onClick={next} className={`${primary} mt-3 w-full sm:w-auto`}>
            {index + 1 < session.length ? "Câu tiếp theo" : "Xem kết quả"}
          </button>
        </div>
      ) : (
        <p className="mt-4 hidden text-center text-xs text-ink-soft [@media(pointer:fine)]:block">
          Phím tắt: 1–4 để chọn, Enter để sang câu tiếp
        </p>
      )}
    </div>
  );
}
