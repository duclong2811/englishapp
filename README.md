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
2. Kho từ vựng (đang làm): khoảng 8.600 từ A1–C2 từ dữ liệu mở. Toàn bộ 1.059 từ A1 đã có nghĩa tiếng Việt, chia thành 33 chủ đề (`src/content/vocab/topics.json`), mỗi chủ đề gồm các bộ khoảng 10 từ: học từng từ, làm bài kiểm tra cả bộ, kết quả đưa vào lịch ôn FSRS. Xem `src/content/vocab/SOURCES.md`.
3. Bài học ngữ pháp: soạn từ sách nguồn đặt trong `sources/` (thư mục này không đưa lên git). Làm 3 bài thử trước khi nhân rộng.
4. Luyện nói với AI (đã có bản đầu): 8 tình huống A1 trong `src/content/speaking/scenarios.ts`. Ghi âm trên trình duyệt, tự gửi khi người học ngừng nói; Workers AI Whisper chuyển thành chữ; Claude trả lời dạng stream và giọng đọc của máy đọc từng câu ngay khi câu đó về; cuối buổi có nhận xét bằng tiếng Việt.

## Đưa lên Cloudflare

Bản đang chạy: https://english.longfx.trade (Worker `englishapp`, nhánh production `ccr-2f80a8be-hdts76`).

App chạy trên Cloudflare Workers qua bộ chuyển đổi OpenNext (`@opennextjs/cloudflare`). Mọi trang được dựng sẵn lúc build và phục vụ từ kho file tĩnh của Worker, nên không cần R2 hay KV.

- Chạy thử bản Cloudflare trên máy: `npm run cf:preview`
- Tự deploy từ máy: `npx wrangler login` một lần, rồi `npm run cf:deploy`
- Tự deploy khi đẩy code (Workers Builds): Cloudflare dashboard, Workers & Pages, Create application, Import a repository, chọn repo này. Build command: `npx opennextjs-cloudflare build`. Deploy command: `npx opennextjs-cloudflare deploy`. Tên Worker phải là `englishapp`, trùng với `wrangler.jsonc`.

### Luyện nói cần gì

- Workers AI (nhận giọng nói): đã khai báo trong `wrangler.jsonc` (`"ai": {"binding": "AI"}`), không cần làm gì thêm.
- Khóa Claude: Cloudflare dashboard, Worker `englishapp`, Settings, Variables and Secrets, thêm Secret tên `ANTHROPIC_API_KEY`. Thiếu khóa thì màn luyện nói chạy chế độ thử.
- Tùy chọn: biến `SPEAK_CHAT_MODEL` (hội thoại) và `SPEAK_FEEDBACK_MODEL` (nhận xét) để đổi model; mặc định `claude-opus-5-5`.
- Chạy trên máy: tạo `.dev.vars` chứa `ANTHROPIC_API_KEY=...` rồi `npm run cf:preview`.

Cache Components của Next.js đang tắt vì OpenNext chưa hỗ trợ đầy đủ.
