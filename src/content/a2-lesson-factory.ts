/**
 * Bộ dựng bài học A2 song ngữ.
 *
 * Mục đích: mọi bài A2 Unit 1–6 đi qua cùng một hàm dựng, nên cấu trúc, ID,
 * FSRS tag và điều kiện tối thiểu luôn giống nhau. Nội dung thật (nghĩa tiếng
 * Việt, nghĩa tiếng Hàn, bối cảnh, hội thoại) do từng unit viết thủ công —
 * factory không sinh câu dịch chung chung và không sao chép mẫu câu.
 */
import { bilingualLessonSchema, type BilingualLesson } from "@/lib/curriculum/bilingual-schema";
import type { Exercise } from "@/lib/curriculum/schema";

export type Register = "formal" | "neutral" | "casual";

/** [id nội bộ, headword, nghĩa Việt, nghĩa Hàn, IPA, trọng âm, sắc thái, collocation] */
export type VocabSeed = readonly [
  id: string,
  headword: string,
  vi: string,
  ko: string,
  ipa: string,
  stress: string,
  register: Register,
  collocations: readonly string[],
];

/** [câu tiếng Anh, nghĩa Việt, nghĩa Hàn, bối cảnh cụ thể, sắc thái?] */
export type ExampleSeed = readonly [en: string, vi: string, ko: string, context: string, register?: Register];

/** [người nói, câu tiếng Anh, nghĩa Việt, nghĩa Hàn, sắc thái?] */
export type DialogueSeed = readonly [speaker: string, en: string, vi: string, ko: string, register?: Register];

export type GrammarSeed = {
  titleVi: string;
  titleKo: string;
  explanationVi: string;
  explanationKo: string;
  easierKorean: string;
};

export type ObjectiveSeed = {
  /** Luôn là `${lessonId}-...` để FSRS và Sổ lỗi giữ được liên kết ổn định. */
  id: string;
  en: string;
  vi: string;
  ko: string;
  skills: string[];
};

export type ExerciseSeed = {
  id: string;
  type: Exercise["type"];
  prompt: string;
  skill: Exercise["skill"];
  objectiveId: string;
  options?: string[];
  answer?: string | string[];
  modelAnswer?: string;
  checklist?: string[];
  hint?: string;
};

export type LessonSeed = {
  id: string;
  unitId: string;
  number: number;
  titleVi: string;
  titleKo: string;
  situationVi: string;
  situationKo: string;
  prerequisites: string[];
  objectives: ObjectiveSeed[];
  vocab: VocabSeed[];
  examples: ExampleSeed[];
  dialogue: DialogueSeed[];
  grammar: GrammarSeed[];
  listening: ExerciseSeed[];
  shadowing: { line: string; notesVi: string[]; notesKo: string[] };
  guided: ExerciseSeed[];
  production: ExerciseSeed[];
  mastery: ExerciseSeed[];
  canDo: string[];
  spiralReview: string[];
  errorCategories: string[];
  accentExposure?: ("en-US" | "en-GB")[];
};

/** Nhóm lỗi cá nhân ổn định, dùng chung cho Sổ lỗi và thẻ ôn tập. */
export const errorCategoryTaxonomy = [
  "word-choice",
  "grammar-form",
  "verb-tense",
  "missing-word",
  "word-order",
  "preposition",
  "register",
] as const;

export type ErrorCategory = (typeof errorCategoryTaxonomy)[number];

const defaultAccents: ("en-US" | "en-GB")[] = ["en-US", "en-GB"];

/** Câu dịch mẫu cũ không còn được dùng; factory chặn nếu nội dung quay lại lối viết đó. */
const bannedPhrases = ["Câu dùng để", "Câu hỏi lịch sự và rõ ý", "이 상황에서 대화를 시작할 때", "정중하고 분명하게 묻는 문장"];

export function buildLesson(seed: LessonSeed): BilingualLesson {
  assertSeed(seed);
  const unitTokens = seed.unitId.split("-");
  const level = unitTokens[0]?.toUpperCase() ?? "A2";
  return bilingualLessonSchema.parse({
    id: seed.id,
    level: "A2",
    unitId: seed.unitId,
    number: seed.number,
    titleVi: seed.titleVi,
    titleKo: seed.titleKo,
    situationVi: seed.situationVi,
    situationKo: seed.situationKo,
    prerequisites: seed.prerequisites,
    objectives: seed.objectives.map((objective) => ({
      id: objective.id,
      en: objective.en,
      vi: objective.vi,
      ko: objective.ko,
      skills: objective.skills,
      fsrsTags: [level, "A2", seed.unitId, seed.id, objective.id],
    })),
    dialogue: seed.dialogue.map(([speaker, en, vi, ko, register]) => ({ speaker, en, vi, ko, register: register ?? "neutral" })),
    vocabulary: seed.vocab.map(([id, headword, vi, ko, ipa, stress, register, collocations]) => ({
      id: `${seed.id}-${id}`,
      headword,
      definitionVi: vi,
      definitionKo: ko,
      collocations: [...collocations],
      register,
      ipa,
      stress,
    })),
    grammar: seed.grammar.map((block) => ({
      titleVi: block.titleVi,
      titleKo: block.titleKo,
      explanationVi: block.explanationVi,
      explanationKo: block.explanationKo,
      easierKorean: block.easierKorean,
    })),
    examples: seed.examples.map(([en, vi, ko, context, register]) => ({
      en,
      vi,
      ko,
      context,
      register: register ?? "neutral",
      audioLocales: defaultAccents,
    })),
    listening: seed.listening,
    shadowing: seed.shadowing,
    guided: seed.guided,
    production: seed.production,
    mastery: seed.mastery,
    errorCategories: seed.errorCategories,
    canDo: seed.canDo,
    spiralReview: seed.spiralReview,
    accentExposure: seed.accentExposure ?? defaultAccents,
  });
}

function assertSeed(seed: LessonSeed) {
  const problems: string[] = [];
  if (seed.dialogue.length < 6) problems.push(`hội thoại cần tối thiểu 6 lượt (đang có ${seed.dialogue.length})`);
  if (seed.examples.length < 15) problems.push(`cần tối thiểu 15 ví dụ (đang có ${seed.examples.length})`);
  if (seed.vocab.length < 8 || seed.vocab.length > 15) problems.push(`từ vựng phải từ 8 đến 15 mục (đang có ${seed.vocab.length})`);
  if (seed.objectives.length < 2) problems.push("cần tối thiểu 2 mục tiêu");
  if (seed.mastery.length < 4) problems.push(`mastery cần tối thiểu 4 hoạt động (đang có ${seed.mastery.length})`);
  for (const objective of seed.objectives) {
    if (!seed.mastery.some((item) => item.objectiveId === objective.id)) problems.push(`chưa có hoạt động mastery cho ${objective.id}`);
  }
  for (const category of seed.errorCategories) {
    if (!errorCategoryTaxonomy.includes(category as ErrorCategory)) problems.push(`nhóm lỗi không thuộc taxonomy: ${category}`);
  }
  for (const [, , vi, ko] of seed.dialogue) {
    if (!vi.trim() || !ko.trim()) problems.push("thiếu bản dịch hội thoại");
  }
  for (const [en, vi, ko, context] of seed.examples) {
    if (!vi.trim() || !ko.trim()) problems.push(`thiếu bản dịch cho ví dụ: ${en}`);
    if (!context.trim()) problems.push(`thiếu bối cảnh cho ví dụ: ${en}`);
    for (const banned of bannedPhrases) {
      if (vi.includes(banned) || ko.includes(banned)) problems.push(`bản dịch chung chung bị chặn: ${en}`);
    }
  }
  const objectiveIds = seed.objectives.map((item) => item.id);
  const exerciseIds = [...seed.listening, ...seed.guided, ...seed.production, ...seed.mastery].map((item) => item.id);
  const vocabularyIds = seed.vocab.map(([id]) => `${seed.id}-${id}`);
  if (new Set(objectiveIds).size !== objectiveIds.length) problems.push("ID mục tiêu bị trùng trong bài");
  if (new Set(exerciseIds).size !== exerciseIds.length) problems.push("ID hoạt động bị trùng trong bài");
  // Mục tiêu và bài tập nằm chung một không gian ID trong bài, nên không được trùng nhau.
  const collisions = objectiveIds.filter((id) => exerciseIds.includes(id));
  if (collisions.length) problems.push(`ID mục tiêu trùng ID bài tập: ${collisions.join(", ")}`);
  if (new Set(vocabularyIds).size !== vocabularyIds.length) problems.push("ID từ vựng bị trùng trong bài");
  if (problems.length) throw new Error(`Bài ${seed.id} chưa đạt chuẩn: ${problems.join("; ")}`);
}

export const exercise = {
  multipleChoice(id: string, prompt: string, options: string[], answer: string, skill: Exercise["skill"], objectiveId: string, hint?: string): ExerciseSeed {
    return { id, type: "multiple-choice", prompt, options, answer, skill, objectiveId, hint };
  },
  fillBlank(id: string, prompt: string, answer: string, skill: Exercise["skill"], objectiveId: string, hint?: string): ExerciseSeed {
    return { id, type: "fill-blank", prompt, answer, skill, objectiveId, hint };
  },
  arrange(id: string, prompt: string, options: string[], answer: string, objectiveId: string): ExerciseSeed {
    return { id, type: "arrange", prompt, options, answer, skill: "grammar", objectiveId };
  },
  translation(id: string, prompt: string, answer: string, objectiveId: string, skill: Exercise["skill"] = "writing"): ExerciseSeed {
    return { id, type: "translation", prompt, answer, skill, objectiveId };
  },
  dictation(id: string, prompt: string, answer: string, objectiveId: string, hint?: string): ExerciseSeed {
    return { id, type: "dictation", prompt, answer, skill: "listening", objectiveId, hint };
  },
  written(id: string, prompt: string, objectiveId: string, modelAnswer: string, checklist: string[]): ExerciseSeed {
    return { id, type: "written", prompt, skill: "writing", objectiveId, modelAnswer, checklist };
  },
  speaking(id: string, prompt: string, objectiveId: string, modelAnswer: string, checklist: string[]): ExerciseSeed {
    return { id, type: "speaking", prompt, skill: "speaking", objectiveId, modelAnswer, checklist };
  },
};

export type { BilingualLesson, Exercise };
