import type { Metadata } from "next";
import { PageHeading } from "@/components/empty-state";
import { SyllabusList } from "@/components/grammar/syllabus-list";
import { GRAMMAR_LEVELS } from "@/content/grammar/syllabus";
import { getGrammarLessons, getSyllabus, GRAMMAR_LEVEL_IDS } from "@/lib/grammar/lessons";

export const metadata: Metadata = { title: "Bài học" };

export default async function LessonsPage() {
  const summaries = new Map((await getGrammarLessons()).map(({ id, summary }) => [id, summary]));
  const syllabi = await Promise.all(GRAMMAR_LEVEL_IDS.map((level) => getSyllabus(level)));
  const levels = GRAMMAR_LEVEL_IDS.map((level, li) => {
    const items = new Map(syllabi[li].map((lesson) => [lesson.id, { ...lesson, summary: summaries.get(lesson.id) }]));
    return {
      level,
      units: GRAMMAR_LEVELS[level].units.map(({ id, title, lessons }) => ({
        id,
        title,
        items: lessons.map((lesson) => items.get(lesson)!),
      })),
    };
  }).filter(({ units }) => units.some((u) => u.items.some((i) => i.ready)));

  return (
    <>
      <PageHeading
        title="Bài học"
        intro="Học ngữ pháp qua hội thoại mẫu, giải thích bằng tiếng Việt và bài tập có chấm điểm."
      />
      <SyllabusList levels={levels} />
    </>
  );
}
