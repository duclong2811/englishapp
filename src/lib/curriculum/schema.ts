import { z } from "zod";

export const exampleSchema = z.object({
  en: z.string(), ko: z.string(), vi: z.string().optional(), context: z.string(),
});
export const vocabularySchema = z.object({
  id: z.string(), headword: z.string(), partOfSpeech: z.string(), definitionKo: z.string(),
  definitionVi: z.string().optional(), ipaUs: z.string(), ipaUk: z.string(),
  audio: z.object({ us: z.string().nullable(), uk: z.string().nullable() }),
  inflections: z.array(z.string()), collocations: z.array(z.string()),
  register: z.enum(["casual", "neutral", "formal"]), topics: z.array(z.string()),
  cefr: z.string(), examples: z.array(exampleSchema), commonMistakes: z.array(z.string()),
  confusedWith: z.array(z.string()),
});
export const grammarSchema = z.object({
  id: z.string(), title: z.string(), level: z.string(), prerequisites: z.array(z.string()),
  explanationKo: z.string(), easierKo: z.string(), explanationVi: z.string().optional(),
  form: z.string(), usage: z.array(z.string()), limitations: z.array(z.string()),
  contrasts: z.array(z.string()), commonMistakes: z.array(z.string()),
  examplesByPurpose: z.record(z.string(), z.array(exampleSchema)),
});
export const exerciseSchema = z.object({
  id: z.string(), type: z.enum(["multiple-choice", "fill-blank", "arrange", "match", "dictation", "translation", "written", "speaking"]),
  prompt: z.string(), skill: z.enum(["vocabulary", "grammar", "listening", "writing", "speaking", "reading"]),
  objectiveId: z.string(), options: z.array(z.string()).optional(), answer: z.union([z.string(), z.array(z.string()), z.record(z.string(), z.string())]).optional(),
  modelAnswer: z.string().optional(), checklist: z.array(z.string()).optional(), hint: z.string().optional(),
});
export const lessonSchema = z.object({
  id: z.string(), number: z.number(), title: z.string(), titleEn: z.string(), situation: z.string(), duration: z.number(),
  objectives: z.array(z.object({ id: z.string(), text: z.string(), skills: z.array(z.string()) })),
  dialogue: z.array(z.object({ speaker: z.string(), en: z.string(), ko: z.string(), vi: z.string().optional() })),
  vocabulary: z.array(vocabularySchema).min(8).max(15), grammar: z.array(grammarSchema).min(1).max(2),
  contextExamples: z.array(exampleSchema).min(15), listeningExercises: z.array(exerciseSchema).optional(), guidedExercises: z.array(exerciseSchema),
  production: z.array(exerciseSchema).min(1), masteryTest: z.array(exerciseSchema).min(1), prerequisites: z.array(z.string()),
});
export const courseSchema = z.object({
  id: z.string(), title: z.string(), targetLanguage: z.literal("English"), explanationLanguage: z.literal("Korean"),
  levels: z.array(z.object({ id: z.string(), cefr: z.string(), title: z.string(), units: z.array(z.object({ id: z.string(), title: z.string(), description: z.string(), lessons: z.array(lessonSchema) })) })),
});
export type Course = z.infer<typeof courseSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
