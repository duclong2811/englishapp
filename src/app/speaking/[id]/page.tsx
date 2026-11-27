import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Conversation } from "@/components/speaking/conversation";
import { getScenario, SCENARIOS } from "@/content/speaking/scenarios";

export function generateStaticParams() {
  return SCENARIOS.map((s) => ({ id: s.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/speaking/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: getScenario(id)?.title ?? "Luyện nói" };
}

export default async function ScenarioPage({ params }: PageProps<"/speaking/[id]">) {
  const { id } = await params;
  const scenario = getScenario(id);
  if (!scenario) notFound();
  const { title, goal, opening, starters } = scenario;

  return (
    <>
      <Link href="/speaking" className="back-link">
        Luyện nói
      </Link>
      <header className="mb-6 mt-3 max-w-[42rem]">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">{title}</h1>
        <p className="mt-2 text-ink-soft text-pretty">
          <span className="font-medium text-ink">Mục tiêu:</span> {goal}
        </p>
      </header>
      <Conversation scenario={{ id, title, goal, opening, starters }} />
    </>
  );
}
