# Quy định sử dụng AI

Tài liệu này là khung quy định chung về việc dùng AI trong app **Vở tiếng Anh**. Người soạn nội dung, người viết code và AI hỗ trợ (GPT, Claude…) đều phải theo.

Cấu hình trong code nằm ở `src/lib/ai/policy.ts`: model, giới hạn token, hạn mức mỗi ngày. Muốn đổi quy định thì sửa file đó và tài liệu này cùng lúc. Không viết cứng tên model hay giới hạn vào từng API.

## 1. Nguyên tắc

1. **Máy chấm được thì không dùng AI.** Mọi câu hỏi có đáp án xác định (trắc nghiệm, điền từ, sắp xếp, sửa câu, dịch có đáp án mẫu, đọc to) đều chấm bằng đáp án và quy tắc. Giải thích phải viết sẵn, viết thật kỹ.
2. **A1–A2 gần như không dùng AI.** Ở trình độ này câu trả lời đoán trước được, nên chấm bằng **khung chấm** (mục 4) và **bài mẫu**. AI chỉ là phần thêm, có hạn mức.
3. **B1–B2 dùng AI theo khung chấm.** AI không tự nghĩ tiêu chí. AI chấm theo tiêu chí, bài mẫu và danh sách mã lỗi app đưa vào, và chỉ trả về những gì cần thiết.
4. **AI viết ít, app hiển thị nhiều.** AI trả về **mã lỗi** và đoạn sửa. Lời giải thích tiếng Việt do app lấy từ thư viện giải thích viết sẵn và dẫn về đúng bài học.
5. **Có hạn mức cho mọi lần gọi AI.** Mỗi tính năng có số lượt mỗi ngày theo cấp độ, xem thêm lượt bằng quảng cáo có giới hạn.
6. **Chọn model rẻ nhất đủ tốt cho việc.** Không dùng model đắt nhất mặc định. Đổi model bằng biến môi trường, không sửa code.

## 2. Danh sách nơi dùng AI

| Tính năng (mã trong code) | Màn hình | Gọi AI khi nào |
|---|---|---|
| `speak-chat` | Luyện nói với AI, trò chuyện tự do | Mỗi lượt AI trả lời |
| `speak-feedback` | Nhận xét sau buổi nói | Một lần cuối buổi |
| `write-check` | Viết tự do trong bài kiểm tra | Khi bấm "Nộp bài" |
| `talk-check` | Nói tự do trong bài kiểm tra | Khi bấm "Nộp bài" (sau khi nhận giọng nói) |

**Không phải AI tạo nội dung, nhưng vẫn tính phí** (Cloudflare Workers AI):

| Dịch vụ | Dùng cho | Cách tiết kiệm |
|---|---|---|
| Whisper (nhận giọng nói) | Đọc to, nói tự do, luyện nói | Chỉ gửi khi có tiếng nói; tự dừng khi im lặng |
| Deepgram Aura (giọng đọc) | Nút nghe ở mọi nơi | Câu nào đọc rồi được lưu lại; lỗi 2 lần thì dùng giọng của máy |

**Không dùng AI:** từ vựng, ngữ pháp, thẻ ghi nhớ, bài tập, trắc nghiệm, điền từ, sắp xếp, sửa câu, dịch có đáp án, đọc to, luyện nói theo kịch bản viết sẵn.

## 3. Model và giới hạn theo cấp độ

Có hai mức model. Đổi model của từng mức bằng biến môi trường trên Cloudflare.

| Mức | Model mặc định | Biến môi trường | Dùng cho |
|---|---|---|---|
| `light` | Claude Haiku 5.5 | `AI_LIGHT_MODEL` | Việc ngắn, có khung: trò chuyện, nhận xét A1–A2, chấm tạm A1–A2 |
| `standard` | Claude Sonnet 5.5 | `AI_STANDARD_MODEL` | Việc cần đánh giá và giải thích: chấm bài B1–B2, nhận xét B1–B2 |

Không dùng Opus, Fable hay model đắt hơn làm mặc định. Bảng dưới đây ghi mức model và số lượt mỗi ngày cho từng tính năng, theo cấp độ:

| Tính năng | A1 | A2 | B1 | B2 |
|---|---|---|---|---|
| Chấm bài viết `write-check` | đáp án mẫu (tạm thời: `light`), 3/ngày | đáp án mẫu (tạm thời: `light`), 3/ngày | `standard`, **5/ngày** | `standard`, **2/ngày** |
| Chấm bài nói `talk-check` | đáp án mẫu (tạm thời: `light`), 3/ngày | như A1 | `standard`, 5/ngày | `standard`, 2/ngày |
| Trò chuyện `speak-chat` | `light`, 3 buổi | `light`, 3 buổi | `light`, 3 buổi | `standard`, 2 buổi |
| Nhận xét `speak-feedback` | `light`, 3 | `light`, 3 | `standard`, 3 | `standard`, 2 |

- **Xem quảng cáo:** mỗi lần xem được thêm **1 lượt**, tối đa **3 lần** mỗi tính năng mỗi ngày (`AD_BONUS`, `AD_MAX_BONUS`).
- **Độ dài bài tối đa** (từ chối trước khi gọi AI): A1 400, A2 600, B1 1.200, B2 1.800 ký tự.
- **Mức suy luận (effort):** `low` cho mọi việc, riêng chấm bài và nhận xét B2 dùng `medium`.
- **Giới hạn token** (gồm cả phần suy luận) đặt trong `AI_RULES`. Đây là trần an toàn, không phải mục tiêu: bài chấm tốt thường ngắn hơn nhiều.
- C1, C2 dùng quy định của B2 cho tới khi có quy định riêng.

**Tạm thời:** khung chấm A1–A2 chưa soạn xong, nên bài viết và bài nói A1–A2 vẫn gửi cho model `light` (`INTERIM_AI` trong code). Khi khung chấm xong thì xóa `INTERIM_AI`.

## 4. Khung chấm A1–A2 (không dùng AI)

Mỗi đề viết hoặc nói tự do ở A1–A2 phải có:

1. **Ý bắt buộc:** 3–4 ý, mỗi ý có các mẫu câu được chấp nhận. Ví dụ đề "Giới thiệu bản thân":
   - tên: `My name is ___` / `I'm ___`
   - tuổi: `I'm ___ years old`
   - quê: `I'm from ___` / `I live in ___`
   - nghề: `I'm a/an ___` / `I work as ___` / `I work in ___`
2. **Lỗi hay gặp:** mẫu nhận diện kèm giải thích viết sẵn và đường dẫn tới bài học, ví dụ:
   - thiếu *am/is/are* (*I 30 years old*);
   - thiếu *a/an* trước nghề (*I'm teacher*);
   - thiếu *-s* sau he/she (*She work*).
3. **Bài mẫu:** 1–2 bài hoàn chỉnh, đúng độ dài yêu cầu.
4. **Danh sách tự kiểm tra:** 3–4 câu hỏi học viên tự soát (*Mình đã viết đủ 4 ý chưa? Có câu nào thiếu "am/is/are" không?*).

**Chấm:** mỗi ý có đúng mẫu được 1 điểm; trừ điểm theo lỗi hay gặp; đạt khi đủ 75% số ý và không quá 2 lỗi nặng. Mẫu nên viết rộng, chấp nhận nhiều cách nói. Câu đúng mà khác mẫu thì không bị trừ, chỉ không được tính ý. Kết quả luôn kèm bài mẫu để học viên tự so.

Bài nói A1–A2 chấm giống bài viết, trên văn bản do Whisper nhận được, bỏ qua dấu câu và chữ hoa.

## 5. Khung chấm B1–B2 (AI chấm theo khung)

Mỗi đề B1–B2 phải có:

- **Tiêu chí**, mỗi tiêu chí 0–2 điểm: làm đúng đề; ngữ pháp trọng tâm của bài; từ vựng đúng cấp; mạch lạc (từ nối, thứ tự ý).
- **Bài mẫu** và **độ dài** yêu cầu.
- **Mã lỗi được phép dùng**, lấy từ thư viện mã lỗi chung, ví dụ `TENSE`, `ARTICLE`, `S_V_AGREEMENT`, `PREPOSITION`, `WORD_CHOICE`, `WORD_ORDER`, `SPELLING`, `MISSING_WORD`. Mỗi mã có sẵn lời giải thích tiếng Việt và bài học liên quan.

**AI chỉ trả về:**
- điểm từng tiêu chí;
- tối đa 5 lỗi, mỗi lỗi gồm mã, đoạn sai và đoạn đúng;
- bài đã sửa, sửa ít nhất có thể;
- một câu nhận xét tiếng Việt.

AI không viết lời giải thích dài. App ghép giải thích theo mã lỗi.

**Lời dặn cố định** (vai trò, tiêu chí, danh sách mã lỗi) đặt ở đầu và không đổi giữa các lần gọi, để được lưu sẵn (prompt caching). Phần thay đổi (đề, bài của học viên) đặt sau cùng.

## 6. Hạn mức và quảng cáo

- **Hạn mức tính trên máy chủ.** Không lưu số lượt trong trình duyệt, vì xóa dữ liệu là có lượt mới. Việc này cần **tài khoản thành viên**, sẽ làm cùng phần backend.
- **Đơn vị tính:** mỗi lần "Nộp bài" là 1 lượt; mỗi buổi trò chuyện (từ lúc bắt đầu tới lúc nhận xét) là 1 buổi.
- **Hết lượt:**
  - hiện số lượt còn lại và giờ đặt lại (0 giờ, giờ Việt Nam);
  - đưa nút **"Xem quảng cáo để thêm 1 lượt"**, nếu chưa vượt `AD_MAX_BONUS`;
  - bài A1–A2 vẫn chấm được bằng đáp án mẫu, không bị chặn.
- **Chống lạm dụng:**
  - chỉ nhận yêu cầu từ trang của app (đã có);
  - thêm Cloudflare Turnstile và giới hạn theo thành viên khi có backend;
  - đặt mức chi tối đa trên Anthropic Console.
- **Quảng cáo nhận thưởng trên web** cần Google Ad Manager (rewarded ads), phải được duyệt. Khi chưa có thì chỉ áp dụng hạn mức.

## 7. Dữ liệu và quyền riêng tư

- Gửi cho AI **chỉ bài làm và đề**, không gửi tên, email hay thông tin cá nhân khác.
- Đoạn ghi âm được Whisper chuyển thành chữ rồi bỏ đi, không lưu. Văn bản bài làm không lưu trên máy chủ (cho tới khi có trang thành viên và học viên đồng ý).
- Đổi sang nhà cung cấp AI khác (ví dụ DeepSeek) phải ghi rõ trong chính sách quyền riêng tư, vì bài làm sẽ gửi tới máy chủ của họ.
- Đề và lời dặn AI nằm trên máy chủ. Trình duyệt chỉ gửi mã đề và bài làm, không gửi nội dung đề.

## 8. Kiểm soát chi phí

- Trước khi đổi model hoặc lời dặn, thử ít nhất 20 bài mẫu (đúng, sai nhẹ, sai nặng, lạc đề) và so kết quả.
- Mỗi tháng xem chi phí trên Anthropic Console và Cloudflare. Nếu một tính năng vượt dự kiến thì giảm hạn mức hoặc chuyển xuống mức model thấp hơn trước, rồi mới tính đến chuyện tắt tính năng.
- Ước tính hiện tại (giá tháng 11/2026):

  | Việc | Chi phí ước tính |
  |---|---|
  | Một lần chấm A1–A2 bằng `light` | khoảng 0,0003 USD |
  | Một bài B1–B2 bằng `standard` | khoảng 0,005–0,01 USD |
  | Một buổi trò chuyện 10 lượt bằng `light` | dưới 0,005 USD |

## 9. Lộ trình

1. Soạn khung chấm A1–A2 cho 48 đề hiện có, làm phần chấm bằng máy, rồi xóa `INTERIM_AI`.
2. Thư viện mã lỗi chung kèm giải thích tiếng Việt, liên kết với bài ngữ pháp.
3. Khung chấm B1–B2 theo mục 5, khi có ngữ pháp B1.
4. Backend: thành viên, hạn mức trên máy chủ, Turnstile, quảng cáo nhận thưởng.

## Who may use AI

Guests cannot use AI, members get the daily limits above, administrators have no limit. Every AI route must call `aiGate()` from `src/lib/server/quota.ts` first. See `docs/accounts.md`.
