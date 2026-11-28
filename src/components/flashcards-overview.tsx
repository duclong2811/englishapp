"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Illustration } from "@/components/illustration";
import { LevelPicker, useLevelSelection } from "@/components/level-picker";
import type { Level } from "@/lib/levels";

type LevelDecks = {
  level: Level;
  units: { id: string; title: string; lessons: { id: string; title: string; number: number }[] }[];
  topics: { id: string; title: string; count: number }[];
};

type Tab = "vocab" | "grammar";
const TAB_KEY = "flashcards:tab:v1";
const tabListeners = new Set<() => void>();

function readTab(): Tab {
  const fromUrl = new URLSearchParams(window.location.search).get("tab");
  if (fromUrl === "vocab" || fromUrl === "grammar") return fromUrl;
  try {
    return localStorage.getItem(TAB_KEY) === "grammar" ? "grammar" : "vocab";
  } catch {
    return "vocab";
  }
}

function setTab(tab: Tab) {
  try {
    localStorage.setItem(TAB_KEY, tab);
  } catch {
    // the tab just isn't remembered
  }
  const url = new URL(window.location.href);
  url.searchParams.set("tab", tab);
  window.history.replaceState(null, "", url);
  tabListeners.forEach((l) => l());
}

const subscribeTab = (l: () => void) => {
  tabListeners.add(l);
  return () => tabListeners.delete(l);
};

const smallLink =
  "inline-flex min-h-11 items-center rounded-md px-1 text-sm font-medium text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent";

export function FlashcardsOverview({ levels }: { levels: LevelDecks[] }) {
  const available = levels.map((l) => l.level);
  const { current, select } = useLevelSelection("flashcards:level:v1", available, available[0] ?? "A1");
  const data = levels.find((l) => l.level === current) ?? levels[0];
  const tab = useSyncExternalStore(subscribeTab, readTab, () => "vocab" as Tab);
  const words = data.topics.reduce((n, t) => n + t.count, 0);
  const lessons = data.units.reduce((n, u) => n + u.lessons.length, 0);

  return (
    <div>
      <div className="max-w-3xl">
        <LevelPicker current={data.level} available={available} onSelect={select} />
      </div>

      <div role="tablist" aria-label="Loại thẻ" className="inline-flex gap-1 rounded-full border border-line bg-sheet p-1">
        {(
          [
            ["vocab", `Từ vựng (${data.topics.length} chủ đề)`],
            ["grammar", `Ngữ pháp (${lessons} bài)`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`min-h-11 rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              tab === key ? "bg-accent text-accent-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "vocab" ? (
        <section aria-label={`Thẻ từ vựng ${data.level}`} className="mt-6">
          <p className="text-sm text-ink-soft tabular-nums">
            {data.topics.length} bộ thẻ, {new Intl.NumberFormat("vi-VN").format(words)} từ. Mỗi chủ đề là một bộ: nhìn từ, nhớ nghĩa, lật thẻ.
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {data.topics.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/vocabulary/topic/${t.id}/cards`}
                  className="flex h-full items-center gap-3 rounded-xl border border-line bg-sheet p-3 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <Illustration id={t.id} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-snug text-balance sm:text-base">{t.title}</span>
                    <span className="text-xs text-ink-soft tabular-nums">{t.count} thẻ</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section aria-label={`Thẻ ngữ pháp ${data.level}`} className="mt-6">
          <p className="text-sm text-ink-soft">Mỗi quy tắc và lỗi hay gặp là một thẻ. Ôn từng bài, hoặc cả chương một lượt.</p>
          <ol className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.units.map((u, i) => (
              <li key={u.id} className="flex flex-col rounded-2xl border border-line bg-sheet">
                <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
                  <h3 className="min-w-0 font-semibold text-balance">
                    <span className="text-ink-soft">Chương {i + 1} · </span>
                    {u.title}
                  </h3>
                  <Link href={`/lessons/chapter/${u.id}`} className={`${smallLink} shrink-0`}>
                    Ôn cả chương
                  </Link>
                </header>
                <ul className="py-1">
                  {u.lessons.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/lessons/${l.id}/cards`}
                        className="flex min-h-12 items-center gap-3 px-4 py-2 transition-colors hover:bg-line/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                      >
                        <span className="w-6 shrink-0 text-right text-sm text-ink-soft tabular-nums">{l.number}</span>
                        <span className="min-w-0 flex-1 text-pretty">{l.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
