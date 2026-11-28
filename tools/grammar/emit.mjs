// Copies the grammar lessons into public/data/grammar/<level>.json so the
// server reads them as static assets instead of bundling them into the
// Cloudflare Worker (which has a 3 MB limit). Order follows each level's index.ts.
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";

const source = new URL("../../src/content/grammar/", import.meta.url);
const output = new URL("../../public/data/grammar/", import.meta.url);

const levels = (await readdir(source, { withFileTypes: true }))
  .filter((d) => d.isDirectory() && /^[a-c][12]$/.test(d.name))
  .map((d) => d.name)
  .sort();

await mkdir(output, { recursive: true });
const counts = [];
for (const level of levels) {
  const index = await readFile(new URL(`${level}/index.ts`, source), "utf8");
  const files = new Map([...index.matchAll(/import (\w+) from "\.\/([a-z0-9-]+)\.json";/g)].map((m) => [m[1], m[2]]));
  const order = index.match(/grammarFiles: unknown\[\] = \[([^\]]*)\]/)?.[1].split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const lessons = [];
  for (const name of order) {
    const file = files.get(name);
    if (!file) throw new Error(`${level}/index.ts lists ${name} without an import`);
    lessons.push(JSON.parse(await readFile(new URL(`${level}/${file}.json`, source), "utf8")));
  }
  await writeFile(new URL(`${level}.json`, output), JSON.stringify(lessons));
  counts.push(`${level.toUpperCase()} ${lessons.length}`);
}
console.log(`grammar assets: ${counts.join(", ")}`);
