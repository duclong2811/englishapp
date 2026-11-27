import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TestRunner } from "@/components/tests/test-runner";
import { TEST_LEVELS, toTestLevel } from "@/lib/tests/build-bank";
import { getVocabData } from "@/lib/vocab/data";

export async function generateStaticParams() {
  const { getTopics } = await getVocabData();
  return TEST_LEVELS.flatMap((l) => getTopics(l).map((t) => ({ level: l.toLowerCase(), id: t.id })));
}

export const dynamicParams = false;

async function find(levelParam: string, id: string) {
  const level = toTestLevel(levelParam);
  const { getTopic } = await getVocabData();
  const topic = getTopic(id);
  return level && topic?.level === level ? { level, topic } : null;
}

export async function generateMetadata({ params }: PageProps<"/tests/[level]/topic/[id]">): Promise<Metadata> {
  const { level, id } = await params;
  const f = await find(level, id);
  return { title: f ? `Kiểm tra: ${f.topic.title}` : "Kiểm tra" };
}

export default async function TopicTestPage({ params }: PageProps<"/tests/[level]/topic/[id]">) {
  const { level: levelParam, id } = await params;
  const f = await find(levelParam, id);
  if (!f) notFound();
  return (
    <>
      <Link href={`/vocabulary/topic/${id}`} className="back-link">
        {f.topic.title}
      </Link>
      <div className="mt-4">
        <TestRunner
          level={f.level}
          mode={{ kind: "topic", id }}
          testKey={`topic:${id}`}
          title={`Từ vựng ${f.level}: ${f.topic.title}`}
        />
      </div>
    </>
  );
}
