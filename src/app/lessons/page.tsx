import type { Metadata } from "next";
import { EmptyState, PageHeading } from "@/components/empty-state";

export const metadata: Metadata = { title: "Bài học" };

export default function LessonsPage() {
  return (
    <>
      <PageHeading
        title="Bài học"
        intro="Mỗi bài gồm một đoạn hội thoại ngắn, điểm ngữ pháp giải thích bằng tiếng Việt, lỗi người Việt hay mắc và bài tập."
      />
      <EmptyState title="Chưa có bài học">
        Bài học đang được soạn theo lộ trình A1 → B2. Khi bài đầu tiên sẵn sàng, bạn sẽ thấy nó ở đây cùng tiến độ của mình.
      </EmptyState>
    </>
  );
}
