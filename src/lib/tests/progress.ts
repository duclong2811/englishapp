"use client";

import { createScoreStore } from "@/lib/local-scores";

/** Best score (%) per test: "level:a1", "unit:<id>", "topic:<id>". */
export const testScores = createScoreStore("tests:scores:v1");

const SEEN_KEY = "tests:seen:v1";

function readSeen(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "{}") as Record<string, string[]>;
  } catch {
    return {};
  }
}

/** Question ids this learner has already met in tests of a level. */
export function getSeen(level: string): Set<string> {
  return new Set(readSeen()[level] ?? []);
}

export function addSeen(level: string, ids: string[]) {
  const all = readSeen();
  all[level] = [...new Set([...(all[level] ?? []), ...ids])];
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(all));
  } catch {
    // storage blocked: coverage just isn't kept
  }
}
