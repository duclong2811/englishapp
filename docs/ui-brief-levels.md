# Hướng dẫn sửa giao diện: chọn cấp độ, trang Bài học, ảnh minh họa

Tài liệu này dành cho AI (Codex, GPT…) làm việc trên app **Vở tiếng Anh** (Next.js 16, React 19, Tailwind 4, deploy Cloudflare). Đọc hết trước khi code. Làm đúng phạm vi, không tự ý mở rộng.

Đọc thêm trước khi bắt đầu:
- `AGENTS.md` (Next.js bản này khác bản bạn biết: đọc tài liệu trong `node_modules/next/dist/docs/` trước khi dùng API nào bạn không chắc).
- `.claude/skills/englishapp-ux/SKILL.md`: hệ thống thiết kế "vở ô li" (màu, font, bố cục, quy trình). **Bắt buộc tuân theo.**

## 0. Nhánh, kiểm tra, PR

```bash
npm ci
git checkout -b ui-levels-lessons
```

- Mở **Pull Request vào nhánh `ccr-2f80a8be-hdts76`**. Không đẩy thẳng lên nhánh đó.
- Ba việc dưới đây làm **ba commit riêng**, theo thứ tự 1 → 2 → 3.
- Trước mỗi commit, tất cả phải xanh: `npm test`, `npx tsc --noEmit` (máy mới clone thì chạy `npx next typegen` trước), `npm run lint`, `npm run build`.
- Không sửa: nội dung trong `src/content/**` (trừ `src/content/illustrations.ts` mới và trường mới trong `src/content/grammar/syllabus.ts` như ghi dưới), test có sẵn, các route `src/app/api/**`, phần luyện nói.
- Được thêm test mới cho logic mới.

**Giới hạn kích thước:** server bundle của Cloudflare Worker chỉ được 3 MB (nén), hiện đã dùng khoảng 2,5 MB. Vì vậy:
- Ảnh để trong `public/`, dùng qua `<img src="/illustrations/…">`. **Không** import SVG vào code, không nhét SVG vào JSX, không base64.
- Không thêm thư viện npm mới.

## 1. Cho phép chọn học bất kỳ cấp độ nào

**Vấn đề hiện tại** (`src/components/vocab/vocab-overview.tsx`, `src/app/vocabulary/page.tsx`):
- Khối "Học tiếp" tự chọn cấp độ đầu tiên còn từ chưa học, nên người dùng luôn thấy A1 cho tới khi học hết A1.
- Nút chuyển A1/A2 nằm nhỏ ở góc phải mục "Chủ đề", rất khó thấy. Lựa chọn cũng mất khi tải lại trang.
- Danh sách "Kho từ theo cấp độ" bên phải chỉ dẫn tới danh sách từ, không đổi được cấp độ đang học.

**Cần làm:**
1. **Bộ chọn cấp độ** đặt ngay dưới tiêu đề trang Từ vựng, trên khối "Học tiếp".
   - Dạng thanh phân đoạn (segmented control) gồm A1, A2, B1, B2, C1, C2. Bên dưới mỗi nút có dòng nhỏ: tên tiếng Việt (Mới bắt đầu, Sơ cấp…) hoặc số chủ đề.
   - Cấp chưa có chủ đề (danh sách chủ đề rỗng) thì hiện nhưng mờ, ghi "Sắp có", không bấm được (`aria-disabled`).
   - Trên iPhone (390px), thanh này phải vừa màn hình hoặc cuộn ngang được, không làm trang cuộn ngang. Mỗi nút cao ít nhất 44px.
2. **Ghi nhớ lựa chọn.**
   - Lưu cấp đã chọn vào `localStorage`, key `vocab:level:v1`. Bọc mọi lần đọc/ghi trong try/catch, giống `src/lib/speaking/speaker.ts` (`getVoice`/`setVoice`).
   - Hỗ trợ thêm tham số URL `?level=a2`: ưu tiên URL, rồi localStorage, rồi mặc định.
   - Mặc định khi chưa chọn: giữ logic cũ (cấp đầu tiên còn từ chưa học).
   - Dùng `useSyncExternalStore` như `srs-store`, tránh `setState` trong `useEffect` (lint sẽ báo lỗi).
3. **Mọi thứ trên trang đi theo cấp đã chọn:** khối "Học tiếp" (chủ đề và bộ tiếp theo của cấp đó), tiêu đề "Chủ đề A2", danh sách chủ đề. Khối "Ôn tập" vẫn tính trên toàn bộ từ đã học (không đổi).
4. **"Kho từ theo cấp độ"** (cột phải): mỗi dòng có hai hành động rõ ràng:
   - bấm vào tên cấp thì chọn cấp đó để học;
   - thêm link nhỏ "Danh sách từ" dẫn tới `/vocabulary/level/<cấp>` như hiện nay.
5. **Không khóa gì cả:** kiểm tra lại các trang `/vocabulary/topic/[id]`, `/vocabulary/topic/[id]/[set]`, `/lessons/[id]`. Bất kỳ chủ đề, bộ từ, bài học nào cũng mở được trực tiếp, không cần học xong cái trước. Nếu có chỗ nào chặn thì gỡ.
6. **Trang Bài học** (`/lessons`) dùng cùng kiểu bộ chọn cấp độ (A1 có 25 bài; A2 trở lên ghi "Sắp có"). Key riêng: `lessons:level:v1`.
7. Viết bộ chọn thành **một component dùng chung**, ví dụ `src/components/level-picker.tsx`, cho cả hai trang.

Commit: `Let learners pick any level on vocabulary and lessons`.

## 2. Thiết kế lại trang Bài học (`/lessons`)

**Hiện tại** (`src/app/lessons/page.tsx`, `src/components/grammar/syllabus-list.tsx`):
- Một cột hẹp ở giữa, hai bên trống trên PC.
- Danh sách 25 dòng giống nhau, không có nhóm, không thấy tiến độ tổng.
- Câu "25/25 bài đã có. Các bài còn lại đang được soạn." bị sai khi đã đủ bài.

**Bố cục mới:**

```
PC (≥1024px)                                         iPhone
┌──────────────────────────────────┬───────────────┐ ┌──────────────────┐
│ Bài học                          │               │ │ Bài học          │
│ [A1][A2 Sắp có][B1 Sắp có]…      │ Tiến độ A1    │ │ [A1][A2]…  →     │
│ ┌─ Học tiếp (ô li) ────────────┐ │ 3/25 bài xong │ │ ┌─ Học tiếp ───┐ │
│ │ [ảnh] Bài 7 · Chương 2        │ │ ▓▓░░░░░░░░    │ │ │[ảnh] Bài 7   │ │
│ │ Hiện tại đơn: phủ định…       │ │               │ │ │ Tiêu đề      │ │
│ │ summary 1 dòng   [Vào bài]    │ │ Chương 1 ✓    │ │ │ [Vào bài]    │ │
│ └───────────────────────────────┘ │ Chương 2 2/5  │ │ └──────────────┘ │
│ Chương 1 · Nền tảng      5/5 ✓    │ Chương 3 0/3  │ │ Chương 1 · …     │
│ ┌──────────┐ ┌──────────┐         │ …             │ │ ┌──────────────┐ │
│ │[ảnh] 1   │ │[ảnh] 2   │         │ (bấm để nhảy  │ │ │[ảnh] 1 …     │ │
│ │ Tiêu đề  │ │ Tiêu đề  │         │  tới chương)  │ │ └──────────────┘ │
│ │ summary  │ │ summary  │         │               │ │ …                │
│ │ ✓ 92%    │ │ Chưa học │         │               │ │                  │
│ └──────────┘ └──────────┘         │               │ │                  │
└──────────────────────────────────┴───────────────┘ └──────────────────┘
```

**Chi tiết:**
1. **Chia chương.** Thêm vào `src/content/grammar/syllabus.ts` một mảng `A1_UNITS`, mỗi phần tử `{ id, title, lessons: string[] }`, dùng đúng các id bài đã có, giữ nguyên thứ tự:
   - Chương 1 "Nền tảng": `be-present`, `articles-plurals`, `this-that`, `possessives`, `there-is-are`
   - Chương 2 "Hiện tại đơn": `present-simple`, `present-simple-questions`, `frequency-adverbs`, `can`, `imperatives`
   - Chương 3 "Nơi chốn, thời gian và đại từ": `prepositions-place`, `prepositions-time`, `object-pronouns`
   - Chương 4 "Số lượng và sở thích": `some-any`, `how-much-many`, `like-ing`
   - Chương 5 "Hiện tại tiếp diễn": `present-continuous`, `simple-vs-continuous`
   - Chương 6 "Quá khứ": `was-were`, `past-simple-regular`, `past-simple-irregular`, `past-simple-questions`
   - Chương 7 "Tương lai và giao tiếp": `going-to`, `question-words`, `would-like`

   Thêm một test nhỏ: mọi id trong `A1_SYLLABUS` nằm trong đúng một chương.
2. **Thẻ bài học:**
   - Lưới 2 cột từ `sm:` trở lên, 1 cột trên iPhone.
   - Mỗi thẻ gồm: ảnh minh họa (mục 3, 48px), số bài, tiêu đề, `summary` của bài (đã có trong `src/content/grammar/a1/<id>.json`, cắt còn 2 dòng bằng `line-clamp-2`) và trạng thái.
   - Trạng thái lấy từ `grammarScores` (`src/lib/grammar/progress.ts`): "Chưa học"; điểm cao nhất dưới 80% (màu `ink-soft`); từ 80% trở lên có dấu ✓ màu `correct`.
   - Truyền `summary` từ server component xuống, không import cả file bài học vào client component.
3. **Khối "Học tiếp"** (giữ nền ô li `.oli`, chỉ dùng ô li ở đúng chỗ này):
   - Có ảnh minh họa, "Bài N · Chương M", tiêu đề, summary, nút "Vào bài".
   - Học hết thì hiện "Bạn đã học hết ngữ pháp A1" và nút "Ôn lại bài điểm thấp nhất".
4. **Cột phải trên PC (≥1024px):**
   - Tiến độ cấp hiện tại (số bài đạt từ 80% trở lên trên tổng, kèm thanh mảnh);
   - danh sách chương với tiến độ từng chương; bấm vào thì cuộn tới chương đó (anchor `#unit-<id>`).
   - Trên iPhone không có cột phải, thay bằng một dòng tiến độ ngắn dưới bộ chọn cấp độ.
   - Bố cục hai cột lấy mẫu từ `src/app/vocabulary/page.tsx`: `lg:grid-cols-[minmax(0,40rem)_minmax(16rem,22rem)]`.
5. Bỏ câu "x/y bài đã có…" khi đã đủ bài. Chỉ hiện "Còn N bài đang soạn" khi N > 0.
6. Tuân theo SKILL.md:
   - chỉ dùng token màu, không mã màu cứng;
   - chữ tiếng Việt font sans;
   - viết hoa chữ đầu câu, không nhãn chữ in hoa;
   - không confetti, không chuỗi ngày (streak).

Commit: `Redesign the lessons page with units and lesson cards`.

## 3. Ảnh minh họa cho thẻ chủ đề và bài học

Mục tiêu: mỗi thẻ chủ đề từ vựng (A1 có 33, A2 có 44) và mỗi bài ngữ pháp (25) có một hình nhỏ, như **nhãn dán trong vở**. Hình chỉ để trang trí và nhận diện nhanh, không thay chữ.

**Nguồn ảnh: Microsoft Fluent Emoji, kiểu Flat** (giấy phép MIT).
- Kho: `https://github.com/microsoft/fluentui-emoji`.
- File nằm ở `assets/<Tên>/Flat/<tên>_flat.svg`, ví dụ `assets/Hot beverage/Flat/hot_beverage_flat.svg`.
- Chỉ dùng kiểu **Flat**, không trộn với kiểu 3D, Color hay High Contrast, để các hình đồng bộ.
- Môi trường không có mạng thì dừng lại và ghi trong PR, không tự vẽ SVG thay thế.

**Cách làm:**
1. Tải mỗi hình cần dùng vào `public/illustrations/<tên-ngắn>.svg`, tên chữ thường, gạch ngang, ví dụ `hot-beverage.svg`.
   - Chạy qua `npx svgo` nếu có sẵn; không có thì để nguyên.
   - Mỗi file nên dưới 8 KB.
2. Tạo `src/content/illustrations.ts`:
   ```ts
   /** Topic or lesson id → file in /public/illustrations (Fluent Emoji Flat, MIT). */
   export const ILLUSTRATIONS: Record<string, string> = {
     "greetings": "waving-hand",
     "be-present": "…",
     // …
   };
   ```
   - Lấy id chủ đề từ `src/content/vocab/topics.json` và `topics-a2.json`, id bài từ `syllabus.ts`.
   - Chọn hình **khớp nghĩa** với chủ đề hoặc bài: đồ ăn → bát cơm, thời tiết → mây mưa, quá khứ → đồng hồ cát…
   - Hạn chế trùng hình giữa các chủ đề cùng cấp.
3. Tạo component `src/components/illustration.tsx`:
   ```tsx
   <img src={`/illustrations/${name}.svg`} alt="" width={size} height={size} loading="lazy" decoding="async" />
   ```
   - `alt=""` vì hình chỉ trang trí.
   - Không có tên thì không render gì (không để ô trống).
   - Đặt trong một ô nền `bg-paper`, bo góc, kích thước cố định để layout không nhảy.
4. **Dùng ở:**
   - thẻ chủ đề trong `vocab-overview.tsx` (40px, bên trái tiêu đề);
   - khối "Học tiếp" của Từ vựng và Bài học (56–64px);
   - thẻ bài học mới ở mục 2 (48px);
   - đầu trang chi tiết chủ đề `/vocabulary/topic/[id]` (64px).
   - **Không** dùng trong màn hình luyện tập, flashcard hay bài kiểm tra (một việc mỗi màn hình, không phân tâm).
5. **Chế độ tối:** kiểm tra hình vẫn rõ trên nền tối. Nếu hình nào quá tối, đặt ô nền sáng nhẹ (`bg-sheet` có viền `border-line`), không đổi màu hình.
6. **Ghi nguồn và quy tắc:**
   - Thêm vào `public/THIRD_PARTY.md` một mục ghi tên bộ ảnh, link kho, giấy phép MIT và bản quyền Microsoft Corporation.
   - Thêm vào `.claude/skills/englishapp-ux/SKILL.md` một mục ngắn "Illustrations": chỉ dùng Fluent Emoji Flat; chỉ trên thẻ chủ đề, thẻ bài và khối Học tiếp; không dùng trong màn hình luyện tập.
7. Thêm test: mọi id chủ đề (A1, A2) và mọi bài A1 đều có mục trong `ILLUSTRATIONS`, và file `public/illustrations/<tên>.svg` tương ứng tồn tại.

Commit: `Add topic and lesson illustrations`.

## 4. Trước khi mở PR

- [ ] Bốn lệnh kiểm tra ở mục 0 đều xanh.
- [ ] Chụp màn hình `/vocabulary` và `/lessons` ở 390×844 và 1440×900, sáng và tối (Playwright có sẵn). Đính kèm vào PR hoặc mô tả những gì đã kiểm tra.
- [ ] Trên iPhone không có cuộn ngang; mọi nút cao từ 44px.
- [ ] Chọn A2 → tải lại trang → vẫn là A2. Mở `/vocabulary?level=a1` → hiện A1.
- [ ] Số lượng file ảnh trong `public/illustrations/` và tổng dung lượng (ghi trong PR).

Mô tả PR gồm: ba phần đã làm, ảnh chụp, những chỗ bạn không chắc, và kích thước server bundle sau khi build. Đo bằng:

```bash
npm run cf:build
npx wrangler deploy --dry-run --outdir /tmp/cfout 2>&1 | grep -i "total upload"
```

Dòng `Total Upload` có số `gzip`, số đó phải dưới 3 MB. Nếu lệnh này không chạy được thì ghi lại, không sửa cấu hình build.
