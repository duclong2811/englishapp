"use client";

import { useEffect, useMemo, useState } from "react";
import { AI_RULES, type AiFeature, type PolicyLevel } from "@/lib/ai/policy";
import { readProgress, summarize, type LearningCatalog } from "@/lib/account/summary";
import { ago, date, featureName, usd } from "./admin-format";
import { AdminOnly, RoleBadge, UserActions, type AdminUser } from "./admin-page";
import { DayBars, fillDays } from "./day-bars";
import { LevelProgress, WeakSpots } from "./progress-panels";
import { card } from "./ui";

type Profile = {
  user: AdminUser;
  stats: { words: number; lessons: number; tests: number; active_at: string | null } | null;
  values: Record<string, string>;
  syncedAt: string | null;
  usage: { day: string; feature: string; level: string; count: number }[];
  cost: { day: string; feature: string; model: string; input_tokens: number; output_tokens: number; micro_usd: number }[];
};

const nf = new Intl.NumberFormat("vi-VN");

export function AdminUserPage({ id, catalog }: { id: string; catalog: LearningCatalog }) {
  return <AdminOnly>{(selfId) => <UserProfile id={id} selfId={selfId} catalog={catalog} />}</AdminOnly>;
}

function UserProfile({ id, selfId, catalog }: { id: string; selfId: number; catalog: LearningCatalog }) {
  const [data, setData] = useState<Profile | null | "missing">(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void fetch(`/api/admin/users/${id}`, { cache: "no-store" })
      .then(async (r): Promise<Profile | "missing"> => (r.ok ? ((await r.json()) as Profile) : "missing"))
      .then(setData);
  }, [id]);

  const summary = useMemo(() => (data && data !== "missing" ? summarize(catalog, readProgress(data.values)) : null), [catalog, data]);

  if (data === null) return <p className="text-ink-soft">Đang tải…</p>;
  if (data === "missing") return <p className="text-ink-soft">Không tìm thấy người dùng này.</p>;
  const { user } = data;

  const callDays = fillDays(data.usage.filter((u) => u.feature !== "transcribe"), (r) => r.count);
  const costTotal = data.cost.reduce((s, c) => s + c.micro_usd, 0);
  const byFeature = new Map<string, { count: number; micro: number }>();
  for (const u of data.usage) {
    const e = byFeature.get(u.feature) ?? { count: 0, micro: 0 };
    e.count += u.count;
    byFeature.set(u.feature, e);
  }
  for (const c of data.cost) {
    const e = byFeature.get(c.feature) ?? { count: 0, micro: 0 };
    e.micro += c.micro_usd;
    byFeature.set(c.feature, e);
  }
  const today = callDays.at(-1)?.day;
  const usedToday = (f: AiFeature, l: PolicyLevel) =>
    data.usage.find((u) => u.day === today && u.feature === f && u.level === l)?.count ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] [&>*]:min-w-0">
      <div className="flex flex-col gap-4">
        <section className="oli rounded-2xl border border-line p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{user.name || user.email.split("@")[0]}</h2>
              <p className="mt-1 break-all text-ink-soft">{user.email}</p>
            </div>
            <RoleBadge user={user} />
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Tham gia {date(user.created_at)} · Đăng nhập {ago(user.last_login_at)} · Học gần nhất {ago(data.stats?.active_at)} · Đồng bộ{" "}
            {ago(data.syncedAt)}
          </p>
          {user.id === selfId ? null : (
            <div className="mt-4">
              <UserActions
                user={user}
                onChange={(patch, text) => {
                  setData((d) => (d && d !== "missing" ? { ...d, user: { ...d.user, ...patch } } : d));
                  setNotice(text);
                }}
              />
            </div>
          )}
          {notice ? (
            <p role="status" className="mt-3 rounded-xl border border-line bg-sheet px-4 py-3 text-sm break-words">
              {notice}
            </p>
          ) : null}
        </section>
        {summary ? (
          <>
            <LevelProgress summary={summary} learnerLinks={false} />
            <WeakSpots summary={summary} learnerLinks={false} />
          </>
        ) : null}
        {!data.syncedAt ? (
          <p className="text-sm text-ink-soft">Người này chưa đồng bộ tiến độ (chưa học trên thiết bị đã đăng nhập).</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        <section aria-labelledby="u-ai" className={card}>
          <h2 id="u-ai" className="font-semibold">
            AI 14 ngày
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Chi phí ước tính <span className="font-semibold text-ink tabular-nums">{usd(costTotal)}</span>
          </p>
          <div className="mt-3">
            <DayBars days={callDays} label="Lượt AI theo ngày" format={(v) => `${v} lượt`} />
          </div>
          {byFeature.size ? (
            <table className="mt-4 w-full text-sm tabular-nums">
              <thead>
                <tr className="border-b border-line text-left text-ink-soft">
                  <th scope="col" className="py-2 pr-2 font-medium">Tính năng</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">Lượt</th>
                  <th scope="col" className="py-2 pl-2 text-right font-medium">Chi phí</th>
                </tr>
              </thead>
              <tbody>
                {[...byFeature].map(([f, v]) => (
                  <tr key={f} className="border-b border-line last:border-0">
                    <td className="py-2 pr-2">{featureName(f)}</td>
                    <td className="px-2 py-2 text-right">{nf.format(v.count)}</td>
                    <td className="py-2 pl-2 text-right">{usd(v.micro)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">Chưa dùng AI.</p>
          )}
        </section>
        <section aria-labelledby="u-today" className={card}>
          <h2 id="u-today" className="font-semibold">
            Hôm nay so với giới hạn
          </h2>
          {user.role === "admin" ? <p className="mt-1 text-sm text-ink-soft">Quản trị viên không bị giới hạn.</p> : null}
          <table className="mt-2 w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-line text-left text-ink-soft">
                <th scope="col" className="py-2 pr-2 font-medium">Tính năng</th>
                {(["A1", "A2", "B1", "B2"] as PolicyLevel[]).map((l) => (
                  <th key={l} scope="col" className="px-1 py-2 text-right font-medium" translate="no">
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["write-check", "talk-check", "speak-chat", "speak-feedback"] as AiFeature[]).map((f) => (
                <tr key={f} className="border-b border-line last:border-0">
                  <th scope="row" className="py-2 pr-2 text-left font-normal">
                    {featureName(f)}
                  </th>
                  {(["A1", "A2", "B1", "B2"] as PolicyLevel[]).map((l) => {
                    const n = usedToday(f, l);
                    return (
                      <td key={l} className={`px-1 py-2 text-right ${n ? "" : "text-ink-soft"}`}>
                        {n}/{AI_RULES[f][l].daily}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
