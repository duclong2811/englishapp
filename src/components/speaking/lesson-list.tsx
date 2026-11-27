"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe } from "@/lib/speaking/progress";

type Item = { topic: string; topicTitle: string; title: string | null };

export function LessonList({ items }: { items: Item[] }) {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = items.filter((i) => i.title);
  return (
    <section aria-labelledby="lessons-heading" className="mt-10">
      <h2 id="lessons-heading" className="text-lg font-semibold">
        Bài nói theo chủ đề
      </h2>
      <p className="mt-1 text-ink-soft tabular-nums">
        {ready.length}/{items.length} bài đã có.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((it) => {
          const best = progress?.[it.topic]?.best;
          const body = (
            <>
              <span className="text-sm text-ink-soft">{it.topicTitle}</span>
              <span className="mt-1 flex-1 font-semibold text-balance">{it.title ?? "Sắp có"}</span>
              {best !== undefined ? (
                <span className="mt-3 text-sm tabular-nums text-correct">Điểm cao nhất: {best}%</span>
              ) : null}
            </>
          );
          return (
            <li key={it.topic}>
              {it.title ? (
                <Link
                  href={`/speaking/${it.topic}`}
                  className="flex h-full flex-col rounded-xl border border-line bg-sheet p-4 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {body}
                </Link>
              ) : (
                <div className="flex h-full flex-col rounded-xl border border-dashed border-line p-4 opacity-70">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
