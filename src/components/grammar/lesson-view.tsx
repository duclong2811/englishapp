"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { SpeakButton } from "@/components/speak-button";
import { grammarScores } from "@/lib/grammar/progress";
import type { GrammarLesson } from "@/lib/grammar/schema";
import { Practice, type Outcome } from "./practice";
import { Explain, Marked, plain } from "./rich-text";

type Mode = { kind: "learn" } | { kind: "practice"; order: number[]; round: number } | { kind: "done"; outcomes: Outcome[]; order: number[] };

const primary =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const secondary =
  "inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-sheet px-6 font-semibold transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function LessonView({
  lesson,
  kicker,
  next,
}: {
  lesson: GrammarLesson;
  kicker: string;
  next: { id: string; title: string } | null;
}) {
  const [mode, setMode] = useState<Mode>({ kind: "learn" });
  const top = useRef<HTMLDivElement>(null);
  const all = lesson.exercises.map((_, i) => i);

  function go(m: Mode) {
    setMode(m);
    top.current?.scrollIntoView({ block: "start" });
  }

  function finish(order: number[], outcomes: Outcome[], firstRound: boolean) {
    if (firstRound) {
      const right = outcomes.filter((o) => o.right).length;
      grammarScores.save(lesson.id, Math.round((right / outcomes.length) * 100));
    }
    go({ kind: "done", outcomes, order });
  }

  return (
    <div ref={top} className="scroll-mt-24">
      {mode.kind === "practice" ? (
        // Compact header while practising, so the question sits high on a phone screen.
        <p className="mb-3 mt-3 text-sm text-ink-soft">
          {kicker} · <span className="font-medium text-ink">{lesson.title}</span>
        </p>
      ) : (
        <header className="mb-8 mt-3 max-w-[42rem]">
          <p className="text-sm font-medium text-ink-soft">{kicker}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{lesson.title}</h1>
          <p className="mt-3 text-lg text-ink-soft text-pretty">{lesson.summary}</p>
        </header>
      )}
      {mode.kind === "learn" ? (
        <Learn lesson={lesson} onPractice={() => go({ kind: "practice", order: all, round: 1 })} />
      ) : mode.kind === "practice" ? (
        <>
          <button type="button" onClick={() => go({ kind: "learn" })} className="back-link mb-4">
            Xem lại bài giảng
          </button>
          <Practice
            key={mode.round}
            exercises={lesson.exercises}
            order={mode.order}
            onFinish={(o) => finish(mode.order, o, mode.round === 1)}
          />
        </>
      ) : (
        <Results
          lesson={lesson}
          outcomes={mode.outcomes}
          next={next}
          onRetryWrong={(order) => go({ kind: "practice", order, round: Date.now() })}
          onRestart={() => go({ kind: "practice", order: all, round: 1 })}
          onReview={() => go({ kind: "learn" })}
        />
      )}
    </div>
  );
}

function Learn({ lesson, onPractice }: { lesson: GrammarLesson; onPractice: () => void }) {
  return (
    <article className="max-w-[42rem]">
      <section aria-labelledby="dialogue-heading" className="oli rounded-2xl border border-line p-5 sm:p-8">
        <h2 id="dialogue-heading" className="text-sm font-medium text-ink-soft">
          Hội thoại mẫu
        </h2>
        <ol className="mt-4 space-y-4">
          {lesson.dialogue.map((d, i) => (
            <li key={i} className="flex gap-3">
              <span
                aria-hidden
                className={`mt-1 grid size-7 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                  d.who === "A" ? "bg-accent text-accent-ink" : "bg-ink text-paper"
                }`}
              >
                {d.who}
              </span>
              <div className="min-w-0 flex-1">
                <p className="en text-xl leading-relaxed text-pretty" lang="en">
                  <Marked text={d.en} />
                </p>
                <p className="text-sm text-ink-soft text-pretty">{d.vi}</p>
              </div>
              <SpeakButton text={plain(d.en)} compact />
            </li>
          ))}
        </ol>
      </section>

      {lesson.sections.map((s, i) => (
        <section key={i} className="mt-10" aria-labelledby={`s-${i}`}>
          <h2 id={`s-${i}`} className="text-xl font-semibold text-balance">
            {s.heading}
          </h2>
          {s.body.map((b, k) => (
            <p key={k} className="mt-3 leading-relaxed text-pretty">
              <Explain text={b} />
            </p>
          ))}
          {s.table ? (
            <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-sheet">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-line/30">
                    {s.table.head.map((h) => (
                      <th key={h} scope="col" className="px-4 py-2 text-sm font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.table.rows.map((r, k) => (
                    <tr key={k} className="border-b border-line last:border-0">
                      {r.map((c, j) => (
                        <td key={j} className={`px-4 py-2 align-top ${j === 0 && s.table!.head[0] === "Quy tắc" ? "" : "en"}`}>
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {s.examples.length ? (
            <ul className="mt-4 space-y-3">
              {s.examples.map((e, k) => (
                <li key={k} className="flex items-start gap-3 rounded-xl border border-line bg-sheet p-3">
                  <div className="min-w-0 flex-1">
                    <p className="en text-lg text-pretty" lang="en">
                      <Marked text={e.en} />
                    </p>
                    <p className="text-sm text-ink-soft text-pretty">{e.vi}</p>
                  </div>
                  <SpeakButton text={plain(e.en)} compact />
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      <section className="mt-10" aria-labelledby="mistakes-heading">
        <h2 id="mistakes-heading" className="text-xl font-semibold">
          Lỗi người Việt hay mắc
        </h2>
        <ul className="mt-4 space-y-3">
          {lesson.mistakes.map((m, i) => (
            <li key={i} className="rounded-xl border border-line bg-sheet p-4">
              <p className="en text-lg text-mistake line-through decoration-2" lang="en">
                <span className="sr-only">Sai: </span>
                {m.wrong}
              </p>
              <p className="en text-lg font-medium text-correct" lang="en">
                <span className="sr-only">Đúng: </span>
                {m.right}
              </p>
              <p className="mt-1 text-sm text-pretty">{m.why}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 rounded-2xl border border-line bg-sheet p-5">
        <p className="text-pretty">
          <span className="font-semibold">Luyện tập:</span> {lesson.exercises.length} câu, từ chọn đáp án đến tự dịch câu.
          Mỗi câu có giải thích.
        </p>
        <button type="button" onClick={onPractice} className={`${primary} mt-4`}>
          Làm bài tập
        </button>
      </div>
    </article>
  );
}

function Results({
  lesson,
  outcomes,
  next,
  onRetryWrong,
  onRestart,
  onReview,
}: {
  lesson: GrammarLesson;
  outcomes: Outcome[];
  next: { id: string; title: string } | null;
  onRetryWrong: (order: number[]) => void;
  onRestart: () => void;
  onReview: () => void;
}) {
  const right = outcomes.filter((o) => o.right).length;
  const wrong = outcomes.filter((o) => !o.right).map((o) => o.index);
  const pct = Math.round((right / outcomes.length) * 100);
  return (
    <section aria-labelledby="result-heading" className="max-w-[42rem]">
      <div className="oli rounded-2xl border border-line p-6 sm:p-8">
        <h2 id="result-heading" className="text-sm font-medium text-ink-soft">
          Kết quả
        </h2>
        <p className="mt-2 text-4xl font-semibold tabular-nums">
          {right}/{outcomes.length}
        </p>
        <p className="mt-2 text-ink-soft text-pretty">
          {wrong.length === 0
            ? "Không sai câu nào. Bạn nắm chắc bài này rồi!"
            : pct >= 80
              ? "Rất tốt. Làm lại mấy câu sai để nhớ lâu hơn."
              : "Xem lại phần lỗi hay mắc trong bài giảng, rồi làm lại các câu sai."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {wrong.length ? (
            <button type="button" onClick={() => onRetryWrong(wrong)} className={primary}>
              Làm lại {wrong.length} câu sai
            </button>
          ) : next ? (
            <Link href={`/lessons/${next.id}`} className={primary}>
              Bài tiếp theo
            </Link>
          ) : null}
          <button type="button" onClick={onReview} className={secondary}>
            Xem lại bài giảng
          </button>
          <button type="button" onClick={onRestart} className={secondary}>
            Làm lại từ đầu
          </button>
        </div>
      </div>
      {wrong.length ? (
        <>
          <h3 className="mt-8 font-semibold">Các câu cần xem lại</h3>
          <ul className="mt-3 space-y-2">
            {wrong.map((i) => {
              const ex = lesson.exercises[i];
              const q = ex.type === "choice" || ex.type === "fill" ? ex.prompt : ex.type === "fix" ? ex.sentence : ex.vi;
              const a =
                ex.type === "choice"
                  ? ex.options[ex.answer]
                  : ex.type === "order"
                    ? ex.words.join(" ")
                    : ex.answers[0];
              return (
                <li key={i} className="rounded-xl border border-line bg-sheet p-4">
                  <p className="text-sm text-ink-soft text-pretty">{q}</p>
                  <p className="en mt-1 text-lg text-correct" lang="en">
                    {a}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
      {next && wrong.length ? (
        <p className="mt-6">
          <Link href={`/lessons/${next.id}`} className="font-medium text-accent underline-offset-4 hover:underline">
            Sang bài tiếp theo: {next.title}
          </Link>
        </p>
      ) : null}
    </section>
  );
}
