import { describe, expect, it } from "vitest";
import { SentenceBuffer, speakable } from "./speech";
import { downsample, encodeWav } from "./wav";

describe("SentenceBuffer", () => {
  it("emits sentences as soon as they end", () => {
    const b = new SentenceBuffer();
    expect(b.push("Hello! I'm Ma")).toEqual(["Hello!"]);
    expect(b.push("i. What's your")).toEqual(["I'm Mai."]);
    expect(b.push(" name?")).toEqual([]);
    expect(b.flush()).toEqual(["What's your name?"]);
  });

  it("does not cut inside a.m. before the text continues", () => {
    const b = new SentenceBuffer();
    expect(b.push("I get up at 6 a.m")).toEqual([]);
    expect(b.push(". Every day.")).toEqual([]);
    expect(b.flush().join(" ")).toContain("Every day.");
  });
});

describe("speakable", () => {
  it("drops Vietnamese hints in parentheses", () => {
    expect(speakable("Good! (Tốt lắm.) Say it again.")).toBe("Good! Say it again.");
  });
});

describe("wav", () => {
  it("writes a valid 16 kHz header and halves the samples", async () => {
    const input = new Float32Array(32000).fill(0.5);
    const down = downsample(input, 32000, 16000);
    expect(down.length).toBe(16000);
    const wav = encodeWav(down, 16000);
    const view = new DataView(await wav.arrayBuffer());
    expect(String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3))).toBe("RIFF");
    expect(view.getUint32(24, true)).toBe(16000);
    expect(wav.size).toBe(44 + 16000 * 2);
  });
});
