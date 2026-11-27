import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TestRunner } from "@/components/tests/test-runner";
import { TEST_LEVELS, toTestLevel } from "@/lib/tests/build-bank";

export function generateStaticParams() {
  return TEST_LEVELS.map((l) => ({ level: l.toLowerCase() }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/tests/[level]">): Promise<Metadata> {
  return { title: `Kiểm tra cấp độ ${toTestLevel((await params).level) ?? ""}` };
}

export default async function LevelTestPage({ params }: PageProps<"/tests/[level]">) {
  const level = toTestLevel((await params).level);
  if (!level) notFound();
  return (
    <>
      <Link href="/tests" className="back-link">
        Kiểm tra
      </Link>
      <div className="mt-4">
        <TestRunner level={level} mode={{ kind: "level" }} testKey={`level:${level}`} title={`Kiểm tra toàn bộ ${level}`} />
      </div>
    </>
  );
}
