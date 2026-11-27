import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Illustration } from "@/components/illustration";
import { TopicSets } from "@/components/vocab/topic-sets";
import { getVocabData } from "@/lib/vocab/data";

export async function generateStaticParams() {
  const { getTopics } = await getVocabData();
  return getTopics().map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/vocabulary/topic/[id]">): Promise<Metadata> {
  const { getTopic } = await getVocabData();
  const topic = getTopic((await params).id);
  return { title: topic ? topic.title : "Chủ đề" };
}

export default async function TopicPage({ params }: PageProps<"/vocabulary/topic/[id]">) {
  const { getStudyWord, getTopic } = await getVocabData();
  const topic = getTopic((await params).id);
  if (!topic) notFound();
  const sets = topic.sets.map((ids) =>
    ids.map((id) => {
      const w = getStudyWord(id)!;
      return { id, headword: w.headword, meaning: w.meanings[0].vi };
    }),
  );

  return (
    <div className="max-w-[42rem]">
      <Link href="/vocabulary" className="back-link">
        ← Từ vựng
      </Link>
      <header className="mb-8 mt-2">
        <div className="flex items-start gap-3 sm:gap-4">
          <Illustration id={topic.id} size={64} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-soft">Chủ đề {topic.level}, {topic.words.length} từ</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{topic.title}</h1>
          </div>
        </div>
        <p className="mt-3 text-lg text-ink-soft text-pretty">{topic.description}</p>
      </header>
      <TopicSets topicId={topic.id} sets={sets} />
    </div>
  );
}
