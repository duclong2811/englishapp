import type { ReactNode } from "react";

export function PageHeading({ title, intro }: { title: string; intro: string }) {
  return (
    <header className="mb-8 max-w-[42rem]">
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-lg text-ink-soft text-pretty">{intro}</p>
    </header>
  );
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="max-w-[42rem] rounded-2xl border border-dashed border-line bg-sheet p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-2 text-ink-soft text-pretty">{children}</div>
    </section>
  );
}
