#!/usr/bin/env node
// Prints the next words of a level that have no Vietnamese entry yet, with
// everything needed to write them. Usage: npm run vocab:next -- B1 100
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const [level = "B1", countArg = "100"] = process.argv.slice(2);
const count = Number(countArg);
const root = new URL("../../src/content/vocab/", import.meta.url).pathname;
const words = JSON.parse(readFileSync(join(root, "words.json"), "utf8"));

const viDir = join(root, "vi");
const done = new Set();
const prefix = `${level.toLowerCase()}-core-`;
let lastFile = 0;
for (const f of readdirSync(viDir)) {
  if (!f.endsWith(".json")) continue;
  for (const e of JSON.parse(readFileSync(join(viDir, f), "utf8")).entries) done.add(e.id);
  if (f.startsWith(prefix)) lastFile = Math.max(lastFile, Number(f.slice(prefix.length, -5)));
}

const todo = words.filter((w) => w.level === level && !done.has(w.id));
const batch = todo.slice(0, count).map((w) => ({
  id: w.id,
  headword: w.headword,
  // Parts of speech with their CEFR level; write meanings for the ones at this level first.
  pos: w.pos.map((p) => `${p.pos} (${p.level})`),
  ipa: w.ipa ?? "MISSING: add an \"ipa\" field to the entry",
  forms: w.forms,
  // The only Tatoeba sentences you may use with "source": "tatoeba".
  tatoeba: w.examples.map((e) => ({ en: e.en, vi: e.vi })),
}));

console.log(
  JSON.stringify(
    {
      level,
      file: `src/content/vocab/vi/${prefix}${lastFile + (todo.length ? 1 : 0)}.json`,
      remainingAfterThisBatch: Math.max(0, todo.length - batch.length),
      words: batch,
    },
    null,
    1,
  ),
);
