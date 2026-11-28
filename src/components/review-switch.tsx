import Link from "next/link";

/** Switch between the two halves of "Ôn tập": flashcards and tests. */
export function ReviewSwitch({ current }: { current: "flashcards" | "tests" }) {
  const items = [
    { key: "flashcards", href: "/flashcards", label: "Thẻ ghi nhớ" },
    { key: "tests", href: "/tests", label: "Kiểm tra" },
  ] as const;
  return (
    <nav aria-label="Ôn tập" className="mb-6 inline-flex gap-1 rounded-full border border-line bg-sheet p-1">
      {items.map((it) => (
        <Link
          key={it.key}
          href={it.href}
          aria-current={current === it.key ? "page" : undefined}
          className={`inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            current === it.key ? "bg-accent text-accent-ink" : "text-ink-soft hover:text-ink"
          }`}
        >
          {it.label}
        </Link>
      ))}
    </nav>
  );
}
