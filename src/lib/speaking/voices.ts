/** Natural voices offered in the app (Deepgram Aura-2, American English). */
export const VOICES = [
  { id: "thalia", label: "Thalia (nữ)" },
  { id: "apollo", label: "Apollo (nam)" },
] as const;

export type VoiceId = (typeof VOICES)[number]["id"];
/** "device" means the phone's or browser's built-in voice, which is free and works offline. */
export type VoiceChoice = VoiceId | "device";

export const DEFAULT_VOICE: VoiceId = "thalia";

export function isVoice(id: string): id is VoiceId {
  return VOICES.some((v) => v.id === id);
}
