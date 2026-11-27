import type { Metadata } from "next";
import { PageHeading } from "@/components/empty-state";
import { SyllabusList } from "@/components/grammar/syllabus-list";
import { getSyllabus } from "@/lib/grammar/lessons";

export const metadata: Metadata = { title: "Bài học" };

export default function LessonsPage() {
  const syllabus = getSyllabus();
  return (
    <>
      <PageHeading
        title="Bài học"
        intro="Ngữ pháp A1 theo thứ tự: mỗi bài có hội thoại mẫu, giải thích bằng tiếng Việt, lỗi người Việt hay mắc và bài tập có chấm điểm."
      />
      <SyllabusList items={syllabus} />
    </>
  );
}
