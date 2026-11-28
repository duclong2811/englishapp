/** A1 grammar, in teaching order. Each id has a lesson file in ./a1 once it is written. */
export const A1_SYLLABUS: { id: string; title: string }[] = [
  { id: "be-present", title: "Động từ to be: am, is, are" },
  { id: "articles-plurals", title: "A, an và danh từ số nhiều" },
  { id: "this-that", title: "This, that, these, those" },
  { id: "possessives", title: "My, your, his… và sở hữu cách 's" },
  { id: "there-is-are", title: "There is, there are" },
  { id: "present-simple", title: "Thì hiện tại đơn: I work, she works" },
  { id: "present-simple-questions", title: "Hiện tại đơn: phủ định và câu hỏi" },
  { id: "frequency-adverbs", title: "Always, usually, often, never" },
  { id: "can", title: "Can và can't" },
  { id: "imperatives", title: "Câu mệnh lệnh: Sit down, Don't…" },
  { id: "prepositions-place", title: "Giới từ chỉ nơi chốn: in, on, under…" },
  { id: "prepositions-time", title: "Giới từ chỉ thời gian: in, on, at" },
  { id: "object-pronouns", title: "Me, him, her, us, them" },
  { id: "some-any", title: "Danh từ đếm được, không đếm được, some, any" },
  { id: "how-much-many", title: "How much, how many" },
  { id: "like-ing", title: "Like, love, hate + V-ing" },
  { id: "present-continuous", title: "Thì hiện tại tiếp diễn" },
  { id: "simple-vs-continuous", title: "Hiện tại đơn hay hiện tại tiếp diễn?" },
  { id: "was-were", title: "Was, were" },
  { id: "past-simple-regular", title: "Quá khứ đơn: động từ có quy tắc" },
  { id: "past-simple-irregular", title: "Quá khứ đơn: động từ bất quy tắc" },
  { id: "past-simple-questions", title: "Quá khứ đơn: phủ định và câu hỏi" },
  { id: "going-to", title: "Be going to: kế hoạch tương lai" },
  { id: "question-words", title: "Từ để hỏi: what, where, when, who…" },
  { id: "would-like", title: "Would like: lời mời và yêu cầu lịch sự" },
];

/** A1 chapters in teaching order. */
export const A1_UNITS: { id: string; title: string; lessons: string[] }[] = [
  { id: "foundations", title: "Nền tảng", lessons: ["be-present", "articles-plurals", "this-that", "possessives", "there-is-are"] },
  { id: "present-simple", title: "Hiện tại đơn", lessons: ["present-simple", "present-simple-questions", "frequency-adverbs", "can", "imperatives"] },
  { id: "place-time-pronouns", title: "Nơi chốn, thời gian và đại từ", lessons: ["prepositions-place", "prepositions-time", "object-pronouns"] },
  { id: "quantity-preferences", title: "Số lượng và sở thích", lessons: ["some-any", "how-much-many", "like-ing"] },
  { id: "present-continuous", title: "Hiện tại tiếp diễn", lessons: ["present-continuous", "simple-vs-continuous"] },
  { id: "past", title: "Quá khứ", lessons: ["was-were", "past-simple-regular", "past-simple-irregular", "past-simple-questions"] },
  { id: "future-communication", title: "Tương lai và giao tiếp", lessons: ["going-to", "question-words", "would-like"] },
];

/** A2 grammar, in teaching order. Each id has a lesson file in ./a2 once it is written. */
export const A2_SYLLABUS: { id: string; title: string }[] = [
  { id: "past-continuous", title: "Quá khứ tiếp diễn: I was working" },
  { id: "past-simple-vs-continuous", title: "Quá khứ đơn hay quá khứ tiếp diễn? When, while" },
  { id: "used-to", title: "Used to: thói quen trong quá khứ" },
  { id: "time-clauses", title: "Before, after, when, until, as soon as" },
  { id: "present-perfect-experience", title: "Hiện tại hoàn thành: ever, never" },
  { id: "present-perfect-just-yet", title: "Just, already, yet" },
  { id: "present-perfect-for-since", title: "For và since: how long" },
  { id: "present-perfect-vs-past", title: "Hiện tại hoàn thành hay quá khứ đơn?" },
  { id: "will-future", title: "Will: dự đoán, quyết định tức thì, lời hứa" },
  { id: "will-vs-going-to", title: "Will hay be going to?" },
  { id: "present-for-future", title: "Hiện tại tiếp diễn cho lịch hẹn tương lai" },
  { id: "zero-conditional", title: "Câu điều kiện loại 0: If you heat ice, it melts" },
  { id: "first-conditional", title: "Câu điều kiện loại 1: If it rains, I will…" },
  { id: "comparatives", title: "So sánh hơn: bigger, more expensive" },
  { id: "superlatives", title: "So sánh nhất: the biggest, the most…" },
  { id: "as-as", title: "As … as, not as … as, the same as" },
  { id: "too-enough", title: "Too và enough" },
  { id: "adverbs-manner", title: "Trạng từ cách thức: quickly, well, hard" },
  { id: "must-have-to", title: "Must, have to, don't have to, mustn't" },
  { id: "should", title: "Should: lời khuyên" },
  { id: "might-may", title: "Might, may: có lẽ, có thể" },
  { id: "could-requests", title: "Could you…? Can I…? May I…?" },
  { id: "quantifiers", title: "Much, many, a few, a little, a lot of" },
  { id: "some-any-compounds", title: "Something, anyone, nobody, everywhere…" },
  { id: "possessive-pronouns", title: "Mine, yours… và whose" },
  { id: "articles-the", title: "The hay không có mạo từ" },
  { id: "verb-ing-to", title: "Động từ + V-ing hay to V: enjoy doing, want to do" },
  { id: "relative-clauses", title: "Who, which, that: mệnh đề quan hệ" },
  { id: "linking-words", title: "And, but, so, because, although" },
];

/** A2 chapters in teaching order. */
export const A2_UNITS: { id: string; title: string; lessons: string[] }[] = [
  { id: "a2-past", title: "Kể chuyện quá khứ", lessons: ["past-continuous", "past-simple-vs-continuous", "used-to", "time-clauses"] },
  { id: "a2-present-perfect", title: "Hiện tại hoàn thành", lessons: ["present-perfect-experience", "present-perfect-just-yet", "present-perfect-for-since", "present-perfect-vs-past"] },
  { id: "a2-future", title: "Tương lai và điều kiện", lessons: ["will-future", "will-vs-going-to", "present-for-future", "zero-conditional", "first-conditional"] },
  { id: "a2-compare", title: "So sánh và mô tả", lessons: ["comparatives", "superlatives", "as-as", "too-enough", "adverbs-manner"] },
  { id: "a2-modals", title: "Động từ khuyết thiếu", lessons: ["must-have-to", "should", "might-may", "could-requests"] },
  { id: "a2-nouns", title: "Danh từ, đại từ và lượng từ", lessons: ["quantifiers", "some-any-compounds", "possessive-pronouns", "articles-the"] },
  { id: "a2-linking", title: "Nối câu", lessons: ["verb-ing-to", "relative-clauses", "linking-words"] },
];

/** B1 grammar, in teaching order. Each id has a lesson file in ./b1 once it is written. */
export const B1_SYLLABUS: { id: string; title: string }[] = [
  { id: "past-perfect", title: "Quá khứ hoàn thành: I had already left" },
  { id: "present-perfect-continuous", title: "Hiện tại hoàn thành tiếp diễn: I've been waiting" },
  { id: "would-used-to", title: "Would, used to và be used to" },
  { id: "future-continuous", title: "Tương lai tiếp diễn: I'll be working" },
  { id: "passive-basics", title: "Câu bị động: is made, was built" },
  { id: "passive-more", title: "Bị động với will, can, have been" },
  { id: "have-something-done", title: "Have something done: nhờ người khác làm" },
  { id: "second-conditional", title: "Câu điều kiện loại 2: If I had more time…" },
  { id: "third-conditional", title: "Câu điều kiện loại 3: If I had known…" },
  { id: "wish", title: "Wish và if only" },
  { id: "unless-in-case", title: "Unless, as long as, in case" },
  { id: "reported-statements", title: "Câu gián tiếp: She said that…" },
  { id: "reported-questions", title: "Câu hỏi gián tiếp: He asked if…" },
  { id: "reported-requests", title: "Tell, ask someone to do: kể lại lời nhờ, lời khuyên" },
  { id: "modals-deduction", title: "Must, might, can't: đoán chắc chắn đến đâu" },
  { id: "modals-past", title: "Should have, could have, must have" },
  { id: "could-able-to", title: "Could, was able to, managed to" },
  { id: "relative-clauses-more", title: "Whose, where và mệnh đề quan hệ có dấu phẩy" },
  { id: "question-tags", title: "Câu hỏi đuôi: isn't it?, didn't you?" },
  { id: "indirect-questions", title: "Hỏi lịch sự: Could you tell me where…?" },
  { id: "so-such", title: "So, such, so … that" },
  { id: "gerund-infinitive-meaning", title: "Stop, remember, try + V-ing hay to V" },
  { id: "verb-object-infinitive", title: "Want someone to, make, let" },
  { id: "comparison-more", title: "The more … the more, much better, a bit" },
  { id: "contrast-purpose", title: "Despite, however, so that, in order to" },
];

/** B1 chapters in teaching order. */
export const B1_UNITS: { id: string; title: string; lessons: string[] }[] = [
  { id: "b1-tenses", title: "Thì và thời gian", lessons: ["past-perfect", "present-perfect-continuous", "would-used-to", "future-continuous"] },
  { id: "b1-passive", title: "Câu bị động", lessons: ["passive-basics", "passive-more", "have-something-done"] },
  { id: "b1-conditionals", title: "Điều kiện và mong ước", lessons: ["second-conditional", "third-conditional", "wish", "unless-in-case"] },
  { id: "b1-reported", title: "Câu gián tiếp", lessons: ["reported-statements", "reported-questions", "reported-requests"] },
  { id: "b1-modals", title: "Động từ khuyết thiếu nâng cao", lessons: ["modals-deduction", "modals-past", "could-able-to"] },
  { id: "b1-questions", title: "Mệnh đề và câu hỏi", lessons: ["relative-clauses-more", "question-tags", "indirect-questions", "so-such"] },
  { id: "b1-patterns", title: "Mẫu câu và liên kết", lessons: ["gerund-infinitive-meaning", "verb-object-infinitive", "comparison-more", "contrast-purpose"] },
];

export const B2_SYLLABUS: { id: string; title: string }[] = [
  { id: "future-perfect", title: "Tương lai hoàn thành: will have done" },
  { id: "narrative-tenses", title: "Kể chuyện: had been doing và các thì quá khứ" },
  { id: "future-in-past", title: "Was going to, was about to: dự định trong quá khứ" },
  { id: "stative-verbs", title: "Động từ trạng thái: I think hay I'm thinking" },
  { id: "passive-reporting", title: "It is said that, he is believed to" },
  { id: "passive-forms", title: "Bị động với V-ing, to V và get" },
  { id: "reporting-verbs", title: "Suggest, warn, admit, deny: động từ tường thuật" },
  { id: "mixed-conditionals", title: "Câu điều kiện hỗn hợp" },
  { id: "conditional-linkers", title: "Provided that, otherwise, but for" },
  { id: "would-rather", title: "Would rather, it's time, wish … would" },
  { id: "conditional-inversion", title: "Had I known, should you need: đảo ngữ điều kiện" },
  { id: "past-deduction", title: "Must have been, can't have, might have" },
  { id: "need-supposed", title: "Needn't have, didn't need to, be supposed to" },
  { id: "likelihood", title: "Be likely to, be bound to, be about to" },
  { id: "participle-clauses", title: "Mệnh đề phân từ: Walking home, I saw…" },
  { id: "relative-advanced", title: "Mệnh đề quan hệ rút gọn, all of whom, which" },
  { id: "cleft-sentences", title: "Câu chẻ: What I need is…, It was … that" },
  { id: "inversion-emphasis", title: "Đảo ngữ nhấn mạnh: Never have I, Not only" },
  { id: "whatever-however", title: "Whatever, whoever, however: bất cứ" },
  { id: "linking-contrast", title: "Whereas, even though, nevertheless" },
  { id: "linking-cause", title: "Due to, owing to, consequently" },
  { id: "verb-patterns-advanced", title: "Prevent from, accuse of, insist on" },
  { id: "causative-advanced", title: "Get someone to do, have something done" },
  { id: "quantifiers-advanced", title: "Few, a few, hardly any, neither of" },
];

/** B2 chapters in teaching order. */
export const B2_UNITS: { id: string; title: string; lessons: string[] }[] = [
  { id: "b2-tenses", title: "Thì nâng cao", lessons: ["future-perfect", "narrative-tenses", "future-in-past", "stative-verbs"] },
  { id: "b2-reporting", title: "Bị động và tường thuật", lessons: ["passive-reporting", "passive-forms", "reporting-verbs"] },
  { id: "b2-conditionals", title: "Điều kiện và giả định", lessons: ["mixed-conditionals", "conditional-linkers", "would-rather", "conditional-inversion"] },
  { id: "b2-modals", title: "Suy đoán và khả năng", lessons: ["past-deduction", "need-supposed", "likelihood"] },
  { id: "b2-clauses", title: "Mệnh đề và nhấn mạnh", lessons: ["participle-clauses", "relative-advanced", "cleft-sentences", "inversion-emphasis", "whatever-however"] },
  { id: "b2-linking", title: "Liên kết và mẫu câu", lessons: ["linking-contrast", "linking-cause", "verb-patterns-advanced", "causative-advanced", "quantifiers-advanced"] },
];

export type GrammarLevel = "A1" | "A2" | "B1" | "B2";

export const GRAMMAR_LEVELS: Record<GrammarLevel, { syllabus: { id: string; title: string }[]; units: { id: string; title: string; lessons: string[] }[] }> = {
  A1: { syllabus: A1_SYLLABUS, units: A1_UNITS },
  A2: { syllabus: A2_SYLLABUS, units: A2_UNITS },
  B1: { syllabus: B1_SYLLABUS, units: B1_UNITS },
  B2: { syllabus: B2_SYLLABUS, units: B2_UNITS },
};
