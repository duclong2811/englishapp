import Link from "next/link";
import { a2Units } from "@/content/a2-course";
import { PronunciationButtons } from "@/components/PronunciationButtons";
import { unitNumberFromId } from "@/lib/curriculum/unit-label";

export default async function VocabularyPage({ searchParams }: { searchParams: Promise<{ unit?: string }> }) {
  const { unit: requested } = await searchParams;
  const selected = a2Units.find((unit) => unit.id === requested) ?? a2Units[0];
  const words = Array.from(
    new Map(
      selected.lessons
        .flatMap((lesson) => lesson.vocabulary.map((word) => ({ word, lesson })))
        .map((item) => [item.word.headword.toLowerCase(), item]),
    ).values(),
  );
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <span className="eyebrow">TỪ VỰNG THEO UNIT</span>
          <h1>Kho từ vựng</h1>
          <p>Toàn bộ từ và cụm từ cần học trong từng Unit, kèm nghĩa Việt–Hàn và phát âm Mỹ/Anh.</p>
        </div>
        <span className="tag">
          {words.length} từ và cụm từ
        </span>
      </header>
      <nav className="vocabulary-toolbar" aria-label="Chọn unit">
        {a2Units.map((unit) => (
          <Link className={unit.id === selected.id ? "active" : ""} href={`/vocabulary?unit=${unit.id}`} key={unit.id}>
            Unit {unitNumberFromId(unit.id) ?? 1}
          </Link>
        ))}
      </nav>
      <section className="section-head">
        <div>
          <span className="eyebrow">
            {selected.level} · <span lang="ko">{selected.titleKo}</span>
          </span>
          <h2>{selected.titleVi}</h2>
        </div>
      </section>
      <div className="vocabulary-grid">
        {words.map(({ word, lesson }) => {
          const sample = lesson.examples.find((example) => example.en.toLowerCase().includes(word.headword.toLowerCase().split(" ").at(-1) ?? word.headword.toLowerCase()));
          return (
            <article className="vocabulary-card" key={word.id}>
              <div className="vocabulary-card-head">
                <div>
                  <h2 lang="en">{word.headword}</h2>
                  <div className="ipa-line">
                    {word.ipa} · Trọng âm: {word.stress}
                  </div>
                </div>
                <PronunciationButtons text={word.headword} />
              </div>
              <div className="meaning-row">
                <div>
                  <small>Tiếng Việt</small>
                  <strong>{word.definitionVi}</strong>
                </div>
                <div lang="ko">
                  <small>Tiếng Hàn</small>
                  <strong>{word.definitionKo}</strong>
                </div>
              </div>
              <p className="collocations">
                <strong>Cụm thường dùng:</strong> {word.collocations.join(" · ")}
              </p>
              {sample && (
                <div className="example">
                  <span lang="en">{sample.en}</span>
                  <small>{sample.vi}</small>
                  <small lang="ko">{sample.ko}</small>
                </div>
              )}
              <div className="actions">
                <Link className="secondary" href={`/a2/lesson/${lesson.id}`}>
                  Mở bài học
                </Link>
                <span className="tag">{word.register}</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
