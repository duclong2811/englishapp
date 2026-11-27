import { z } from "zod";

/**
 * Text conventions inside lesson content:
 * - In English sentences, [[…]] marks the grammar point (highlighted).
 * - In Vietnamese explanations, *…* is an English example (shown in the
 *   English typeface) and **…** is emphasis.
 */
const line = z.object({ who: z.enum(["A", "B"]), en: z.string().min(1), vi: z.string().min(1) });
const example = z.object({
  en: z.string().min(1),
  vi: z.string().min(1),
  /** Why this form is used here (Vietnamese). */
  why: z.string().optional(),
});

const section = z.object({
  /** Step this section belongs to in the lesson stepper; consecutive sections with the same part form one step. */
  part: z.string().optional(),
  heading: z.string().min(1),
  /** The one-sentence rule of this screen, shown in a highlighted box and collected in the summary. */
  rule: z.string().optional(),
  /** Pattern lines, e.g. "He / She / It + V-s/es", drawn as tokens. */
  formula: z.array(z.object({ label: z.string().optional(), text: z.string() })).default([]),
  /** Signal words shown as chips. */
  signals: z.array(z.string()).default([]),
  body: z.array(z.string().min(1)).default([]),
  table: z.object({ head: z.array(z.string()), rows: z.array(z.array(z.string())) }).optional(),
  examples: z.array(example).default([]),
  /** A quick question at the end of the screen ("Thử ngay"). */
  check: z
    .object({ prompt: z.string(), options: z.array(z.string()).min(2).max(4), answer: z.number().int().min(0), explain: z.string() })
    .optional(),
});

const mistake = z.object({ wrong: z.string(), right: z.string(), why: z.string() });

const explain = z.string().min(1);

const exercise = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("choice"),
    /**
     * English with ___ for the gap (the learner types the answer, the options
     * are shown as hints), or a Vietnamese question (the learner picks one).
     */
    prompt: z.string(),
    options: z.array(z.string()).min(2).max(4),
    answer: z.number().int().min(0),
    explain,
  }),
  z.object({
    type: z.literal("fill"),
    prompt: z.string().includes("___"),
    hint: z.string().optional(),
    answers: z.array(z.string()).min(1),
    explain,
  }),
  z.object({
    type: z.literal("order"),
    vi: z.string(),
    /** The sentence in the right order, one word per item; the app shuffles them. */
    words: z.array(z.string()).min(3),
    /** Other orders that are also right. */
    alternatives: z.array(z.string()).default([]),
    explain: explain.optional(),
  }),
  z.object({
    type: z.literal("fix"),
    sentence: z.string(),
    answers: z.array(z.string()).min(1),
    explain,
  }),
  z.object({
    type: z.literal("translate"),
    vi: z.string(),
    answers: z.array(z.string()).min(1),
    explain: explain.optional(),
  }),
]);

export const grammarLessonSchema = z.object({
  id: z.string(),
  level: z.enum(["A1", "A2"]),
  title: z.string(),
  summary: z.string(),
  dialogue: z.array(line).min(4),
  sections: z.array(section).min(1),
  mistakes: z.array(mistake).min(3),
  exercises: z.array(exercise).min(10),
});

export type GrammarLesson = z.infer<typeof grammarLessonSchema>;
export type Exercise = z.infer<typeof exercise>;
