import { existsSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { A1_SYLLABUS, A2_SYLLABUS } from "@/content/grammar/syllabus";
import { ILLUSTRATIONS } from "@/content/illustrations";
import a2 from "@/content/vocab/topics-a2.json";
import a1 from "@/content/vocab/topics.json";

it("has a static SVG for every A1 and A2 topic and A1, A2 grammar lesson", () => {
  for (const { id } of [...a1.topics, ...a2.topics, ...A1_SYLLABUS, ...A2_SYLLABUS]) {
    const name = ILLUSTRATIONS[id];
    expect(name, id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    expect(existsSync(join(process.cwd(), "public", "illustrations", `${name}.svg`)), id).toBe(true);
  }
});
