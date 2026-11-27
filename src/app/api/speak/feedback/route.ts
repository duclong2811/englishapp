import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { findScenario, supportsFallbacks } from "@/lib/speaking/conversation";
import { feedbackPrompt } from "@/lib/speaking/prompt";
import { conversationBody, feedbackSchema } from "@/lib/speaking/schema";
import { anthropic, DEFAULT_MODEL, fromOtherSite, jsonError, speakEnv } from "@/lib/speaking/server";

export async function POST(request: Request) {
  if (fromOtherSite(request)) return jsonError(403, "Forbidden");
  const parsed = conversationBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "Dữ liệu hội thoại không hợp lệ.");
  const scenario = findScenario(parsed.data.scenarioId);
  if (!scenario) return jsonError(404, "Không tìm thấy tình huống.");
  if (!parsed.data.messages.some((m) => m.role === "user")) return jsonError(400, "Bạn chưa nói câu nào.");

  const client = anthropic(speakEnv());
  if (!client) return jsonError(501, "App chưa có khóa API nên chưa nhận xét được.");

  const transcript = parsed.data.messages
    .map((m) => `${m.role === "user" ? "Learner" : "Partner"}: ${m.content}`)
    .join("\n");
  const model = speakEnv().SPEAK_FEEDBACK_MODEL || DEFAULT_MODEL;

  try {
    const message = await client.beta.messages.parse({
      model,
      max_tokens: 8000,
      system: feedbackPrompt(scenario),
      messages: [{ role: "user", content: `Conversation:\n${transcript}` }],
      output_config: { format: betaZodOutputFormat(feedbackSchema), effort: "medium" },
      ...(supportsFallbacks(model) ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
    });
    if (message.stop_reason === "refusal" || !message.parsed_output) {
      return jsonError(502, "Chưa tạo được nhận xét. Thử lại nhé.");
    }
    return Response.json(message.parsed_output);
  } catch (err) {
    console.error("feedback failed", err);
    return jsonError(502, "Chưa tạo được nhận xét. Thử lại nhé.");
  }
}
