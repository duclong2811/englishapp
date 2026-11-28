import { ILLUSTRATIONS } from "@/content/illustrations";

export function Illustration({ id, size }: { id: string; size: 28 | 40 | 48 | 56 | 64 }) {
  const name = Object.hasOwn(ILLUSTRATIONS, id) ? ILLUSTRATIONS[id] : undefined;
  if (!name) return null;

  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-paper p-0.5 dark:border-line dark:bg-sheet">
      {/* eslint-disable-next-line @next/next/no-img-element -- Serve the original static SVG without the image optimizer. */}
      <img src={`/illustrations/${name}.svg`} alt="" width={size} height={size} loading="lazy" decoding="async" />
    </span>
  );
}
