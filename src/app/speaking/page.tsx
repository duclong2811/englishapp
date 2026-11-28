import type { Metadata } from "next";
import { AiGuestNotice } from "@/components/account/ai-guest-notice";
import { PageHeading } from "@/components/empty-state";
import { SpeakingOverview } from "@/components/speaking/lesson-list";
import { getLesson } from "@/lib/speaking/lessons";
import { getVocabData } from "@/lib/vocab/data";

export const metadata: Metadata = { title: "Luyện nói" };

export default async function SpeakingPage() {
  const { getTopics } = await getVocabData();
  // Speaking lessons follow the A1 topics.
  const items = getTopics("A1").map((t) => {
    const lesson = getLesson(t.id);
    return { topic: t.id, topicTitle: t.title, title: lesson?.title ?? null, summary: lesson?.summary ?? null };
  });

  return (
    <>
      <PageHeading
        title="Luyện nói"
        intro="Mỗi chủ đề có một bài nói: đọc theo kịch bản dùng từ của chủ đề, rồi nhập vai với AI."
      />
      <AiGuestNotice className="mb-6 max-w-3xl" />
      <SpeakingOverview items={items} />
    </>
  );
}
