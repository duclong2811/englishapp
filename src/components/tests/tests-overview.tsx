"use client";

import Link from "next/link";
import { Illustration } from "@/components/illustration";
import { LevelPicker, useLevelSelection } from "@/components/level-picker";
import { BestScore } from "@/components/tests/best-score";
import { LEVEL_BLUEPRINT, SECTION_VI, SKILLS_BLUEPRINT, type Section } from "@/lib/tests/bank";
import type { Level } from "@/lib/levels";

type LevelTests = {
  level: Level;
  units: { id: string; title: string }[];
  topics: { id: string; title: string }[];
};

const row =
  "flex h-full min-h-14 items-center gap-3 rounded-xl border border-line bg-sheet px-3 py-3 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function TestsOverview({ levels }: { levels: LevelTests[] }) {
  const available = levels.map((l) => l.level);
  const { current, select } = useLevelSelection("tests:level:v1", available, available[0] ?? "A1");
  const data = levels.find((l) => l.level === current) ?? levels[0];
  const total = Object.values(LEVEL_BLUEPRINT).reduce((a, b) => a + b, 0);
  const parts = (Object.entries(LEVEL_BLUEPRINT) as [Section, number][]).map(([k, n]) => `${SECTION_VI[k]} ${n}`).join(", ");
  const skills = SKILLS_BLUEPRINT;

  return (
    <div>
      <div className="max-w-3xl">
        <LevelPicker current={data.level} available={available} onSelect={select} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">

      <section aria-labelledby="skills-test" className="oli rounded-2xl border border-line p-6 sm:p-8">
        <h2 id="skills-test" className="text-sm font-medium text-ink-soft">
          Luyện viết và nói
        </h2>
        <p className="mt-2 text-3xl font-semibold tracking-tight">Viết và nói {data.level}</p>
        <p className="mt-2 text-pretty">
          Dịch và sửa câu, viết vài câu theo đề, đọc to câu mẫu và trả lời bằng giọng nói. AI chấm bài tự do, chỉ ra lỗi và đưa bài đã sửa.
        </p>
        <p className="mt-2 text-ink-soft tabular-nums">
          {skills.translate + skills.open} câu viết, {skills.reading + skills.talk} câu nói · khoảng 20 phút
        </p>
        <p className="mt-1">
          <BestScore testKey={`skills:${data.level}`} />
        </p>
        <Link
          href={`/tests/${data.level.toLowerCase()}/skills`}
          className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Bắt đầu luyện
        </Link>
      </section>

      <section aria-labelledby="level-test" className="rounded-2xl border border-line bg-sheet p-6 sm:p-8">
        <h2 id="level-test" className="text-sm font-medium text-ink-soft">
          Kiểm tra cấp độ
        </h2>
        <p className="mt-2 text-2xl font-semibold tracking-tight">Toàn bộ {data.level}</p>
        <p className="mt-2 text-ink-soft tabular-nums">
          {total} câu · khoảng 40 phút · {parts}
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

      </div>

      <section aria-labelledby="unit-tests" className="mt-10">
        <h2 id="unit-tests" className="text-lg font-semibold">
          Kiểm tra nhanh: ngữ pháp
        </h2>
        <p className="mt-1 text-ink-soft">Mỗi chương 12 câu, khoảng 7 phút.</p>
        <ol className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {data.topics.map((t) => (
            <li key={t.id}>
              <Link href={`/tests/${data.level.toLowerCase()}/topic/${t.id}`} className={row}>
                <Illustration id={t.id} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-snug text-pretty sm:text-base">{t.title}</span>
                  <BestScore testKey={`topic:${t.id}`} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
