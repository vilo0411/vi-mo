import type { Series } from "@/lib/data";

export const PRACTICE_GAMES = {
  "doan-chieu": {
    title: "Đoán chiều chỉ số",
    description: "Đọc bối cảnh và đoán GDP, lạm phát hay tỷ giá thay đổi thế nào so với năm trước.",
    rules: "Mỗi câu đúng được 1 điểm. Chọn Gần như đi ngang nếu mức thay đổi nhỏ hơn 0,1 điểm phần trăm đối với GDP và CPI, hoặc nhỏ hơn 0,1% đối với tỷ giá, theo trị tuyệt đối.",
    maxPoints: 6,
    version: 1,
  },
  "uoc-luong": {
    title: "Ước lượng quy mô",
    description: "Dựa vào dữ kiện để đặt khoảng ước lượng cho GDP, xuất khẩu và nhập khẩu của Việt Nam.",
    rules: "Mỗi câu có tối đa 100 điểm. Khoảng chứa đáp án được tính điểm, kể cả khi đáp án trùng một đầu mút. Khoảng trúng càng hẹp thì điểm càng cao. Khoảng trượt được 0 điểm.",
    maxPoints: 600,
    version: 1,
  },
} as const;

export type PracticeGameId = keyof typeof PRACTICE_GAMES;

type QuestionSpec = {
  seriesId: string;
  label: string;
  year: number;
  context: string;
  explanation: string;
};

export type PracticeQuestion = Omit<QuestionSpec, "seriesId"> & {
  previous: number;
  answer: number;
  unit: "%" | "VND/USD" | "tỷ USD";
  source: Pick<Series, "url" | "source" | "code" | "updatedAt">;
};

// Tăng version khi bộ câu hỏi, đáp án dùng để chấm hoặc luật tính điểm thay đổi.
export const PRACTICE_QUESTIONS: Record<PracticeGameId, QuestionSpec[]> = {
  "doan-chieu": [
    {
      seriesId: "gdp_growth", label: "Tăng trưởng GDP thực", year: 2020,
      context: "COVID-19 làm gián đoạn sản xuất, đi lại và chi tiêu trong năm 2020.",
      explanation: "Tốc độ tăng trưởng chậm lại trong năm đầu đại dịch. GDP thực vẫn tăng vì tốc độ tăng trưởng còn dương.",
    },
    {
      seriesId: "cpi", label: "Lạm phát CPI", year: 2018,
      context: "Tăng trưởng kinh tế năm 2018 tiếp tục ở mức cao. Hãy so tốc độ tăng giá tiêu dùng với năm trước.",
      explanation: "Tốc độ tăng giá gần như giữ nguyên theo ngưỡng của trò chơi. Mức giá tiêu dùng vẫn tăng vì CPI tăng hơn 3% trong năm.",
    },
    {
      seriesId: "fx_rate", label: "Tỷ giá bình quân năm", year: 2021,
      context: "Trong năm 2021, Việt Nam vẫn xuất siêu hàng hóa và dự trữ ngoại hối tăng. Tỷ giá được yết theo số đồng Việt Nam đổi một USD.",
      explanation: "Bình quân năm cần ít đồng Việt Nam hơn để đổi một USD. Theo cách yết giá này, VND lên giá nhẹ so với USD.",
    },
    {
      seriesId: "gdp_growth", label: "Tăng trưởng GDP thực", year: 2022,
      context: "Nền kinh tế mở cửa trở lại sau giai đoạn giãn cách, từ mức tăng trưởng thấp của năm 2021.",
      explanation: "Tăng trưởng bật lên khi hoạt động kinh tế phục hồi. Mức so sánh thấp của năm 2021 cũng giúp giải thích tốc độ tăng cao.",
    },
    {
      seriesId: "cpi", label: "Lạm phát CPI", year: 2019,
      context: "Năm 2019, Việt Nam tiếp tục tăng trưởng. Hãy xét riêng tốc độ tăng giá tiêu dùng so với năm 2018.",
      explanation: "Lạm phát giảm nhưng vẫn dương. Giá tiêu dùng tiếp tục tăng, với tốc độ chậm hơn năm trước.",
    },
    {
      seriesId: "fx_rate", label: "Tỷ giá bình quân năm", year: 2023,
      context: "Lãi suất Mỹ duy trì ở mức cao trong năm 2023. Việt Nam hạ lãi suất điều hành trong năm để hỗ trợ tăng trưởng.",
      explanation: "Tỷ giá bình quân năm tăng, tức cần nhiều VND hơn để đổi một USD. Tỷ giá bình quân và tỷ giá cuối năm đo hai mốc khác nhau.",
    },
  ],
  "uoc-luong": [
    {
      seriesId: "gdp_usd", label: "GDP danh nghĩa", year: 2019,
      context: "Năm 2019, tăng trưởng thực tiếp tục ở mức cao và giá cả tăng. Dùng GDP danh nghĩa năm trước để chọn quy mô hợp lý.",
      explanation: "Lấy GDP danh nghĩa năm trước làm mốc rồi chừa biên cho tăng trưởng thực, giá trong nước và tỷ giá quy đổi sang USD.",
    },
    {
      seriesId: "exports_usd", label: "Xuất khẩu hàng hóa và dịch vụ", year: 2020,
      context: "COVID-19 làm gián đoạn du lịch quốc tế, trong khi nhu cầu hàng hóa như máy tính và đồ gia dụng vẫn hỗ trợ xuất khẩu.",
      explanation: "Bắt đầu từ kim ngạch năm trước. Du lịch yếu và nhu cầu hàng hóa tác động theo hai chiều, nên chừa khoảng quanh mốc cũ.",
    },
    {
      seriesId: "imports_usd", label: "Nhập khẩu hàng hóa và dịch vụ", year: 2021,
      context: "Năm 2021, xuất khẩu tăng và nhiều ngành sản xuất xuất khẩu dùng linh kiện, nguyên liệu nhập khẩu.",
      explanation: "Có thể dịch khoảng ước lượng lên từ mốc năm trước để phản ánh nhu cầu đầu vào nhập khẩu cho sản xuất.",
    },
    {
      seriesId: "gdp_usd", label: "GDP danh nghĩa", year: 2023,
      context: "Tăng trưởng thực năm 2023 chậm hơn đợt phục hồi năm 2022. GDP danh nghĩa ở đây được tính theo USD hiện hành.",
      explanation: "Dùng GDP năm 2022 làm mốc. Mức tăng GDP tính bằng USD còn phụ thuộc vào biến động giá và tỷ giá trong năm.",
    },
    {
      seriesId: "exports_usd", label: "Xuất khẩu hàng hóa và dịch vụ", year: 2023,
      context: "Trong năm 2023, nhu cầu mua hàng từ các thị trường lớn suy yếu. So khoảng bạn chọn với mốc năm 2022.",
      explanation: "Nhu cầu bên ngoài yếu là lý do để cân nhắc một khoảng nghiêng về phía dưới giá trị năm trước.",
    },
    {
      seriesId: "imports_usd", label: "Nhập khẩu hàng hóa và dịch vụ", year: 2024,
      context: "Sản xuất và tăng trưởng phục hồi trong năm 2024. Doanh nghiệp có thể cần thêm đầu vào nhập khẩu.",
      explanation: "Có thể bắt đầu với quy mô năm 2023 rồi đặt khoảng cao hơn để phản ánh nhu cầu nhập khẩu khi sản xuất phục hồi.",
    },
  ],
};
