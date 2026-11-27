import { compareSpeech, normalize } from "@/lib/speaking/match";

const key = (s: string) => normalize(s).join(" ");

/** Same words in the same order; case, punctuation, contractions and digits don't matter. */
export function isRight(input: string, answers: string[]): boolean {
  const k = key(input);
  return k.length > 0 && answers.some((a) => key(a) === k);
}

/** The accepted answer closest to what the learner wrote, with the words they missed marked. */
export function closest(input: string, answers: string[]) {
  let best = { answer: answers[0], result: compareSpeech(answers[0], input) };
  for (const a of answers.slice(1)) {
    const result = compareSpeech(a, input);
    if (result.score > best.result.score) best = { answer: a, result };
  }
  return best;
}
