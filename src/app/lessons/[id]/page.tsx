import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonView } from "@/components/grammar/lesson-view";
import { getGrammarLesson, getGrammarLessons, getSyllabus, neighbours } from "@/lib/grammar/lessons";

export async function generateStaticParams() {
  return (await getGrammarLessons()).map((l) => ({ id: l.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/lessons/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: (await getGrammarLesson(id))?.title ?? "Bài học" };
}

export default async function GrammarLessonPage({ params }: PageProps<"/lessons/[id]">) {
  const { id } = await params;
  const lesson = await getGrammarLesson(id);
  if (!lesson) notFound();
  const number = (await getSyllabus(lesson.level)).find((s) => s.id === id)?.number;
  const { next } = await neighbours(id);

  return (
    <>
      <Link href="/lessons" className="back-link">
        Bài học
      </Link>
      <LessonView lesson={lesson} kicker={`Ngữ pháp ${lesson.level} · Bài ${number}`} next={next ? { id: next.id, title: next.title } : null} />
    </>
  );
}
