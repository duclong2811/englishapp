import type { Metadata } from "next";
import { PageHeading } from "@/components/empty-state";
import { FlashcardsOverview } from "@/components/flashcards-overview";
import { ReviewSwitch } from "@/components/review-switch";
import { GRAMMAR_LEVELS } from "@/content/grammar/syllabus";
import { getSyllabus } from "@/lib/grammar/lessons";
import { TEST_LEVELS } from "@/lib/tests/build-bank";
import { getVocabData } from "@/lib/vocab/data";

export const metadata: Metadata = { title: "Thẻ ghi nhớ" };

export default async function FlashcardsPage() {
  const { getTopics } = await getVocabData();
  const levels = await Promise.all(
    TEST_LEVELS.map(async (level) => {
      const ready = new Map((await getSyllabus(level)).map((s) => [s.id, s]));
      return {
        level,
        units: GRAMMAR_LEVELS[level].units
          .map((u) => ({
            id: u.id,
            title: u.title,
            lessons: u.lessons.flatMap((id) => {
              const s = ready.get(id);
              return s?.ready ? [{ id, title: s.title, number: s.number }] : [];
            }),
          }))
          .filter((u) => u.lessons.length),
        topics: getTopics(level).map((t) => ({ id: t.id, title: t.title, count: t.words.length })),
      };
    }),
  );
  return (
    <>
      <ReviewSwitch current="flashcards" />
      <PageHeading
        title="Thẻ ghi nhớ"
        intro="Tự kiểm tra nhanh: nhìn mặt trước, nhớ lại, lật thẻ. Thẻ nào chưa nhớ sẽ quay lại đến khi bạn nhớ hết."
      />
      <FlashcardsOverview levels={levels} />
    </>
  );
}
