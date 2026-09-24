import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BilingualLessonPlayer } from "./BilingualLessonPlayer";
import { LessonLanguageProvider } from "./LessonLanguageProvider";
import { A2UnitPage } from "./A2UnitPage";
import { CourseTopNav } from "./CourseTopNav";
import { a2Lessons, a2Units } from "@/content/a2-course";

vi.mock("next/navigation", () => ({ usePathname: () => "/curriculum" }));

const hangul = /[\uac00-\ud7af]/;

function expectVietnameseControls() {
  for (const element of [...screen.queryAllByRole("button"), ...screen.queryAllByRole("textbox")]) {
    const surface = `${element.textContent ?? ""} ${element.getAttribute("aria-label") ?? ""} ${element.getAttribute("placeholder") ?? ""} ${element.getAttribute("title") ?? ""}`;
    expect(surface, surface).not.toMatch(hangul);
  }
  for (const element of screen.queryAllByRole("combobox")) {
    expect(`${element.getAttribute("aria-label") ?? ""} ${element.getAttribute("title") ?? ""}`).not.toMatch(hangul);
  }
}

const player = (lessonId: string) => {
  const lesson = a2Lessons.find((item) => item.id === lessonId)!;
  const unit = a2Units.find((item) => item.id === lesson.unitId)!;
  return render(
    <LessonLanguageProvider>
      <BilingualLessonPlayer lesson={lesson} unitTitle={unit.titleVi} unitTitleKo={unit.titleKo} />
    </LessonLanguageProvider>,
  );
};

describe("Control của A2 dùng tiếng Việt và nhãn Unit tính từ unitId", () => {
  it("bài của Unit 4 hiển thị đúng Unit 4 và nút quay lại Unit 4", () => {
    player("a2-trip-plans");
    expect(screen.getByText(/A2 · UNIT 4 · BÀI 1/)).toBeVisible();
    expect(screen.getByRole("link", { name: "Về Unit 4" })).toHaveAttribute("href", "/curriculum/a2/unit-4");
    expectVietnameseControls();
  });

  it("bài của Unit 6 hiển thị đúng Unit 6 và nút quay lại Unit 6", () => {
    player("a2-unit-6-review");
    expect(screen.getByText(/A2 · UNIT 6 · BÀI 5/)).toBeVisible();
    expect(screen.getByRole("link", { name: "Về Unit 6" })).toHaveAttribute("href", "/curriculum/a2/unit-6");
    expectVietnameseControls();
  });

  it("trang Unit hiển thị breadcrumb theo unitId", () => {
    const unit = a2Units.find((item) => item.id === "a2-5-health-advice")!;
    render(<A2UnitPage unit={unit} />);
    expect(screen.getByRole("navigation", { name: "Đường dẫn" })).toHaveTextContent("A2 · UNIT 5");
    expect(screen.getByRole("link", { name: "Lộ trình học" })).toHaveAttribute("href", "/curriculum");
    expectVietnameseControls();
  });

  it("menu kỹ năng dùng nhãn tiếng Việt", () => {
    render(<CourseTopNav />);
    expect(screen.getByRole("navigation", { name: "Khu vực học tập" })).toBeVisible();
    for (const label of ["Bài học", "Nghe và nói", "Viết", "Từ vựng", "Ôn tập"]) {
      expect(screen.getByRole("link", { name: label })).toBeVisible();
    }
    expectVietnameseControls();
  });

  it("khung giao diện chung không chứa Hangul ngoài nội dung học", () => {
    // Chỉ kiểm tra các tệp khung; khối song ngữ trong bài học được phép hiển thị tiếng Hàn.
    for (const file of ["src/app/layout.tsx", "src/components/CourseSidebar.tsx", "src/components/CourseTopNav.tsx", "src/components/A2UnitPage.tsx"]) {
      const source = fs.readFileSync(path.join(process.cwd(), file), "utf8");
      expect(source, file).not.toMatch(hangul);
    }
    const playerSource = fs.readFileSync(path.join(process.cwd(), "src/components/BilingualLessonPlayer.tsx"), "utf8");
    const hangulLines = playerSource.split("\n").filter((line) => hangul.test(line));
    for (const line of hangulLines) expect(line, line).toContain("titleKo=");
  });
});
