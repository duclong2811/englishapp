import type { Metadata } from "next";
import { LevelList, pageCount, toLevel } from "@/components/vocab/level-list";
import { getVocabData, LEVELS } from "@/lib/vocab/data";

export async function generateStaticParams() {
  const { getWordsByLevel } = await getVocabData();
  return LEVELS.flatMap((level) =>
    Array.from({ length: pageCount(getWordsByLevel(level).length) - 1 }, (_, i) => ({ level: level.toLowerCase(), page: String(i + 2) })),
  );
}

export async function generateMetadata({ params }: PageProps<"/vocabulary/level/[level]/[page]">): Promise<Metadata> {
  const { level, page } = await params;
  const l = toLevel(level);
  return { title: l ? `Từ vựng ${l}, trang ${page}` : "Từ vựng" };
}

export default async function LevelPageN({ params }: PageProps<"/vocabulary/level/[level]/[page]">) {
  const { level, page } = await params;
  return <LevelList levelParam={level} page={Number(page)} />;
}
