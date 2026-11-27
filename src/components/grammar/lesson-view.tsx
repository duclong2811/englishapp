"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const [page, setPage] = useState(0);
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

  const full = (mode.kind === "learn" && page === 0) || mode.kind === "done";

  return (
    <div ref={top} className="scroll-mt-24">
      {full ? (
        <header className="mb-6 mt-3 max-w-[42rem]">
          <p className="text-sm font-medium text-ink-soft">{kicker}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{lesson.title}</h1>
          <p className="mt-3 text-lg text-ink-soft text-pretty">{lesson.summary}</p>
        </header>
      ) : (
        // Compact header after the first screen, so each step starts high on a phone screen.
        <div className="mb-4 mt-3 text-sm text-ink-soft">
          {kicker} · <h1 className="inline font-medium text-ink">{lesson.title}</h1>
        </div>
      )}
      {mode.kind === "learn" ? (
        <Steps
          lesson={lesson}
          page={page}
          onPage={(p) => {
            setPage(p);
            top.current?.scrollIntoView({ block: "start" });
          }}
          onPractice={() => go({ kind: "practice", order: all, round: 1 })}
        />
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
          onReview={() => {
            setPage(0);
            go({ kind: "learn" });
          }}
        />
      )}
    </div>
  );
}

type Page =
  | { group: string; kind: "dialogue" }
  | { group: string; kind: "section"; index: number }
  | { group: string; kind: "mistakes" }
  | { group: string; kind: "start" };

/** The lesson as a sequence of short screens, grouped into steps. */
function pagesOf(lesson: GrammarLesson): Page[] {
  return [
    { group: "Hội thoại", kind: "dialogue" },
    ...lesson.sections.map((s, index) => ({ group: s.part ?? s.heading, kind: "section" as const, index })),
    { group: "Lỗi hay mắc", kind: "mistakes" },
    { group: "Bài tập", kind: "start" },
  ];
}

function Steps({
  lesson,
  page,
  onPage,
  onPractice,
}: {
  lesson: GrammarLesson;
  page: number;
  onPage: (p: number) => void;
  onPractice: () => void;
}) {
  const pages = pagesOf(lesson);
  const groups = [...new Set(pages.map((p) => p.group))];
  const current = pages[page];
  const inGroup = pages.map((p, i) => ({ p, i })).filter(({ p }) => p.group === current.group);
  const groupIndex = groups.indexOf(current.group);

  // Arrow keys move between screens on a keyboard.
  const nav = useRef({ page, onPage, count: pages.length });
  useEffect(() => {
    nav.current = { page, onPage, count: pages.length };
  });
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = nav.current;
      if (e.key === "ArrowRight" && n.page < n.count - 1) n.onPage(n.page + 1);
      if (e.key === "ArrowLeft" && n.page > 0) n.onPage(n.page - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const nextPage = pages[page + 1];
  const nextLabel = nextPage
    ? nextPage.kind === "section"
      ? lesson.sections[nextPage.index].heading
      : nextPage.group
    : null;

  const posInGroup = inGroup.findIndex(({ i }) => i === page);

  return (
    <div className="max-w-[42rem]">
      <nav aria-label="Các bước của bài" className="mb-6">
        <ol className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${groups.length}, minmax(0, 1fr))` }}>
          {groups.map((g, k) => {
            const first = pages.findIndex((p) => p.group === g);
            const state = k < groupIndex ? "done" : k === groupIndex ? "current" : "todo";
            // The current step fills up as you read its screens.
            const fill = state === "done" ? 100 : state === "current" ? ((posInGroup + 1) / inGroup.length) * 100 : 0;
            return (
              <li key={g} className="min-w-0">
                <button
                  type="button"
                  onClick={() => onPage(first)}
                  aria-current={state === "current" ? "step" : undefined}
                  aria-label={`Bước ${k + 1}: ${g}`}
                  className="group flex min-h-11 w-full flex-col gap-2 rounded-md pt-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span className="block h-1.5 w-full overflow-hidden rounded-full bg-line">
                    <span className="block h-full rounded-full bg-accent transition-[width] motion-reduce:transition-none" style={{ width: `${fill}%` }} />
                  </span>
                  <span
                    className={`hidden truncate text-sm sm:block ${
                      state === "current" ? "font-semibold text-accent" : state === "done" ? "text-ink" : "text-ink-soft group-hover:text-ink"
                    }`}
                  >
                    {k + 1}. {g}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-1 text-sm text-ink-soft sm:hidden">
          Bước {groupIndex + 1}/{groups.length}: <span className="font-semibold text-accent">{current.group}</span>
          {inGroup.length > 1 ? ` · ${posInGroup + 1}/${inGroup.length}` : ""}
        </p>
      </nav>

      <div>
        <div key={page} className="motion-safe:animate-[fadein_160ms_ease-out]">
          {current.kind === "dialogue" ? <Dialogue lesson={lesson} /> : null}
          {current.kind === "section" ? <SectionView section={lesson.sections[current.index]} /> : null}
          {current.kind === "mistakes" ? <Mistakes lesson={lesson} /> : null}
          {current.kind === "start" ? (
            <section className="oli rounded-2xl border border-line p-6 sm:p-8" aria-labelledby="start-heading">
              <h2 id="start-heading" className="text-2xl font-semibold">
                Bài tập
              </h2>
              <p className="mt-2 text-pretty">
                {lesson.exercises.length} câu, từ điền từ đến tự dịch câu. Mỗi câu chấm ngay và có giải thích vì sao.
              </p>
              <button type="button" onClick={onPractice} className={`${primary} mt-5`}>
                Làm bài tập
              </button>
            </section>
          ) : null}
        </div>

        <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] mt-8 flex gap-3 border-t border-line bg-paper/95 py-3 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
          {page > 0 ? (
            <button type="button" onClick={() => onPage(page - 1)} className={secondary} aria-label="Quay lại màn trước">
              Quay lại
            </button>
          ) : null}
          {nextPage ? (
            <button type="button" onClick={() => onPage(page + 1)} className={`${primary} min-w-0 flex-1 sm:flex-none`}>
              <span className="truncate">Tiếp: {nextLabel}</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Dialogue({ lesson }: { lesson: GrammarLesson }) {
  return (
    <section aria-labelledby="dialogue-heading" className="oli rounded-2xl border border-line p-5 sm:p-8">
      <h2 id="dialogue-heading" className="text-sm font-medium text-ink-soft">
        Hội thoại mẫu: để ý các chữ được tô vàng
      </h2>
      <ol className="mt-4 space-y-4">
        {lesson.dialogue.map((d, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              aria-hidden
              className={`mt-1 grid size-7 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                d.who === "A" ? "bg-accent text-accent-ink" : "bg-ink text-paper"
              }`}
            >
              {d.who}
            </span>
            <div className="min-w-0 flex-1">
              <p className="en text-lg leading-relaxed text-pretty sm:text-xl" lang="en">
                <Marked text={d.en} />
              </p>
              <p className="text-sm text-ink-soft text-pretty">{d.vi}</p>
            </div>
            <SpeakButton text={plain(d.en)} compact />
          </li>
        ))}
      </ol>
    </section>
  );
}

function SectionView({ section: s }: { section: GrammarLesson["sections"][number] }) {
  return (
    <section aria-labelledby="section-heading">
      <h2 id="section-heading" className="text-2xl font-semibold text-balance">
        {s.heading}
      </h2>
      {s.body.map((b, k) => (
        <p key={k} className="mt-3 text-lg leading-relaxed text-pretty">
          <Explain text={b} />
        </p>
      ))}
      {s.table ? (
        <div className="mt-5 overflow-x-auto rounded-xl border border-line bg-sheet">
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
        <ul className="mt-5 space-y-3">
          {s.examples.map((e, k) => (
            <li key={k} className="flex items-start gap-3 rounded-xl border border-line bg-sheet p-4">
              <div className="min-w-0 flex-1">
                <p className="en text-xl text-pretty" lang="en">
                  <Marked text={e.en} />
                </p>
                <p className="text-ink-soft text-pretty">{e.vi}</p>
                {e.why ? (
                  <p className="mt-1.5 text-pretty">
                    <span className="font-semibold text-accent">Vì sao: </span>
                    {e.why}
                  </p>
                ) : null}
              </div>
              <SpeakButton text={plain(e.en)} compact />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function Mistakes({ lesson }: { lesson: GrammarLesson }) {
  return (
    <section aria-labelledby="mistakes-heading">
      <h2 id="mistakes-heading" className="text-2xl font-semibold">
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
            <p className="mt-1 text-pretty">{m.why}</p>
          </li>
        ))}
      </ul>
    </section>
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
