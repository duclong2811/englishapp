"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Explain, Marked, plain } from "@/components/grammar/rich-text";
import { SpeakButton } from "@/components/speak-button";
import type { Flashcard } from "@/lib/flashcards";

const primary =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const secondary =
  "inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-sheet px-6 font-semibold transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function shuffled<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** "S + [was / were] + V-ing": the part in brackets is the focus. */
function FormulaLine({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g).filter(Boolean);
  return (
    <p className="en text-lg">
      {parts.map((p, i) =>
        p.startsWith("[") ? (
          <strong key={i} className="font-semibold text-accent">
            {p.slice(1, -1)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </p>
  );
}

type Direction = "en-vi" | "vi-en";

function Front({ card, direction }: { card: Flashcard; direction: Direction }) {
  if (card.kind === "rule") {
    return (
      <>
        <p className="text-sm text-ink-soft">{card.part ? `${card.part} · ` : ""}Nhớ lại quy tắc và nghĩ một ví dụ</p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-balance">{card.cue}</p>
      </>
    );
  }
  if (card.kind === "mistake") {
    return (
      <>
        <p className="text-sm text-ink-soft">Câu này sai ở đâu? Sửa lại thế nào?</p>
        <p className="en mt-3 text-2xl text-mistake line-through decoration-2 text-pretty" lang="en">
          {card.wrong}
        </p>
      </>
    );
  }
  if (direction === "vi-en") {
    return (
      <>
        <p className="text-sm text-ink-soft">Từ tiếng Anh là gì?</p>
        <p className="mt-3 text-2xl font-semibold text-balance">{card.meaning}</p>
      </>
    );
  }
  return (
    <>
      <p className="text-sm text-ink-soft">Từ này nghĩa là gì?</p>
      <p className="en mt-3 text-4xl" lang="en">
        {card.headword}
      </p>
      {card.ipa ? (
        <p className="mt-1 text-ink-soft" translate="no">
          /{card.ipa}/
        </p>
      ) : null}
    </>
  );
}

function Back({ card }: { card: Flashcard }) {
  if (card.kind === "rule") {
    return (
      <>
        <p className="text-lg leading-relaxed text-pretty">
          <Explain text={card.rule} />
        </p>
        {card.formula.length ? (
          <div className="mt-3 space-y-1 rounded-xl bg-paper px-4 py-3">
            {card.formula.map((f) => (
              <FormulaLine key={f} text={f} />
            ))}
          </div>
        ) : null}
        {card.table ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  {card.table.head.map((h) => (
                    <th key={h} className="border-b border-line py-1.5 pr-3 font-medium text-ink-soft">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {card.table.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="border-b border-line py-1.5 pr-3">
                        <Explain text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {card.example ? (
          <div className="mt-4 border-l-2 border-accent pl-3">
            <p className="flex items-start gap-2">
              <span className="en flex-1 text-xl text-pretty" lang="en">
                <Marked text={card.example.en} />
              </span>
              <SpeakButton text={plain(card.example.en)} compact />
            </p>
            <p className="text-ink-soft text-pretty">{card.example.vi}</p>
            {card.example.why ? (
              <p className="mt-1 text-sm text-pretty">
                <span className="font-medium text-accent">Vì sao: </span>
                <Explain text={card.example.why} />
              </p>
            ) : null}
          </div>
        ) : null}
      </>
    );
  }
  if (card.kind === "mistake") {
    return (
      <>
        <p className="flex items-start gap-2">
          <span className="en flex-1 text-2xl font-medium text-correct text-pretty" lang="en">
            {card.right}
          </span>
          <SpeakButton text={card.right} compact />
        </p>
        <p className="mt-2 text-pretty">{card.why}</p>
      </>
    );
  }
  return (
    <>
      <p className="flex items-center gap-3">
        <span className="en text-3xl" lang="en">
          {card.headword}
        </span>
        <SpeakButton text={card.headword} compact />
      </p>
      {card.ipa ? (
        <p className="text-ink-soft" translate="no">
          /{card.ipa}/
        </p>
      ) : null}
      <p className="mt-2 text-xl font-medium text-pretty">{card.meaning}</p>
      {card.note ? (
        <div className="mt-3 rounded-xl bg-paper px-4 py-3">
          <p className="text-sm font-medium text-accent">Cách dùng</p>
          <p className="mt-0.5 text-pretty">{card.note}</p>
        </div>
      ) : null}
      {card.example ? (
        <div className="mt-4 border-l-2 border-accent pl-3">
          <p className="en text-lg text-pretty" lang="en">
            {card.example.en}
          </p>
          <p className="text-ink-soft text-pretty">{card.example.vi}</p>
        </div>
      ) : null}
    </>
  );
}

/**
 * Flip a card, say honestly whether you remembered, move on. Cards you did
 * not remember come back at the end of the round until you know them all.
 */
export function Flashcards({
  cards,
  title,
  back,
  words = false,
}: {
  cards: Flashcard[];
  title: string;
  back: { href: string; label: string };
  /** Word decks can be studied either way round. */
  words?: boolean;
}) {
  const [direction, setDirection] = useState<Direction>("en-vi");
  const [queue, setQueue] = useState<Flashcard[] | null>(null);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [missed, setMissed] = useState<Flashcard[]>([]);
  const [round, setRound] = useState(1);
  const [firstTry, setFirstTry] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const current = queue?.[pos];

  function start(list: Flashcard[], isNewRound: boolean) {
    setQueue(shuffled(list));
    setPos(0);
    setFlipped(false);
    setMissed([]);
    if (isNewRound) setRound((r) => r + 1);
    else {
      setRound(1);
      setFirstTry(0);
    }
  }

  function answer(remembered: boolean) {
    if (!queue || !current) return;
    const nextMissed = remembered ? missed : [...missed, current];
    if (remembered && round === 1) setFirstTry((n) => n + 1);
    setMissed(nextMissed);
    setFlipped(false);
    setPos(pos + 1);
  }

  // Space or Enter flips; 1 = chưa nhớ, 2 = nhớ rồi.
  const flip = () => setFlipped(true);
  const keys = useRef({ flipped, answer, flip });
  useEffect(() => {
    keys.current = { flipped, answer, flip };
  });
  useEffect(() => {
    if (!current) return;
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement) return;
      const k = keys.current;
      if ((e.key === " " || e.key === "Enter") && !k.flipped) {
        e.preventDefault();
        k.flip();
      } else if (k.flipped && (e.key === "1" || e.key === "2")) k.answer(e.key === "2");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current]);

  useEffect(() => {
    cardRef.current?.focus({ preventScroll: true });
  }, [pos, flipped]);

  if (!queue) {
    return (
      <section className="oli max-w-[42rem] rounded-2xl border border-line p-6 sm:p-8">
        <h2 className="text-sm font-medium text-ink-soft">Thẻ ghi nhớ</h2>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</p>
        <p className="mt-3 text-pretty">
          {cards.length} thẻ. Nhìn mặt trước, tự nhớ lại, rồi lật thẻ xem đáp án. Thẻ nào chưa nhớ sẽ quay lại cho đến khi bạn nhớ hết.
        </p>
        {words ? (
          <fieldset className="mt-5">
            <legend className="text-sm text-ink-soft">Mặt trước là</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ["en-vi", "Từ tiếng Anh"],
                  ["vi-en", "Nghĩa tiếng Việt"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={direction === value}
                  onClick={() => setDirection(value)}
                  className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    direction === value ? "border-accent bg-accent text-accent-ink" : "border-line bg-sheet hover:border-accent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}
        <button type="button" onClick={() => start(cards, false)} className={`${primary} mt-6`}>
          Bắt đầu
        </button>
      </section>
    );
  }

  if (!current) {
    const all = missed.length === 0;
    return (
      <section className="oli max-w-[42rem] rounded-2xl border border-line p-6 sm:p-8" aria-live="polite">
        <h2 className="text-sm font-medium text-ink-soft">Hết lượt {round}</h2>
        {all ? (
          <>
            <p className="mt-2 text-2xl font-semibold text-balance">Bạn đã nhớ hết {cards.length} thẻ.</p>
            <p className="mt-2 text-ink-soft tabular-nums">
              Nhớ ngay từ lượt đầu: {firstTry}/{cards.length} thẻ.
            </p>
          </>
        ) : (
          <p className="mt-2 text-2xl font-semibold text-balance">Còn {missed.length} thẻ chưa nhớ.</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {all ? (
            <button type="button" onClick={() => start(cards, false)} className={primary}>
              Làm lại từ đầu
            </button>
          ) : (
            <button type="button" onClick={() => start(missed, true)} className={primary}>
              Ôn lại {missed.length} thẻ chưa nhớ
            </button>
          )}
          <Link href={back.href} className={secondary}>
            {back.label}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="max-w-[42rem]">
      <div className="flex items-center gap-3 text-sm text-ink-soft tabular-nums">
        <span>
          {round > 1 ? `Lượt ${round} · ` : ""}Thẻ {pos + 1}/{queue.length}
        </span>
        <span
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={queue.length}
          aria-valuenow={pos}
          aria-label="Tiến độ"
        >
          <span className="block h-full rounded-full bg-accent" style={{ width: `${(pos / queue.length) * 100}%` }} />
        </span>
      </div>

      <div
        ref={cardRef}
        tabIndex={-1}
        className="mt-4 min-h-64 rounded-2xl border border-line bg-sheet p-6 focus:outline-none sm:p-8"
        aria-live="polite"
      >
        <div key={`${pos}-${flipped}`} className="motion-safe:animate-[fadein_160ms_ease-out]">
          {flipped ? (
            <>
              <p className="mb-3 text-sm text-ink-soft">
                {current.kind === "rule" ? (current.part ? `${current.part} · ${current.cue}` : current.cue) : current.kind === "mistake" ? "Câu đúng" : "Đáp án"}
              </p>
              <Back card={current} />
            </>
          ) : (
            <Front card={current} direction={direction} />
          )}
        </div>
      </div>

      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] mt-4 flex gap-3 border-t border-line bg-paper/95 py-3 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
        {flipped ? (
          <>
            <button type="button" onClick={() => answer(false)} className={`${secondary} flex-1 sm:flex-none`}>
              <span aria-hidden className="mr-2 hidden text-sm text-ink-soft pointer-fine:inline">
                1
              </span>
              Chưa nhớ
            </button>
            <button type="button" onClick={() => answer(true)} className={`${primary} flex-1 sm:flex-none`}>
              <span aria-hidden className="mr-2 hidden text-sm opacity-80 pointer-fine:inline">
                2
              </span>
              Nhớ rồi
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setFlipped(true)} className={`${primary} flex-1 sm:flex-none`}>
            Lật thẻ
          </button>
        )}
      </div>
    </div>
  );
}
