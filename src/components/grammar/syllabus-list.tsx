"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Illustration } from "@/components/illustration";
import { LevelPicker, useLevelSelection } from "@/components/level-picker";
import { grammarScores } from "@/lib/grammar/progress";

type Item = { id: string; title: string; number: number; ready: boolean; summary?: string };
type Unit = { id: string; title: string; items: Item[] };

const available = ["A1"] as const;
const passingScore = 80;
const primary = "inline-flex min-h-12 touch-manipulation items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const card = "flex h-full min-h-11 flex-col rounded-xl border border-line bg-sheet p-4 text-left";

export function SyllabusList({ units }: { units: Unit[] }) {
  const { current, select } = useLevelSelection("lessons:level:v1", available, "A1");
  const scores = useSyncExternalStore(grammarScores.subscribe, grammarScores.getSnapshot, grammarScores.getServerSnapshot);
  const items = units.flatMap((unit, index) => unit.items.map((item) => ({ ...item, unitNumber: index + 1 })));
  const ready = items.filter((item) => item.ready);
  const pending = items.length - ready.length;
  const passed = (item: Item) => item.ready && (scores?.[item.id]?.best ?? 0) >= passingScore;
  const completed = ready.filter(passed).length;
  const next = ready.find((item) => !passed(item));
  const lowest = !next
    ? ready.reduce<Item | undefined>((previous, item) => (
        !previous || (scores?.[item.id]?.best ?? 0) < (scores?.[previous.id]?.best ?? 0) ? item : previous
      ), undefined)
    : undefined;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,40rem)_minmax(16rem,22rem)] lg:gap-12">
      <div className="min-w-0">
        <LevelPicker current={current} available={available} onSelect={select} />
        <p className="mb-4 text-sm text-ink-soft tabular-nums lg:hidden">
          Tiến độ {current}: {completed}/{items.length} bài xong
        </p>

        <section aria-labelledby="lesson-next" className="oli rounded-2xl border border-line p-6 sm:p-8">
          <h2 id="lesson-next" className="text-sm font-medium text-ink-soft">Học tiếp</h2>
          {next ? (
            <>
              <div className="mt-3 flex items-start gap-3 sm:gap-4">
                <Illustration id={next.id} size={56} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-accent">Bài {next.number} · Chương {next.unitNumber}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{next.title}</p>
                </div>
              </div>
              <p className="mt-2 line-clamp-1 text-ink-soft">{next.summary}</p>
              <Link href={`/lessons/${next.id}`} className={`mt-5 ${primary}`}>Vào bài</Link>
            </>
          ) : lowest ? (
            <>
              <p className="mt-3 text-xl font-semibold text-balance">
                {pending > 0 ? "Bạn đã học hết các bài hiện có" : `Bạn đã học hết ngữ pháp ${current}`}
              </p>
              <Link href={`/lessons/${lowest.id}`} className={`mt-5 ${primary}`}>Ôn lại bài điểm thấp nhất</Link>
            </>
          ) : (
            <p className="mt-3 text-ink-soft">Các bài học đang được soạn.</p>
          )}
        </section>

        {units.map((unit, index) => (
          <section key={unit.id} id={`unit-${unit.id}`} aria-labelledby={`title-${unit.id}`} className="mt-9 scroll-mt-20 lg:scroll-mt-8">
            <header className="mb-3 flex items-baseline justify-between gap-3">
              <h2 id={`title-${unit.id}`} className="min-w-0 text-lg font-semibold text-balance">
                Chương {index + 1} · {unit.title}
              </h2>
              <span className="shrink-0 text-sm text-ink-soft tabular-nums">
                {unit.items.filter(passed).length}/{unit.items.length}
              </span>
            </header>
            <ul className="grid gap-3 sm:grid-cols-2">
              {unit.items.map((item) => {
                const best = scores?.[item.id]?.best;
                const done = passed(item);
                const content = (
                  <>
                    <span className="flex items-start gap-3">
                      <Illustration id={item.id} size={48} />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-ink-soft tabular-nums">Bài {item.number}</span>
                        <span className="mt-1 block font-semibold text-balance">{item.title}</span>
                        {item.summary && <span className="mt-1 line-clamp-2 text-sm text-ink-soft">{item.summary}</span>}
                      </span>
                    </span>
                    <span className={`mt-auto pt-3 text-sm font-medium tabular-nums ${done ? "text-correct" : "text-ink-soft"}`}>
                      {!item.ready ? "Sắp có" : best === undefined ? "Chưa học" : (
                        <>{done && <span aria-hidden="true">✓ </span>}Điểm cao nhất {best}%</>
                      )}
                    </span>
                  </>
                );
                return (
                  <li key={item.id}>
                    {item.ready ? (
                      <Link href={`/lessons/${item.id}`} className={`${card} touch-manipulation hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}>
                        {content}
                      </Link>
                    ) : <div className={card}>{content}</div>}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        {pending > 0 && <p className="mt-5 text-sm text-ink-soft">Còn {pending} bài đang soạn.</p>}
      </div>

      <aside aria-labelledby="lesson-progress" className="hidden self-start rounded-xl border border-line bg-sheet p-5 lg:block">
        <h2 id="lesson-progress" className="text-lg font-semibold">Tiến độ {current}</h2>
        <p className="mt-1 text-sm text-ink-soft tabular-nums">{completed}/{items.length} bài xong</p>
        <progress
          aria-label={`Tiến độ ${current}`}
          max={items.length || 1}
          value={completed}
          className="mt-3 block h-1.5 w-full appearance-none overflow-hidden rounded-full bg-line [&::-moz-progress-bar]:bg-accent [&::-webkit-progress-bar]:bg-line [&::-webkit-progress-value]:bg-accent"
        />
        <ul className="mt-4 divide-y divide-line">
          {units.map((unit, index) => {
            const done = unit.items.filter(passed).length;
            return (
              <li key={unit.id}>
                <a
                  href={`#unit-${unit.id}`}
                  className="flex min-h-11 touch-manipulation items-center justify-between gap-3 rounded-md px-1 py-2 text-sm hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <span>Chương {index + 1} · {unit.title}</span>
                  <span className={`shrink-0 tabular-nums ${done === unit.items.length ? "text-correct" : "text-ink-soft"}`}>
                    {done === unit.items.length && <span aria-hidden="true">✓ </span>}{done}/{unit.items.length}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
