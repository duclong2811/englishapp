import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonView } from "@/components/grammar/lesson-view";
import { getGrammarLesson, getGrammarLessons, getSyllabus, neighbours } from "@/lib/grammar/lessons";

export function generateStaticParams() {
  return getGrammarLessons().map((l) => ({ id: l.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/lessons/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: getGrammarLesson(id)?.title ?? "Bài học" };
}

export default async function GrammarLessonPage({ params }: PageProps<"/lessons/[id]">) {
  const { id } = await params;
  const lesson = getGrammarLesson(id);
  if (!lesson) notFound();
  const number = getSyllabus().find((s) => s.id === id)?.number;
  const { next } = neighbours(id);

  return (
    <>
      <Link href="/lessons" className="back-link">
        Bài học
      </Link>
      <LessonView lesson={lesson} kicker={`Ngữ pháp ${lesson.level} · Bài ${number}`} next={next ? { id: next.id, title: next.title } : null} />
    </>
  );
}
