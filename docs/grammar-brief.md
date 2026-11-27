# Hướng dẫn soạn ngữ pháp A2

Tài liệu này dành cho AI (Codex, GPT…) làm việc trên app **Vở tiếng Anh**. Đọc hết trước khi làm. Đọc thêm:
- `AGENTS.md`: Next.js bản này khác bản bạn biết.
- `.claude/skills/englishapp-ux/SKILL.md`: hệ thống thiết kế.

Ngữ pháp A1 (25 bài, trong `src/content/grammar/a1/`) đã xong và đã được duyệt. **Đó là mẫu chuẩn.** Trước khi viết, đọc kỹ ít nhất ba bài: `present-simple.json`, `be-present.json`, `simple-vs-continuous.json`. Chạy app (`npm run dev`, mở `/lessons/present-simple`) để thấy nội dung hiện ra thế nào.

## 0. Quy trình chung

- Mỗi PR mở **vào nhánh `ccr-2f80a8be-hdts76`**. Không đẩy thẳng lên nhánh đó.
- Trước mỗi commit, cả bốn lệnh sau phải xanh: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- Chia PR như sau:
  - **PR đầu (`grammar-a2-1`):** phần code ở mục 1, cộng 4 bài của Chương 1.
  - **Các PR sau:** mỗi PR một hoặc hai chương (4–9 bài). Mỗi bài một commit, message dạng `A2 grammar: past-continuous`.
- Không sửa: bài A1, từ vựng, phần luyện nói, các route API.

## 1. Phần code (chỉ làm trong PR đầu)

Hiện code chỉ biết A1. Cần mở rộng để chứa nhiều cấp độ:

1. **`src/content/grammar/syllabus.ts`:**
   - thêm `A2_SYLLABUS` và `A2_UNITS` đúng như mục 2;
   - thêm `GRAMMAR_LEVELS` dạng `{ A1: { syllabus, units }, A2: { syllabus, units } }` để code khác dùng.
2. **Thư mục `src/content/grammar/a2/`:** chứa các file `<id>.json`, kèm `index.ts` export `grammarFiles` giống `a1/index.ts`.
3. **`src/lib/grammar/schema.ts`:** `level` nhận `"A1" | "A2"`.
4. **`src/lib/grammar/lessons.ts`:**
   - `getGrammarLessons()` trả về bài của mọi cấp;
   - `getSyllabus(level)`;
   - `neighbours(id)` chỉ tính trong cùng cấp với bài đó.
   - `id` bài phải **duy nhất giữa mọi cấp**, viết test cho điều này.
5. **Trang `/lessons`:**
   - server truyền chương và bài của mọi cấp có bài xuống client;
   - `SyllabusList` hiện theo cấp đang chọn;
   - trong `LevelPicker`, cấp có ít nhất một bài là bấm được (A2 bấm được ngay từ PR đầu);
   - bài chưa viết hiện "Sắp có" như hiện tại.
6. **Trang bài học `/lessons/[id]`:** mọi chữ "A1" cố định đổi thành cấp của bài. Số bài đánh theo thứ tự trong cấp đó.
7. **Tiến độ:** giữ nguyên key `grammar:a1:v1` cho mọi cấp, vì id là duy nhất. Đổi key sẽ làm mất điểm người dùng đã có. Ghi chú điều này bằng một dòng comment.
8. **Ảnh minh họa:**
   - mỗi bài A2 có một mục trong `src/content/illustrations.ts`, dùng ảnh Fluent Emoji Flat như A1 (xem `public/THIRD_PARTY.md`);
   - mở rộng test trong `src/lib/illustrations.test.ts` để kiểm tra cả bài A2.
9. **Test chất lượng mới, chỉ áp dụng cho A2** (A1 giữ nguyên). Mỗi bài A2 phải có:
   - `dialogue` 6–8 câu, ít nhất một nửa có `[[…]]`;
   - 3–5 `part` khác nhau trong `sections`;
   - mỗi section có `rule`, ít nhất 2 `examples`, và **mọi example đều có `why`**;
   - mỗi `part` có ít nhất một `check`;
   - ít nhất 5 `mistakes`;
   - ít nhất 15 `exercises`, gồm: `choice` ≥ 4, `fill` ≥ 4, `order` ≥ 2, `fix` ≥ 3, `translate` ≥ 2;
   - mọi `examples.en` và câu hội thoại dài 3–16 từ;
   - `summary` từ 40 đến 160 ký tự.

## 2. Chương trình A2 (29 bài, 7 chương)

Giữ đúng `id`, tên bài và thứ tự dưới đây. Tên chương và tên bài viết bằng tiếng Việt, cụm tiếng Anh giữ nguyên.

| Chương | id | Tên bài |
|---|---|---|
| 1. Kể chuyện quá khứ | `past-continuous` | Quá khứ tiếp diễn: I was working |
| | `past-simple-vs-continuous` | Quá khứ đơn hay quá khứ tiếp diễn? When, while |
| | `used-to` | Used to: thói quen trong quá khứ |
| | `time-clauses` | Before, after, when, until, as soon as |
| 2. Hiện tại hoàn thành | `present-perfect-experience` | Hiện tại hoàn thành: ever, never |
| | `present-perfect-just-yet` | Just, already, yet |
| | `present-perfect-for-since` | For và since: how long |
| | `present-perfect-vs-past` | Hiện tại hoàn thành hay quá khứ đơn? |
| 3. Tương lai và điều kiện | `will-future` | Will: dự đoán, quyết định tức thì, lời hứa |
| | `will-vs-going-to` | Will hay be going to? |
| | `present-for-future` | Hiện tại tiếp diễn cho lịch hẹn tương lai |
| | `zero-conditional` | Câu điều kiện loại 0: If you heat ice, it melts |
| | `first-conditional` | Câu điều kiện loại 1: If it rains, I will… |
| 4. So sánh và mô tả | `comparatives` | So sánh hơn: bigger, more expensive |
| | `superlatives` | So sánh nhất: the biggest, the most… |
| | `as-as` | As … as, not as … as, the same as |
| | `too-enough` | Too và enough |
| | `adverbs-manner` | Trạng từ cách thức: quickly, well, hard |
| 5. Động từ khuyết thiếu | `must-have-to` | Must, have to, don't have to, mustn't |
| | `should` | Should: lời khuyên |
| | `might-may` | Might, may: có lẽ, có thể |
| | `could-requests` | Could you…? Can I…? May I…? |
| 6. Danh từ, đại từ và lượng từ | `quantifiers` | Much, many, a few, a little, a lot of |
| | `some-any-compounds` | Something, anyone, nobody, everywhere… |
| | `possessive-pronouns` | Mine, yours… và whose |
| | `articles-the` | The hay không có mạo từ |
| 7. Nối câu | `verb-ing-to` | Động từ + V-ing hay to V: enjoy doing, want to do |
| | `relative-clauses` | Who, which, that: mệnh đề quan hệ |
| | `linking-words` | And, but, so, because, although |

**Nội dung A1 đã dạy** (be, hiện tại đơn và tiếp diễn, quá khứ đơn, going to, can, would like, some/any, how much/many…): A2 chỉ nhắc lại khi cần so sánh, không dạy lại từ đầu.

## 3. Cấu trúc mỗi bài

Định dạng JSON theo `src/lib/grammar/schema.ts`. Ký hiệu trong nội dung:
- `[[…]]` trong câu tiếng Anh: điểm ngữ pháp, được tô sáng.
- `*…*` trong câu tiếng Việt: một cụm tiếng Anh.
- `**…**`: nhấn mạnh.

1. **`summary`:** một đến hai câu nói bài này giúp làm được gì.
   - Ví dụ: "Kể việc đang diễn ra tại một lúc trong quá khứ và việc bị cắt ngang."
2. **`dialogue`:** 6–8 câu hội thoại đời thường giữa A và B.
   - Bối cảnh Việt Nam hoặc công việc văn phòng, gia đình, du lịch.
   - Mỗi câu kèm bản dịch tự nhiên.
   - Điểm ngữ pháp được đánh dấu `[[…]]`.
3. **`sections`:** chia thành 3–5 phần (`part`). Mỗi phần là một bước trên thanh bước của bài; nhiều section liền nhau có cùng `part` thì gộp thành một bước.
   - Thứ tự thường dùng: **Cấu tạo** (formula, bảng chia) → **Cách dùng** (từng cách một, mỗi cách một section) → **So sánh hoặc dễ nhầm** → **Phủ định, câu hỏi** (nếu có).
   - Mỗi section có:
     - `rule`: **một câu** quy tắc dễ nhớ, kiểu "Việc **đang diễn ra** thì bị việc khác **cắt ngang** → quá khứ tiếp diễn + when + quá khứ đơn."
     - `formula` khi có công thức: dạng `"S + was/were + [V-ing]"`, phần trong `[…]` là trọng tâm. Dùng `label` "Sai"/"Đúng" khi cần so sánh.
     - `signals`: các từ dấu hiệu, nếu có.
     - `body`: 1–3 đoạn ngắn giải thích bằng tiếng Việt, như giáo viên giỏi giảng cho người lớn. Giải thích **vì sao**, không chỉ nêu luật.
     - `table`: khi cần chia động từ hoặc so sánh.
     - `examples`: 2–5 câu. **Mỗi câu có `why`**, nói rõ dấu hiệu nào trong câu dẫn tới cấu trúc này.
     - `check`: một câu hỏi nhanh "Thử ngay" với 2–4 lựa chọn và lời giải thích.
4. **`mistakes`:** ít nhất 5 lỗi **người Việt hay mắc thật**, mỗi lỗi có `wrong`, `right`, `why`.
   - Ví dụ: "I have seen him yesterday." (tiếng Việt không chia thì nên hay dùng nhầm), "She is more taller."
5. **`exercises`:** 15–20 câu, đi từ dễ đến khó:
   - `choice`: prompt tiếng Anh có `___` thì người học **gõ** đáp án, nên đáp án phải là chữ gõ được. Prompt tiếng Việt thì người học chọn.
   - `fill`: một chỗ trống, `hint` là động từ gốc trong ngoặc. `answers` liệt kê **mọi** cách viết đúng, gồm cả dạng rút gọn và không rút gọn.
   - `order`: sắp xếp từ thành câu, ít nhất 5 từ ở A2. Có thứ tự khác cũng đúng thì ghi vào `alternatives`.
   - `fix`: một câu sai đúng kiểu lỗi trong `mistakes`, `answers` là câu đã sửa.
   - `translate`: dịch Việt sang Anh. `answers` liệt kê nhiều cách dịch đúng có thể có, ít nhất 2 khi được.
   - Mọi bài tập có `explain` ngắn bằng tiếng Việt: vì sao đáp án đúng.

## 4. Chất lượng nội dung

- **Đúng ngữ pháp là trên hết.** Câu tiếng Anh phải tự nhiên như người bản xứ nói, kiểu Anh-Mỹ. Không có câu "sách giáo khoa" gượng gạo.
- Từ vựng trong câu ở mức A1–A2 để người học tập trung vào ngữ pháp.
- Giải thích bằng tiếng Việt đơn giản, xưng "bạn". Thuật ngữ thì giải thích ngay lần đầu, ví dụ "trợ động từ (từ phụ giúp tạo câu hỏi, phủ định)".
- So sánh với tiếng Việt khi giúp hiểu nhanh, ví dụ "tiếng Việt dùng *đã*, *đang*, *sẽ*; tiếng Anh đổi dạng động từ".
- Đáp án bài tập phải **chấm được bằng máy**: một chỗ trống chỉ nên có một nhóm đáp án hợp lý. Có nhiều đáp án đúng thì liệt kê đủ trong `answers`.
- Không chính trị, bạo lực, nội dung nhạy cảm. Không dùng tên người nổi tiếng có thật.
- Không chép nội dung từ sách hay website khác. Tự viết.

## 5. Trước khi mở mỗi PR

- [ ] Bốn lệnh kiểm tra xanh.
- [ ] Mở từng bài mới trong app (`npm run dev`), làm hết bài tập ít nhất một lần, kiểm tra không có câu nào làm đúng mà bị chấm sai.
- [ ] Tự đọc lại toàn bộ câu tiếng Anh một lượt, chỉ để soát lỗi ngữ pháp.

Mô tả PR gồm: các bài đã làm, những chỗ bạn không chắc (quy tắc nào có ngoại lệ, câu nào có nhiều cách hiểu) và ảnh chụp một bài trên iPhone (390×844).
