import { SpeakButton } from "@/components/speak-button";
import type { Example } from "@/lib/vocab/data";

export function Ipa({ ipa }: { ipa: string | null }) {
  if (!ipa) return null;
  return (
    <span translate="no" className="text-ink-soft">
      /{ipa}/
    </span>
  );
}

export function ExampleLine({ example }: { example: Example }) {
  return (
    <li className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <p lang="en" className="en text-xl leading-snug text-pretty">
          {example.en}
        </p>
        <p className="mt-1 text-ink-soft">{example.vi}</p>
      </div>
      <SpeakButton text={example.en} label="Nghe" compact />
    </li>
  );
}

export function LevelBadge({ level }: { level: string }) {
  return (
    <span
      translate="no"
      className="inline-flex items-center rounded-md border border-line px-2 py-0.5 text-sm font-semibold tabular-nums text-ink-soft"
    >
      {level}
    </span>
  );
}
