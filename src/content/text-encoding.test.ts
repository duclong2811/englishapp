import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Chặn lỗi double-encoding quay lại: nội dung tiếng Việt và tiếng Hàn phải là UTF-8
 * thật, không phải chuỗi mojibake kiểu “Káº¿t ná»‘i”.
 */
const mojibakeSignatures = [/Ã[\u0080-\u00ff]/, /Â[\u0080-\u00ff]/, /á»/, /áº/, /ì[\u0080-\u00bf]/, /ë[\u0080-\u00bf]/, /ê°/];

function walk(dir: string, files: string[] = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx|css|md|json)$/.test(entry.name)) files.push(full);
  }
  return files;
}

describe("Encoding nội dung", () => {
  const roots = ["src", "docs"].map((item) => path.join(process.cwd(), item));
  const files = [path.join(process.cwd(), "README.md"), ...roots.flatMap((root) => (fs.existsSync(root) ? walk(root) : []))];

  it("không còn dấu hiệu double-encoding trong nội dung và tài liệu", () => {
    const offenders: string[] = [];
    for (const file of files) {
      if (file.endsWith("text-encoding.test.ts")) continue;
      const text = fs.readFileSync(file, "utf8");
      for (const signature of mojibakeSignatures) {
        if (signature.test(text)) {
          offenders.push(path.relative(process.cwd(), file));
          break;
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
