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
