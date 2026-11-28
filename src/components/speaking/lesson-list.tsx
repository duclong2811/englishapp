"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Illustration } from "@/components/illustration";
import { getServerSnapshot, getSnapshot, subscribe } from "@/lib/speaking/progress";

type Item = { topic: string; topicTitle: string; title: string | null; summary: string | null };

const PASS = 70;
const primary =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const secondary =
  "inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-sheet px-6 font-semibold transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** The speaking page: next lesson, progress, free talk, and every topic lesson as a tile. */
export function SpeakingOverview({ items }: { items: Item[] }) {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = items.filter((i) => i.title);
  const done = progress ? ready.filter((i) => (progress[i.topic]?.best ?? 0) >= PASS).length : 0;
  const scores = progress ? ready.map((i) => progress[i.topic]?.best).filter((b): b is number => b !== undefined) : [];
  const average = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const next = progress ? (ready.find((i) => (progress[i.topic]?.best ?? 0) < PASS) ?? null) : undefined;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] [&>*]:min-w-0">
        <section aria-labelledby="speak-next" className="oli rounded-2xl border border-line p-6 sm:p-7">
          <h2 id="speak-next" className="text-sm font-medium text-ink-soft">
            Bài nói tiếp theo
          </h2>
          {next === undefined ? (
            <p className="mt-3 text-ink-soft">Đang tải tiến độ…</p>
          ) : next ? (
            <>
              <div className="mt-3 flex items-start gap-3 sm:gap-4">
                <Illustration id={next.topic} size={64} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-accent">{next.topicTitle}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{next.title}</p>
                  {next.summary ? <p className="mt-2 line-clamp-2 text-ink-soft text-pretty">{next.summary}</p> : null}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/speaking/${next.topic}`} className={primary}>
                  Luyện bài này
                </Link>
                <Link href="/speaking/free" className={secondary}>
                  Nói tự do
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 text-2xl font-semibold text-balance">Bạn đã luyện hết các bài nói theo chủ đề.</p>
              <Link href="/speaking/free" className={`mt-5 ${primary}`}>
                Nói tự do với AI
              </Link>
            </>
          )}
        </section>

        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-line bg-sheet px-4 py-3">
            <p className="flex items-baseline justify-between text-sm">
              <span className="font-semibold">Đã luyện</span>
              <span className="text-ink-soft tabular-nums">
                {done}/{ready.length} bài{average !== null ? ` · TB ${average}%` : ""}
              </span>
            </p>
            <span
              className="mt-2 block h-1.5 overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={ready.length}
              aria-valuenow={done}
              aria-label={`Đã luyện ${done}/${ready.length} bài nói`}
            >
              <span className="block h-full rounded-full bg-accent" style={{ width: `${ready.length ? (done / ready.length) * 100 : 0}%` }} />
            </span>
          </div>
          <Link
            href="/speaking/free"
            className="flex items-center gap-3 rounded-xl border border-line bg-sheet p-3 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Illustration id="free-talk" size={40} />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Nói tự do</span>
              <span className="block text-sm text-ink-soft">Trò chuyện với AI về bất cứ chuyện gì</span>
            </span>
            <span aria-hidden="true" className="text-accent">
              →
            </span>
          </Link>
          <div className="rounded-xl border border-line bg-sheet px-4 py-3 text-sm">
            <h2 className="font-semibold">Mỗi bài có 2 bước</h2>
            <ol className="mt-2 space-y-1.5 text-ink-soft">
              <li className="flex gap-2">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent/10 text-xs font-semibold text-accent">1</span>
                Đọc theo kịch bản, app chấm từng từ.
              </li>
              <li className="flex gap-2">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent/10 text-xs font-semibold text-accent">2</span>
                Nhập vai với AI, cuối buổi có nhận xét.
              </li>
            </ol>
            <p className="mt-2 text-xs text-ink-soft">Nên học bộ từ của chủ đề trước. Dùng tai nghe, nói câu ngắn và rõ.</p>
          </div>
        </div>
      </div>

      <section aria-labelledby="lessons-heading" className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="lessons-heading" className="text-lg font-semibold">
            Bài nói theo chủ đề
          </h2>
          <p className="text-sm text-ink-soft tabular-nums">
            {ready.length} bài · cấp A1 · đã luyện {done}
          </p>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((it) => {
            const best = progress?.[it.topic]?.best;
            const passed = best !== undefined && best >= PASS;
            const body = (
              <>
                <span className="flex items-start justify-between gap-2">
                  <Illustration id={it.topic} size={40} />
                  {best !== undefined ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                        passed ? "bg-correct/10 text-correct" : "bg-line/60 text-ink-soft"
                      }`}
                    >
                      {passed ? "✓ " : ""}
                      {best}%
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block flex-1 text-sm font-semibold leading-snug text-balance sm:text-base">{it.title ?? "Sắp có"}</span>
                <span className="block text-xs text-ink-soft">{it.topicTitle}</span>
              </>
            );
            return (
              <li key={it.topic}>
                {it.title ? (
                  <Link
                    href={`/speaking/${it.topic}`}
                    className="flex h-full flex-col gap-2 rounded-xl border border-line bg-sheet p-3 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="flex h-full flex-col gap-2 rounded-xl border border-dashed border-line p-3 opacity-70">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
