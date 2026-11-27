import type { ReactNode } from "react";

/** Removes the [[…]] focus marks, for audio and plain display. */
export function plain(text: string) {
  return text.replace(/\[\[|\]\]/g, "");
}

/** English sentence with the grammar point ([[…]]) highlighted. */
export function Marked({ text }: { text: string }) {
  const parts = text.split(/(\[\[.*?\]\])/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("[[") ? (
          <mark key={i} className="word">
            {p.slice(2, -2)}
          </mark>
        ) : (
          p
        ),
      )}
    </>
  );
}

/** Vietnamese explanation: *English example* in the English face, **emphasis** in bold. */
export function Explain({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(Boolean);
  const out: ReactNode[] = parts.map((p, i) => {
    if (p.startsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("*"))
      return (
        <span key={i} className="en text-[1.06em]" lang="en">
          {p.slice(1, -1)}
        </span>
      );
    return p;
  });
  return <>{out}</>;
}
