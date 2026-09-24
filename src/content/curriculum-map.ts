import { curriculumMapSchema, type CurriculumMap } from "@/lib/curriculum/map-schema";

/**
 * Bản đồ chương trình có kiểm soát: A2 / B1 / B2, mỗi Unit 5 bài.
 *
 * `lessonGrammar` (phần tử thứ 7, chỉ A2 dùng) là scope-and-sequence ngữ pháp
 * theo từng bài. Bài 5 luôn là bài ôn tập tích lũy nên được gắn tiền tố
 * “Ôn xoắn ốc” khi dựng.
 */
type UnitSeed = [slug: string, vi: string, ko: string, themes: string[], grammar: string, goal: string, lessonGrammar?: string[]];

const lessonKinds = ["Khám phá tình huống", "Xây dựng ngôn ngữ", "Thực hành tương tác", "Nhiệm vụ thực tế", "Ôn tập tích lũy"];

function unit(level: "A2" | "B1" | "B2", index: number, seed: UnitSeed, previous?: string) {
  const [slug, vi, ko, themes, grammar, goal, lessonGrammar] = seed;
  const unitId = `${level.toLowerCase()}-${index}-${slug}`;
  return {
    id: unitId,
    titleVi: vi,
    titleKo: ko,
    lessons: lessonKinds.map((kind, lessonIndex) => {
      const id = `${unitId}-l${lessonIndex + 1}`;
      const prerequisite = lessonIndex ? `${unitId}-l${lessonIndex}` : previous;
      const plan = lessonGrammar?.[lessonIndex];
      return {
        id,
        titleVi: lessonIndex === 4 ? `Ôn tập và nhiệm vụ: ${vi}` : `${kind}: ${themes[lessonIndex % themes.length]}`,
        titleKo: lessonIndex === 4 ? `${ko} 복습과 실전 미션` : `${themes[lessonIndex % themes.length]} ${lessonIndex + 1}`,
        communicativeGoals: [goal],
        grammar: plan ? (lessonIndex === 4 ? [`Ôn xoắn ốc: ${plan}`] : [plan]) : lessonIndex === 0 ? [grammar] : lessonIndex === 4 ? [`Ôn xoắn ốc: ${grammar}`] : [],
        vocabularyThemes: [...themes],
        pronunciationGoals: [lessonIndex % 2 ? "Nhịp điệu và nối âm" : "Trọng âm từ và câu"],
        listeningGoals: [`Nghe ${level} trong ${themes[lessonIndex % themes.length]}`],
        speakingGoals: [goal],
        readingGoals: [`Đọc tin nhắn và văn bản ngắn về ${themes[0]}`],
        writingGoals: [`Viết nội dung phù hợp về ${themes[1] ?? themes[0]}`],
        prerequisites: prerequisite ? [prerequisite] : [],
        spiralReview: lessonIndex ? [`${unitId}-l1`] : [],
        videoSlot: { suggested: lessonIndex === 3, purpose: `Nghe ngữ liệu xác thực cho ${goal}`, accent: (lessonIndex % 2 ? "UK" : "US") as "UK" | "US" },
        canDo: [`Có thể ${goal.toLowerCase()}`],
      };
    }),
    reviewCheckpoint: `Ôn từ vựng, ${grammar}, nghe và sản xuất ngôn ngữ của ${vi}.`,
    unitAssessment: {
      listening: `Nghe tình huống ${vi}`,
      speaking: `${goal} trong hội thoại`,
      writing: `Viết nhiệm vụ về ${themes.join(", ")}`,
      mastery: "Điểm riêng cho tiếp nhận, nhớ lại và sản xuất",
    },
  };
}

/** A2: Unit 1–6 đã có nội dung đầy đủ; Unit 7–8 chỉ là kế hoạch mở rộng. */
const a2: UnitSeed[] = [
  ["everyday-connections", "Kết nối trong cuộc sống hằng ngày", "일상 속 관계", ["thay đổi gần đây", "trải nghiệm", "sắp xếp lịch", "lời mời", "liên kết hội thoại"], "Hiện tại hoàn thành cơ bản; be going to; cách mời", "chia sẻ thay đổi, trải nghiệm và sắp xếp kế hoạch", [
    "Hiện tại hoàn thành cho thay đổi gần đây và quá khứ đơn cho chi tiết đã kết thúc",
    "Have you ever…? để hỏi trải nghiệm và quá khứ đơn cho chi tiết",
    "be going to cho kế hoạch và will cho quyết định tức thời",
    "Would you like to…? và cách từ chối lịch sự",
    "Hiện tại hoàn thành, quá khứ đơn, kế hoạch và lời mời",
  ]],
  ["getting-things-done", "Hoàn thành việc cần làm", "일 처리하기", ["nhờ giúp đỡ", "chỉ đường và phương tiện", "đổi trả sản phẩm", "đặt và đổi lịch hẹn", "ôn tập việc cần làm"], "Could, would và can trong lời nhờ; too/enough; xác nhận thời gian", "nhờ giúp đỡ, di chuyển, đổi trả và sắp xếp cuộc hẹn", [
    "Could you…?, Would you mind + V-ing và cách phản hồi lời nhờ",
    "Câu mệnh lệnh, giới từ chuyển động và từ nối chỉ đường",
    "too và enough khi mô tả vấn đề của sản phẩm",
    "Đề xuất thời gian khác với Does… work? và instead",
    "Yêu cầu, chỉ đường, đổi trả và đặt lịch hẹn",
  ]],
  ["stories-past-events", "Câu chuyện và sự việc trong quá khứ", "이야기와 과거 사건", ["sự việc đã xảy ra", "bối cảnh và hành động đang diễn ra", "vấn đề và cách giải quyết", "phản ứng khi nghe kể", "ôn tập kể chuyện"], "Quá khứ đơn và quá khứ tiếp diễn; từ nối trình tự", "kể lại sự việc và phản hồi câu chuyện của người khác", [
    "Quá khứ đơn và từ nối trình tự first, then, after that, finally",
    "Quá khứ tiếp diễn với while và when",
    "Kết hợp quá khứ đơn và quá khứ tiếp diễn để kể sự cố",
    "Câu hỏi nối tiếp ở quá khứ đơn và phản ứng tự nhiên",
    "Thì kể chuyện, từ nối trình tự và phản ứng",
  ]],
  ["travel-problems", "Du lịch và những sự cố bất ngờ", "여행과 예상치 못한 문제", ["kế hoạch chuyến đi", "thủ tục ở sân bay và nhà ga", "sự cố và hành lý", "yêu cầu hỗ trợ", "ôn tập du lịch"], "be going to; have to/must; câu hỏi gián tiếp; điều kiện loại 1", "lên kế hoạch chuyến đi, xử lý sự cố và xác nhận giải pháp", [
    "be going to và hiện tại tiếp diễn cho kế hoạch chuyến đi",
    "have to, must, don’t have to và câu hỏi gián tiếp ở sân bay",
    "Kể sự cố chuyến bay và hành lý bằng hai thì quá khứ",
    "will cho giải pháp tức thời và câu điều kiện loại 1",
    "Kế hoạch, thủ tục, sự cố và yêu cầu hỗ trợ",
  ]],
  ["health-advice", "Sức khỏe, thói quen và lời khuyên", "건강, 습관, 조언", ["triệu chứng", "bác sĩ và dược sĩ", "thói quen và lối sống", "đưa lời khuyên", "ôn tập sức khỏe"], "should/could; must/have to; tần suất; too much/many/enough", "mô tả triệu chứng, trao đổi lời khuyên và thay đổi thói quen", [
    "have và have got để mô tả triệu chứng, too much, too many, enough",
    "must, mustn’t, have to và câu mệnh lệnh chỉ dẫn dùng thuốc",
    "Trạng từ và cụm từ tần suất, động danh từ sau động từ thông dụng",
    "should, shouldn’t và could để khuyên và làm rõ lời khuyên",
    "Triệu chứng, hướng dẫn dùng thuốc, thói quen và lời khuyên",
  ]],
  ["work-study", "Công việc, học tập và trách nhiệm", "일, 학습, 책임", ["nhiệm vụ và lịch làm việc", "kỹ năng và khả năng", "xin phép và thương lượng", "báo cáo tiến độ", "ôn tập công việc và học tập"], "can/could/be able to; have to/need to; hiện tại hoàn thành với for, since, just, already, yet", "mô tả trách nhiệm, thương lượng thời hạn và báo cáo tiến độ", [
    "Hiện tại đơn cho lịch làm việc và have to, need to, don’t need to",
    "can, could, be able to và động từ nguyên mẫu, động danh từ",
    "Xin phép với Could I…? và should cho thứ tự ưu tiên",
    "Hiện tại hoàn thành với for, since, just, already, yet khi báo cáo tiến độ",
    "So sánh hơn, so sánh nhất và tổng hợp Unit 6",
  ]],
  ["shopping-services", "Mua sắm, dịch vụ và nơi ở", "쇼핑과 서비스", ["sản phẩm", "giá cả", "đổi trả", "dịch vụ", "ôn tập mua sắm"], "too/enough; đại từ one/ones; there is/are; lượng từ", "so sánh lựa chọn và giải quyết vấn đề dịch vụ", [
    "Câu hỏi với How much, How long và Which khi dùng dịch vụ",
    "Đại từ one và ones khi chọn sản phẩm",
    "there is, there are và lượng từ some, any, a few",
    "So sánh hơn khi so sánh giá cả và chất lượng",
    "Mua sắm, giá cả, đổi trả và dịch vụ",
  ]],
  ["a2-life-mission", "Nhiệm vụ cuộc sống A2", "A2 생활 미션", ["quan hệ", "công việc", "du lịch", "dịch vụ", "ôn tập cuộc sống A2"], "Tổng hợp A2", "hoàn thành chuỗi nhiệm vụ đời sống A2", [
    "Tổng hợp A2: thì hiện tại, quá khứ và kế hoạch",
    "Tổng hợp A2: trợ động từ khuyết thiếu và lời khuyên",
    "Tổng hợp A2: câu hỏi, câu hỏi gián tiếp và xác nhận",
    "Tổng hợp A2: động danh từ, động từ nguyên mẫu và từ nối",
    "Nhiệm vụ đời sống A2 tích hợp",
  ]],
];

const b1: UnitSeed[] = [
  ["life-transitions", "Thay đổi cuộc sống", "삶의 변화", ["chuyển nhà", "công việc mới", "mục tiêu", "thích nghi"], "Present perfect với for/since; used to", "giải thích thay đổi và quá trình thích nghi"],
  ["workplace-collaboration", "Hợp tác nơi làm việc", "직장 협업", ["dự án", "phản hồi", "cuộc họp", "ưu tiên"], "Câu điều kiện loại 1; mệnh đề quan hệ", "phối hợp công việc và xử lý ưu tiên"],
  ["travel-problems", "Du lịch và giải quyết sự cố", "여행 문제 해결", ["đặt chỗ", "khiếu nại", "thay đổi", "hỗ trợ"], "Quá khứ hoàn thành nhập môn; câu hỏi gián tiếp", "giải quyết sự cố du lịch lịch sự"],
  ["health-decisions", "Quyết định về sức khỏe", "건강 결정", ["lựa chọn", "rủi ro", "thói quen", "dịch vụ y tế"], "Động từ khuyết thiếu suy đoán", "thảo luận lựa chọn sức khỏe thận trọng"],
  ["media-opinions", "Truyền thông và quan điểm", "미디어와 의견", ["nguồn tin", "quan điểm", "bằng chứng", "thảo luận"], "Câu bị động; động từ tường thuật", "trình bày và bảo vệ quan điểm"],
  ["money-consumption", "Tiền bạc và tiêu dùng", "돈과 소비", ["ngân sách", "giá trị", "hợp đồng", "quyết định"], "Câu điều kiện loại 2", "cân nhắc và giải thích quyết định tiêu dùng"],
  ["relationships-culture", "Quan hệ và văn hóa", "관계와 문화", ["kỳ vọng", "phép lịch sự", "xung đột", "truyền thống"], "Gerund/infinitive; câu hỏi đuôi", "trao đổi khác biệt văn hóa và quan hệ"],
  ["learning-growth", "Học tập và phát triển", "학습과 성장", ["chiến lược", "phản hồi", "tiến bộ", "mục tiêu"], "Reported speech cơ bản", "phản ánh tiến bộ và lập kế hoạch học"],
  ["environment-community", "Môi trường và cộng đồng", "환경과 공동체", ["vấn đề địa phương", "giải pháp", "tham gia", "tác động"], "Mệnh đề mục đích và kết quả", "đề xuất hành động cộng đồng"],
  ["b1-independent-mission", "Nhiệm vụ độc lập B1", "B1 독립 미션", ["công việc", "dịch vụ", "quan điểm", "giải pháp"], "Tổng hợp B1", "xử lý độc lập các tình huống quen thuộc và bất ngờ"],
];

const b2: UnitSeed[] = [
  ["nuanced-identity", "Bản sắc và cách thể hiện", "정체성과 표현", ["bản sắc", "giọng điệu", "ấn tượng", "bối cảnh"], "Discourse markers; emphasis", "điều chỉnh cách thể hiện theo người nghe"],
  ["professional-impact", "Ảnh hưởng trong công việc", "직업적 영향력", ["đàm phán", "thuyết phục", "lãnh đạo", "rủi ro"], "Câu điều kiện hỗn hợp; hedging", "thuyết phục và thương lượng có sắc thái"],
  ["complex-narratives", "Kể chuyện phức hợp", "복합 서사", ["góc nhìn", "cao trào", "nguyên nhân", "hệ quả"], "Narrative tenses nâng cao", "kể chuyện mạch lạc với nhiều góc nhìn"],
  ["evidence-arguments", "Lập luận dựa trên bằng chứng", "근거 기반 논증", ["luận điểm", "bằng chứng", "phản biện", "kết luận"], "Cleft sentences; concession", "xây dựng và phản biện lập luận"],
  ["global-media", "Truyền thông toàn cầu", "글로벌 미디어", ["thiên kiến", "nguồn tin", "khung diễn giải", "độ tin cậy"], "Reporting structures nâng cao", "đánh giá nguồn và tóm tắt quan điểm"],
  ["science-technology", "Khoa học và công nghệ", "과학과 기술", ["đổi mới", "đạo đức", "dữ liệu", "tác động"], "Nominalisation nhập môn", "giải thích vấn đề kỹ thuật cho nhiều đối tượng"],
  ["society-policy", "Xã hội và chính sách", "사회와 정책", ["chính sách", "công bằng", "đánh đổi", "thay đổi"], "Passive/reporting nâng cao", "thảo luận đánh đổi xã hội cân bằng"],
  ["intercultural-work", "Làm việc liên văn hóa", "다문화 협업", ["chuẩn mực", "hiểu lầm", "hợp tác", "điều chỉnh"], "Pragmatic softening", "xử lý hiểu lầm và xây dựng đồng thuận"],
  ["academic-professional-writing", "Viết học thuật và nghề nghiệp", "학술·직업 글쓰기", ["cấu trúc", "tóm tắt", "đề xuất", "biên tập"], "Cohesion và complex noun phrases", "viết văn bản rõ ràng, có cấu trúc"],
  ["b2-fluent-mission", "Nhiệm vụ tự chủ B2", "B2 자율 미션", ["lập luận", "thương lượng", "tổng hợp", "thuyết trình"], "Tổng hợp B2", "giao tiếp tự chủ, linh hoạt và có sắc thái"],
];

function level(id: "A2" | "B1" | "B2", seeds: UnitSeed[], prerequisiteLevel: "A1" | "A2" | "B1", outcome: string) {
  let previous: string | undefined;
  const units = seeds.map((seed, i) => {
    const result = unit(id, i + 1, seed, previous);
    previous = result.lessons.at(-1)!.id;
    return result;
  });
  return {
    id,
    prerequisiteLevel,
    units,
    outcome,
    canDo: [
      `Có thể giao tiếp ở mức ${id} trong tình huống đời sống.`,
      `Có thể hiểu ý chính của ngữ liệu phù hợp mức ${id}.`,
      `Có thể viết và nói có tổ chức với độ độc lập phù hợp mức ${id}.`,
    ],
  };
}

export const curriculumMap: CurriculumMap = curriculumMapSchema.parse([
  level("A2", a2, "A1", "Giao tiếp trong các tình huống thường ngày, chia sẻ trải nghiệm và kế hoạch."),
  level("B1", b1, "A2", "Hoạt động độc lập trong phần lớn tình huống quen thuộc và giải thích quan điểm."),
  level("B2", b2, "B1", "Giao tiếp tự chủ, chi tiết và có sắc thái trong đời sống, học tập và công việc."),
]);
