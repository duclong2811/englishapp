"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { postJson, refreshViewer, useViewer } from "@/lib/account/viewer";
import { input, primary } from "./ui";

type Mode = "login" | "register";

/** Only paths on this site, so the link cannot send people elsewhere. */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

export function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const viewer = useViewer();
  const [mode, setMode] = useState<Mode>(params.get("mode") === "register" ? "register" : "login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const next = safeNext(params.get("next"));

  if (viewer?.kind === "open") {
    return <p className="max-w-[28rem] text-ink-soft">Trang web này chưa bật tài khoản. Mọi tính năng đang mở cho tất cả mọi người.</p>;
  }
  if (viewer?.kind === "member" || viewer?.kind === "admin") {
    return (
      <div className="max-w-[28rem]">
        <p>
          Bạn đang đăng nhập bằng <span className="font-semibold">{viewer.user.email}</span>.
        </p>
        <Link href="/account" className={`mt-4 ${primary}`}>
          Vào trang cá nhân
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    const { ok, data } = await postJson(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      ...(mode === "register" ? { name: String(form.get("name") ?? "") } : {}),
    }).catch(() => ({ ok: false, data: { error: "Không kết nối được. Kiểm tra mạng rồi thử lại." } as { error?: string } }));
    if (!ok) {
      setBusy(false);
      setError(data.error ?? "Có lỗi, thử lại nhé.");
      return;
    }
    await refreshViewer();
    router.push(next);
  }

  const tab = (m: Mode, text: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === m}
      onClick={() => {
        setMode(m);
        setError("");
      }}
      className={`min-h-11 flex-1 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
        mode === m ? "bg-accent text-accent-ink" : "text-ink-soft hover:text-ink"
      }`}
    >
      {text}
    </button>
  );

  return (
    <div className="max-w-[28rem]">
      <div role="tablist" aria-label="Đăng nhập hoặc tạo tài khoản" className="flex gap-1 rounded-full border border-line bg-sheet p-1">
        {tab("login", "Đăng nhập")}
        {tab("register", "Tạo tài khoản")}
      </div>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        {mode === "register" ? (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Tên hiển thị</span>
            <input name="name" autoComplete="nickname" maxLength={60} className={input} placeholder="Ví dụ: Lan" />
          </label>
        ) : null}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input name="email" type="email" required autoComplete="email" inputMode="email" spellCheck={false} className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Mật khẩu</span>
          <input
            name="password"
            type="password"
            required
            minLength={mode === "register" ? 8 : undefined}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className={input}
          />
          {mode === "register" ? <span className="mt-1.5 block text-sm text-ink-soft">Ít nhất 8 ký tự.</span> : null}
        </label>
        <p aria-live="polite" className="min-h-5 text-sm text-mistake">
          {error}
        </p>
        <button type="submit" disabled={busy || !viewer} className={primary}>
          {busy ? "Đang xử lý…" : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
        </button>
      </form>

      <section className="mt-8 rounded-xl border border-line bg-sheet px-4 py-3 text-sm text-ink-soft">
        <h2 className="font-semibold text-ink">Thành viên được gì?</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Trò chuyện với AI, chấm bài viết và bài nói (có giới hạn mỗi ngày).</li>
          <li>Nhận giọng nói và giọng đọc tự nhiên.</li>
          <li>Tiến độ học được lưu vào tài khoản, học tiếp trên iPhone hay máy tính đều được.</li>
        </ul>
        <p className="mt-2">Không đăng nhập bạn vẫn học bài, từ vựng, thẻ ghi nhớ và làm bài kiểm tra bình thường.</p>
      </section>
    </div>
  );
}
