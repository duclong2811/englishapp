import { notFound } from "next/navigation";
import { a2Lessons, findA2Unit } from "@/content/a2-course";
import { BilingualLessonPlayer } from "@/components/BilingualLessonPlayer";

export default async function A2LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = a2Lessons.find((item) => item.id === id);
  if (!lesson) notFound();
  const unit = findA2Unit(lesson.unitId);
  return <BilingualLessonPlayer lesson={lesson} unitTitle={unit?.titleVi} unitTitleKo={unit?.titleKo} />;
}
