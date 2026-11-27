"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Practice } from "@/components/grammar/practice";
import { plain } from "@/components/grammar/rich-text";
import {
  bankSize,
  drawLevelTest,
  drawTopicTest,
  drawUnitTest,
  PASS_PERCENT,
  SECTION_VI,
  summarize,
  type Bank,
  type Summary,
  type TestItem,
} from "@/lib/tests/bank";
import { addSeen, getSeen, testScores } from "@/lib/tests/progress";
import type { Exercise } from "@/lib/grammar/schema";

export type TestMode = { kind: "level" } | { kind: "unit"; id: string } | { kind: "topic"; id: string };

const primary =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50";
const secondary =
  "inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-sheet px-6 font-semibold transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Banks are cached per page load: going back and forth between tests does not refetch. */
const banks = new Map<string, Promise<Bank>>();
function loadBank(level: string) {
  if (!banks.has(level)) {
    banks.set(
      level,
      fetch(`/api/tests/${level.toLowerCase()}`).then((r) => {
        if (!r.ok) throw new Error(`bank ${r.status}`);
        return r.json() as Promise<Bank>;
      }),
    );
    banks.get(level)!.catch(() => banks.delete(level));
  }
  return banks.get(level)!;
}

function draw(bank: Bank, mode: TestMode) {
  const seen = getSeen(bank.level);
  if (mode.kind === "unit") return drawUnitTest(bank, mode.id, seen);
  if (mode.kind === "topic") return drawTopicTest(bank, mode.id, seen);
  return drawLevelTest(bank, seen);
}

/** Minutes the learner should plan for. */
function minutes(items: TestItem[]) {
  return Math.max(3, Math.round(items.reduce((t, i) => t + (i.ex.type === "choice" ? 25 : 45), 0) / 60));
}

export function TestRunner({ level, mode, testKey, title }: { level: string; mode: TestMode; testKey: string; title: string }) {
  const [bank, setBank] = useState<Bank | null>(null);
  const [failed, setFailed] = useState(false);
  const [stage, setStage] = useState<"intro" | "run" | "done">("intro");
  const [items, setItems] = useState<TestItem[]>([]);
  const [result, setResult] = useState<{ summary: Summary; right: boolean[] } | null>(null);
  const [round, setRound] = useState(0);
  const scores = useSyncExternalStore(testScores.subscribe, testScores.getSnapshot, testScores.getServerSnapshot);

  useEffect(() => {
    let live = true;
    loadBank(level).then(
      (b) => live && setBank(b),
      () => live && setFailed(true),
    );
    return () => {
      live = false;
    };
  }, [level]);

  if (failed) {
    return <p className="text-ink-soft">Không tải được câu hỏi. Kiểm tra kết nối mạng rồi tải lại trang.</p>;
  }
  if (!bank) return <p className="text-ink-soft" aria-live="polite">Đang chuẩn bị đề…</p>;

  function start() {
    setItems(draw(bank!, mode));
    setResult(null);
    setRound((r) => r + 1);
    setStage("run");
    window.scrollTo({ top: 0 });
  }

  function finish(outcomes: { index: number; right: boolean }[]) {
    const right = items.map((_, i) => outcomes.find((o) => o.index === i)?.right ?? false);
    const summary = summarize(items, right);
    testScores.save(testKey, summary.percent);
    addSeen(bank!.level, items.map((i) => i.id));
    setResult({ summary, right });
    setStage("done");
    window.scrollTo({ top: 0 });
  }

  if (stage === "run") {
    return (
      <Practice
        key={round}
        exercises={items.map((i) => i.ex)}
        order={items.map((_, i) => i)}
        onFinish={finish}
      />
    );
  }

  if (stage === "done" && result) {
    return <Results bank={bank} mode={mode} items={items} result={result} onAgain={start} />;
  }

  return <Intro bank={bank} mode={mode} best={scores?.[testKey]?.best} title={title} onStart={start} />;
}

function Intro({ bank, mode, best, title, onStart }: { bank: Bank; mode: TestMode; best?: number; title: string; onStart: () => void }) {
  // A sample paper only to show its shape; the real one is drawn on start.
  const [sample] = useState(() => draw(bank, mode));
  const sections = summarize(sample, sample.map(() => true)).sections;
  const seen = useSyncExternalStore(
    testScores.subscribe,
    () => getSeen(bank.level).size,
    () => 0,
  );
  const size = bankSize(bank);
  const coverage = Math.min(100, Math.round((seen / size) * 100));

  return (
    <section className="oli max-w-[42rem] rounded-2xl border border-line p-6 sm:p-8">
      <h2 className="text-sm font-medium text-ink-soft">{mode.kind === "level" ? `Kiểm tra cấp độ ${bank.level}` : "Kiểm tra nhanh"}</h2>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</p>
      <p className="mt-3 text-ink-soft tabular-nums">
        {sample.length} câu · khoảng {minutes(sample)} phút
        {sections.length > 1 ? ` · ${sections.map((s) => `${SECTION_VI[s.section]} ${s.total}`).join(", ")}` : ""}
      </p>
      <ul className="mt-4 space-y-1 text-pretty">
        <li>Mỗi lần làm là một đề mới, rút ngẫu nhiên từ kho câu hỏi. Câu bạn chưa gặp được ưu tiên.</li>
        {mode.kind === "level" ? <li>Đạt từ {PASS_PERCENT}% là hoàn thành cấp {bank.level}.</li> : null}
        <li>Làm xong, bạn biết mình yếu phần nào và nên ôn bài nào.</li>
      </ul>
      <p className="mt-4 text-sm text-ink-soft tabular-nums">
        {best !== undefined ? `Điểm cao nhất: ${best}%. ` : ""}
        Đã gặp {coverage}% kho câu hỏi {bank.level}.
      </p>
      <button type="button" onClick={onStart} className={`${primary} mt-6`}>
        Bắt đầu
      </button>
    </section>
  );
}

function answerOf(ex: Exercise) {
  switch (ex.type) {
    case "choice":
      return ex.options[ex.answer];
    case "fill":
      return ex.prompt.replace("___", ex.answers[0]);
    case "order":
      return ex.words.join(" ");
    case "fix":
    case "translate":
      return ex.answers[0];
  }
}

function questionOf(ex: Exercise) {
  switch (ex.type) {
    case "choice":
      return ex.audio ? `Nghe: ${ex.audio}` : ex.prompt;
    case "fill":
      return ex.prompt;
    case "order":
    case "translate":
      return ex.vi;
    case "fix":
      return ex.sentence;
  }
}

function Results({
  bank,
  mode,
  items,
  result,
  onAgain,
}: {
  bank: Bank;
  mode: TestMode;
  items: TestItem[];
  result: { summary: Summary; right: boolean[] };
  onAgain: () => void;
}) {
  const { summary, right } = result;
  const passed = summary.percent >= PASS_PERCENT;
  const wrong = items.filter((_, i) => !right[i]);
  const back = mode.kind === "topic" ? `/vocabulary/topic/${mode.id}` : "/lessons";

  return (
    <div className="max-w-[42rem]">
      <section className="oli rounded-2xl border border-line p-6 sm:p-8" aria-live="polite">
        <h2 className="text-sm font-medium text-ink-soft">Kết quả</h2>
        <p className="mt-2 text-5xl font-semibold tabular-nums">{summary.percent}%</p>
        <p className="mt-1 text-ink-soft tabular-nums">
          Đúng {summary.right}/{summary.total} câu
        </p>
        <p className={`mt-3 font-medium text-pretty ${passed ? "text-correct" : ""}`}>
          {passed
            ? mode.kind === "level"
              ? `Bạn đã hoàn thành cấp ${bank.level}. Thỉnh thoảng làm lại để giữ kiến thức nhé.`
              : "Bạn nắm chắc phần này rồi."
            : `Cần đạt ${PASS_PERCENT}%. Ôn lại các phần bên dưới rồi làm đề khác.`}
        </p>
        {summary.sections.length > 1 ? (
          <ul className="mt-5 space-y-3">
            {summary.sections.map((s) => (
              <li key={s.section} className="flex items-center gap-3 text-sm tabular-nums">
                <span className="w-20 shrink-0">{SECTION_VI[s.section]}</span>
                <span
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={s.total}
                  aria-valuenow={s.right}
                  aria-label={`${SECTION_VI[s.section]}: đúng ${s.right}/${s.total}`}
                >
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${(s.right / s.total) * 100}%` }} />
                </span>
                <span className="w-12 text-right">
                  {s.right}/{s.total}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={onAgain} className={primary}>
            Làm đề khác
          </button>
          <Link href={back} className={secondary}>
            {mode.kind === "topic" ? "Về chủ đề" : "Về bài học"}
          </Link>
        </div>
      </section>

      {summary.weak.length ? (
        <section className="mt-8" aria-labelledby="weak-heading">
          <h2 id="weak-heading" className="text-lg font-semibold">
            Nên ôn lại
          </h2>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-sheet">
            {summary.weak.slice(0, 6).map((w) => {
              const tag = bank.tags[w.tag];
              return (
                <li key={w.tag}>
                  <Link
                    href={tag?.href ?? back}
                    className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-line/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                  >
                    <span className="min-w-0 flex-1 font-medium text-pretty">{tag?.title ?? w.tag}</span>
                    <span className="shrink-0 text-sm text-mistake tabular-nums">
                      sai {w.wrong}/{w.total}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {wrong.length ? (
        <section className="mt-8" aria-labelledby="wrong-heading">
          <h2 id="wrong-heading" className="text-lg font-semibold">
            Các câu sai ({wrong.length})
          </h2>
          <ul className="mt-3 space-y-3">
            {wrong.map((it) => (
              <li key={it.id} className="rounded-xl border border-line bg-sheet p-4">
                <p className="text-sm text-ink-soft text-pretty">{plain(questionOf(it.ex))}</p>
                <p className={`${it.ex.type === "choice" && it.ex.optionsLang === "vi" ? "" : "en "}mt-1 text-lg text-pretty`}>
                  {plain(answerOf(it.ex))}
                </p>
                {"explain" in it.ex && it.ex.explain ? <p className="mt-1 text-sm text-ink-soft text-pretty">{it.ex.explain}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
