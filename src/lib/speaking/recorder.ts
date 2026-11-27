"use client";

import { downsample, encodeWav, rms } from "./wav";

const TARGET_RATE = 16000;
const MAX_SECONDS = 60;

let shared: AudioContext | null = null;

/**
 * Creates (or wakes) the audio context. Call it inside a tap: iOS only lets
 * audio start from a user gesture, and later recordings reuse this context.
 */
export function unlockAudio(): AudioContext {
  if (!shared || shared.state === "closed") {
    const Ctx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    shared = new Ctx();
  }
  void shared.resume();
  return shared;
}

export type RecorderOptions = {
  /** Called with 0..1 loudness about 20 times a second, for a level meter. */
  onLevel?: (level: number) => void;
  /** Called once the speaker has talked and then been quiet for `silenceMs`. */
  onSilence?: () => void;
  silenceMs?: number;
};

/**
 * Microphone capture to 16 kHz mono WAV, which speech-to-text accepts on every
 * browser (iOS Safari's MediaRecorder formats are not reliable for this).
 */
export async function startRecording(opts: RecorderOptions = {}) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  });
  const ctx = unlockAudio();
  await ctx.resume();
  const source = ctx.createMediaStreamSource(stream);
  // ScriptProcessor is deprecated but works everywhere, including iOS Safari.
  const processor = ctx.createScriptProcessor(4096, 1, 1);
  const chunks: Float32Array[] = [];
  let total = 0;
  let spoke = false;
  let quietSince = 0;
  let noiseFloor = 0.01;
  const silenceMs = opts.silenceMs ?? 1200;
  const started = performance.now();

  processor.onaudioprocess = (e) => {
    const data = new Float32Array(e.inputBuffer.getChannelData(0));
    chunks.push(data);
    total += data.length;
    const level = rms(data);
    opts.onLevel?.(Math.min(1, level * 8));
    const now = performance.now();
    // Learn the room's background level during the first half second.
    if (now - started < 500) noiseFloor = Math.max(noiseFloor, level * 1.5);
    const speaking = level > Math.max(0.015, noiseFloor * 2);
    if (speaking) {
      spoke = true;
      quietSince = 0;
    } else if (spoke) {
      if (!quietSince) quietSince = now;
      else if (now - quietSince > silenceMs) opts.onSilence?.();
    }
    if (total / ctx.sampleRate > MAX_SECONDS) opts.onSilence?.();
  };
  source.connect(processor);
  processor.connect(ctx.destination);

  let stopped = false;
  async function stop(): Promise<{ wav: Blob; seconds: number; spoke: boolean }> {
    if (stopped) throw new Error("already stopped");
    stopped = true;
    processor.disconnect();
    source.disconnect();
    stream.getTracks().forEach((t) => t.stop());
    const rate = ctx.sampleRate;
    const all = new Float32Array(total);
    let offset = 0;
    for (const c of chunks) {
      all.set(c, offset);
      offset += c.length;
    }
    const samples = downsample(all, rate, TARGET_RATE);
    return { wav: encodeWav(samples, TARGET_RATE), seconds: samples.length / TARGET_RATE, spoke };
  }

  function cancel() {
    if (stopped) return;
    stopped = true;
    processor.disconnect();
    source.disconnect();
    stream.getTracks().forEach((t) => t.stop());
  }

  return { stop, cancel };
}
