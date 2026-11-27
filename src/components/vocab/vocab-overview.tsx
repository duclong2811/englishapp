"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { LevelPicker, useLevelSelection } from "@/components/level-picker";
import { LevelBadge } from "@/components/vocab/word-parts";
import { LEVEL_LABELS, LEVELS, type Level } from "@/lib/levels";
import { dueIds, getServerSnapshot, getSnapshot, learnedCount, subscribe } from "@/lib/vocab/srs-store";

export type OverviewTopic = { id: string; title: string; description: string; level: Level; sets: string[][] };

const primary =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const secondary =
  "inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-sheet px-6 font-semibold transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function VocabOverview({
  topics,
  counts,
}: {
  topics: OverviewTopic[];
  counts: Record<Level, { total: number; withMeaning: number }>;
}) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const nf = new Intl.NumberFormat("vi-VN");
  const allIds = topics.flatMap((t) => t.sets.flat());

  const levels = LEVELS.filter((level) => topics.some((topic) => topic.level === level));
  const unfinished = (level: string) =>
    topics.some((t) => t.level === level && t.sets.some((set) => !state || learnedCount(state, set) < set.length));
  const fallback = levels.find(unfinished) ?? levels.at(-1) ?? "A1";
  const { current: level, select } = useLevelSelection("vocab:level:v1", levels, fallback);
  const levelTopics = topics.filter((t) => t.level === level);

  let next: { topic: OverviewTopic; setIndex: number } | null = null;
  if (state) {
    outer: for (const topic of levelTopics) {
      for (let i = 0; i < topic.sets.length; i++) {
        if (learnedCount(state, topic.sets[i]) < topic.sets[i].length) {
          next = { topic, setIndex: i };
          break outer;
        }
      }
    }
  }
  const due = state ? dueIds(state, allIds, new Date()).length : 0;
  const learned = state ? learnedCount(state, allIds) : 0;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,40rem)_minmax(16rem,22rem)] lg:gap-12">
      <div className="min-w-0">
        <LevelPicker current={level} available={levels} onSelect={select} />
        <section aria-labelledby="next-heading" className="oli rounded-2xl border border-line p-6 sm:p-8">
          <h2 id="next-heading" className="text-sm font-medium text-ink-soft">
            Học tiếp
          </h2>
          {state === null ? (
            <p className="mt-3 text-ink-soft">Đang tải tiến độ…</p>
          ) : next ? (
            <>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-balance">{next.topic.title}</p>
              <p className="mt-1 text-sm font-medium text-accent">Cấp độ {level}</p>
              <p className="mt-2 text-ink-soft tabular-nums">
                Bộ {next.setIndex + 1}/{next.topic.sets.length}, {next.topic.sets[next.setIndex].length} từ
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/vocabulary/topic/${next.topic.id}/${next.setIndex + 1}`} className={primary}>
                  Học bộ này
                </Link>
                <Link href={`/vocabulary/topic/${next.topic.id}`} className={secondary}>
                  Xem chủ đề
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-3 text-2xl font-semibold">Bạn đã học hết từ vựng {level}.</p>
          )}
        </section>

        <section
          aria-labelledby="review-heading"
          className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-sheet p-5"
        >
          <div aria-live="polite">
            <h2 id="review-heading" className="font-semibold">
              Ôn tập
            </h2>
            <p className="text-ink-soft tabular-nums">
              {state === null
                ? "…"
                : due > 0
                  ? `${nf.format(due)} thẻ đến hạn. Đã học ${nf.format(learned)}/${nf.format(allIds.length)} từ.`
                  : `Không có thẻ đến hạn. Đã học ${nf.format(learned)}/${nf.format(allIds.length)} từ.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {due > 0 ? (
              <Link href="/vocabulary/review" className={primary}>
                Ôn ngay
              </Link>
            ) : null}
            <Link href="/vocabulary/practice" className={secondary}>
              Luyện tập
            </Link>
          </div>
        </section>

        <section aria-labelledby="topics-heading" className="mt-10">
          <h2 id="topics-heading" className="text-lg font-semibold">
            Chủ đề {level}
          </h2>
          <p className="mt-1 text-ink-soft text-pretty">
            {levelTopics.length} chủ đề, {nf.format(levelTopics.reduce((n, t) => n + t.sets.flat().length, 0))} từ. Mỗi chủ đề chia thành các bộ khoảng 10 từ. Học hết một bộ rồi làm bài kiểm tra ngắn.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {levelTopics.map((t) => {
              const ids = t.sets.flat();
              const done = state ? learnedCount(state, ids) : 0;
              const pct = ids.length ? Math.round((done / ids.length) * 100) : 0;
              return (
                <li key={t.id}>
                  <Link
                    href={`/vocabulary/topic/${t.id}`}
                    className="flex h-full flex-col rounded-xl border border-line bg-sheet p-4 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <span className="font-semibold text-balance">{t.title}</span>
                    <span className="mt-1 flex-1 text-sm text-ink-soft text-pretty">{t.description}</span>
                    <span className="mt-3 flex items-center gap-3 text-sm text-ink-soft tabular-nums">
                      <span
                        className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={ids.length}
                        aria-valuenow={done}
                        aria-label={`Đã học ${done}/${ids.length} từ`}
                      >
                        <span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                      </span>
                      {done}/{ids.length}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section aria-labelledby="levels-heading" className="mt-10 min-w-0 lg:mt-0">
        <h2 id="levels-heading" className="text-lg font-semibold">Kho từ theo cấp độ</h2>
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-sheet">
          {LEVELS.map((item) => {
            const enabled = levels.includes(item);
            return (
              <li key={item} className="flex items-center gap-2 px-3 py-1.5">
                <button
                  type="button"
                  disabled={!enabled}
                  aria-disabled={!enabled}
                  aria-pressed={level === item}
                  onClick={() => select(item)}
                  className="flex min-h-11 min-w-0 flex-1 touch-manipulation items-center gap-2 rounded-lg p-1 text-left enabled:hover:bg-line/40 enabled:aria-pressed:text-accent focus-visible:outline-2 focus-visible:outline-accent disabled:text-ink-soft"
                >
                  <LevelBadge level={item} />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{LEVEL_LABELS[item]}</span>
                    <span className="block text-xs text-ink-soft tabular-nums">
                      {nf.format(counts[item].total)} từ
                      {counts[item].withMeaning > 0 ? `, ${nf.format(counts[item].withMeaning)} từ đã có nghĩa` : ""}
                      {!enabled ? " · Sắp có" : ""}
                    </span>
                  </span>
                </button>
                <Link
                  href={`/vocabulary/level/${item.toLowerCase()}`}
                  aria-label={`Danh sách từ ${item}`}
                  className="inline-flex min-h-11 shrink-0 touch-manipulation items-center rounded-lg px-1 text-sm font-medium text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  Danh sách từ
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-sm text-ink-soft text-pretty">
          Nguồn: CEFR-J Wordlist 1.5 (Tono Lab, TUFS), Octanove C1/C2, CMUdict, ECDICT, Tatoeba.
        </p>
      </section>
    </div>
  );
}
