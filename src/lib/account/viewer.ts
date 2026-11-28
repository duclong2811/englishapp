"use client";

import { useSyncExternalStore } from "react";

export type AccountUser = { id: number; email: string; name: string; role: "member" | "admin"; created_at?: string };
export type UsageRow = { feature: string; level: string; count: number };

/**
 * open: accounts are not set up on this site (AI works as before);
 * guest: not signed in, AI off; member: AI within limits; admin: no limits.
 */
export type ClientViewer =
  | { kind: "open" }
  | { kind: "guest" }
  | { kind: "member" | "admin"; user: AccountUser; usage?: UsageRow[] };

const listeners = new Set<() => void>();
let snapshot: ClientViewer | null = null;
let loading: Promise<void> | null = null;

function emit() {
  listeners.forEach((l) => l());
}

/** Asks the server who is signed in. */
export function refreshViewer(): Promise<void> {
  loading = fetch("/api/auth/me", { cache: "no-store" })
    .then((r) => (r.ok ? (r.json() as Promise<ClientViewer>) : ({ kind: "open" } as ClientViewer)))
    .catch(() => snapshot ?? ({ kind: "open" } as ClientViewer))
    .then((v) => {
      snapshot = v;
      emit();
    });
  return loading;
}

export function setViewer(v: ClientViewer) {
  snapshot = v;
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  if (!snapshot && !loading) void refreshViewer();
  return () => listeners.delete(l);
}

/** The current viewer, or null while it is loading. */
export function useViewer(): ClientViewer | null {
  return useSyncExternalStore(subscribe, () => snapshot, () => null);
}

export const signedIn = (v: ClientViewer | null): v is Extract<ClientViewer, { user: AccountUser }> =>
  v?.kind === "member" || v?.kind === "admin";

export async function postJson<T = Record<string, unknown>>(url: string, body: unknown, method = "POST") {
  const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  return { ok: res.ok, status: res.status, data };
}
