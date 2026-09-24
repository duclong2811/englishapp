import type { CurriculumMap } from "./map-schema";
import type { BilingualUnit } from "./bilingual-schema";

export type ValidationIssue = { code: string; path: string; message: string };

const reviewPrefix = "Ôn xoắn ốc";

/** Kiểm tra bản đồ chương trình: ID duy nhất, prerequisite hợp lệ, ngữ pháp không lặp lại. */
export function validateCurriculumMap(map: CurriculumMap) {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();
  const introduced = new Set<string>(["unit-review"]);
  const grammar = new Map<string, string>();

  for (const level of map) {
    for (const unit of level.units) {
      if (ids.has(unit.id)) issues.push({ code: "duplicate-id", path: unit.id, message: "ID bị trùng" });
      ids.add(unit.id);
      for (const lesson of unit.lessons) {
        if (ids.has(lesson.id)) issues.push({ code: "duplicate-id", path: lesson.id, message: "ID bị trùng" });
        for (const prereq of lesson.prerequisites) {
          if (!introduced.has(prereq)) issues.push({ code: "invalid-prerequisite", path: lesson.id, message: `Prerequisite chưa được giới thiệu: ${prereq}` });
        }
        for (const point of lesson.grammar) {
          const key = point.toLowerCase().replace(/^ôn xoắn ốc:\s*/, "");
          const first = grammar.get(key);
          if (first && !point.startsWith(reviewPrefix)) issues.push({ code: "reintroduced-grammar", path: lesson.id, message: `Ngữ pháp đã được giới thiệu ở ${first}` });
          else if (!first) grammar.set(key, lesson.id);
        }
        introduced.add(lesson.id);
        ids.add(lesson.id);
      }
    }
  }
  return issues;
}

/**
 * Kiểm tra một unit A2 song ngữ.
 *
 * `externalLessonIds` dùng cho prerequisite nằm ngoài unit (ví dụ bài trước của
 * unit trước). Nếu không truyền, chỉ các bài trong unit và `unit-review` được coi
 * là đã biết.
 */
export function validateBilingualUnit(unit: BilingualUnit, externalLessonIds: Iterable<string> = []) {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();
  const known = new Set<string>(["unit-review", ...externalLessonIds]);

  for (const lesson of unit.lessons) {
    if (ids.has(lesson.id)) issues.push({ code: "duplicate-id", path: lesson.id, message: "ID bị trùng" });
    ids.add(lesson.id);

    for (const prereq of lesson.prerequisites) {
      if (!known.has(prereq)) issues.push({ code: "invalid-prerequisite", path: lesson.id, message: prereq });
    }

    for (const objective of lesson.objectives) {
      if (!objective.vi || !objective.ko) issues.push({ code: "missing-bilingual", path: objective.id, message: "Thiếu giải thích Việt/Hàn" });
      if (!objective.fsrsTags.includes("A2")) issues.push({ code: "invalid-fsrs-tag", path: objective.id, message: "Thiếu tag level" });
      if (!objective.skills.length) issues.push({ code: "missing-skills", path: objective.id, message: "Thiếu kỹ năng" });
      const covered = lesson.mastery.some((item) => item.objectiveId === objective.id);
      if (!covered) issues.push({ code: "uncovered-objective", path: objective.id, message: "Mastery chưa bao phủ mục tiêu" });
    }

    for (const item of [...lesson.listening, ...lesson.guided, ...lesson.mastery]) {
      if (!["written", "speaking"].includes(item.type) && item.answer === undefined) issues.push({ code: "missing-answer", path: item.id, message: "Bài khách quan thiếu đáp án" });
    }

    if (lesson.examples.length < 15) issues.push({ code: "missing-examples", path: lesson.id, message: "Cần ít nhất 15 ví dụ" });
    if (lesson.dialogue.length < 6) issues.push({ code: "short-dialogue", path: lesson.id, message: "Hội thoại cần tối thiểu 6 lượt" });
    if (lesson.listening.length < 1) issues.push({ code: "missing-listening", path: lesson.id, message: "Cần ít nhất một hoạt động nghe" });
    if (lesson.guided.length < 2) issues.push({ code: "missing-guided", path: lesson.id, message: "Cần ít nhất hai hoạt động luyện tập" });
    if (lesson.mastery.length < 4) issues.push({ code: "short-mastery", path: lesson.id, message: "Mastery cần tối thiểu 4 hoạt động" });
    if (!lesson.production.some((item) => item.type === "written")) issues.push({ code: "missing-writing", path: lesson.id, message: "Thiếu nhiệm vụ viết" });
    if (!lesson.production.some((item) => item.type === "speaking")) issues.push({ code: "missing-speaking", path: lesson.id, message: "Thiếu nhiệm vụ nói" });
    if (!lesson.errorCategories.length) issues.push({ code: "missing-error-categories", path: lesson.id, message: "Thiếu nhóm lỗi cá nhân" });

    known.add(lesson.id);
  }
  return issues;
}
