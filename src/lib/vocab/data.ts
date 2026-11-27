import "server-only";
import { z } from "zod";
import wordsJson from "@/content/vocab/words.json";
import { viFiles } from "@/content/vocab/vi";
import topicsJson from "@/content/vocab/topics.json";
import topicsA2Json from "@/content/vocab/topics-a2.json";

export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Level = (typeof LEVELS)[number];

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

let cache: { words: BaseWord[]; byId: Map<string, BaseWord>; study: StudyWord[] } | null = null;

function load() {
  if (cache) return cache;
  const words = z.array(baseWord).parse(wordsJson);
  const byId = new Map(words.map((w) => [w.id, w]));
  const study: StudyWord[] = [];
  for (const file of viFiles) {
    const parsed = viFile.parse(file);
    for (const entry of parsed.entries) {
      const base = byId.get(entry.id);
      if (!base) throw new Error(`Vietnamese entry "${entry.id}" has no matching word in words.json`);
      study.push({
        ...base,
        ipa: entry.ipa ?? base.ipa,
        forms: entry.forms ?? base.forms,
        meanings: entry.meanings,
        note: entry.note,
        examples: entry.examples,
        status: parsed.status,
      });
    }
  }
  cache = { words, byId, study };
  return cache;
}

export function getStudyWords(): StudyWord[] {
  return load().study;
}

export function getStudyWord(id: string): StudyWord | undefined {
  return load().study.find((w) => w.id === id);
}

export function getWordsByLevel(level: Level): BaseWord[] {
  return load().words.filter((w) => w.level === level);
}

export function getLevelCounts(): Record<Level, { total: number; withMeaning: number }> {
  const { words, study } = load();
  const studyIds = new Set(study.map((w) => w.id));
  const counts = Object.fromEntries(LEVELS.map((l) => [l, { total: 0, withMeaning: 0 }])) as Record<
    Level,
    { total: number; withMeaning: number }
  >;
  for (const w of words) {
    counts[w.level].total++;
    if (studyIds.has(w.id)) counts[w.level].withMeaning++;
  }
  return counts;
}

export function getMeaningMap(): Map<string, string> {
  return new Map(load().study.map((w) => [w.id, w.meanings.map((m) => m.vi).join("; ")]));
}

// ---------------------------------------------------------------- topics

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

let topicCache: Topic[] | null = null;

/** Topic files per level; topic ids are unique across levels. */
const TOPIC_FILES: [Level, unknown][] = [
  ["A1", topicsJson],
  ["A2", topicsA2Json],
];

/** All topics in study order, or only those of one level. */
export function getTopics(level?: Level): Topic[] {
  if (!topicCache) {
    const studyIds = new Set(getStudyWords().map((w) => w.id));
    const seen = new Set<string>();
    const seenTopics = new Set<string>();
    topicCache = TOPIC_FILES.flatMap(([lvl, json]) =>
      topicsFile.parse(json).topics.map((t) => {
        if (seenTopics.has(t.id)) throw new Error(`Duplicate topic id "${t.id}"`);
        seenTopics.add(t.id);
        for (const id of t.words) {
          if (!studyIds.has(id)) throw new Error(`Topic "${t.id}" lists unknown word "${id}"`);
          if (seen.has(id)) throw new Error(`Word "${id}" is in more than one topic`);
          seen.add(id);
        }
        return { ...t, level: lvl, sets: splitIntoSets(t.words) };
      }),
    );
  }
  return level ? topicCache.filter((t) => t.level === level) : topicCache;
}

export function getTopic(id: string): Topic | undefined {
  return getTopics().find((t) => t.id === id);
}

/** Compact outline for client components: topic id, title and set word ids. */
export type TopicOutline = { id: string; title: string; sets: string[][] };

export function getTopicOutline(level?: Level): TopicOutline[] {
  return getTopics(level).map(({ id, title, sets }) => ({ id, title, sets }));
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
