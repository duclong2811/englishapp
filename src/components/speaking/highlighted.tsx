export type VocabHint = { id: string; forms: string[]; vi: string };

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Builds a matcher for the lesson's vocabulary, longest spellings first. */
export function vocabMatcher(vocab: VocabHint[]) {
  const byForm = new Map<string, VocabHint>();
  for (const v of vocab) for (const f of v.forms) if (!byForm.has(f.toLowerCase())) byForm.set(f.toLowerCase(), v);
  const forms = [...byForm.keys()].sort((a, b) => b.length - a.length);
  const re = forms.length ? new RegExp(`(?<![a-z])(${forms.map(escapeRegExp).join("|")})(?![a-z])`, "gi") : null;
  return { re, byForm };
}

/** English text with the topic's vocabulary marked; the meaning shows on hover or long-press. */
export function Highlighted({ text, matcher }: { text: string; matcher: ReturnType<typeof vocabMatcher> }) {
  if (!matcher.re) return <>{text}</>;
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(matcher.re)) {
    const i = m.index ?? 0;
    if (i > last) parts.push(text.slice(last, i));
    const hint = matcher.byForm.get(m[0].toLowerCase());
    parts.push(
      <mark key={i} className="word" title={hint?.vi}>
        {m[0]}
      </mark>,
    );
    last = i + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
