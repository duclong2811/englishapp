"use client";

import { useEffect, useRef, useState } from "react";
import { Progress } from "@/components/grammar/practice";
import { SpeakButton } from "@/components/speak-button";
import { startRecording, unlockAudio } from "@/lib/speaking/recorder";
import { compareSpeech, PASS_SCORE, type MatchResult } from "@/lib/speaking/match";
import type { Grade } from "@/lib/tests/grading";
import type { OpenExercise, SpeakExercise } from "@/lib/tests/skills";

const primary =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50";
const secondary =
  "inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-sheet px-6 font-semibold transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50";

type RecState = "idle" | "rec" | "busy" | "off";

/** Records until the learner stops (or goes quiet) and turns the speech into text. */
function useRecorder(onText: (text: string) => void) {
  const [state, setState] = useState<RecState>("idle");
  const [error, setError] = useState("");
  const rec = useRef<Awaited<ReturnType<typeof startRecording>> | null>(null);
  useEffect(() => () => rec.current?.cancel(), []);

  async function stop() {
    const r = rec.current;
    if (!r) return;
    rec.current = null;
    setState("busy");
    const { wav, spoke } = await r.stop();
    if (!spoke) {
      setError("Chưa nghe thấy gì. Bấm micro và nói to hơn nhé.");
      return setState("idle");
    }
    try {
      const form = new FormData();
      form.append("audio", wav, "speech.wav");
      const res = await fetch("/api/speak/transcribe", { method: "POST", body: form });
      if (res.status === 501) {
        setError("Nhận giọng nói chỉ chạy trên bản web chính thức.");
        return setState("off");
      }
      const { text = "" } = (await res.json()) as { text?: string };
      if (text.trim()) {
        setError("");
        onText(text.trim());
      } else setError("Chưa nghe rõ. Thử nói lại nhé.");
      setState("idle");
    } catch {
      setError("Mất kết nối. Thử lại nhé.");
      setState("idle");
    }
  }

  async function start() {
    try {
      setError("");
      unlockAudio();
      rec.current = await startRecording({ onSilence: () => void stop() });
      setState("rec");
    } catch {
      setError("Không mở được micro. Hãy cho phép trình duyệt dùng micro.");
      setState("off");
    }
  }

  return { state, error, toggle: () => (state === "rec" ? void stop() : void start()) };
}

function MicButton({ state, onClick, disabled }: { state: RecState; onClick: () => void; disabled?: boolean }) {
  const label = state === "rec" ? "Dừng" : state === "busy" ? "Đang nghe…" : "Bấm để nói";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || state === "busy" || state === "off"}
      aria-pressed={state === "rec"}
      className={`inline-flex min-h-14 items-center gap-3 rounded-full px-6 text-lg font-semibold text-accent-ink transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 ${
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
      {label}
    </button>
  );
}

export function SkillCard({
  ex,
  pos,
  total,
  onChecked,
  onNext,
}: {
  ex: SpeakExercise | OpenExercise;
  pos: number;
  total: number;
  onChecked: (right: boolean, detail?: string) => void;
  onNext: () => void;
}) {
  return ex.type === "speak" ? (
    <ReadAloud ex={ex} pos={pos} total={total} onChecked={onChecked} onNext={onNext} />
  ) : (
    <OpenAnswer ex={ex} pos={pos} total={total} onChecked={onChecked} onNext={onNext} />
  );
}

type CardProps<T> = { ex: T; pos: number; total: number; onChecked: (right: boolean, detail?: string) => void; onNext: () => void };

function NextButton({ last, onNext }: { last: boolean; onNext: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
    ref.current?.scrollIntoView({ block: "nearest" });
  }, []);
  return (
    <button ref={ref} type="button" onClick={onNext} className={`${primary} mt-4 w-full sm:w-auto`}>
      {last ? "Xem kết quả" : "Câu tiếp theo"}
    </button>
  );
}

function ReadAloud({ ex, pos, total, onChecked, onNext }: CardProps<SpeakExercise>) {
  const [heard, setHeard] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const rec = useRecorder(setHeard);
  const live = heard ? compareSpeech(ex.text, heard) : null;

  function check(skip = false) {
    const r = skip ? { score: 0, words: ex.text.split(/\s+/).map((text) => ({ text, ok: false })) } : live;
    if (!r) return;
    setResult(r);
    onChecked(!skip && r.score >= PASS_SCORE, skip ? "Bỏ qua" : `Bạn đọc: ${heard}`);
  }

  const right = result ? result.score >= PASS_SCORE : false;
  return (
    <div className="max-w-[42rem]">
      <Progress pos={pos} total={total} done={!!result} />
      <section className="oli mt-4 rounded-2xl border border-line p-5 sm:p-8">
        <h2 className="text-sm font-medium text-ink-soft">Đọc to câu này</h2>
        <p className="en mt-3 text-2xl leading-snug text-pretty" lang="en">
          {(result ?? live)
            ? (result ?? live)!.words.map((w, i) => (
                <span key={i}>
                  {i > 0 ? " " : ""}
                  <span className={w.ok ? "text-correct" : result ? "text-mistake underline decoration-2" : ""}>{w.text}</span>
                </span>
              ))
            : ex.text}
        </p>
        <p className="mt-2 text-ink-soft text-pretty">{ex.vi}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <MicButton state={rec.state} onClick={rec.toggle} disabled={!!result} />
          <SpeakButton text={ex.text} label="Nghe mẫu" />
        </div>
        {rec.error ? <p className="mt-3 text-sm text-mistake">{rec.error}</p> : null}
        {heard && !result ? (
          <p className="mt-3 text-sm text-ink-soft text-pretty">
            Máy nghe được: <span className="en text-base text-ink">{heard}</span>. Chưa ưng thì bấm micro đọc lại.
          </p>
        ) : null}
      </section>
      <div className="mt-4" aria-live="polite">
        {result ? (
          <div className={`rounded-xl border p-4 ${right ? "border-correct bg-correct/10" : "border-mistake bg-mistake/10"}`}>
            <p className={`font-semibold ${right ? "text-correct" : "text-mistake"}`}>
              {right ? "Đọc tốt!" : "Chưa đạt"} · đúng {Math.round(result.score * 100)}% số từ
            </p>
            <p className="mt-1 text-pretty">Những từ gạch chân máy chưa nghe ra. Nghe mẫu rồi tập lại các từ đó.</p>
            <NextButton last={pos + 1 >= total} onNext={onNext} />
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => check()} disabled={!heard || rec.state !== "idle"} className={`${primary} flex-1 sm:flex-none`}>
              Kiểm tra
            </button>
            <button type="button" onClick={() => check(true)} className={secondary}>
              Bỏ qua
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function words(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function OpenAnswer({ ex, pos, total, onChecked, onNext }: CardProps<OpenExercise>) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [grade, setGrade] = useState<Grade | null>(null);
  const [skipped, setSkipped] = useState(false);
  const rec = useRecorder((t) => setText((prev) => (prev ? `${prev} ${t}` : t)));
  const speaking = ex.mode === "speak";
  const count = words(text);

  async function check() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/check/open", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ taskId: ex.taskId, answer: text }),
      });
      const data = (await res.json()) as Grade & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Chưa chấm được. Thử lại nhé.");
      setGrade(data);
      onChecked(data.ok, data.corrected);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa chấm được. Thử lại nhé.");
    } finally {
      setBusy(false);
    }
  }

  function skip() {
    setSkipped(true);
    onChecked(false, "Bỏ qua");
  }

  const done = !!grade || skipped;
  return (
    <div className="max-w-[42rem]">
      <Progress pos={pos} total={total} done={done} />
      <section className="oli mt-4 rounded-2xl border border-line p-5 sm:p-8">
        <h2 className="text-sm font-medium text-ink-soft">{speaking ? "Nói tự do" : "Viết tự do"}</h2>
        <p className="mt-3 text-xl font-medium text-pretty">{ex.task}</p>
        <p className="mt-2 text-sm text-ink-soft text-pretty">
          Gợi ý: <span className="en text-base text-ink">{ex.hint}</span>
        </p>

        {speaking ? (
          <>
            <div className="mt-5">
              <MicButton state={rec.state} onClick={rec.toggle} disabled={done} />
            </div>
            {rec.error ? <p className="mt-3 text-sm text-mistake">{rec.error}</p> : null}
            {text ? (
              <p className="en mt-4 rounded-xl border border-line bg-sheet p-3 text-lg text-pretty" lang="en">
                {text}
              </p>
            ) : null}
            {text && !done ? (
              <button type="button" onClick={() => setText("")} className="mt-2 min-h-11 text-sm font-medium text-accent hover:underline">
                Xóa và nói lại
              </button>
            ) : null}
          </>
        ) : (
          <>
            <label htmlFor="open-answer" className="mt-5 block text-sm text-ink-soft">
              Bài viết của bạn
            </label>
            <textarea
              id="open-answer"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={done}
              rows={5}
              maxLength={800}
              autoCapitalize="sentences"
              spellCheck={false}
              className="en mt-2 w-full rounded-xl border border-line bg-sheet p-3 text-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </>
        )}
        <p className={`mt-2 text-sm tabular-nums ${count >= ex.minWords ? "text-correct" : "text-ink-soft"}`}>
          {count}/{ex.minWords} từ trở lên
        </p>
      </section>

      <div className="mt-4" aria-live="polite">
        {grade ? (
          <div className={`rounded-xl border p-4 ${grade.ok ? "border-correct bg-correct/10" : "border-mistake bg-mistake/10"}`}>
            <p className={`font-semibold ${grade.ok ? "text-correct" : "text-mistake"}`}>
              {grade.ok ? "Đạt" : "Chưa đạt"} · {grade.score}/10 điểm
            </p>
            <p className="mt-1 text-pretty">{grade.comment}</p>
            {grade.mistakes.length ? (
              <ul className="mt-3 space-y-2">
                {grade.mistakes.map((m, i) => (
                  <li key={i} className="text-pretty">
                    <span className="en text-mistake line-through">{m.wrong}</span> → <span className="en font-medium text-correct">{m.right}</span>
                    <span className="block text-sm text-ink-soft">{m.why}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-3 text-sm text-ink-soft">Bài đã sửa:</p>
            <p className="flex items-start gap-2">
              <span className="en flex-1 text-lg text-pretty" lang="en">
                {grade.corrected}
              </span>
              <SpeakButton text={grade.corrected} compact />
            </p>
            <NextButton last={pos + 1 >= total} onNext={onNext} />
          </div>
        ) : skipped ? (
          <NextButton last={pos + 1 >= total} onNext={onNext} />
        ) : (
          <>
            {error ? <p className="mb-3 text-sm text-mistake">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={check}
                disabled={busy || count < Math.min(3, ex.minWords) || rec.state !== "idle"}
                className={`${primary} flex-1 sm:flex-none`}
              >
                {busy ? "Đang chấm…" : "Nộp bài"}
              </button>
              <button type="button" onClick={skip} disabled={busy} className={secondary}>
                Bỏ qua
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
