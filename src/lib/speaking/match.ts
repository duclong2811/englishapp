/**
 * Compares what the learner said (from speech recognition) with the sentence
 * they were practising, word by word.
 */

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function numberWords(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : "");
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} hundred` + (n % 100 ? ` ${numberWords(n % 100)}` : "");
  return String(n);
}

const CONTRACTIONS: [RegExp, string][] = [
  [/\bcan't\b/g, "can not"],
  [/\bcannot\b/g, "can not"],
  [/\bwon't\b/g, "will not"],
  [/n't\b/g, " not"],
  [/'m\b/g, " am"],
  [/'re\b/g, " are"],
  [/'ll\b/g, " will"],
  [/'ve\b/g, " have"],
  [/'d\b/g, " would"],
  [/\b(it|that|what|where|who|how|there|here|he|she|this)'s\b/g, "$1 is"],
  [/\blet's\b/g, "let us"],
];

/** Lower-case word tokens, with contractions, numbers and common spellings evened out. */
export function normalize(text: string): string[] {
  let s = text.toLowerCase().replace(/[’‘`]/g, "'");
  s = s.replace(/\ba\.m\./g, "am").replace(/\bp\.m\./g, "pm");
  s = s.replace(/\bo'clock\b/g, "oclock");
  s = s.replace(/\$(\d+)/g, "$1 dollars");
  s = s.replace(/(\d+):(\d{2})/g, (_, h, m) => `${h} ${m === "00" ? "" : m}`);
  s = s.replace(/(\d+)(st|nd|rd|th)\b/g, "$1");
  s = s.replace(/\d+/g, (d) => numberWords(Number(d)));
  for (const [re, to] of CONTRACTIONS) s = s.replace(re, to);
  s = s.replace(/\bokay\b/g, "ok").replace(/\bmr\.?\b/g, "mister").replace(/\bmrs\.?\b/g, "missus");
  s = s.replace(/-/g, " ");
  return s
    .replace(/[^a-z' ]+/g, " ")
    .replace(/'/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

export type WordResult = { text: string; ok: boolean };
export type MatchResult = { score: number; words: WordResult[] };

/** Longest common subsequence: which expected tokens were heard, in order. */
function matchedFlags(expected: string[], heard: string[]): boolean[] {
  const n = expected.length;
  const m = heard.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = expected[i] === heard[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const flags = new Array<boolean>(n).fill(false);
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (expected[i] === heard[j]) {
      flags[i] = true;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return flags;
}

export function compareSpeech(expected: string, heard: string): MatchResult {
  const display = expected.split(/\s+/).filter(Boolean);
  const pieces = display.map((w) => normalize(w));
  const flat = pieces.flat();
  const flags = matchedFlags(flat, normalize(heard));
  let k = 0;
  const words = display.map((text, i) => {
    const n = pieces[i].length;
    const ok = n === 0 || flags.slice(k, k + n).every(Boolean);
    k += n;
    return { text, ok };
  });
  const score = flat.length ? flags.filter(Boolean).length / flat.length : 1;
  return { score, words };
}

/** Score at which a line counts as said well enough to move on. */
export const PASS_SCORE = 0.7;
