import type { Exercise } from "./curriculum/schema";

export type Skill = "vocabulary" | "grammar" | "listening" | "writing" | "speaking" | "reading";
export type SkillScores = Record<Skill, number>;

const normalize = (value: string) => value.trim().toLowerCase().replace(/[.,!?]/g, "").replace(/\s+/g, " ");

export function scoreExercise(exercise: Exercise, response: unknown) {
  if (["written", "speaking"].includes(exercise.type)) return { scorable: false, correct: null, score: null };
  if (exercise.type === "match") {
    const expected = exercise.answer as Record<string, string>;
    const actual = response as Record<string, string>;
    const hits = Object.entries(expected).filter(([key, value]) => actual?.[key] === value).length;
    return { scorable: true, correct: hits === Object.keys(expected).length, score: hits / Object.keys(expected).length };
  }
  const expected = Array.isArray(exercise.answer) ? exercise.answer.join(" ") : String(exercise.answer ?? "");
  const actual = Array.isArray(response) ? response.join(" ") : String(response ?? "");
  const correct = normalize(expected) === normalize(actual);
  return { scorable: true, correct, score: correct ? 1 : 0 };
}

export function calculateMastery(results: Array<{ skill: Skill; score: number | null }>): SkillScores {
  const skills: Skill[] = ["vocabulary", "grammar", "listening", "writing", "speaking", "reading"];
  return Object.fromEntries(skills.map((skill) => {
    const values = results.filter((r) => r.skill === skill && r.score !== null).map((r) => r.score as number);
    return [skill, values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length * 100) : 0];
  })) as SkillScores;
}

export function weakSkills(scores: SkillScores, threshold = 75) {
  return (Object.entries(scores) as [Skill, number][]).filter(([, score]) => score < threshold).map(([skill]) => skill);
}
