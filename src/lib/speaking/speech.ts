/**
 * Splits streamed text into speakable sentences as soon as each one ends,
 * so the voice can start before the whole reply has arrived.
 */
export class SentenceBuffer {
  private buffer = "";

  /** Adds text and returns any sentences that are now complete. */
  push(text: string): string[] {
    this.buffer += text;
    const out: string[] = [];
    const re = /[^.!?]*[.!?]+["')\]]*(\s+|$)/y;
    let consumed = 0;
    for (;;) {
      re.lastIndex = consumed;
      const m = re.exec(this.buffer);
      if (!m || m[0].length === 0) break;
      // Only cut at the end of the buffer when whitespace follows, or we might split "3.5" or "a.m.".
      if (m.index + m[0].length === this.buffer.length && !/\s$/.test(m[0])) break;
      out.push(m[0].trim());
      consumed = m.index + m[0].length;
    }
    this.buffer = this.buffer.slice(consumed);
    return out.filter(Boolean);
  }

  /** Whatever is left at the end of the reply. */
  flush(): string[] {
    const rest = this.buffer.trim();
    this.buffer = "";
    return rest ? [rest] : [];
  }
}

/** Text for the voice: Vietnamese hints in parentheses are shown but not read aloud. */
export function speakable(sentence: string): string {
  return sentence.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
}
