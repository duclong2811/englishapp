import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearnSet, type LearnWord } from "@/components/vocab/learn-set";
import { getVocabData, POS_VI, toPracticeWord } from "@/lib/vocab/data";

export async function generateStaticParams() {
  const { getTopics } = await getVocabData();
  return getTopics().flatMap((t) => t.sets.map((_, i) => ({ id: t.id, set: String(i + 1) })));
}

export async function generateMetadata({ params }: PageProps<"/vocabulary/topic/[id]/[set]">): Promise<Metadata> {
  const { id, set } = await params;
  const { getTopic } = await getVocabData();
  const topic = getTopic(id);
  return { title: topic ? `${topic.title}, bộ ${set}` : "Học từ" };
}

export default async function LearnSetPage({ params }: PageProps<"/vocabulary/topic/[id]/[set]">) {
  const { id, set } = await params;
  const { getStudyWord, getTopics } = await getVocabData();
  const topics = getTopics();
  const t = topics.findIndex((x) => x.id === id);
  const topic = topics[t];
  const n = Number(set);
  if (!topic || !Number.isInteger(n) || n < 1 || n > topic.sets.length) notFound();

  const words: LearnWord[] = topic.sets[n - 1].map((wid) => {
    const w = getStudyWord(wid)!;
    return {
      ...toPracticeWord(w),
      meanings: w.meanings.map((m) => ({ pos: POS_VI[m.pos] ?? m.pos, vi: m.vi })),
      note: w.note,
    };
  });
  // Distractors come from the whole topic, so answers are related words.
  const pool = topic.words.map((wid) => toPracticeWord(getStudyWord(wid)!));

  const nextTopic = topics[t + 1];
  const next =
    n < topic.sets.length
      ? { href: `/vocabulary/topic/${topic.id}/${n + 1}`, label: `Học bộ ${n + 1}` }
      : nextTopic
        ? { href: `/vocabulary/topic/${nextTopic.id}/1`, label: `Sang chủ đề: ${nextTopic.title}` }
        : null;

  return (
    <LearnSet
      key={`${topic.id}-${n}`}
      topic={{ id: topic.id, title: topic.title }}
      setNumber={n}
      setCount={topic.sets.length}
      words={words}
      pool={pool}
      next={next}
    />
  );
}
