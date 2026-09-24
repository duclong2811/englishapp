import Link from "next/link";
import { course } from "@/content/course";
import { a2Units } from "@/content/a2-course";
import { unitEyebrow, unitPath } from "@/lib/curriculum/unit-label";

export default function Curriculum() {
  const a1 = course.levels[0].units[0];
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <span className="eyebrow">LỘ TRÌNH</span>
          <h1>Lộ trình học</h1>
          <p>Tiến từng bước theo kiến thức tiên quyết; kỹ năng tiếp nhận và sản xuất phát triển riêng.</p>
        </div>
      </header>
      <section className="panel">
        <span className="eyebrow">A1 · UNIT 1</span>
        <h2>Kết nối trong đời sống cơ bản</h2>
        <div className="list">
          {a1.lessons.map((lesson) => (
            <Link className="list-row" href={`/lesson/${lesson.id}`} key={lesson.id}>
              <span className="lesson-index">{lesson.number}</span>
              <div>
                <strong>{lesson.titleEn}</strong>
                <small lang="ko">{lesson.title}</small>
              </div>
              <span className="status available">Mở bài →</span>
            </Link>
          ))}
        </div>
      </section>
      {a2Units.map((unit) => (
        <section className="panel" style={{ marginTop: 24 }} key={unit.id}>
          <span className="eyebrow">{unitEyebrow(unit.id)}</span>
          <h2>{unit.titleVi}</h2>
          <p lang="ko">{unit.titleKo}</p>
          <p>{unit.lessons.length} bài hoàn chỉnh với nội dung song ngữ Việt–Hàn.</p>
          <Link className="primary" href={unitPath(unit.id)}>
            Mở {unitEyebrow(unit.id)}
          </Link>
        </section>
      ))}
      <div className="notice">Nội dung đầy đủ hiện gồm A1 và A2 Unit 1–6. Bản đồ A2–B2 vẫn được giữ riêng cho các giai đoạn mở rộng tiếp theo.</div>
    </div>
  );
}
