import { AiGuestNotice } from "@/components/account/ai-guest-notice";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TestRunner } from "@/components/tests/test-runner";
import { TEST_LEVELS, toTestLevel } from "@/lib/tests/build-bank";

export function generateStaticParams() {
  return TEST_LEVELS.map((l) => ({ level: l.toLowerCase() }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/tests/[level]/skills">): Promise<Metadata> {
  return { title: `Viết và nói ${toTestLevel((await params).level) ?? ""}` };
}

export default async function SkillsTestPage({ params }: PageProps<"/tests/[level]/skills">) {
  const level = toTestLevel((await params).level);
  if (!level) notFound();
  return (
    <>
      <Link href="/tests" className="back-link">
        Kiểm tra
      </Link>
      <div className="mt-4 max-w-[42rem]">
        <AiGuestNotice />
      </div>
      <div className="mt-4">
        <TestRunner level={level} mode={{ kind: "skills" }} testKey={`skills:${level}`} title={`Viết và nói ${level}`} />
      </div>
    </>
  );
}
