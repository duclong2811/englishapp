import { fromOtherSite, jsonError, speakEnv, TTS_MODEL } from "@/lib/speaking/server";
import { isVoice } from "@/lib/speaking/voices";

const MAX_CHARS = 400;

/** Turns whatever the AI binding returns for audio into bytes. */
async function toBytes(result: unknown): Promise<ArrayBuffer> {
  if (result instanceof Response) return result.arrayBuffer();
  if (result instanceof ReadableStream) return new Response(result).arrayBuffer();
  if (result instanceof ArrayBuffer) return result;
  if (ArrayBuffer.isView(result)) return new Uint8Array(result.buffer, result.byteOffset, result.byteLength).slice().buffer;
  if (result && typeof result === "object" && typeof (result as { audio?: unknown }).audio === "string") {
    return Uint8Array.from(Buffer.from((result as { audio: string }).audio, "base64")).buffer;
  }
  throw new Error("unexpected TTS result");
}

/**
 * Natural English voice. GET so that the browser and Cloudflare's edge cache
 * can keep each sentence: fixed lesson lines are only paid for once.
 */
export async function GET(request: Request) {
  if (fromOtherSite(request)) return jsonError(403, "Forbidden");
  const url = new URL(request.url);
  const text = (url.searchParams.get("text") ?? "").trim();
  const voice = url.searchParams.get("voice") ?? "";
  if (!text || text.length > MAX_CHARS || !isVoice(voice)) return jsonError(400, "Bad request");

  const env = speakEnv();
  if (!env.AI) return jsonError(501, "Giọng đọc AI chỉ chạy trên Cloudflare.");

  const cache = typeof caches !== "undefined" ? (caches as unknown as { default?: Cache }).default : undefined;
  const key = new Request(url.toString(), { method: "GET" });
  const hit = await cache?.match(key).catch(() => undefined);
  if (hit) return hit;

  try {
    const audio = await toBytes(await env.AI.run(TTS_MODEL, { text, speaker: voice, encoding: "mp3" }));
    const response = new Response(audio, {
      headers: {
        "content-type": "audio/mpeg",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
    await cache?.put(key, response.clone()).catch(() => undefined);
    return response;
  } catch (err) {
    // Usually the daily free Workers AI allowance is used up; the app falls back to the device voice.
    console.error("tts failed", err);
    return jsonError(502, "Không tạo được giọng đọc.");
  }
}
