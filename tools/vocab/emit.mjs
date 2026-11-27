import { mkdir, readFile, writeFile } from "node:fs/promises";
import ts from "typescript";

const source = new URL("../../src/content/vocab/", import.meta.url);
const output = new URL("../../public/data/vocab/", import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, source), "utf8"));

// Keep the ordered Vietnamese file registry used by the editorial workflow.
const registry = ts.createSourceFile(
  "index.ts",
  await readFile(new URL("vi/index.ts", source), "utf8"),
  ts.ScriptTarget.Latest,
  true,
);
const imports = new Map(
  registry.statements.filter(ts.isImportDeclaration).map((statement) => [
    statement.importClause?.name?.text,
    statement.moduleSpecifier.text,
  ]),
);
const files = registry.statements.filter(ts.isVariableStatement)
  .flatMap((statement) => [...statement.declarationList.declarations])
  .find((declaration) => declaration.name.getText(registry) === "viFiles")?.initializer;
if (!files || !ts.isArrayLiteralExpression(files)) {
  throw new Error("Expected the viFiles array in src/content/vocab/vi/index.ts");
}

const words = await readJson("words.json");
const entries = await Promise.all(files.elements.map(async (element) => {
  const path = imports.get(element.getText(registry));
  if (!path || !/^\.\/[a-z0-9-]+\.json$/.test(path)) throw new Error(`Invalid viFiles entry: ${element.getText(registry)}`);
  return readJson(`vi/${path.slice(2)}`);
}));
const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
const byLevel = new Map(words.map(({ id, level }) => [id, level]));
for (const file of entries) {
  for (const { id } of file.entries) {
    if (!byLevel.has(id)) throw new Error(`Vietnamese entry "${id}" has no matching word in words.json`);
  }
}
const topics = await Promise.all(["topics.json", "topics-a2.json", "topics-b1.json"].map(readJson));
await mkdir(output, { recursive: true });
const emit = (name, data) => writeFile(new URL(name, output), JSON.stringify(data));
await Promise.all([
  emit("topics.json", topics),
  // Keep localized batches ordered by the registry, independent of base-word rank.
  ...levels.map((level) => emit(`${level.toLowerCase()}.json`, {
    words: words.filter((word) => word.level === level),
    vi: entries.flatMap((file) => {
      const localized = file.entries.filter((entry) => byLevel.get(entry.id) === level);
      return localized.length ? [{ ...file, entries: localized }] : [];
    }),
  })),
]);
