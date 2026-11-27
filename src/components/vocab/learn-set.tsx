"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SpeakButton } from "@/components/speak-button";
import { recordResults } from "@/lib/vocab/srs-store";
import { MissedWords, secondaryButton } from "./practice";
import { buildSession, type PracticeWord, type Question } from "./quiz";
import { primaryButton, QuizRunner } from "./quiz-runner";

export type LearnWord = PracticeWord & { meanings: { pos: string; vi: string }[]; note: string };

type Phase = { kind: "intro"; index: number } | { kind: "quiz"; questions: Question[] } | { kind: "done"; missed: string[] };

const noopSubscribe = () => () => {};

export function LearnSet({
  topic,
  setNumber,
  setCount,
  words,
  pool,
  next,
}: {
  topic: { id: string; title: string };
  setNumber: number;
  setCount: number;
  words: LearnWord[];
  pool: PracticeWord[];
  next: { href: string; label: string } | null;
}) {
  const canSpeak = useSyncExternalStore(noopSubscribe, () => "speechSynthesis" in window, () => false);
  const [phase, setPhase] = useState<Phase>({ kind: "intro", index: 0 });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const topicHref = `/vocabulary/topic/${topic.id}`;
  const byId = new Map(words.map((w) => [w.id, w]));

  function startQuiz() {
    setPhase({ kind: "quiz", questions: buildSession(words, pool, canSpeak, words.length) });
  }

  function finish(missed: string[]) {
    const wrong = new Set(missed);
    recordResults(
      words.map((w) => ({ id: w.id, correct: !wrong.has(w.id) })),
      new Date(),
    );
    setPhase({ kind: "done", missed });
  }

  function go(delta: number) {
    if (phase.kind !== "intro") return;
    const i = phase.index + delta;
    if (i < 0) return;
    if (i >= words.length) startQuiz();
    else setPhase({ kind: "intro", index: i });
  }

  const goRef = useRef(go);
  useEffect(() => {
    goRef.current = go;
  });
  useEffect(() => {
    if (phase.kind !== "intro") return;
    headingRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "BUTTON" && e.key === "Enter") return; // let the focused button act
      if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        goRef.current(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goRef.current(-1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  if (phase.kind === "quiz") {
    return <QuizRunner questions={phase.questions} onFinish={finish} exitHref={topicHref} />;
  }

  if (phase.kind === "done") {
    const correct = words.length - phase.missed.length;
    return (
      <section className="max-w-[42rem]" aria-live="polite">
        <p className="text-sm font-medium text-ink-soft">
          {topic.title}, bộ {setNumber}/{setCount}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          Đúng {correct}/{words.length} từ
        </h1>
        {phase.missed.length > 0 ? (
          <>
            <p className="mt-3 text-lg text-ink-soft text-pretty">
              Những từ chọn sai sẽ quay lại sớm trong phần Ôn tập:
            </p>
            <MissedWords ids={phase.missed} byId={byId} />
          </>
        ) : (
          <p className="mt-3 text-lg text-ink-soft text-pretty">
            Không sai từ nào. Các từ này sẽ được nhắc ôn lại đúng lúc bạn sắp quên.
          </p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          {next ? (
            <Link href={next.href} className={primaryButton}>
              {next.label}
            </Link>
          ) : null}
          <button type="button" onClick={() => setPhase({ kind: "intro", index: 0 })} className={secondaryButton}>
            Học lại bộ này
          </button>
          <Link href={topicHref} className={secondaryButton}>
            Về chủ đề
          </Link>
        </div>
      </section>
    );
  }

  const w = words[phase.index];
  const last = phase.index === words.length - 1;

  return (
    <div className="mx-auto max-w-[42rem]">
      <div className="mb-4 flex items-center justify-between gap-4 text-sm text-ink-soft">
        <Link href={topicHref} className="back-link">
          ← {topic.title}
        </Link>
        <span className="tabular-nums">
          Bộ {setNumber}, từ {phase.index + 1}/{words.length}
        </span>
      </div>
      <div className="mb-4 flex gap-1" aria-hidden="true">
        {words.map((x, i) => (
          <span key={x.id} className={`h-1 flex-1 rounded-full ${i <= phase.index ? "bg-accent" : "bg-line"}`} />
        ))}
      </div>

      <section className="oli rounded-2xl border border-line p-6 sm:p-8" aria-labelledby="learn-word">
        <h1 id="learn-word" ref={headingRef} tabIndex={-1} lang="en" className="en text-5xl leading-tight outline-none sm:text-6xl">
          {w.headword}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-lg">
          {w.ipa ? (
            <span translate="no" className="text-ink-soft">
              /{w.ipa}/
            </span>
          ) : null}
          <SpeakButton key={w.id} text={w.headword} />
        </div>
      </section>

      <dl className="mt-6 flex flex-col gap-2">
        {w.meanings.map((m) => (
          <div key={m.pos + m.vi}>
            <dt className="text-sm text-ink-soft">{m.pos}</dt>
            <dd className="text-2xl font-medium text-pretty">{m.vi}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-6 flex flex-col gap-4">
        {w.examples.map((ex) => (
          <li key={ex.en} className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p lang="en" className="en text-xl leading-snug text-pretty">
                {ex.en}
              </p>
              <p className="mt-1 text-ink-soft">{ex.vi}</p>
            </div>
            <SpeakButton text={ex.en} compact />
          </li>
        ))}
      </ul>

      <p className="mt-6 rounded-xl border-l-4 border-accent bg-sheet p-4 text-pretty">{w.note}</p>

      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] mt-8 flex gap-3 border-t border-line bg-paper/95 py-3 backdrop-blur lg:bottom-0">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={phase.index === 0}
          className={`${secondaryButton} disabled:opacity-40`}
        >
          Trước
        </button>
        <button type="button" onClick={() => go(1)} className={`${primaryButton} flex-1 sm:flex-none`}>
          {last ? "Kiểm tra cả bộ" : "Từ tiếp theo"}
        </button>
      </div>
      <p className="mt-2 hidden text-center text-xs text-ink-soft [@media(pointer:fine)]:block">
        Phím tắt: ← trước, → hoặc Enter tiếp
      </p>
    </div>
  );
}
