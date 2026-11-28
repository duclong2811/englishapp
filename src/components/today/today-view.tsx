"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { signedIn, useViewer } from "@/lib/account/viewer";
import type { LearningCatalog } from "@/lib/account/summary";
import { grammarScores } from "@/lib/grammar/progress";
import * as speakStore from "@/lib/speaking/progress";
import { testScores } from "@/lib/tests/progress";
import { buildPlan, minutesToday, roadmap, week, type Goal, type PlanItem, type TodayState } from "@/lib/today/plan";
import { prefsStore, type Prefs } from "@/lib/today/prefs";
import * as srs from "@/lib/vocab/srs-store";

const primary =
  "inline-flex min-h-12 touch-manipulation items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const quiet =
  "inline-flex min-h-11 items-center rounded-md px-1 text-sm font-medium text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent";

const GOALS: { id: Goal; title: string; detail: string }[] = [
  { id: "level", title: "Học hết một cấp độ", detail: "Ngữ pháp và từ vựng theo lộ trình" },
  { id: "talk", title: "Giao tiếp hằng ngày", detail: "Ưu tiên nói và từ vựng" },
  { id: "exam", title: "Thi hoặc kiểm tra", detail: "Ưu tiên ngữ pháp và bài kiểm tra" },
];
const MINUTES = [15, 30, 45, 60];
const LEVEL_HINT: Record<string, string> = {
  A1: "Mới bắt đầu, biết vài từ",
  A2: "Biết câu đơn giản",
  B1: "Giao tiếp được việc quen thuộc",
  B2: "Đọc hiểu và nói khá tự tin",
};

/** Everything stored on this device, as one state for the plan. */
function useTodayState(): TodayState | null {
  const vocab = useSyncExternalStore(srs.subscribe, srs.getSnapshot, srs.getServerSnapshot);
  const grammar = useSyncExternalStore(grammarScores.subscribe, grammarScores.getSnapshot, grammarScores.getServerSnapshot);
  const tests = useSyncExternalStore(testScores.subscribe, testScores.getSnapshot, testScores.getServerSnapshot);
  const speak = useSyncExternalStore(speakStore.subscribe, speakStore.getSnapshot, speakStore.getServerSnapshot);
  return useMemo(
    () => (vocab && grammar && tests && speak ? { cards: vocab.cards, newByDay: vocab.newByDay, grammar, tests, speak } : null),
    [vocab, grammar, tests, speak],
  );
}

export function TodayView({ catalog }: { catalog: LearningCatalog }) {
  const viewer = useViewer();
  const prefs = useSyncExternalStore(prefsStore.subscribe, prefsStore.getSnapshot, prefsStore.getServerSnapshot);
  const state = useTodayState();
  const [editing, setEditing] = useState(false);
  const now = new Date();

  const name = signedIn(viewer) ? viewer.user.name || viewer.user.email.split("@")[0] : null;
  const days = state ? week(state, now) : null;
  const studied = days?.filter((d) => d.studied).length ?? 0;

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          {/* Dates come from the device clock, so they render only in the browser. */}
          <p className="min-h-5 text-sm font-medium text-ink-soft first-letter:uppercase">
            {state ? now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric" }) : ""}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {name ? `Chào ${name}, học tiếp nhé.` : "Hôm nay học gì?"}
          </h1>
        </div>
        {days ? <WeekStrip days={days} studied={studied} /> : null}
      </header>

      {prefs === undefined || !state ? (
        <p className="text-ink-soft">Đang tải…</p>
      ) : prefs === null || editing ? (
        <Onboarding
          levels={catalog.levels.map((l) => l.level)}
          initial={prefs}
          onDone={() => setEditing(false)}
          onCancel={prefs ? () => setEditing(false) : undefined}
        />
      ) : (
        <Dashboard catalog={catalog} state={state} prefs={prefs} now={now} onEdit={() => setEditing(true)} />
      )}
    </div>
  );
}

function WeekStrip({ days, studied }: { days: ReturnType<typeof week>; studied: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-sheet px-3 py-2">
      <ol className="flex gap-1" aria-label={`Tuần này đã học ${studied}/7 ngày`}>
        {days.map((d) => (
          <li key={d.label} className="flex w-8 flex-col items-center gap-1">
            <span className={`text-[0.6875rem] ${d.today ? "font-semibold text-accent" : "text-ink-soft"}`}>{d.label}</span>
            <span
              aria-label={`${d.label}: ${d.studied ? "đã học" : d.future ? "chưa tới" : "chưa học"}`}
              className={`grid size-6 place-items-center rounded-full text-xs ${
                d.studied
                  ? "bg-accent text-accent-ink"
                  : d.today
                    ? "border-2 border-accent"
                    : d.future
                      ? "border border-dashed border-line"
                      : "border border-line"
              }`}
            >
              {d.studied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                  <path d="M5 12l5 5 9-10" />
                </svg>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
      <p className="hidden border-l border-line pl-3 text-sm sm:block">
        <span className="block text-xs text-ink-soft">Tuần này</span>
        <span className="font-semibold tabular-nums">{studied}/7 ngày</span>
      </p>
    </div>
  );
}

function Onboarding({
  levels,
  initial,
  onDone,
  onCancel,
}: {
  levels: string[];
  initial: Prefs | null;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const [level, setLevel] = useState(initial?.level ?? "");
  const [goal, setGoal] = useState<Goal>(initial?.goal ?? "level");
  const [minutes, setMinutes] = useState(initial?.minutes ?? 30);

  const chip = (selected: boolean) =>
    `flex min-h-12 w-full flex-col items-start justify-center rounded-xl border px-4 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
      selected ? "border-accent bg-accent/10" : "border-line bg-sheet hover:border-accent"
    }`;

  return (
    <section aria-labelledby="setup-heading" className="oli max-w-3xl rounded-2xl border border-line p-6 sm:p-8">
      <h2 id="setup-heading" className="text-2xl font-semibold tracking-tight">
        {initial ? "Đổi mục tiêu học" : "Bắt đầu nào"}
      </h2>
      <p className="mt-1 text-ink-soft text-pretty">Ba câu hỏi để app xếp việc học mỗi ngày cho bạn. Đổi lại lúc nào cũng được.</p>

      <fieldset className="mt-6">
        <legend className="font-semibold">1. Bạn đang ở trình độ nào?</legend>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {levels.map((l) => (
            <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)} className={chip(level === l)}>
              <span className="font-semibold" translate="no">
                {l}
              </span>
              <span className="text-xs text-ink-soft">{LEVEL_HINT[l] ?? ""}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          Chưa chắc? Chọn A1 rồi làm{" "}
          <Link href="/tests/a1" className="font-medium text-accent hover:underline">
            Kiểm tra A1
          </Link>
          : đạt từ 80% thì lên A2.
        </p>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="font-semibold">2. Mục tiêu của bạn?</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {GOALS.map((g) => (
            <button key={g.id} type="button" aria-pressed={goal === g.id} onClick={() => setGoal(g.id)} className={chip(goal === g.id)}>
              <span className="font-semibold">{g.title}</span>
              <span className="text-xs text-ink-soft">{g.detail}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="font-semibold">3. Mỗi ngày bạn học bao lâu?</legend>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {MINUTES.map((m) => (
            <button key={m} type="button" aria-pressed={minutes === m} onClick={() => setMinutes(m)} className={`${chip(minutes === m)} items-center px-2`}>
              <span className="whitespace-nowrap font-semibold tabular-nums">{m} phút</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!level}
          onClick={() => {
            prefsStore.save({ level, goal, minutes });
            onDone();
          }}
          className={primary}
        >
          {initial ? "Lưu" : "Xem kế hoạch hôm nay"}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className={quiet}>
            Hủy
          </button>
        ) : null}
        {!level ? <span className="text-sm text-ink-soft">Chọn trình độ để tiếp tục.</span> : null}
      </div>
    </section>
  );
}

const KIND_ICON: Record<PlanItem["kind"], string> = {
  review: "M4 12a8 8 0 1 0 3-6.2M4 4v4h4",
  grammar: "M5 4h11l3 3v13H5zM9 10h6M9 14h4",
  words: "M4 7h10v13H4zM8 3h12v13",
  speak: "M9 3h6v11H9zM5 11a7 7 0 0 0 14 0M12 18v3",
  redo: "M20 12a8 8 0 1 1-3-6.2M20 4v4h-4",
  test: "M9 11l2 2 4-4M5 4h14v16H5z",
};

function Dashboard({
  catalog,
  state,
  prefs,
  now,
  onEdit,
}: {
  catalog: LearningCatalog;
  state: TodayState;
  prefs: Prefs;
  now: Date;
  onEdit: () => void;
}) {
  const plan = buildPlan(catalog, state, prefs, now);
  const map = roadmap(catalog, state, prefs.level);
  const spent = minutesToday(state, now);
  const next = plan.find((p) => !p.done);
  const doneCount = plan.filter((p) => p.done).length;
  const goal = GOALS.find((g) => g.id === prefs.goal);
  const lv = map.level.toLowerCase();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] [&>*]:min-w-0">
      <section aria-labelledby="plan-heading" className="self-start overflow-hidden rounded-2xl border border-line bg-sheet">
        <div className="oli flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id="plan-heading" className="text-xl font-semibold">
              Kế hoạch hôm nay
            </h2>
            <p className="text-sm text-ink-soft">
              {goal?.title} · {map.level} · {prefs.minutes} phút mỗi ngày
            </p>
          </div>
          <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-accent bg-sheet text-center leading-none sm:size-14">
            <span className="text-lg font-semibold tabular-nums">
              {doneCount}/{plan.length}
            </span>
            <span className="sr-only">việc đã xong</span>
          </span>
        </div>

        <ol className="divide-y divide-line">
          {plan.map((item, i) => {
            const isNext = item === next;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex min-h-16 items-center gap-4 px-5 py-3 transition-colors hover:bg-line/30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent sm:px-6 ${
                    isNext ? "bg-accent/5" : ""
                  }`}
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-full ${
                      item.done ? "bg-correct/15 text-correct" : isNext ? "bg-accent text-accent-ink" : "border border-line text-ink-soft"
                    }`}
                  >
                    {item.done ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <path d="M5 12l5 5 9-10" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d={KIND_ICON[item.kind]} />
                      </svg>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-ink-soft">{item.label}</span>
                    <span className={`block font-semibold text-pretty ${item.done ? "text-ink-soft line-through decoration-1" : ""}`}>
                      {item.title}
                    </span>
                  </span>
                  {isNext ? (
                    <span className="hidden shrink-0 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-ink sm:inline">
                      {i === 0 || doneCount === 0 ? "Bắt đầu" : "Tiếp theo"}
                    </span>
                  ) : (
                    <span className="shrink-0 text-sm text-ink-soft tabular-nums">{item.done ? "Xong" : `~${item.minutes} phút`}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-3 sm:px-6">
          <span className="text-sm tabular-nums">
            Hôm nay ~{Math.min(spent, 999)}/{prefs.minutes} phút
          </span>
          <span
            className="h-1.5 min-w-24 flex-1 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={prefs.minutes}
            aria-valuenow={Math.min(spent, prefs.minutes)}
            aria-label="Thời gian học hôm nay (ước tính)"
          >
            <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.min(100, (spent / prefs.minutes) * 100)}%` }} />
          </span>
          <button type="button" onClick={onEdit} className={quiet}>
            Đổi mục tiêu
          </button>
        </div>
      </section>

      <section aria-labelledby="road-heading" className="flex flex-col rounded-2xl border border-line bg-sheet p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="road-heading" className="font-semibold">
            Lộ trình {map.level}
          </h2>
          <Link href={`/lessons?level=${lv}`} className={quiet}>
            Mở →
          </Link>
        </div>
        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-semibold tabular-nums">{map.percent}%</span>
          <span className="text-sm text-ink-soft">chặng đường {map.level}</span>
        </p>
        <span className="mt-2 block h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <span className="block h-full rounded-full bg-accent" style={{ width: `${map.percent}%` }} />
        </span>
        <dl className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-line/30 px-3 py-2">
            <dt className="text-xs text-ink-soft">Bài ngữ pháp</dt>
            <dd className="font-semibold tabular-nums">
              {map.lessons.passed}/{map.lessons.total}
            </dd>
          </div>
          <div className="rounded-xl bg-line/30 px-3 py-2">
            <dt className="text-xs text-ink-soft">Từ đã học</dt>
            <dd className="font-semibold tabular-nums">
              {map.words.learned}/{map.words.total}
            </dd>
          </div>
        </dl>
        {map.units.length ? (
          <ol className="mt-4 flex max-h-72 flex-col gap-1.5 overflow-y-auto pr-1">
            {map.units.map((u, i) => {
              const current = u.id === map.current;
              const complete = u.total > 0 && u.passed === u.total;
              return (
                <li key={u.id}>
                  <Link
                    href={`/lessons?level=${lv}#unit-${u.id}`}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                      current ? "bg-accent text-accent-ink" : "hover:bg-line/40"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className={`block text-xs ${current ? "opacity-80" : "text-ink-soft"}`}>Chương {i + 1}</span>
                      <span className="block text-sm font-medium text-pretty">{u.title}</span>
                    </span>
                    <span className={`shrink-0 text-xs tabular-nums ${complete && !current ? "text-correct" : ""}`}>
                      {complete ? "✓ " : ""}
                      {u.passed}/{u.total}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        ) : null}
        {map.lessons.total ? (
          <Link
            href={`/tests/${lv}`}
            className="mt-4 flex min-h-12 items-center justify-between gap-3 rounded-xl border border-line px-4 font-medium transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            <span>Kiểm tra lên cấp</span>
            <span className={`text-sm tabular-nums ${map.levelTest !== null && map.levelTest >= 80 ? "text-correct" : "text-ink-soft"}`}>
              {map.levelTest === null ? "Chưa làm" : `${map.levelTest}%`}
            </span>
          </Link>
        ) : null}
      </section>
    </div>
  );
}
