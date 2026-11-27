import type { Metadata } from "next";
import Link from "next/link";
import { Conversation } from "@/components/speaking/conversation";
import { FREE_CHAT } from "@/lib/speaking/lessons";

export const metadata: Metadata = { title: "Nói tự do" };

export default function FreeChatPage() {
  const { id, title, goal, opening, starters } = FREE_CHAT;
  return (
    <>
      <Link href="/speaking" className="back-link">
        Luyện nói
      </Link>
      <header className="mb-6 mt-3 max-w-[42rem]">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">Nói tự do</h1>
        <p className="mt-2 text-ink-soft text-pretty">
          Trò chuyện với Alex về bất cứ chuyện gì: công việc, sở thích, phim ảnh, hay hỏi cách nói một câu bằng tiếng
          Anh. Alex nói theo trình độ của bạn và sửa lỗi bằng cách nói lại câu đúng.
        </p>
      </header>
      <Conversation scenario={{ id, title, goal, opening, starters }} maxTurns={19} />
    </>
  );
}
