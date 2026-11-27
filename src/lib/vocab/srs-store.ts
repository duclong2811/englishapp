"use client";

import { createEmptyCard, fsrs, Rating, type Card, type Grade } from "ts-fsrs";

/** Per-device study progress, kept in localStorage until accounts/sync exist. */
const KEY = "vocab:srs:v1";

type StoredCard = Omit<Card, "due" | "last_review"> & { due: string; last_review?: string };
export type State = { cards: Record<string, StoredCard>; newByDay: Record<string, number> };

const scheduler = fsrs();
const listeners = new Set<() => void>();
let snapshot: State | null = null;

function read(): State {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch {
    // storage blocked or corrupt: start fresh
  }
  return { cards: {}, newByDay: {} };
}

function write(next: State) {
  snapshot = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // keep working in memory
  }
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      snapshot = read();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): State {
  if (!snapshot) snapshot = read();
  return snapshot;
}

export function getServerSnapshot(): State | null {
  return null;
}

export function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function toCard(stored: StoredCard | undefined): Card {
  if (!stored) return createEmptyCard();
  return {
    ...stored,
    due: new Date(stored.due),
    last_review: stored.last_review ? new Date(stored.last_review) : undefined,
  };
}

/** Ids of studied cards that are due now, most overdue first. New words come from topic sets. */
export function dueIds(state: State, ids: string[], now: Date): string[] {
  return ids
    .filter((id) => state.cards[id] && new Date(state.cards[id].due) <= now)
    .sort((a, b) => +new Date(state.cards[a].due) - +new Date(state.cards[b].due));
}

export function preview(state: State, id: string, now: Date) {
  return scheduler.repeat(toCard(state.cards[id]), now);
}

export function grade(id: string, rating: Grade, now: Date) {
  const state = getSnapshot();
  const isNew = !state.cards[id];
  const { card } = scheduler.next(toCard(state.cards[id]), now, rating);
  const stored: StoredCard = {
    ...card,
    due: card.due.toISOString(),
    last_review: card.last_review?.toISOString(),
  };
  const day = dayKey(now);
  write({
    cards: { ...state.cards, [id]: stored },
    newByDay: isNew ? { ...state.newByDay, [day]: (state.newByDay[day] ?? 0) + 1 } : state.newByDay,
  });
}

/**
 * Stores the outcome of learning a set: words answered right start (or continue)
 * as "Good", words answered wrong as "Again" so they come back soon.
 */
export function recordResults(results: { id: string; correct: boolean }[], now: Date) {
  for (const r of results) grade(r.id, r.correct ? Rating.Good : Rating.Again, now);
}

export function learnedCount(state: State, ids: string[]) {
  return ids.filter((id) => state.cards[id]).length;
}

export const GRADES: { rating: Grade; label: string; key: string }[] = [
  { rating: Rating.Again, label: "Quên", key: "1" },
  { rating: Rating.Hard, label: "Khó", key: "2" },
  { rating: Rating.Good, label: "Nhớ", key: "3" },
  { rating: Rating.Easy, label: "Dễ", key: "4" },
];
