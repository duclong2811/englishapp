# Vở tiếng Anh

App học tiếng Anh cho người Việt, dùng trên iPhone (thêm vào màn hình chính) và PC. Gồm 3 phần nuôi lẫn nhau: bài học ngữ pháp, kho từ vựng có lịch ôn, và luyện nói với AI.

Đây là bản làm lại từ đầu. Code bản cũ vẫn nằm trên nhánh `main` và trong lịch sử git.

## Chạy thử

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`. Kiểm tra trước khi commit: `npm run lint && npm test && npm run build`.

Tiến độ ôn từ vựng hiện lưu trong trình duyệt của từng máy (localStorage), chưa đồng bộ giữa iPhone và PC.

## Thiết kế giao diện

Mọi thay đổi giao diện theo skill `.claude/skills/englishapp-ux/SKILL.md`. Skill này mô tả ý tưởng “vở ô li”, bảng màu, font, bố cục điện thoại và PC, quy tắc tương tác cho app học, và quy trình kiểm tra. Hai skill chung đi kèm (`frontend-design`, `web-design-guidelines`) được ghi nguồn trong `.claude/skills/THIRD_PARTY.md`.

- Font Be Vietnam Pro cho chữ tiếng Việt và giao diện. Font Literata (có chân) chỉ dùng cho nội dung tiếng Anh cần học.
- Điện thoại: thanh tab ở đáy màn hình. PC (từ 1024px): thanh bên trái.
- Có chế độ sáng và tối theo cài đặt của máy.

## Lộ trình

1. Khung app và hệ thống thiết kế (xong).
2. Kho từ vựng (đang làm): khoảng 8.600 từ A1–C2 từ dữ liệu mở. Toàn bộ 1.059 từ A1 và 1.241 từ A2 đã có nghĩa tiếng Việt, chia thành 33 chủ đề A1 (`src/content/vocab/topics.json`) và 44 chủ đề A2 (`topics-a2.json`), mỗi chủ đề gồm các bộ khoảng 10 từ: học từng từ, làm bài kiểm tra cả bộ, kết quả đưa vào lịch ôn FSRS. Xem `src/content/vocab/SOURCES.md`.
3. Bài học ngữ pháp A1 (xong): 25 bài theo `src/content/grammar/syllabus.ts`, nội dung ở `src/content/grammar/a1/`. Mỗi bài học theo từng màn: hội thoại mẫu, quy tắc, công thức, ví dụ có giải thích “vì sao”, câu “Thử ngay”, lỗi người Việt hay mắc, tóm tắt, rồi 15–18 bài tập (điền, chọn, sắp xếp, sửa lỗi, dịch bằng cách gõ hoặc nói).
4. Luyện nói (đã có): mỗi chủ đề từ vựng có một bài nói trong `src/content/speaking/lessons/` (33 bài). Bước 1 là hội thoại soạn sẵn: AI đọc lời của mình, người học đọc câu gợi ý và app chấm từng từ (Workers AI Whisper, không tốn phí Claude). Bước 2 là nhập vai tự do với Claude theo chủ đề đó, cuối buổi có nhận xét. Ngoài ra có "Nói tự do" không kịch bản. Test bắt buộc mỗi bài dùng ít nhất 80% từ của chủ đề (hiện 88–100%).

## Đưa lên Cloudflare

Bản đang chạy: https://english.longfx.trade (Worker `englishapp`, nhánh production `ccr-2f80a8be-hdts76`).

App chạy trên Cloudflare Workers qua bộ chuyển đổi OpenNext (`@opennextjs/cloudflare`). Mọi trang được dựng sẵn lúc build và phục vụ từ kho file tĩnh của Worker, nên không cần R2 hay KV.

- Chạy thử bản Cloudflare trên máy: `npm run cf:preview`
- Tự deploy từ máy: `npx wrangler login` một lần, rồi `npm run cf:deploy`
- Tự deploy khi đẩy code (Workers Builds): Cloudflare dashboard, Workers & Pages, Create application, Import a repository, chọn repo này. Build command: `npx opennextjs-cloudflare build`. Deploy command: `npx opennextjs-cloudflare deploy`. Tên Worker phải là `englishapp`, trùng với `wrangler.jsonc`.

### Luyện nói cần gì

- Workers AI (nhận giọng nói và giọng đọc tự nhiên Deepgram Aura-2): đã khai báo trong `wrangler.jsonc` (`"ai": {"binding": "AI"}`), không cần làm gì thêm.
- Khóa Claude: Cloudflare dashboard, Worker `englishapp`, Settings, Variables and Secrets, thêm Secret tên `ANTHROPIC_API_KEY`. Thiếu khóa thì màn luyện nói chạy chế độ thử.
- Tùy chọn: biến `SPEAK_CHAT_MODEL` (hội thoại) và `SPEAK_FEEDBACK_MODEL` (nhận xét) để đổi model; mặc định `claude-opus-5-5`.
- Giọng đọc: Aura-2 tính khoảng 0,03 USD/1.000 ký tự, trừ vào hạn mức Workers AI (gói Free có 10.000 neuron miễn phí mỗi ngày; hết hạn mức thì app tự chuyển sang giọng của máy). Câu đọc được cache nên câu cố định trong bài chỉ trả tiền một lần. Người học có thể chọn "Giọng của máy" để không tốn gì.
- Chạy trên máy: tạo `.dev.vars` chứa `ANTHROPIC_API_KEY=...` rồi `npm run cf:preview`.

Cache Components của Next.js đang tắt vì OpenNext chưa hỗ trợ đầy đủ.
