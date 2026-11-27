/**
 * Stricter checks for vocabulary written from B1 on (files vi/b1-core-*.json
 * and later levels). See docs/vocab-brief.md for the rules these enforce.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "src/content/vocab");
type Example = { en: string; vi: string; source: string; edited?: boolean };
type Entry = { id: string; meanings: { pos: string; vi: string }[]; note: string; ipa?: string; forms?: Record<string, string>; examples: Example[] };
type Word = { id: string; headword: string; level: string; ipa: string | null; forms: Record<string, string>; examples: { en: string }[] };

const words: Word[] = JSON.parse(readFileSync(join(root, "words.json"), "utf8"));
const byId = new Map(words.map((w) => [w.id, w]));
const STRICT = /^(b1|b2|c1|c2)-core-\d+\.json$/;
const files = readdirSync(join(root, "vi")).filter((f) => STRICT.test(f));
const POS = ["noun", "verb", "adjective", "adverb", "preposition", "pronoun", "determiner", "conjunction", "interjection", "number", "modal auxiliary", "be-verb", "do-verb", "have-verb"];
const VI = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

const allIds = readdirSync(join(root, "vi"))
  .filter((f) => f.endsWith(".json"))
  .flatMap((f) => (JSON.parse(readFileSync(join(root, "vi", f), "utf8")).entries as Entry[]).map((e) => e.id));

describe.each(files.map((f) => [f]))("%s", (file) => {
  const data = JSON.parse(readFileSync(join(root, "vi", file), "utf8")) as { status: string; entries: Entry[] };
  const level = file.slice(0, 2).toUpperCase();

  it("is a draft of at most 120 entries", () => {
    expect(data.status).toBe("draft");
    expect(data.entries.length).toBeGreaterThan(0);
    expect(data.entries.length).toBeLessThanOrEqual(120);
  });

  it.each(data.entries.map((e) => [e.id, e] as const))("%s follows the brief", (id, e) => {
    const w = byId.get(id);
    expect(w, "id must exist in words.json").toBeTruthy();
    expect(w!.level, "word belongs to another level").toBe(level);
    expect(allIds.filter((x) => x === id), "id written twice").toHaveLength(1);

    expect(e.meanings.length).toBeGreaterThanOrEqual(1);
    expect(e.meanings.length).toBeLessThanOrEqual(3);
    for (const m of e.meanings) {
      expect(POS, `unknown pos "${m.pos}"`).toContain(m.pos);
      expect(m.vi.length, "meaning too long").toBeLessThanOrEqual(60);
      expect(VI.test(m.vi) || /^[\p{L}\s,()/-]+$/u.test(m.vi), "meaning must be Vietnamese").toBe(true);
    }

    expect(e.note.length, "note too short or too long").toBeGreaterThanOrEqual(12);
    expect(e.note.length, "note too short or too long").toBeLessThanOrEqual(220);
    expect(VI.test(e.note), "note must be written in Vietnamese").toBe(true);

    expect(w!.ipa || e.ipa, "IPA missing: add an ipa field").toBeTruthy();

    expect(e.examples, "exactly two examples").toHaveLength(2);
    expect(e.examples[0].en).not.toBe(e.examples[1].en);
    const forms = [w!.headword, ...Object.values(e.forms ?? w!.forms)].map((f) => f.toLowerCase());
    const tatoeba = new Set(w!.examples.map((x) => x.en));
    for (const ex of e.examples) {
      const n = ex.en.split(/\s+/).length;
      expect(n, `"${ex.en}" should be 4 to 14 words`).toBeGreaterThanOrEqual(4);
      expect(n, `"${ex.en}" should be 4 to 14 words`).toBeLessThanOrEqual(14);
      expect(/[.?!]$/.test(ex.en), `"${ex.en}" must end with . ? or !`).toBe(true);
      expect(VI.test(ex.vi), `translation of "${ex.en}" must be Vietnamese`).toBe(true);
      const found = forms.some((f) =>
        new RegExp(`(?<![a-z])${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z])`, "i").test(ex.en),
      );
      expect(found, `"${ex.en}" must contain "${w!.headword}" or one of its listed forms`).toBe(true);
      expect(["tatoeba", "editor"]).toContain(ex.source);
      if (ex.source === "tatoeba") {
        // Only sentences listed for this word by `npm run vocab:next` may be marked as Tatoeba.
        expect(tatoeba.has(ex.en), `"${ex.en}" is marked tatoeba but is not one of this word's Tatoeba sentences`).toBe(true);
      } else {
        expect(ex.edited, "edited is only for Tatoeba sentences").toBeUndefined();
      }
    }
  });
});

it("has the strict checks wired (passes with no B1 files yet)", () => {
  expect(Array.isArray(files)).toBe(true);
});
