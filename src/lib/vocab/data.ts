import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { z } from "zod";

import { LEVELS, type Level } from "@/lib/levels";

export { LEVELS, type Level };

const example = z.object({
  en: z.string().min(1),
  vi: z.string().min(1),
  source: z.enum(["tatoeba", "editor"]),
  edited: z.boolean().optional(),
});

const forms = z.record(z.string(), z.string());

const baseWord = z.object({
  id: z.string().min(1),
  headword: z.string().min(1),
  variants: z.array(z.string()),
  level: z.enum(LEVELS),
  pos: z.array(z.object({ pos: z.string(), level: z.enum(LEVELS) })),
  ipa: z.string().nullable(),
  frequencyRank: z.number().int().positive().nullable(),
  oxford3000: z.boolean(),
  forms,
  examples: z.array(example),
});

const viEntry = z.object({
  id: z.string().min(1),
  meanings: z.array(z.object({ pos: z.string(), vi: z.string().min(1) })).min(1),
  note: z.string().min(1),
  ipa: z.string().optional(),
  forms: forms.optional(),
  examples: z.array(example).min(1),
});

const viFile = z.object({
  status: z.enum(["draft", "reviewed"]),
  about: z.string(),
  entries: z.array(viEntry),
});

export type Example = z.infer<typeof example>;
export type BaseWord = z.infer<typeof baseWord>;

/** A word with a Vietnamese meaning, ready to study. */
export type StudyWord = Omit<BaseWord, "examples"> & {
  meanings: { pos: string; vi: string }[];
  note: string;
  examples: Example[];
  status: "draft" | "reviewed";
};

export const POS_VI: Record<string, string> = {
  noun: "danh từ",
  verb: "động từ",
  adjective: "tính từ",
  adverb: "trạng từ",
  preposition: "giới từ",
  pronoun: "đại từ",
  determiner: "từ hạn định",
  conjunction: "liên từ",
  interjection: "thán từ",
  number: "số từ",
  "modal auxiliary": "động từ khuyết thiếu",
  "be-verb": "động từ to be",
  "do-verb": "trợ động từ",
  "have-verb": "trợ động từ",
  "infinitive-to": "to (trước động từ nguyên mẫu)",
};

const topicsFile = z.object({
  about: z.string(),
  topics: z.array(
    z.object({
      id: z.string().regex(/^[a-z0-9-]+$/),
      title: z.string().min(1),
      description: z.string().min(1),
      words: z.array(z.string()).min(4),
    }),
  ),
});

/** About ten words per set, split as evenly as possible. */
export const SET_SIZE = 10;

export type Topic = {
  id: string;
  title: string;
  description: string;
  level: Level;
  words: string[];
  /** Word ids per learning set, in order. */
  sets: string[][];
};

export function splitIntoSets(ids: string[], size = SET_SIZE): string[][] {
  const n = Math.max(1, Math.ceil(ids.length / size));
  return Array.from({ length: n }, (_, i) =>
    ids.slice(Math.floor((i * ids.length) / n), Math.floor(((i + 1) * ids.length) / n)),
  );
}

const dataset = z.object({ words: z.array(baseWord), vi: z.array(viFile) });
const assetPath = "/data/vocab/";

function getAssets() {
  try {
    return getCloudflareContext().env.ASSETS;
  } catch {
    // The Cloudflare request context is absent during prerendering and in local Next.js.
    return undefined;
  }
}

async function loadVocabData(assets: ReturnType<typeof getAssets>) {
  async function readAsset(file: string): Promise<unknown> {
    if (assets) {
      const response = await assets.fetch(`https://vocab.internal${assetPath}${file}`);
      if (!response.ok) throw new Error(`Vocabulary asset ${file} returned HTTP ${response.status}`);
      return response.json();
    }
    return JSON.parse(await readFile(join(process.cwd(), "public", assetPath, file), "utf8"));
  }

  const [levels, topicFiles] = await Promise.all([
    Promise.all(LEVELS.map(async (level) => dataset.parse(await readAsset(`${level.toLowerCase()}.json`)))),
    readAsset("topics.json").then((json) => z.tuple([topicsFile, topicsFile, topicsFile, topicsFile, topicsFile, topicsFile]).parse(json)),
  ]);
  const words = levels.flatMap((level) => level.words);
  const byId = new Map(words.map((word) => [word.id, word]));
  const study = levels.flatMap((level) =>
    level.vi.flatMap(({ entries, status }) => entries.map((entry): StudyWord => {
      const base = byId.get(entry.id);
      if (!base) throw new Error(`Vietnamese entry "${entry.id}" has no matching word in words.json`);
      return {
        ...base,
        ipa: entry.ipa ?? base.ipa,
        forms: entry.forms ?? base.forms,
        meanings: entry.meanings,
        note: entry.note,
        examples: entry.examples,
        status,
      };
    })),
  );

  const studyById = new Map(study.map((word) => [word.id, word]));
  const counts = Object.fromEntries(LEVELS.map((level) => [level, { total: 0, withMeaning: 0 }])) as Record<
    Level,
    { total: number; withMeaning: number }
  >;
  for (const word of words) {
    counts[word.level].total++;
    if (studyById.has(word.id)) counts[word.level].withMeaning++;
  }

  const seenWords = new Set<string>();
  const seenTopics = new Set<string>();
  const topicLevels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
  const topics: Topic[] = topicFiles.flatMap((file, index) =>
    file.topics.map((topic) => {
      if (seenTopics.has(topic.id)) throw new Error(`Duplicate topic id "${topic.id}"`);
      seenTopics.add(topic.id);
      for (const id of topic.words) {
        if (!studyById.has(id)) throw new Error(`Topic "${topic.id}" lists unknown word "${id}"`);
        if (seenWords.has(id)) throw new Error(`Word "${id}" is in more than one topic`);
        seenWords.add(id);
      }
      return { ...topic, level: topicLevels[index], sets: splitIntoSets(topic.words) };
    }),
  );

  const meanings = new Map(study.map((word) => [word.id, word.meanings.map((meaning) => meaning.vi).join("; ")]));
  const topicsById = new Map(topics.map((topic) => [topic.id, topic]));
  return {
    getStudyWords: () => study,
    getStudyWord: (id: string) => studyById.get(id),
    getWordsByLevel: (level: Level) => levels[LEVELS.indexOf(level)].words,
    getLevelCounts: () => counts,
    getMeaningMap: () => meanings,
    getTopics: (level?: Level) => level ? topics.filter((topic) => topic.level === level) : topics,
    getTopic: (id: string) => topicsById.get(id),
  };
}

export type VocabData = Awaited<ReturnType<typeof loadVocabData>>;

let built: Promise<VocabData> | undefined;
let workerData: VocabData | undefined;

/** Cache parsed data. An in-flight Workers fetch must stay inside its own request. */
export async function getVocabData(): Promise<VocabData> {
  const assets = getAssets();
  if (assets) return workerData ??= await loadVocabData(assets);
  built ??= loadVocabData(undefined).catch((error: unknown) => {
    built = undefined;
    throw error;
  });
  return built;
}

/** Shape used by the quiz components (client). */
export function toPracticeWord(w: StudyWord) {
  return {
    id: w.id,
    headword: w.headword,
    ipa: w.ipa,
    meaning: w.meanings[0].vi,
    pos: w.meanings.map((m) => m.pos),
    forms: w.forms,
    examples: w.examples.map(({ en, vi }) => ({ en, vi })),
  };
}
