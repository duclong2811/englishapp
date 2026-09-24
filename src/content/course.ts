import { courseSchema, type Lesson } from "@/lib/curriculum/schema";

const ex = (en: string, ko: string, context = "일상", vi?: string) => ({ en, ko, context, ...(vi ? { vi } : {}) });
const vocab = (id: string, headword: string, definitionKo: string, collocations: string[], example: [string, string], partOfSpeech = "phrase") => ({
  id, headword, partOfSpeech, definitionKo, definitionVi: undefined, ipaUs: "/—/", ipaUk: "/—/", audio: { us: null, uk: null },
  inflections: [], collocations, register: "neutral" as const, topics: ["everyday"], cefr: "A1",
  examples: [ex(example[0], example[1])], commonMistakes: [], confusedWith: [],
});
const grammar = (id: string, title: string, explanationKo: string, easierKo: string, form: string, examples: ReturnType<typeof ex>[]) => ({
  id, title, level: "A1", prerequisites: [], explanationKo, easierKo, explanationVi: "Phần giải thích tiếng Việt hỗ trợ điểm ngữ pháp này bằng câu ngắn và ví dụ rõ ràng.",
  form, usage: ["실제 대화에서 자신이나 일상을 말할 때 써요."], limitations: ["주어와 동사의 형태를 맞춰야 해요."],
  contrasts: ["비슷한 표현과 비교하며 문맥에 맞게 선택해요."], commonMistakes: ["한국어 어순을 그대로 옮기지 않아요."],
  examplesByPurpose: { basic: examples },
});

const intro: Lesson = {
  id: "introducing-yourself", number: 1, title: "나를 소개하기", titleEn: "Introducing yourself", duration: 22,
  situation: "새로운 동료를 처음 만나 짧고 자연스럽게 인사하고 자신을 소개합니다.", prerequisites: [],
  objectives: [
    { id: "intro-name", text: "이름과 출신을 말할 수 있어요.", skills: ["speaking", "grammar"] },
    { id: "intro-work", text: "하는 일과 관심사를 간단히 말할 수 있어요.", skills: ["vocabulary", "writing"] },
  ],
  dialogue: [
    { speaker: "Mina", en: "Hi, I’m Mina. Nice to meet you.", ko: "안녕하세요, 저는 미나예요. 만나서 반가워요.", vi: "Chào bạn, mình là Mina. Rất vui được gặp bạn." },
    { speaker: "Alex", en: "Nice to meet you, too. I’m Alex. Are you from Seoul?", ko: "저도 반가워요. 저는 Alex예요. 서울에서 왔어요?", vi: "Mình cũng rất vui. Mình là Alex. Bạn đến từ Seoul à?" },
    { speaker: "Mina", en: "Yes, I am. I work in design. How about you?", ko: "네, 맞아요. 디자인 일을 해요. Alex는요?", vi: "Đúng vậy. Mình làm thiết kế. Còn bạn?" },
    { speaker: "Alex", en: "I’m a teacher. I’m interested in music.", ko: "저는 교사예요. 음악에 관심이 있어요.", vi: "Mình là giáo viên. Mình thích âm nhạc." },
  ],
  vocabulary: [
    vocab("v-name", "My name is…", "제 이름은 …입니다", ["my name is Mina"], ["My name is Joon.", "제 이름은 준이에요."]),
    vocab("v-meet", "Nice to meet you", "만나서 반가워요", ["nice to meet you, too"], ["Nice to meet you, Hana.", "만나서 반가워요, 하나 씨."]),
    vocab("v-from", "be from", "… 출신이다", ["from Seoul", "from Vietnam"], ["I’m from Busan.", "저는 부산에서 왔어요."]),
    vocab("v-live", "live in", "…에 살다", ["live in Seoul"], ["I live in Incheon.", "저는 인천에 살아요."], "verb"),
    vocab("v-work", "work in", "… 분야에서 일하다", ["work in design"], ["I work in finance.", "저는 금융 분야에서 일해요."], "verb"),
    vocab("v-how", "How about you?", "당신은요?", ["and how about you"], ["I like tea. How about you?", "저는 차를 좋아해요. 당신은요?"]),
    vocab("v-interested", "be interested in", "…에 관심이 있다", ["interested in music"], ["I’m interested in cooking.", "저는 요리에 관심이 있어요."]),
    vocab("v-too", "too", "…도, 또한", ["me too", "nice to meet you too"], ["I’m from Seoul, too.", "저도 서울에서 왔어요."], "adverb"),
  ],
  grammar: [
    grammar("g-be", "be동사로 나를 말하기", "am은 I와 함께 써요. 이름, 직업, 출신처럼 ‘나는 어떤 사람이다’를 말할 때 사용해요.", "I 다음에는 am을 써요. ‘I am + 정보’로 말해 보세요.", "I am + 명사/형용사/장소", [ex("I’m a designer.", "저는 디자이너예요."), ex("I’m from Seoul.", "저는 서울에서 왔어요.")]),
    grammar("g-question", "Are you…? 질문", "상대방의 정보가 맞는지 확인할 때 Are you…?로 물어요.", "‘당신은 …예요?’는 Are you…?예요.", "Are you + 명사/형용사/from 장소?", [ex("Are you new here?", "여기 처음이세요?"), ex("Are you from Korea?", "한국에서 왔어요?")]),
  ],
  contextExamples: [
    ex("Hi, I’m Sora.", "안녕하세요, 저는 소라예요.", "첫 만남"), ex("My name is Daniel.", "제 이름은 Daniel이에요.", "첫 만남"), ex("Nice to meet you.", "만나서 반가워요.", "첫 만남"), ex("Nice to meet you, too.", "저도 만나서 반가워요.", "첫 만남"), ex("I’m from Daejeon.", "저는 대전에서 왔어요.", "출신"), ex("I live in Seoul now.", "지금은 서울에 살아요.", "거주"), ex("Are you from Busan?", "부산에서 왔어요?", "출신"), ex("Yes, I am.", "네, 맞아요.", "대답"), ex("No, I’m not.", "아니요, 그렇지 않아요.", "대답"), ex("I’m an office worker.", "저는 회사원이에요.", "직업"), ex("I work in marketing.", "저는 마케팅 일을 해요.", "직업"), ex("I’m interested in films.", "저는 영화에 관심이 있어요.", "관심사"), ex("I like hiking, too.", "저도 등산을 좋아해요.", "관심사"), ex("How about you?", "당신은요?", "대화 이어가기"), ex("It was good talking with you.", "이야기해서 좋았어요.", "마무리")
  ],
  guidedExercises: [
    { id: "i1", type: "multiple-choice", prompt: "‘저는 서울에서 왔어요.’에 맞는 문장을 고르세요.", skill: "vocabulary", objectiveId: "intro-name", options: ["I’m from Seoul.", "I live Seoul.", "I from Seoul."], answer: "I’m from Seoul." },
    { id: "i2", type: "fill-blank", prompt: "I ___ interested in music.", skill: "grammar", objectiveId: "intro-work", answer: "am", hint: "I와 함께 쓰는 be동사를 생각해 보세요." },
    { id: "i3", type: "arrange", prompt: "문장을 순서대로 배열하세요: you / meet / Nice / to", skill: "reading", objectiveId: "intro-name", options: ["you", "meet", "Nice", "to"], answer: ["Nice", "to", "meet", "you"] },
  ],
  production: [{ id: "ip", type: "speaking", prompt: "30초 동안 이름, 출신, 하는 일 또는 관심사를 말해 보세요.", skill: "speaking", objectiveId: "intro-work", modelAnswer: "Hi, I’m Joon. I’m from Busan, and I live in Seoul. I work in design. I’m interested in music.", checklist: ["이름을 말했어요", "출신이나 사는 곳을 말했어요", "관심사를 하나 말했어요"] }],
  masteryTest: [
    { id: "im1", type: "multiple-choice", prompt: "처음 만난 사람에게 자연스러운 표현은?", skill: "vocabulary", objectiveId: "intro-name", options: ["Nice to meet you.", "See you yesterday.", "Good night morning."], answer: "Nice to meet you." },
    { id: "im2", type: "fill-blank", prompt: "___ you from Seoul?", skill: "grammar", objectiveId: "intro-name", answer: "Are" },
    { id: "im3", type: "translation", prompt: "‘저는 요리에 관심이 있어요.’를 영어로 쓰세요.", skill: "writing", objectiveId: "intro-work", answer: "I’m interested in cooking." },
    { id: "im4", type: "written", prompt: "새 동료에게 보낼 3문장 자기소개를 쓰세요.", skill: "writing", objectiveId: "intro-work", modelAnswer: "Hi, I’m Mina. I work in design. I’m interested in photography.", checklist: ["I’m을 정확히 썼어요", "3문장을 썼어요", "자연스럽게 소리 내어 읽었어요"] },
  ],
};

const routine: Lesson = {
  id: "daily-routines", number: 2, title: "일상 이야기하기", titleEn: "Talking about daily routines", duration: 25,
  situation: "점심시간에 동료와 평일 일과와 습관에 관해 이야기합니다.", prerequisites: ["introducing-yourself"],
  objectives: [{ id: "routine-time", text: "시간과 함께 일과를 말할 수 있어요.", skills: ["vocabulary", "speaking"] }, { id: "routine-frequency", text: "빈도를 자연스럽게 표현할 수 있어요.", skills: ["grammar", "writing"] }],
  dialogue: [
    { speaker: "Alex", en: "What time do you usually get up?", ko: "보통 몇 시에 일어나요?", vi: "Bạn thường thức dậy lúc mấy giờ?" },
    { speaker: "Mina", en: "I usually get up at seven. I take the subway to work.", ko: "보통 7시에 일어나요. 지하철로 출근해요.", vi: "Mình thường dậy lúc bảy giờ. Mình đi làm bằng tàu điện ngầm." },
    { speaker: "Alex", en: "Do you exercise before work?", ko: "출근 전에 운동해요?", vi: "Bạn có tập thể dục trước khi đi làm không?" },
    { speaker: "Mina", en: "Not usually. I often take a walk after dinner.", ko: "보통은 안 해요. 저녁 식사 후에 자주 산책해요.", vi: "Thường thì không. Mình hay đi bộ sau bữa tối." },
  ],
  vocabulary: [
    vocab("r-get-up", "get up", "일어나다", ["get up early", "get up at seven"], ["I get up at seven.", "저는 7시에 일어나요."], "verb"),
    vocab("r-breakfast", "have breakfast", "아침을 먹다", ["have a quick breakfast"], ["I have breakfast at home.", "저는 집에서 아침을 먹어요."]),
    vocab("r-commute", "go to work", "출근하다", ["go to work by subway"], ["I go to work by bus.", "저는 버스로 출근해요."]),
    vocab("r-start", "start work", "일을 시작하다", ["start work at nine"], ["I start work at nine.", "저는 9시에 일을 시작해요."]),
    vocab("r-lunch", "have lunch", "점심을 먹다", ["have lunch with coworkers"], ["We have lunch together.", "우리는 함께 점심을 먹어요."]),
    vocab("r-home", "get home", "집에 도착하다", ["get home late"], ["I get home at six.", "저는 6시에 집에 와요."]),
    vocab("r-walk", "take a walk", "산책하다", ["take a short walk"], ["I take a walk after dinner.", "저녁 후에 산책해요."]),
    vocab("r-bed", "go to bed", "잠자리에 들다", ["go to bed early"], ["I go to bed before midnight.", "자정 전에 자요."]),
    vocab("r-usually", "usually", "보통", ["usually get up"], ["I usually cook at home.", "저는 보통 집에서 요리해요."], "adverb"),
  ],
  grammar: [
    grammar("g-present", "현재형으로 습관 말하기", "반복하는 일이나 평소 습관은 동사의 현재형으로 말해요.", "매일 하는 일은 ‘I + 동사’로 말해요.", "I/You/We/They + 동사", [ex("I start work at nine.", "저는 9시에 일을 시작해요."), ex("We eat lunch together.", "우리는 함께 점심을 먹어요.")]),
    grammar("g-frequency", "빈도부사의 위치", "usually, often, sometimes는 일반동사 앞에 놓는 경우가 많아요.", "‘보통’ 같은 말은 행동 동사 바로 앞에 두세요.", "주어 + 빈도부사 + 일반동사", [ex("I usually walk to work.", "저는 보통 걸어서 출근해요."), ex("I sometimes cook dinner.", "저는 가끔 저녁을 요리해요.")]),
  ],
  contextExamples: [
    ex("I get up at six thirty.", "저는 6시 30분에 일어나요.", "아침"), ex("I make coffee first.", "먼저 커피를 만들어요.", "아침"), ex("I usually have toast.", "보통 토스트를 먹어요.", "아침"), ex("I leave home at eight.", "8시에 집을 나서요.", "출근"), ex("I take the subway.", "지하철을 타요.", "출근"), ex("I start work at nine.", "9시에 일을 시작해요.", "업무"), ex("I check my email.", "이메일을 확인해요.", "업무"), ex("We have lunch at noon.", "우리는 정오에 점심을 먹어요.", "점심"), ex("I often eat with coworkers.", "동료들과 자주 먹어요.", "점심"), ex("I finish work at six.", "6시에 일을 마쳐요.", "퇴근"), ex("I get home around seven.", "7시쯤 집에 와요.", "저녁"), ex("I sometimes order dinner.", "가끔 저녁을 주문해요.", "저녁"), ex("I take a walk after dinner.", "저녁 후에 산책해요.", "저녁"), ex("I read before bed.", "자기 전에 책을 읽어요.", "밤"), ex("I usually go to bed at eleven.", "보통 11시에 자요.", "밤")
  ],
  guidedExercises: [
    { id: "r1", type: "multiple-choice", prompt: "‘출근하다’에 맞는 표현은?", skill: "vocabulary", objectiveId: "routine-time", options: ["go to work", "go to bed", "get home"], answer: "go to work" },
    { id: "r2", type: "arrange", prompt: "순서대로 배열하세요: usually / I / at seven / get up", skill: "grammar", objectiveId: "routine-frequency", options: ["usually", "I", "at seven", "get up"], answer: ["I", "usually", "get up", "at seven"] },
    { id: "r3", type: "dictation", prompt: "교사가 읽어 주는 문장을 받아쓰기 위한 연습: ‘I take the subway to work.’", skill: "listening", objectiveId: "routine-time", answer: "I take the subway to work." },
  ],
  production: [{ id: "rp", type: "written", prompt: "평일 일과를 시간 표현과 함께 4문장으로 쓰세요.", skill: "writing", objectiveId: "routine-time", modelAnswer: "I get up at seven. I usually take the subway to work. I have lunch at noon. I go to bed at eleven.", checklist: ["시간 표현을 썼어요", "빈도부사를 하나 썼어요", "동사의 현재형을 썼어요"] }],
  masteryTest: [
    { id: "rm1", type: "fill-blank", prompt: "I ___ get up at seven. (보통)", skill: "grammar", objectiveId: "routine-frequency", answer: "usually" },
    { id: "rm2", type: "multiple-choice", prompt: "저녁 식사 후 산책한다는 문장은?", skill: "vocabulary", objectiveId: "routine-time", options: ["I take a walk after dinner.", "I take dinner after a walk.", "I walk a dinner."], answer: "I take a walk after dinner." },
    { id: "rm3", type: "translation", prompt: "‘저는 9시에 일을 시작해요.’를 영어로 쓰세요.", skill: "writing", objectiveId: "routine-time", answer: "I start work at nine." },
    { id: "rm4", type: "speaking", prompt: "아침 일과를 3문장으로 말해 보세요.", skill: "speaking", objectiveId: "routine-time", modelAnswer: "I get up at seven. I have breakfast at home. I go to work by subway.", checklist: ["세 가지 행동을 말했어요", "자연스러운 순서로 말했어요", "천천히 다시 말해 봤어요"] },
  ],
};

const plans: Lesson = {
  id: "making-plans", number: 4, title: "약속 잡기", titleEn: "Making plans", duration: 27,
  situation: "친구와 주말 약속을 잡고, 사정이 생겨 시간이나 장소를 예의 있게 바꿉니다.", prerequisites: ["daily-routines"],
  objectives: [{ id: "plan-suggest", text: "시간과 장소를 제안할 수 있어요.", skills: ["vocabulary", "speaking"] }, { id: "plan-change", text: "약속을 정중하게 바꿀 수 있어요.", skills: ["grammar", "writing"] }],
  dialogue: [
    { speaker: "Mina", en: "Are you free on Saturday afternoon?", ko: "토요일 오후에 시간 괜찮아요?", vi: "Chiều thứ Bảy bạn có rảnh không?" },
    { speaker: "Alex", en: "Yes. Would you like to get coffee?", ko: "네. 커피 마실래요?", vi: "Có. Bạn có muốn đi uống cà phê không?" },
    { speaker: "Mina", en: "Sounds good. How about three at Central Café?", ko: "좋아요. Central Café에서 3시 어때요?", vi: "Được đấy. Ba giờ ở Central Café thì sao?" },
    { speaker: "Alex", en: "Could we make it four? I have an appointment.", ko: "4시로 바꿀 수 있을까요? 약속이 하나 있어요.", vi: "Mình đổi sang bốn giờ được không? Mình có một cuộc hẹn." },
    { speaker: "Mina", en: "No problem. See you at four.", ko: "괜찮아요. 4시에 봐요.", vi: "Không sao. Hẹn gặp lúc bốn giờ." },
  ],
  vocabulary: [
    vocab("p-free", "be free", "시간이 괜찮다", ["free on Saturday", "free this evening"], ["Are you free tonight?", "오늘 저녁에 시간 괜찮아요?"]),
    vocab("p-like", "Would you like to…?", "…할래요?", ["would you like to meet"], ["Would you like to get lunch?", "점심 먹을래요?"]),
    vocab("p-how", "How about…?", "…은 어때요?", ["how about Friday"], ["How about three o’clock?", "3시는 어때요?"]),
    vocab("p-sounds", "Sounds good", "좋아요, 괜찮네요", ["that sounds good"], ["Seven sounds good.", "7시가 좋아요."]),
    vocab("p-make-it", "make it", "시간에 맞추다/참석하다", ["make it at four"], ["Can you make it at six?", "6시에 올 수 있어요?"]),
    vocab("p-change", "change the time", "시간을 바꾸다", ["change the meeting time"], ["Can we change the time?", "시간을 바꿀 수 있을까요?"]),
    vocab("p-appointment", "appointment", "예약, 약속", ["have an appointment"], ["I have a dentist appointment.", "치과 예약이 있어요."], "noun"),
    vocab("p-problem", "No problem", "괜찮아요", ["no problem at all"], ["No problem. Four is fine.", "괜찮아요. 4시도 좋아요."]),
    vocab("p-see", "See you then", "그때 봐요", ["see you there", "see you at four"], ["Great. See you then.", "좋아요. 그때 봐요."]),
  ],
  grammar: [
    grammar("g-would", "Would you like to…?로 제안하기", "상대에게 함께할 일을 부드럽게 제안할 때 써요.", "같이 하고 싶을 때 ‘Would you like to + 동사?’라고 물어요.", "Would you like to + 동사원형?", [ex("Would you like to have lunch?", "점심 먹을래요?"), ex("Would you like to meet on Sunday?", "일요일에 만날래요?")]),
    grammar("g-could", "Could we…?로 변경 요청하기", "이미 정한 계획을 예의 있게 바꿀 때 Could we…?를 써요.", "부드럽게 바꾸자고 할 때 ‘Could we + 동사?’를 써요.", "Could we + 동사원형?", [ex("Could we meet later?", "조금 더 늦게 만날 수 있을까요?"), ex("Could we change the place?", "장소를 바꿀 수 있을까요?")]),
  ],
  contextExamples: [
    ex("Are you free this weekend?", "이번 주말에 시간 괜찮아요?", "제안"), ex("Would you like to get coffee?", "커피 마실래요?", "제안"), ex("Would you like to see a movie?", "영화 볼래요?", "제안"), ex("How about Saturday?", "토요일은 어때요?", "시간 정하기"), ex("How about two o’clock?", "2시는 어때요?", "시간 정하기"), ex("Let’s meet at the station.", "역에서 만나요.", "장소 정하기"), ex("That sounds good.", "좋아요.", "수락"), ex("Saturday works for me.", "토요일 괜찮아요.", "수락"), ex("Sorry, I can’t make it.", "미안하지만 참석하기 어려워요.", "거절"), ex("I have an appointment.", "약속이 있어요.", "이유"), ex("Could we meet on Sunday?", "일요일에 만날 수 있을까요?", "변경"), ex("Could we make it four?", "4시로 바꿀 수 있을까요?", "변경"), ex("Can we change the place?", "장소를 바꿀 수 있을까요?", "변경"), ex("No problem at all.", "전혀 문제없어요.", "응답"), ex("Great. See you then.", "좋아요. 그때 봐요.", "확인")
  ],
  guidedExercises: [
    { id: "p1", type: "multiple-choice", prompt: "정중하게 커피를 제안하는 문장은?", skill: "vocabulary", objectiveId: "plan-suggest", options: ["Would you like to get coffee?", "You get coffee.", "Coffee yesterday?"], answer: "Would you like to get coffee?" },
    { id: "p2", type: "fill-blank", prompt: "Could we ___ it four?", skill: "grammar", objectiveId: "plan-change", answer: "make" },
    { id: "p3", type: "arrange", prompt: "순서대로 배열하세요: about / Saturday / How", skill: "reading", objectiveId: "plan-suggest", options: ["about", "Saturday", "How"], answer: ["How", "about", "Saturday"] },
  ],
  production: [{ id: "pp", type: "written", prompt: "친구에게 약속 시간을 바꾸는 짧은 메시지를 쓰세요.", skill: "writing", objectiveId: "plan-change", modelAnswer: "Hi, I’m sorry, but I have an appointment. Could we make it four instead?", checklist: ["미안하다고 말했어요", "간단한 이유를 말했어요", "새 시간을 제안했어요"] }],
  masteryTest: [
    { id: "pm1", type: "multiple-choice", prompt: "약속 시간 변경을 정중하게 요청하는 문장은?", skill: "vocabulary", objectiveId: "plan-change", options: ["Could we make it four?", "Four now.", "You change it."], answer: "Could we make it four?" },
    { id: "pm2", type: "fill-blank", prompt: "Would you like ___ have lunch?", skill: "grammar", objectiveId: "plan-suggest", answer: "to" },
    { id: "pm3", type: "translation", prompt: "‘토요일 오후는 어때요?’를 영어로 쓰세요.", skill: "writing", objectiveId: "plan-suggest", answer: "How about Saturday afternoon?" },
    { id: "pm4", type: "speaking", prompt: "친구에게 주말 계획을 제안하고 시간 하나를 말해 보세요.", skill: "speaking", objectiveId: "plan-suggest", modelAnswer: "Are you free on Sunday? Would you like to get coffee at three?", checklist: ["시간이 괜찮은지 물었어요", "활동을 제안했어요", "시간을 말했어요"] },
  ],
};

type Seed={id:string;number:number;title:string;titleEn:string;situation:string;prerequisites:string[];dialogue:Array<[string,string,string]>;words:Array<[string,string,string,string]>;grammarTitle:string;grammarKo:string;easyKo:string;form:string;mission:string};
// The tuple keeps the headword available for generated vocabulary below.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function seededLesson(seed:Seed):Lesson{const examples=seed.words.map(([,en,ko,sample])=>ex(sample,ko,"실생활"));while(examples.length<15){const item=seed.words[examples.length%seed.words.length];examples.push(ex(item[3],`${item[2]} 표현을 쓰는 예예요.`,examples.length%2?"대화":"메시지"))}return{id:seed.id,number:seed.number,title:seed.title,titleEn:seed.titleEn,duration:26,situation:seed.situation,prerequisites:seed.prerequisites,objectives:[{id:`${seed.id}-communicate`,text:`${seed.title} 상황에서 핵심 표현을 사용할 수 있어요.`,skills:["vocabulary","speaking"]},{id:`${seed.id}-form`,text:"알맞은 문장 형태로 묻고 답할 수 있어요.",skills:["grammar","writing","listening"]}],dialogue:seed.dialogue.map(([speaker,en,ko])=>({speaker,en,ko,vi:"Hỗ trợ tiếng Việt chỉ mở khi người học yêu cầu."})),vocabulary:seed.words.map(([id,headword,definition,sample])=>vocab(`${seed.id}-${id}`,headword,definition,[headword],[sample,definition])),grammar:[grammar(`${seed.id}-grammar`,seed.grammarTitle,seed.grammarKo,seed.easyKo,seed.form,[examples[0],examples[1],examples[2]])],contextExamples:examples,listeningExercises:[{id:`${seed.id}-listen`,type:"multiple-choice",prompt:"음성을 듣고 상황에 맞는 답을 고르세요.",skill:"listening",objectiveId:`${seed.id}-communicate`,options:[seed.words[0][3],seed.words[1][3],seed.words[2][3]],answer:seed.words[0][3]},{id:`${seed.id}-dictation`,type:"dictation",prompt:`받아쓰세요: ${seed.words[1][3]}`,skill:"listening",objectiveId:`${seed.id}-form`,answer:seed.words[1][3]}],guidedExercises:[{id:`${seed.id}-g1`,type:"multiple-choice",prompt:`‘${seed.words[0][2]}’에 맞는 표현은?`,skill:"vocabulary",objectiveId:`${seed.id}-communicate`,options:[seed.words[0][1],seed.words[1][1],seed.words[2][1]],answer:seed.words[0][1]},{id:`${seed.id}-g2`,type:"fill-blank",prompt:`${seed.words[0][3].replace(seed.words[0][1],"___")}`,skill:"grammar",objectiveId:`${seed.id}-form`,answer:seed.words[0][1]}],production:[{id:`${seed.id}-production`,type:"written",prompt:seed.mission,skill:"writing",objectiveId:`${seed.id}-communicate`,modelAnswer:seed.dialogue.map(line=>line[1]).slice(0,2).join(" "),checklist:["핵심 표현을 썼어요","상황에 맞는 말투를 골랐어요","소리 내어 다시 읽었어요"]},{id:`${seed.id}-shadow`,type:"speaking",prompt:"대화의 한 문장을 듣고 리듬을 따라 말한 뒤 직접 녹음해 보세요.",skill:"speaking",objectiveId:`${seed.id}-communicate`,modelAnswer:seed.dialogue[0][1],checklist:["문장 강세를 들었어요","녹음과 기준 음성을 비교했어요","스스로 평가했어요"]}],masteryTest:[{id:`${seed.id}-m1`,type:"multiple-choice",prompt:"상황에 가장 자연스러운 표현을 고르세요.",skill:"vocabulary",objectiveId:`${seed.id}-communicate`,options:[seed.words[0][3],seed.words[1][3],"I yesterday no."],answer:seed.words[0][3]},{id:`${seed.id}-m2`,type:"dictation",prompt:`듣고 받아쓰세요: ${seed.words[2][3]}`,skill:"listening",objectiveId:`${seed.id}-form`,answer:seed.words[2][3]},{id:`${seed.id}-m3`,type:"translation",prompt:`‘${seed.words[3][2]}’를 영어로 쓰세요.`,skill:"writing",objectiveId:`${seed.id}-form`,answer:seed.words[3][3]},{id:`${seed.id}-m4`,type:"speaking",prompt:seed.mission,skill:"speaking",objectiveId:`${seed.id}-communicate`,modelAnswer:seed.dialogue[0][1],checklist:["뜻을 분명히 전했어요","핵심 표현을 썼어요","직접 녹음하고 비교했어요"]}]}}

const questions=seededLesson({id:"everyday-questions",number:3,title:"일상 질문하기",titleEn:"Asking everyday questions",situation:"새 동료와 점심을 먹으며 사는 곳, 출퇴근, 취향을 부담 없이 물어봅니다.",prerequisites:["daily-routines"],dialogue:[["Mina","Where do you live?","어디에 살아요?"],["Alex","I live near City Hall.","시청 근처에 살아요."],["Mina","How do you get to work?","어떻게 출근해요?"],["Alex","I usually take the bus.","보통 버스를 타요."]],words:[["where","Where do you…?","어디에서 …해요?","Where do you live?"],["how","How do you…?","어떻게 …해요?","How do you get to work?"],["what-time","What time do you…?","몇 시에 …해요?","What time do you start work?"],["often","How often…?","얼마나 자주 …해요?","How often do you cook?"],["near","near","… 근처에","I live near the station."],["by-bus","by bus","버스로","I go by bus."],["usually","usually","보통","I usually eat at home."],["weekend","on weekends","주말에","What do you do on weekends?"]],grammarTitle:"의문사 + do 질문",grammarKo:"정보를 물을 때 의문사 뒤에 do와 주어를 놓아요.",easyKo:"Where/How/What time + do you + 동사? 순서로 물어요.",form:"의문사 + do + 주어 + 동사원형?",mission:"새 동료에게 일상 질문 세 가지를 쓰세요."});
const appointment=seededLesson({id:"changing-appointment",number:5,title:"약속 변경하기",titleEn:"Changing an appointment",situation:"업무 약속에 사정이 생겨 미리 연락하고 새 시간을 정중하게 제안합니다.",prerequisites:["making-plans"],dialogue:[["Alex","I’m sorry, but I need to change our appointment.","미안하지만 약속을 바꿔야 해요."],["Mina","No problem. What time works for you?","괜찮아요. 몇 시가 좋아요?"],["Alex","Could we meet at four instead?","대신 4시에 만날 수 있을까요?"],["Mina","Four works for me.","4시 좋아요."]],words:[["change","change our appointment","약속을 바꾸다","I need to change our appointment."],["instead","instead","대신에","Could we meet at four instead?"],["works","work for someone","누구에게 시간이 맞다","Friday works for me."],["reschedule","reschedule","일정을 다시 잡다","Can we reschedule our meeting?"],["sorry","I’m sorry, but…","미안하지만…","I’m sorry, but I’m busy."],["available","be available","시간이 가능하다","Are you available tomorrow?"],["confirm","confirm the time","시간을 확인하다","Let’s confirm the time."],["later","a little later","조금 더 늦게","Could we meet a little later?"]],grammarTitle:"Could we…?로 정중하게 바꾸기",grammarKo:"이미 정한 약속을 바꿀 때 Could we와 동사원형을 써요.",easyKo:"부드럽게 ‘바꿀까요?’라고 말할 때 Could we를 써요.",form:"Could we + 동사원형 + instead?",mission:"약속을 바꾸는 정중한 메시지를 세 문장으로 쓰세요."});
const food=seededLesson({id:"ordering-food",number:6,title:"음식 주문하기",titleEn:"Ordering food",situation:"점심 식당에서 메뉴를 묻고 음식과 음료를 정중하게 주문합니다.",prerequisites:["changing-appointment"],dialogue:[["Server","Are you ready to order?","주문하시겠어요?"],["Mina","Yes, I’d like the chicken salad, please.","네, 치킨 샐러드로 주세요."],["Server","Anything to drink?","마실 것은요?"],["Mina","Water, please. Could I have it without ice?","물 주세요. 얼음 없이 주실 수 있나요?"]],words:[["like","I’d like…","…로 주세요","I’d like the soup, please."],["have","Could I have…?","…을 주실 수 있나요?","Could I have some water?"],["ready","be ready to order","주문할 준비가 되다","We’re ready to order."],["without","without","… 없이","Could I have it without ice?"],["side","on the side","따로","Sauce on the side, please."],["recommend","recommend","추천하다","What do you recommend?"],["bill","the bill","계산서","Could we have the bill?"],["takeout","to go","포장으로","Can I get this to go?"]],grammarTitle:"I’d like…로 주문하기",grammarKo:"원하는 것을 공손하게 주문할 때 I’d like를 써요.",easyKo:"‘… 주세요’는 I’d like + 음식이에요.",form:"I’d like + 명사, please.",mission:"음식 하나와 음료 하나를 주문하고 요청을 하나 덧붙이세요."});
const help=seededLesson({id:"asking-for-help",number:7,title:"도움 요청하기",titleEn:"Asking for help",situation:"낯선 건물에서 길을 잃어 안내 직원에게 위치와 방법을 묻습니다.",prerequisites:["ordering-food"],dialogue:[["Mina","Excuse me, could you help me?","실례합니다, 도와주실 수 있나요?"],["Staff","Of course. What do you need?","물론이죠. 무엇이 필요하세요?"],["Mina","I’m looking for the meeting room.","회의실을 찾고 있어요."],["Staff","It’s on the second floor, next to the elevator.","2층 엘리베이터 옆에 있어요."]],words:[["excuse","Excuse me","실례합니다","Excuse me, could you help me?"],["help","Could you help me?","도와주실 수 있나요?","Could you help me with this?"],["looking","be looking for","…을 찾고 있다","I’m looking for the station."],["floor","on the second floor","2층에","It’s on the second floor."],["next","next to","… 옆에","It’s next to the elevator."],["show","show me","보여 주다","Could you show me on the map?"],["understand","I don’t understand","이해하지 못하다","Sorry, I don’t understand."],["repeat","say that again","다시 말하다","Could you say that again?"]],grammarTitle:"Could you…?로 도움 요청하기",grammarKo:"상대에게 행동을 부탁할 때 Could you와 동사원형을 써요.",easyKo:"정중한 부탁은 Could you + 동사?예요.",form:"Could you + 동사원형 + me?",mission:"길을 묻고, 못 들었을 때 다시 말해 달라고 부탁하세요."});
const past=seededLesson({id:"past-events",number:8,title:"지난 일 이야기하기",titleEn:"Talking about past events",situation:"월요일 아침 동료와 주말에 한 일을 짧게 나눕니다.",prerequisites:["asking-for-help"],dialogue:[["Alex","How was your weekend?","주말 어땠어요?"],["Mina","It was good. I visited my parents.","좋았어요. 부모님을 뵈었어요."],["Alex","What did you do on Sunday?","일요일에는 뭐 했어요?"],["Mina","I stayed home and watched a movie.","집에 있으면서 영화를 봤어요."]],words:[["weekend","How was your weekend?","주말 어땠어요?","How was your weekend?"],["visited","visited","방문했다","I visited my parents."],["stayed","stayed home","집에 있었다","I stayed home on Sunday."],["watched","watched a movie","영화를 봤다","We watched a movie."],["went","went to","…에 갔다","I went to a museum."],["had","had a good time","좋은 시간을 보냈다","We had a good time."],["yesterday","yesterday","어제","I worked yesterday."],["last","last weekend","지난 주말","I rested last weekend."]],grammarTitle:"과거형으로 끝난 일 말하기",grammarKo:"어제나 지난 주말처럼 끝난 일은 동사의 과거형으로 말해요.",easyKo:"지난 일은 동사를 과거 모양으로 바꿔요. visit는 visited가 돼요.",form:"주어 + 동사의 과거형",mission:"지난 주말에 한 일을 세 문장으로 쓰고 말해 보세요."});
const current=seededLesson({id:"current-activities",number:9,title:"지금 하는 일 설명하기",titleEn:"Describing current activities",situation:"전화나 메시지로 지금 무엇을 하고 있는지 설명하고 잠시 뒤 연락하기로 합니다.",prerequisites:["past-events"],dialogue:[["Mina","Hi, what are you doing?","안녕하세요, 지금 뭐 하고 있어요?"],["Alex","I’m waiting for the bus.","버스를 기다리고 있어요."],["Mina","Can you talk now?","지금 통화할 수 있어요?"],["Alex","Not right now. I’m getting on the bus.","지금은 어려워요. 버스에 타고 있어요."]],words:[["doing","What are you doing?","지금 뭐 하고 있어요?","What are you doing now?"],["waiting","be waiting for","…을 기다리고 있다","I’m waiting for the bus."],["working","be working on","…을 작업하고 있다","I’m working on a report."],["talk","Can you talk now?","지금 통화할 수 있나요?","Can you talk now?"],["right-now","right now","바로 지금","I’m busy right now."],["getting","get on","타다","I’m getting on the train."],["having","have lunch","점심을 먹다","We’re having lunch."],["later","call you later","나중에 전화하다","I’ll call you later."]],grammarTitle:"현재진행형으로 지금 말하기",grammarKo:"말하는 바로 지금 진행 중인 일은 be동사와 동사-ing로 말해요.",easyKo:"지금 하는 일은 am/is/are + 동사-ing예요.",form:"주어 + am/is/are + 동사-ing",mission:"지금 하는 일과 조금 뒤 할 일을 메시지로 쓰세요."});
const review=seededLesson({id:"unit-review",number:10,title:"단원 복습과 실전 미션",titleEn:"Unit review and real-life mission",situation:"새 모임에 참여해 자신을 소개하고, 질문하고, 주문하고, 약속 변경과 지각 상황까지 해결합니다.",prerequisites:["current-activities"],dialogue:[["Host","Welcome! Could you introduce yourself?","환영해요! 자기소개해 주시겠어요?"],["Mina","I’m Mina. I work in design, and I’m interested in music.","저는 미나예요. 디자인 일을 하고 음악에 관심이 있어요."],["Host","Would you like to join us for dinner?","저녁 식사에 함께할래요?"],["Mina","I’d love to, but could we make it seven?","좋아요. 그런데 7시로 할 수 있을까요?"]],words:[["introduce","introduce yourself","자기소개하다","Could you introduce yourself?"],["routine","daily routine","일상 습관","Tell me about your daily routine."],["question","ask a question","질문하다","Can I ask a question?"],["plan","make a plan","약속을 잡다","Let’s make a plan."],["change","change the time","시간을 바꾸다","Could we change the time?"],["order","ready to order","주문할 준비가 되다","I’m ready to order."],["help","ask for help","도움을 요청하다","It’s okay to ask for help."],["late","run late","늦다","I’m running ten minutes late."]],grammarTitle:"A1 핵심 문법 대조",grammarKo:"현재 습관, 지금 하는 일, 지난 일, 정중한 요청을 상황에 맞게 구별해요.",easyKo:"평소는 현재형, 지금은 -ing, 지난 일은 과거형을 써요.",form:"현재형 / be + -ing / 과거형 / Could…?",mission:"실전 미션: 자기소개부터 약속 변경까지 이어지는 짧은 대화를 녹음하세요."});

export const course = courseSchema.parse({
  id: "everyday-english-a1", title: "생활 영어 A1", targetLanguage: "English", explanationLanguage: "Korean",
  levels: [{ id: "a1", cefr: "A1", title: "A1 · 시작", units: [{ id: "unit-1", title: "일상에서 연결하기", description: "소개, 일상, 질문, 약속, 식당과 도움 요청까지 실제 생활 흐름으로 익힙니다.", lessons: [intro, routine, questions, plans, appointment, food, help, past, current, review] }] }],
});

export const lessons = course.levels.flatMap((level) => level.units.flatMap((unit) => unit.lessons));
export const getLesson = (id: string) => lessons.find((lesson) => lesson.id === id);
