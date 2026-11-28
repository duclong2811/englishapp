# Hướng dẫn soạn từ vựng C1

Tài liệu này dành cho AI (Codex, GPT…) soạn từ vựng **C1** cho app **Vở tiếng Anh**. App dạy tiếng Anh cho người Việt trưởng thành, học chủ yếu trên iPhone. Hãy đọc hết tài liệu trước khi bắt đầu, làm đúng quy trình và không tự ý mở rộng phạm vi.

Mỗi PR đều có người duyệt. Bài nộp không qua test hoặc vi phạm quy tắc sẽ bị trả lại.

## 1. Việc cần làm

| | |
|---|---|
| Số từ | **913 từ C1** (các mục có `"level": "C1"` trong `src/content/vocab/words.json`) |
| File từ | `src/content/vocab/vi/c1-core-1.json`, `c1-core-2.json`… mỗi file 100 từ, tổng cộng 10 đợt (đợt 10 có 13 từ) |
| File chủ đề | `src/content/vocab/topics-c1.json`, làm **sau cùng** (mục 7) |
| Mẫu chuẩn | các file `vi/b2-core-*.json` (B2 đã duyệt xong). Đọc ít nhất 50 mục trước khi viết, nhất là `b2-core-13` đến `b2-core-25`. |

**Chỉ được sửa:**
- các file `vi/c1-core-*.json` bạn tạo;
- `src/content/vocab/vi/index.ts` (đăng ký file mới);
- `src/content/vocab/topics-c1.json` (chỉ ở PR chủ đề).

**Không được sửa:** `words.json`, file từ và chủ đề của cấp khác, code, test, tài liệu. Nếu bạn nghĩ test sai, ghi vào mô tả PR, không sửa test.

## 2. Nhánh và PR

```bash
git checkout ccr-2f80a8be-hdts76 && git pull
npm ci
git checkout -b vocab-c1-1-4      # đợt đầu và đợt cuối của PR này
```

- **Mỗi PR 4 đợt (400 từ)**: `vocab-c1-1-4`, `vocab-c1-5-8`, `vocab-c1-9-10`. PR chủ đề là `vocab-c1-topics`.
- Mở **Pull Request vào `ccr-2f80a8be-hdts76`**. Không đẩy thẳng lên nhánh đó. Không tự gộp PR khi chưa được duyệt.
- Bắt đầu PR mới từ `ccr-2f80a8be-hdts76` mới nhất, sau khi PR trước đã được gộp.

## 3. Quy trình mỗi đợt 100 từ

1. Lấy đợt tiếp theo:
   ```bash
   npm run vocab:next -- C1 100 > /tmp/batch.json
   ```
   Lệnh in ra:
   - tên file cần tạo (`file`);
   - 100 từ chưa có nghĩa, xếp theo tần suất. Mỗi từ có `id`, `headword`, `pos` (từ loại kèm cấp độ), `ipa`, `forms` (các dạng chia) và `tatoeba` (câu có sẵn, kèm bản dịch máy).

   Khoảng 84 từ C1 (thường là trạng từ, danh từ ít gặp như `sentient`, `settee`, `exuberantly`) chưa có phiên âm: lệnh in `MISSING…`, bạn tự điền `ipa` theo mục 4.

   Trên Windows, chạy trong Git Bash hoặc thay `/tmp/batch.json` bằng `batch.json` (không commit file này).
2. Tạo đúng file được chỉ định theo định dạng ở mục 4, giữ đúng thứ tự từ như lệnh in ra.
3. Đăng ký file trong `src/content/vocab/vi/index.ts`: thêm dòng `import c1Core1 from "./c1-core-1.json";` và thêm `c1Core1` vào cuối mảng `viFiles`.
4. Chạy kiểm tra. **Cả bốn lệnh phải xanh** mới được commit:
   ```bash
   npm test
   npx tsc --noEmit        # máy mới clone thì chạy npx next typegen trước
   npm run lint
   npm run build
   ```
5. Mỗi đợt một commit, message dạng `C1 vocabulary: batch 1 (words 1-100)`.

Đợt sau chạy lại bước 1. Lệnh tự bỏ qua những từ đã có và in ra tên file tiếp theo.

## 4. Định dạng file

```json
{
  "status": "draft",
  "about": "Từ C1, đợt 1: 100 từ. Bản nháp do AI soạn, cần người duyệt.",
  "entries": [
    { "id": "cite", "meanings": [{ "pos": "verb", "vi": "trích dẫn, viện dẫn" }], "note": "cite a source/study = trích dẫn nguồn, nghiên cứu. cite something as a reason = viện lý do. Trang trọng hơn mention. Danh từ: citation.", "examples": [{ "en": "Please cite your sources at the end.", "vi": "Vui lòng ghi nguồn trích dẫn ở cuối bài.", "source": "editor" }, { "en": "She cited high costs as the main reason.", "vi": "Cô ấy viện lý do chính là chi phí cao.", "source": "editor" }] }
  ]
}
```

Mỗi mục trong `entries` viết **trên một dòng** như các file B2.

| Trường | Bắt buộc | Quy tắc |
|---|---|---|
| `id` | có | Đúng `id` lệnh in ra. |
| `meanings` | có | 1–3 nghĩa. `pos` là một trong: `noun`, `verb`, `adjective`, `adverb`, `preposition`, `pronoun`, `determiner`, `conjunction`, `interjection`, `number`, `modal auxiliary`, `be-verb`, `do-verb`, `have-verb`. `vi` tối đa 60 ký tự. |
| `note` | có | 12–220 ký tự, tiếng Việt (mục 5). |
| `examples` | có | Đúng 2 câu (mục 6). |
| `ipa` | chỉ khi lệnh in ra `MISSING…` | Phiên âm Anh-Mỹ cùng kiểu dữ liệu có sẵn (ví dụ `ˈsɝvəs`), không có dấu `/`. Cụm nhiều từ thì nối phiên âm từng từ bằng dấu cách. |
| `forms` | khi cần | Thêm khi dạng chia in ra bị sai, **hoặc khi câu ví dụ dùng một dạng chia chưa có** (`cites`, `cited`…). Test kiểm tra điều này. |

## 5. Nghĩa và ghi chú

**Nghĩa (`meanings`):**
- **Xếp nghĩa theo mức độ hay gặp với người học**, không theo thứ tự từ loại. Nghĩa đầu tiên là nghĩa app dùng trong bài kiểm tra, nên phải là nghĩa thông dụng nhất.
- Chọn nghĩa ở trình độ C1. Từ loại ở cấp khác chỉ thêm khi thật sự hay gặp.
- **Nhãn từ loại của nguồn có thể sai hoặc lệch** (ở B2 có `roam`, `exaggerate` ghi là danh từ). Dạy từ loại thông dụng nhất, ghi vào mô tả PR. Không dạy từ loại hiếm chỉ vì nhãn nguồn ghi vậy (ví dụ không dạy "have a roam").
- **Không thêm nghĩa hiếm, cổ, chuyên ngành hay rất trang trọng** chỉ vì từ điển có.
- **Ưu tiên tiếng Anh-Mỹ.** Nghĩa, chính tả (`-ize`, `-or`, `-er`), collocation và câu ví dụ theo cách người Mỹ dùng. Từ có nghĩa Anh-Anh khác thì nghĩa Mỹ đứng trước, nghĩa Anh chỉ nêu trong `note` (bài học từ `pavement`, `tuition`, `trolley`, `redundant` ở B2). Từ chủ yếu dùng ở Anh thì nêu từ tương ứng của Mỹ.
- Viết như từ điển Anh-Việt tốt: ngắn, tự nhiên. Nghĩa gần nhau ngăn bằng dấu phẩy, nghĩa khác hẳn ngăn bằng dấu chấm phẩy. Không giải thích dài trong phần nghĩa.

**Ghi chú (`note`):** 1–3 câu ngắn, có ích thật cho người Việt. Ưu tiên theo thứ tự:
1. **Cụm từ hay đi kèm (collocation).** Ở C1 đây vẫn là phần quan trọng nhất: `draw a distinction`, `cast doubt on`, `a compelling argument`.
2. **Cấu trúc ngữ pháp:** giới từ đi kèm (`insist on`, `be capable of`), `+ V-ing` / `to V`, đếm được hay không.
3. **Họ từ** khi hữu ích: `allocate → allocation`, `reliable → reliability`.
4. **Sắc thái và văn phong:** ở C1 rất quan trọng. Trang trọng hay thân mật, học thuật hay đời thường, tích cực hay tiêu cực. Nêu **từ thường ngày tương đương** khi từ C1 trang trọng: `commence` ≈ `start`, `endeavor` ≈ `try`.
   - **Phân biệt từ gần nghĩa** người học hay nhầm: `imply/infer`, `continual/continuous`, `discreet/discrete`.
5. **Từ dễ nhầm** với người Việt: `sensible/sensitive`, `economic/economical`, `principal/principle`, `affect/effect`.
6. **Phát âm dễ sai**: âm câm, trọng âm đổi theo từ loại (`record` danh từ khác `record` động từ).

**Không** viết ghi chú sáo rỗng ("Đây là từ phổ biến", "Từ này rất hữu ích"), và không lặp lại nghĩa.

**Lỗi của danh sách gốc** (từ viết sai, từ không có thật): không soạn. Các mục đã biết nằm trong `SKIP` của `tools/vocab/next-batch.mjs` (`chauffer`, `unscathing`); gặp mục mới như vậy thì ghi vào mô tả PR để người duyệt thêm vào danh sách.

**Mục lạ trong danh sách gốc** (từ ghép, trạng từ hiếm như `fiendishly`, từ cổ, từ có thể gây khó chịu): vẫn soạn bình thường như B2 đã làm (`unto`, `cyberpet`, `queer`).
- Chọn nghĩa và ví dụ hữu ích nhất cho người học.
- Từ nhạy cảm hoặc lỗi thời thì ghi chú cách nói phù hợp hơn, dạy nghĩa không xúc phạm trước (như `cripple`, `lame`, `prick` ở B2).
- Ghi tên những mục này trong mô tả PR.

## 6. Câu ví dụ

- Đúng **2 câu**, mỗi câu **4–14 từ**, kết thúc bằng `.`, `?` hoặc `!`.
- Câu phải chứa **đúng từ đang học**: `headword` hoặc một dạng trong `forms`, nguyên từ, không phải từ ghép. Muốn dùng số nhiều mà `forms` không có `plural` thì dùng số ít.
- Hai câu thể hiện **hai cách dùng khác nhau** (hai nghĩa, hai từ loại hoặc hai cụm từ hay đi kèm). Ít nhất một câu dùng cụm từ ghi trong `note`.
- Có nhiều nghĩa thì **ít nhất một câu minh họa nghĩa đầu tiên**.
- Câu gọn, không thừa ý (tránh kiểu "often tends to").
- **Ngữ cảnh:**
  - Ở C1 nên dùng ngữ cảnh học thuật, công việc, báo chí, bàn luận xã hội: báo cáo, cuộc họp, bài luận, nghiên cứu, chính sách… vẫn gần với người Việt khi có thể.
  - Các từ khác trong câu ở mức **A2–B2**, để người học tập trung vào từ đang học.
  - Từ trang trọng thì đặt trong câu trang trọng (đừng đặt `commence` vào chuyện ăn sáng).
- **Không dùng:**
  - tên người nổi tiếng có thật;
  - chính trị gây tranh cãi;
  - bạo lực chi tiết, tình dục, ma túy (trừ khi chính từ đó là chủ đề, và câu trung tính).
- **Bản dịch `vi`:** tiếng Việt tự nhiên như người Việt nói, không dịch máy móc. Xưng hô hợp ngữ cảnh: tôi/bạn, anh/chị/em, mình.

**Nguồn câu (`source`):**
- `"editor"`: câu bạn tự viết. Phần lớn câu là loại này.
- `"tatoeba"`: **chỉ** dùng khi câu tiếng Anh **trùng từng ký tự** với một câu trong mục `tatoeba` lệnh in ra cho đúng từ đó. Test kiểm tra điều này.
  - Viết lại bản dịch máy thì thêm `"edited": true`.
  - Không sửa câu tiếng Anh của Tatoeba. Muốn sửa thì chuyển thành `editor`.
  - Chỉ dùng câu Tatoeba khi câu tự nhiên, ngắn, không lạ.

## 7. Chủ đề (PR riêng, làm khi đủ 913 từ)

Điền `src/content/vocab/topics-c1.json`. Mẫu: `topics-b2.json`.

```json
{ "id": "c1-research", "title": "Nghiên cứu và học thuật", "description": "Trích dẫn, tiêu chí, giả thuyết và cách trình bày kết quả.", "words": ["cite", "criteria", "…"] }
```

- **Khoảng 25–40 chủ đề**, mỗi chủ đề **11–60 từ** (app tự chia thành bộ khoảng 10 từ).
- `id` bắt đầu bằng `c1-`, chỉ gồm chữ thường, số và gạch ngang. Không trùng `id` chủ đề của cấp khác.
- **Mỗi từ C1 nằm trong đúng một chủ đề.** Test sẽ báo nếu thiếu hoặc trùng.
- **Xếp theo nghĩa đã dạy trong file từ** (mở file ra xem), không theo nghĩa bạn đoán. Mỗi từ phải liên quan rõ đến tiêu đề chủ đề.
- **Không nhét từ cho đủ số.** Từ không hợp chủ đề đời sống nào thì đưa vào chủ đề trừu tượng: ý kiến và lập luận, đặc điểm và tính chất, thay đổi và xu hướng, mức độ…
- Trong một chủ đề, các từ liên quan đứng cạnh nhau. Từ chức năng (trạng từ, từ nối, giới từ) gom thành chủ đề riêng.
- Thứ tự: chủ đề đời sống, công việc, xã hội lên trước; chủ đề trừu tượng và ngôn ngữ để sau.
- Tiêu đề và mô tả bằng tiếng Việt, ngắn gọn, viết hoa chữ đầu câu.
- Mô tả PR liệt kê những từ bạn phân vân khi xếp.

## 8. Trước khi mở PR

- [ ] Bốn lệnh ở mục 3 đều xanh.
- [ ] Mỗi đợt là một file `c1-core-N.json` mới, đã đăng ký trong `vi/index.ts`, một commit.
- [ ] Không sửa file nào ngoài danh sách ở mục 1.
- [ ] Tự đọc lại ngẫu nhiên 15 mục mỗi đợt:
  - nghĩa đầu tiên có phải nghĩa thông dụng nhất không;
  - ghi chú có cụm từ hay đi kèm không;
  - hai câu ví dụ có khác cách dùng không;
  - bản dịch có giống văn dịch máy không.

**Mô tả PR gồm:**
- các đợt đã làm và số từ;
- **những từ bạn không chắc** nghĩa hoặc cách dạy, kèm lý do;
- các mục lạ ở mục 5;
- mọi điều bất thường gặp phải.

## 9. Người duyệt kiểm tra gì

- Test tự động.
- Đọc ngẫu nhiên khoảng 15% số mục, cộng **toàn bộ** những từ bạn ghi là không chắc.
- **Những lỗi từng bị trả lại ở B1 và B2**, cần tránh:
  - xếp nghĩa hiếm lên trước;
  - thêm nghĩa ít ai dùng;
  - dịch gây hiểu lầm (ví dụ dịch *chicken wrap* thành "bánh cuốn");
  - câu ví dụ dùng nghĩa kỹ thuật hoặc lạ;
  - từ chỉ dùng ở Anh mà không ghi chú, hoặc câu ví dụ dùng nghĩa Anh-Anh (`pavement`, `private tuition`);
  - dạy từ loại hiếm theo nhãn nguồn (`have a roam`);
  - nghĩa đầu không có câu ví dụ nào minh họa (`acute`);
  - câu ví dụ dùng dạng chia nhưng thiếu `forms`;
  - xếp từ vào chủ đề không hợp nghĩa đã dạy (`heartbreaking` vào chủ đề niềm vui, `cripple` vào bệnh tật).
- Lỗi lặp lại nhiều thì trả lại cả đợt để sửa.
