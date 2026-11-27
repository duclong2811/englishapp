import type { Metadata } from "next";
import { EmptyState, PageHeading } from "@/components/empty-state";

export const metadata: Metadata = { title: "Luyện nói" };

export default function SpeakingPage() {
  return (
    <>
      <PageHeading
        title="Luyện nói"
        intro="Nói chuyện với AI về những tình huống quen thuộc. AI dùng lại từ và ngữ pháp bạn đang học, rồi nhận xét cuối buổi."
      />
      <EmptyState title="Luyện nói chưa mở">
        Tính năng này sẽ có sau khi phần bài học và từ vựng sẵn sàng, để AI biết bạn đang học gì.
      </EmptyState>
    </>
  );
}
