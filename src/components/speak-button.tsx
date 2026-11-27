"use client";

import { useSyncExternalStore } from "react";
import { speakNow } from "@/lib/speaking/speaker";

const subscribe = () => () => {};

/** Reads an English text aloud with the chosen voice (natural AI voice, or the device voice as a fallback). */
export function SpeakButton({
  text,
  label = "Nghe",
  compact = false,
}: {
  text: string;
  label?: string;
  compact?: boolean;
}) {
  const supported = useSyncExternalStore(
    subscribe,
    () => "speechSynthesis" in window || "Audio" in window,
    () => false,
  );

  function speak() {
    speakNow(text);
  }

  return (
    <button
      type="button"
      onClick={speak}
      disabled={!supported}
      aria-label={`${label}: ${text}`}
      className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-line bg-sheet font-medium text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 ${
        compact ? "min-w-11 px-0" : "px-4"
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9z" />
        <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
      </svg>
      {compact ? null : label}
    </button>
  );
}
