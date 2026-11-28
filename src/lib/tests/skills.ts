import type { Exercise } from "@/lib/grammar/schema";

/** Read a sentence aloud; checked word by word against speech recognition. */
export type SpeakExercise = { type: "speak"; text: string; vi: string; explain?: string };

/** Write or say something of your own; graded by AI. */
export type OpenExercise = {
  type: "open";
  mode: "write" | "speak";
  taskId: string;
  task: string;
  hint: string;
  minWords: number;
};

export type TestExercise = Exercise | SpeakExercise | OpenExercise;

export function isSkill(ex: TestExercise): ex is SpeakExercise | OpenExercise {
  return ex.type === "speak" || ex.type === "open";
}
