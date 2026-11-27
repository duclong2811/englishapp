import { conversationPrompt } from "@/lib/speaking/prompt";
import { findScenario, supportsFallbacks, targetWords, toApiMessages } from "@/lib/speaking/conversation";
import { conversationBody } from "@/lib/speaking/schema";
import { anthropic, DEFAULT_MODEL, jsonError, speakEnv } from "@/lib/speaking/server";

const REFUSAL_LINE = "Sorry, let's talk about something else. What do you like to do?";

export async function POST(request: Request) {
  const parsed = conversationBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "Dữ liệu hội thoại không hợp lệ.");
  const scenario = findScenario(parsed.data.scenarioId);
  if (!scenario) return jsonError(404, "Không tìm thấy tình huống.");

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

  const model = env.SPEAK_CHAT_MODEL || DEFAULT_MODEL;
  const stream = client.beta.messages.stream({
    model,
    max_tokens: 2000,
    system: conversationPrompt(scenario, targetWords(scenario)),
    messages: toApiMessages(scenario, parsed.data.messages),
    // Short, quick replies matter more than deep reasoning in a chat.
    output_config: { effort: "low" },
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
