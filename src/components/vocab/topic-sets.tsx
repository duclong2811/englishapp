"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, learnedCount, subscribe } from "@/lib/vocab/srs-store";

type SetWord = { id: string; headword: string; meaning: string };

export function TopicSets({ topicId, sets }: { topicId: string; sets: SetWord[][] }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const nextIndex = state ? sets.findIndex((s) => learnedCount(state, s.map((w) => w.id)) < s.length) : -1;

  return (
    <ol className="flex flex-col gap-4">
      {sets.map((words, i) => {
        const done = state ? learnedCount(state, words.map((w) => w.id)) : 0;
        const complete = done === words.length;
        const isNext = i === nextIndex;
        return (
          <li key={i}>
            <section
              aria-labelledby={`set-${i}`}
              className={`rounded-2xl border bg-sheet p-5 ${isNext ? "border-accent" : "border-line"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 id={`set-${i}`} className="text-lg font-semibold">
                    Bộ {i + 1}
                  </h2>
                  <p className="text-sm text-ink-soft tabular-nums">
                    {complete ? `Đã học ${words.length} từ` : done > 0 ? `Đã học ${done}/${words.length} từ` : `${words.length} từ, chưa học`}
                  </p>
                </div>
                <Link
                  href={`/vocabulary/topic/${topicId}/${i + 1}`}
                  className={`inline-flex min-h-11 items-center rounded-full px-5 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    isNext
                      ? "bg-accent text-accent-ink hover:opacity-90"
                      : "border border-line bg-paper hover:border-accent hover:text-accent"
                  }`}
                >
                  {complete ? "Học lại" : "Học bộ này"}
                </Link>
              </div>
              <ul className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                {words.map((w) => (
                  <li key={w.id} className="flex min-w-0 items-baseline gap-2">
                    <Link
                      href={`/vocabulary/word/${w.id}`}
                      lang="en"
                      className="en shrink-0 text-lg hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      {w.headword}
                    </Link>
                    <span className="truncate text-sm text-ink-soft">{w.meaning}</span>
                  </li>
                ))}
              </ul>
            </section>
          </li>
        );
      })}
    </ol>
  );
}
