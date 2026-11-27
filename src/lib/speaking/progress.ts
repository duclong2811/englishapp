"use client";

/** Best score per speaking lesson, stored on this device. */
export type LessonProgress = Record<string, { best: number; at: string }>;

const KEY = "speak:lessons:v1";
const listeners = new Set<() => void>();
let cached: LessonProgress | null = null;

function read(): LessonProgress {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as LessonProgress;
  } catch {
    return {};
  }
}

export function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cached = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): LessonProgress {
  cached ??= read();
  return cached;
}

export function getServerSnapshot(): LessonProgress | null {
  return null;
}

export function saveScore(topic: string, score: number) {
  const all = { ...read() };
  const prev = all[topic]?.best ?? 0;
  all[topic] = { best: Math.max(prev, score), at: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // storage full or blocked: progress just isn't kept
  }
  cached = all;
  listeners.forEach((l) => l());
}
