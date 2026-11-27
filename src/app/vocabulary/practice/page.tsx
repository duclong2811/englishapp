import type { Metadata } from "next";
import { Practice, type PracticeWord } from "@/components/vocab/practice";
import { getVocabData } from "@/lib/vocab/data";

export const metadata: Metadata = { title: "Luyện tập từ vựng" };

export default async function PracticePage() {
  const { getStudyWords } = await getVocabData();
  const words: PracticeWord[] = getStudyWords().map((w) => ({
    id: w.id,
    headword: w.headword,
    ipa: w.ipa,
    meaning: w.meanings[0].vi,
    pos: w.meanings.map((m) => m.pos),
    forms: w.forms,
    examples: w.examples.map(({ en, vi }) => ({ en, vi })),
  }));
  return <Practice words={words} />;
}
