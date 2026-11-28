import Link from "next/link";
import type { summarize } from "@/lib/account/summary";
import { card } from "./ui";

type Summary = ReturnType<typeof summarize>;

function Bar({ value, total, label }: { value: number; total: number; label: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <p className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-ink-soft">{label}</span>
        <span className="tabular-nums">
          {value}/{total}
        </span>
      </p>
      <span
        className="mt-1 block h-1.5 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={value}
        aria-label={`${label}: ${value}/${total}`}
      >
        <span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}

/** One card per level: words learned, grammar lessons passed, best level-test score. */
export function LevelProgress({ summary, learnerLinks = true }: { summary: Summary; learnerLinks?: boolean }) {
  return (
    <section aria-labelledby="levels-heading" className={card}>
      <h2 id="levels-heading" className="text-lg font-semibold">
        Tiến độ theo cấp độ
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {summary.levels.map((l) => {
          const current = l.level === summary.current;
          const lv = l.level.toLowerCase();
          return (
            <li
              key={l.level}
              className={`flex flex-col gap-3 rounded-xl border p-4 ${current ? "border-accent bg-accent/5" : "border-line"}`}
            >
              <p className="flex items-baseline justify-between gap-2">
                <span className="text-lg font-semibold" translate="no">
                  {l.level}
                </span>
                {current ? <span className="text-xs font-semibold text-accent">Đang học</span> : null}
              </p>
              <Bar label="Từ vựng" value={l.words.learned} total={l.words.total} />
              {l.lessons.total ? <Bar label="Bài ngữ pháp đạt" value={l.lessons.passed} total={l.lessons.total} /> : null}
              {l.lessons.total ? (
                <p className="flex items-baseline justify-between text-sm">
                  <span className="text-ink-soft">Kiểm tra cấp độ</span>
                  <span className={`tabular-nums ${l.levelTest !== null && l.levelTest >= 80 ? "text-correct" : ""}`}>
                    {l.levelTest === null ? "Chưa làm" : `${l.levelTest}%`}
                  </span>
                </p>
              ) : null}
              {learnerLinks && current ? (
                <p className="flex flex-wrap gap-x-4 text-sm font-semibold">
                  <Link href={`/vocabulary?level=${lv}`} className="inline-flex min-h-11 items-center text-accent hover:underline">
                    Học từ vựng
                  </Link>
                  {l.lessons.total ? (
                    <Link href={`/tests/${lv}`} className="inline-flex min-h-11 items-center text-accent hover:underline">
                      Kiểm tra {l.level}
                    </Link>
                  ) : null}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Grammar lessons below the pass mark and vocabulary topics with forgotten or due words. */
export function WeakSpots({ summary, learnerLinks = true }: { summary: Summary; learnerLinks?: boolean }) {
  const { weakLessons, weakTopics } = summary;
  const due = weakTopics.reduce((n, t) => n + t.due, 0);
  const row = "flex min-h-12 items-center gap-3 rounded-lg px-2 py-2";
  const linkRow = `${row} transition-colors hover:bg-line/40 focus-visible:outline-2 focus-visible:outline-accent`;
  return (
    <section aria-labelledby="weak-heading" className={card}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="weak-heading" className="text-lg font-semibold">
          Cần ôn lại
        </h2>
        {learnerLinks && due > 0 ? (
          <Link
            href="/vocabulary/review"
            className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-ink hover:opacity-90"
          >
            Ôn {due} từ đến hạn
          </Link>
        ) : null}
      </div>
      {!weakLessons.length && !weakTopics.length ? (
        <p className="mt-2 text-sm text-ink-soft text-pretty">
          Chưa có gì cần ôn. Bài ngữ pháp dưới {80}% và chủ đề có từ hay quên sẽ hiện ở đây.
        </p>
      ) : (
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {weakLessons.length ? (
            <div>
              <h3 className="text-sm font-medium text-ink-soft">Ngữ pháp chưa đạt</h3>
              <ul className="mt-1">
                {weakLessons.map((l) => {
                  const inner = (
                    <>
                      <span className="w-7 shrink-0 text-xs text-ink-soft" translate="no">
                        {l.level}
                      </span>
                      <span className="min-w-0 flex-1 text-pretty">{l.title}</span>
                      <span className="shrink-0 text-sm tabular-nums text-mistake">{l.best}%</span>
                    </>
                  );
                  return (
                    <li key={l.id}>
                      {learnerLinks ? (
                        <Link href={`/lessons/${l.id}`} className={linkRow}>
                          {inner}
                        </Link>
                      ) : (
                        <div className={row}>{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
          {weakTopics.length ? (
            <div>
              <h3 className="text-sm font-medium text-ink-soft">Từ vựng hay quên</h3>
              <ul className="mt-1">
                {weakTopics.map((t) => {
                  const inner = (
                    <>
                      <span className="w-7 shrink-0 text-xs text-ink-soft" translate="no">
                        {t.level}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-pretty">{t.title}</span>
                        <span className="block text-xs text-ink-soft tabular-nums">
                          {t.forgotten ? `${t.forgotten} từ hay quên` : ""}
                          {t.forgotten && t.due ? " · " : ""}
                          {t.due ? `${t.due} từ đến hạn ôn` : ""}
                        </span>
                      </span>
                    </>
                  );
                  return (
                    <li key={t.id}>
                      {learnerLinks ? (
                        <Link href={`/vocabulary/topic/${t.id}`} className={linkRow}>
                          {inner}
                        </Link>
                      ) : (
                        <div className={row}>{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
