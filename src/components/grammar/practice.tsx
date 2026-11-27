"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SpeakButton } from "@/components/speak-button";
import { closest, isRight } from "@/lib/grammar/check";
import type { Exercise } from "@/lib/grammar/schema";
import { startRecording, unlockAudio } from "@/lib/speaking/recorder";
import { plain } from "./rich-text";

export type Outcome = { index: number; right: boolean };

const primary =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50";
const chip =
  "en inline-flex min-h-11 items-center rounded-xl border border-line bg-sheet px-3 text-lg transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const field =
  "en w-full min-h-12 rounded-xl border border-line bg-sheet px-4 text-lg placeholder:font-sans placeholder:text-base placeholder:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const TITLE: Record<Exercise["type"], string> = {
  choice: "Chọn đáp án đúng",
  fill: "Điền vào chỗ trống",
  order: "Sắp xếp thành câu đúng",
  fix: "Sửa lỗi sai trong câu",
  translate: "Dịch sang tiếng Anh",
};

function shuffled<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Accepted answers for exercises checked as text. */
function answersOf(ex: Exercise): string[] {
  switch (ex.type) {
    case "fill":
      return ex.answers;
    case "order":
      return [ex.words.join(" "), ...ex.alternatives];
    case "fix":
    case "translate":
      return ex.answers;
    case "choice":
      return [ex.options[ex.answer]];
  }
}

/**
 * Runs the given exercises one per screen: answer, check, read the
 * explanation, continue. Reports each outcome at the end.
 */
export function Practice({
  exercises,
  order,
  onFinish,
}: {
  exercises: Exercise[];
  /** Indexes into `exercises` to run, in this order. */
  order: number[];
  onFinish: (outcomes: Outcome[]) => void;
}) {
  const [pos, setPos] = useState(0);
  const outcomes = useRef<Outcome[]>([]);
  const index = order[pos];
  return (
    <Card
      key={pos}
      ex={exercises[index]}
      pos={pos}
      total={order.length}
      onChecked={(right) => outcomes.current.push({ index, right })}
      onNext={() => (pos + 1 >= order.length ? onFinish(outcomes.current) : setPos(pos + 1))}
    />
  );
}

function Card({
  ex,
  pos,
  total,
  onChecked,
  onNext,
}: {
  ex: Exercise;
  pos: number;
  total: number;
  onChecked: (right: boolean) => void;
  onNext: () => void;
}) {
  const [checked, setChecked] = useState<null | { right: boolean; given: string }>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState(ex.type === "fix" ? ex.sentence : "");
  const [picked, setPicked] = useState<number[]>([]);
  const nextRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  /** Gap questions are typed (writing the form helps it stick); the options are shown as hints. */
  const typedGap = ex.type === "choice" && ex.prompt.includes("___");

  const pool = useMemo(() => {
    if (ex.type !== "order") return [];
    // Never show the words already in the right order.
    let s = shuffled(ex.words.map((w, i) => ({ w, i })));
    for (let tries = 0; tries < 5 && s.every((x, k) => x.i === k); tries++) s = shuffled(s);
    return s;
  }, [ex]);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!checked) return;
    nextRef.current?.focus({ preventScroll: true });
    nextRef.current?.scrollIntoView({ block: "nearest" });
  }, [checked]);

  const given =
    typedGap
      ? text
      : ex.type === "choice"
        ? choice === null
          ? ""
          : ex.options[choice]
        : ex.type === "order"
          ? picked.map((i) => ex.words[i]).join(" ")
          : text;
  const ready = typedGap
    ? text.trim().length > 0
    : ex.type === "choice"
      ? choice !== null : ex.type === "order" ? picked.length === ex.words.length : text.trim().length > 0;

  function check() {
    if (!ready || checked) return;
    const right = ex.type === "choice" && !typedGap ? choice === ex.answer : isRight(given, answersOf(ex));
    setChecked({ right, given });
    onChecked(right);
  }

  const next = onNext;

  // Keyboard: Enter checks, then continues; 1–4 picks an option.
  const keys = useRef({ check, next, checked });
  useEffect(() => {
    keys.current = { check, next, checked };
  });
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = keys.current;
      if (e.key === "Enter" && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        if (k.checked) k.next();
        else k.check();
      } else if (ex.type === "choice" && !ex.prompt.includes("___") && !k.checked && /^[1-4]$/.test(e.key) && !(e.target instanceof HTMLInputElement)) {
        const i = Number(e.key) - 1;
        if (i < ex.options.length) setChoice(i);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ex]);

  const best = checked && !checked.right && (ex.type !== "choice" || typedGap) ? closest(checked.given, answersOf(ex)) : null;
  const rightAnswer = ex.type === "choice" ? ex.options[ex.answer] : answersOf(ex)[0];
  const explain = "explain" in ex ? ex.explain : undefined;

  return (
    <div className="max-w-[42rem]">
      <div className="flex items-center gap-3 text-sm text-ink-soft tabular-nums">
        <span>
          Câu {pos + 1}/{total}
        </span>
        <span
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={pos + (checked ? 1 : 0)}
          aria-label="Tiến độ bài tập"
        >
          <span className="block h-full rounded-full bg-accent" style={{ width: `${((pos + (checked ? 1 : 0)) / total) * 100}%` }} />
        </span>
      </div>

      <section className="oli mt-4 rounded-2xl border border-line p-5 sm:p-8">
        <h2 ref={titleRef} tabIndex={-1} className="text-sm font-medium text-ink-soft focus:outline-none">
          {typedGap ? TITLE.fill : TITLE[ex.type]}
        </h2>

        {ex.type === "choice" && typedGap ? (
          <>
            <Gap prompt={ex.prompt} value={text} onChange={setText} disabled={!!checked} />
            <p className="mt-4 text-sm text-ink-soft">
              Gợi ý, chọn một trong:{" "}
              {ex.options.map((o, i) => (
                <span key={o}>
                  {i > 0 ? " / " : ""}
                  <span className="en text-base text-ink">{o}</span>
                </span>
              ))}
            </p>
          </>
        ) : null}

        {ex.type === "choice" && !typedGap ? (
          <>
            <p className="mt-3 text-xl font-medium text-pretty">{ex.prompt}</p>
            <ul className="mt-5 grid gap-2">
              {ex.options.map((o, i) => {
                const state = checked ? (i === ex.answer ? "right" : i === choice ? "wrong" : "") : "";
                return (
                  <li key={o}>
                    <button
                      type="button"
                      disabled={!!checked}
                      aria-pressed={choice === i}
                      onClick={() => setChoice(i)}
                      className={`en flex min-h-12 w-full items-center gap-3 rounded-xl border px-4 text-left text-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                        state === "right"
                          ? "border-correct bg-correct/10"
                          : state === "wrong"
                            ? "border-mistake bg-mistake/10"
                            : choice === i
                              ? "border-accent bg-accent/10"
                              : "border-line bg-sheet hover:border-accent"
                      }`}
                    >
                      <span aria-hidden className="hidden font-sans text-sm text-ink-soft pointer-fine:inline">
                        {i + 1}
                      </span>
                      <span className="flex-1">{o}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}

        {ex.type === "fill" ? (
          <Gap prompt={ex.prompt} hint={ex.hint} value={text} onChange={setText} disabled={!!checked} />
        ) : null}

        {ex.type === "order" ? (
          <>
            <p className="mt-3 text-xl font-medium text-pretty">{ex.vi}</p>
            <div
              className="mt-5 flex min-h-16 flex-wrap gap-2 rounded-xl border-2 border-dashed border-line p-2"
              aria-label="Câu của bạn"
            >
              {picked.length === 0 ? <span className="self-center px-2 text-ink-soft">Chạm vào các từ bên dưới theo thứ tự</span> : null}
              {picked.map((i, k) => (
                <button
                  key={`${i}-${k}`}
                  type="button"
                  disabled={!!checked}
                  onClick={() => setPicked((p) => p.filter((x) => x !== i))}
                  className={`${chip} border-accent`}
                  aria-label={`Bỏ từ ${ex.words[i]}`}
                >
                  {ex.words[i]}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {pool.map(({ w, i }) =>
                picked.includes(i) ? (
                  <span key={i} className={`${chip} invisible`} aria-hidden>
                    {w}
                  </span>
                ) : (
                  <button key={i} type="button" disabled={!!checked} onClick={() => setPicked((p) => [...p, i])} className={chip}>
                    {w}
                  </button>
                ),
              )}
            </div>
          </>
        ) : null}

        {ex.type === "fix" || ex.type === "translate" ? (
          <>
            {ex.type === "fix" ? (
              <p className="en mt-3 text-2xl text-mistake line-through decoration-2">{ex.sentence}</p>
            ) : (
              <p className="mt-3 text-xl font-medium text-pretty">{ex.vi}</p>
            )}
            <label htmlFor="answer" className="mt-5 block text-sm text-ink-soft">
              {ex.type === "fix" ? "Viết lại câu đúng" : "Câu tiếng Anh của bạn"}
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="answer"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={!!checked}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="done"
                placeholder={ex.type === "translate" ? "Gõ hoặc bấm micro để nói" : undefined}
                className={field}
              />
              {ex.type === "translate" ? <MicButton disabled={!!checked} onText={setText} /> : null}
            </div>
          </>
        ) : null}
      </section>

      {/* The check button stays in the thumb zone; after checking, feedback flows under the question so both stay readable. */}
      <div
        className={
          checked
            ? "mt-4 scroll-mb-[calc(5rem+env(safe-area-inset-bottom))]"
            : "sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] mt-4 border-t border-line bg-paper/95 py-3 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:backdrop-blur-none"
        }
        aria-live="polite"
      >
        {checked ? (
          <div className={`rounded-xl border p-4 ${checked.right ? "border-correct bg-correct/10" : "border-mistake bg-mistake/10"}`}>
            <p className={`font-semibold ${checked.right ? "text-correct" : "text-mistake"}`}>
              {checked.right ? "Đúng rồi!" : "Chưa đúng"}
            </p>
            {!checked.right ? (
              <p className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-sm text-ink-soft">Đáp án:</span>
                <span className="en text-lg">
                  {best
                    ? best.result.words.map((w, k) => (
                        <span key={k}>
                          {k > 0 ? " " : ""}
                          <span className={w.ok ? "" : "rounded bg-correct/20 px-0.5 font-semibold text-correct"}>{w.text}</span>
                        </span>
                      ))
                    : rightAnswer}
                </span>
                <SpeakButton text={plain(best ? best.answer : rightAnswer)} compact />
              </p>
            ) : null}
            {explain ? <p className="mt-2 text-pretty">{explain}</p> : null}
            <button ref={nextRef} type="button" onClick={next} className={`${primary} mt-4 w-full sm:w-auto`}>
              {pos + 1 >= total ? "Xem kết quả" : "Câu tiếp theo"}
            </button>
          </div>
        ) : (
          <button type="button" onClick={check} disabled={!ready} className={`${primary} w-full sm:w-auto`}>
            Kiểm tra
          </button>
        )}
      </div>
    </div>
  );
}

/** An English sentence with a typing box in the gap. */
function Gap({
  prompt,
  hint,
  value,
  onChange,
  disabled,
}: {
  prompt: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const [before, after] = prompt.split("___");
  return (
    <p className="en mt-4 text-2xl leading-loose text-pretty">
      {before}
      <label className="sr-only" htmlFor="gap">
        Từ cần điền
      </label>
      <input
        id="gap"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="done"
        className="en mx-1 inline-block min-h-11 w-[8.5ch] rounded-lg border-b-2 border-accent bg-sheet px-2 text-center text-2xl focus-visible:outline-2 focus-visible:outline-accent"
      />
      {after}
      {hint ? <span className="ml-2 font-sans text-base text-ink-soft">({hint})</span> : null}
    </p>
  );
}

/** Records one answer and fills it in as text, so speaking and typing are checked the same way. */
function MicButton({ disabled, onText }: { disabled: boolean; onText: (t: string) => void }) {
  const [state, setState] = useState<"idle" | "rec" | "busy" | "off">("idle");
  const rec = useRef<Awaited<ReturnType<typeof startRecording>> | null>(null);

  useEffect(() => () => rec.current?.cancel(), []);

  async function stop() {
    const r = rec.current;
    if (!r) return;
    rec.current = null;
    setState("busy");
    const { wav, spoke } = await r.stop();
    if (!spoke) {
      setState("idle");
      return;
    }
    try {
      const form = new FormData();
      form.append("audio", wav, "speech.wav");
      const res = await fetch("/api/speak/transcribe", { method: "POST", body: form });
      if (res.status === 501) return setState("off");
      const { text = "" } = (await res.json()) as { text?: string };
      if (text) onText(text);
      setState("idle");
    } catch {
      setState("idle");
    }
  }

  async function start() {
    try {
      unlockAudio();
      rec.current = await startRecording({ onSilence: () => void stop() });
      setState("rec");
    } catch {
      setState("off");
    }
  }

  if (state === "off") return null;
  return (
    <button
      type="button"
      disabled={disabled || state === "busy"}
      onClick={() => (state === "rec" ? void stop() : void start())}
      aria-label={state === "rec" ? "Dừng ghi âm" : "Nói câu trả lời"}
      aria-pressed={state === "rec"}
      className={`grid size-12 shrink-0 place-items-center rounded-full text-accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 ${
        state === "rec" ? "bg-mistake motion-safe:animate-pulse" : "bg-accent"
      }`}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {state === "rec" ? (
          <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" />
        ) : (
          <>
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          </>
        )}
      </svg>
    </button>
  );
}
