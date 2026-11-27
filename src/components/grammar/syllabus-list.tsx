"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { LevelPicker, useLevelSelection } from "@/components/level-picker";
import { grammarScores } from "@/lib/grammar/progress";

type Item = { id: string; title: string; number: number; ready: boolean };

export function SyllabusList({ items }: { items: Item[] }) {
  const available = ["A1"] as const;
  const { current, select } = useLevelSelection("lessons:level:v1", available, "A1");
  const scores = useSyncExternalStore(grammarScores.subscribe, grammarScores.getSnapshot, grammarScores.getServerSnapshot);
  const ready = items.filter((i) => i.ready);
  const next = ready.find((i) => !scores?.[i.id]) ?? null;

  return (
    <div className="max-w-[42rem]">
      <LevelPicker current={current} available={available} onSelect={select} />
      {next ? (
        <Link
          href={`/lessons/${next.id}`}
          className="oli block rounded-2xl border border-line p-6 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:p-8"
        >
          <span className="text-sm font-medium text-ink-soft">{scores && Object.keys(scores).length ? "Học tiếp" : "Bắt đầu"} · Bài {next.number}</span>
          <span className="mt-2 block text-3xl font-semibold tracking-tight text-balance">{next.title}</span>
          <span className="mt-5 inline-flex min-h-12 items-center rounded-full bg-accent px-6 font-semibold text-accent-ink">
            Vào bài
          </span>
        </Link>
      ) : null}

      <h2 className="mt-10 text-lg font-semibold">Ngữ pháp A1</h2>
      <p className="mt-1 text-ink-soft tabular-nums">
        {ready.length}/{items.length} bài đã có. Các bài còn lại đang được soạn.
      </p>
      <ol className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-sheet">
        {items.map((it) => {
          const best = scores?.[it.id]?.best;
          const inner = (
            <>
              <span className="w-7 shrink-0 text-right text-sm text-ink-soft tabular-nums">{it.number}</span>
              <span className="min-w-0 flex-1 text-pretty">{it.title}</span>
              {best !== undefined ? (
                <span className={`text-sm font-medium tabular-nums ${best >= 80 ? "text-correct" : "text-ink-soft"}`}>{best}%</span>
              ) : !it.ready ? (
                <span className="text-sm text-ink-soft">Sắp có</span>
              ) : null}
            </>
          );
          return (
            <li key={it.id}>
              {it.ready ? (
                <Link
                  href={`/lessons/${it.id}`}
                  className="flex min-h-14 items-center gap-3 px-4 py-3 font-medium transition-colors hover:bg-line/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                >
                  {inner}
                </Link>
              ) : (
                <div className="flex min-h-14 items-center gap-3 px-4 py-3 text-ink-soft">{inner}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
