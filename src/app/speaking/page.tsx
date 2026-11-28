import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/empty-state";
import { LessonList } from "@/components/speaking/lesson-list";
import { getLesson } from "@/lib/speaking/lessons";
import { getVocabData } from "@/lib/vocab/data";

export const metadata: Metadata = { title: "Luyện nói" };

export default async function SpeakingPage() {
  const { getTopics } = await getVocabData();
  // Speaking lessons follow the A1 topics.
  const items = getTopics("A1").map((t) => {
    const lesson = getLesson(t.id);
    return { topic: t.id, topicTitle: t.title, title: lesson?.title ?? null };
  });

  return (
    <>
      <PageHeading
        title="Luyện nói"
        intro="Mỗi chủ đề từ vựng có một bài nói: luyện theo kịch bản dùng gần hết từ của chủ đề, rồi nhập vai với AI. Muốn nói gì thì vào Nói tự do."
      />
      <div className="lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)] lg:gap-10">
        <div>
          <Link
            href="/speaking/free"
            className="oli block rounded-2xl border border-line p-6 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:p-8"
          >
            <span className="text-sm font-medium text-ink-soft">Không kịch bản</span>
            <span className="mt-2 block text-3xl font-semibold tracking-tight">Nói tự do</span>
            <span className="mt-2 block text-ink-soft text-pretty">
              Trò chuyện với AI về bất cứ chủ đề nào, bằng giọng nói hoặc gõ chữ.
            </span>
            <span className="mt-5 inline-flex min-h-12 items-center rounded-full bg-accent px-6 font-semibold text-accent-ink">
              Bắt đầu nói
            </span>
          </Link>
          <LessonList items={items} />
        </div>
        <aside className="mt-10 lg:mt-0">
          <h2 className="text-lg font-semibold">Cách học</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-ink-soft text-pretty">
            <li>Học bộ từ vựng của chủ đề trước.</li>
            <li>Bước 1: đọc theo kịch bản, app chấm từng từ.</li>
            <li>Bước 2: nhập vai với AI, tự trả lời không cần kịch bản, cuối buổi có nhận xét.</li>
          </ol>
          <p className="mt-4 text-sm text-ink-soft text-pretty">Mẹo: dùng tai nghe, nói câu ngắn và rõ.</p>
        </aside>
      </div>
    </>
  );
}
