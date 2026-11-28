import "server-only";
import { z } from "zod";
import { GRAMMAR_LEVELS, type GrammarLevel } from "@/content/grammar/syllabus";
import { getAssets, readPublicJson } from "@/lib/assets";
import { grammarLessonSchema, type GrammarLesson } from "./schema";

export const GRAMMAR_LEVEL_IDS = Object.keys(GRAMMAR_LEVELS) as GrammarLevel[];

/**
 * Lessons live in /public/data/grammar/<level>.json (written by
 * tools/grammar/emit.mjs before dev, build and test), not in the Worker bundle.
 */
async function load(assets: ReturnType<typeof getAssets>): Promise<GrammarLesson[]> {
  const levels = await Promise.all(
    GRAMMAR_LEVEL_IDS.map(async (level) =>
      z.array(grammarLessonSchema).parse(await readPublicJson(`/data/grammar/${level.toLowerCase()}.json`, assets)),
    ),
  );
  return levels.flat();
}

let built: Promise<GrammarLesson[]> | undefined;
let workerData: GrammarLesson[] | undefined;

/** Every written lesson, all levels, in syllabus order. Cached; an in-flight Workers fetch must stay inside its own request. */
export async function getGrammarLessons(): Promise<GrammarLesson[]> {
  const assets = getAssets();
  if (assets) return (workerData ??= await load(assets));
  built ??= load(undefined).catch((error: unknown) => {
    built = undefined;
    throw error;
  });
  return built;
}

export async function getGrammarLesson(id: string) {
  return (await getGrammarLessons()).find((l) => l.id === id);
}

/** The whole syllabus of one level, with the lessons that exist so far. */
export async function getSyllabus(level: GrammarLevel = "A1") {
  const ready = new Set((await getGrammarLessons()).map((l) => l.id));
  return GRAMMAR_LEVELS[level].syllabus.map((s, i) => ({ ...s, number: i + 1, ready: ready.has(s.id) }));
}

/** Previous and next written lessons in the same level, for navigation. */
export async function neighbours(id: string) {
  const level = (await getGrammarLesson(id))?.level ?? "A1";
  const written = (await getSyllabus(level)).filter((s) => s.ready);
  const i = written.findIndex((s) => s.id === id);
  return { prev: written[i - 1] ?? null, next: written[i + 1] ?? null };
}
