import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Flashcards } from "@/components/flashcards";
import { GRAMMAR_LEVELS } from "@/content/grammar/syllabus";
import { lessonCards } from "@/lib/flashcards";
import { getGrammarLesson } from "@/lib/grammar/lessons";

function units() {
  return Object.entries(GRAMMAR_LEVELS).flatMap(([level, { units }]) =>
    units.map((unit, i) => ({ level, unit, number: i + 1 })),
  );
}

export function generateStaticParams() {
  return units().map(({ unit }) => ({ unit: unit.id }));
}

export const dynamicParams = false;

function find(id: string) {
  return units().find((u) => u.unit.id === id);
}

export async function generateMetadata({ params }: PageProps<"/lessons/chapter/[unit]">): Promise<Metadata> {
  const f = find((await params).unit);
  return { title: f ? `Thẻ ghi nhớ: chương ${f.number} ${f.level}` : "Thẻ ghi nhớ" };
}

export default async function ChapterCardsPage({ params }: PageProps<"/lessons/chapter/[unit]">) {
  const f = find((await params).unit);
  if (!f) notFound();
  const lessons = await Promise.all(f.unit.lessons.map((id) => getGrammarLesson(id)));
  const cards = lessons.flatMap((lesson) => (lesson ? lessonCards(lesson) : []));
  if (!cards.length) notFound();
  const back = { href: "/lessons", label: "Về bài học" };
  return (
    <>
      <Link href={back.href} className="back-link">
        Bài học
      </Link>
      <div className="mt-4">
        <Flashcards cards={cards} title={`Ngữ pháp ${f.level}, chương ${f.number}: ${f.unit.title}`} back={back} />
      </div>
    </>
  );
}
