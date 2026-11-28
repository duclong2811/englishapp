"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AccountLink } from "@/components/account/account-link";

type NavItem = { href: string; label: string; icon: ReactNode; /** Other paths that belong to this item. */ also?: string[] };

const iconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Hôm nay",
    icon: (
      <svg {...iconProps}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/lessons",
    label: "Bài học",
    icon: (
      <svg {...iconProps}>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M4 5.5v16M9 8h7M9 12h5" />
      </svg>
    ),
  },
  {
    href: "/vocabulary",
    label: "Từ vựng",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="7" width="13" height="14" rx="2" />
        <path d="M8 3h11a2 2 0 0 1 2 2v12" />
        <path d="M7 15l2.5-5 2.5 5M7.8 13.5h3.4" />
      </svg>
    ),
  },
  {
    href: "/flashcards",
    label: "Ôn tập",
    also: ["/tests"],
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="6" width="14" height="14" rx="2" />
        <path d="M7 3h12a2 2 0 0 1 2 2v12" />
        <path d="M7 13l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/speaking",
    label: "Luyện nói",
    icon: (
      <svg {...iconProps}>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
    ),
  },
];

function isActive(pathname: string, item: NavItem) {
  if (item.href === "/") return pathname === "/";
  return [item.href, ...(item.also ?? [])].some((p) => pathname.startsWith(p));
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden border-r border-line bg-sheet lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:px-4 lg:py-8">
        <Link
          href="/"
          className="mb-10 rounded-md px-3 text-xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-accent"
        >
          Vở <span className="en italic">tiếng Anh</span>
        </Link>
        <nav aria-label="Điều hướng chính">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                      active
                        ? "bg-accent/10 text-accent"
                        : "text-ink-soft hover:bg-line/50 hover:text-ink"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <AccountLink variant="sidebar" />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-paper/90 px-4 pb-1.5 pt-[calc(0.375rem+env(safe-area-inset-top))] backdrop-blur lg:hidden">
        <Link href="/" className="inline-flex min-h-11 items-center text-lg font-semibold tracking-tight">
          Vở <span className="en ml-1.5 italic">tiếng Anh</span>
        </Link>
        <AccountLink variant="topbar" />
      </header>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Điều hướng chính"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-sheet/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent ${
                    active ? "text-accent" : "text-ink-soft"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
