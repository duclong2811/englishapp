"use client";
import { useState } from "react";
import Link from "next/link";
import type { BilingualLesson } from "@/lib/curriculum/bilingual-schema";
import { unitBackLabel, unitNumberFromId, unitPath } from "@/lib/curriculum/unit-label";
import { BilingualExample, BilingualExplanation, LanguageModeControl } from "./BilingualContent";
import { AudioPlayer } from "./audio/AudioPlayer";
import { ShadowingStudio } from "./audio/ShadowingStudio";
import { ExerciseRenderer } from "./ExerciseRenderer";

const steps = ["Tình huống", "Hội thoại", "Từ vựng", "Ngữ pháp", "Ví dụ", "Luyện tập", "Nói theo", "Kiểm tra"];

export function BilingualLessonPlayer({ lesson, unitTitle, unitTitleKo }: { lesson: BilingualLesson; unitTitle?: string; unitTitleKo?: string }) {
  const [step, setStep] = useState(() => {
    try {
      return Number(localStorage.getItem(`a2-position:${lesson.id}`)) || 0;
    } catch {
      return 0;
    }
  });
  const unitNumber = unitNumberFromId(lesson.unitId);
  const unitLabel = unitNumber ? `A2 · UNIT ${unitNumber} · BÀI ${lesson.number}` : `A2 · BÀI ${lesson.number}`;

  function go(next: number) {
    setStep(next);
    try {
      localStorage.setItem(`a2-position:${lesson.id}`, String(next));
    } catch {
      // Trình duyệt chặn lưu cục bộ: tiến độ vẫn được giữ trong phiên hiện tại.
    }
    fetch("/api/state", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "progress", lessonId: lesson.id, status: "in-progress", position: steps[next], percent: Math.round((next / 7) * 100) }),
    }).catch(() => {});
  }

  return (
    <>
      <div className="lesson-top">
        <div className="lesson-meta">
          <div>
            <small>{unitLabel}</small>
            <strong>
              {lesson.titleVi} · <span lang="ko">{lesson.titleKo}</span>
            </strong>
          </div>
          <Link href={unitPath(lesson.unitId)} className="secondary">
            {unitBackLabel(lesson.unitId)}
          </Link>
        </div>
        <div className="lesson-progress">
          <i style={{ width: `${((step + 1) / 8) * 100}%` }} />
        </div>
      </div>
      <div className="page narrow lesson-content">
        <div className="section-head">
          <nav className="step-nav" aria-label="Các bước bài học">
            {steps.map((label, i) => (
              <button
                type="button"
                key={label}
                title={label}
                aria-label={`Bước ${i + 1}: ${label}`}
                aria-current={step === i ? "step" : undefined}
                className={step === i ? "active" : ""}
                onClick={() => go(i)}
              >
                {i + 1}
              </button>
            ))}
          </nav>
          <LanguageModeControl />
        </div>
        {step === 0 && (
          <>
            <span className="eyebrow">{unitNumber ? `A2 · UNIT ${unitNumber}` : "A2"}{unitTitle ? ` · ${unitTitle}` : ""}</span>
            <h1>{lesson.titleVi}</h1>
            <p lang="ko" className="lead">
              {unitTitleKo ? `${unitTitleKo} · ` : ""}
              {lesson.titleKo}
            </p>
            <BilingualExplanation titleVi="Tình huống thực tế" titleKo="실제 상황" explanationVi={lesson.situationVi} explanationKo={lesson.situationKo} />
            <h2>Mục tiêu</h2>
            {lesson.objectives.map((item) => (
              <div key={item.id}>
                <strong lang="en">{item.en}</strong>
                <p>
                  {item.vi}
                  <br />
                  <span lang="ko">{item.ko}</span>
                </p>
              </div>
            ))}
          </>
        )}
        {step === 1 && (
          <>
            <h1>Hội thoại</h1>
            {lesson.dialogue.map((line, i) => (
              <div className="line" key={i}>
                <strong>{line.speaker}</strong>
                <div>
                  <AudioPlayer text={line.en} />
                  <BilingualExample en={line.en} vi={line.vi} ko={line.ko} note={line.register} />
                </div>
              </div>
            ))}
          </>
        )}
        {step === 2 && (
          <>
            <h1>Từ và cụm từ hữu ích</h1>
            <div className="vocab-list">
              {lesson.vocabulary.map((word) => (
                <div className="vocab-item" key={word.id}>
                  <div>
                    <strong className="word">{word.headword}</strong>
                    <small className="ipa">
                      {word.ipa} · {word.stress}
                    </small>
                  </div>
                  <div>
                    <strong>{word.definitionVi}</strong>
                    <span lang="ko" style={{ display: "block", color: "var(--muted)" }}>
                      {word.definitionKo}
                    </span>
                    <small>
                      {word.register} · {word.collocations.join(" · ")}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h1>Ngữ pháp trọng tâm</h1>
            {lesson.grammar.map((block, i) => (
              <BilingualExplanation key={i} {...block} />
            ))}
          </>
        )}
        {step === 4 && (
          <>
            <h1>Ví dụ tự nhiên</h1>
            {lesson.examples.map((item, i) => (
              <BilingualExample key={i} {...item} note={item.context} />
            ))}
          </>
        )}
        {step === 5 && (
          <>
            <h1>Luyện tập có hướng dẫn</h1>
            {lesson.listening.map((item) => (
              <div key={item.id}>
                <AudioPlayer text={String(item.answer ?? "")} />
                <ExerciseRenderer exercise={item} />
              </div>
            ))}
            {lesson.guided.map((item) => (
              <ExerciseRenderer exercise={item} key={item.id} />
            ))}
          </>
        )}
        {step === 6 && (
          <>
            <h1>Luyện nói và sản xuất</h1>
            <ShadowingStudio text={lesson.shadowing.line} notes={[...lesson.shadowing.notesVi, ...lesson.shadowing.notesKo]} />
            {lesson.production.map((item) => (
              <ExerciseRenderer exercise={item} key={item.id} />
            ))}
          </>
        )}
        {step === 7 && (
          <>
            <h1>Kiểm tra mức độ làm chủ</h1>
            <p className="notice">Điểm được tách theo kỹ năng. Câu yếu sẽ tạo thẻ ôn tập FSRS và lỗi có ý nghĩa được đưa vào Sổ lỗi.</p>
            {lesson.mastery.map((item) => (
              <ExerciseRenderer exercise={item} key={item.id} />
            ))}
          </>
        )}
        <div className="actions" style={{ justifyContent: "space-between", marginTop: 28 }}>
          <button type="button" className="secondary" disabled={step === 0} onClick={() => go(Math.max(0, step - 1))}>
            Quay lại
          </button>
          <button type="button" className="primary" disabled={step === 7} onClick={() => go(Math.min(7, step + 1))}>
            Tiếp theo · {steps[Math.min(7, step + 1)]}
          </button>
        </div>
      </div>
    </>
  );
}
