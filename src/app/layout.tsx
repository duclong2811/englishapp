import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Settings } from "lucide-react";
import { AssistProvider } from "@/components/AssistProvider";
import { LessonLanguageProvider } from "@/components/LessonLanguageProvider";
import { CourseSidebar, type SidebarUnit } from "@/components/CourseSidebar";
import { CourseTopNav } from "@/components/CourseTopNav";
import { course } from "@/content/course";
import { a2Units } from "@/content/a2-course";
import { unitEyebrow, unitPath } from "@/lib/curriculum/unit-label";
import "./globals.css";
import "./components.css";
import "./fonts.css";
import "./assist.css";
import "./audio.css";
import "./stabilization.css";
import "./bilingual.css";
import "./navigation.css";

export const metadata: Metadata = { title: "Damdam English", description: "Ứng dụng học tiếng Anh đời sống, ưu tiên dữ liệu cục bộ." };

const a1 = course.levels[0].units[0];
const sidebarUnits: SidebarUnit[] = [
  {
    id: "a1-unit-1",
    label: "A1 · UNIT 1",
    title: a1.title,
    href: "/curriculum",
    lessons: a1.lessons.map((lesson) => ({ id: lesson.id, number: lesson.number, title: lesson.titleEn, href: `/lesson/${lesson.id}` })),
  },
  ...a2Units.map((unit) => ({
    id: unit.id,
    label: unitEyebrow(unit.id),
    title: unit.titleVi,
    href: unitPath(unit.id),
    lessons: unit.lessons.map((lesson) => ({ id: lesson.id, number: lesson.number, title: lesson.titleVi, href: `/a2/lesson/${lesson.id}` })),
  })),
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <AssistProvider>
          <LessonLanguageProvider>
            <header className="topbar">
              <Link href="/" className="brand">
                <span className="brand-mark">D</span>
                <span>
                  <strong>Damdam English</strong>
                  <small>Học đều mỗi ngày, nói tự tin hơn</small>
                </span>
              </Link>
              <div className="topbar-actions">
                <span className="level-pill">
                  <span>A2</span> Tiếng Anh đời sống
                </span>
                <Link href="/settings" className="top-settings" aria-label="Cài đặt">
                  <Settings size={18} />
                </Link>
              </div>
            </header>
            <div className="app-shell">
              <Suspense fallback={<aside className="course-sidebar" />}>
                <CourseSidebar units={sidebarUnits} />
              </Suspense>
              <div className="content-shell">
                <Suspense fallback={<div className="course-top-nav-placeholder" />}>
                  <CourseTopNav />
                </Suspense>
                <main>{children}</main>
              </div>
            </div>
            <nav className="mobile-nav" aria-label="Khu vực học tập">
              <Link href="/curriculum">Bài học</Link>
              <Link href="/practice">Nghe</Link>
              <Link href="/writing">Viết</Link>
              <Link href="/vocabulary">Từ vựng</Link>
              <Link href="/review">Ôn tập</Link>
            </nav>
          </LessonLanguageProvider>
        </AssistProvider>
      </body>
    </html>
  );
}
