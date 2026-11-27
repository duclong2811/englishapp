import type { Metadata } from "next";
import { LevelList, toLevel } from "@/components/vocab/level-list";
import { LEVELS } from "@/lib/vocab/data";

export function generateStaticParams() {
  return LEVELS.map((level) => ({ level: level.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps<"/vocabulary/level/[level]">): Promise<Metadata> {
  const level = toLevel((await params).level);
  return { title: level ? `Từ vựng ${level}` : "Từ vựng" };
}

export default async function LevelPage({ params }: PageProps<"/vocabulary/level/[level]">) {
  return <LevelList levelParam={(await params).level} page={1} />;
}
