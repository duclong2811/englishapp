/**
 * Open writing and speaking tasks, graded by AI. Each task practises one
 * lesson (`focus`), so a weak answer points back to that lesson.
 */
export type OpenTask = {
  id: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  mode: "write" | "speak";
  /** What to do, in Vietnamese. */
  task: string;
  /** A start or useful words, in English. */
  hint: string;
  minWords: number;
  focus: string;
};

const t = (level: "A1" | "A2" | "B1" | "B2" | "C1", mode: "write" | "speak", id: string, focus: string, minWords: number, task: string, hint: string): OpenTask => ({
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
// B1 writing (graded by the standard model, see docs/ai-policy.md)
  t("B1", "write", "news", "past-perfect", 50, "Kể lại một ngày mọi chuyện đều trục trặc: lúc bạn đến nơi thì chuyện gì đã xảy ra rồi?", "When I got to …, the … had already … I realized I had …"),
  t("B1", "write", "lately", "present-perfect-continuous", 45, "Viết email cho một người bạn lâu ngày không gặp: dạo này bạn đang làm gì, học gì, bao lâu rồi?", "Hi …, I've been … for … Lately I've been …"),
  t("B1", "write", "town", "would-used-to", 50, "Quê bạn ngày xưa khác bây giờ thế nào? Kể những thói quen của người dân ngày trước.", "When I was young, people used to … Every Tet, we would … Now I'm used to …"),
  t("B1", "write", "review", "passive-basics", 50, "Viết đoạn giới thiệu một món ăn hoặc đặc sản quê bạn: nó được làm thế nào, từ gì, ăn với gì.", "Banh chung is made from … It is wrapped in … It is usually eaten …"),
  t("B1", "write", "lottery", "second-conditional", 50, "Nếu bạn có một năm nghỉ được trả lương, bạn sẽ làm gì? Giải thích lý do.", "If I had a year off, I would … because … I could also …"),
  t("B1", "write", "regret", "third-conditional", 50, "Kể một quyết định trong quá khứ mà bạn tiếc. Nếu chọn khác thì điều gì đã xảy ra?", "If I had …, I would have … I wish I had …"),
  t("B1", "write", "message", "reported-statements", 45, "Bạn nhận một cuộc gọi cho đồng nghiệp đi vắng. Viết lời nhắn kể lại người gọi đã nói gì, hỏi gì, nhờ gì.", "Mr Nam called. He said that … He asked if … He asked you to …"),
  t("B1", "write", "mystery", "modals-deduction", 45, "Hàng xóm bạn đi vắng cả tuần, cửa đóng, thư chất đầy. Viết những phỏng đoán của bạn.", "They must be … They might have … They can't be …"),
  t("B1", "write", "complaint", "indirect-questions", 50, "Viết email lịch sự hỏi khách sạn về phòng, giá và dịch vụ cho chuyến đi sắp tới.", "Dear …, Could you tell me whether … I would like to know how much …"),
  t("B1", "write", "advice", "modals-past", 45, "Một người bạn vừa trượt phỏng vấn xin việc. Viết cho họ: lẽ ra nên làm gì, không nên làm gì.", "You should have … You shouldn't have … You could have …"),
  t("B1", "write", "opinion", "contrast-purpose", 60, "Mạng xã hội tốt hay xấu cho người trẻ? Viết đoạn văn nêu cả hai mặt.", "Although social media …, … Despite …, … However, … so that …"),
  t("B1", "write", "rules", "verb-object-infinitive", 45, "Ngày nhỏ bố mẹ bắt bạn làm gì và cho phép bạn làm gì? Bạn có muốn con mình làm giống vậy không?", "My parents made me … They let me … I want my children to …"),
  // B1 speaking
  t("B1", "speak", "trip", "past-perfect", 35, "Kể về một chuyến đi mà bạn đến muộn hoặc lỡ điều gì đó.", "By the time we arrived, … had already … because I had …"),
  t("B1", "speak", "habit", "present-perfect-continuous", 30, "Bạn đang theo đuổi thói quen hay sở thích nào? Bắt đầu từ bao giờ?", "I've been … since … I've been trying to …"),
  t("B1", "speak", "childhood", "would-used-to", 35, "Kể về Tết hồi bạn còn nhỏ.", "Every Tet, my family would … We used to … I'm not used to … anymore."),
  t("B1", "speak", "city", "passive-more", 30, "Thành phố của bạn đang thay đổi thế nào? Những gì đang được xây, đã được làm?", "A new metro is being built … Many old houses have been …"),
  t("B1", "speak", "dream", "second-conditional", 30, "Nếu được sống ở bất kỳ nước nào, bạn chọn nước nào? Vì sao?", "If I could live anywhere, I would … because …"),
  t("B1", "speak", "wish", "wish", 30, "Bạn ước điều gì về cuộc sống hiện tại, và tiếc điều gì đã qua?", "I wish I had more … I wish I had … when I was …"),
  t("B1", "speak", "conversation", "reported-statements", 30, "Kể lại một cuộc trò chuyện thú vị gần đây: người kia đã nói và hỏi gì?", "My friend told me that … She asked me if … I said …"),
  t("B1", "speak", "guess", "modals-deduction", 25, "Nhìn quanh bạn: đoán xem những người xung quanh đang làm gì, cảm thấy thế nào.", "That man must be … She might be … They can't be …"),
  t("B1", "speak", "mistake", "modals-past", 30, "Kể một lần bạn mắc sai lầm. Lẽ ra bạn nên làm gì?", "I should have … I shouldn't have … I could have …"),
  t("B1", "speak", "directions", "indirect-questions", 25, "Bạn lạc ở một thành phố lạ. Hỏi đường và hỏi thông tin thật lịch sự.", "Excuse me, could you tell me where … Do you know if …"),
  t("B1", "speak", "success", "could-able-to", 30, "Kể về một việc khó mà cuối cùng bạn đã làm được.", "It was difficult, but I managed to … I was able to … because …"),
  t("B1", "speak", "debate", "contrast-purpose", 35, "Nên học đại học hay đi làm sớm? Nêu ý kiến của bạn và lý do.", "Although university is …, … Despite …, I think … in order to …"),
  // B2 writing (graded by the standard model, see docs/ai-policy.md)
  t("B2", "write", "milestone", "future-perfect", 70, "Năm năm nữa bạn sẽ đạt được những gì? Viết về công việc, việc học và cuộc sống của bạn lúc đó.", "In five years, I will have … By then, I'll have been … for …"),
  t("B2", "write", "story", "narrative-tenses", 80, "Kể lại một chuyến đi đáng nhớ có chuyện bất ngờ xảy ra. Dùng nhiều thì quá khứ.", "We had been driving for … when … It was raining and we had forgotten …"),
  t("B2", "write", "news", "passive-reporting", 70, "Viết một bản tin ngắn về một sự kiện ở thành phố bạn (khai trương, tai nạn, lễ hội) mà không nêu nguồn tin.", "It is reported that … The new … is expected to … It is believed that …"),
  t("B2", "write", "meeting", "reporting-verbs", 70, "Viết biên bản ngắn kể lại một cuộc họp: ai đề xuất, ai từ chối, ai hứa làm gì.", "Ms Lan suggested … Mr Nam refused to … Everyone agreed to … He promised to …"),
  t("B2", "write", "turning-point", "mixed-conditionals", 70, "Một quyết định trong quá khứ đã thay đổi cuộc sống hiện tại của bạn thế nào? Nếu chọn khác thì giờ ra sao?", "If I hadn't …, I wouldn't be … now. If I were more …, I would have …"),
  t("B2", "write", "complaint", "conditional-inversion", 80, "Viết email trang trọng phàn nàn về một dịch vụ kém và yêu cầu giải quyết.", "Dear …, Had I known …, I would … Should you require …, please …"),
  t("B2", "write", "mystery", "past-deduction", 70, "Bạn về nhà và thấy cửa mở, đồ đạc lộn xộn. Viết những phỏng đoán về chuyện đã xảy ra.", "Someone must have … They can't have … It might have been …"),
  t("B2", "write", "city-guide", "participle-clauses", 70, "Viết đoạn giới thiệu một địa danh ở Việt Nam cho du khách nước ngoài.", "Built in …, the … is … Walking along …, visitors can … Having seen …"),
  t("B2", "write", "lesson", "cleft-sentences", 70, "Điều quan trọng nhất bạn học được từ một người thầy hay người bạn là gì?", "What I learned from … was … It was … who taught me … What matters most is …"),
  t("B2", "write", "essay", "linking-contrast", 90, "Làm việc ở nhà hay ở văn phòng tốt hơn? Viết bài luận ngắn nêu hai mặt và kết luận.", "Working from home is …, whereas … Even though … Nevertheless, …"),
  t("B2", "write", "report", "linking-cause", 80, "Vì sao nhiều người trẻ chuyển lên thành phố sống? Nêu nguyên nhân và hậu quả.", "Due to …, many young people … As a result, … Consequently, …"),
  t("B2", "write", "services", "causative-advanced", 60, "Bạn sắp chuyển nhà. Viết cho bạn bè những việc bạn đã thuê người làm và nhờ người khác làm.", "I'm having the walls painted … I got my brother to … I had my … repaired"),
  // B2 speaking
  t("B2", "speak", "plans", "future-perfect", 45, "Cuối năm nay bạn sẽ làm xong những việc gì? Kể kế hoạch của bạn.", "By the end of the year, I'll have … By then, I'll have been …"),
  t("B2", "speak", "change-of-plan", "future-in-past", 40, "Kể về một kế hoạch bạn định làm nhưng cuối cùng không thực hiện.", "I was going to … but … I was about to … when …"),
  t("B2", "speak", "rumour", "passive-reporting", 40, "Kể lại một tin đồn hoặc điều người ta hay nói về quê bạn.", "It is said that … People are believed to … It's thought that …"),
  t("B2", "speak", "advice-given", "reporting-verbs", 40, "Kể lại những lời khuyên quan trọng mà bố mẹ hay thầy cô từng cho bạn.", "My father advised me to … My teacher warned me not to … She suggested …"),
  t("B2", "speak", "preferences", "would-rather", 40, "Bạn thích sống ở thành phố lớn hay thị trấn nhỏ? Bạn muốn người thân thay đổi điều gì?", "I'd rather live in … I'd rather my family … It's time I … I wish … would …"),
  t("B2", "speak", "missing", "past-deduction", 35, "Một đồng nghiệp không đến họp và không nghe máy. Đoán xem chuyện gì đã xảy ra.", "She must have … She might have … She can't have …"),
  t("B2", "speak", "rules", "need-supposed", 35, "Kể về những quy định ở nơi bạn làm việc hoặc học tập: điều gì phải làm, điều gì không được làm.", "We're supposed to … We aren't supposed to … I needn't have …"),
  t("B2", "speak", "future-city", "likelihood", 40, "Mười năm nữa thành phố của bạn sẽ thay đổi thế nào? Điều gì chắc chắn, điều gì khó xảy ra?", "Prices are likely to … The city is bound to … It's unlikely that …"),
  t("B2", "speak", "best-experience", "inversion-emphasis", 35, "Kể về trải nghiệm tuyệt vời nhất của bạn bằng những câu nhấn mạnh.", "Never have I … Not only was it …, but … Rarely do I …"),
  t("B2", "speak", "values", "whatever-however", 35, "Nói về những nguyên tắc bạn luôn giữ, dù hoàn cảnh thế nào.", "Whatever happens, I … However busy I am, I … No matter what …"),
  t("B2", "speak", "comparison", "linking-contrast", 40, "So sánh cuộc sống của ông bà bạn ngày trước với cuộc sống của bạn bây giờ.", "My grandparents …, whereas I … Even though … Nevertheless, …"),
  t("B2", "speak", "habits", "verb-patterns-advanced", 35, "Có thói quen nào bạn muốn bỏ? Điều gì ngăn bạn thay đổi?", "Nothing can stop me from … I insist on … I look forward to …"),
  // C1 writing (graded by the standard model with the B2 rules, see docs/ai-policy.md)
  t("C1", "write", "announcement", "formal-future", 80, "Viết thông báo chính thức của công ty về một thay đổi sắp tới (giờ làm, văn phòng mới, chính sách mới).", "Dear all, The office is to move … Staff are to … The new policy is set to …"),
  t("C1", "write", "request", "distancing", 80, "Viết email rất lịch sự xin sếp cho bạn làm việc từ xa hai ngày mỗi tuần.", "Dear …, I was wondering if … I had hoped to … Would it be possible …"),
  t("C1", "write", "proposal", "subjunctive", 90, "Viết đề xuất gửi ban giám đốc về cách cải thiện môi trường làm việc.", "I recommend that the company … It is essential that every employee … I suggest that …"),
  t("C1", "write", "gratitude", "were-it-not-for", 80, "Viết thư cảm ơn một người đã thay đổi cuộc đời bạn.", "Had it not been for you, I would never have … If it weren't for your advice, I …"),
  t("C1", "write", "turning-points", "inversion-advanced", 90, "Kể về một khoảnh khắc bạn chợt nhận ra điều quan trọng trong cuộc sống. Dùng câu nhấn mạnh.", "Not until … did I realize … Only when … did I … So … was … that …"),
  t("C1", "write", "report", "nominalisation", 100, "Viết đoạn báo cáo ngắn về xu hướng mua sắm trực tuyến ở Việt Nam, văn phong trang trọng.", "There has been a sharp rise in … The introduction of … has led to a significant increase in …"),
  t("C1", "write", "essay", "hedging", 120, "Trí tuệ nhân tạo sẽ lấy mất việc làm của con người? Viết đoạn luận văn thận trọng, có lập luận hai chiều.", "It could be argued that … AI tends to … To some extent, … This may well …"),
  t("C1", "write", "review", "emphasis-devices", 90, "Viết bài đánh giá một quyển sách hoặc bộ phim bạn rất thích, có nhấn mạnh cảm xúc.", "This is by far the best … I did enjoy … The very first scene …"),
  t("C1", "write", "argument", "discourse-markers", 110, "Có nên cấm xe máy ở trung tâm thành phố? Viết đoạn văn có lập luận rõ ràng.", "Admittedly, … That said, … To be fair, … All in all, …"),
  t("C1", "write", "profile", "participle-advanced", 90, "Viết đoạn giới thiệu một người nổi tiếng hoặc người thân bạn ngưỡng mộ.", "Born in …, she … Having been told …, she … With … , she …"),
  t("C1", "write", "advice", "modals-advanced", 80, "Một người bạn không biết nên ở lại công ty cũ hay chuyển việc. Viết lời khuyên cho họ.", "You may well … You might as well … I'd sooner … than …"),
  t("C1", "write", "comparison", "comparison-advanced", 100, "So sánh cuộc sống ở Việt Nam bây giờ với 20 năm trước.", "Life is considerably … Prices are three times as … The more …, the more … It's nowhere near as …"),
  // C1 speaking
  t("C1", "speak", "news", "formal-future", 50, "Bạn là phát thanh viên. Đọc một bản tin ngắn về một sự kiện sắp diễn ra ở thành phố bạn.", "The festival is to open on … Organizers are set to … Thousands are expected to …"),
  t("C1", "speak", "favor", "distancing", 45, "Nhờ một đồng nghiệp làm thay bạn một việc quan trọng, thật lịch sự.", "I was wondering if you could … I was hoping you might … Would you mind …"),
  t("C1", "speak", "imagine", "as-if", 50, "Giả sử bạn có thể sống ở bất kỳ thời đại nào trong lịch sử. Bạn chọn thời nào và cuộc sống ra sao?", "Suppose I lived in … Imagine … I'd feel as if …"),
  t("C1", "speak", "regrets", "perfect-infinitive", 45, "Kể về một điều bạn rất muốn đã làm khi còn trẻ.", "I'd love to have … I regret not having … I seem to have …"),
  t("C1", "speak", "debate", "hedging", 50, "Học online có tốt bằng học trên lớp không? Nêu ý kiến thận trọng, có cân nhắc.", "It could be argued that … Students tend to … To some extent …"),
  t("C1", "speak", "opinion", "noun-clauses", 45, "Theo bạn, điều gì quan trọng nhất để có một cuộc sống hạnh phúc?", "What matters most is … The fact that … Whether … depends on …"),
  t("C1", "speak", "contrast", "fronting", 45, "Kể về một nơi hoặc một người bạn yêu quý dù có nhiều điểm không hoàn hảo.", "Much as I love …, … Strange as it may seem, … Gone are the days when …"),
  t("C1", "speak", "story", "participle-advanced", 50, "Kể một câu chuyện bất ngờ xảy ra khi bạn đang đi du lịch.", "Having arrived …, we … Not knowing …, I … With everyone …"),
  t("C1", "speak", "feelings", "verb-complement", 45, "Bạn ghét và trân trọng điều gì nhất khi làm việc nhóm?", "I resent being … I really appreciate people … I find it …"),
  t("C1", "speak", "decision", "modals-advanced", 40, "Trời mưa to và bạn đã lỡ chuyến xe. Bạn sẽ làm gì? Nói cả cảm xúc lúc đó.", "I might as well … It may well … I could have done with …"),
  t("C1", "speak", "precautions", "purpose-advanced", 40, "Kể những thói quen bạn làm để tránh rắc rối khi đi xa.", "I always … in case … I … so as not to … for fear of …"),
  t("C1", "speak", "change", "comparison-advanced", 45, "Thành phố bạn sống đã thay đổi thế nào trong mười năm qua?", "It's considerably … Traffic is twice as … The more …, the … It's all the more …"),
];
