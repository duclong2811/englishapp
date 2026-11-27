"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe } from "@/lib/vocab/srs-store";
import { buildSession, SESSION_SIZE, type PracticeWord, type Question } from "./quiz";
import { primaryButton, QuizRunner } from "./quiz-runner";

export type { PracticeWord } from "./quiz";
export { buildSession, makeCloze } from "./quiz";

const MIN_POOL = 4;
const noopSubscribe = () => () => {};

export function Practice({ words }: { words: PracticeWord[] }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const canSpeak = useSyncExternalStore(noopSubscribe, () => "speechSynthesis" in window, () => false);
  const [session, setSession] = useState<Question[] | null>(null);
  const [round, setRound] = useState(0);
  const [missed, setMissed] = useState<string[] | null>(null);

  const learned = state ? words.filter((w) => state.cards[w.id]) : [];
  const pool = learned.length >= MIN_POOL ? learned : words;
  const usingLearned = learned.length >= MIN_POOL;
  const byId = new Map(words.map((w) => [w.id, w]));

  function start() {
    setSession(buildSession(pool, words, canSpeak));
    setMissed(null);
    setRound((r) => r + 1);
  }

  if (!session) {
    return (
      <section className="max-w-[42rem]">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Luyện tập từ vựng</h1>
        <p className="mt-3 text-lg text-ink-soft text-pretty">
          {SESSION_SIZE} câu trộn ba dạng: nghe chọn nghĩa, điền từ vào câu, và nhìn nghĩa chọn từ.
        </p>
        <p className="mt-2 text-ink-soft text-pretty" aria-live="polite">
          {state === null
            ? "Đang tải…"
            : usingLearned
              ? `Câu hỏi lấy từ ${learned.length} từ bạn đã học.`
              : `Bạn chưa học đủ ${MIN_POOL} từ nên câu hỏi lấy từ cả ${words.length} từ cốt lõi.`}
        </p>
        <button type="button" onClick={start} disabled={state === null} className={`${primaryButton} mt-8 disabled:opacity-50`}>
          Bắt đầu
        </button>
      </section>
    );
  }

  if (missed === null) {
    return <QuizRunner key={round} questions={session} onFinish={setMissed} exitHref="/vocabulary" />;
  }

  const correct = session.length - missed.length;
  return (
    <section className="max-w-[42rem]" aria-live="polite">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Đúng {correct}/{session.length} câu
      </h1>
      {missed.length > 0 ? (
        <>
          <p className="mt-3 text-lg text-ink-soft">Xem lại những từ bạn chọn sai:</p>
          <MissedWords ids={missed} byId={byId} />
        </>
      ) : (
        <p className="mt-3 text-lg text-ink-soft">Không sai câu nào. Làm tốt lắm.</p>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={start} className={primaryButton}>
          Luyện thêm {SESSION_SIZE} câu
        </button>
        <Link href="/vocabulary" className={secondaryButton}>
          Về trang từ vựng
        </Link>
      </div>
    </section>
  );
}

export const secondaryButton =
  "inline-flex min-h-12 items-center rounded-full border border-line bg-sheet px-6 font-semibold transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function MissedWords({ ids, byId }: { ids: string[]; byId: Map<string, { id: string; headword: string }> }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {ids.map((id) => {
        const w = byId.get(id);
        if (!w) return null;
        return (
          <li key={id}>
            <Link
              href={`/vocabulary/word/${w.id}`}
              lang="en"
              className="en inline-flex min-h-11 items-center rounded-full border border-mistake/40 bg-sheet px-4 text-lg text-mistake hover:bg-mistake/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {w.headword}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
