import type { Indicator } from "./indicators";

/**
 * Hồ sơ sâu của một chỉ số, hiện ở các tab Cách tính, Vì sao, Phân tích.
 * Văn bản có thể chứa **đậm** và [[id|nhãn]], với id là chỉ số hoặc thuật ngữ.
 * Số liệu thực tế phải lấy từ data/series hoặc data/manual; ví dụ không có số thật phải ghi rõ là giả định.
 */
export type IndicatorProfile = {
  alsoCalled?: string[];
  /** Những điểm dễ hiểu sai khi đo hoặc khi đọc */
  nuances: string[];
  /** Ví dụ tính từng dòng */
  worked: { title: string; rows: { label: string; value: string }[]; note: string };
  whyMatters: string;
  whenMisleading: string;
  /** 4–6 chiều: chia nhỏ con số theo chiều nào thì thấy gì */
  breakdowns: { by: string; reveals: string }[];
  /** Câu hỏi riêng của chỉ số; câu hỏi cơ bản dùng chung nằm trong BASIC_QUESTIONS */
  questions: { explore: string[]; decide: string[] };
};

/** Sáu câu nên hỏi trước với bất kỳ con số vĩ mô nào. */
export const BASIC_QUESTIONS = [
  "So với kỳ trước và cùng kỳ năm trước, con số đổi bao nhiêu?",
  "Mức này cao hay thấp so với những năm trước?",
  "So với mục tiêu hoặc kế hoạch Nhà nước đặt ra thì cao hay thấp?",
  "Thay đổi bắt đầu từ khi nào, đột ngột hay từ từ?",
  "Đây là số mới ước tính hay số đã chốt?",
  "Nguyên nhân chính đến từ trong nước hay từ bên ngoài?",
];

export const INDICATOR_PROFILES: Record<string, IndicatorProfile> = {
  cpi: {
    alsoCalled: ["Lạm phát tổng thể", "Tốc độ tăng chỉ số giá tiêu dùng"],
    nuances: [
      "**Có nhiều cách so sánh.** Con số ở đây là CPI bình quân cả năm so với bình quân năm trước. Báo chí còn hay đưa CPI tháng này so với cùng tháng năm trước, hoặc tháng 12 so với tháng 12. Ba con số có thể khác nhau, nên trước khi so phải xem đang so với gì.",
      "**Lạm phát giảm không có nghĩa là giá giảm.** Từ 3,62% năm 2024 xuống 3,31% năm 2025, giá vẫn tăng, chỉ là tăng chậm hơn. Giá chỉ giảm khi lạm phát xuống dưới 0.",
      "**CPI đo một rổ hàng trung bình, không đo rổ hàng của riêng bạn.** Món nào gia đình trung bình chi nhiều thì được tính nặng hơn. Gia đình có con đi học hay có người nằm viện có thể cảm thấy giá tăng nhanh hơn nhiều so với con số công bố.",
      "**Giá do Nhà nước điều chỉnh cũng nằm trong rổ.** Điện, y tế, học phí có thể đẩy CPI lên trong một tháng dù nhu cầu không nóng. Vì vậy cần xem thêm [[lam-phat-co-ban|lạm phát cơ bản]].",
    ],
    worked: {
      title: "Một giỏ hàng đi qua hai năm lạm phát cao",
      rows: [
        { label: "Giỏ hàng năm 2010", value: "100.000 đồng" },
        { label: "Năm 2011, lạm phát 18,68%", value: "118.680 đồng" },
        { label: "Năm 2012, lạm phát 9,09%", value: "khoảng 129.470 đồng" },
      ],
      note: "Lạm phát năm 2012 chỉ bằng khoảng một nửa năm 2011, nhưng giá không quay về. Mặt bằng giá cao hơn ở lại, và lương phải đuổi theo nó.",
    },
    whyMatters:
      "**Đây là con số quyết định sức mua của đồng lương.** Lương tăng 7% mà lạm phát 8% thì thực ra bạn nghèo đi. Nó cũng là con số [[policy_rate|Ngân hàng Nhà nước]] nhìn vào khi quyết định lãi suất: năm 2008 lạm phát lên 23,12%, năm 2011 lên 18,68%, và cả hai lần lãi suất đều phải tăng mạnh để hãm lại, kéo theo doanh nghiệp vay vốn khó khăn.",
    whenMisleading:
      "**Một tháng tăng vọt chưa chắc là xu hướng.** Giá lợn, giá xăng hay một đợt tăng học phí có thể làm CPI nhảy lên rồi tự lắng xuống. Ngược lại, năm 2015 lạm phát chỉ 0,63% không hẳn vì kinh tế yếu, mà có phần vì giá dầu thế giới giảm mạnh. Luôn hỏi: giá tăng do người dân mua nhiều hơn, hay do chi phí đầu vào đắt lên?",
    breakdowns: [
      { by: "Nhóm hàng", reveals: "thấy nhóm nào đang kéo CPI: ăn uống, nhà ở và điện nước, giao thông, giáo dục hay y tế" },
      { by: "Giá do Nhà nước quản lý", reveals: "tách phần tăng do điều chỉnh giá dịch vụ công khỏi phần tăng do thị trường" },
      { by: "Lạm phát cơ bản", reveals: "bỏ lương thực, năng lượng và giá quản lý để thấy xu hướng nền" },
      { by: "Khu vực và tỉnh thành", reveals: "thấy giá ở đâu tăng nhanh hơn, ví dụ khác biệt giữa thành thị và nông thôn" },
      { by: "Tháng trong năm", reveals: "tách phần tăng theo mùa, như dịp Tết, khỏi xu hướng thật" },
      { by: "Hàng nhập khẩu và hàng trong nước", reveals: "ước lượng phần giá do [[fx_rate|tỷ giá]] và [[oil_price|giá thế giới]] mang vào" },
    ],
    questions: {
      explore: ["Nhóm hàng nào đóng góp nhiều nhất vào đợt tăng này?", "Lạm phát cơ bản đi cùng hướng hay ngược hướng với CPI?", "Tỷ giá và giá dầu có giải thích được phần lớn đợt tăng không?"],
      decide: ["Với mức lạm phát này, tiền lương và tiền tiết kiệm của mình có giữ được sức mua không?"],
    },
  },

  policy_rate: {
    alsoCalled: ["Lãi suất tái cấp vốn", "Refinancing rate"],
    nuances: [
      "**Đây là giá ngân hàng trả cho Ngân hàng Nhà nước, không phải lãi bạn trả khi vay.** [[lending_rate|Lãi suất cho vay]] còn cộng thêm chi phí huy động, rủi ro và lợi nhuận của ngân hàng.",
      "**Con số ở đây là một trong vài mức lãi của Ngân hàng Nhà nước.** Tên đầy đủ của nó là lãi suất tái cấp vốn, tức mức lãi khi cho ngân hàng vay. Trang này lấy giá trị cuối mỗi năm.",
      "**Không có lịch họp cố định.** Ngân hàng Nhà nước ra quyết định khi cần, nên con số đứng yên nhiều năm rồi đổi đột ngột.",
      "**Dữ liệu trong app còn thiếu 2012–2016** vì chưa đối chiếu đủ các lần điều chỉnh, nên đừng đọc đoạn đó trên biểu đồ như thể lãi suất không đổi.",
    ],
    worked: {
      title: "Ba năm liên tiếp của lãi suất tái cấp vốn",
      rows: [
        { label: "Cuối năm 2021", value: "4%" },
        { label: "Cuối năm 2022", value: "6%, tăng 2 điểm phần trăm" },
        { label: "Cuối năm 2023", value: "4,5%, giảm 1,5 điểm phần trăm" },
      ],
      note: "Chú ý đơn vị: từ 4% lên 6% là tăng 2 điểm phần trăm, không phải tăng 2%. Tính theo tỷ lệ thì mức lãi đã cao hơn 50%.",
    },
    whyMatters:
      "**Đây là cần gạt rõ nhất mà người học có thể quan sát.** Khi nó đổi, thị trường hiểu Ngân hàng Nhà nước đang muốn hãm lại hay đẩy lên. Năm 2011, với [[cpi|lạm phát]] 18,68%, lãi suất này lên tới 15%. Năm 2020 nó xuống 4% để đỡ nền kinh tế trong dịch.",
    whenMisleading:
      "**Con số đứng yên không có nghĩa chính sách đứng yên.** Ngân hàng Nhà nước còn có [[omo|hút tiền qua thị trường mở]] và [[credit_quota|room tín dụng]], nên điều kiện vay có thể thắt lại mà lãi suất điều hành không đổi. Ngoài ra, cùng một mức 6% sẽ chặt khi lạm phát thấp và lỏng khi lạm phát cao, nên phải xem cùng [[real_rate|lãi suất thực]].",
    breakdowns: [
      { by: "So với lạm phát", reveals: "lãi suất điều hành trừ lạm phát cho biết chính sách đang chặt hay lỏng" },
      { by: "So với lãi suất Fed", reveals: "khoảng cách với [[fed_rate|Fed]] càng hẹp thì sức ép lên tỷ giá càng lớn" },
      { by: "So với lãi suất cho vay", reveals: "xem quyết định có truyền tới doanh nghiệp không, và trễ bao lâu" },
      { by: "Theo công cụ", reveals: "so tái cấp vốn với lãi suất thị trường mở để biết công cụ nào đang thực sự có tác dụng" },
      { by: "Theo từng lần điều chỉnh", reveals: "xem mỗi lần đổi đi kèm sự kiện gì: lạm phát tăng, tỷ giá căng hay kinh tế suy yếu" },
    ],
    questions: {
      explore: ["Lãi suất cho vay đã phản ứng chưa, sau bao lâu?", "Khoảng cách với lãi suất Fed đang tạo sức ép lên tỷ giá không?", "Room tín dụng và thị trường mở đang đi cùng hướng hay ngược hướng với lãi suất?"],
      decide: ["Nếu lãi suất đang đổi hướng, khoản vay và tiền gửi của gia đình mình sẽ chịu ảnh hưởng ra sao?"],
    },
  },

  expectations: {
    alsoCalled: ["Lạm phát kỳ vọng"],
    nuances: [
      "**Việt Nam không có con số chính thức cho chỉ số này.** Vì vậy không có đường biểu đồ, chỉ có dấu hiệu gián tiếp.",
      "**Kỳ vọng khác với dự báo.** Dự báo là con số của chuyên gia. Kỳ vọng là điều hàng triệu người tin và hành động theo, kể cả khi họ không nói ra thành số.",
      "**Nó có thể tự thành hiện thực.** Tin giá sẽ tăng thì đòi tăng lương và tăng giá trước, rồi giá tăng thật. Đó là lý do bản đồ có mũi tên đi hai chiều giữa kỳ vọng và [[cpi|lạm phát]].",
    ],
    worked: {
      title: "Ví dụ giả định, không phải số liệu thật",
      rows: [
        { label: "Công nhân tin giá sẽ tăng", value: "10%" },
        { label: "Họ đòi tăng lương", value: "10%" },
        { label: "Chủ xưởng tăng giá bán để bù lương", value: "khoảng 10%" },
        { label: "Giá thực sự tăng", value: "gần 10%, đúng như đã tin" },
      ],
      note: "Không ai trong chuỗi này sai về cá nhân. Mỗi người chỉ tự bảo vệ mình, nhưng cộng lại thì niềm tin biến thành lạm phát thật.",
    },
    whyMatters:
      "**Khi mọi người không còn tin giá sẽ ổn định, hãm lạm phát khó hơn rất nhiều.** Nếu mọi người tin Ngân hàng Nhà nước sẽ giữ được giá, một cú sốc giá dầu chỉ qua đi. Nếu không tin, cú sốc đó ngấm vào lương và giá bán, và [[policy_rate|lãi suất]] phải tăng cao hơn để kéo niềm tin trở lại.",
    whenMisleading:
      "**Tin đồn trên mạng không phải là kỳ vọng của cả nền kinh tế.** Một đợt xếp hàng mua vàng có thể chỉ phản ánh một nhóm người. Cũng đừng nghĩ người dân lúc nào cũng phản ứng theo số công bố: họ thường đánh giá lạm phát qua vài món mua hằng ngày như xăng và thực phẩm.",
    breakdowns: [
      { by: "Giá vàng và đô la tự do", reveals: "người dân có đang chạy khỏi tiền đồng để giữ giá trị không" },
      { by: "Lãi suất huy động dài hạn", reveals: "người gửi tiền đòi bù bao nhiêu cho lạm phát tương lai" },
      { by: "Lương và giá bán của doanh nghiệp", reveals: "kỳ vọng đã đi vào quyết định thực tế hay mới chỉ là lời nói" },
      { by: "Món hàng mua hằng ngày", reveals: "xăng và thực phẩm tăng giá thường định hình cảm nhận của người dân nhanh hơn con số công bố" },
    ],
    questions: {
      explore: ["Người dân và doanh nghiệp có đang tích trữ vàng, đô la hoặc tăng giá trước khi chi phí tăng không?", "Một cú sốc giá gần đây có ngấm vào lương không, hay qua đi nhanh?"],
      decide: ["Mình có đang tích trữ hàng hay đổi tiền sang vàng chỉ vì sợ giá tăng không, và điều đó có thật sự cần không?"],
    },
  },
};

const plain = (s: string) => s.replace(/\*\*/g, "").replace(/\[\[[^|\]]+\|([^\]]+)\]\]/g, "$1");

/** Hồ sơ chỉ số dạng văn bản thường để sao chép vào ghi chú. */
export function profileText(ind: Indicator, p?: IndicatorProfile) {
  const lines = [ind.name, ind.plain, "", `Cách tính: ${ind.formula ?? "Khái niệm, không có công thức số."}`];
  if (p) {
    lines.push("", "Điểm dễ hiểu sai:", ...p.nuances.map((n) => `- ${plain(n)}`));
    lines.push("", `Vì sao quan trọng: ${plain(p.whyMatters)}`, `Khi nào dễ đọc sai: ${plain(p.whenMisleading)}`);
    lines.push("", "Câu hỏi nên đặt ra:", ...[...p.questions.explore, ...p.questions.decide].map((q) => `- ${q}`));
  }
  return lines.join("\n");
}
