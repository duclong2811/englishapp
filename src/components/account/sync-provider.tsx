"use client";

import { useEffect, useRef } from "react";
import { signedIn, useViewer } from "@/lib/account/viewer";
import { allowNaturalVoice } from "@/lib/speaking/speaker";
import { SYNC_KEYS } from "@/lib/sync/merge";

const EVERY_MS = 60_000;

function readLocal() {
  const values: Record<string, string> = {};
  for (const key of SYNC_KEYS) {
    try {
      const v = localStorage.getItem(key);
      if (v) values[key] = v;
    } catch {
      // storage blocked
    }
  }
  return values;
}

/** Writes merged progress back and tells the stores on this page to re-read it. */
function writeLocal(values: Record<string, string>) {
  for (const [key, value] of Object.entries(values)) {
    try {
      if (localStorage.getItem(key) === value) continue;
      localStorage.setItem(key, value);
      window.dispatchEvent(new StorageEvent("storage", { key, newValue: value }));
    } catch {
      // storage blocked
    }
  }
}

/**
 * Keeps this browser's learning progress in the signed-in account: merges on
 * sign-in and page load, then sends changes every minute and when the page is hidden.
 */
export function SyncProvider() {
  const viewer = useViewer();
  const userId = signedIn(viewer) ? viewer.user.id : null;
  const last = useRef("");

  useEffect(() => {
    if (viewer) allowNaturalVoice(viewer.kind !== "guest");
  }, [viewer]);

  useEffect(() => {
    if (userId === null) return;
    let stopped = false;
    last.current = "";

    async function sync(opts: { keepalive?: boolean } = {}) {
      const body = JSON.stringify({ values: readLocal() });
      if (body === last.current) return;
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
          // keepalive requests are limited to 64 KB.
          keepalive: opts.keepalive && body.length < 60_000,
        });
        if (!res.ok || stopped) return;
        const { values } = (await res.json()) as { values: Record<string, string> };
        writeLocal(values);
        last.current = JSON.stringify({ values: readLocal() });
      } catch {
        // offline: try again later
      }
    }

    void sync();
    const timer = window.setInterval(() => void sync(), EVERY_MS);
    const onHide = () => {
      if (document.visibilityState === "hidden") void sync({ keepalive: true });
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [userId]);

  return null;
}
