"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AI_FEATURE_VI, type AiFeature } from "@/lib/ai/policy";
import { postJson, useViewer } from "@/lib/account/viewer";
import { card, input, secondary } from "./ui";

type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: "member" | "admin";
  status: "active" | "locked";
  created_at: string;
  last_login_at: string | null;
  ai_today: number;
};
type Stats = {
  users: { total: number; new_week: number; active_week: number; locked: number; admins: number };
  today: { feature: string; level: string; count: number; users: number }[];
  days: { day: string; count: number }[];
};

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("vi-VN") : "—");
const featureName = (f: string) => (f === "transcribe" ? "Nhận giọng nói" : (AI_FEATURE_VI[f as AiFeature] ?? f));

export function AdminPage() {
  const viewer = useViewer();
  if (!viewer) return <p className="text-ink-soft">Đang tải…</p>;
  if (viewer.kind !== "admin") {
    return (
      <p className="text-ink-soft">
        Trang này chỉ dành cho quản trị viên.{" "}
        {viewer.kind === "guest" ? (
          <Link href="/login?next=/admin" className="font-semibold text-accent hover:underline">
            Đăng nhập
          </Link>
        ) : null}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-8">
      <StatsPanel />
      <UsersPanel selfId={viewer.user.id} />
    </div>
  );
}

function StatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    void fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats);
  }, []);
  const nf = new Intl.NumberFormat("vi-VN");
  const tiles: [string, number | undefined][] = [
    ["Thành viên", stats?.users.total],
    ["Mới trong 7 ngày", stats?.users.new_week],
    ["Đăng nhập 7 ngày", stats?.users.active_week],
    ["Đang khóa", stats?.users.locked],
  ];
  const peak = Math.max(1, ...(stats?.days.map((d) => d.count) ?? [1]));

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <section aria-labelledby="ai-today" className={card}>
        <h2 id="ai-today" className="font-semibold">
          AI hôm nay
        </h2>
        {stats && stats.today.length === 0 ? <p className="mt-2 text-sm text-ink-soft">Chưa có lượt nào.</p> : null}
        {stats?.today.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[22rem] text-sm tabular-nums">
              <thead>
                <tr className="border-b border-line text-left text-ink-soft">
                  <th scope="col" className="py-2 pr-3 font-medium">Tính năng</th>
                  <th scope="col" className="px-2 py-2 font-medium">Cấp</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">Lượt</th>
                  <th scope="col" className="py-2 pl-2 text-right font-medium">Người</th>
                </tr>
              </thead>
              <tbody>
                {stats.today.map((r) => (
                  <tr key={`${r.feature}-${r.level}`} className="border-b border-line last:border-0">
                    <td className="py-2 pr-3">{featureName(r.feature)}</td>
                    <td className="px-2 py-2" translate="no">{r.feature === "transcribe" ? "—" : r.level}</td>
                    <td className="px-2 py-2 text-right">{nf.format(r.count)}</td>
                    <td className="py-2 pl-2 text-right">{nf.format(r.users)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {stats?.days.length ? (
          <>
            <h3 className="mt-5 text-sm font-medium text-ink-soft">Lượt AI 14 ngày qua (không tính nhận giọng nói)</h3>
            <ol className="mt-2 flex h-24 items-end gap-1" aria-label="Lượt AI theo ngày">
              {stats.days.map((d) => (
                <li key={d.day} className="flex h-full flex-1 flex-col justify-end" title={`${d.day}: ${d.count}`}>
                  <span className="block rounded-t bg-accent/70" style={{ height: `${Math.max(4, (d.count / peak) * 100)}%` }} />
                  <span className="sr-only">
                    {d.day}: {d.count} lượt
                  </span>
                </li>
              ))}
            </ol>
          </>
        ) : null}
      </section>
      <dl className="grid grid-cols-2 gap-3 self-start">
        {tiles.map(([k, v]) => (
          <div key={k} className="rounded-xl border border-line bg-sheet px-4 py-3">
            <dt className="text-xs text-ink-soft">{k}</dt>
            <dd className="text-2xl font-semibold tabular-nums">{v === undefined ? "…" : nf.format(v)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function UsersPanel({ selfId }: { selfId: number }) {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [more, setMore] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async (query: string, offset = 0) => {
    const r = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}&offset=${offset}`, { cache: "no-store" });
    if (!r.ok) return;
    const data = (await r.json()) as { users: AdminUser[]; more: boolean };
    setUsers((prev) => (offset ? [...(prev ?? []), ...data.users] : data.users));
    setMore(data.more);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void load(q), 250);
    return () => window.clearTimeout(t);
  }, [q, load]);

  async function change(user: AdminUser, patch: Record<string, unknown>, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    const { ok, data } = await postJson<{ user: AdminUser; password?: string }>(`/api/admin/users/${user.id}`, patch, "PATCH");
    if (!ok) return setNotice(data.error ?? "Chưa làm được.");
    setUsers((list) => list?.map((u) => (u.id === user.id ? { ...u, ...data.user } : u)) ?? null);
    setNotice(
      data.password
        ? `Mật khẩu tạm của ${user.email}: ${data.password} (chỉ hiện một lần, hãy gửi cho người dùng và nhắc họ đổi lại).`
        : "Đã lưu.",
    );
  }

  return (
    <section aria-labelledby="users-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="users-heading" className="text-lg font-semibold">
          Người dùng
        </h2>
        <label className="w-full sm:w-72">
          <span className="sr-only">Tìm theo email hoặc tên</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo email hoặc tên"
            className={input}
            spellCheck={false}
          />
        </label>
      </div>
      {notice ? (
        <p role="status" className="mt-3 rounded-xl border border-line bg-sheet px-4 py-3 text-sm break-words">
          {notice}
        </p>
      ) : null}
      {users === null ? <p className="mt-4 text-ink-soft">Đang tải…</p> : null}
      {users?.length === 0 ? <p className="mt-4 text-ink-soft">Không có ai khớp.</p> : null}
      <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {users?.map((u) => {
          const self = u.id === selfId;
          return (
            <li key={u.id} className="flex flex-col gap-2 rounded-xl border border-line bg-sheet p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{u.name || u.email.split("@")[0]}</p>
                  <p className="truncate text-sm text-ink-soft">{u.email}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    u.status === "locked" ? "bg-mistake/10 text-mistake" : u.role === "admin" ? "bg-accent/10 text-accent" : "bg-line/50 text-ink-soft"
                  }`}
                >
                  {u.status === "locked" ? "Đã khóa" : u.role === "admin" ? "Quản trị" : "Thành viên"}
                </span>
              </div>
              <p className="text-xs text-ink-soft tabular-nums">
                Tham gia {date(u.created_at)} · Đăng nhập {date(u.last_login_at)} · AI hôm nay {u.ai_today}
              </p>
              {self ? (
                <p className="text-xs text-ink-soft">Đây là bạn.</p>
              ) : (
                <div className="mt-1 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`${secondary} min-h-10 px-3 text-xs`}
                    onClick={() =>
                      change(
                        u,
                        { role: u.role === "admin" ? "member" : "admin" },
                        u.role === "admin" ? `Hạ ${u.email} về thành viên?` : `Cho ${u.email} làm quản trị viên (dùng AI không giới hạn)?`,
                      )
                    }
                  >
                    {u.role === "admin" ? "Hạ quyền" : "Cho làm quản trị"}
                  </button>
                  <button
                    type="button"
                    className={`${secondary} min-h-10 px-3 text-xs`}
                    onClick={() =>
                      change(
                        u,
                        { status: u.status === "locked" ? "active" : "locked" },
                        u.status === "locked" ? undefined : `Khóa ${u.email}? Người này sẽ bị đăng xuất.`,
                      )
                    }
                  >
                    {u.status === "locked" ? "Mở khóa" : "Khóa"}
                  </button>
                  <button
                    type="button"
                    className={`${secondary} min-h-10 px-3 text-xs`}
                    onClick={() => change(u, { resetPassword: true }, `Tạo mật khẩu tạm mới cho ${u.email}?`)}
                  >
                    Đặt lại mật khẩu
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {more ? (
        <button type="button" className={`${secondary} mt-4`} onClick={() => void load(q, users?.length ?? 0)}>
          Xem thêm
        </button>
      ) : null}
    </section>
  );
}
