import Link from "next/link";
import { notFound } from "next/navigation";
import { LevelBadge } from "@/components/vocab/word-parts";
import { getMeaningMap, getWordsByLevel, LEVELS, POS_VI, type Level } from "@/lib/vocab/data";

export const PAGE_SIZE = 100;

export function toLevel(param: string): Level | undefined {
  return LEVELS.find((l) => l.toLowerCase() === param);
}

export function pageCount(level: Level) {
  return Math.ceil(getWordsByLevel(level).length / PAGE_SIZE);
}

export function LevelList({ levelParam, page }: { levelParam: string; page: number }) {
  const level = toLevel(levelParam);
  if (!level) notFound();
  const all = getWordsByLevel(level);
  const pages = Math.ceil(all.length / PAGE_SIZE);
  if (!Number.isInteger(page) || page < 1 || page > pages) notFound();
  const words = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const meanings = getMeaningMap();
  const nf = new Intl.NumberFormat("vi-VN");
  const base = `/vocabulary/level/${levelParam}`;
  const href = (p: number) => (p === 1 ? base : `${base}/${p}`);
  const first = (page - 1) * PAGE_SIZE + 1;

  return (
    <div className="max-w-[42rem]">
      <Link href="/vocabulary" className="back-link">
        ← Từ vựng
      </Link>
      <header className="mb-2 mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Từ vựng {level}</h1>
        <LevelBadge level={`${nf.format(all.length)} từ`} />
      </header>
      <p className="mb-6 text-ink-soft text-pretty">
        Xếp theo độ thông dụng. Từ có nghĩa tiếng Việt mở được trang chi tiết; các từ còn lại đang được soạn.
      </p>

      <ol start={first} className="word-list">
        {words.map((w) => {
          const vi = meanings.get(w.id);
          const inner = (
            <>
              <span lang="en" className="en">
                {w.headword}
              </span>
              {w.ipa ? <span translate="no">/{w.ipa}/</span> : null}
              <small className={vi ? "has-vi" : undefined}>
                {vi ?? w.pos.map((p) => POS_VI[p.pos] ?? p.pos).join(", ")}
              </small>
            </>
          );
          return <li key={w.id}>{vi ? <Link href={`/vocabulary/word/${w.id}`}>{inner}</Link> : <div>{inner}</div>}</li>;
        })}
      </ol>

      <nav aria-label="Phân trang" className="mt-6 flex items-center justify-between gap-4">
        {page > 1 ? (
          <Link href={href(page - 1)} className="pager-link">
            ← Trang trước
          </Link>
        ) : (
          <span />
        )}
        <span className="text-sm text-ink-soft tabular-nums">
          Trang {page}/{pages}
        </span>
        {page < pages ? (
          <Link href={href(page + 1)} className="pager-link">
            Trang sau →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
