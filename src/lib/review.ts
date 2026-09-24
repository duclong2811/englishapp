import { createEmptyCard, fsrs, generatorParameters, Rating, State, type Card, type Grade } from "ts-fsrs";
import type { SkillScores } from "./exercise";

export type ReviewSeed = { id: string; objectiveId: string; skill: keyof SkillScores; due: string; card: Card };

export function generateReviewCards(lessonId: string, scores: SkillScores, now = new Date()): ReviewSeed[] {
  return (Object.entries(scores) as [keyof SkillScores, number][])
    .filter(([, score]) => score < 75)
    .map(([skill]) => ({ id: `${lessonId}-${skill}`, objectiveId: `${lessonId}:${skill}`, skill, due: now.toISOString(), card: createEmptyCard(now) }));
}

export function scheduleReview(card: Card, rating: "Again" | "Hard" | "Good" | "Easy", now = new Date()) {
  const scheduler = fsrs(generatorParameters({ enable_fuzz: false }));
  const map: Record<typeof rating, Grade> = { Again: Rating.Again, Hard: Rating.Hard, Good: Rating.Good, Easy: Rating.Easy };
  return scheduler.next(card, now, map[rating]).card;
}

export { State };
