"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Illustration } from "@/components/illustration";
import { LevelPicker, useLevelSelection } from "@/components/level-picker";
import { LEVELS, type Level } from "@/lib/levels";
import { dueIds, getServerSnapshot, getSnapshot, learnedCount, subscribe } from "@/lib/vocab/srs-store";

export type OverviewTopic = { id: string; title: string; description: string; level: Level; sets: string[][] };

const primary =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const secondary =
  "inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-sheet px-6 font-semibold transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const tile =
  "flex min-h-14 items-center justify-between gap-3 rounded-xl border border-line bg-sheet px-4 py-3 font-medium transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Levels that have tests and flashcard decks built from their topics. */
const TESTED = new Set<Level>(["A1", "A2", "B1"]);

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
  const levelIds = levelTopics.flatMap((t) => t.sets.flat());
  const lv = level.toLowerCase();

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
  const learnedHere = state ? learnedCount(state, levelIds) : 0;

  return (
    <div>
      <div className="max-w-3xl">
        <LevelPicker current={level} available={levels} onSelect={select} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="next-heading" className="oli rounded-2xl border border-line p-6 sm:p-7">
          <h2 id="next-heading" className="text-sm font-medium text-ink-soft">
            Học tiếp · {level}
          </h2>
          {state === null ? (
            <p className="mt-3 text-ink-soft">Đang tải tiến độ…</p>
          ) : next ? (
            <>
              <div className="mt-3 flex items-start gap-3 sm:gap-4">
                <Illustration id={next.topic.id} size={56} />
                <div className="min-w-0">
                  <p className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{next.topic.title}</p>
                  <p className="mt-2 text-ink-soft tabular-nums">
                    Bộ {next.setIndex + 1}/{next.topic.sets.length}, {next.topic.sets[next.setIndex].length} từ
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
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

        <div className="flex flex-col gap-3">
          <section aria-labelledby="review-heading" className="rounded-xl border border-line bg-sheet px-4 py-3" aria-live="polite">
            <h2 id="review-heading" className="flex items-baseline justify-between text-sm">
              <span className="font-semibold">Ôn tập</span>
              <span className="text-ink-soft tabular-nums">
                {state === null ? "…" : `Đã học ${nf.format(learned)} từ`}
              </span>
            </h2>
            <p className="mt-1 text-sm text-ink-soft tabular-nums">
              {state === null ? "" : due > 0 ? `${nf.format(due)} thẻ đến hạn ôn hôm nay.` : "Không có thẻ đến hạn."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {due > 0 ? (
                <Link href="/vocabulary/review" className={`${primary} min-h-11 px-5 text-sm`}>
                  Ôn ngay
                </Link>
              ) : null}
              <Link href="/vocabulary/practice" className={`${secondary} min-h-11 px-5 text-sm`}>
                Luyện tập
              </Link>
            </div>
          </section>
          {TESTED.has(level) ? (
            <>
              <Link href={`/flashcards?level=${lv}&tab=vocab`} className={tile}>
                <span>Thẻ ghi nhớ {level}</span>
                <span aria-hidden="true" className="text-accent">→</span>
              </Link>
              <Link href={`/tests/${lv}`} className={tile}>
                <span>Kiểm tra {level}</span>
                <span aria-hidden="true" className="text-accent">→</span>
              </Link>
            </>
          ) : null}
        </div>
      </div>

      <section aria-labelledby="topics-heading" className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="topics-heading" className="text-lg font-semibold">
            Chủ đề {level}
          </h2>
          <p className="text-sm text-ink-soft tabular-nums">
            {levelTopics.length} chủ đề · {nf.format(levelIds.length)} từ · đã học {nf.format(learnedHere)}
          </p>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {levelTopics.map((t) => {
            const ids = t.sets.flat();
            const done = state ? learnedCount(state, ids) : 0;
            const pct = ids.length ? Math.round((done / ids.length) * 100) : 0;
            return (
              <li key={t.id}>
                <Link
                  href={`/vocabulary/topic/${t.id}`}
                  title={t.description}
                  className="flex h-full flex-col gap-3 rounded-xl border border-line bg-sheet p-3 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span className="flex flex-1 items-center gap-3">
                    <Illustration id={t.id} size={40} />
                    <span className="min-w-0 text-sm font-semibold leading-snug text-balance sm:text-base">{t.title}</span>
                  </span>
                  <span className="flex items-center gap-3 text-xs text-ink-soft tabular-nums">
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

      <section aria-labelledby="levels-heading" className="mt-10">
        <h2 id="levels-heading" className="text-sm font-semibold text-ink-soft">
          Danh sách từ theo cấp độ
        </h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {LEVELS.map((item) => (
            <li key={item}>
              <Link
                href={`/vocabulary/level/${item.toLowerCase()}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-sheet px-4 text-sm transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span className="font-semibold" translate="no">
                  {item}
                </span>
                <span className="text-ink-soft tabular-nums">{nf.format(counts[item].total)} từ</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-soft text-pretty">
          Nguồn: CEFR-J Wordlist 1.5 (Tono Lab, TUFS), Octanove C1/C2, CMUdict, ECDICT, Tatoeba.
        </p>
      </section>
    </div>
  );
}
