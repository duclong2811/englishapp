import type { Metadata } from "next";
import { PageHeading } from "@/components/empty-state";
import { SyllabusList } from "@/components/grammar/syllabus-list";
import { A1_UNITS } from "@/content/grammar/syllabus";
import { getGrammarLessons, getSyllabus } from "@/lib/grammar/lessons";

export const metadata: Metadata = { title: "Bài học" };

export default function LessonsPage() {
  const summaries = new Map(getGrammarLessons().map(({ id, summary }) => [id, summary]));
  const items = new Map(getSyllabus().map((lesson) => [lesson.id, { ...lesson, summary: summaries.get(lesson.id) }]));
  const units = A1_UNITS.map(({ id, title, lessons }) => ({
    id,
    title,
    items: lessons.map((lesson) => items.get(lesson)!),
  }));

  return (
    <>
      <PageHeading
        title="Bài học"
        intro="Học ngữ pháp qua hội thoại mẫu, giải thích bằng tiếng Việt và bài tập có chấm điểm."
      />
      <SyllabusList units={units} />
    </>
  );
}
