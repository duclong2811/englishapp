"use client";

import Link from "next/link";
import { Illustration } from "@/components/illustration";
import { LevelPicker, useLevelSelection } from "@/components/level-picker";
import { BestScore } from "@/components/tests/best-score";
import { LEVEL_BLUEPRINT } from "@/lib/tests/bank";
import type { Level } from "@/lib/levels";

type LevelTests = {
  level: Level;
  units: { id: string; title: string }[];
  topics: { id: string; title: string }[];
};

const row =
  "flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-line/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent";

export function TestsOverview({ levels }: { levels: LevelTests[] }) {
  const available = levels.map((l) => l.level);
  const { current, select } = useLevelSelection("tests:level:v1", available, available[0] ?? "A1");
  const data = levels.find((l) => l.level === current) ?? levels[0];
  const total = LEVEL_BLUEPRINT.vocab + LEVEL_BLUEPRINT.listening + LEVEL_BLUEPRINT.grammar;

  return (
    <div className="max-w-[42rem]">
      <LevelPicker current={data.level} available={available} onSelect={select} />

      <section aria-labelledby="level-test" className="oli rounded-2xl border border-line p-6 sm:p-8">
        <h2 id="level-test" className="text-sm font-medium text-ink-soft">
          Kiểm tra cấp độ
        </h2>
        <p className="mt-2 text-3xl font-semibold tracking-tight">Toàn bộ {data.level}</p>
        <p className="mt-2 text-ink-soft tabular-nums">
          {total} câu · khoảng 30 phút · Từ vựng {LEVEL_BLUEPRINT.vocab}, Nghe {LEVEL_BLUEPRINT.listening}, Ngữ pháp {LEVEL_BLUEPRINT.grammar}
        </p>
        <p className="mt-1">
          <BestScore testKey={`level:${data.level}`} />
        </p>
        <Link
          href={`/tests/${data.level.toLowerCase()}`}
          className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Làm bài
        </Link>
      </section>

      <section aria-labelledby="unit-tests" className="mt-10">
        <h2 id="unit-tests" className="text-lg font-semibold">
          Kiểm tra nhanh: ngữ pháp
        </h2>
        <p className="mt-1 text-ink-soft">Mỗi chương 12 câu, khoảng 7 phút.</p>
        <ol className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-sheet">
          {data.units.map((u, i) => (
            <li key={u.id}>
              <Link href={`/tests/${data.level.toLowerCase()}/unit/${u.id}`} className={row}>
                <span className="min-w-0 flex-1 font-medium text-pretty">
                  Chương {i + 1} · {u.title}
                </span>
                <BestScore testKey={`unit:${u.id}`} />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="topic-tests" className="mt-10">
        <h2 id="topic-tests" className="text-lg font-semibold">
          Kiểm tra nhanh: từ vựng
        </h2>
        <p className="mt-1 text-ink-soft">Mỗi chủ đề 12 câu: nghĩa, điền từ, nghe.</p>
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-sheet">
          {data.topics.map((t) => (
            <li key={t.id}>
              <Link href={`/tests/${data.level.toLowerCase()}/topic/${t.id}`} className={row}>
                <Illustration id={t.id} size={40} />
                <span className="min-w-0 flex-1 font-medium text-pretty">{t.title}</span>
                <BestScore testKey={`topic:${t.id}`} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
