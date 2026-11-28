"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { postJson, useViewer } from "@/lib/account/viewer";
import { ago, featureName, usd } from "./admin-format";
import { DayBars, fillDays } from "./day-bars";
import { card, input, secondary } from "./ui";

export type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: "member" | "admin";
  status: "active" | "locked";
  created_at: string;
  last_login_at: string | null;
  words?: number;
  lessons?: number;
  tests?: number;
  active_at?: string | null;
  ai_week?: number;
  cost_week?: number;
};
type Stats = {
  users: { total: number; new_week: number; active_week: number; locked: number; admins: number };
  today: { feature: string; level: string; count: number; users: number }[];
  days: { day: string; count: number }[];
  costDays: { day: string; micro_usd: number }[];
  costModels: { model: string; input_tokens: number; output_tokens: number; micro_usd: number }[];
  spenders: { id: number; email: string; name: string; micro_usd: number }[];
};

const nf = new Intl.NumberFormat("vi-VN");
const select =
  "min-h-11 rounded-xl border border-line bg-sheet px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-accent";

/** Admin-only gate shared by the admin pages. */
export function AdminOnly({ children }: { children: (selfId: number) => React.ReactNode }) {
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
  return <>{children(viewer.user.id)}</>;
}

export function AdminPage() {
  return (
    <AdminOnly>
      {(selfId) => (
        <div className="flex flex-col gap-8">
          <StatsPanel />
          <UsersPanel selfId={selfId} />
        </div>
      )}
    </AdminOnly>
  );
}

function StatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    void fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats);
  }, []);
  const tiles: [string, number | undefined][] = [
    ["Thành viên", stats?.users.total],
    ["Mới trong 7 ngày", stats?.users.new_week],
    ["Đăng nhập 7 ngày", stats?.users.active_week],
    ["Đang khóa", stats?.users.locked],
  ];
  const costDays = fillDays(stats?.costDays ?? [], (r) => r.micro_usd);
  const callDays = fillDays(stats?.days ?? [], (r) => r.count);
  const cost14 = costDays.reduce((s, d) => s + d.value, 0);
  const costToday = costDays.at(-1)?.value ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] [&>*]:min-w-0">
      <div className="flex flex-col gap-4">
        <section aria-labelledby="cost-heading" className={card}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="cost-heading" className="font-semibold">
              Chi phí AI ước tính
            </h2>
            <p className="text-sm text-ink-soft">Theo bảng giá model, tính từ số token mỗi lần gọi</p>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-ink-soft">Hôm nay</dt>
              <dd className="text-2xl font-semibold tabular-nums">{stats ? usd(costToday) : "…"}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">14 ngày</dt>
              <dd className="text-2xl font-semibold tabular-nums">{stats ? usd(cost14) : "…"}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">Ước tính 30 ngày</dt>
              <dd className="text-2xl font-semibold tabular-nums">{stats ? usd((cost14 / 14) * 30) : "…"}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <DayBars days={costDays} label="Chi phí AI theo ngày" format={usd} />
          </div>
          {stats?.costModels.length ? (
            <table className="mt-4 w-full text-sm tabular-nums">
              <thead>
                <tr className="border-b border-line text-left text-ink-soft">
                  <th scope="col" className="py-2 pr-3 font-medium">Model (14 ngày)</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">Token vào</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">Token ra</th>
                  <th scope="col" className="py-2 pl-2 text-right font-medium">Chi phí</th>
                </tr>
              </thead>
              <tbody>
                {stats.costModels.map((m) => (
                  <tr key={m.model} className="border-b border-line last:border-0">
                    <td className="py-2 pr-3" translate="no">{m.model}</td>
                    <td className="px-2 py-2 text-right">{nf.format(m.input_tokens)}</td>
                    <td className="px-2 py-2 text-right">{nf.format(m.output_tokens)}</td>
                    <td className="py-2 pl-2 text-right">{usd(m.micro_usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </section>

        <section aria-labelledby="ai-today" className={card}>
          <h2 id="ai-today" className="font-semibold">
            Lượt AI hôm nay
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
          <h3 className="mt-5 text-sm font-medium text-ink-soft">Lượt AI 14 ngày (không tính nhận giọng nói)</h3>
          <div className="mt-2">
            <DayBars days={callDays} label="Lượt AI theo ngày" format={(v) => `${v} lượt`} />
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-4">
        <dl className="grid grid-cols-2 gap-3">
          {tiles.map(([k, v]) => (
            <div key={k} className="rounded-xl border border-line bg-sheet px-4 py-3">
              <dt className="text-xs text-ink-soft">{k}</dt>
              <dd className="text-2xl font-semibold tabular-nums">{v === undefined ? "…" : nf.format(v)}</dd>
            </div>
          ))}
        </dl>
        <section aria-labelledby="spenders" className={card}>
          <h2 id="spenders" className="font-semibold">
            Tốn AI nhất 7 ngày
          </h2>
          {stats && !stats.spenders.length ? <p className="mt-2 text-sm text-ink-soft">Chưa có.</p> : null}
          <ol className="mt-2">
            {stats?.spenders.map((u, i) => (
              <li key={u.id}>
                <Link
                  href={`/admin/users/${u.id}`}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-2 transition-colors hover:bg-line/40 focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <span className="w-4 text-sm text-ink-soft tabular-nums">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{u.name || u.email}</span>
                  <span className="text-sm tabular-nums">{usd(u.micro_usd)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

/** Role, lock and password-reset buttons for one user. */
export function UserActions({ user, onChange }: { user: AdminUser; onChange: (u: Partial<AdminUser>, notice: string) => void }) {
  async function change(patch: Record<string, unknown>, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    const { ok, data } = await postJson<{ user: AdminUser; password?: string }>(`/api/admin/users/${user.id}`, patch, "PATCH");
    if (!ok) return onChange({}, data.error ?? "Chưa làm được.");
    onChange(
      data.user,
      data.password
        ? `Mật khẩu tạm của ${user.email}: ${data.password} (chỉ hiện một lần, hãy gửi cho người dùng và nhắc họ đổi lại).`
        : "Đã lưu.",
    );
  }
  const btn = `${secondary} min-h-10 px-3 text-xs`;
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={btn}
        onClick={() =>
          change(
            { role: user.role === "admin" ? "member" : "admin" },
            user.role === "admin" ? `Hạ ${user.email} về thành viên?` : `Cho ${user.email} làm quản trị viên (dùng AI không giới hạn)?`,
          )
        }
      >
        {user.role === "admin" ? "Hạ quyền" : "Cho làm quản trị"}
      </button>
      <button
        type="button"
        className={btn}
        onClick={() =>
          change(
            { status: user.status === "locked" ? "active" : "locked" },
            user.status === "locked" ? undefined : `Khóa ${user.email}? Người này sẽ bị đăng xuất.`,
          )
        }
      >
        {user.status === "locked" ? "Mở khóa" : "Khóa"}
      </button>
      <button type="button" className={btn} onClick={() => change({ resetPassword: true }, `Tạo mật khẩu tạm mới cho ${user.email}?`)}>
        Đặt lại mật khẩu
      </button>
    </div>
  );
}

export function RoleBadge({ user }: { user: Pick<AdminUser, "role" | "status"> }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        user.status === "locked" ? "bg-mistake/10 text-mistake" : user.role === "admin" ? "bg-accent/10 text-accent" : "bg-line/50 text-ink-soft"
      }`}
    >
      {user.status === "locked" ? "Đã khóa" : user.role === "admin" ? "Quản trị" : "Thành viên"}
    </span>
  );
}

function UsersPanel({ selfId }: { selfId: number }) {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("recent");
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [more, setMore] = useState(false);
  const load = useCallback(
    async (offset = 0) => {
      const params = new URLSearchParams({ q, role, status, sort, offset: String(offset) });
      const r = await fetch(`/api/admin/users?${params}`, { cache: "no-store" });
      if (!r.ok) return;
      const data = (await r.json()) as { users: AdminUser[]; more: boolean };
      setUsers((prev) => (offset ? [...(prev ?? []), ...data.users] : data.users));
      setMore(data.more);
    },
    [q, role, status, sort],
  );

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(t);
  }, [load]);

  return (
    <section aria-labelledby="users-heading">
      <h2 id="users-heading" className="text-lg font-semibold">
        Học sinh và thành viên
      </h2>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="min-w-0 flex-1 basis-60">
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
        <label>
          <span className="sr-only">Vai trò</span>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={select}>
            <option value="">Mọi vai trò</option>
            <option value="member">Thành viên</option>
            <option value="admin">Quản trị</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Trạng thái</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={select}>
            <option value="">Mọi trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Đã khóa</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Sắp xếp</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={select}>
            <option value="recent">Hoạt động gần nhất</option>
            <option value="words">Học nhiều từ nhất</option>
            <option value="ai">Dùng AI nhiều nhất (7 ngày)</option>
            <option value="cost">Tốn chi phí nhất (7 ngày)</option>
            <option value="new">Mới tham gia</option>
          </select>
        </label>
      </div>
      {users === null ? <p className="mt-4 text-ink-soft">Đang tải…</p> : null}
      {users?.length === 0 ? <p className="mt-4 text-ink-soft">Không có ai khớp.</p> : null}
      <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {users?.map((u) => (
          <li key={u.id}>
            <Link
              href={`/admin/users/${u.id}`}
              className="flex h-full flex-col gap-3 rounded-xl border border-line bg-sheet p-4 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {u.name || u.email.split("@")[0]}
                    {u.id === selfId ? <span className="font-normal text-ink-soft"> (bạn)</span> : null}
                  </span>
                  <span className="block truncate text-sm text-ink-soft">{u.email}</span>
                </span>
                <RoleBadge user={u} />
              </span>
              <span className="grid grid-cols-3 gap-2 text-center">
                {(
                  [
                    ["Từ", u.words ?? 0],
                    ["Bài đạt", u.lessons ?? 0],
                    ["AI 7 ngày", u.ai_week ?? 0],
                  ] as const
                ).map(([k, v]) => (
                  <span key={k} className="rounded-lg bg-line/30 px-2 py-1.5">
                    <span className="block text-xs text-ink-soft">{k}</span>
                    <span className="block font-semibold tabular-nums">{nf.format(v)}</span>
                  </span>
                ))}
              </span>
              <span className="text-xs text-ink-soft">
                Học gần nhất: {ago(u.active_at)} · Chi phí 7 ngày {usd(u.cost_week ?? 0)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {more ? (
        <button type="button" className={`${secondary} mt-4`} onClick={() => void load(users?.length ?? 0)}>
          Xem thêm
        </button>
      ) : null}
    </section>
  );
}
