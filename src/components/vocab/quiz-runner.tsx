"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SpeakButton } from "@/components/speak-button";
import type { Kind, Question } from "./quiz";

const PROMPT: Record<Kind, string> = {
  listen: "Nghe và chọn nghĩa đúng",
  cloze: "Chọn từ điền vào chỗ trống",
  meaning: "Chọn từ tiếng Anh có nghĩa này",
};

export const primaryButton =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Runs a list of multiple-choice questions, one per screen, then reports which word ids were missed. */
export function QuizRunner({
  questions,
  onFinish,
  exitHref,
}: {
  questions: Question[];
  onFinish: (missedIds: string[]) => void;
  exitHref: string;
}) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [missed, setMissed] = useState<string[]>([]);
  const nextRef = useRef<HTMLButtonElement>(null);
  const promptRef = useRef<HTMLHeadingElement>(null);
  const q = questions[index];

  function choose(i: number) {
    if (!q || chosen !== null) return;
    setChosen(i);
    if (i !== q.answer) setMissed((m) => [...m, q.word.id]);
  }

  function next() {
    if (index + 1 >= questions.length) {
      onFinish(missed);
      return;
    }
    setChosen(null);
    setIndex((n) => n + 1);
  }

  // Move focus to the next action after answering, and back to the prompt for a new question.
  useEffect(() => {
    if (chosen !== null) nextRef.current?.focus();
    else promptRef.current?.focus();
  }, [chosen, index]);

  const chooseRef = useRef(choose);
  const chosenRef = useRef(chosen);
  useEffect(() => {
    chooseRef.current = choose;
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

  if (!q) return null;
  const answered = chosen !== null;
  const right = answered && chosen === q.answer;

  return (
    <div className="mx-auto max-w-[42rem]">
      <div className="mb-4 flex items-center justify-between text-sm text-ink-soft">
        <Link href={exitHref} className="back-link">
          ← Dừng
        </Link>
        <span className="tabular-nums">
          Câu {index + 1}/{questions.length}
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
          <button ref={nextRef} type="button" onClick={next} className={`${primaryButton} mt-3 w-full sm:w-auto`}>
            {index + 1 < questions.length ? "Câu tiếp theo" : "Xem kết quả"}
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
