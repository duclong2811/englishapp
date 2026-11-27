"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SpeakButton } from "@/components/speak-button";
import { VoicePicker } from "@/components/speaking/voice-picker";
import { startRecording, unlockAudio } from "@/lib/speaking/recorder";
import { createSpeaker, unlockPlayback, type Speaker } from "@/lib/speaking/speaker";
import { SentenceBuffer } from "@/lib/speaking/speech";
import type { Feedback, Turn } from "@/lib/speaking/schema";

export type ConversationScenario = {
  id: string;
  title: string;
  goal: string;
  opening: string;
  starters: string[];
};

type Phase = "ready" | "idle" | "listening" | "transcribing" | "thinking" | "speaking" | "ended";
type Recording = Awaited<ReturnType<typeof startRecording>>;

/** The API accepts 40 messages, so at most 19 learner turns fit. */
const DEFAULT_MAX_TURNS = 15;
const MAX_CHARS = 600;

const STATUS: Record<Phase, string> = {
  ready: "Bấm Bắt đầu để nghe câu đầu tiên.",
  idle: "Đến lượt bạn. Bấm micro rồi nói.",
  listening: "Đang nghe… Nói xong thì dừng một chút, app sẽ tự gửi.",
  transcribing: "Đang chuyển giọng nói thành chữ…",
  thinking: "AI đang trả lời…",
  speaking: "AI đang nói. Bấm micro để ngắt lời và nói luôn.",
  ended: "Đã kết thúc buổi luyện nói.",
};

const pill =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-sheet px-4 font-medium transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50";
const primary =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50";

export function Conversation({
  scenario,
  maxTurns = DEFAULT_MAX_TURNS,
}: {
  scenario: ConversationScenario;
  maxTurns?: number;
}) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [messages, setMessages] = useState<Turn[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [level, setLevel] = useState(0);
  const [handsFree, setHandsFree] = useState(true);
  const [draft, setDraft] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [feedbackState, setFeedbackState] = useState<"none" | "loading" | "error">("none");
  const [feedbackError, setFeedbackError] = useState("");

  const speaker = useRef<Speaker | null>(null);
  const recording = useRef<Recording | null>(null);
  const stopping = useRef(false);
  const request = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Turn[]>([]);
  const phaseRef = useRef<Phase>("ready");
  const handsFreeRef = useRef(true);
  const listenRef = useRef<() => void>(() => {});
  const maxTurnsRef = useRef(maxTurns);

  const learnerTurns = messages.filter((m) => m.role === "user").length;
  const atLimit = learnerTurns >= maxTurns;

  function updatePhase(p: Phase) {
    phaseRef.current = p;
    setPhase(p);
  }

  function updateMessages(next: Turn[]) {
    messagesRef.current = next;
    setMessages(next);
  }

  useEffect(() => {
    handsFreeRef.current = handsFree;
  }, [handsFree]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, phase, feedback]);

  useEffect(() => {
    return () => {
      recording.current?.cancel();
      request.current?.abort();
      speaker.current?.cancel();
    };
  }, []);

  function getSpeaker() {
    if (!speaker.current) {
      speaker.current = createSpeaker(() => {
        if (phaseRef.current !== "speaking") return;
        updatePhase("idle");
        const turns = messagesRef.current.filter((m) => m.role === "user").length;
        if (handsFreeRef.current && turns < maxTurnsRef.current) listenRef.current();
      });
    }
    return speaker.current;
  }

  function begin() {
    // The first speech and audio must start inside a tap, or iOS keeps them muted.
    try {
      unlockAudio();
      unlockPlayback();
    } catch {
      // no Web Audio; typing still works
    }
    const s = getSpeaker();
    s.begin();
    updatePhase("speaking");
    s.speak(scenario.opening);
    s.finish();
  }

  async function reply(text: string) {
    const clean = text.trim().slice(0, MAX_CHARS);
    if (!clean || atLimit) return;
    recording.current?.cancel();
    recording.current = null;
    setNotice(null);
    setDraft("");
    const history: Turn[] = [...messagesRef.current, { role: "user", content: clean }];
    updateMessages(history);
    updatePhase("thinking");

    const s = getSpeaker();
    s.begin();
    const controller = new AbortController();
    request.current = controller;
    const sentences = new SentenceBuffer();
    let answer = "";
    try {
      const res = await fetch("/api/speak/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scenarioId: scenario.id, messages: history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error(`chat ${res.status}`);
      if (res.headers.get("x-speak-demo")) setDemo(true);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        answer += chunk;
        updateMessages([...history, { role: "assistant", content: answer }]);
        for (const sentence of sentences.push(chunk)) {
          if (phaseRef.current === "thinking") updatePhase("speaking");
          s.speak(sentence);
        }
      }
      for (const sentence of sentences.flush()) {
        if (phaseRef.current === "thinking") updatePhase("speaking");
        s.speak(sentence);
      }
      if (!answer.trim()) throw new Error("empty reply");
      updateMessages([...history, { role: "assistant", content: answer.trim().slice(0, MAX_CHARS) }]);
      if (phaseRef.current === "thinking") updatePhase("speaking");
      s.finish();
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error(err);
      // Drop the unanswered line so the learner can try again.
      updateMessages(history.slice(0, -1));
      setDraft(clean);
      setNotice("Không kết nối được với AI. Kiểm tra mạng rồi gửi lại nhé.");
      updatePhase("idle");
    } finally {
      if (request.current === controller) request.current = null;
    }
  }

  async function listen() {
    if (recording.current || atLimit) return;
    request.current?.abort();
    speaker.current?.cancel();
    setNotice(null);
    setLevel(0);
    try {
      stopping.current = false;
      recording.current = await startRecording({ onLevel: setLevel, onSilence: () => void finishListening() });
      updatePhase("listening");
    } catch (err) {
      recording.current = null;
      const name = err instanceof DOMException ? err.name : "";
      setHandsFree(false);
      setNotice(
        name === "NotAllowedError"
          ? "App chưa được dùng micro. Trên iPhone: Cài đặt > Safari > Micro, chọn Cho phép. Bạn vẫn có thể gõ câu trả lời."
          : "Không mở được micro trên thiết bị này. Bạn có thể gõ câu trả lời.",
      );
      updatePhase("idle");
    }
  }
  listenRef.current = () => void listen();

  async function finishListening() {
    const rec = recording.current;
    if (!rec || stopping.current) return;
    stopping.current = true;
    recording.current = null;
    setLevel(0);
    const { wav, seconds, spoke } = await rec.stop();
    if (!spoke || seconds < 0.5) {
      setNotice("Chưa nghe thấy gì. Bấm micro rồi nói to, rõ hơn nhé.");
      updatePhase("idle");
      return;
    }
    updatePhase("transcribing");
    try {
      const form = new FormData();
      form.append("audio", wav, "speech.wav");
      const res = await fetch("/api/speak/transcribe", { method: "POST", body: form });
      if (res.status === 501) {
        setHandsFree(false);
        setNotice("Máy chủ chưa bật nhận giọng nói. Tạm thời hãy gõ câu trả lời.");
        updatePhase("idle");
        return;
      }
      if (!res.ok) throw new Error(`transcribe ${res.status}`);
      const { text } = (await res.json()) as { text?: string };
      if (!text?.trim()) {
        setNotice("Chưa nghe rõ. Thử nói lại chậm hơn nhé.");
        updatePhase("idle");
        return;
      }
      await reply(text);
    } catch (err) {
      console.error(err);
      setNotice("Không gửi được giọng nói. Kiểm tra mạng rồi thử lại.");
      updatePhase("idle");
    }
  }

  function micPressed() {
    if (phase === "listening") void finishListening();
    else void listen();
  }

  async function end() {
    recording.current?.cancel();
    recording.current = null;
    request.current?.abort();
    speaker.current?.cancel();
    updatePhase("ended");
    if (learnerTurns === 0) return;
    setFeedbackState("loading");
    try {
      const res = await fetch("/api/speak/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scenarioId: scenario.id,
          messages: [{ role: "assistant", content: scenario.opening }, ...messagesRef.current],
        }),
      });
      const data = (await res.json().catch(() => ({}))) as Feedback & { error?: string };
      if (!res.ok) {
        setFeedbackError(data.error ?? "Chưa tạo được nhận xét.");
        setFeedbackState("error");
        return;
      }
      setFeedback(data);
      setFeedbackState("none");
    } catch {
      setFeedbackError("Không kết nối được. Kiểm tra mạng rồi thử lại.");
      setFeedbackState("error");
    }
  }

  function restart() {
    updateMessages([]);
    setFeedback(null);
    setFeedbackState("none");
    setNotice(null);
    begin();
  }

  const busy = phase === "transcribing" || phase === "thinking";
  const canType = phase !== "ready" && phase !== "ended" && !busy && !atLimit;

  return (
    <div className="max-w-[42rem]">
      {demo ? (
        <p className="mb-4 rounded-xl border border-highlight bg-highlight/20 px-4 py-3 text-sm text-pretty">
          Đang chạy chế độ thử: máy chủ chưa có khóa API nên AI chỉ trả lời một câu mẫu.
        </p>
      ) : null}

      {phase !== "ended" ? (
        <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1">
          <VoicePicker />
          {phase !== "ready" ? (
            <label className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={handsFree}
                onChange={(e) => setHandsFree(e.target.checked)}
                className="size-5 accent-accent"
              />
              Tự bật micro khi AI nói xong
            </label>
          ) : null}
        </div>
      ) : null}

      <ol className="flex flex-col gap-3" aria-label="Hội thoại">
        {phase !== "ready" ? <Bubble role="assistant" text={scenario.opening} /> : null}
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} text={m.content} />
        ))}
      </ol>

      {phase === "ready" ? (
        <div className="rounded-2xl border border-line bg-sheet p-5">
          <p className="text-ink-soft text-pretty">
            AI nói trước. Mỗi lượt bạn bấm micro rồi nói tiếng Anh; nói xong dừng khoảng một giây là app tự gửi. Nên
            dùng tai nghe để AI không nghe lại tiếng của chính nó.
          </p>
          <button type="button" onClick={begin} className={`${primary} mt-4`}>
            Bắt đầu
          </button>
        </div>
      ) : null}

      {phase !== "ready" && learnerTurns === 0 && phase !== "ended" ? (
        <div className="mt-4">
          <p className="text-sm text-ink-soft">Chưa biết nói gì? Bấm một câu gợi ý:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {scenario.starters.map((s) => (
              <button key={s} type="button" disabled={busy} onClick={() => void reply(s)} className={`${pill} en`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {phase === "ended" ? (
        <FeedbackPanel
          state={feedbackState}
          error={feedbackError}
          feedback={feedback}
          spoke={learnerTurns > 0}
          onRetry={() => void end()}
          onRestart={restart}
        />
      ) : null}

      <div ref={endRef} />

      {phase !== "ready" && phase !== "ended" ? (
        <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] mt-6 border-t border-line bg-paper/95 py-3 backdrop-blur lg:bottom-0">
          <div className="flex items-center gap-3">
            <p role="status" aria-live="polite" className="min-w-0 flex-1 text-sm text-ink-soft text-pretty">
              {notice ?? (atLimit ? "Buổi nói đã đủ dài. Bấm Kết thúc để nhận nhận xét." : STATUS[phase])}
            </p>
            <button type="button" onClick={() => void end()} className={`${pill} shrink-0 text-sm`}>
              Kết thúc
            </button>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={micPressed}
              disabled={busy || atLimit}
              aria-pressed={phase === "listening"}
              aria-label={phase === "listening" ? "Dừng và gửi" : "Nói"}
              className={`relative grid size-16 shrink-0 place-items-center rounded-full text-accent-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 ${
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
              {phase === "listening" ? <StopIcon /> : busy ? <Dots /> : <MicIcon />}
            </button>
            <form
              className="flex min-w-0 flex-1 gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void reply(draft);
              }}
            >
              <label htmlFor="speak-draft" className="sr-only">
                Gõ câu trả lời bằng tiếng Anh
              </label>
              <input
                id="speak-draft"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={!canType}
                maxLength={MAX_CHARS}
                autoComplete="off"
                autoCapitalize="sentences"
                enterKeyHint="send"
                placeholder="Hoặc gõ ở đây…"
                className="en min-h-11 min-w-0 flex-1 rounded-full border border-line bg-sheet px-4 text-base placeholder:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
              />
              <button type="submit" disabled={!canType || !draft.trim()} className={pill}>
                Gửi
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Bubble({ role, text }: { role: Turn["role"]; text: string }) {
  const mine = role === "user";
  return (
    <li className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          mine ? "rounded-br-md bg-accent text-accent-ink" : "rounded-bl-md border border-line bg-sheet"
        }`}
      >
        <span className="sr-only">{mine ? "Bạn: " : "AI: "}</span>
        <span className="en text-lg leading-relaxed text-pretty">{text}</span>
      </div>
    </li>
  );
}

function FeedbackPanel({
  state,
  error,
  feedback,
  spoke,
  onRetry,
  onRestart,
}: {
  state: "none" | "loading" | "error";
  error: string;
  feedback: Feedback | null;
  spoke: boolean;
  onRetry: () => void;
  onRestart: () => void;
}) {
  return (
    <section aria-labelledby="feedback-heading" className="mt-8 rounded-2xl border border-line bg-sheet p-5 sm:p-6" aria-busy={state === "loading"}>
      <h2 id="feedback-heading" className="text-xl font-semibold">
        Nhận xét
      </h2>
      {!spoke ? (
        <p className="mt-2 text-ink-soft">Bạn chưa nói câu nào nên chưa có nhận xét.</p>
      ) : state === "loading" ? (
        <p className="mt-2 text-ink-soft" role="status">
          AI đang đọc lại cuộc trò chuyện, khoảng 10–20 giây…
        </p>
      ) : state === "error" ? (
        <div className="mt-2">
          <p className="text-mistake">{error}</p>
          <button type="button" onClick={onRetry} className={`${pill} mt-3`}>
            Thử lại
          </button>
        </div>
      ) : feedback ? (
        <div className="mt-3 space-y-6">
          <p className="text-lg text-pretty">
            <span className="mr-2 inline-block rounded-full bg-accent px-3 py-0.5 text-base font-semibold text-accent-ink tabular-nums">
              {feedback.score}/5
            </span>
            {feedback.summary}
          </p>
          {feedback.strengths.length ? (
            <div>
              <h3 className="font-semibold">Làm tốt</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-pretty">
                {feedback.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {feedback.corrections.length ? (
            <div>
              <h3 className="font-semibold">Sửa lỗi</h3>
              <ul className="mt-2 space-y-3">
                {feedback.corrections.map((c, i) => (
                  <li key={i} className="rounded-xl border border-line p-4">
                    <p className="en text-ink-soft line-through decoration-mistake">{c.said}</p>
                    <p className="en mt-1 text-lg font-medium text-correct">{c.better}</p>
                    <p className="mt-2 text-sm text-pretty">{c.why}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {feedback.better_phrases.length ? (
            <div>
              <h3 className="font-semibold">Câu nên dùng lần sau</h3>
              <ul className="mt-2 space-y-2">
                {feedback.better_phrases.map((p, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <SpeakButton text={p.en} compact />
                    <span className="min-w-0">
                      <span className="en block text-lg">{p.en}</span>
                      <span className="block text-sm text-ink-soft">{p.vi}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={onRestart} className={primary}>
          Nói lại tình huống này
        </button>
        <Link href="/speaking" className={pill}>
          Chọn tình huống khác
        </Link>
      </div>
    </section>
  );
}

function MicIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function Dots() {
  return (
    <span aria-hidden className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-current motion-safe:animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}
