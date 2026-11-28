"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signedIn, useViewer } from "@/lib/account/viewer";

function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

const label = (name: string, email: string) => name || email.split("@")[0];

/** Sign-in or account link. Hidden when the site has no accounts. */
export function AccountLink({ variant }: { variant: "sidebar" | "topbar" }) {
  const viewer = useViewer();
  const pathname = usePathname();
  if (!viewer || viewer.kind === "open") return null;
  const user = signedIn(viewer) ? viewer.user : null;
  const href = user ? "/account" : `/login?next=${encodeURIComponent(pathname)}`;
  const active = pathname.startsWith("/account") || pathname.startsWith("/login");

  if (variant === "topbar") {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-medium text-ink-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-accent aria-[current=page]:text-accent"
      >
        <PersonIcon />
        <span className="max-w-[9rem] truncate">{user ? label(user.name, user.email) : "Đăng nhập"}</span>
      </Link>
    );
  }

  const item = (to: string, text: string, current: boolean, icon: React.ReactNode) => (
    <Link
      href={to}
      aria-current={current ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
        current ? "bg-accent/10 text-accent" : "text-ink-soft hover:bg-line/50 hover:text-ink"
      }`}
    >
      {icon}
      <span className="min-w-0 truncate">{text}</span>
    </Link>
  );

  return (
    <div className="mt-auto flex flex-col gap-1 border-t border-line pt-4">
      {viewer.kind === "admin"
        ? item(
            "/admin",
            "Quản trị",
            pathname.startsWith("/admin"),
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" />
            </svg>,
          )
        : null}
      {item(href, user ? label(user.name, user.email) : "Đăng nhập", active, <PersonIcon />)}
    </div>
  );
}
