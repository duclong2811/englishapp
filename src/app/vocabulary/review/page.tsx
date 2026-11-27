import type { Metadata } from "next";
import { Review, type ReviewCard } from "@/components/vocab/review";
import { getStudyWords, POS_VI } from "@/lib/vocab/data";

export const metadata: Metadata = { title: "Ôn từ vựng" };

export default function ReviewPage() {
  const cards: ReviewCard[] = getStudyWords().map((w) => ({
    id: w.id,
    headword: w.headword,
    ipa: w.ipa,
    meanings: w.meanings.map((m) => ({ pos: POS_VI[m.pos] ?? m.pos, vi: m.vi })),
    note: w.note,
    example: w.examples[0],
  }));
  return <Review cards={cards} />;
}
