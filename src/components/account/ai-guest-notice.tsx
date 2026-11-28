"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useViewer } from "@/lib/account/viewer";

/** Tells guests that AI features are off here and how to turn them on. */
export function AiGuestNotice({ className = "" }: { className?: string }) {
  const viewer = useViewer();
  const pathname = usePathname();
  if (viewer?.kind !== "guest") return null;
  const next = encodeURIComponent(pathname);
  return (
    <div role="note" className={`rounded-xl border border-line bg-sheet px-4 py-3 text-sm ${className}`}>
      <p className="text-pretty">
        <span className="font-semibold">Bạn đang xem ở chế độ khách.</span>{" "}
        <span className="text-ink-soft">
          Các tính năng AI (trò chuyện, chấm bài viết và bài nói, nhận giọng nói, giọng đọc tự nhiên) chỉ dành cho thành viên.
        </span>
      </p>
      <p className="mt-2 flex flex-wrap gap-x-4">
        <Link href={`/login?next=${next}`} className="inline-flex min-h-11 items-center font-semibold text-accent hover:underline">
          Đăng nhập
        </Link>
        <Link href={`/login?mode=register&next=${next}`} className="inline-flex min-h-11 items-center font-semibold text-accent hover:underline">
          Tạo tài khoản miễn phí
        </Link>
      </p>
    </div>
  );
}
