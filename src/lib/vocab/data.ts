import "server-only";
import { z } from "zod";
import wordsJson from "@/content/vocab/words.json";
import a1CoreJson from "@/content/vocab/vi/a1-core.json";

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
  for (const file of [a1CoreJson]) {
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
