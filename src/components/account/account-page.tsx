"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { AI_FEATURE_VI, AI_RULES, TRANSCRIBE_DAILY, type AiFeature, type PolicyLevel } from "@/lib/ai/policy";
import { postJson, refreshViewer, setViewer, signedIn, useViewer, type UsageRow } from "@/lib/account/viewer";
import { grammarScores } from "@/lib/grammar/progress";
import * as speakStore from "@/lib/speaking/progress";
import { testScores } from "@/lib/tests/progress";
import * as srs from "@/lib/vocab/srs-store";
import { summarize, type LearningCatalog } from "@/lib/account/summary";
import { LevelProgress, WeakSpots } from "./progress-panels";
import { card, input, primary, secondary } from "./ui";

const LEVELS: PolicyLevel[] = ["A1", "A2", "B1", "B2"];
const FEATURES: AiFeature[] = ["write-check", "talk-check", "speak-chat", "speak-feedback"];

function used(usage: UsageRow[] | undefined, feature: string, level: string) {
  return usage?.find((u) => u.feature === feature && u.level === level)?.count ?? 0;
}

export function AccountPage({ catalog }: { catalog: LearningCatalog }) {
  const viewer = useViewer();
  const router = useRouter();
  // Fresh AI counts each time the page opens.
  useEffect(() => void refreshViewer(), []);

  if (!viewer) return <p className="text-ink-soft">Đang tải…</p>;
  if (viewer.kind === "open") return <p className="text-ink-soft">Trang web này chưa bật tài khoản.</p>;
  if (!signedIn(viewer)) {
    return (
      <div className={`${card} max-w-[28rem]`}>
        <p>Bạn chưa đăng nhập.</p>
        <Link href="/login?next=/account" className={`mt-4 ${primary}`}>
          Đăng nhập
        </Link>
      </div>
    );
  }

  const admin = viewer.kind === "admin";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setViewer({ kind: "guest" });
    router.push("/");
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] [&>*]:min-w-0">
      <div className="flex flex-col gap-4">
        <Profile name={viewer.user.name} email={viewer.user.email} admin={admin} since={viewer.user.created_at} />
        <LearnerProgress catalog={catalog} />

        <section aria-labelledby="ai-heading" className={card}>
          <h2 id="ai-heading" className="text-lg font-semibold">
            Lượt dùng AI hôm nay
          </h2>
          <p className="mt-1 text-sm text-ink-soft text-pretty">
            {admin ? "Quản trị viên dùng không giới hạn." : "Mỗi ngày bạn có số lượt cố định cho từng cấp độ. Lượt mới có lúc 0 giờ (giờ Việt Nam)."}
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[26rem] text-sm tabular-nums">
              <thead>
                <tr className="border-b border-line text-left text-ink-soft">
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Tính năng
                  </th>
                  {LEVELS.map((l) => (
                    <th key={l} scope="col" className="px-2 py-2 text-right font-medium" translate="no">
                      {l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f) => (
                  <tr key={f} className="border-b border-line last:border-0">
                    <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                      {AI_FEATURE_VI[f]}
                    </th>
                    {LEVELS.map((l) => {
                      const n = used(viewer.usage, f, l);
                      const limit = AI_RULES[f][l].daily;
                      const full = !admin && n >= limit;
                      return (
                        <td key={l} className={`px-2 py-2.5 text-right ${full ? "text-mistake" : n ? "" : "text-ink-soft"}`}>
                          {admin ? n : `${n}/${limit}`}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Nhận giọng nói: {used(viewer.usage, "transcribe", "A1")}
            {admin ? "" : `/${TRANSCRIBE_DAILY}`} lượt.
          </p>
        </section>
      </div>

      <div className="flex flex-col gap-4">
        <Stats />
        <PasswordForm />
        <button type="button" onClick={logout} className={`${secondary} self-start`}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

function Profile({ name, email, admin, since }: { name: string; email: string; admin: boolean; since?: string }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = String(new FormData(e.currentTarget).get("name") ?? "");
    const { ok, data } = await postJson("/api/auth/me", { name: value }, "PATCH");
    if (!ok) return setError(data.error ?? "Chưa lưu được.");
    await refreshViewer();
    setEditing(false);
  }

  return (
    <section aria-labelledby="profile-heading" className="oli rounded-2xl border border-line p-6 sm:p-7">
      <p className="text-sm font-medium text-ink-soft">{admin ? "Quản trị viên" : "Thành viên"}</p>
      {editing ? (
        <form onSubmit={save} className="mt-2 flex flex-wrap items-end gap-3">
          <label className="min-w-0 flex-1">
            <span className="mb-1.5 block text-sm font-medium">Tên hiển thị</span>
            <input name="name" defaultValue={name} maxLength={60} autoComplete="nickname" className={input} autoFocus />
          </label>
          <button type="submit" className={primary}>
            Lưu
          </button>
          <button type="button" onClick={() => setEditing(false)} className={secondary}>
            Hủy
          </button>
          {error ? <p className="w-full text-sm text-mistake">{error}</p> : null}
        </form>
      ) : (
        <>
          <h2 id="profile-heading" className="mt-1 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {name || email.split("@")[0]}
          </h2>
          <p className="mt-1 break-all text-ink-soft">{email}</p>
          {since ? (
            <p className="mt-1 text-sm text-ink-soft">Tham gia từ {new Date(since).toLocaleDateString("vi-VN")}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setEditing(true)} className={secondary}>
              Đổi tên
            </button>
            {admin ? (
              <Link href="/admin" className={secondary}>
                Trang quản trị
              </Link>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}

function LearnerProgress({ catalog }: { catalog: LearningCatalog }) {
  const vocab = useSyncExternalStore(srs.subscribe, srs.getSnapshot, srs.getServerSnapshot);
  const grammar = useSyncExternalStore(grammarScores.subscribe, grammarScores.getSnapshot, grammarScores.getServerSnapshot);
  const tests = useSyncExternalStore(testScores.subscribe, testScores.getSnapshot, testScores.getServerSnapshot);
  const summary = useMemo(
    () => (vocab && grammar && tests ? summarize(catalog, { cards: vocab.cards, grammar, tests }) : null),
    [catalog, vocab, grammar, tests],
  );
  if (!summary) return null;
  return (
    <>
      <LevelProgress summary={summary} />
      <WeakSpots summary={summary} />
    </>
  );
}

function Stats() {
  const vocab = useSyncExternalStore(srs.subscribe, srs.getSnapshot, srs.getServerSnapshot);
  const grammar = useSyncExternalStore(grammarScores.subscribe, grammarScores.getSnapshot, grammarScores.getServerSnapshot);
  const tests = useSyncExternalStore(testScores.subscribe, testScores.getSnapshot, testScores.getServerSnapshot);
  const speak = useSyncExternalStore(speakStore.subscribe, speakStore.getSnapshot, speakStore.getServerSnapshot);
  const nf = new Intl.NumberFormat("vi-VN");
  const rows: [string, string][] = [
    ["Từ đã học", vocab ? nf.format(Object.keys(vocab.cards).length) : "…"],
    ["Bài ngữ pháp đạt", grammar ? nf.format(Object.values(grammar).filter((s) => s.best >= 80).length) : "…"],
    ["Bài kiểm tra đã làm", tests ? nf.format(Object.keys(tests).length) : "…"],
    ["Bài luyện nói", speak ? nf.format(Object.keys(speak).length) : "…"],
  ];
  return (
    <section aria-labelledby="stats-heading" className={card}>
      <h2 id="stats-heading" className="font-semibold">
        Tiến độ học
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        {rows.map(([k, v]) => (
          <div key={k} className="rounded-xl bg-line/30 px-3 py-2">
            <dt className="text-xs text-ink-soft">{k}</dt>
            <dd className="text-xl font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm text-ink-soft text-pretty">Tiến độ tự đồng bộ với tài khoản trên mọi thiết bị bạn đăng nhập.</p>
    </section>
  );
}

function PasswordForm() {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    setBusy(true);
    const { ok, data } = await postJson("/api/auth/password", { current: form.get("current"), next: form.get("next") });
    setBusy(false);
    setMessage(ok ? { ok, text: "Đã đổi mật khẩu. Các thiết bị khác đã được đăng xuất." } : { ok, text: data.error ?? "Chưa đổi được." });
    if (ok) formEl.reset();
  }

  return (
    <section aria-labelledby="pw-heading" className={card}>
      <h2 id="pw-heading" className="font-semibold">
        Đổi mật khẩu
      </h2>
      <form onSubmit={submit} className="mt-3 flex flex-col gap-3">
        <label>
          <span className="mb-1.5 block text-sm font-medium">Mật khẩu hiện tại</span>
          <input name="current" type="password" required autoComplete="current-password" className={input} />
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-medium">Mật khẩu mới</span>
          <input name="next" type="password" required minLength={8} autoComplete="new-password" className={input} />
        </label>
        <p aria-live="polite" className={`min-h-5 text-sm ${message?.ok ? "text-correct" : "text-mistake"}`}>
          {message?.text}
        </p>
        <button type="submit" disabled={busy} className={`${secondary} self-start`}>
          {busy ? "Đang lưu…" : "Đổi mật khẩu"}
        </button>
      </form>
    </section>
  );
}
