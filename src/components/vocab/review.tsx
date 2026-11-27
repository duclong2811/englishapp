"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Grade } from "ts-fsrs";
import { SpeakButton } from "@/components/speak-button";
import {
  dueIds,
  getServerSnapshot,
  getSnapshot,
  grade,
  GRADES,
  preview,
  subscribe,
} from "@/lib/vocab/srs-store";

export type ReviewCard = {
  id: string;
  headword: string;
  ipa: string | null;
  meanings: { pos: string; vi: string }[];
  note: string;
  example: { en: string; vi: string };
};

function formatInterval(from: Date, to: Date) {
  const minutes = Math.max(1, Math.round((+to - +from) / 60000));
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ`;
  const days = Math.round(hours / 24);
  if (days < 31) return `${days} ngày`;
  return `${Math.round(days / 30)} tháng`;
}

const buttonBase =
  "inline-flex min-h-12 items-center justify-center rounded-full px-6 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function Review({ cards }: { cards: ReviewCard[] }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [queue, setQueue] = useState<string[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Fix the session queue once progress is available (first client render).
  if (queue === null && state) {
    setQueue(dueIds(state, cards.map((c) => c.id), new Date()));
  }

  const byId = new Map(cards.map((c) => [c.id, c]));
  const current = queue && queue.length > 0 ? byId.get(queue[0]) : undefined;
  // Only computed on the client: queue stays null during prerender.
  const now = current ? new Date() : null;
  const options = current && state && now ? preview(state, current.id, now) : null;

  function reveal() {
    setRevealed(true);
  }

  function rate(rating: Grade) {
    if (!current || !queue) return;
    const at = new Date();
    grade(current.id, rating, at);
    const due = new Date(getSnapshot().cards[current.id].due);
    const rest = queue.slice(1);
    // Cards forgotten now come back later in the same session.
    setQueue(+due - +at < 15 * 60000 ? [...rest, current.id] : rest);
    setRevealed(false);
    setDone((d) => d + 1);
    headingRef.current?.focus();
  }

  const rateRef = useRef(rate);
  const revealRef = useRef(reveal);
  const revealedRef = useRef(revealed);
  useEffect(() => {
    rateRef.current = rate;
    revealRef.current = reveal;
    revealedRef.current = revealed;
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (!revealedRef.current && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        revealRef.current();
        return;
      }
      if (revealedRef.current) {
        const g = GRADES.find((x) => x.key === e.key);
        if (g) {
          e.preventDefault();
          rateRef.current(g.rating);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  if (!queue) {
    return <p className="text-ink-soft">Đang tải thẻ…</p>;
  }

  if (!current) {
    return (
      <section className="max-w-[42rem]" aria-live="polite">
        <h1 className="text-3xl font-semibold tracking-tight">Xong lượt ôn hôm nay</h1>
        <p className="mt-3 text-lg text-ink-soft text-pretty">
          {done > 0
            ? `Bạn vừa ôn ${done} lượt. Thẻ sẽ quay lại đúng lúc bạn sắp quên.`
            : "Chưa có thẻ nào đến hạn ôn. Hãy học một bộ từ mới theo chủ đề."}
        </p>
        <Link href="/vocabulary" className={`${buttonBase} mt-8 bg-accent text-accent-ink hover:opacity-90`}>
          Về trang từ vựng
        </Link>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-[42rem]">
      <div className="mb-4 flex items-center justify-between text-sm text-ink-soft">
        <Link href="/vocabulary" className="inline-flex min-h-11 items-center hover:text-accent focus-visible:outline-2 focus-visible:outline-accent">
          ← Dừng
        </Link>
        <span className="tabular-nums" aria-live="polite">
          Còn {queue.length} thẻ
        </span>
      </div>

      <section className="oli rounded-2xl border border-line p-6 sm:p-10" aria-labelledby="card-word">
        <h1
          id="card-word"
          ref={headingRef}
          tabIndex={-1}
          lang="en"
          className="en text-5xl leading-tight outline-none sm:text-6xl"
        >
          {current.headword}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-lg">
          {current.ipa ? (
            <span translate="no" className="text-ink-soft">
              /{current.ipa}/
            </span>
          ) : null}
          <SpeakButton key={current.id} text={current.headword} />
        </div>
      </section>

      {revealed ? (
        <div className="mt-6" aria-live="polite">
          <dl className="flex flex-col gap-2">
            {current.meanings.map((m) => (
              <div key={m.pos}>
                <dt className="text-sm text-ink-soft">{m.pos}</dt>
                <dd className="text-2xl font-medium text-pretty">{m.vi}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p lang="en" className="en text-xl leading-snug text-pretty">
                {current.example.en}
              </p>
              <p className="mt-1 text-ink-soft">{current.example.vi}</p>
            </div>
            <SpeakButton text={current.example.en} compact />
          </div>
          <p className="mt-5 rounded-xl border-l-4 border-accent bg-sheet p-4 text-pretty">{current.note}</p>
        </div>
      ) : null}

      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] mt-8 bg-paper/95 py-3 backdrop-blur lg:bottom-0">
        {revealed && options && now ? (
          <div>
            <p className="mb-2 text-center text-sm text-ink-soft">Bạn nhớ từ này đến mức nào?</p>
            <div className="grid grid-cols-4 gap-2">
              {GRADES.map((g) => (
                <button
                  key={g.rating}
                  type="button"
                  onClick={() => rate(g.rating)}
                  className={`flex min-h-16 flex-col items-center justify-center rounded-xl border px-1 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    g.key === "1"
                      ? "border-mistake/40 text-mistake hover:bg-mistake/10"
                      : g.key === "3"
                        ? "border-accent bg-accent text-accent-ink hover:opacity-90"
                        : "border-line bg-sheet hover:border-accent"
                  }`}
                >
                  <span>{g.label}</span>
                  <span className="text-xs font-normal tabular-nums opacity-80">
                    {formatInterval(now, options[g.rating].card.due)}
                  </span>
                  <span className="sr-only">, phím {g.key}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 hidden text-center text-xs text-ink-soft [@media(pointer:fine)]:block">
              Phím tắt: 1 Quên, 2 Khó, 3 Nhớ, 4 Dễ
            </p>
          </div>
        ) : (
          <div className="text-center">
            <button type="button" onClick={reveal} className={`${buttonBase} w-full bg-accent text-accent-ink hover:opacity-90 sm:w-auto`}>
              Hiện nghĩa
            </button>
            <p className="mt-2 hidden text-xs text-ink-soft [@media(pointer:fine)]:block">Phím tắt: Space</p>
          </div>
        )}
      </div>
    </div>
  );
}
