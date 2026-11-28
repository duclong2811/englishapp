import { AiGuestNotice } from "@/components/account/ai-guest-notice";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonView } from "@/components/speaking/lesson-view";
import { lessonVocab } from "@/lib/speaking/coverage";
import { getLesson, getLessons, lessonScenario } from "@/lib/speaking/lessons";
import { getVocabData } from "@/lib/vocab/data";

export function generateStaticParams() {
  return getLessons().map((l) => ({ id: l.topic }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/speaking/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: getLesson(id)?.title ?? "Luyện nói" };
}

export default async function LessonPage({ params }: PageProps<"/speaking/[id]">) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();
  const vocab = await getVocabData();
  const topic = vocab.getTopic(id);
  const { title, goal, opening, starters } = lessonScenario(lesson);

  return (
    <>
      <Link href="/speaking" className="back-link">
        Luyện nói
      </Link>
      <header className="mb-6 mt-3 max-w-[42rem]">
        <p className="text-sm font-medium text-ink-soft">Chủ đề: {topic?.title}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-balance">{lesson.title}</h1>
        <p className="mt-2 text-ink-soft text-pretty">{lesson.summary}</p>
        <AiGuestNotice className="mt-4" />
      </header>
      <LessonView
        topic={id}
        lines={lesson.lines}
        vocab={lessonVocab(lesson, vocab)}
        scenario={{ id, title, goal, opening, starters }}
      />
    </>
  );
}
