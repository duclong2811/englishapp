"use client";

export type Scores = Record<string, { best: number; at: string }>;

/** Best score per item, kept in this browser. Read with useSyncExternalStore. */
export function createScoreStore(key: string) {
  const listeners = new Set<() => void>();
  let cached: Scores | null = null;

  function read(): Scores {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "{}") as Scores;
    } catch {
      return {};
    }
  }

  return {
    subscribe(l: () => void) {
      listeners.add(l);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) {
          cached = null;
          l();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(l);
        window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot(): Scores {
      cached ??= read();
      return cached;
    },
    getServerSnapshot(): Scores | null {
      return null;
    },
    save(id: string, score: number) {
      const all = { ...read() };
      all[id] = { best: Math.max(all[id]?.best ?? 0, score), at: new Date().toISOString() };
      try {
        localStorage.setItem(key, JSON.stringify(all));
      } catch {
        // storage blocked: the score just isn't kept
      }
      cached = all;
      listeners.forEach((l) => l());
    },
  };
}
