"use client";

import { useCallback, useSyncExternalStore } from "react";
import { LEVEL_LABELS, LEVELS, type Level } from "@/lib/levels";

function serverLevel() {
  return null;
}

export function useLevelSelection(key: string, available: readonly Level[], fallback: Level) {
  const subscribe = useCallback((listener: () => void) => {
    function onStorage(event: StorageEvent) {
      if (event.key === key || event.key === null) listener();
    }

    window.addEventListener(key, listener);
    window.addEventListener("popstate", listener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(key, listener);
      window.removeEventListener("popstate", listener);
      window.removeEventListener("storage", onStorage);
    };
  }, [key]);

  function getSnapshot() {
    const query = new URLSearchParams(window.location.search).get("level")?.toUpperCase();
    const fromUrl = available.find((level) => level === query);
    if (fromUrl) return fromUrl;

    try {
      const stored = window.localStorage.getItem(key);
      return available.find((level) => level === stored) ?? null;
    } catch {
      return null;
    }
  }

  const current = useSyncExternalStore(subscribe, getSnapshot, serverLevel) ?? fallback;

  function select(level: Level) {
    if (!available.includes(level)) return;

    try {
      window.localStorage.setItem(key, level);
    } catch {
      // The URL still keeps the selection when browser storage is unavailable.
    }

    const url = new URL(window.location.href);
    url.searchParams.set("level", level.toLowerCase());
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new Event(key));
  }

  return { current, select };
}

export function LevelPicker({
  current,
  available,
  onSelect,
}: {
  current: Level;
  available: readonly Level[];
  onSelect: (level: Level) => void;
}) {
  return (
    <div role="group" aria-label="Chọn cấp độ" className="mb-5 grid grid-cols-3 gap-1 rounded-xl border border-line bg-sheet p-1 sm:grid-cols-6">
      {LEVELS.map((level) => {
        const enabled = available.includes(level);
        return (
          <button
            key={level}
            type="button"
            disabled={!enabled}
            aria-disabled={!enabled}
            aria-pressed={level === current}
            onClick={() => onSelect(level)}
            className={`flex min-h-12 min-w-11 touch-manipulation flex-col items-center justify-center rounded-lg px-1 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${level === current ? "bg-accent text-accent-ink" : enabled ? "text-ink hover:bg-line/50" : "text-ink-soft"}`}
          >
            <span translate="no">{level}</span>
            <span className="text-xs font-normal">{enabled ? LEVEL_LABELS[level] : "Sắp có"}</span>
          </button>
        );
      })}
    </div>
  );
}
