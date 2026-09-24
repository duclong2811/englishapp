/**
 * Sửa lỗi double-encoding: UTF-8 bị đọc nhầm thành windows-1252 rồi ghi lại.
 *
 * Cách sửa đúng: mã hoá ngược về byte windows-1252 rồi giải mã bằng UTF-8.
 * Chạy: node tools/fix-mojibake.mjs <file> [...]
 */
import fs from "node:fs";

const cp1252Reverse = new Map([
  [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84], [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87],
  [0x02c6, 0x88], [0x2030, 0x89], [0x0160, 0x8a], [0x2039, 0x8b], [0x0152, 0x8c], [0x017d, 0x8e], [0x2018, 0x91],
  [0x2019, 0x92], [0x201c, 0x93], [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97], [0x02dc, 0x98],
  [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b], [0x0153, 0x9c], [0x017e, 0x9e], [0x0178, 0x9f],
]);

function encode1252(text) {
  const bytes = [];
  for (const char of text) {
    const code = char.codePointAt(0);
    if (cp1252Reverse.has(code)) bytes.push(cp1252Reverse.get(code));
    else if (code <= 0xff) bytes.push(code);
    else return undefined;
  }
  return Buffer.from(bytes);
}

const mojibakeHint = /(?:Ã[\u0080-\u00ff]|Â[\u0080-\u00ff]|á»|áº|ì[\u0080-\u00bf]|ë[\u0080-\u00bf]|í[\u0080-\u00bf]|ê°)/;

for (const file of process.argv.slice(2)) {
  const raw = fs.readFileSync(file, "utf8");
  if (!mojibakeHint.test(raw)) {
    console.log(`bỏ qua (đã đúng): ${file}`);
    continue;
  }
  const bytes = encode1252(raw);
  if (!bytes) {
    console.log(`cảnh báo: ${file} chứa ký tự ngoài windows-1252, không tự sửa`);
    continue;
  }
  const fixed = bytes.toString("utf8");
  if (fixed.includes("\uFFFD")) {
    console.log(`cảnh báo: ${file} không giải mã sạch, giữ nguyên`);
    continue;
  }
  fs.writeFileSync(file, fixed, "utf8");
  console.log(`đã sửa: ${file}`);
}
