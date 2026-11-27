/** Speaking practice situations for A1 learners. Each one reuses words from a vocabulary topic. */
export type Scenario = {
  id: string;
  title: string;
  description: string;
  /** What the learner tries to do, shown before starting (Vietnamese). */
  goal: string;
  /** Vocabulary topic whose words the AI should use. */
  topicIds: string[];
  /** Who the AI plays and the setting, in English for the model. */
  aiRole: string;
  learnerRole: string;
  setting: string;
  /** First line, said by the AI. Static so the conversation starts instantly. */
  opening: string;
  /** Example answers the learner can tap if stuck on the first turn. */
  starters: string[];
};

export const SCENARIOS: Scenario[] = [
  {
    id: "meet",
    title: "Làm quen",
    description: "Chào hỏi và giới thiệu bản thân với một người bạn mới.",
    goal: "Nói tên, quê, công việc hoặc việc học của bạn, và hỏi lại người kia.",
    topicIds: ["greetings", "family"],
    aiRole: "Mai, a friendly new member of an English club",
    learnerRole: "another member meeting Mai for the first time",
    setting: "the first meeting of a small English club in a cafe",
    opening: "Hi! I'm Mai. I'm new here. What's your name?",
    starters: ["Hi Mai, my name is Nam.", "Nice to meet you. I'm Lan."],
  },
  {
    id: "cafe",
    title: "Gọi đồ ở quán cà phê",
    description: "Gọi đồ uống, đồ ăn và hỏi giá.",
    goal: "Gọi một đồ uống và một món ăn, hỏi giá rồi trả tiền.",
    topicIds: ["food", "numbers"],
    aiRole: "a friendly waiter at Sunny Cafe",
    learnerRole: "a customer",
    setting: "a small cafe in the morning",
    opening: "Hello! Welcome to Sunny Cafe. What would you like to drink?",
    starters: ["Can I have a coffee, please?", "I'd like an orange juice."],
  },
  {
    id: "family",
    title: "Nói về gia đình",
    description: "Kể về các thành viên trong gia đình bạn.",
    goal: "Nói gia đình bạn có mấy người, họ làm gì và bao nhiêu tuổi.",
    topicIds: ["family", "work"],
    aiRole: "a friend who is showing a family photo",
    learnerRole: "a friend talking about their own family",
    setting: "two friends chatting after class",
    opening: "This is a photo of my family. Do you have any brothers or sisters?",
    starters: ["Yes, I have one brother.", "No, I don't. I'm an only child."],
  },
  {
    id: "day",
    title: "Một ngày của bạn",
    description: "Kể về thói quen hằng ngày và giờ giấc.",
    goal: "Nói mấy giờ bạn dậy, đi làm hoặc đi học, ăn uống và đi ngủ.",
    topicIds: ["daily-routine", "time-of-day"],
    aiRole: "a curious friend",
    learnerRole: "a friend describing their daily routine",
    setting: "a relaxed chat on a weekday evening",
    opening: "You always look busy! What time do you usually get up?",
    starters: ["I usually get up at six.", "I get up at seven o'clock."],
  },
  {
    id: "shopping",
    title: "Mua quần áo",
    description: "Hỏi cỡ, màu, giá và chọn đồ.",
    goal: "Tìm một món đồ, hỏi cỡ và màu, hỏi giá rồi quyết định mua.",
    topicIds: ["clothes-shopping", "colors-shapes"],
    aiRole: "a helpful shop assistant in a clothes shop",
    learnerRole: "a customer looking for clothes",
    setting: "a clothes shop on a Saturday",
    opening: "Hi there! Can I help you? Are you looking for something?",
    starters: ["Yes, I'm looking for a T-shirt.", "Do you have this jacket in blue?"],
  },
  {
    id: "directions",
    title: "Hỏi đường",
    description: "Hỏi đường đến nhà ga, ngân hàng hoặc quán ăn.",
    goal: "Hỏi một địa điểm ở đâu, hiểu cách chỉ đường và cảm ơn.",
    topicIds: ["places-directions", "transport-city"],
    aiRole: "a kind local person on the street",
    learnerRole: "a visitor who is lost in the city",
    setting: "a busy street in the city center",
    opening: "Hi! You look a little lost. Can I help you?",
    starters: ["Excuse me, where is the train station?", "Yes, please. Is there a bank near here?"],
  },
  {
    id: "free-time",
    title: "Cuối tuần và sở thích",
    description: "Nói về sở thích, thể thao, âm nhạc và phim ảnh.",
    goal: "Kể bạn thích làm gì vào cuối tuần và rủ người kia đi chơi.",
    topicIds: ["free-time", "feelings"],
    aiRole: "a friend planning the weekend",
    learnerRole: "a friend talking about hobbies",
    setting: "a Friday afternoon chat",
    opening: "It's Friday! What do you like to do on the weekend?",
    starters: ["I like to watch movies.", "I usually play football with my friends."],
  },
  {
    id: "weather",
    title: "Thời tiết và các mùa",
    description: "Nói về thời tiết hôm nay và mùa bạn thích.",
    goal: "Mô tả thời tiết, nói mùa bạn thích và lý do.",
    topicIds: ["nature-weather", "calendar"],
    aiRole: "a neighbor",
    learnerRole: "a neighbor",
    setting: "two neighbors meeting outside their building",
    opening: "Good morning! It's so hot today. Do you like hot weather?",
    starters: ["No, I don't. I like cool weather.", "Yes, I love summer."],
  },
];

export function getScenario(id: string) {
  return SCENARIOS.find((s) => s.id === id);
}
