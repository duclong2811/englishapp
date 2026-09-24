"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/curriculum", "Bài học"],
  ["/practice", "Nghe và nói"],
  ["/writing", "Viết"],
  ["/vocabulary", "Từ vựng"],
  ["/review", "Ôn tập"],
] as const;

export function CourseTopNav() {
  const pathname = usePathname();
  return (
    <nav className="course-top-nav" aria-label="Khu vực học tập">
      {links.map(([href, label]) => (
        <Link className={pathname.startsWith(href) ? "active" : ""} href={href} key={href}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
