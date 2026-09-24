import Link from "next/link";
import { a2Units } from "@/content/a2-course";
import { unitEyebrow } from "@/lib/curriculum/unit-label";

export default function WritingPage() {
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <span className="eyebrow">LUYỆN VIẾT</span>
          <h1>Nhiệm vụ viết</h1>
          <p>Luyện viết theo nhiệm vụ thực tế của từng Unit. Câu trả lời được lưu tạm trong bài học.</p>
        </div>
      </header>
      <div className="writing-list">
        {a2Units.map((unit) => (
          <section className="writing-unit" key={unit.id}>
            <span className="eyebrow">{unitEyebrow(unit.id)}</span>
            <h2>{unit.titleVi}</h2>
            <p lang="ko">{unit.titleKo}</p>
            {unit.lessons.map((lesson) => {
              const tasks = lesson.production.filter((task) => task.type === "written");
              return tasks.map((task) => (
                <article className="writing-task" key={task.id}>
                  <span className="lesson-index">{String(lesson.number).padStart(2, "0")}</span>
                  <div>
                    <strong>{lesson.titleVi}</strong>
                    <p>{task.prompt}</p>
                  </div>
                  <Link className="secondary" href={`/a2/lesson/${lesson.id}`}>
                    Bắt đầu viết
                  </Link>
                </article>
              ));
            })}
          </section>
        ))}
      </div>
    </div>
  );
}
