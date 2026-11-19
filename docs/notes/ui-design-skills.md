# Đánh giá 10 skill thiết kế UI cho AI agent

_Lưu ngày 2026-11-19. Nhận xét dựa trên mô tả công khai của từng repo; nên đọc README trước khi cài._

## Nhìn chung

Cả 10 skill đều làm cùng một việc: chống kiểu "AI slop" (gradient tím, card bo tròn giống nhau,
font Inter mặc định, emoji làm icon…) và đẩy agent làm UI có gu hơn. Phần lớn chồng chéo nhau,
nên cài nhiều cái cùng lúc chỉ làm prompt dài thêm và các quy tắc dễ mâu thuẫn nhau.

Có thể chia thành 3 nhóm:

| Nhóm | Skill | Dùng để |
|---|---|---|
| **Định hướng thẩm mỹ** (chọn phong cách, font, màu, bố cục) | Frontend Design (Anthropic), Impeccable, Taste Skill, Anti UI Slop, Hallmark, UI UX Pro Max | Lúc bắt đầu dựng giao diện mới |
| **Quy chuẩn / kiểm tra chất lượng** (a11y, form, focus, hiệu năng, responsive) | Vercel Web Design Guidelines | Review và sửa UI đã có |
| **Chuyển động và độ "mượt"** (animation, micro-interaction, chi tiết nhỏ) | Emil Design Engineering, Make Interfaces Feel Better, Stageshow (Benji Taylor) | Đánh bóng sau cùng |

Nhận xét nhanh:

- **Frontend Design (Anthropic)**: gọn, chính thống, bắt agent chọn một hướng thẩm mỹ rõ ràng trước khi code. Nền tảng tốt nhất cho nhóm thẩm mỹ.
- **Impeccable**: mở rộng từ ý tưởng của Frontend Design, có thêm nhiều lệnh (audit, polish…). Mạnh nhưng nặng hơn; không nên cài chung với Frontend Design vì trùng ý.
- **Taste Skill / Anti UI Slop / Hallmark**: cùng hướng "đừng làm UI generic". Trùng phần lớn với hai skill trên.
- **UI UX Pro Max**: một kho lớn gồm style, bảng màu, cặp font, loại biểu đồ. Hợp khi cần tra cứu nhiều lựa chọn; dễ làm agent chọn kiểu "mẫu có sẵn" nếu không có định hướng.
- **Vercel Web Design Guidelines**: checklist kỹ thuật cụ thể (accessibility, keyboard, form, loading state, dark mode, hiệu năng). Không trùng với nhóm thẩm mỹ. Rất hợp với Next.js.
- **Emil Design Engineering**: kinh nghiệm về animation và interaction của một design engineer có tiếng (tác giả Sonner, Vaul). Hợp với app cần cảm giác mượt.
- **Make Interfaces Feel Better / Stageshow**: các mẹo đánh bóng chi tiết. Hữu ích nhưng trùng một phần với Emil.

## Chỉ cài 2 cái

**Khuyên dùng cho app, web, game:**

1. **Frontend Design (Anthropic)**: lo phần "đẹp, có gu, không generic".
2. **Vercel Web Design Guidelines**: lo phần "đúng, dùng được, không lỗi" (a11y, responsive, state, hiệu năng).

Lý do: hai skill này bổ sung cho nhau và gần như không trùng nhau (một cái lo thẩm mỹ, một cái lo
chất lượng kỹ thuật). Cả hai đến từ nguồn đáng tin và được bảo trì.

**Phương án thay thế:**

- Làm **app hoặc game nặng về chuyển động** (onboarding, HUD, menu, phản hồi khi chạm): đổi Vercel Web Design Guidelines thành **Emil Design Engineering**.
- Muốn **một skill làm được nhiều việc** (thiết kế + audit + polish): thay Frontend Design bằng **Impeccable**, không cài cả hai.

**Lưu ý về game:** các skill này đều viết cho UI web/app (HTML, CSS, React). Với game, chúng chỉ giúp
phần menu, HUD và màn hình phụ, không giúp gameplay, đồ họa canvas/WebGL hay game feel.
