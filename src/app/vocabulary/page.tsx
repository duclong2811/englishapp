import type { Metadata } from "next";
import { PageHeading } from "@/components/empty-state";
import { VocabOverview } from "@/components/vocab/vocab-overview";
import { getLevelCounts, getTopics } from "@/lib/vocab/data";

export const metadata: Metadata = { title: "Từ vựng" };

export default function VocabularyPage() {
  const topics = getTopics().map(({ id, title, description, level, sets }) => ({ id, title, description, level, sets }));

  return (
    <>
      <PageHeading
        title="Từ vựng"
        intro="Học từ theo chủ đề, mỗi lần một bộ khoảng 10 từ, rồi ôn lại đúng lúc sắp quên."
      />

      <VocabOverview topics={topics} counts={getLevelCounts()} />
    </>
  );
}
