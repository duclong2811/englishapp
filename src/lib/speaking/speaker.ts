"use client";

import { speakable } from "./speech";

let cachedVoice: SpeechSynthesisVoice | undefined;

function pickVoice(): SpeechSynthesisVoice | undefined {
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  const en = voices.filter((v) => v.lang.replace("_", "-").startsWith("en-US"));
  cachedVoice =
    en.find((v) => /Samantha|Google US English|Aria|Jenny|Ava/i.test(v.name)) ??
    en.find((v) => v.localService) ??
    en[0] ??
    voices.find((v) => v.lang.startsWith("en"));
  return cachedVoice;
}

/**
 * Queues sentences for the browser voice and reports when everything queued
 * so far has been spoken and the reply is complete.
 */
export function createSpeaker(onIdle: () => void) {
  const synth = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
  let pending = 0;
  let replyDone = false;
  let generation = 0;

  function settle() {
    if (replyDone && pending === 0) {
      replyDone = false;
      onIdle();
    }
  }

  return {
    supported: synth !== null,
    /** Starts a new reply; anything still playing is stopped. */
    begin() {
      generation++;
      pending = 0;
      replyDone = false;
      synth?.cancel();
    },
    speak(sentence: string) {
      const text = speakable(sentence);
      if (!synth || !text) return;
      const gen = generation;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.95;
      const voice = pickVoice();
      if (voice) u.voice = voice;
      pending++;
      const done = () => {
        if (gen !== generation) return;
        pending = Math.max(0, pending - 1);
        settle();
      };
      u.onend = done;
      u.onerror = done;
      synth.speak(u);
    },
    /** No more sentences will come for this reply. */
    finish() {
      replyDone = true;
      settle();
    },
    cancel() {
      generation++;
      pending = 0;
      replyDone = false;
      synth?.cancel();
    },
  };
}

export type Speaker = ReturnType<typeof createSpeaker>;
