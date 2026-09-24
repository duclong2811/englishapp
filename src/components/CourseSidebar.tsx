"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChevronDown } from "lucide-react";

export type SidebarUnit = { id: string; label: string; title: string; href: string; lessons: Array<{ id: string; number: number; title: string; href: string }> };

export function CourseSidebar({ units }: { units: SidebarUnit[] }) {
  const pathname = usePathname();
  /** Unit đang học được mở sẵn; mặc định mở unit A2 đầu tiên trong danh sách. */
  const defaultOpenId = units[1]?.id ?? units[0]?.id;
  return (
    <aside className="course-sidebar">
      <div className="course-sidebar-heading">
        <span>NỘI DUNG KHÓA HỌC</span>
        <strong>Tiếng Anh A1–A2</strong>
      </div>
      <nav aria-label="Danh sách unit và bài học">
        {units.map((unit) => {
          const active = pathname === unit.href || unit.lessons.some((lesson) => pathname === lesson.href);
          return (
            <details className="course-unit" key={unit.id} open={active || unit.id === defaultOpenId}>
              <summary>
                <span>
                  <small>{unit.label}</small>
                  <strong>{unit.title}</strong>
                </span>
                <ChevronDown size={16} />
              </summary>
              <div className="course-lessons">
                <Link className={pathname === unit.href ? "active" : ""} href={unit.href}>
                  <BookOpen size={14} />
                  <span>Tổng quan Unit</span>
                </Link>
                {unit.lessons.map((lesson) => (
                  <Link className={pathname === lesson.href ? "active" : ""} href={lesson.href} key={lesson.id}>
                    <span className="lesson-dot">{lesson.number}</span>
                    <span>{lesson.title}</span>
                  </Link>
                ))}
              </div>
            </details>
          );
        })}
      </nav>
    </aside>
  );
}
