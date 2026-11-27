# Nguồn dữ liệu từ vựng

`words.json` được tạo bằng `npm run vocab:fetch && npm run vocab:build` (cần Python 3 và `pip install pyarrow`). Không sửa tay file này; sửa script hoặc file trong `vi/`.

| Nguồn | Dùng cho | Giấy phép |
|---|---|---|
| CEFR-J Wordlist 1.5, Tono Laboratory, Tokyo University of Foreign Studies (qua github.com/openlanguageprofiles/olp-en-cefrj) | Từ, từ loại, cấp độ A1–B2 | Dùng miễn phí cho nghiên cứu và thương mại, có trích dẫn |
| Octanove Vocabulary Profile C1/C2 1.0, Octanove Labs | Cấp độ C1–C2 | CC BY-SA 4.0 |
| ECDICT, skywind3000 | Thứ hạng tần suất, cờ Oxford 3000, các dạng của từ | MIT |
| CMUdict, Carnegie Mellon University | Phát âm Anh–Mỹ, chuyển sang IPA | BSD 2-Clause |
| Tatoeba (tatoeba.org), qua OPUS Tatoeba và MTEB trên Hugging Face | Câu ví dụ Anh–Việt | CC BY 2.0 FR |

Trích dẫn CEFR-J: The CEFR-J Wordlist Version 1.5. Compiled by Yukio Tono, Tokyo University of Foreign Studies.

## Nghĩa tiếng Việt (`vi/`)

`vi/a1-core*.json`: 800 từ A1 thông dụng nhất, gồm nghĩa, ghi chú cho người Việt và câu ví dụ đã chọn. Trạng thái `draft`: AI soạn, chưa có người duyệt. Câu Tatoeba có `edited: true` là câu đã sửa bản dịch tiếng Việt (CC BY cho phép chỉnh sửa, giữ ghi nguồn). Câu `source: "editor"` do người soạn viết.

Thêm từ: tạo file mới trong `vi/`, thêm vào danh sách file trong `src/lib/vocab/data.ts`, rồi chạy `npm test`.
