import { conversationPrompt } from "@/lib/speaking/prompt";
import { findScenario, supportsFallbacks, targetWords, toApiMessages } from "@/lib/speaking/conversation";
import { conversationBody } from "@/lib/speaking/schema";
import { planFor } from "@/lib/ai/policy";
import { FREE_CHAT } from "@/lib/speaking/lessons";
import { aiGate } from "@/lib/server/quota";
import { anthropic, fromOtherSite, jsonError, speakEnv } from "@/lib/speaking/server";

const REFUSAL_LINE = "Sorry, let's talk about something else. What do you like to do?";

export async function POST(request: Request) {
  if (fromOtherSite(request)) return jsonError(403, "Forbidden");
  const parsed = conversationBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "Dữ liệu hội thoại không hợp lệ.");
  const scenario = findScenario(parsed.data.scenarioId);
  if (!scenario) return jsonError(404, "Không tìm thấy tình huống.");

  // Topic lessons are A1; free chat is open-ended, so it gets the A2 rule.
  const level = scenario.id === FREE_CHAT.id ? "A2" : "A1";
  // One conversation counts once: on the learner's first turn.
  const firstTurn = parsed.data.messages.filter((m) => m.role === "user").length <= 1;
  const gate = await aiGate("speak-chat", level, { count: firstTurn });
  if (!gate.ok) return jsonError(gate.status, gate.error);

  const env = speakEnv();
  const client = anthropic(env);
  const encoder = new TextEncoder();

  if (!client) {
    // Demo mode so the screen can be tried without an API key.
    const demo = "That sounds nice! (Chế độ thử: app chưa có khóa API nên AI chưa trả lời thật.) Can you tell me more?";
    return new Response(encoder.encode(demo), {
      headers: { "content-type": "text/plain; charset=utf-8", "x-speak-demo": "1" },
    });
  }

  const plan = planFor("speak-chat", level, env)!;
  await gate.consume();
  const model = env.SPEAK_CHAT_MODEL || plan.model;
  const stream = client.beta.messages.stream({
    model,
    max_tokens: plan.maxTokens,
    system: conversationPrompt(scenario, targetWords(scenario)),
    messages: toApiMessages(scenario, parsed.data.messages),
    // Short, quick replies matter more than deep reasoning in a chat.
    output_config: { effort: plan.effort },
    ...(supportsFallbacks(model) ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
  });

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sent = 0;
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
            sent += event.delta.text.length;
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal" && sent === 0) controller.enqueue(encoder.encode(REFUSAL_LINE));
      } catch (err) {
        console.error("chat stream failed", err);
        if (sent === 0) controller.enqueue(encoder.encode("Sorry, I didn't catch that. Can you say it again?"));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}
