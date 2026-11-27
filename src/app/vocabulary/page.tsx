import type { Metadata } from "next";
import { PageHeading } from "@/components/empty-state";
import { VocabOverview } from "@/components/vocab/vocab-overview";
import { getVocabData } from "@/lib/vocab/data";

export const metadata: Metadata = { title: "Từ vựng" };

export default async function VocabularyPage() {
  const { getLevelCounts, getTopics } = await getVocabData();
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
