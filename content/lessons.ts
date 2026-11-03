export type Quiz = {
  q: string;
  options: string[];
  answer: number;
  explain: string;
};

export type Lesson = {
  slug: string;
  title: string;
  minutes: number;
  question: string;
  ideas: string[];
  indicators: string[];
  quiz: Quiz[];
  /** Việc nên làm ngay sau bài */
  tryIt: { label: string; href: string };
};

export const LESSONS: Lesson[] = [
  {
    slug: "ba-con-so",
    title: "Ba con số ai cũng nhắc tới",
    minutes: 4,
    question: "Làm sao biết nền kinh tế đang khỏe hay yếu?",
    ideas: [
      "Kinh tế vĩ mô nhìn cả nền kinh tế như một khối, không nhìn từng công ty hay từng gia đình.",
      "Ba câu hỏi lớn: nền kinh tế có lớn nhanh không (tăng trưởng GDP), giá cả có tăng nhanh không (lạm phát CPI), mọi người có việc làm không (thất nghiệp).",
      "Việt Nam thường tăng trưởng 6–7%/năm. Năm 2025 tăng khoảng 8%, lạm phát khoảng 3,3%.",
      "Lạm phát vừa phải (khoảng 2–4%) là bình thường. Lạm phát quá cao như năm 2008 (23%) làm tiền mất giá nhanh, người dân khổ.",
      "Một nền kinh tế lý tưởng tăng trưởng cao mà lạm phát thấp. Khó nhất là hai thứ này thường kéo nhau: tăng trưởng quá nóng thì giá cũng dễ tăng.",
    ],
    indicators: ["gdp_growth", "cpi", "unemployment"],
    quiz: [
      {
        q: "Tăng trưởng GDP 7% nghĩa là gì?",
        options: [
          "Thu nhập của mỗi người tăng đúng 7%",
          "Cả nước làm ra nhiều hơn khoảng 7% hàng hóa và dịch vụ so với năm trước, đã trừ yếu tố tăng giá",
          "Giá cả tăng 7%",
        ],
        answer: 1,
        explain: "GDP đo tổng sản lượng cả nước. Nó đã loại bỏ yếu tố giá, nên tăng 7% là làm ra nhiều hơn thật sự, không phải chỉ đắt hơn. Thu nhập từng người có thể tăng nhiều hoặc ít hơn mức trung bình này.",
      },
      {
        q: "Năm ngoái giỏ hàng giá 100.000 đồng, năm nay giá 104.000 đồng. Lạm phát là bao nhiêu?",
        options: ["4%", "104%", "0,4%"],
        answer: 0,
        explain: "Lạm phát là phần trăm tăng giá: (104.000 − 100.000) / 100.000 = 4%.",
      },
    ],
    tryIt: { label: "Xem ba chỉ số này trên bản đồ", href: "/ban-do/chinh?focus=gdp_growth,cpi,unemployment" },
  },
  {
    slug: "ai-tieu-tien",
    title: "Ai đang tiêu tiền? Công thức GDP",
    minutes: 5,
    question: "GDP được tạo ra từ đâu?",
    ideas: [
      "GDP = C + I + G + (X − M). Bốn nhóm chi tiêu tạo ra toàn bộ GDP.",
      "C (tiêu dùng hộ gia đình) lớn nhất, khoảng 53% GDP Việt Nam năm 2025.",
      "I (đầu tư: nhà xưởng, máy móc, hạ tầng, nhà ở) khoảng 31%.",
      "G (chi tiêu dùng của Nhà nước) khoảng 9%. Đầu tư công như làm đường cao tốc được tính vào I, không phải G.",
      "X − M (xuất khẩu ròng) khoảng 6%. Xuất khẩu của Việt Nam rất lớn, gần bằng GDP, nhưng nhập khẩu cũng gần như vậy nên phần ròng nhỏ.",
      "Bẫy hay gặp: các con số trên là tỷ trọng, cộng lại xấp xỉ 100% GDP, chứ không cộng lại thành tốc độ tăng GDP 8%. Muốn biết mỗi phần góp bao nhiêu vào tăng trưởng, nhân tỷ trọng của nó với tốc độ tăng của chính nó. Năm 2025: tiêu dùng chiếm 53,6% GDP năm trước và tăng 7,3%, nên góp khoảng 3,9 điểm % trong 8% tăng trưởng.",
      "Mẹo: mỗi khi đọc tin \"chính sách X sẽ thúc đẩy tăng trưởng\", hãy hỏi: nó làm C, I, G hay X − M tăng?",
    ],
    indicators: ["consumption", "investment", "gov_spending", "net_exports"],
    quiz: [
      {
        q: "Nhà nước xây một tuyến đường cao tốc. Khoản chi này được tính vào phần nào của GDP?",
        options: ["C: tiêu dùng", "I: đầu tư", "X − M: xuất khẩu ròng"],
        answer: 1,
        explain: "Đường cao tốc là tài sản dùng lâu dài để tạo ra sản lượng, nên được tính là đầu tư (I). Chi lương công chức mới tính vào G.",
      },
      {
        q: "Một nhà máy ở Việt Nam nhập linh kiện 80 USD, lắp ráp rồi xuất khẩu điện thoại giá 100 USD. Xuất khẩu ròng tăng bao nhiêu?",
        options: ["100 USD", "80 USD", "20 USD"],
        answer: 2,
        explain: "Xuất khẩu tăng 100 nhưng nhập khẩu cũng tăng 80, nên X − M chỉ tăng 20 USD. Đây là lý do xuất khẩu Việt Nam rất lớn nhưng xuất khẩu ròng nhỏ.",
      },
      {
        q: "Đầu tư chiếm 30% GDP và năm nay tăng 10%. Đầu tư đóng góp bao nhiêu vào tăng trưởng GDP?",
        options: ["10 điểm %", "3 điểm %", "30 điểm %"],
        answer: 1,
        explain: "Đóng góp = tỷ trọng × tốc độ tăng = 0,30 × 10% = 3 điểm %. Đầu tư tăng nhanh nhưng chỉ là một phần ba nền kinh tế, nên chỉ kéo GDP lên khoảng 3 điểm %.",
      },
    ],
    tryIt: { label: "Xem bốn thành phần trên bản đồ", href: "/ban-do/tong-cau?focus=consumption,investment,gov_spending,net_exports,gdp_growth" },
  },
  {
    slug: "lai-suat",
    title: "Ngân hàng Nhà nước và lãi suất",
    minutes: 6,
    question: "Vì sao cả nước chú ý mỗi khi Ngân hàng Nhà nước đổi lãi suất?",
    ideas: [
      "Lãi suất là giá của tiền. NHNN quyết định giá \"bán buôn\" (lãi suất điều hành), các ngân hàng thương mại bán lẻ cho bạn (lãi suất cho vay).",
      "Chuỗi cần nhớ: NHNN tăng lãi suất → vay đắt → vay ít → tín dụng và tiền tăng chậm → chi tiêu giảm → lạm phát giảm, nhưng tăng trưởng cũng chậm lại.",
      "Hạ lãi suất thì ngược lại: kích thích tăng trưởng nhưng dễ làm lạm phát tăng.",
      "Có độ trễ: lãi suất đổi hôm nay, vài quý sau mới thấy rõ tác động lên giá cả và sản xuất.",
      "Quan trọng là lãi suất thực (lãi suất trừ lạm phát). Năm 2008 lãi suất cho vay gần 16% nhưng lạm phát 23%, nên thực tế tiền vẫn \"rẻ\".",
    ],
    indicators: ["policy_rate", "lending_rate", "credit", "m2"],
    quiz: [
      {
        q: "Lạm phát đang tăng cao. Ngân hàng Nhà nước thường làm gì?",
        options: ["Hạ lãi suất", "Tăng lãi suất", "In thêm tiền"],
        answer: 1,
        explain: "Tăng lãi suất làm vay đắt hơn, người dân và doanh nghiệp chi tiêu ít đi, nhu cầu giảm nên giá cả bớt tăng.",
      },
      {
        q: "Lãi suất tiết kiệm 6%/năm, lạm phát 8%/năm. Gửi tiết kiệm thực sự lời hay lỗ?",
        options: ["Lời 6%", "Lỗ khoảng 2% sức mua", "Không lời không lỗ"],
        answer: 1,
        explain: "Lãi suất thực ≈ 6% − 8% = −2%. Số tiền tăng 6% nhưng giá cả tăng 8%, nên cuối năm bạn mua được ít hàng hơn.",
      },
    ],
    tryIt: { label: "Mô phỏng NHNN tăng lãi suất", href: "/mo-phong?preset=rate-up" },
  },
  {
    slug: "tien-dong-va-the-gioi",
    title: "Tiền đồng và thế giới",
    minutes: 6,
    question: "Vì sao Mỹ tăng lãi suất mà Việt Nam lại lo?",
    ideas: [
      "Tỷ giá là giá của đô la tính bằng tiền đồng. Tỷ giá tăng nghĩa là tiền đồng yếu đi.",
      "Fed (ngân hàng trung ương Mỹ) tăng lãi suất thì giữ đô la có lợi hơn, tiền chảy về Mỹ, đô la mạnh lên, tiền đồng chịu áp lực.",
      "Tiền đồng yếu: tốt cho xuất khẩu (hàng Việt rẻ hơn với người nước ngoài) nhưng xấu cho lạm phát (xăng dầu, nguyên liệu nhập khẩu đắt hơn).",
      "Dự trữ ngoại hối là \"quỹ dự phòng\" bằng đô la. Khi cần, NHNN bán đô la ra để giữ giá tiền đồng. Năm 2022 dự trữ giảm khoảng 22 tỷ USD vì việc này.",
      "FDI và xuất siêu mang đô la vào, giúp dự trữ dày thêm và tiền đồng ổn định.",
    ],
    indicators: ["fed_rate", "fx_rate", "reserves", "fdi", "net_exports"],
    quiz: [
      {
        q: "Tỷ giá VND/USD tăng từ 23.000 lên 25.000. Điều gì đúng?",
        options: ["Tiền đồng mạnh lên", "Tiền đồng yếu đi, xăng dầu nhập khẩu tính bằng tiền đồng đắt hơn", "Hàng Việt Nam đắt hơn với người Mỹ"],
        answer: 1,
        explain: "Cần nhiều đồng hơn để mua 1 USD nghĩa là tiền đồng yếu đi. Hàng nhập khẩu đắt hơn, còn hàng Việt Nam rẻ hơn với người nước ngoài.",
      },
      {
        q: "Fed tăng lãi suất mạnh. NHNN muốn giữ giá tiền đồng. Hai công cụ nào có thể dùng?",
        options: ["Bán đô la từ dự trữ, tăng lãi suất tiền đồng", "Mua thêm đô la, hạ lãi suất", "Tăng chi tiêu công"],
        answer: 0,
        explain: "Bán đô la tăng nguồn cung đô la trên thị trường. Tăng lãi suất làm giữ tiền đồng hấp dẫn hơn. Năm 2022 NHNN đã dùng cả hai.",
      },
    ],
    tryIt: { label: "Tìm đường từ Fed tới lạm phát Việt Nam", href: "/ban-do/chinh?from=fed_rate&to=cpi" },
  },
  {
    slug: "chinh-phu-thu-chi",
    title: "Chính phủ thu và chi",
    minutes: 4,
    question: "Ngoài lãi suất, còn cách nào khác để kích thích kinh tế?",
    ideas: [
      "Chính sách tài khóa: Chính phủ thay đổi chi tiêu và thuế. Chính sách tiền tệ: NHNN thay đổi lãi suất và lượng tiền.",
      "Tăng chi tiêu hoặc giảm thuế giúp tổng cầu tăng ngay, hữu ích khi kinh tế suy yếu (như năm 2009, 2020).",
      "Nếu chi vượt thu thì ngân sách bội chi, phải vay, nợ công tăng. Nợ công Việt Nam lên gần 48% GDP năm 2016 rồi giảm xuống khoảng 30% GDP.",
      "Nợ công thấp nghĩa là còn \"dư địa\" để chi tiêu mạnh khi có khủng hoảng.",
    ],
    indicators: ["gov_spending", "fiscal_balance", "public_debt"],
    quiz: [
      {
        q: "Kinh tế đang suy thoái, xuất khẩu giảm mạnh. Chính sách tài khóa nào hợp lý?",
        options: ["Tăng thuế để cân bằng ngân sách", "Tăng chi tiêu hoặc giảm thuế tạm thời", "Cắt giảm đầu tư công"],
        answer: 1,
        explain: "Khi khu vực tư nhân và nước ngoài chi ít đi, Nhà nước chi nhiều hơn để bù vào tổng cầu. Đây gọi là chính sách ngược chu kỳ. Tăng thuế lúc này sẽ làm suy thoái sâu hơn.",
      },
    ],
    tryIt: { label: "Mô phỏng tăng chi tiêu công", href: "/mo-phong?preset=spend-up" },
  },
  {
    slug: "doc-cau-chuyen",
    title: "Đọc một câu chuyện thật",
    minutes: 8,
    question: "Ghép tất cả lại: chuyện gì đã xảy ra năm 2008?",
    ideas: [
      "Mỗi giai đoạn kinh tế là một chuỗi mũi tên nối nhau. Năm 2007–2008 là ví dụ đầy đủ nhất: vốn ngoại → tiền và tín dụng tăng vọt → lạm phát 23% → NHNN tăng lãi suất lên 15%.",
      "Khi đọc tin kinh tế, hãy tự hỏi: đây là cú sốc từ bên ngoài hay chính sách trong nước? Nó đi qua kênh nào? Kết quả sẽ là gì, và sau bao lâu?",
      "Bước tiếp theo là tự ra quyết định: trong phần Thử thách, bạn đóng vai người điều hành và tự chọn cách ứng phó.",
    ],
    indicators: ["fdi", "credit", "m2", "cpi", "policy_rate"],
    quiz: [
      {
        q: "Năm 2007 cung tiền M2 tăng 49%. Theo quan hệ trên bản đồ, điều gì nhiều khả năng xảy ra sau đó?",
        options: ["Lạm phát giảm", "Lạm phát tăng mạnh sau vài quý", "Tỷ giá giảm mạnh"],
        answer: 1,
        explain: "Tiền tăng nhanh hơn nhiều so với lượng hàng làm ra thì giá bị đẩy lên, có độ trễ. Năm 2008 lạm phát lên 23%.",
      },
    ],
    tryIt: { label: "Đọc case study 2007–2008", href: "/case-study/2008-lam-phat" },
  },
];
