import "server-only";
import { GRAMMAR_LEVELS, type GrammarLevel } from "@/content/grammar/syllabus";
import { getSyllabus } from "@/lib/grammar/lessons";
import { getLessons } from "@/lib/speaking/lessons";
import { getVocabData, LEVELS } from "@/lib/vocab/data";
import type { LearningCatalog } from "./summary";

/** What there is to learn at each level, for progress summaries and the daily plan. */
export async function getLearningCatalog(): Promise<LearningCatalog> {
  const vocab = await getVocabData();
  const levels = await Promise.all(
    LEVELS.map(async (level) => {
      const topics = vocab.getTopics(level).map((t) => ({ id: t.id, title: t.title, sets: t.sets }));
      const grammar = level in GRAMMAR_LEVELS ? GRAMMAR_LEVELS[level as GrammarLevel] : null;
      const lessons = grammar
        ? (await getSyllabus(level as GrammarLevel)).filter((s) => s.ready).map((s) => ({ id: s.id, title: s.title }))
        : [];
      return { level, topics, lessons, units: grammar?.units ?? [] };
    }),
  );
  const speaking = getLessons().map((l) => ({ topic: l.topic, title: vocab.getTopic(l.topic)?.title ?? l.title }));
  return { levels: levels.filter((l) => l.topics.length || l.lessons.length), speaking };
}
