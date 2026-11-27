"use client";

import { useState } from "react";
import { Conversation, type ConversationScenario } from "@/components/speaking/conversation";
import type { VocabHint } from "@/components/speaking/highlighted";
import { ScriptPractice, type ScriptLine } from "@/components/speaking/script-practice";

type Step = "script" | "roleplay";

export function LessonView({
  topic,
  lines,
  vocab,
  scenario,
}: {
  topic: string;
  lines: ScriptLine[];
  vocab: VocabHint[];
  scenario: ConversationScenario;
}) {
  const [step, setStep] = useState<Step>("script");
  const tab = (s: Step) =>
    `inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:flex-none ${
      step === s ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
    }`;

  return (
    <>
      <div role="tablist" aria-label="Các bước" className="mb-6 flex max-w-[42rem] gap-1 rounded-full border border-line bg-sheet p-1">
        <button type="button" role="tab" aria-selected={step === "script"} onClick={() => setStep("script")} className={tab("script")}>
          1. Theo kịch bản
        </button>
        <button type="button" role="tab" aria-selected={step === "roleplay"} onClick={() => setStep("roleplay")} className={tab("roleplay")}>
          2. Nhập vai AI
        </button>
      </div>
      {/* Keyed so leaving a step stops its audio and starts it fresh next time. */}
      {step === "script" ? (
        <ScriptPractice key="script" topic={topic} lines={lines} vocab={vocab} onRoleplay={() => setStep("roleplay")} />
      ) : (
        <>
          <p className="mb-4 max-w-[42rem] text-ink-soft text-pretty">
            Giờ không có kịch bản: AI đóng vai và hỏi bạn, bạn tự trả lời bằng các từ vừa luyện. Kết thúc để nhận nhận xét.
          </p>
          <Conversation key="roleplay" scenario={scenario} />
        </>
      )}
    </>
  );
}
