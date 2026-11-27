import { z } from "zod";
import { lessonFiles } from "@/content/speaking/lessons";
import type { Scenario } from "./scenario";

const line = z.object({
  who: z.enum(["ai", "you"]),
  en: z.string().min(1).max(300),
  vi: z.string().min(1),
});

const lessonSchema = z.object({
  topic: z.string(),
  /** Name of the situation, Vietnamese. */
  title: z.string(),
  /** One sentence on what happens, Vietnamese. */
  summary: z.string(),
  aiRole: z.string(),
  learnerRole: z.string(),
  setting: z.string(),
  /** Opening line for the free role-play with the AI (step 2). */
  roleplayOpening: z.string(),
  lines: z.array(line).min(8),
});

export type LessonLine = z.infer<typeof line>;
export type Lesson = z.infer<typeof lessonSchema>;

let cache: Lesson[] | null = null;

export function getLessons(): Lesson[] {
  cache ??= lessonFiles.map((f) => lessonSchema.parse(f));
  return cache;
}

export function getLesson(topic: string): Lesson | undefined {
  return getLessons().find((l) => l.topic === topic);
}

export function lessonScenario(lesson: Lesson): Scenario {
  const firstYou = lesson.lines.filter((l) => l.who === "you").slice(0, 2).map((l) => l.en);
  return {
    id: lesson.topic,
    mode: "roleplay",
    title: lesson.title,
    goal: lesson.summary,
    topicIds: [lesson.topic],
    aiRole: lesson.aiRole,
    learnerRole: lesson.learnerRole,
    setting: lesson.setting,
    opening: lesson.roleplayOpening,
    starters: firstYou,
  };
}

export const FREE_CHAT: Scenario = {
  id: "free",
  mode: "free",
  title: "Nói tự do",
  goal: "Nói chuyện về bất cứ điều gì bạn muốn.",
  topicIds: [],
  aiRole: "Alex, a friendly English conversation partner",
  learnerRole: "a Vietnamese adult practising English",
  setting: "a relaxed one-to-one chat",
  opening: "Hi! I'm Alex. What would you like to talk about today?",
  starters: ["Let's talk about my job.", "I want to talk about food.", "Can we talk about movies?"],
};

export function getScenario(id: string): Scenario | undefined {
  if (id === FREE_CHAT.id) return FREE_CHAT;
  const lesson = getLesson(id);
  return lesson ? lessonScenario(lesson) : undefined;
}
