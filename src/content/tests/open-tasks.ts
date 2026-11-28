/**
 * Open writing and speaking tasks, graded by AI. Each task practises one
 * lesson (`focus`), so a weak answer points back to that lesson.
 */
export type OpenTask = {
  id: string;
  level: "A1" | "A2";
  mode: "write" | "speak";
  /** What to do, in Vietnamese. */
  task: string;
  /** A start or useful words, in English. */
  hint: string;
  minWords: number;
  focus: string;
};

const t = (level: "A1" | "A2", mode: "write" | "speak", id: string, focus: string, minWords: number, task: string, hint: string): OpenTask => ({
  id: `${level.toLowerCase()}-${mode}-${id}`,
  level,
  mode,
  task,
  hint,
  minWords,
  focus,
});

export const OPEN_TASKS: OpenTask[] = [
  // A1 writing
  t("A1", "write", "intro", "be-present", 15, "Viết 3 câu giới thiệu bản thân: tên, tuổi, quê ở đâu, làm nghề gì.", "My name is … I am … years old. I am from …"),
  t("A1", "write", "family", "possessives", 15, "Viết 3 câu về gia đình bạn: có mấy người, họ tên gì, làm nghề gì.", "There are … people in my family. My father is …"),
  t("A1", "write", "room", "there-is-are", 15, "Tả phòng ngủ của bạn: trong phòng có những gì, ở đâu.", "There is a … in my room. There are … The lamp is on …"),
  t("A1", "write", "day", "present-simple", 20, "Viết về một ngày bình thường của bạn: mấy giờ dậy, làm gì, mấy giờ đi ngủ.", "I get up at … I go to work by … In the evening, I …"),
  t("A1", "write", "friend", "present-simple", 15, "Viết 3 câu về một người bạn thân: bạn ấy làm gì, thích gì, sống ở đâu.", "My best friend is … She works … She likes …"),
  t("A1", "write", "habits", "frequency-adverbs", 15, "Viết 3 câu về thói quen của bạn, dùng always, usually, sometimes hoặc never.", "I always … I usually … I never …"),
  t("A1", "write", "can", "can", 15, "Viết 3 câu về những việc bạn làm được và không làm được.", "I can … but I can't … Can you …?"),
  t("A1", "write", "now", "present-continuous", 15, "Nhìn quanh bạn lúc này: viết 3 câu về những gì mọi người đang làm.", "My brother is … Some people are … I am …"),
  t("A1", "write", "weekend", "past-simple-irregular", 20, "Viết về cuối tuần trước của bạn: đi đâu, làm gì, ăn gì.", "Last weekend I went to … I ate … It was …"),
  t("A1", "write", "plan", "going-to", 15, "Viết 3 câu về kế hoạch của bạn cho tuần sau.", "Next week I'm going to … On Saturday, we're going to …"),
  t("A1", "write", "order", "would-like", 12, "Bạn đang ở quán cà phê. Viết lời gọi đồ uống và đồ ăn thật lịch sự.", "I'd like … , please. Could I have …?"),
  t("A1", "write", "likes", "like-ing", 15, "Viết 3 câu về những việc bạn thích và không thích làm lúc rảnh.", "I love … I like … I don't like … I hate …"),
  // A1 speaking
  t("A1", "speak", "intro", "be-present", 12, "Giới thiệu bản thân: tên, tuổi, quê, công việc.", "My name is … I'm from … I'm a …"),
  t("A1", "speak", "family", "possessives", 12, "Kể về gia đình bạn trong 3 câu.", "There are … people in my family. My mother is …"),
  t("A1", "speak", "morning", "present-simple", 12, "Kể buổi sáng thường ngày của bạn.", "I get up at … Then I … I have breakfast …"),
  t("A1", "speak", "home", "there-is-are", 12, "Tả nhà bạn: có mấy phòng, có gì.", "There are … rooms. There is a … in the kitchen."),
  t("A1", "speak", "food", "like-ing", 10, "Bạn thích món ăn nào nhất? Vì sao?", "My favorite food is … I like it because …"),
  t("A1", "speak", "yesterday", "past-simple-regular", 12, "Hôm qua bạn đã làm gì?", "Yesterday I worked … I watched … I cooked …"),
  t("A1", "speak", "skills", "can", 10, "Bạn làm được những việc gì? Không làm được việc gì?", "I can swim, but I can't …"),
  t("A1", "speak", "plans", "going-to", 10, "Tối nay hoặc cuối tuần này bạn định làm gì?", "Tonight I'm going to … This weekend …"),
  t("A1", "speak", "directions", "prepositions-place", 10, "Chỉ đường cho khách từ nhà bạn ra quán cà phê gần nhất.", "Go straight. Turn left. The café is next to …"),
  t("A1", "speak", "questions", "question-words", 8, "Đặt 3 câu hỏi để làm quen với một người mới gặp.", "What do you do? Where do you live? How old …?"),
  t("A1", "speak", "weather", "present-continuous", 8, "Tả thời tiết và những gì đang diễn ra ngoài đường lúc này.", "It's raining. People are …"),
  t("A1", "speak", "invite", "would-like", 8, "Mời một người bạn đi uống cà phê cuối tuần.", "Would you like to … ? Let's …"),
  // A2 writing
  t("A2", "write", "story", "past-simple-vs-continuous", 30, "Kể một chuyện bất ngờ đã xảy ra với bạn: lúc đó bạn đang làm gì thì chuyện gì xảy ra?", "I was … when … While I was …, …"),
  t("A2", "write", "childhood", "used-to", 25, "Viết về hồi nhỏ của bạn: ngày trước bạn hay làm gì mà bây giờ không còn nữa?", "When I was a child, I used to … I didn't use to …"),
  t("A2", "write", "travel", "present-perfect-experience", 25, "Viết về những nơi bạn đã từng đến và một nơi bạn chưa bao giờ đến nhưng muốn đi.", "I've been to … I've never been to … but …"),
  t("A2", "write", "job", "present-perfect-for-since", 25, "Viết về công việc hoặc việc học hiện tại: bạn làm, học ở đó bao lâu rồi, từ khi nào?", "I've worked at … for … I've lived in … since …"),
  t("A2", "write", "future", "will-vs-going-to", 25, "Viết về kế hoạch năm sau của bạn và một điều bạn đoán sẽ xảy ra.", "Next year I'm going to … I think … will …"),
  t("A2", "write", "if", "first-conditional", 25, "Cuối tuần này trời có thể mưa hoặc nắng. Viết bạn sẽ làm gì trong mỗi trường hợp.", "If it rains, I'll … If it's sunny, …"),
  t("A2", "write", "compare", "comparatives", 25, "So sánh Hà Nội với Sài Gòn (hoặc quê bạn với thành phố): thời tiết, giá cả, cuộc sống.", "Hanoi is colder than … Life in … is more … than …"),
  t("A2", "write", "best", "superlatives", 20, "Viết về chuyến đi đẹp nhất hoặc món ăn ngon nhất bạn từng có.", "The best trip I've ever had was … It was the most …"),
  t("A2", "write", "advice", "should", 25, "Một người bạn hay mất ngủ. Viết 3 lời khuyên cho bạn ấy.", "You should … You shouldn't … I think you should …"),
  t("A2", "write", "rules", "must-have-to", 25, "Viết về quy định ở nơi bạn làm việc hoặc học: phải làm gì, không được làm gì, không cần làm gì.", "We have to … We mustn't … We don't have to …"),
  t("A2", "write", "email", "could-requests", 25, "Viết email ngắn nhờ đồng nghiệp gửi giúp một tài liệu và hỏi xin họp vào chiều thứ Sáu.", "Hi …, Could you … ? Would you mind … ? Thanks, …"),
  t("A2", "write", "person", "relative-clauses", 25, "Tả một người bạn quý trọng, dùng who hoặc that.", "She is a person who … He's the friend that …"),
  // A2 speaking
  t("A2", "speak", "story", "past-continuous", 20, "Kể lại một lần bạn gặp chuyện xui khi đang đi đường.", "I was riding my motorbike when … While I was …"),
  t("A2", "speak", "change", "used-to", 15, "Cuộc sống của bạn khác 10 năm trước như thế nào?", "I used to … but now I … I didn't use to …"),
  t("A2", "speak", "experience", "present-perfect-experience", 15, "Kể một việc thú vị bạn đã từng làm, và nói nó xảy ra khi nào.", "I've … once. I did it in … It was …"),
  t("A2", "speak", "done", "present-perfect-just-yet", 12, "Hôm nay bạn đã làm xong những việc gì, còn việc gì chưa làm?", "I've already … I've just … I haven't … yet."),
  t("A2", "speak", "tomorrow", "present-for-future", 12, "Ngày mai bạn có những lịch hẹn nào?", "Tomorrow I'm meeting … At three I'm …"),
  t("A2", "speak", "predict", "will-future", 12, "Bạn nghĩ 10 năm nữa Việt Nam sẽ thay đổi thế nào?", "I think there will be … People will probably …"),
  t("A2", "speak", "if", "first-conditional", 12, "Nếu được nghỉ một tuần, bạn sẽ làm gì?", "If I have a week off, I'll …"),
  t("A2", "speak", "phones", "as-as", 12, "So sánh điện thoại hiện tại với điện thoại cũ của bạn.", "My new phone is faster than … It isn't as … as …"),
  t("A2", "speak", "health", "should", 12, "Một người hay bị đau lưng vì ngồi nhiều. Hãy khuyên họ.", "You should … You shouldn't … Maybe you could …"),
  t("A2", "speak", "maybe", "might-may", 12, "Cuối tuần này bạn chưa có kế hoạch rõ ràng. Nói những gì bạn có thể sẽ làm.", "I might … I may … Maybe I'll …"),
  t("A2", "speak", "hobby", "verb-ing-to", 12, "Nói về sở thích của bạn và một việc bạn muốn học.", "I enjoy … I'd like to learn to … I want to …"),
  t("A2", "speak", "opinion", "linking-words", 15, "Bạn thích sống ở thành phố hay ở quê? Giải thích lý do.", "I prefer … because … but … so …"),
];
