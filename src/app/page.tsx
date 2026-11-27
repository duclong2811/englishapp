import Link from "next/link";
import { SpeakButton } from "@/components/speak-button";

const sentence = {
  before: "I'm trying to ",
  word: "get used to",
  after: " waking up early.",
  vi: "Mình đang cố làm quen với việc dậy sớm.",
  note: "get used to + V‑ing: dần quen với một việc. Sau “to” ở đây là V‑ing, không phải động từ nguyên mẫu.",
};

const plan = [
  {
    href: "/vocabulary",
    title: "Ôn từ vựng",
    detail: "800 từ cốt lõi A1, mỗi ngày 10 từ mới.",
  },
  {
    href: "/lessons",
    title: "Học bài tiếp theo",
    detail: "Lộ trình A1 → B2 đang được soạn.",
  },
  {
    href: "/speaking",
    title: "Nói chuyện 5 phút với AI",
    detail: "Dùng lại từ và ngữ pháp bạn vừa học.",
  },
];

export default function TodayPage() {
  const fullSentence = sentence.before + sentence.word + sentence.after;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,40rem)_minmax(16rem,22rem)] lg:gap-12">
      <div>
        <h1 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl">Hôm nay</h1>

        <section aria-labelledby="sentence-heading" className="overflow-hidden rounded-2xl border border-line">
          <div className="oli p-6 sm:p-8">
          <h2 id="sentence-heading" className="text-sm font-medium text-ink-soft">
            Câu của ngày
          </h2>
          <p lang="en" className="en mt-4 text-[1.75rem] leading-snug text-pretty sm:text-4xl">
            {sentence.before}
            <mark className="word">{sentence.word}</mark>
            {sentence.after}
          </p>
          <p className="mt-4 text-lg text-ink-soft">{sentence.vi}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <SpeakButton text={fullSentence} />
          </div>
          </div>
          <p className="border-t border-line bg-sheet px-6 py-4 text-ink text-pretty sm:px-8">
            <span className="font-semibold">Ghi nhớ: </span>
            {sentence.note}
          </p>
        </section>
      </div>

      <section aria-labelledby="plan-heading" className="mt-10 lg:mt-[3.75rem]">
        <h2 id="plan-heading" className="text-lg font-semibold">
          Việc nên làm hôm nay
        </h2>
        <ol className="mt-4 flex flex-col gap-3">
          {plan.map((item, i) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex min-h-16 items-start gap-4 rounded-xl border border-line bg-sheet p-4 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-sm font-semibold tabular-nums text-ink-soft group-hover:border-accent group-hover:text-accent"
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{item.title}</span>
                  <span className="block text-sm text-ink-soft">{item.detail}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
