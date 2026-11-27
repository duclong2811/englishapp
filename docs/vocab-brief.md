# Hướng dẫn soạn từ vựng (B1 trở lên)

Tài liệu này dành cho AI (Codex, GPT…) hoặc người soạn nội dung từ vựng cho app **Vở tiếng Anh**. App dạy tiếng Anh cho người Việt trưởng thành, học chủ yếu trên iPhone. Đọc hết tài liệu này trước khi bắt đầu. Làm đúng quy trình, không tự ý mở rộng phạm vi.

Mỗi lần nộp, một người duyệt sẽ kiểm tra. Bài nộp không qua test hoặc vi phạm quy tắc sẽ bị trả lại.

## 1. Việc cần làm

Viết nghĩa tiếng Việt, ghi chú và 2 câu ví dụ cho **toàn bộ 2.139 từ B1** trong `src/content/vocab/words.json` (các mục có `"level": "B1"`). Sau khi xong toàn bộ từ, chia chúng thành chủ đề trong `src/content/vocab/topics-b1.json` (mục 7).

Mẫu chuẩn để học theo: các file `src/content/vocab/vi/a2-core-*.json` (A2 đã duyệt xong về hình thức). Đọc vài chục mục trong đó trước khi viết.

**Không được sửa:**
- `words.json`, các file `a1-core-*`, `a2-core-*`, `topics.json`, `topics-a2.json`;
- bất kỳ file code nào ngoài những chỗ ghi rõ ở dưới (`vi/index.ts`, `topics-b1.json`);
- test. Nếu bạn nghĩ test sai, ghi lại trong mô tả PR, không sửa test.

## 2. Chuẩn bị và nhánh

```bash
npm ci
git checkout -b vocab-b1-<số đợt đầu>-<số đợt cuối>   # ví dụ vocab-b1-1-5
```

Không đẩy thẳng lên nhánh `ccr-2f80a8be-hdts76` (nhánh đang chạy web). Luôn mở **Pull Request vào nhánh `ccr-2f80a8be-hdts76`**. Mỗi PR từ 3 đến 5 đợt (300–500 từ).

## 3. Quy trình cho mỗi đợt 100 từ

1. Lấy đợt tiếp theo:
   ```bash
   npm run vocab:next -- B1 100 > /tmp/batch.json
   ```
   Lệnh này in ra tên file cần tạo (`file`) và 100 từ chưa có nghĩa, theo thứ tự tần suất. Mỗi từ có: `id`, `headword`, `pos` (từ loại kèm cấp độ), `ipa`, `forms` (các dạng chia) và `tatoeba` (câu ví dụ có sẵn, kèm bản dịch máy).
2. Tạo đúng file được chỉ định, ví dụ `src/content/vocab/vi/b1-core-1.json`, theo định dạng ở mục 4. Giữ đúng thứ tự từ như lệnh in ra.
3. Đăng ký file trong `src/content/vocab/vi/index.ts`: thêm một dòng import và thêm tên vào mảng `viFiles`.
   ```ts
   import b1Core1 from "./b1-core-1.json";
   // …
   export const viFiles: unknown[] = [/* các file cũ */, b1Core1];
   ```
4. Chạy kiểm tra. **Tất cả phải xanh** mới được commit:
   ```bash
   npm test
   npx tsc --noEmit
   npm run lint
   ```
5. Commit riêng cho từng đợt, message dạng: `B1 vocabulary: batch 1 (words 1-100)`.

Đợt sau chạy lại bước 1. Lệnh tự bỏ qua những từ đã có, và in ra tên file tiếp theo (`b1-core-2.json`…).

## 4. Định dạng file

```json
{
  "status": "draft",
  "about": "Từ B1, đợt 1: 100 từ. Bản nháp do AI soạn, cần người duyệt.",
  "entries": [
    {
      "id": "service",
      "meanings": [
        { "pos": "noun", "vi": "dịch vụ; sự phục vụ" },
        { "pos": "verb", "vi": "bảo dưỡng (xe, máy)" }
      ],
      "note": "customer service = dịch vụ khách hàng. bus service = tuyến xe buýt. Động từ service chủ yếu dùng cho xe, máy móc.",
      "examples": [
        { "en": "The service at this hotel is excellent.", "vi": "Dịch vụ ở khách sạn này rất tốt.", "source": "editor" },
        { "en": "There should be a bus service.", "vi": "Nên có một tuyến xe buýt.", "source": "tatoeba", "edited": true }
      ]
    }
  ]
}
```

Mỗi mục trong `entries`, viết trên một dòng như các file A2:

| Trường | Bắt buộc | Quy tắc |
|---|---|---|
| `id` | có | Đúng `id` lệnh in ra. |
| `meanings` | có | 1 đến 3 nghĩa. `pos` là một trong: `noun`, `verb`, `adjective`, `adverb`, `preposition`, `pronoun`, `determiner`, `conjunction`, `interjection`, `number`, `modal auxiliary`, `be-verb`, `do-verb`, `have-verb`. `vi` tối đa 60 ký tự. |
| `note` | có | 12–220 ký tự, viết bằng tiếng Việt (xem mục 5). |
| `examples` | có | Đúng 2 câu (xem mục 6). |
| `ipa` | chỉ khi `ipa` in ra là `MISSING…` | Phiên âm Anh-Mỹ, cùng kiểu với dữ liệu sẵn có (ví dụ `ˈsɝvəs`). Không có dấu `/`. Cụm nhiều từ thì nối phiên âm từng từ bằng dấu cách. |
| `forms` | không | Chỉ thêm khi dạng chia in ra bị sai. |

## 5. Nghĩa và ghi chú

**Nghĩa (`meanings`):**
- Chọn nghĩa **phổ biến nhất ở trình độ B1**, theo từ loại có cấp `(B1)` trong `pos`. Từ loại ở cấp cao hơn (B2, C1) chỉ thêm nếu thật sự hay gặp.
- Viết như từ điển Anh-Việt tốt: ngắn, tự nhiên, nhiều nghĩa gần nhau thì ngăn bằng dấu phẩy, nghĩa khác hẳn thì ngăn bằng dấu chấm phẩy. Ví dụ: `"vi": "dịch vụ; sự phục vụ"`.
- Không dịch từng chữ, không giải thích dài dòng trong phần nghĩa. Phần giải thích để vào `note`.
- Danh từ không đếm được, động từ bất quy tắc, cấu trúc đặc biệt: ghi trong `note`.

**Ghi chú (`note`):** một đến ba câu ngắn, hữu ích cho người Việt. Ưu tiên theo thứ tự:
1. Cụm từ hay đi kèm (collocation): `make a decision`, `take part in`.
2. Cấu trúc ngữ pháp: `avoid + V-ing`, `suggest (không có me to)`, `không đếm được`, quá khứ bất quy tắc.
3. Từ dễ nhầm: `lose/loose`, `affect/effect`, `borrow/lend`, `economic/economical`.
4. Khác biệt Anh-Anh và Anh-Mỹ, sắc thái trang trọng hay thân mật.
5. Phát âm dễ sai (âm câm, trọng âm): `receipt` (chữ p không đọc).

Không viết ghi chú vô nghĩa kiểu "Đây là một danh từ phổ biến.", "Từ này rất hữu ích."

## 6. Câu ví dụ

- Đúng **2 câu**, mỗi câu **4–14 từ**, kết thúc bằng `.`, `?` hoặc `!`.
- Câu phải chứa **đúng từ đang học**: `headword` hoặc một dạng trong `forms`, nguyên từ, không phải từ ghép. Ví dụ từ `service` thì câu có `services` được, câu có `serviceman` thì không. Nếu muốn dùng số nhiều mà `forms` không có `plural`, hãy dùng số ít.
- Hai câu thể hiện **hai cách dùng khác nhau** nếu từ có nhiều nghĩa hoặc nhiều từ loại.
- Ngữ cảnh đời thường, gần với người Việt: công việc văn phòng, gia đình, Hà Nội, Sài Gòn, Đà Nẵng, Tết, xe máy, quán cà phê… Từ vựng trong câu ở mức A1–B1, ngoài từ đang học.
- Không dùng tên người nổi tiếng có thật, không nói về chính trị gây tranh cãi, bạo lực chi tiết, tình dục, ma túy (trừ khi chính từ đó là chủ đề và câu trung tính).
- Bản dịch `vi`: tiếng Việt tự nhiên như người Việt nói, không dịch máy móc. Giữ cách xưng hô hợp ngữ cảnh: tôi/bạn, anh/chị/em, mình.

**Nguồn câu (`source`):**
- `"source": "editor"`: câu bạn tự viết. Phần lớn câu sẽ là loại này.
- `"source": "tatoeba"`: **chỉ** dùng khi câu tiếng Anh **trùng từng ký tự** với một câu trong mục `tatoeba` mà lệnh `vocab:next` in ra cho đúng từ đó. Test sẽ kiểm tra chuyện này; câu bịa mà ghi `tatoeba` sẽ bị chặn.
  - Bản dịch máy đi kèm thường kém. Nếu bạn viết lại bản dịch, thêm `"edited": true`.
  - Không sửa câu tiếng Anh của Tatoeba. Muốn sửa thì chuyển thành `editor`.
  - Chỉ dùng câu Tatoeba khi nó tự nhiên, ngắn, không lạ. Không có câu tốt thì tự viết cả hai câu.

## 7. Chủ đề (làm sau cùng, khi đủ 2.139 từ)

Điền `src/content/vocab/topics-b1.json`. Mẫu: `topics-a2.json`.

```json
{ "id": "b1-health", "title": "Sức khỏe và bệnh tật", "description": "Triệu chứng, điều trị, bệnh viện và lối sống lành mạnh.", "words": ["symptom", "treatment", "…"] }
```

- Khoảng 50–70 chủ đề. Mỗi chủ đề từ 11 đến 60 từ (app tự chia thành bộ khoảng 10 từ). `id` bắt đầu bằng `b1-`, chỉ chữ thường, số và gạch ngang.
- **Mỗi từ B1 nằm trong đúng một chủ đề.** Test sẽ báo nếu thiếu hoặc trùng.
- Gom theo nghĩa, sao cho người học thấy các từ liên quan đến nhau. Trong một chủ đề, từ liên quan đứng cạnh nhau. Từ chức năng (giới từ, liên từ, trạng từ) gom thành các chủ đề riêng như A2.
- Thứ tự chủ đề: các chủ đề đời sống, thực tế lên trước; chủ đề trừu tượng, ngữ pháp để sau.
- Tiêu đề và mô tả bằng tiếng Việt, ngắn gọn, viết hoa chữ đầu câu.

## 8. Trước khi mở PR

- [ ] `npm test`, `npx tsc --noEmit`, `npm run lint` đều xanh.
- [ ] Mỗi đợt là một file `b1-core-N.json` mới, đã đăng ký trong `vi/index.ts`.
- [ ] Không sửa file nào ngoài danh sách cho phép ở mục 1.
- [ ] Tự đọc lại ngẫu nhiên 10 mục mỗi đợt: nghĩa đúng chưa, câu ví dụ tự nhiên chưa, bản dịch có giống văn dịch máy không.

Mô tả PR gồm: các đợt đã làm (số từ), những từ bạn không chắc nghĩa (liệt kê kèm lý do), và mọi điều bất thường gặp phải.

## 9. Người duyệt sẽ kiểm tra gì

- Test tự động như trên.
- Đọc ngẫu nhiên khoảng 10–20% số mục, cộng toàn bộ những từ bạn ghi là không chắc.
- Lỗi lặp lại nhiều (nghĩa sai, ghi chú sáo rỗng, câu ví dụ gượng) thì trả lại cả đợt để sửa.
