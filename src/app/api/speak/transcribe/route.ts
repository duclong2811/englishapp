import { aiGate } from "@/lib/server/quota";
import { fromOtherSite, jsonError, speakEnv, WHISPER_MODEL } from "@/lib/speaking/server";

const MAX_BYTES = 3 * 1024 * 1024; // about 90 s of 16 kHz mono WAV

export async function POST(request: Request) {
  if (fromOtherSite(request)) return jsonError(403, "Forbidden");
  const gate = await aiGate("transcribe", "A1");
  if (!gate.ok) return jsonError(gate.status, gate.error);
  const env = speakEnv();
  if (!env.AI) return jsonError(501, "Chuyển giọng nói thành chữ chỉ chạy trên Cloudflare (cần Workers AI).");

  const form = await request.formData().catch(() => null);
  const audio = form?.get("audio");
  if (!(audio instanceof Blob) || audio.size === 0) return jsonError(400, "Thiếu file ghi âm.");
  if (audio.size > MAX_BYTES) return jsonError(413, "Đoạn ghi âm quá dài.");

  const base64 = Buffer.from(await audio.arrayBuffer()).toString("base64");
  try {
    const result = (await env.AI.run(WHISPER_MODEL, { audio: base64, language: "en" })) as { text?: string };
    await gate.consume();
    return Response.json({ text: (result.text ?? "").trim() });
  } catch (err) {
    console.error("transcribe failed", err);
    return jsonError(502, "Không nhận dạng được giọng nói. Thử lại nhé.");
  }
}
