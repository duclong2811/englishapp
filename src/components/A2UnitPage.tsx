import Link from "next/link";
import type { BilingualUnit } from "@/lib/curriculum/bilingual-schema";
import { unitEyebrow, unitNumberFromId, unitPathByNumber } from "@/lib/curriculum/unit-label";

/**
 * Trang Unit A2. Số Unit, breadcrumb và liên kết Unit lân cận đều suy ra từ
 * `unit.id` nên không bị hard-code theo Unit 1.
 */
export function A2UnitPage({ unit }: { unit: BilingualUnit }) {
  const number = unitNumberFromId(unit.id);
  const totalUnits = 6;
  return (
    <div className="page">
      <nav
        aria-label="Đường dẫn"
        style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "var(--muted)", marginBottom: 16, flexWrap: "wrap" }}
      >
        <Link href="/curriculum">Lộ trình học</Link>
        <span aria-hidden="true">/</span>
        <span>{unitEyebrow(unit.id)}</span>
      </nav>
      <header className="page-head">
        <div>
          <span className="eyebrow">{unitEyebrow(unit.id)}</span>
          <h1>{unit.titleVi}</h1>
          <p lang="ko">{unit.titleKo}</p>
          <p>{unit.lessons.length} bài hoàn chỉnh với nội dung song ngữ Việt–Hàn.</p>
        </div>
      </header>
      <div className="unit">
        {unit.lessons.map((lesson) => (
          <Link className="lesson-row" href={`/a2/lesson/${lesson.id}`} key={lesson.id}>
            <span className="lesson-index">{String(lesson.number).padStart(2, "0")}</span>
            <div>
              <h3>{lesson.titleVi}</h3>
              <p lang="ko">{lesson.titleKo}</p>
            </div>
            <span className="status available">Mở bài →</span>
          </Link>
        ))}
      </div>
      <div className="actions" style={{ marginTop: 24 }}>
        <Link className="secondary" href="/curriculum">
          Quay lại lộ trình
        </Link>
        {number !== undefined && number > 1 && (
          <Link className="secondary" href={unitPathByNumber("a2", number - 1)}>
            Unit {number - 1}
          </Link>
        )}
        {number !== undefined && number < totalUnits && (
          <Link className="secondary" href={unitPathByNumber("a2", number + 1)}>
            Unit {number + 1}
          </Link>
        )}
      </div>
    </div>
  );
}
