// How learning progress from two devices is combined. Used by the browser and
// by the server, so a sync never loses what either side learned.

/** localStorage keys that follow the learner's account. */
export const SYNC_KEYS = ["vocab:srs:v1", "grammar:a1:v1", "speak:lessons:v1", "tests:scores:v1", "tests:seen:v1", "prefs:v1"] as const;
export type SyncKey = (typeof SYNC_KEYS)[number];

export function isSyncKey(key: string): key is SyncKey {
  return (SYNC_KEYS as readonly string[]).includes(key);
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

function parse(raw: string | null | undefined): Obj {
  if (!raw) return {};
  try {
    const v = JSON.parse(raw);
    return isObj(v) ? v : {};
  } catch {
    return {};
  }
}

type Card = { last_review?: string; reps?: number };
const cardTime = (c: Card) => (c.last_review ? Date.parse(c.last_review) || 0 : 0);

/** Vocabulary: the more recently reviewed card wins; new-word counts take the larger. */
function mergeSrs(a: Obj, b: Obj) {
  const ca = isObj(a.cards) ? a.cards : {};
  const cb = isObj(b.cards) ? b.cards : {};
  const cards: Obj = { ...ca };
  for (const [id, card] of Object.entries(cb)) {
    const mine = cards[id] as Card | undefined;
    const theirs = card as Card;
    if (!mine || cardTime(theirs) > cardTime(mine) || (cardTime(theirs) === cardTime(mine) && (theirs.reps ?? 0) > (mine.reps ?? 0))) {
      cards[id] = card;
    }
  }
  const na = isObj(a.newByDay) ? a.newByDay : {};
  const nb = isObj(b.newByDay) ? b.newByDay : {};
  const newByDay: Obj = { ...na };
  for (const [day, n] of Object.entries(nb)) newByDay[day] = Math.max(Number(newByDay[day]) || 0, Number(n) || 0);
  return { cards, newByDay };
}

type Score = { best: number; at: string };

/** Best scores: keep the higher score. */
function mergeScores(a: Obj, b: Obj) {
  const out: Obj = { ...a };
  for (const [id, s] of Object.entries(b)) {
    const mine = out[id] as Score | undefined;
    const theirs = s as Score;
    if (!mine) out[id] = theirs;
    else if ((theirs.best ?? 0) > (mine.best ?? 0)) out[id] = theirs;
    else if (theirs.best === mine.best && theirs.at > mine.at) out[id] = { ...mine, at: theirs.at };
  }
  return out;
}

/** Questions already met: the union. */
function mergeSeen(a: Obj, b: Obj) {
  const out: Obj = { ...a };
  for (const [level, ids] of Object.entries(b)) {
    const mine = Array.isArray(out[level]) ? (out[level] as string[]) : [];
    out[level] = [...new Set([...mine, ...(Array.isArray(ids) ? (ids as string[]) : [])])];
  }
  return out;
}

/** Settings: the one saved last wins. */
function latest(a: Obj, b: Obj) {
  return String(b.at ?? "") > String(a.at ?? "") ? b : a;
}

/** Combines two stored values (JSON strings) of one key. */
export function mergeValues(key: SyncKey, a: string | null | undefined, b: string | null | undefined): string {
  const pa = parse(a);
  const pb = parse(b);
  const merged =
    key === "vocab:srs:v1"
      ? mergeSrs(pa, pb)
      : key === "tests:seen:v1"
        ? mergeSeen(pa, pb)
        : key === "prefs:v1"
          ? latest(pa, pb)
          : mergeScores(pa, pb);
  return JSON.stringify(merged);
}
