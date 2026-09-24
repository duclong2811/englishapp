import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { a2Lessons, a2Units } from "./a2-course";
import { unitNumberFromId, unitPath } from "@/lib/curriculum/unit-label";

const appRoot = path.join(process.cwd(), "src", "app");
const read = (relative: string) => fs.readFileSync(path.join(appRoot, relative), "utf8");

describe("Route A1 và A2 Unit 1–6", () => {
  it("A1 giữ nguyên route bài học", () => {
    expect(fs.existsSync(path.join(appRoot, "lesson", "[id]", "page.tsx"))).toBe(true);
    expect(read(path.join("lesson", "[id]", "page.tsx"))).toContain("/content/a1-bilingual");
  });

  it("mỗi unit A2 có trang route riêng", () => {
    for (let number = 1; number <= a2Units.length; number += 1) {
      const file = path.join("curriculum", "a2", `unit-${number}`, "page.tsx");
      expect(fs.existsSync(path.join(appRoot, file)), file).toBe(true);
      expect(read(file)).toContain("A2UnitPage");
    }
    expect(fs.existsSync(path.join(appRoot, "curriculum", "a2", "unit-7", "page.tsx"))).toBe(false);
  });

  it("nhãn Unit suy ra từ unitId, không hard-code Unit 1", () => {
    expect(a2Units.map((unit) => unitNumberFromId(unit.id))).toEqual([1, 2, 3, 4, 5, 6]);
    expect(unitPath("a2-5-health-advice")).toBe("/curriculum/a2/unit-5");
    expect(unitPath("a2-6-work-study")).toBe("/curriculum/a2/unit-6");
    const player = fs.readFileSync(path.join(process.cwd(), "src", "components", "BilingualLessonPlayer.tsx"), "utf8");
    expect(player).not.toContain('href="/curriculum/a2/unit-1"');
    expect(player).toContain("unitPath(lesson.unitId)");
  });

  it("mọi bài A2 đều nằm trong route bài học động và ID dùng được trên URL", () => {
    expect(read(path.join("a2", "lesson", "[id]", "page.tsx"))).toContain("a2Lessons.find");
    for (const lesson of a2Lessons) {
      expect(lesson.id).toMatch(/^a2-[a-z0-9-]+$/);
      expect(encodeURIComponent(lesson.id)).toBe(lesson.id);
    }
    expect(a2Lessons).toHaveLength(30);
  });
});
