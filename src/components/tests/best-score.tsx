"use client";

import { useSyncExternalStore } from "react";
import { PASS_PERCENT } from "@/lib/tests/bank";
import { testScores } from "@/lib/tests/progress";

/** "Chưa làm" or the best score of a test, kept on this device. */
export function BestScore({ testKey }: { testKey: string }) {
  const scores = useSyncExternalStore(testScores.subscribe, testScores.getSnapshot, testScores.getServerSnapshot);
  const best = scores?.[testKey]?.best;
  if (best === undefined) return <span className="text-sm text-ink-soft">Chưa làm</span>;
  const passed = best >= PASS_PERCENT;
  return (
    <span className={`text-sm font-medium tabular-nums ${passed ? "text-correct" : "text-ink-soft"}`}>
      {passed ? <span aria-hidden="true">✓ </span> : null}Cao nhất {best}%
    </span>
  );
}
