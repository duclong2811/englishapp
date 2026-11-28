"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Illustration } from "@/components/illustration";
import { LevelPicker, useLevelSelection } from "@/components/level-picker";
import { grammarScores } from "@/lib/grammar/progress";
import type { Level } from "@/lib/levels";

type Item = { id: string; title: string; number: number; ready: boolean; summary?: string };
type Unit = { id: string; title: string; items: Item[] };
type LevelUnits = { level: Level; units: Unit[] };

const passingScore = 80;
const primary =
  "inline-flex min-h-12 touch-manipulation items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const tile =
  "flex min-h-14 items-center justify-between gap-3 rounded-xl border border-line bg-sheet px-4 py-3 font-medium transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const smallLink =
  "inline-flex min-h-11 items-center rounded-md px-1 text-sm font-medium text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent";

export function SyllabusList({ levels }: { levels: LevelUnits[] }) {
  const available = levels.map((l) => l.level);
  const { current, select } = useLevelSelection("lessons:level:v1", available, available[0] ?? "A1");
  const units = levels.find((l) => l.level === current)?.units ?? [];
  const scores = useSyncExternalStore(grammarScores.subscribe, grammarScores.getSnapshot, grammarScores.getServerSnapshot);
  const items = units.flatMap((unit, index) => unit.items.map((item) => ({ ...item, unitNumber: index + 1 })));
  const ready = items.filter((item) => item.ready);
  const pending = items.length - ready.length;
  const passed = (item: Item) => item.ready && (scores?.[item.id]?.best ?? 0) >= passingScore;
  const completed = ready.filter(passed).length;
  const next = ready.find((item) => !passed(item));
  const lowest = !next
    ? ready.reduce<Item | undefined>(
        (previous, item) => (!previous || (scores?.[item.id]?.best ?? 0) < (scores?.[previous.id]?.best ?? 0) ? item : previous),
        undefined,
      )
    : undefined;
  const lv = current.toLowerCase();

  return (
    <div>
      <div className="max-w-3xl">
        <LevelPicker current={current} available={available} onSelect={select} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="lesson-next" className="oli rounded-2xl border border-line p-6 sm:p-7">
          <h2 id="lesson-next" className="text-sm font-medium text-ink-soft">
            Học tiếp
          </h2>
          {next ? (
            <>
              <div className="mt-3 flex items-start gap-3 sm:gap-4">
                <Illustration id={next.id} size={56} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-accent">
                    Bài {next.number} · Chương {next.unitNumber}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{next.title}</p>
                  {next.summary ? <p className="mt-2 line-clamp-2 text-ink-soft">{next.summary}</p> : null}
                </div>
              </div>
              <Link href={`/lessons/${next.id}`} className={`mt-5 ${primary}`}>
                Vào bài
              </Link>
            </>
          ) : lowest ? (
            <>
              <p className="mt-3 text-xl font-semibold text-balance">
                {pending > 0 ? "Bạn đã học hết các bài hiện có" : `Bạn đã học hết ngữ pháp ${current}`}
              </p>
              <Link href={`/lessons/${lowest.id}`} className={`mt-5 ${primary}`}>
                Ôn lại bài điểm thấp nhất
              </Link>
            </>
          ) : (
            <p className="mt-3 text-ink-soft">Các bài học đang được soạn.</p>
          )}
        </section>

        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-line bg-sheet px-4 py-3">
            <p className="flex items-baseline justify-between text-sm">
              <span className="font-semibold">Tiến độ {current}</span>
              <span className="text-ink-soft tabular-nums">
                {completed}/{items.length} bài
              </span>
            </p>
            <span
              className="mt-2 block h-1.5 overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={items.length}
              aria-valuenow={completed}
              aria-label={`Tiến độ ${current}: ${completed}/${items.length} bài`}
            >
              <span className="block h-full rounded-full bg-accent" style={{ width: `${items.length ? (completed / items.length) * 100 : 0}%` }} />
            </span>
          </div>
          <Link href={`/tests/${lv}`} className={tile}>
            <span>Kiểm tra cấp độ {current}</span>
            <span aria-hidden="true" className="text-accent">→</span>
          </Link>
          <Link href={`/tests/${lv}/skills`} className={tile}>
            <span>Luyện viết và nói</span>
            <span aria-hidden="true" className="text-accent">→</span>
          </Link>
          <Link href={`/flashcards?level=${lv}&tab=grammar`} className={tile}>
            <span>Thẻ ghi nhớ ngữ pháp</span>
            <span aria-hidden="true" className="text-accent">→</span>
          </Link>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Các chương</h2>
      <ol className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {units.map((unit, index) => {
          const done = unit.items.filter(passed).length;
          return (
            <li key={unit.id} id={`unit-${unit.id}`} className="flex scroll-mt-20 flex-col rounded-2xl border border-line bg-sheet">
              <header className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3">
                <h3 className="min-w-0 font-semibold text-balance">
                  <span className="text-ink-soft">Chương {index + 1} · </span>
                  {unit.title}
                </h3>
                <span className={`shrink-0 text-sm tabular-nums ${done === unit.items.length ? "text-correct" : "text-ink-soft"}`}>
                  {done === unit.items.length ? <span aria-hidden="true">✓ </span> : null}
                  {done}/{unit.items.length}
                </span>
              </header>
              <ul className="flex-1 py-1">
                {unit.items.map((item) => {
                  const best = scores?.[item.id]?.best;
                  const ok = passed(item);
                  const inner = (
                    <>
                      <Illustration id={item.id} size={28} />
                      <span className="min-w-0 flex-1 text-pretty">
                        <span className="mr-1.5 text-sm text-ink-soft tabular-nums">{item.number}.</span>
                        {item.title}
                      </span>
                      <span className={`shrink-0 text-sm tabular-nums ${ok ? "text-correct" : "text-ink-soft"}`}>
                        {!item.ready ? "Sắp có" : best === undefined ? "" : ok ? `✓ ${best}%` : `${best}%`}
                      </span>
                    </>
                  );
                  return (
                    <li key={item.id}>
                      {item.ready ? (
                        <Link
                          href={`/lessons/${item.id}`}
                          className="flex min-h-12 items-center gap-3 px-4 py-2 transition-colors hover:bg-line/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div className="flex min-h-12 items-center gap-3 px-4 py-2 text-ink-soft">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <footer className="flex flex-wrap gap-x-4 border-t border-line px-3 py-1">
                <Link href={`/tests/${lv}/unit/${unit.id}`} className={smallLink}>
                  Kiểm tra nhanh
                </Link>
                <Link href={`/lessons/chapter/${unit.id}`} className={smallLink}>
                  Thẻ ghi nhớ
                </Link>
              </footer>
            </li>
          );
        })}
      </ol>
      {pending > 0 ? <p className="mt-5 text-sm text-ink-soft">Còn {pending} bài đang soạn.</p> : null}
    </div>
  );
}
