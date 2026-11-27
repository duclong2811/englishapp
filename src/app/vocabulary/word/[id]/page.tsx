import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SpeakButton } from "@/components/speak-button";
import { ExampleLine, Ipa, LevelBadge } from "@/components/vocab/word-parts";
import { getVocabData, POS_VI } from "@/lib/vocab/data";

export async function generateStaticParams() {
  const { getStudyWords } = await getVocabData();
  return getStudyWords().map((w) => ({ id: w.id }));
}

export async function generateMetadata({ params }: PageProps<"/vocabulary/word/[id]">): Promise<Metadata> {
  const { getStudyWord } = await getVocabData();
  const word = getStudyWord((await params).id);
  return { title: word ? word.headword : "Từ vựng" };
}

const FORM_VI: Record<string, string> = {
  past: "quá khứ",
  pastParticiple: "quá khứ phân từ",
  ing: "V-ing",
  thirdPerson: "ngôi thứ 3 số ít",
  plural: "số nhiều",
  comparative: "so sánh hơn",
  superlative: "so sánh nhất",
};

export default async function WordPage({ params }: PageProps<"/vocabulary/word/[id]">) {
  const { getStudyWord } = await getVocabData();
  const word = getStudyWord((await params).id);
  if (!word) notFound();
  const order = Object.keys(FORM_VI);
  const forms = Object.entries(word.forms).sort(([a], [b]) => order.indexOf(a) - order.indexOf(b));
  const usesTatoeba = word.examples.some((e) => e.source === "tatoeba");

  return (
    <article className="max-w-[42rem]">
      <Link
        href="/vocabulary"
        className="inline-flex min-h-11 items-center text-ink-soft hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
      >
        ← Từ vựng
      </Link>

      <header className="oli mt-2 rounded-2xl border border-line p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <LevelBadge level={word.level} />
          {word.status === "draft" ? (
            <span className="text-sm text-ink-soft">Bản nháp, chưa duyệt</span>
          ) : null}
        </div>
        <h1 lang="en" className="en mt-4 text-5xl leading-tight sm:text-6xl">
          {word.headword}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-lg">
          <Ipa ipa={word.ipa} />
          <SpeakButton text={word.headword} />
        </div>
      </header>

      <section aria-labelledby="meaning-heading" className="mt-8">
        <h2 id="meaning-heading" className="sr-only">
          Nghĩa
        </h2>
        <dl className="flex flex-col gap-3">
          {word.meanings.map((m) => (
            <div key={m.pos}>
              <dt className="text-sm text-ink-soft">{POS_VI[m.pos] ?? m.pos}</dt>
              <dd className="text-xl font-medium text-pretty">{m.vi}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="note-heading" className="mt-8 rounded-xl border-l-4 border-accent bg-sheet p-4">
        <h2 id="note-heading" className="font-semibold">
          Ghi nhớ
        </h2>
        <p className="mt-1 text-pretty">{word.note}</p>
      </section>

      <section aria-labelledby="examples-heading" className="mt-8">
        <h2 id="examples-heading" className="text-lg font-semibold">
          Câu ví dụ
        </h2>
        <ul className="mt-4 flex flex-col gap-5">
          {word.examples.map((ex) => (
            <ExampleLine key={ex.en} example={ex} />
          ))}
        </ul>
      </section>

      {forms.length > 0 ? (
        <section aria-labelledby="forms-heading" className="mt-8">
          <h2 id="forms-heading" className="text-lg font-semibold">
            Các dạng của từ
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
            {forms.map(([k, v]) => (
              <div key={k}>
                <dt className="text-sm text-ink-soft">{FORM_VI[k] ?? k}</dt>
                <dd lang="en" className="en text-lg">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {usesTatoeba ? (
        <p className="mt-10 text-sm text-ink-soft text-pretty">
          Câu ví dụ lấy từ Tatoeba (tatoeba.org, giấy phép CC BY 2.0 FR); một số bản dịch đã được chỉnh sửa.
        </p>
      ) : null}
    </article>
  );
}
