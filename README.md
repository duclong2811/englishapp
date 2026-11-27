# Vở tiếng Anh

App học tiếng Anh cho người Việt, dùng trên iPhone (thêm vào màn hình chính) và PC. Gồm 3 phần nuôi lẫn nhau: bài học ngữ pháp, kho từ vựng có lịch ôn, và luyện nói với AI.

Đây là bản làm lại từ đầu. Code bản cũ vẫn nằm trên nhánh `main` và trong lịch sử git.

## Chạy thử

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`. Kiểm tra trước khi commit: `npm run lint && npm run build`.

## Thiết kế giao diện

Mọi thay đổi giao diện theo skill `.claude/skills/englishapp-ux/SKILL.md`. Skill này mô tả ý tưởng “vở ô li”, bảng màu, font, bố cục điện thoại và PC, quy tắc tương tác cho app học, và quy trình kiểm tra. Hai skill chung đi kèm (`frontend-design`, `web-design-guidelines`) được ghi nguồn trong `.claude/skills/THIRD_PARTY.md`.

- Font Be Vietnam Pro cho chữ tiếng Việt và giao diện. Font Literata (có chân) chỉ dùng cho nội dung tiếng Anh cần học.
- Điện thoại: thanh tab ở đáy màn hình. PC (từ 1024px): thanh bên trái.
- Có chế độ sáng và tối theo cài đặt của máy.

## Lộ trình

1. Khung app và hệ thống thiết kế (xong).
2. Kho từ vựng: gộp dữ liệu mở (CEFR-J, NGSL, ECDICT, câu Anh–Việt từ Tatoeba), thêm nghĩa tiếng Việt, lịch ôn tập FSRS.
3. Bài học ngữ pháp: soạn từ sách nguồn đặt trong `sources/` (thư mục này không đưa lên git). Làm 3 bài thử trước khi nhân rộng.
4. Luyện nói với AI theo kiểu xử lý cuốn chiếu (nghe, AI trả lời, đọc) để phản hồi nhanh.
