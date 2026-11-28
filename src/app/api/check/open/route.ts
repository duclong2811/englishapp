import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { supportsFallbacks } from "@/lib/speaking/conversation";
import { OPEN_TASKS } from "@/content/tests/open-tasks";
import { findLessonTitle } from "@/lib/tests/lesson-titles";
import { gradeSchema, openAnswerBody } from "@/lib/tests/grading";
import { MAX_ANSWER_CHARS, planFor } from "@/lib/ai/policy";
import { anthropic, fromOtherSite, jsonError, speakEnv } from "@/lib/speaking/server";

function system(level: string, mode: "write" | "speak", focus: string) {
  return [
    `You grade short ${mode === "write" ? "written" : "spoken"} answers from Vietnamese adults learning English at CEFR ${level}.`,
    mode === "speak"
      ? "The answer is a speech-recognition transcript: ignore punctuation, capital letters and obvious recognition slips; judge grammar, words and whether the task is done."
      : "Judge grammar, spelling, word choice and whether the task is done.",
    `The task practises: ${focus}. Pay most attention to that grammar point.`,
    `Grade for level ${level}: simple sentences are fine; do not ask for vocabulary above the level.`,
    "ok = the answer does what the task asks and a listener would understand it without effort, even with small mistakes. score: 0-10.",
    "corrected: the learner's own answer with the fewest changes that make it correct and natural American English. Keep their ideas and words; do not add new content. If nothing is wrong, repeat it unchanged.",
    "mistakes: only real errors, most important first, at most 5. wrong and right are short English fragments; why is one short sentence in Vietnamese.",
    "comment: one or two short sentences in Vietnamese addressed to the learner as “bạn”: what they did well, then the one thing to improve. Never scold.",
    "If the answer is off-topic, empty or not English, set ok false, score 0-2, and say so kindly in the comment.",
  ].join("\n");
}

/** Grades one open writing or speaking answer. The task is looked up by id; its text never comes from the browser. */
export async function POST(request: Request) {
  if (fromOtherSite(request)) return jsonError(403, "Forbidden");
  const parsed = openAnswerBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "Câu trả lời không hợp lệ.");
  const task = OPEN_TASKS.find((t) => t.id === parsed.data.taskId);
  if (!task) return jsonError(404, "Không tìm thấy đề.");

  if (parsed.data.answer.length > MAX_ANSWER_CHARS[task.level]) return jsonError(400, "Bài quá dài so với đề.");

  const env = speakEnv();
  const plan = planFor(task.mode === "write" ? "write-check" : "talk-check", task.level, env);
  if (!plan) return jsonError(400, "Bài ở cấp này được chấm bằng đáp án mẫu, không cần AI.");
  const client = anthropic(env);
  if (!client) return jsonError(501, "App chưa có khóa API nên chưa chấm được.");
  const model = plan.model;

  try {
    const message = await client.beta.messages.parse({
      model,
      max_tokens: plan.maxTokens,
      system: system(task.level, task.mode, findLessonTitle(task.focus) ?? task.focus),
      messages: [
        {
          role: "user",
          content: `Task (shown to the learner in Vietnamese): ${task.task}\nSuggested start: ${task.hint}\n\nLearner's answer:\n${parsed.data.answer}`,
        },
      ],
      output_config: { format: betaZodOutputFormat(gradeSchema), effort: plan.effort },
      ...(supportsFallbacks(model) ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
    });
    if (message.stop_reason === "refusal" || !message.parsed_output) {
      return jsonError(502, "Chưa chấm được. Thử lại nhé.");
    }
    const grade = message.parsed_output;
    return Response.json({ ...grade, mistakes: grade.mistakes.slice(0, 5) });
  } catch (err) {
    console.error("grading failed", err);
    return jsonError(502, "Chưa chấm được. Thử lại nhé.");
  }
}
