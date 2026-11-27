import type { Metadata } from "next";
import { EmptyState, PageHeading } from "@/components/empty-state";

export const metadata: Metadata = { title: "Từ vựng" };

export default function VocabularyPage() {
  return (
    <>
      <PageHeading
        title="Từ vựng"
        intro="Từ được xếp theo cấp độ, có phát âm, câu ví dụ thật và lịch ôn tập để bạn nhớ lâu."
      />
      <EmptyState title="Chưa có thẻ từ nào">
        Kho từ vựng A1 → C1 đang được xây. Từ mới bạn gặp trong bài học và khi luyện nói cũng sẽ được thêm vào đây.
      </EmptyState>
    </>
  );
}
