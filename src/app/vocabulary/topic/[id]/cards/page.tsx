import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Flashcards } from "@/components/flashcards";
import { wordCard } from "@/lib/flashcards";
import { getVocabData } from "@/lib/vocab/data";

export async function generateStaticParams() {
  const { getTopics } = await getVocabData();
  return getTopics().map((t) => ({ id: t.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/vocabulary/topic/[id]/cards">): Promise<Metadata> {
  const { getTopic } = await getVocabData();
  const topic = getTopic((await params).id);
  return { title: topic ? `Thẻ từ vựng: ${topic.title}` : "Thẻ từ vựng" };
}

export default async function TopicCardsPage({ params }: PageProps<"/vocabulary/topic/[id]/cards">) {
  const { getTopic, getStudyWord } = await getVocabData();
  const topic = getTopic((await params).id);
  if (!topic) notFound();
  const cards = topic.words.map((id) => wordCard(getStudyWord(id)!));
  const back = { href: `/vocabulary/topic/${topic.id}`, label: "Về chủ đề" };
  return (
    <>
      <Link href={back.href} className="back-link">
        {topic.title}
      </Link>
      <div className="mt-4">
        <Flashcards cards={cards} title={topic.title} back={back} words />
      </div>
    </>
  );
}
