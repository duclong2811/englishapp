"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Reads an English text aloud with the browser's built-in voice. */
export function SpeakButton({ text, label = "Nghe" }: { text: string; label?: string }) {
  const supported = useSyncExternalStore(
    subscribe,
    () => "speechSynthesis" in window,
    () => false,
  );

  function speak() {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    synth.speak(utterance);
  }

  return (
    <button
      type="button"
      onClick={speak}
      disabled={!supported}
      aria-label={`${label}: ${text}`}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-sheet px-4 font-medium text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9z" />
        <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
      </svg>
      {label}
    </button>
  );
}
