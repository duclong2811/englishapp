import type { Metadata } from "next";
import { PageHeading } from "@/components/empty-state";
import { TestsOverview } from "@/components/tests/tests-overview";
import { GRAMMAR_LEVELS } from "@/content/grammar/syllabus";
import { TEST_LEVELS } from "@/lib/tests/build-bank";
import { getVocabData } from "@/lib/vocab/data";

export const metadata: Metadata = { title: "Kiểm tra" };

export default async function TestsPage() {
  const { getTopics } = await getVocabData();
  const levels = TEST_LEVELS.map((level) => ({
    level,
    units: GRAMMAR_LEVELS[level].units.map(({ id, title }) => ({ id, title })),
    topics: getTopics(level).map(({ id, title }) => ({ id, title })),
  }));
  return (
    <>
      <PageHeading
        title="Kiểm tra"
        intro="Đề rút ngẫu nhiên từ kho câu hỏi của từng cấp, mỗi lần một đề mới. Làm xong biết ngay mình yếu phần nào."
      />
      <TestsOverview levels={levels} />
    </>
  );
}
