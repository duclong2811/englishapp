import "server-only";
import { GRAMMAR_LEVELS, type GrammarLevel } from "@/content/grammar/syllabus";
import { getSyllabus } from "@/lib/grammar/lessons";
import { getVocabData, LEVELS } from "@/lib/vocab/data";
import type { LearningCatalog } from "./summary";

/** What there is to learn at each level, for progress summaries. */
export async function getLearningCatalog(): Promise<LearningCatalog> {
  const { getTopics } = await getVocabData();
  const levels = await Promise.all(
    LEVELS.map(async (level) => {
      const topics = getTopics(level).map((t) => ({ id: t.id, title: t.title, ids: t.words }));
      const lessons =
        level in GRAMMAR_LEVELS
          ? (await getSyllabus(level as GrammarLevel)).filter((s) => s.ready).map((s) => ({ id: s.id, title: s.title }))
          : [];
      return { level, topics, lessons };
    }),
  );
  return { levels: levels.filter((l) => l.topics.length || l.lessons.length) };
}
