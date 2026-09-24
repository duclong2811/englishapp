import { describe, expect, it } from "vitest";
import { curriculumMap } from "./curriculum-map";
import { a2Units } from "./a2-course";

/**
 * Scope-and-sequence ngữ pháp A2 phải khớp giữa bản đồ chương trình và nội dung
 * đã viết. Đây là ràng buộc để việc mở rộng sau này không bỏ sót ngữ pháp.
 */
const requiredGrammar: Record<string, string[]> = {
  "a2-1-everyday-connections": ["hiện tại hoàn thành", "quá khứ đơn", "going to", "will", "would you like"],
  "a2-2-getting-things-done": ["could", "would you mind", "mệnh lệnh", "too", "enough", "instead"],
  "a2-3-stories-past-events": ["quá khứ đơn", "quá khứ tiếp diễn", "while", "when", "câu hỏi"],
  "a2-4-travel-problems": ["going to", "tiếp diễn", "have to", "must", "gián tiếp", "quá khứ", "will", "điều kiện loại 1"],
  "a2-5-health-advice": ["have got", "too much", "enough", "must", "mệnh lệnh", "tần suất", "động danh từ", "should", "could"],
  "a2-6-work-study": ["hiện tại đơn", "have to", "need to", "can", "be able to", "nguyên mẫu", "động danh từ", "should", "hiện tại hoàn thành", "so sánh"],
};

const a2Map = curriculumMap.find((level) => level.id === "A2")!;

describe("Scope-and-sequence ngữ pháp A2", () => {
  it("mỗi Unit A2 có ngữ pháp cho từng bài, riêng bài ôn tập ghi rõ là ôn xoắn ốc", () => {
    expect(a2Map.units).toHaveLength(8);
    for (const unit of a2Map.units) {
      expect(unit.lessons, unit.id).toHaveLength(5);
      unit.lessons.forEach((lesson, index) => {
        expect(lesson.grammar.length, `${lesson.id} thiếu ngữ pháp`).toBe(1);
        if (index === 4) expect(lesson.grammar[0], `${lesson.id} bài ôn tập`).toMatch(/^Ôn xoắn ốc:/);
      });
    }
  });

  it("Unit A2 4–6 phủ đủ ngữ pháp mà đề bài yêu cầu", () => {
    for (const unitId of ["a2-4-travel-problems", "a2-5-health-advice", "a2-6-work-study"]) {
      const unit = a2Map.units.find((item) => item.id === unitId)!;
      const scope = unit.lessons.flatMap((lesson) => lesson.grammar).join(" ").toLowerCase();
      for (const keyword of requiredGrammar[unitId]) {
        expect(scope, `${unitId} thiếu “${keyword}”`).toContain(keyword.toLowerCase());
      }
    }
  });

  it("nội dung đã viết của Unit 1–6 khớp với scope đã công bố", () => {
    expect(a2Units.map((unit) => unit.id)).toEqual(a2Map.units.slice(0, 6).map((unit) => unit.id));
    for (const unit of a2Units) {
      const titles = unit.lessons.flatMap((lesson) => lesson.grammar.map((block) => `${block.titleVi} ${block.explanationVi}`)).join(" ").toLowerCase();
      for (const keyword of requiredGrammar[unit.id]) {
        expect(titles, `${unit.id} chưa dạy “${keyword}”`).toContain(keyword.toLowerCase());
      }
    }
  });

  it("Unit 7–8 chỉ có trong bản đồ, chưa có nội dung", () => {
    const plannedIds = a2Map.units.slice(6).map((unit) => unit.id);
    expect(plannedIds).toEqual(["a2-7-shopping-services", "a2-8-a2-life-mission"]);
    for (const planned of plannedIds) expect(a2Units.map((unit) => unit.id)).not.toContain(planned);
  });
});
