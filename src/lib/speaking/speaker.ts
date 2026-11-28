"use client";

import { speakable } from "./speech";
import { DEFAULT_VOICE, isVoice, type VoiceChoice } from "./voices";
import { encodeWav } from "./wav";

// ---------- voice preference (per device) ----------

const VOICE_KEY = "speak:voice";
const listeners = new Set<() => void>();

export function getVoice(): VoiceChoice {
  try {
    const v = localStorage.getItem(VOICE_KEY) ?? "";
    return v === "device" || isVoice(v) ? v : DEFAULT_VOICE;
  } catch {
    return DEFAULT_VOICE;
  }
}

export function setVoice(v: VoiceChoice) {
  try {
    localStorage.setItem(VOICE_KEY, v);
  } catch {
    // private mode: keep the default
  }
  listeners.forEach((l) => l());
}

export function subscribeVoice(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export const getServerVoice = (): VoiceChoice => DEFAULT_VOICE;

// ---------- playback ----------

let deviceVoice: SpeechSynthesisVoice | undefined;

function pickDeviceVoice(): SpeechSynthesisVoice | undefined {
  if (deviceVoice) return deviceVoice;
  const voices = window.speechSynthesis.getVoices();
  const en = voices.filter((v) => v.lang.replace("_", "-").startsWith("en-US"));
  deviceVoice =
    en.find((v) => /Samantha|Google US English|Aria|Jenny|Ava/i.test(v.name)) ??
    en.find((v) => v.localService) ??
    en[0] ??
    voices.find((v) => v.lang.startsWith("en"));
  return deviceVoice;
}

function speakWithDevice(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.95;
    const voice = pickDeviceVoice();
    if (voice) u.voice = voice;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

/** After this many failures in a row (e.g. the daily allowance is used up) stop asking the server. */
const MAX_FAILURES = 2;
let failures = 0;
let player: HTMLAudioElement | null = null;

function getPlayer() {
  if (!player) {
    player = new Audio();
    player.preload = "auto";
  }
  return player;
}

/**
 * Call inside a tap. iOS only lets an audio element play after it has been
 * started by the user once; afterwards it can play new sources on its own.
 */
export function unlockPlayback() {
  const p = getPlayer();
  try {
    p.src = URL.createObjectURL(encodeWav(new Float32Array(800), 16000));
    void p.play().catch(() => undefined);
  } catch {
    // ignore
  }
  if ("speechSynthesis" in window) {
    // Same for the device voice: an empty utterance inside the tap unlocks it.
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
  }
}

export function ttsUrl(text: string, voice: string) {
  return `/api/speak/tts?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(text)}`;
}

/** Guests use the device voice: the natural voice is a members' AI feature. */
let naturalAllowed = true;
export function allowNaturalVoice(allowed: boolean) {
  naturalAllowed = allowed;
}

async function fetchAudio(text: string, voice: VoiceChoice, signal: AbortSignal): Promise<string | null> {
  if (voice === "device" || !naturalAllowed || failures >= MAX_FAILURES) return null;
  try {
    const res = await fetch(ttsUrl(text, voice), { signal });
    if (res.status === 401) naturalAllowed = false;
    if (!res.ok) throw new Error(`tts ${res.status}`);
    const blob = await res.blob();
    failures = 0;
    return URL.createObjectURL(blob);
  } catch {
    if (!signal.aborted) failures++;
    return null;
  }
}

function playUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    const p = getPlayer();
    const done = () => {
      p.onended = null;
      p.onerror = null;
      p.onpause = null;
      resolve();
    };
    p.onended = done;
    p.onerror = done;
    p.onpause = done;
    p.src = url;
    p.play().catch(done);
  });
}

/** True when the natural voice failed and the device voice is being used instead. */
export function usingFallback() {
  return failures >= MAX_FAILURES;
}

/**
 * Queues sentences and plays them in order. Audio for later sentences is
 * fetched while earlier ones play, so there is no gap between them.
 */
export function createSpeaker(onIdle: () => void) {
  let queue: { text: string; audio: Promise<string | null> }[] = [];
  let playing = false;
  let replyDone = false;
  let generation = 0;
  let controller = new AbortController();
  const urls: string[] = [];

  function settle() {
    if (replyDone && !playing && queue.length === 0) {
      replyDone = false;
      onIdle();
    }
  }

  async function pump() {
    if (playing) return;
    const item = queue.shift();
    if (!item) return settle();
    playing = true;
    const gen = generation;
    const url = await item.audio;
    if (gen !== generation) return;
    if (url) {
      urls.push(url);
      await playUrl(url);
    } else {
      await speakWithDevice(item.text);
    }
    if (gen !== generation) return;
    playing = false;
    void pump();
  }

  function stopAll() {
    generation++;
    controller.abort();
    controller = new AbortController();
    queue = [];
    playing = false;
    replyDone = false;
    player?.pause();
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    urls.splice(0).forEach((u) => URL.revokeObjectURL(u));
  }

  return {
    /** Starts a new reply; anything still playing is stopped. */
    begin: stopAll,
    speak(sentence: string) {
      const text = speakable(sentence);
      if (!text) return;
      queue.push({ text, audio: fetchAudio(text, getVoice(), controller.signal) });
      void pump();
    },
    /** No more sentences will come for this reply. */
    finish() {
      replyDone = true;
      settle();
    },
    cancel: stopAll,
  };
}

export type Speaker = ReturnType<typeof createSpeaker>;

let shared: Speaker | null = null;

/** Reads one sentence aloud right away (for "listen" buttons). Call from a tap. */
export function speakNow(text: string) {
  unlockPlayback();
  shared ??= createSpeaker(() => {});
  shared.begin();
  shared.speak(text);
  shared.finish();
}
