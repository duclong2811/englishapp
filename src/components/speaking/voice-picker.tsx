"use client";

import { useSyncExternalStore } from "react";
import { getServerVoice, getVoice, setVoice, subscribeVoice } from "@/lib/speaking/speaker";
import { VOICES, type VoiceChoice } from "@/lib/speaking/voices";

export function VoicePicker() {
  const voice = useSyncExternalStore(subscribeVoice, getVoice, getServerVoice);
  return (
    <label className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-soft">
      Giọng đọc
      <select
        value={voice}
        onChange={(e) => setVoice(e.target.value as VoiceChoice)}
        className="min-h-11 rounded-full border border-line bg-sheet px-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {VOICES.map((v) => (
          <option key={v.id} value={v.id}>
            {v.label}
          </option>
        ))}
        <option value="device">Giọng của máy (miễn phí)</option>
      </select>
    </label>
  );
}
