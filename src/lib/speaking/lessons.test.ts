import { vi } from "vitest";
vi.mock("server-only", () => ({}));
import { describe, expect, it } from "vitest";
import { getTopics } from "@/lib/vocab/data";
import { lessonCoverage, MIN_COVERAGE } from "./coverage";
import { getLessons } from "./lessons";

describe("speaking lessons", () => {
  const lessons = getLessons();

  it("belong to real topics, one each", () => {
    const topicIds = new Set(getTopics().map((t) => t.id));
    const seen = new Set<string>();
    for (const l of lessons) {
      expect(topicIds.has(l.topic), l.topic).toBe(true);
      expect(seen.has(l.topic), `duplicate ${l.topic}`).toBe(false);
      seen.add(l.topic);
    }
  });

  it("alternate speakers and start with the AI", () => {
    for (const l of lessons) {
      expect(l.lines[0].who, l.topic).toBe("ai");
      l.lines.forEach((line, i) => {
        if (i > 0) expect(line.who, `${l.topic} line ${i + 1}`).not.toBe(l.lines[i - 1].who);
      });
    }
  });

  it.each(lessons.map((l) => [l.topic, l] as const))("%s covers enough of its topic words", (_, l) => {
    const c = lessonCoverage(l);
    if (process.env.COVERAGE_REPORT) {
      console.log(`${l.topic}: ${c.covered.length}/${c.covered.length + c.missing.length} missing: ${c.missing.join(" ")}`);
    }
    expect(c.ratio, `missing: ${c.missing.join(", ")}`).toBeGreaterThanOrEqual(MIN_COVERAGE);
  });
});
