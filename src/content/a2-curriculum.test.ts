import { describe, expect, it } from "vitest";
import { a2Lessons, a2Units } from "./a2-course";
import { errorCategoryTaxonomy } from "./a2-lesson-factory";
import { validateBilingualUnit } from "@/lib/curriculum/validate";

/** ID bài học phải ổn định: đổi ID sẽ làm mất tiến độ, thẻ FSRS và bản ghi cũ. */
const stableLessonIds = [
  "a2-recent-changes", "a2-sharing-experiences", "a2-planning-schedules", "a2-invitations", "a2-unit-1-review",
  "a2-polite-requests", "a2-directions-transit", "a2-shopping-returns", "a2-appointments", "a2-unit-2-mission",
  "a2-telling-past-event", "a2-background-actions", "a2-problem-resolution", "a2-story-reactions", "a2-complete-story",
  "a2-trip-plans", "a2-airport-station", "a2-travel-incidents", "a2-travel-support", "a2-unit-4-review",
  "a2-health-symptoms", "a2-doctor-pharmacy", "a2-healthy-habits", "a2-giving-advice", "a2-unit-5-review",
  "a2-job-tasks", "a2-skills-abilities", "a2-permission-deadlines", "a2-progress-reporting", "a2-unit-6-review",
];

/** ID bài tập của Unit 1–3 đã tồn tại trước vòng này và phải được giữ nguyên. */
const legacyExerciseSuffixes = {
  "a2-recent-changes": ["listen", "dictation", "g1", "g2", "production", "speaking", "m1", "m2", "m3", "m4"],
  "a2-sharing-experiences": ["listen", "dictation", "g1", "g2", "production", "speaking", "m1", "m2", "m3", "m4"],
  "a2-planning-schedules": ["listen", "dictation", "g1", "g2", "production", "speaking", "m1", "m2", "m3", "m4"],
  "a2-invitations": ["listen", "dictation", "g1", "g2", "production", "speaking", "m1", "m2", "m3", "m4"],
  "a2-unit-1-review": ["listen", "dictation", "g1", "g2", "production", "speaking", "m1", "m2", "m3", "m4"],
  "a2-polite-requests": ["listen", "dictation", "g1", "g2", "write", "speak", "m1", "m2", "m3", "m4"],
  "a2-directions-transit": ["listen", "dictation", "g1", "g2", "write", "speak", "m1", "m2", "m3", "m4"],
  "a2-shopping-returns": ["listen", "dictation", "g1", "g2", "write", "speak", "m1", "m2", "m3", "m4"],
  "a2-appointments": ["listen", "dictation", "g1", "g2", "write", "speak", "m1", "m2", "m3", "m4"],
  "a2-unit-2-mission": ["listen", "dictation", "g1", "g2", "write", "speak", "m1", "m2", "m3", "m4"],
  "a2-telling-past-event": ["listen", "dictation", "g1", "g2", "write", "speak", "m1", "m2", "m3", "m4"],
  "a2-background-actions": ["listen", "dictation", "g1", "g2", "write", "speak", "m1", "m2", "m3", "m4"],
  "a2-problem-resolution": ["listen", "dictation", "g1", "g2", "write", "speak", "m1", "m2", "m3", "m4"],
  "a2-story-reactions": ["listen", "dictation", "g1", "g2", "write", "speak", "m1", "m2", "m3", "m4"],
  "a2-complete-story": ["listen", "dictation", "g1", "g2", "write", "speak", "m1", "m2", "m3", "m4"],
} as const;

const genericTemplatePhrases = ["Câu dùng để", "Câu hỏi lịch sự và rõ ý", "이 상황에서 대화를 시작할 때", "정중하고 분명하게 묻는 문장"];

const exerciseIds = (lesson: (typeof a2Lessons)[number]) => [
  ...lesson.listening.map((item) => item.id),
  ...lesson.guided.map((item) => item.id),
  ...lesson.production.map((item) => item.id),
  ...lesson.mastery.map((item) => item.id),
];

describe("A2 Unit 1–6", () => {
  it("gồm 6 unit × 5 bài với ID ổn định", () => {
    expect(a2Units).toHaveLength(6);
    const allLessonIds = a2Lessons.map((lesson) => lesson.id);
    for (const unit of a2Units) {
      expect(unit.lessons).toHaveLength(5);
      expect(validateBilingualUnit(unit, allLessonIds)).toEqual([]);
    }
    expect(allLessonIds).toEqual(stableLessonIds);
    expect(new Set(allLessonIds).size).toBe(30);
  });

  it("mỗi bài đạt chuẩn nội dung tối thiểu", () => {
    for (const lesson of a2Lessons) {
      expect(lesson.vocabulary.length, `${lesson.id} từ vựng`).toBeGreaterThanOrEqual(8);
      expect(lesson.vocabulary.length, `${lesson.id} từ vựng`).toBeLessThanOrEqual(15);
      expect(lesson.examples.length, `${lesson.id} ví dụ`).toBeGreaterThanOrEqual(15);
      expect(lesson.dialogue.length, `${lesson.id} hội thoại`).toBeGreaterThanOrEqual(6);
      expect(lesson.listening.length, `${lesson.id} listening`).toBeGreaterThanOrEqual(1);
      expect(lesson.guided.length, `${lesson.id} guided`).toBeGreaterThanOrEqual(2);
      expect(lesson.mastery.length, `${lesson.id} mastery`).toBeGreaterThanOrEqual(4);
      expect(lesson.canDo?.length, `${lesson.id} can-do`).toBeGreaterThan(0);
      expect(lesson.spiralReview?.length, `${lesson.id} spiral`).toBeGreaterThan(0);
      expect(lesson.accentExposure, `${lesson.id} accent`).toEqual(["en-US", "en-GB"]);
      expect(lesson.errorCategories.length, `${lesson.id} lỗi`).toBeGreaterThan(0);
    }
  });

  it("mastery bao phủ mọi mục tiêu và mục tiêu mang FSRS tag ổn định", () => {
    for (const lesson of a2Lessons) {
      const exerciseIdsOfLesson = [lesson.listening, lesson.guided, lesson.production, lesson.mastery].flat().map((item) => item.id);
      for (const objective of lesson.objectives) {
        expect(objective.id.startsWith(lesson.id), `${objective.id} thuộc ${lesson.id}`).toBe(true);
        expect(objective.fsrsTags).toContain("A2");
        expect(objective.fsrsTags).toContain(lesson.unitId);
        expect(objective.fsrsTags).toContain(lesson.id);
        // ID mục tiêu và ID bài tập không được trùng nhau, nếu không FSRS và Sổ lỗi sẽ nhập nhằng.
        expect(exerciseIdsOfLesson, `${objective.id} trùng ID bài tập`).not.toContain(objective.id);
        expect(lesson.vocabulary.map((word) => word.id), `${objective.id} trùng ID từ vựng`).not.toContain(objective.id);
        expect(lesson.mastery.some((item) => item.objectiveId === objective.id), `${objective.id} được kiểm tra`).toBe(true);
      }
    }
  });

  it("có đủ nhiệm vụ viết và nhiệm vụ nói trong phần production", () => {
    for (const lesson of a2Lessons) {
      const types = lesson.production.map((item) => item.type);
      expect(types, `${lesson.id} có nhiệm vụ viết`).toContain("written");
      expect(types, `${lesson.id} có nhiệm vụ nói`).toContain("speaking");
    }
  });

  it("guided practice dùng nhiều dạng bài khác nhau", () => {
    const variety = new Set<string>();
    for (const lesson of a2Lessons) {
      lesson.guided.forEach((item) => variety.add(item.type));
      expect(lesson.guided.length, `${lesson.id} guided`).toBeGreaterThanOrEqual(2);
    }
    expect(variety.size).toBeGreaterThanOrEqual(4);
    expect([...variety]).toEqual(expect.arrayContaining(["multiple-choice", "translation", "arrange"]));
  });

  it("bản dịch Việt–Hàn là bản dịch thật, không dùng câu mô tả chung", () => {
    for (const lesson of a2Lessons) {
      for (const example of lesson.examples) {
        expect(example.vi.trim(), `${example.en} thiếu nghĩa Việt`).not.toBe("");
        expect(example.ko.trim(), `${example.en} thiếu nghĩa Hàn`).not.toBe("");
        expect(example.vi, `${example.en} dùng lại bối cảnh`).not.toBe(example.context);
        for (const phrase of genericTemplatePhrases) {
          expect(example.vi.includes(phrase) || example.ko.includes(phrase), `${example.en} dùng câu chung`).toBe(false);
        }
      }
      for (const line of lesson.dialogue) {
        expect(line.vi.trim()).not.toBe("");
        expect(line.ko.trim()).not.toBe("");
        expect(line.vi).not.toBe(line.ko);
      }
      for (const word of lesson.vocabulary) {
        expect(word.definitionVi.trim()).not.toBe("");
        expect(word.definitionKo.trim()).not.toBe("");
        expect(word.ipa, `${word.headword} thiếu IPA`).toMatch(/^\/.+\/$/);
        expect(word.ipa, `${word.headword} còn placeholder`).not.toBe("/—/");
      }
    }
  });

  it("hướng dẫn cho người học viết bằng tiếng Việt, tiếng Hàn chỉ ở phần nội dung học", () => {
    const hangul = /[\uac00-\ud7af]/;
    for (const lesson of a2Lessons) {
      const prompts = [...lesson.listening, ...lesson.guided, ...lesson.production, ...lesson.mastery].map((item) => item.prompt);
      for (const prompt of prompts) expect(prompt, `${lesson.id}: ${prompt}`).not.toMatch(hangul);
      expect(lesson.titleVi).not.toMatch(hangul);
      expect(lesson.titleKo).toMatch(hangul);
    }
  });

  it("giữ nguyên ID bài tập của A2 Unit 1–3 và nhóm lỗi thuộc taxonomy", () => {
    for (const [lessonId, suffixes] of Object.entries(legacyExerciseSuffixes)) {
      const lesson = a2Lessons.find((item) => item.id === lessonId);
      expect(lesson, `thiếu bài ${lessonId}`).toBeDefined();
      const ids = exerciseIds(lesson!);
      for (const suffix of suffixes) expect(ids, `${lessonId}-${suffix}`).toContain(`${lessonId}-${suffix}`);
    }
    for (const lesson of a2Lessons) {
      for (const category of lesson.errorCategories) {
        expect(errorCategoryTaxonomy, `${lesson.id}: ${category}`).toContain(category);
      }
    }
  });

  it("prerequisites nối tiếp trong từng unit và giữa các unit", () => {
    for (const unit of a2Units) {
      unit.lessons.forEach((lesson, index) => {
        if (index === 0) return;
        expect(lesson.prerequisites, `${lesson.id} cần bài trước`).toEqual([unit.lessons[index - 1].id]);
      });
    }
    expect(a2Units[0].lessons[0].prerequisites).toEqual(["unit-review"]);
    for (let i = 1; i < a2Units.length; i += 1) {
      const previousUnitLastLesson = a2Units[i - 1].lessons.at(-1)!.id;
      expect(a2Units[i].lessons[0].prerequisites, `Unit ${i + 1} nối tiếp unit trước`).toEqual([previousUnitLastLesson]);
    }
  });
});
