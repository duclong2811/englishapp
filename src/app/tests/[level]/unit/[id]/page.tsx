import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TestRunner } from "@/components/tests/test-runner";
import { GRAMMAR_LEVELS } from "@/content/grammar/syllabus";
import { TEST_LEVELS, toTestLevel } from "@/lib/tests/build-bank";

export function generateStaticParams() {
  return TEST_LEVELS.flatMap((l) => GRAMMAR_LEVELS[l].units.map((u) => ({ level: l.toLowerCase(), id: u.id })));
}

export const dynamicParams = false;

function find(levelParam: string, id: string) {
  const level = toTestLevel(levelParam);
  const units = level ? GRAMMAR_LEVELS[level].units : [];
  const index = units.findIndex((u) => u.id === id);
  return level && index >= 0 ? { level, unit: units[index], number: index + 1 } : null;
}

export async function generateMetadata({ params }: PageProps<"/tests/[level]/unit/[id]">): Promise<Metadata> {
  const { level, id } = await params;
  const f = find(level, id);
  return { title: f ? `Kiểm tra chương ${f.number}: ${f.unit.title}` : "Kiểm tra" };
}

export default async function UnitTestPage({ params }: PageProps<"/tests/[level]/unit/[id]">) {
  const { level: levelParam, id } = await params;
  const f = find(levelParam, id);
  if (!f) notFound();
  return (
    <>
      <Link href="/lessons" className="back-link">
        Bài học
      </Link>
      <div className="mt-4">
        <TestRunner
          level={f.level}
          mode={{ kind: "unit", id }}
          testKey={`unit:${id}`}
          title={`Ngữ pháp ${f.level}, chương ${f.number}: ${f.unit.title}`}
        />
      </div>
    </>
  );
}
