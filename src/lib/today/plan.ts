// The "Hôm nay" page: what to study today, from the learner's goal, daily
// time and progress. Pure functions so they can be tested.

import type { LearningCatalog } from "@/lib/account/summary";

export type Goal = "level" | "talk" | "exam";
type Card = { due?: string; last_review?: string };
type Score = { best: number; at: string };

export type TodayState = {
  cards: Record<string, Card>;
  newByDay: Record<string, number>;
  grammar: Record<string, Score>;
  tests: Record<string, Score>;
  speak: Record<string, Score>;
};

export type PlanItem = {
  id: string;
  kind: "review" | "grammar" | "words" | "speak" | "redo" | "test";
  label: string;
  title: string;
  minutes: number;
  href: string;
  done: boolean;
};

const PASS = 80;

/** Local calendar day, YYYY-MM-DD. */
export function localDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
/** The key the vocabulary store uses for new words per day. */
const srsDay = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const dayOf = (iso: string | undefined) => (iso ? localDay(new Date(iso)) : null);

/** Days (YYYY-MM-DD) with any study activity. */
export function activeDays(state: TodayState) {
  const days = new Set<string>();
  for (const c of Object.values(state.cards)) {
    const d = dayOf(c.last_review);
    if (d) days.add(d);
  }
  for (const s of [...Object.values(state.grammar), ...Object.values(state.tests), ...Object.values(state.speak)]) {
    const d = dayOf(s.at);
    if (d) days.add(d);
  }
  return days;
}

/** Monday-to-Sunday of the current week, with whether each day had study. */
export function week(state: TodayState, now: Date) {
  const days = activeDays(state);
  const monday = new Date(now);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const today = localDay(now);
  return ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = localDay(d);
    return { label, day: d.getDate(), studied: days.has(key), today: key === today, future: key > today };
  });
}

/** Rough minutes studied today, from what was done today. */
export function minutesToday(state: TodayState, now: Date) {
  const today = localDay(now);
  const reviews = Object.values(state.cards).filter((c) => dayOf(c.last_review) === today).length;
  const count = (rec: Record<string, Score>) => Object.values(rec).filter((s) => dayOf(s.at) === today).length;
  return Math.round(reviews * 0.4 + count(state.grammar) * 10 + count(state.tests) * 10 + count(state.speak) * 8);
}

export function buildPlan(
  catalog: LearningCatalog,
  state: TodayState,
  prefs: { level: string; goal: Goal; minutes: number },
  now: Date,
): PlanItem[] {
  const today = localDay(now);
  const lvl = catalog.levels.find((l) => l.level === prefs.level) ?? catalog.levels[0];
  const lv = lvl.level.toLowerCase();
  const items: Partial<Record<PlanItem["kind"], PlanItem>> = {};
  const passed = (id: string) => (state.grammar[id]?.best ?? 0) >= PASS;

  // Review: every due card, all levels.
  const due = Object.values(state.cards).filter((c) => c.due && new Date(c.due) <= now).length;
  const reviewedToday = Object.values(state.cards).some((c) => dayOf(c.last_review) === today);
  if (due > 0 || reviewedToday) {
    items.review = {
      id: "review",
      kind: "review",
      label: "Ôn tập",
      title: due > 0 ? `Ôn ${due} từ đến hạn` : "Đã ôn hết từ đến hạn",
      minutes: Math.min(20, Math.max(3, Math.ceil(due * 0.4))),
      href: "/vocabulary/review",
      done: due === 0,
    };
  }

  // Grammar: a lesson passed today, else the next lesson not passed.
  const doneToday = lvl.lessons.find((l) => passed(l.id) && dayOf(state.grammar[l.id]?.at) === today);
  const nextLesson = lvl.lessons.find((l) => !passed(l.id));
  const lesson = doneToday ?? nextLesson;
  if (lesson) {
    const unit = lvl.units.findIndex((u) => u.lessons.includes(lesson.id));
    items.grammar = {
      id: `grammar:${lesson.id}`,
      kind: "grammar",
      label: unit >= 0 ? `Ngữ pháp · Chương ${unit + 1}` : "Ngữ pháp",
      title: lesson.title,
      minutes: 12,
      href: `/lessons/${lesson.id}`,
      done: Boolean(doneToday),
    };
  }

  // New words: the next set with unlearned words.
  const learnedNew = (state.newByDay[srsDay(now)] ?? 0) >= 5;
  let nextSet: { topic: { id: string; title: string }; index: number } | null = null;
  for (const t of lvl.topics) {
    const i = t.sets.findIndex((set) => set.some((id) => !state.cards[id]));
    if (i >= 0) {
      nextSet = { topic: t, index: i };
      break;
    }
  }
  if (nextSet || learnedNew) {
    items.words = {
      id: "words",
      kind: "words",
      label: "Từ vựng",
      title: learnedNew ? "Đã học từ mới hôm nay" : `${nextSet!.topic.title} · bộ ${nextSet!.index + 1}`,
      minutes: 8,
      href: nextSet ? `/vocabulary/topic/${nextSet.topic.id}/${nextSet.index + 1}` : "/vocabulary",
      done: learnedNew,
    };
  }

  // Speaking: a topic lesson of this level not yet done, else free talk.
  const spokeToday = Object.values(state.speak).some((s) => dayOf(s.at) === today);
  const levelTopics = new Set(lvl.topics.map((t) => t.id));
  const speakTopic =
    (nextSet && catalog.speaking.find((s) => s.topic === nextSet!.topic.id && !state.speak[s.topic])) ??
    catalog.speaking.find((s) => levelTopics.has(s.topic) && !state.speak[s.topic]);
  items.speak = {
    id: "speak",
    kind: "speak",
    label: "Luyện nói",
    title: spokeToday ? "Đã luyện nói hôm nay" : speakTopic ? `Bài nói: ${speakTopic.title}` : "Nói tự do 5 phút với AI",
    minutes: 8,
    href: speakTopic ? `/speaking/${speakTopic.topic}` : "/speaking/free",
    done: spokeToday,
  };

  // Redo the weakest lesson below the pass mark.
  const weak = lvl.lessons
    .filter((l) => state.grammar[l.id] && !passed(l.id) && l.id !== nextLesson?.id)
    .sort((a, b) => state.grammar[a.id].best - state.grammar[b.id].best)[0];
  if (weak) {
    items.redo = {
      id: `redo:${weak.id}`,
      kind: "redo",
      label: `Làm lại · ${state.grammar[weak.id].best}%`,
      title: weak.title,
      minutes: 6,
      href: `/lessons/${weak.id}`,
      done: false,
    };
  }

  // Level test once most lessons are passed (or for exam goals, a skills test).
  const passedCount = lvl.lessons.filter((l) => passed(l.id)).length;
  const levelTest = state.tests[`level:${lvl.level}`];
  if (lvl.lessons.length && passedCount >= lvl.lessons.length * 0.8 && (levelTest?.best ?? 0) < PASS) {
    items.test = {
      id: "test:level",
      kind: "test",
      label: "Kiểm tra lên cấp",
      title: `Kiểm tra toàn bộ ${lvl.level}`,
      minutes: 25,
      href: `/tests/${lv}`,
      done: dayOf(levelTest?.at) === today,
    };
  } else if (prefs.goal === "exam" && lvl.lessons.length) {
    const skills = state.tests[`skills:${lvl.level}`];
    items.test = {
      id: "test:skills",
      kind: "test",
      label: "Kiểm tra",
      title: `Viết và nói ${lvl.level}`,
      minutes: 15,
      href: `/tests/${lv}/skills`,
      done: dayOf(skills?.at) === today,
    };
  }

  const order: PlanItem["kind"][] =
    prefs.goal === "talk"
      ? ["review", "speak", "words", "grammar", "redo", "test"]
      : prefs.goal === "exam"
        ? ["review", "grammar", "test", "redo", "words", "speak"]
        : ["review", "grammar", "words", "redo", "speak", "test"];

  const plan: PlanItem[] = [];
  let total = 0;
  for (const kind of order) {
    const item = items[kind];
    if (!item) continue;
    if (plan.length >= 3 && total >= prefs.minutes) break;
    plan.push(item);
    total += item.minutes;
  }
  return plan;
}

/** Progress through one level: chapters and an overall percentage. */
export function roadmap(catalog: LearningCatalog, state: TodayState, level: string) {
  const lvl = catalog.levels.find((l) => l.level === level) ?? catalog.levels[0];
  const words = lvl.topics.flatMap((t) => t.sets.flat());
  const learned = words.filter((id) => state.cards[id]).length;
  const passed = lvl.lessons.filter((l) => (state.grammar[l.id]?.best ?? 0) >= PASS).length;
  const ready = new Set(lvl.lessons.map((l) => l.id));
  const units = lvl.units.map((u) => {
    const lessons = u.lessons.filter((id) => ready.has(id));
    return { id: u.id, title: u.title, total: lessons.length, passed: lessons.filter((id) => (state.grammar[id]?.best ?? 0) >= PASS).length };
  });
  const parts = [words.length ? learned / words.length : null, lvl.lessons.length ? passed / lvl.lessons.length : null].filter(
    (x): x is number => x !== null,
  );
  const percent = parts.length ? Math.floor((parts.reduce((a, b) => a + b, 0) / parts.length) * 100) : 0;
  return {
    level: lvl.level,
    percent,
    words: { learned, total: words.length },
    lessons: { passed, total: lvl.lessons.length },
    units,
    current: units.find((u) => u.passed < u.total)?.id ?? null,
    levelTest: state.tests[`level:${lvl.level}`]?.best ?? null,
  };
}
