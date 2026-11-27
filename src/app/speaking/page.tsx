import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/empty-state";
import { SCENARIOS } from "@/content/speaking/scenarios";

export const metadata: Metadata = { title: "Luyện nói" };

export default function SpeakingPage() {
  return (
    <>
      <PageHeading
        title="Luyện nói"
        intro="Chọn một tình huống rồi nói chuyện với AI bằng giọng nói. AI dùng lại từ vựng A1 bạn đang học và nhận xét khi kết thúc."
      />
      <ul className="grid max-w-[56rem] gap-3 sm:grid-cols-2">
        {SCENARIOS.map((s) => (
          <li key={s.id}>
            <Link
              href={`/speaking/${s.id}`}
              className="flex h-full flex-col rounded-xl border border-line bg-sheet p-4 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="font-semibold text-balance">{s.title}</span>
              <span className="mt-1 flex-1 text-sm text-ink-soft text-pretty">{s.description}</span>
              <span className="en mt-3 text-sm text-pretty">“{s.opening}”</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 max-w-[42rem] text-sm text-ink-soft text-pretty">
        Mẹo: dùng tai nghe, nói câu ngắn và rõ. Nếu không tiện nói, bạn có thể gõ câu trả lời.
      </p>
    </>
  );
}
