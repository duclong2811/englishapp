"use client";
import { Volume2 } from "lucide-react";
import { BrowserSpeechProvider, type VoiceLocale } from "@/lib/audio/browser-speech";

const provider = new BrowserSpeechProvider();

export function PronunciationButtons({ text }: { text: string }) {
  function speak(locale: VoiceLocale) {
    provider.stop();
    provider.speak(text, { locale, rate: 0.85 });
  }
  return (
    <div className="pronunciation-pair" aria-label="Phát âm Anh–Mỹ và Anh–Anh">
      <button type="button" onClick={() => speak("en-US")} aria-label={`Nghe ${text} bằng giọng Mỹ`}>
        <Volume2 size={13} /> Mỹ
      </button>
      <button type="button" onClick={() => speak("en-GB")} aria-label={`Nghe ${text} bằng giọng Anh`}>
        <Volume2 size={13} /> Anh
      </button>
    </div>
  );
}
