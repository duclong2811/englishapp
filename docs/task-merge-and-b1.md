# Việc tiếp theo cho GPT: gộp PR #2, sửa PR #1, tách dữ liệu từ vựng

Đọc `AGENTS.md` và `docs/vocab-brief.md` trước. Làm lần lượt 3 việc dưới đây.

## Việc 1. Gộp PR #2

PR #2 (`ui-levels-lessons`) đã được duyệt. Gộp vào `ccr-2f80a8be-hdts76` bằng **merge commit** (không squash). Sau đó kéo nhánh `ccr-2f80a8be-hdts76` mới nhất về máy.

## Việc 2. Tách dữ liệu từ vựng ra khỏi server bundle

Làm việc này trên nhánh mới `vocab-data-split`, tạo từ `ccr-2f80a8be-hdts76`. Mở PR vào `ccr-2f80a8be-hdts76`.

**Vấn đề.** Cloudflare Worker chỉ cho phép 3 MB (đã nén gzip). Hiện bản build đã dùng khoảng 2,54 MB. Phần lớn là JSON từ vựng: `src/content/vocab/words.json` và các file `src/content/vocab/vi/*.json`, được import qua `src/lib/vocab/data.ts`. Nếu thêm đủ 2.139 từ B1, bản build sẽ vượt giới hạn.

**Mục tiêu.** Server bundle không còn chứa dữ liệu từ vựng. Thêm B1, B2… cũng không làm bundle to thêm.

**Gợi ý hướng làm.** Bạn tự đánh giá và chọn cách tốt nhất, giải thích lý do trong PR.

- **(a) Tạo tệp tĩnh khi build.** Thêm một script `prebuild`, ví dụ `tools/vocab/emit.mjs`, ghi dữ liệu đã gộp ra `public/data/vocab/*.json`, chia theo cấp hoặc theo chủ đề để mỗi tệp nhỏ. Đọc các tệp này:
  - phía server: qua binding `ASSETS` của OpenNext (`getCloudflareContext().env.ASSETS.fetch(...)`);
  - phía client: bằng `fetch`.
- **(b) Prerender.** Prerender toàn bộ các trang từ vựng (`generateStaticParams`, trang tĩnh), để worker không cần import dữ liệu lúc chạy. Cần kiểm tra bằng số đo thật: bundle phải nhỏ đi.
- Không dùng dịch vụ trả phí mới (KV, R2, D1), trừ khi (a) và (b) đều không làm được. Khi đó ghi rõ lý do trong PR.

**Yêu cầu chung:**
- Mọi trang và chức năng từ vựng hoạt động như cũ: chủ đề, bộ từ, trang từ, danh sách theo cấp, ôn tập, luyện tập. Phần luyện nói và ngữ pháp cũng không được hỏng.
- `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build` đều xanh.
- Được sửa test nếu chỉ đổi cách nạp dữ liệu. Các kiểm tra chất lượng trong `quality.test.ts` phải giữ nguyên.
- Đo bundle trước và sau, ghi cả hai số vào PR:
  ```bash
  npm run cf:build
  npx wrangler deploy --dry-run --outdir /tmp/cfout 2>&1 | grep -i "total upload"
  ```
  Kết quả sau khi sửa nên dưới 1,5 MB gzip.
- Chạy thử bằng `npm run cf:preview`, mở các trang từ vựng và xác nhận chúng hoạt động.

## Việc 3. Sửa 5 lỗi trong PR #1 (từ B1, đợt 1–3), rồi gộp

Làm trên chính nhánh `vocab-b1-1-3`:

1. **unless**: sửa bản dịch câu "Don't call me unless you need help." thành "Đừng gọi cho tôi trừ khi bạn cần giúp." Bản cũ dịch thành "nếu bạn **không** cần giúp", sai nghĩa.
2. **resident**: thêm nghĩa danh từ `{ "pos": "noun", "vi": "cư dân, người cư trú" }` và đặt **trước** nghĩa tính từ. Ít nhất một câu ví dụ phải dùng nghĩa danh từ.
3. **decision**: dịch "by Friday" thành "chậm nhất là thứ Sáu".
4. **nod**: thêm nghĩa động từ `{ "pos": "verb", "vi": "gật đầu" }` và đặt **trước** nghĩa danh từ. Một câu ví dụ phải dùng động từ, ví dụ "She nodded and smiled at me."
   - Nếu `nodded` không nằm trong `forms` của từ này thì dùng "nod", ví dụ "Just nod if you understand."
5. **enemy**: thay câu đầu bằng câu đơn giản hơn, ví dụ "The cat and the dog are not enemies." (nếu `forms` không có số nhiều thì dùng câu số ít).

Sau khi sửa:
- chạy test cho xanh rồi commit;
- **đợi Việc 2 được gộp xong** thì mới gộp PR #1 vào `ccr-2f80a8be-hdts76`;
- nếu có xung đột với `vi/index.ts` hoặc với cách nạp dữ liệu mới thì sửa cho khớp;
- đo lại bundle sau khi gộp.

## Báo cáo

Khi xong, báo lại:
- số bundle trước và sau;
- cách bạn chọn ở Việc 2 và lý do;
- link các PR;
- những chỗ bạn chưa chắc.
