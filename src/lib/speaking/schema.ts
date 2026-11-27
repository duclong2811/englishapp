import { z } from "zod";

export const turn = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(600),
});

export const conversationBody = z.object({
  scenarioId: z.string().min(1).max(40),
  messages: z.array(turn).min(1).max(40),
});

export type Turn = z.infer<typeof turn>;

export const feedbackSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  corrections: z.array(z.object({ said: z.string(), better: z.string(), why: z.string() })),
  better_phrases: z.array(z.object({ en: z.string(), vi: z.string() })),
  score: z.number().int().min(1).max(5),
});

export type Feedback = z.infer<typeof feedbackSchema>;
