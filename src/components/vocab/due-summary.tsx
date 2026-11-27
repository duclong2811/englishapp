"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { buildQueue, getServerSnapshot, getSnapshot, subscribe } from "@/lib/vocab/srs-store";

export function DueSummary({ ids, total }: { ids: string[]; total: number }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const queue = state ? buildQueue(state, ids, new Date()) : null;
  const learned = state ? ids.filter((id) => state.cards[id]).length : 0;
  const todo = queue ? queue.due.length + queue.fresh.length : 0;

  return (
    <section aria-labelledby="review-heading" className="oli rounded-2xl border border-line p-6 sm:p-8">
      <h2 id="review-heading" className="text-sm font-medium text-ink-soft">
        Ôn tập hôm nay
      </h2>
      <p className="mt-3 text-3xl font-semibold tabular-nums" aria-live="polite">
        {queue ? (todo > 0 ? `${todo} thẻ` : "Xong rồi") : "…"}
      </p>
      <p className="mt-2 text-ink-soft text-pretty">
        {queue
          ? todo > 0
            ? `${queue.due.length} thẻ đến hạn ôn, ${queue.fresh.length} từ mới. Đã học ${learned}/${total} từ.`
            : `Bạn đã ôn hết thẻ hôm nay. Đã học ${learned}/${total} từ.`
          : "Đang tải tiến độ…"}
      </p>
      {todo > 0 ? (
        <Link
          href="/vocabulary/review"
          className="mt-6 inline-flex min-h-12 items-center rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Bắt đầu ôn
        </Link>
      ) : null}
    </section>
  );
}
