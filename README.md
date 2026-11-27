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
2. Kho từ vựng (đang làm): khoảng 8.600 từ A1–C2 từ dữ liệu mở, 400 từ A1 đã có nghĩa tiếng Việt, ôn thẻ bằng FSRS, luyện tập 3 dạng (nghe chọn nghĩa, điền từ, chọn từ theo nghĩa). Xem `src/content/vocab/SOURCES.md`.
3. Bài học ngữ pháp: soạn từ sách nguồn đặt trong `sources/` (thư mục này không đưa lên git). Làm 3 bài thử trước khi nhân rộng.
4. Luyện nói với AI theo kiểu xử lý cuốn chiếu (nghe, AI trả lời, đọc) để phản hồi nhanh.

## Đưa lên Cloudflare

Bản đang chạy: https://english.longfx.trade (Worker `englishapp`, nhánh production `ccr-2f80a8be-hdts76`).

App chạy trên Cloudflare Workers qua bộ chuyển đổi OpenNext (`@opennextjs/cloudflare`). Mọi trang được dựng sẵn lúc build và phục vụ từ kho file tĩnh của Worker, nên không cần R2 hay KV.

- Chạy thử bản Cloudflare trên máy: `npm run cf:preview`
- Tự deploy từ máy: `npx wrangler login` một lần, rồi `npm run cf:deploy`
- Tự deploy khi đẩy code (Workers Builds): Cloudflare dashboard, Workers & Pages, Create application, Import a repository, chọn repo này. Build command: `npx opennextjs-cloudflare build`. Deploy command: `npx opennextjs-cloudflare deploy`. Tên Worker phải là `englishapp`, trùng với `wrangler.jsonc`.

Cache Components của Next.js đang tắt vì OpenNext chưa hỗ trợ đầy đủ.
