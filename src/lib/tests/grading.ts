import { z } from "zod";

export const openAnswerBody = z.object({
  taskId: z.string().max(80),
  answer: z.string().trim().min(1).max(800),
});

export const gradeSchema = z.object({
  /** True when the answer does the task and is understandable at the level. */
  ok: z.boolean(),
  score: z.number().int().min(0).max(10),
  /** The learner's text with the smallest corrections that make it right and natural. */
  corrected: z.string(),
  mistakes: z.array(z.object({ wrong: z.string(), right: z.string(), why: z.string() })),
  /** One or two sentences in Vietnamese, encouraging and specific. */
  comment: z.string(),
});

export type Grade = z.infer<typeof gradeSchema>;
