import type { Metadata } from "next";
import { PageHeading } from "@/components/empty-state";
import { FlashcardsOverview } from "@/components/flashcards-overview";
import { ReviewSwitch } from "@/components/review-switch";
import { GRAMMAR_LEVELS, type GrammarLevel } from "@/content/grammar/syllabus";
import { getSyllabus } from "@/lib/grammar/lessons";
import { getVocabData, LEVELS } from "@/lib/vocab/data";

export const metadata: Metadata = { title: "Thẻ ghi nhớ" };

export default async function FlashcardsPage() {
  const { getTopics } = await getVocabData();
  // Every level with grammar lessons or vocabulary topics (C1 has vocabulary only).
  const all = await Promise.all(
    LEVELS.map(async (level) => {
      const grammar = level in GRAMMAR_LEVELS ? (level as GrammarLevel) : null;
      const ready = new Map((grammar ? await getSyllabus(grammar) : []).map((s) => [s.id, s]));
      return {
        level,
        units: (grammar ? GRAMMAR_LEVELS[grammar].units : [])
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
  const levels = all.filter((l) => l.units.length || l.topics.length);
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
