import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/empty-state";
import { DueSummary } from "@/components/vocab/due-summary";
import { LevelBadge } from "@/components/vocab/word-parts";
import { getLevelCounts, getStudyWords, LEVELS } from "@/lib/vocab/data";

export const metadata: Metadata = { title: "Từ vựng" };

const LEVEL_VI: Record<string, string> = {
  A1: "Mới bắt đầu",
  A2: "Sơ cấp",
  B1: "Trung cấp",
  B2: "Trung cao cấp",
  C1: "Cao cấp",
  C2: "Thành thạo",
};

export default function VocabularyPage() {
  const study = getStudyWords();
  const counts = getLevelCounts();
  const nf = new Intl.NumberFormat("vi-VN");

  return (
    <>
      <PageHeading
        title="Từ vựng"
        intro="Học từ theo cấp độ, có phát âm, câu ví dụ thật và lịch ôn để nhớ lâu."
      />

      <div className="lg:grid lg:grid-cols-[minmax(0,40rem)_minmax(16rem,22rem)] lg:gap-12">
        <div>
          <DueSummary ids={study.map((w) => w.id)} total={study.length} />

          <section aria-labelledby="core-heading" className="mt-10">
            <h2 id="core-heading" className="text-lg font-semibold">
              {study.length} từ cốt lõi A1
            </h2>
            <p className="mt-1 text-ink-soft">Những từ thông dụng nhất. Chạm vào từ để xem nghĩa và ví dụ.</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {study.map((w) => (
                <li key={w.id}>
                  <Link
                    href={`/vocabulary/word/${w.id}`}
                    lang="en"
                    className="en inline-flex min-h-11 items-center rounded-full border border-line bg-sheet px-4 text-lg transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {w.headword}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section aria-labelledby="levels-heading" className="mt-10 lg:mt-0">
          <h2 id="levels-heading" className="text-lg font-semibold">
            Kho từ theo cấp độ
          </h2>
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-sheet">
            {LEVELS.map((level) => (
              <li key={level}>
                <Link
                  href={`/vocabulary/level/${level.toLowerCase()}`}
                  className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-line/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                >
                  <LevelBadge level={level} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{LEVEL_VI[level]}</span>
                    <span className="block text-sm text-ink-soft tabular-nums">
                      {nf.format(counts[level].total)} từ
                      {counts[level].withMeaning > 0 ? `, ${counts[level].withMeaning} từ đã có nghĩa` : ""}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-soft text-pretty">
            Nguồn: CEFR-J Wordlist 1.5 (Tono Lab, TUFS), Octanove C1/C2, CMUdict, ECDICT, Tatoeba.
          </p>
        </section>
      </div>
    </>
  );
}
