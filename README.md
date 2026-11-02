# Bản đồ vĩ mô Việt Nam

Web app học kinh tế vĩ mô qua các chỉ số liên kết với nhau, dùng dữ liệu thật của Việt Nam.

- **Bắt đầu học** (`/lo-trinh`): lộ trình 6 bài cho người mới, mỗi bài có câu hỏi nhanh. Tiến độ lưu trong trình duyệt.
- **Bản đồ** (`/`): 19 chỉ số và 30 quan hệ nhân quả, tự xếp bằng ELK để thẻ và mũi tên không đè nhau. Kéo thả thẻ để sắp xếp, rê chuột để xem định nghĩa. Chế độ "Khám phá từng nhánh" bắt đầu từ GDP và mở dần từng nhánh.
- **Thử thách** (`/thu-thach`): 6 kịch bản thật (2007–2008, 2009–2011, COVID, Fed 2022, giá dầu, thuế quan Mỹ 2025), mỗi kịch bản 2–3 năm, có số liệu cụ thể và mục tiêu bằng số. Kèm 12 bài tính toán dùng dữ liệu thật.
- **Thuật ngữ** (`/thuat-ngu`): hơn 60 khái niệm (PMI, IIP, lạm phát cơ bản, OMO, bộ ba bất khả thi…), tìm được không cần gõ dấu.
- **Mô phỏng** (`/mo-phong`): chọn một cú sốc (NHNN tăng lãi suất, Fed tăng lãi suất, giá dầu tăng…) và xem tác động lan ra theo thời gian.
- **So sánh** (`/so-sanh`): vẽ chồng hai chỉ số, kéo độ trễ, xem hệ số tương quan.
- **Case study** (`/case-study`): 6 giai đoạn của kinh tế Việt Nam từ 2007 đến 2023, kể theo từng bước.
- **Từ điển** (`/tu-dien`): định nghĩa, cách tính, ai công bố và cách đọc từng chỉ số.

## Chạy

```bash
npm install
npm run dev
```

## Cập nhật dữ liệu

```bash
npm run fetch-data
```

Script tải dữ liệu từ World Bank, IMF và FRED về `data/series/`, rồi in ra năm đầu, năm cuối và số năm thiếu của từng chuỗi. Lãi suất tái cấp vốn của NHNN được nhập tay trong `data/manual/sbv-refinancing-rate.json`, mỗi mốc có link nguồn.

## Sửa nội dung

- `content/indicators.ts`: các chỉ số (định nghĩa, cách đọc, vị trí trên bản đồ)
- `content/links.ts`: các quan hệ nhân quả (dấu, độ trễ, độ mạnh, cơ chế)
- `content/cases.ts`: case study
- `content/lessons.ts`: các bài trong lộ trình và câu hỏi nhanh
- `content/scenarios.ts`: các thử thách, mỗi lựa chọn là một hoặc vài cú sốc đưa vào mô hình
- `content/glossary.ts`: thuật ngữ
- `content/problems.ts`: bài tính toán (đề và đáp án tính từ dữ liệu thật)

Bản đồ, mô phỏng, so sánh và từ điển đều đọc từ ba file này. Độ mạnh và độ trễ trong `links.ts` là giả định để học, không phải hệ số ước lượng từ dữ liệu.

## Kiểm thử

```bash
npm test
```
