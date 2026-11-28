import { existsSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { A1_SYLLABUS, A2_SYLLABUS, B1_SYLLABUS, B2_SYLLABUS } from "@/content/grammar/syllabus";
import { ILLUSTRATIONS } from "@/content/illustrations";
import a2 from "@/content/vocab/topics-a2.json";
import a1 from "@/content/vocab/topics.json";
import b1 from "@/content/vocab/topics-b1.json";
import b2 from "@/content/vocab/topics-b2.json";
import c1 from "@/content/vocab/topics-c1.json";

it("has a static SVG for every vocabulary topic and grammar lesson", () => {
  const topics: { id: string }[] = [...a1.topics, ...a2.topics, ...b1.topics, ...b2.topics, ...c1.topics];
  for (const { id } of [...topics, ...A1_SYLLABUS, ...A2_SYLLABUS, ...B1_SYLLABUS, ...B2_SYLLABUS]) {
    const name = ILLUSTRATIONS[id];
    expect(name, id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    expect(existsSync(join(process.cwd(), "public", "illustrations", `${name}.svg`)), id).toBe(true);
  }
});
