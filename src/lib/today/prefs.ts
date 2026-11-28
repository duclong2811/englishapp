"use client";

/** The learner's goal and daily time, set on first visit. Synced with the account ("prefs:v1"). */
export type Goal = "level" | "talk" | "exam";
export type Prefs = { level: string; goal: Goal; minutes: number; at: string };

const KEY = "prefs:v1";
const listeners = new Set<() => void>();
let cached: Prefs | null | undefined;

function read(): Prefs | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return v && typeof v.level === "string" && typeof v.minutes === "number" ? (v as Prefs) : null;
  } catch {
    return null;
  }
}

export const prefsStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        cached = undefined;
        l();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot(): Prefs | null | undefined {
    if (cached === undefined) cached = read();
    return cached;
  },
  /** undefined on the server: not known yet (null means "not set"). */
  getServerSnapshot(): Prefs | null | undefined {
    return undefined;
  },
  save(p: Omit<Prefs, "at">) {
    const next: Prefs = { ...p, at: new Date().toISOString() };
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // storage blocked: keep in memory for this visit
    }
    cached = next;
    listeners.forEach((l) => l());
  },
};
