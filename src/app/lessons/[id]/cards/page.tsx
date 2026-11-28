import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Flashcards } from "@/components/flashcards";
import { lessonCards } from "@/lib/flashcards";
import { getGrammarLesson, getGrammarLessons } from "@/lib/grammar/lessons";

export async function generateStaticParams() {
  return (await getGrammarLessons()).map((l) => ({ id: l.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/lessons/[id]/cards">): Promise<Metadata> {
  const lesson = await getGrammarLesson((await params).id);
  return { title: lesson ? `Thẻ ghi nhớ: ${lesson.title}` : "Thẻ ghi nhớ" };
}

export default async function LessonCardsPage({ params }: PageProps<"/lessons/[id]/cards">) {
  const lesson = await getGrammarLesson((await params).id);
  if (!lesson) notFound();
  const back = { href: `/lessons/${lesson.id}`, label: "Về bài học" };
  return (
    <>
      <Link href={back.href} className="back-link">
        {lesson.title}
      </Link>
      <div className="mt-4">
        <Flashcards cards={lessonCards(lesson)} title={lesson.title} back={back} />
      </div>
    </>
  );
}
