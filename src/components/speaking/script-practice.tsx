"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Highlighted, vocabMatcher, type VocabHint } from "@/components/speaking/highlighted";
import { VoicePicker } from "@/components/speaking/voice-picker";
import { compareSpeech, PASS_SCORE, type MatchResult } from "@/lib/speaking/match";
import { saveScore } from "@/lib/speaking/progress";
import { startRecording, unlockAudio } from "@/lib/speaking/recorder";
import { createSpeaker, unlockPlayback, type Speaker } from "@/lib/speaking/speaker";

export type ScriptLine = { who: "ai" | "you"; en: string; vi: string };

type Result = MatchResult & { heard: string };
/** "said" = checked by the learner themself when speech recognition is unavailable. */
type LineResult = Result | "skipped" | "said";
type Phase = "ready" | "playing" | "waiting" | "listening" | "checking" | "done";
type Recording = Awaited<ReturnType<typeof startRecording>>;

const pill =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-sheet px-4 font-medium transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50";
const primary =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50";

function lineScore(r: LineResult | undefined) {
  if (!r || r === "skipped") return 0;
  if (r === "said") return 1;
  return r.score;
}

export function ScriptPractice({
  topic,
  lines,
  vocab,
  onRoleplay,
}: {
  topic: string;
  lines: ScriptLine[];
  vocab: VocabHint[];
  onRoleplay: () => void;
}) {
  const matcher = useMemo(() => vocabMatcher(vocab), [vocab]);
  const [phase, setPhase] = useState<Phase>("ready");
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Record<number, LineResult>>({});
  const [showVi, setShowVi] = useState(true);
  const [hideEn, setHideEn] = useState(false);
  const [peek, setPeek] = useState(false);
  const [handsFree, setHandsFree] = useState(true);
  const [manual, setManual] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [level, setLevel] = useState(0);

  const speaker = useRef<Speaker | null>(null);
  const afterSpeak = useRef<(() => void) | null>(null);
  const recording = useRef<Recording | null>(null);
  const stopping = useRef(false);
  const indexRef = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);
  const handsFreeRef = useRef(handsFree);
  const manualRef = useRef(manual);

  useEffect(() => {
    handsFreeRef.current = handsFree;
    manualRef.current = manual;
  }, [handsFree, manual]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [index, phase, results]);

  useEffect(() => {
    return () => {
      recording.current?.cancel();
      speaker.current?.cancel();
    };
  }, []);

  function getSpeaker() {
    speaker.current ??= createSpeaker(() => {
      const next = afterSpeak.current;
      afterSpeak.current = null;
      next?.();
    });
    return speaker.current;
  }

  function say(text: string, then: () => void) {
    const s = getSpeaker();
    s.begin();
    afterSpeak.current = then;
    s.speak(text);
    s.finish();
  }

  function go(i: number) {
    indexRef.current = i;
    setIndex(i);
    setPeek(false);
    setNotice(null);
    if (i >= lines.length) {
      finish();
      return;
    }
    if (lines[i].who === "ai") {
      setPhase("playing");
      say(lines[i].en, () => {
        if (indexRef.current === i) go(i + 1);
      });
    } else {
      setPhase("waiting");
      if (handsFreeRef.current && !manualRef.current) void listen();
    }
  }

  function finish() {
    setPhase("done");
    setResults((r) => {
      const mine = lines.map((l, i) => (l.who === "you" ? lineScore(r[i]) : null)).filter((x) => x !== null);
      const avg = mine.length ? mine.reduce((a, b) => a + b, 0) / mine.length : 0;
      saveScore(topic, Math.round(avg * 100));
      return r;
    });
  }

  function start() {
    try {
      unlockAudio();
      unlockPlayback();
    } catch {
      // no Web Audio: the learner can still read along
    }
    setResults({});
    go(0);
  }

  async function listen() {
    if (recording.current) return;
    speaker.current?.cancel();
    afterSpeak.current = null;
    setNotice(null);
    try {
      stopping.current = false;
      recording.current = await startRecording({ onLevel: setLevel, onSilence: () => void stopListening() });
      setPhase("listening");
    } catch (err) {
      recording.current = null;
      const name = err instanceof DOMException ? err.name : "";
      setManual(true);
      setNotice(
        name === "NotAllowedError"
          ? "App chưa được dùng micro (iPhone: Cài đặt > Safari > Micro). Hãy đọc to câu này rồi bấm Tiếp."
          : "Không mở được micro. Hãy đọc to câu này rồi bấm Tiếp.",
      );
      setPhase("waiting");
    }
  }

  async function stopListening() {
    const rec = recording.current;
    if (!rec || stopping.current) return;
    stopping.current = true;
    recording.current = null;
    setLevel(0);
    const i = indexRef.current;
    const { wav, seconds, spoke } = await rec.stop();
    if (!spoke || seconds < 0.5) {
      setNotice("Chưa nghe thấy gì. Bấm micro rồi đọc to, rõ hơn nhé.");
      setPhase("waiting");
      return;
    }
    setPhase("checking");
    try {
      const form = new FormData();
      form.append("audio", wav, "speech.wav");
      const res = await fetch("/api/speak/transcribe", { method: "POST", body: form });
      if (res.status === 501) {
        setManual(true);
        setNotice("Máy chủ chưa bật nhận giọng nói. Hãy đọc to câu này rồi bấm Tiếp.");
        setPhase("waiting");
        return;
      }
      if (!res.ok) throw new Error(`transcribe ${res.status}`);
      const { text = "" } = (await res.json()) as { text?: string };
      if (indexRef.current !== i) return;
      const result: Result = { ...compareSpeech(lines[i].en, text), heard: text };
      setResults((r) => ({ ...r, [i]: result }));
      if (result.score >= PASS_SCORE) {
        setNotice(result.score === 1 ? "Chính xác!" : "Tốt lắm!");
        setTimeout(() => {
          if (indexRef.current === i) go(i + 1);
        }, 900);
        setPhase("waiting");
      } else {
        setNotice("Chưa khớp lắm. Nghe mẫu rồi nói lại, hoặc bấm Bỏ qua.");
        setPhase("waiting");
      }
    } catch (err) {
      console.error(err);
      setNotice("Không gửi được giọng nói. Kiểm tra mạng rồi thử lại.");
      setPhase("waiting");
    }
  }

  function playModel() {
    recording.current?.cancel();
    recording.current = null;
    setPhase("playing");
    say(lines[indexRef.current].en, () => setPhase("waiting"));
  }

  function next(kind: "skipped" | "said") {
    recording.current?.cancel();
    recording.current = null;
    const i = indexRef.current;
    setResults((r) => (r[i] && typeof r[i] === "object" && kind === "skipped" ? r : { ...r, [i]: kind }));
    go(i + 1);
  }

  const current = lines[index];
  const yourTurn = phase !== "ready" && phase !== "done" && current?.who === "you";
  const shown = phase === "done" ? lines.length : Math.min(index + 1, lines.length);
  const mine = lines.map((l, i) => ({ l, i })).filter(({ l }) => l.who === "you");
  const total = mine.length;
  const passed = mine.filter(({ i }) => lineScore(results[i]) >= PASS_SCORE).length;
  const avg = total ? Math.round((mine.reduce((a, { i }) => a + lineScore(results[i]), 0) / total) * 100) : 0;

  return (
    <div className="max-w-[42rem]">
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1">
        <VoicePicker />
        <label className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={showVi} onChange={(e) => setShowVi(e.target.checked)} className="size-5 accent-accent" />
          Hiện nghĩa tiếng Việt
        </label>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={hideEn} onChange={(e) => setHideEn(e.target.checked)} className="size-5 accent-accent" />
          Thử thách: ẩn câu tiếng Anh của bạn
        </label>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={handsFree} onChange={(e) => setHandsFree(e.target.checked)} className="size-5 accent-accent" />
          Tự bật micro đến lượt bạn
        </label>
      </div>

      {phase === "ready" ? (
        <div className="rounded-2xl border border-line bg-sheet p-5">
          <p className="text-ink-soft text-pretty">
            Hội thoại có {total} câu bạn cần nói. AI đọc lời của mình, đến lượt bạn thì đọc câu gợi ý, app sẽ nghe và
            chấm từng từ. Từ vựng của chủ đề được <mark className="word">tô vàng</mark>.
          </p>
          <button type="button" onClick={start} className={`${primary} mt-4`}>
            Bắt đầu
          </button>
        </div>
      ) : (
        <ol className="flex flex-col gap-3" aria-label="Kịch bản hội thoại">
          {lines.slice(0, shown).map((line, i) => {
            const r = results[i];
            const isCurrent = i === index && phase !== "done";
            if (line.who === "ai") {
              return (
                <li key={i} className="flex justify-start">
                  <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-line bg-sheet px-4 py-3">
                    <span className="sr-only">AI: </span>
                    <p className="en text-lg leading-relaxed text-pretty">
                      <Highlighted text={line.en} matcher={matcher} />
                    </p>
                    {showVi ? <p className="mt-1 text-sm text-ink-soft text-pretty">{line.vi}</p> : null}
                    <button
                      type="button"
                      onClick={() => say(line.en, () => {})}
                      className="mt-1 -ml-2 inline-flex min-h-11 items-center px-2 text-sm font-medium text-accent"
                    >
                      Nghe lại
                    </button>
                  </div>
                </li>
              );
            }
            const hidden = hideEn && isCurrent && !peek && !(r && typeof r === "object");
            return (
              <li key={i} className="flex justify-end">
                <div
                  className={`max-w-[88%] rounded-2xl rounded-br-md px-4 py-3 ${
                    isCurrent ? "border-2 border-accent bg-sheet" : "bg-accent/10"
                  }`}
                >
                  <span className="sr-only">Bạn: </span>
                  {hidden ? (
                    <>
                      <p className="text-lg text-pretty">{line.vi}</p>
                      <button
                        type="button"
                        onClick={() => setPeek(true)}
                        className="mt-1 -ml-2 inline-flex min-h-11 items-center px-2 text-sm font-medium text-accent"
                      >
                        Xem câu tiếng Anh
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="en text-lg leading-relaxed text-pretty">
                        {r && typeof r === "object" ? (
                          r.words.map((w, k) => (
                            <span key={k}>
                              {k > 0 ? " " : ""}
                              <span className={w.ok ? "" : "text-mistake underline decoration-2 underline-offset-4"}>{w.text}</span>
                            </span>
                          ))
                        ) : (
                          <Highlighted text={line.en} matcher={matcher} />
                        )}
                      </p>
                      {showVi || isCurrent ? <p className="mt-1 text-sm text-ink-soft text-pretty">{line.vi}</p> : null}
                    </>
                  )}
                  {r && typeof r === "object" ? (
                    <p className="mt-2 text-sm text-pretty">
                      <span
                        className={`mr-2 font-semibold tabular-nums ${r.score >= PASS_SCORE ? "text-correct" : "text-mistake"}`}
                      >
                        {Math.round(r.score * 100)}%
                      </span>
                      <span className="text-ink-soft">
                        App nghe được: <span className="en">“{r.heard || "…"}”</span>
                      </span>
                    </p>
                  ) : r === "skipped" ? (
                    <p className="mt-2 text-sm text-ink-soft">Đã bỏ qua</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {phase === "done" ? (
        <section aria-labelledby="script-done" className="mt-8 rounded-2xl border border-line bg-sheet p-5 sm:p-6">
          <h2 id="script-done" className="text-xl font-semibold">
            Xong bước 1
          </h2>
          <p className="mt-2 text-lg text-pretty">
            <span className="mr-2 inline-block rounded-full bg-accent px-3 py-0.5 text-base font-semibold text-accent-ink tabular-nums">
              {avg}%
            </span>
            Bạn nói đạt {passed}/{total} câu. {avg >= 80 ? "Rất tốt! Giờ thử nói tự do với AI nhé." : "Luyện lại một lượt nữa sẽ tốt hơn nhiều."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={onRoleplay} className={primary}>
              Bước 2: Nhập vai với AI
            </button>
            <button type="button" onClick={start} className={pill}>
              Luyện lại kịch bản
            </button>
          </div>
        </section>
      ) : null}

      {/* Scroll margin keeps the newest line above the sticky controls and the tab bar. */}
      <div ref={endRef} className="scroll-mb-[calc(13rem+env(safe-area-inset-bottom))] lg:scroll-mb-40" />

      {yourTurn || phase === "playing" ? (
        <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] mt-6 border-t border-line bg-paper/95 py-3 backdrop-blur lg:bottom-0">
          <p role="status" aria-live="polite" className="min-h-6 text-sm text-ink-soft text-pretty">
            {notice ??
              (phase === "playing"
                ? "Đang đọc…"
                : phase === "listening"
                  ? "Đang nghe… Đọc xong dừng một chút là app tự chấm."
                  : phase === "checking"
                    ? "Đang chấm…"
                    : manual
                      ? "Đọc to câu được khoanh rồi bấm Tiếp."
                      : "Đến lượt bạn. Bấm micro rồi đọc câu được khoanh.")}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {manual ? (
              <button type="button" onClick={() => next("said")} disabled={!yourTurn} className={primary}>
                Tiếp
              </button>
            ) : (
              <button
                type="button"
                onClick={() => (phase === "listening" ? void stopListening() : void listen())}
                disabled={!yourTurn || phase === "checking"}
                aria-pressed={phase === "listening"}
                aria-label={phase === "listening" ? "Dừng và chấm" : "Nói"}
                className={`relative grid size-16 shrink-0 place-items-center rounded-full text-accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 ${
                  phase === "listening" ? "bg-mistake" : "bg-accent"
                }`}
              >
                {phase === "listening" ? (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full border-4 border-mistake/40 motion-safe:transition-transform"
                    style={{ transform: `scale(${1 + level * 0.5})` }}
                  />
                ) : null}
                <svg aria-hidden viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {phase === "listening" ? (
                    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" />
                  ) : (
                    <>
                      <rect x="9" y="3" width="6" height="11" rx="3" />
                      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                    </>
                  )}
                </svg>
              </button>
            )}
            <button type="button" onClick={playModel} disabled={!yourTurn || phase === "checking"} className={pill}>
              Nghe mẫu
            </button>
            <button type="button" onClick={() => next("skipped")} disabled={!yourTurn || phase === "checking"} className={pill}>
              {results[index] && typeof results[index] === "object" ? "Tiếp" : "Bỏ qua"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
