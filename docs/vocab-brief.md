# Hướng dẫn soạn từ vựng C2

Tài liệu này dành cho AI (Codex, GPT…) soạn từ vựng **C2** cho app **Vở tiếng Anh**. App dạy tiếng Anh cho người Việt trưởng thành, học chủ yếu trên iPhone. Hãy đọc hết tài liệu trước khi bắt đầu, làm đúng quy trình và không tự ý mở rộng phạm vi.

Mỗi PR đều có người duyệt. Bài nộp không qua test hoặc vi phạm quy tắc sẽ bị trả lại.

## 1. Việc cần làm

| | |
|---|---|
| Số từ | **875 từ C2** (các mục có `"level": "C2"` trong `src/content/vocab/words.json`) |
| File từ | `src/content/vocab/vi/c2-core-1.json`, `c2-core-2.json`… mỗi file 100 từ, tổng cộng 9 đợt (đợt 9 có khoảng 75 từ) |
| File chủ đề | `src/content/vocab/topics-c2.json`, làm **sau cùng** (mục 7) |
| Mẫu chuẩn | các file `vi/c1-core-*.json` (C1 đã duyệt xong). Đọc ít nhất 50 mục trước khi viết. |

**Chỉ được sửa:**
- các file `vi/c2-core-*.json` bạn tạo;
- `src/content/vocab/vi/index.ts` (đăng ký file mới);
- `src/content/vocab/topics-c2.json` (chỉ ở PR chủ đề).

**Không được sửa:** `words.json`, file từ và chủ đề của cấp khác, code, test, tài liệu. Nếu bạn nghĩ test sai, ghi vào mô tả PR, không sửa test.

## 2. Nhánh và PR

```bash
git checkout ccr-2f80a8be-hdts76 && git pull
npm ci
git checkout -b vocab-c2-1-4      # đợt đầu và đợt cuối của PR này
```

- **Mỗi PR 4 đợt (400 từ)**: `vocab-c2-1-4`, `vocab-c2-5-8`, `vocab-c2-9-9`. PR chủ đề là `vocab-c2-topics`.
- Mở **Pull Request vào `ccr-2f80a8be-hdts76`**. Không đẩy thẳng lên nhánh đó. Không tự gộp PR khi chưa được duyệt.
- Bắt đầu PR mới từ `ccr-2f80a8be-hdts76` mới nhất, sau khi PR trước đã được gộp.

## 3. Quy trình mỗi đợt 100 từ

1. Lấy đợt tiếp theo:
   ```bash
   npm run vocab:next -- C2 100 > /tmp/batch.json
   ```
   Lệnh in ra:
   - tên file cần tạo (`file`);
   - 100 từ chưa có nghĩa, xếp theo tần suất. Mỗi từ có `id`, `headword`, `pos` (từ loại kèm cấp độ), `ipa`, `forms` (các dạng chia) và `tatoeba` (câu có sẵn, kèm bản dịch máy).

   Khoảng 161 từ C2 (thường là từ học thuật, trạng từ, từ văn chương như `qualm`, `lassitude`, `forlornly`) chưa có phiên âm: lệnh in `MISSING…`, bạn tự điền `ipa` theo mục 4.

   Trên Windows, chạy trong Git Bash hoặc thay `/tmp/batch.json` bằng `batch.json` (không commit file này).
2. Tạo đúng file được chỉ định theo định dạng ở mục 4, giữ đúng thứ tự từ như lệnh in ra.
3. Đăng ký file trong `src/content/vocab/vi/index.ts`: thêm dòng `import c2Core1 from "./c2-core-1.json";` và thêm `c2Core1` vào cuối mảng `viFiles`.
4. Chạy kiểm tra. **Cả bốn lệnh phải xanh** mới được commit:
   ```bash
   npm test
   npx tsc --noEmit        # máy mới clone thì chạy npx next typegen trước
   npm run lint
   npm run build
   ```
5. Mỗi đợt một commit, message dạng `C2 vocabulary: batch 1 (words 1-100)`.

Đợt sau chạy lại bước 1. Lệnh tự bỏ qua những từ đã có và in ra tên file tiếp theo.

## 4. Định dạng file

```json
{
  "status": "draft",
  "about": "Từ C2, đợt 1: 100 từ. Bản nháp do AI soạn, cần người duyệt.",
  "entries": [
    { "id": "diminish", "meanings": [{ "pos": "verb", "vi": "giảm bớt, suy giảm; làm giảm giá trị" }], "note": "diminish the risk/importance of = làm giảm rủi ro, tầm quan trọng của. Trang trọng hơn reduce. diminishing returns = lợi ích giảm dần.", "examples": [{ "en": "The new rules should diminish the risk of fraud.", "vi": "Quy định mới sẽ giảm nguy cơ gian lận.", "source": "editor" }, { "en": "His later failures did not diminish his early work.", "vi": "Những thất bại sau này không làm lu mờ thành tựu ban đầu của ông.", "source": "editor" }], "forms": { "thirdPerson": "diminishes", "past": "diminished", "pastParticiple": "diminished", "ing": "diminishing" } }
  ]
}
```

Mỗi mục trong `entries` viết **trên một dòng** như các file C1.

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
- Chọn nghĩa ở trình độ C2. Từ loại ở cấp khác chỉ thêm khi thật sự hay gặp.
- C2 có nhiều từ **văn chương, học thuật, chuyên ngành** (`lassitude`, `recumbent`, `genomic`). Dạy nghĩa người đọc báo, sách, bài nghiên cứu hay gặp, và nói rõ trong `note` từ thuộc văn phong nào.
- **Nhãn từ loại của nguồn có thể sai hoặc lệch** (ở B2 có `roam`, `exaggerate` ghi là danh từ). Dạy từ loại thông dụng nhất, ghi vào mô tả PR. Không dạy từ loại hiếm chỉ vì nhãn nguồn ghi vậy (ví dụ không dạy "have a roam").
- **Không thêm nghĩa hiếm, cổ, chuyên ngành hay rất trang trọng** chỉ vì từ điển có.
- **Ưu tiên tiếng Anh-Mỹ.** Nghĩa, chính tả (`-ize`, `-or`, `-er`), collocation và câu ví dụ theo cách người Mỹ dùng. Từ có nghĩa Anh-Anh khác thì nghĩa Mỹ đứng trước, nghĩa Anh chỉ nêu trong `note` (bài học từ `pavement`, `tuition`, `trolley`, `redundant` ở B2). Từ chủ yếu dùng ở Anh thì nêu từ tương ứng của Mỹ.
- Viết như từ điển Anh-Việt tốt: ngắn, tự nhiên. Nghĩa gần nhau ngăn bằng dấu phẩy, nghĩa khác hẳn ngăn bằng dấu chấm phẩy. Không giải thích dài trong phần nghĩa.

**Ghi chú (`note`):** 1–3 câu ngắn, có ích thật cho người Việt. Ưu tiên theo thứ tự:
1. **Cụm từ hay đi kèm (collocation).** Ở C2 vẫn quan trọng nhất: `diminishing returns`, `a vested interest`, `hold someone accountable`.
2. **Cấu trúc ngữ pháp:** giới từ đi kèm (`insist on`, `be capable of`), `+ V-ing` / `to V`, đếm được hay không.
3. **Họ từ** khi hữu ích: `allocate → allocation`, `reliable → reliability`.
4. **Sắc thái và văn phong:** ở C2 là phần quan trọng thứ hai. Trang trọng hay thân mật, học thuật hay đời thường, tích cực hay tiêu cực. Nêu **từ thường ngày tương đương** khi từ trang trọng: `commence` ≈ `start`, `endeavor` ≈ `try`.
   - **Phân biệt từ gần nghĩa** người học hay nhầm: `imply/infer`, `continual/continuous`, `discreet/discrete`.
5. **Từ dễ nhầm** với người Việt: `sensible/sensitive`, `economic/economical`, `principal/principle`, `affect/effect`.
6. **Phát âm dễ sai**: âm câm, trọng âm đổi theo từ loại (`record` danh từ khác `record` động từ).

**Không** viết ghi chú sáo rỗng ("Đây là từ phổ biến", "Từ này rất hữu ích"), và không lặp lại nghĩa.

**Lỗi của danh sách gốc** (từ viết sai, từ không có thật): không soạn. Các mục đã biết nằm trong `SKIP` của `tools/vocab/next-batch.mjs` (`chauffer`, `unscathing`); gặp mục mới như vậy thì ghi vào mô tả PR để người duyệt thêm vào danh sách.

**Mục lạ trong danh sách gốc** (từ ghép, trạng từ hiếm, từ văn chương, từ có thể gây khó chịu): vẫn soạn bình thường như B2 và C1 đã làm (`unto`, `fiendishly`, `unenviably`). Từ rất hiếm thì ghi trong `note` cách nói thông dụng hơn.
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
  - Ở C2 dùng ngữ cảnh học thuật, báo chí, văn chương, phê bình, chính sách: bài nghiên cứu, bài báo phân tích, tiểu thuyết, bài phê bình… vẫn gần với người Việt khi có thể.
  - Các từ khác trong câu ở mức **A2–C1**, để người học tập trung vào từ đang học. Câu vẫn rõ nghĩa, không cố ý khó.
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

## 7. Chủ đề (PR riêng, làm khi đủ 875 từ)

Điền `src/content/vocab/topics-c2.json`. Mẫu: `topics-c1.json`.

```json
{ "id": "c2-research", "title": "Nghiên cứu và phương pháp", "description": "Giả thuyết, tương quan, tham số và cách diễn giải kết quả.", "words": ["hypothesis", "correlation", "…"] }
```

- **Khoảng 25–35 chủ đề**, mỗi chủ đề **11–60 từ** (app tự chia thành bộ khoảng 10 từ).
- `id` bắt đầu bằng `c2-`, chỉ gồm chữ thường, số và gạch ngang. Không trùng `id` chủ đề của cấp khác.
- **Mỗi từ C2 nằm trong đúng một chủ đề.** Test sẽ báo nếu thiếu hoặc trùng.
- **Xếp theo nghĩa đã dạy trong file từ** (mở file ra xem), không theo nghĩa bạn đoán. Mỗi từ phải liên quan rõ đến tiêu đề chủ đề.
- **Không nhét từ cho đủ số.** Từ không hợp chủ đề đời sống nào thì đưa vào chủ đề trừu tượng: ý kiến và lập luận, đặc điểm và tính chất, thay đổi và xu hướng, mức độ…
- Trong một chủ đề, các từ liên quan đứng cạnh nhau. Từ chức năng (trạng từ, từ nối, giới từ) gom thành chủ đề riêng.
- Thứ tự: chủ đề đời sống, công việc, xã hội lên trước; chủ đề trừu tượng và ngôn ngữ để sau.
- Tiêu đề và mô tả bằng tiếng Việt, ngắn gọn, viết hoa chữ đầu câu.
- Mô tả PR liệt kê những từ bạn phân vân khi xếp.

## 8. Trước khi mở PR

- [ ] Bốn lệnh ở mục 3 đều xanh.
- [ ] Mỗi đợt là một file `c2-core-N.json` mới, đã đăng ký trong `vi/index.ts`, một commit.
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
- **Những lỗi từng bị trả lại ở B1, B2 và C1**, cần tránh:
  - xếp nghĩa hiếm lên trước;
  - thêm nghĩa ít ai dùng;
  - dịch gây hiểu lầm (ví dụ dịch *chicken wrap* thành "bánh cuốn");
  - câu ví dụ dùng nghĩa kỹ thuật hoặc lạ;
  - từ chỉ dùng ở Anh mà không ghi chú, hoặc câu ví dụ dùng nghĩa Anh-Anh (`pavement`, `private tuition`);
  - dạy từ loại hiếm theo nhãn nguồn (`have a roam`);
  - nghĩa đầu không có câu ví dụ nào minh họa (`acute`);
  - nghĩa đầu không phải nghĩa thông dụng nhất ở Mỹ (`wrench`: cờ lê trước, giật mạnh sau);
  - câu ví dụ lủng củng về chủ ngữ (`The will shared the money among her offspring`);
  - soạn cho từ viết sai hoặc không có thật trong nguồn (`chauffer`, `unscathing`): không soạn, ghi vào mô tả PR;
  - câu ví dụ dùng dạng chia nhưng thiếu `forms`;
  - xếp từ vào chủ đề không hợp nghĩa đã dạy (`heartbreaking` vào chủ đề niềm vui, `cripple` vào bệnh tật).
- Lỗi lặp lại nhiều thì trả lại cả đợt để sửa.
