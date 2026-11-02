/**
 * Câu chuyện cho từng cú sốc trong trang Mô phỏng, trình bày giống case study:
 * mỗi bước là một đoạn của chuỗi lan truyền, kèm các thẻ và mũi tên liên quan.
 * Chiều tăng giảm trong lời kể phải khớp với kết quả của lib/simulate.ts (có test kiểm tra).
 */
export type SimStep = {
  title: string;
  body: string[];
  /** Thẻ hiện trên bản đồ nhỏ của bước này (thêm cả hai đầu của các mũi tên) */
  nodes: string[];
  links: [string, string][];
  /** Chỉ số vẽ trên biểu đồ phản ứng (tối đa 4) */
  lines: string[];
  /** Khoảng kỳ (quý) mà bước này kể; thẻ hiện mức tác động ở kỳ cuối */
  periods: [number, number];
  /** Chiều của các chỉ số chính ở kỳ cuối của bước, để test đối chiếu lời kể với mô hình */
  expect: Record<string, "up" | "down">;
};

export type SimStory = { preset: string; steps: SimStep[] };

export const SIM_STORIES: SimStory[] = [
  {
    preset: "rate-up",
    steps: [
      {
        title: "NHNN tăng lãi suất điều hành",
        body: [
          "Ngân hàng Nhà nước nâng lãi suất cho các ngân hàng vay và giữ ở mức cao. Lý do thường gặp: lạm phát đang lên, hoặc VND đang chịu áp lực mất giá.",
          "Ngay lúc này chưa có gì khác thay đổi. Tác động cần thời gian để đi qua các mũi tên, mỗi mũi tên mất khoảng một quý.",
        ],
        nodes: ["policy_rate", "lending_rate", "fx_rate"],
        links: [],
        lines: ["policy_rate"],
        periods: [0, 0],
        expect: { policy_rate: "up" },
      },
      {
        title: "Ngân hàng tăng lãi cho vay, VND được giữ giá",
        body: [
          "Quý sau, ngân hàng phải trả giá vốn cao hơn nên tăng lãi suất cho vay. Đây là bước truyền dẫn mạnh nhất trong cả chuỗi.",
          "Cùng lúc, giữ tiền đồng có lãi hơn nên bớt người đổi sang USD: tỷ giá giảm, tức VND mạnh lên.",
        ],
        nodes: ["policy_rate", "lending_rate", "fx_rate"],
        links: [["policy_rate", "lending_rate"], ["policy_rate", "fx_rate"]],
        lines: ["lending_rate", "fx_rate"],
        periods: [1, 1],
        expect: { lending_rate: "up", fx_rate: "down" },
      },
      {
        title: "Vay đắt hơn: tín dụng và lượng tiền chậm lại",
        body: [
          "Doanh nghiệp hoãn mở rộng nhà xưởng, người dân bớt vay mua nhà, mua xe. Tín dụng tăng chậm lại rõ rệt, kéo theo cung tiền M2.",
          "Đầu tư bị ảnh hưởng nhiều hơn tiêu dùng, vì doanh nghiệp vay nhiều hơn hộ gia đình.",
        ],
        nodes: ["lending_rate", "credit", "m2", "investment", "consumption"],
        links: [["lending_rate", "credit"], ["credit", "m2"], ["credit", "investment"], ["credit", "consumption"]],
        lines: ["credit", "investment", "consumption"],
        periods: [2, 3],
        expect: { credit: "down", m2: "down", investment: "down", consumption: "down" },
      },
      {
        title: "Tổng cầu yếu đi: GDP chậm lại, thất nghiệp tăng",
        body: [
          "VND mạnh hơn làm hàng Việt Nam đắt hơn với người mua nước ngoài, nên xuất khẩu ròng giảm. Cộng với đầu tư và tiêu dùng đều giảm, tăng trưởng GDP chậm lại sau khoảng một năm.",
          "Doanh nghiệp tuyển ít người hơn, thất nghiệp nhích lên. Đây là cái giá của thắt chặt tiền tệ.",
        ],
        nodes: ["investment", "consumption", "net_exports", "gdp_growth", "unemployment", "fx_rate"],
        links: [["fx_rate", "net_exports"], ["investment", "gdp_growth"], ["consumption", "gdp_growth"], ["net_exports", "gdp_growth"], ["gdp_growth", "unemployment"]],
        lines: ["gdp_growth", "net_exports", "unemployment"],
        periods: [3, 5],
        expect: { net_exports: "down", gdp_growth: "down", unemployment: "up" },
      },
      {
        title: "Mục tiêu đạt được: lạm phát hạ xuống",
        body: [
          "Lạm phát giảm theo ba đường: ít tiền hơn trong nền kinh tế (M2), VND mạnh làm hàng nhập khẩu rẻ hơn, và kinh tế nguội đi nên doanh nghiệp khó tăng giá.",
          "Sau khoảng 3 năm, lạm phát giảm và GDP cũng giảm. Đó là sự đánh đổi mà NHNN phải cân nhắc mỗi lần tăng lãi suất.",
        ],
        nodes: ["m2", "fx_rate", "gdp_growth", "cpi"],
        links: [["m2", "cpi"], ["fx_rate", "cpi"], ["gdp_growth", "cpi"]],
        lines: ["cpi", "gdp_growth"],
        periods: [6, 12],
        expect: { cpi: "down", gdp_growth: "down" },
      },
    ],
  },
  {
    preset: "rate-down",
    steps: [
      {
        title: "NHNN hạ lãi suất điều hành",
        body: [
          "Ngân hàng Nhà nước giảm lãi suất cho các ngân hàng vay để kích thích kinh tế, thường khi tăng trưởng yếu và lạm phát thấp.",
          "Ngay lúc này chưa có gì khác thay đổi. Mỗi mũi tên mất khoảng một quý để truyền tác động.",
        ],
        nodes: ["policy_rate", "lending_rate", "fx_rate"],
        links: [],
        lines: ["policy_rate"],
        periods: [0, 0],
        expect: { policy_rate: "down" },
      },
      {
        title: "Lãi vay rẻ hơn, VND chịu áp lực",
        body: [
          "Quý sau, giá vốn của ngân hàng giảm nên lãi suất cho vay giảm theo.",
          "Mặt trái: giữ tiền đồng kém hấp dẫn hơn, một phần tiền chuyển sang USD, nên tỷ giá tăng (VND yếu đi).",
        ],
        nodes: ["policy_rate", "lending_rate", "fx_rate"],
        links: [["policy_rate", "lending_rate"], ["policy_rate", "fx_rate"]],
        lines: ["lending_rate", "fx_rate"],
        periods: [1, 1],
        expect: { lending_rate: "down", fx_rate: "up" },
      },
      {
        title: "Tín dụng chảy mạnh vào đầu tư và tiêu dùng",
        body: [
          "Vay rẻ, doanh nghiệp mở rộng sản xuất và người dân vay mua nhà, mua xe. Tín dụng và cung tiền M2 tăng nhanh.",
          "Đầu tư tăng nhiều hơn tiêu dùng vì doanh nghiệp là bên vay chính.",
        ],
        nodes: ["lending_rate", "credit", "m2", "investment", "consumption"],
        links: [["lending_rate", "credit"], ["credit", "m2"], ["credit", "investment"], ["credit", "consumption"]],
        lines: ["credit", "investment", "consumption"],
        periods: [2, 3],
        expect: { credit: "up", m2: "up", investment: "up", consumption: "up" },
      },
      {
        title: "GDP tăng tốc, thất nghiệp giảm",
        body: [
          "VND yếu hơn làm hàng xuất khẩu rẻ hơn, xuất khẩu ròng tăng. Cùng với đầu tư và tiêu dùng, tăng trưởng GDP đi lên sau khoảng một năm.",
          "Doanh nghiệp tuyển thêm người, thất nghiệp giảm. Đây là mục tiêu của việc hạ lãi suất.",
        ],
        nodes: ["investment", "consumption", "net_exports", "gdp_growth", "unemployment", "fx_rate"],
        links: [["fx_rate", "net_exports"], ["investment", "gdp_growth"], ["consumption", "gdp_growth"], ["net_exports", "gdp_growth"], ["gdp_growth", "unemployment"]],
        lines: ["gdp_growth", "net_exports", "unemployment"],
        periods: [3, 5],
        expect: { net_exports: "up", gdp_growth: "up", unemployment: "down" },
      },
      {
        title: "Cái giá phải trả: lạm phát tăng",
        body: [
          "Nhiều tiền hơn, VND yếu làm hàng nhập đắt hơn, kinh tế nóng lên: cả ba đường đều đẩy lạm phát lên.",
          "Sau khoảng 3 năm, GDP cao hơn nhưng lạm phát cũng cao hơn. Nếu hạ lãi suất quá đà, NHNN sẽ phải tăng lại sau này.",
        ],
        nodes: ["m2", "fx_rate", "gdp_growth", "cpi"],
        links: [["m2", "cpi"], ["fx_rate", "cpi"], ["gdp_growth", "cpi"]],
        lines: ["cpi", "gdp_growth"],
        periods: [6, 12],
        expect: { cpi: "up", gdp_growth: "up" },
      },
    ],
  },
  {
    preset: "spend-up",
    steps: [
      {
        title: "Chính phủ tăng chi tiêu",
        body: [
          "Chính phủ chi thêm, ví dụ một gói kích cầu: trả lương, mua sắm, hỗ trợ người dân. Đây là chính sách tài khóa, khác với chính sách tiền tệ của NHNN.",
          "Chi tiêu chính phủ (G) là một phần của GDP, nên tác động đến khá nhanh.",
        ],
        nodes: ["gov_spending", "gdp_growth", "fiscal_balance"],
        links: [],
        lines: ["gov_spending"],
        periods: [0, 0],
        expect: { gov_spending: "up" },
      },
      {
        title: "GDP tăng ngay, thất nghiệp giảm",
        body: [
          "Chỉ sau một quý, tiền chi ra trở thành đơn hàng cho doanh nghiệp, tăng trưởng GDP đi lên khá mạnh.",
          "Doanh nghiệp có thêm việc nên tuyển thêm người, thất nghiệp giảm.",
        ],
        nodes: ["gov_spending", "gdp_growth", "unemployment"],
        links: [["gov_spending", "gdp_growth"], ["gdp_growth", "unemployment"]],
        lines: ["gdp_growth", "unemployment"],
        periods: [1, 2],
        expect: { gdp_growth: "up", unemployment: "down" },
      },
      {
        title: "Ngân sách thâm hụt, nợ công tăng",
        body: [
          "Chi nhiều hơn thu thì cán cân ngân sách xấu đi, Chính phủ phải vay thêm, nợ công tăng.",
          "Kinh tế tăng nhanh hơn giúp thu thuế nhiều hơn, bù lại một phần, nhưng không đủ để cân bằng.",
        ],
        nodes: ["gov_spending", "fiscal_balance", "public_debt", "gdp_growth"],
        links: [["gov_spending", "fiscal_balance"], ["gdp_growth", "fiscal_balance"], ["fiscal_balance", "public_debt"]],
        lines: ["fiscal_balance", "public_debt"],
        periods: [1, 3],
        expect: { fiscal_balance: "down", public_debt: "up" },
      },
      {
        title: "Lạm phát nhích lên, NHNN phản ứng nhẹ",
        body: [
          "Kinh tế nóng hơn làm giá cả tăng lên một chút. NHNN thấy lạm phát tăng thì nâng nhẹ lãi suất.",
          "Lãi vay cao hơn làm tín dụng tư nhân giảm nhẹ. Hiện tượng này gọi là \"lấn át\": chi tiêu công tăng chen bớt chỗ của đầu tư tư nhân. Trong mô hình này mức lấn át nhỏ.",
        ],
        nodes: ["gdp_growth", "cpi", "policy_rate", "lending_rate", "credit"],
        links: [["gdp_growth", "cpi"], ["cpi", "policy_rate"], ["policy_rate", "lending_rate"], ["lending_rate", "credit"]],
        lines: ["cpi", "policy_rate", "credit"],
        periods: [3, 7],
        expect: { cpi: "up", policy_rate: "up", credit: "down" },
      },
      {
        title: "Kết quả sau 3 năm",
        body: [
          "GDP cao hơn và thất nghiệp thấp hơn, đổi lại ngân sách thâm hụt hơn, nợ công cao hơn và lạm phát nhích lên.",
          "Vì vậy kích cầu bằng tài khóa thường dùng khi kinh tế suy yếu và nợ công còn thấp, như gói hỗ trợ năm 2009 hay 2022.",
        ],
        nodes: ["gov_spending", "gdp_growth", "fiscal_balance", "public_debt", "cpi"],
        links: [["gov_spending", "gdp_growth"], ["gov_spending", "fiscal_balance"], ["fiscal_balance", "public_debt"], ["gdp_growth", "cpi"]],
        lines: ["gdp_growth", "fiscal_balance", "public_debt", "cpi"],
        periods: [8, 12],
        expect: { gdp_growth: "up", fiscal_balance: "down", public_debt: "up", cpi: "up" },
      },
    ],
  },
  {
    preset: "fed-up",
    steps: [
      {
        title: "Fed tăng lãi suất",
        body: [
          "Cục Dự trữ Liên bang Mỹ tăng lãi suất. Giữ USD giờ có lãi hơn, nên tiền trên khắp thế giới có xu hướng chảy về Mỹ.",
          "Việt Nam không điều khiển được cú sốc này, chỉ có thể ứng phó.",
        ],
        nodes: ["fed_rate", "fx_rate", "fdi"],
        links: [],
        lines: ["fed_rate"],
        periods: [0, 0],
        expect: { fed_rate: "up" },
      },
      {
        title: "USD mạnh lên, VND mất giá",
        body: [
          "Quý sau, tỷ giá VND/USD tăng: cần nhiều đồng hơn để đổi một đô la. Đây là tác động lớn nhất và nhanh nhất của cú sốc.",
        ],
        nodes: ["fed_rate", "fx_rate"],
        links: [["fed_rate", "fx_rate"]],
        lines: ["fx_rate"],
        periods: [1, 1],
        expect: { fx_rate: "up" },
      },
      {
        title: "Hai mặt của VND yếu",
        body: [
          "Mặt xấu: hàng nhập khẩu (xăng dầu, nguyên liệu) đắt hơn tính bằng tiền đồng, lạm phát tăng.",
          "Mặt tốt: hàng Việt Nam rẻ hơn với người mua nước ngoài, xuất khẩu ròng và cán cân vãng lai cải thiện. Trong vài quý đầu, GDP thậm chí nhích lên nhẹ nhờ xuất khẩu.",
        ],
        nodes: ["fx_rate", "cpi", "net_exports", "current_account", "gdp_growth"],
        links: [["fx_rate", "cpi"], ["fx_rate", "net_exports"], ["net_exports", "current_account"], ["net_exports", "gdp_growth"]],
        lines: ["cpi", "net_exports", "gdp_growth"],
        periods: [2, 4],
        expect: { cpi: "up", net_exports: "up", current_account: "up", gdp_growth: "up" },
      },
      {
        title: "NHNN tăng lãi suất để giữ tỷ giá, FDI chậm lại",
        body: [
          "Tỷ giá và lạm phát cùng tăng buộc NHNN nâng lãi suất. Lãi vay cao hơn làm tín dụng và đầu tư giảm.",
          "Đồng thời vốn FDI vào chậm lại khi lãi suất USD cao, kéo đầu tư xuống thêm và làm dự trữ ngoại hối giảm.",
        ],
        nodes: ["fx_rate", "cpi", "policy_rate", "lending_rate", "credit", "fdi", "investment", "reserves"],
        links: [["fx_rate", "policy_rate"], ["cpi", "policy_rate"], ["policy_rate", "lending_rate"], ["lending_rate", "credit"], ["fed_rate", "fdi"], ["fdi", "investment"], ["credit", "investment"], ["fdi", "reserves"]],
        lines: ["policy_rate", "fdi", "investment"],
        periods: [2, 5],
        expect: { policy_rate: "up", credit: "down", fdi: "down", investment: "down" },
      },
      {
        title: "Kết quả: GDP quay đầu giảm",
        body: [
          "Khoảng quý 6, đầu tư giảm và lãi suất cao lấn át lợi ích từ xuất khẩu: tăng trưởng GDP chuyển sang giảm, thất nghiệp nhích lên.",
          "Sau 3 năm: VND yếu hơn, lạm phát cao hơn, GDP thấp hơn một chút. Đây là lý do các nước mới nổi rất lo mỗi khi Fed tăng lãi suất, như năm 2022.",
        ],
        nodes: ["investment", "net_exports", "gdp_growth", "unemployment", "fx_rate", "cpi"],
        links: [["investment", "gdp_growth"], ["net_exports", "gdp_growth"], ["gdp_growth", "unemployment"]],
        lines: ["gdp_growth", "fx_rate", "cpi"],
        periods: [6, 12],
        expect: { gdp_growth: "down", unemployment: "up", fx_rate: "up", cpi: "up" },
      },
    ],
  },
  {
    preset: "oil-up",
    steps: [
      {
        title: "Giá dầu thế giới tăng mạnh",
        body: [
          "Giá dầu tăng, ví dụ do xung đột ở Trung Đông. Đây là cú sốc cung: chi phí sản xuất và vận tải tăng, không phải vì người dân mua nhiều hơn.",
        ],
        nodes: ["oil_price", "cpi"],
        links: [],
        lines: ["oil_price"],
        periods: [0, 0],
        expect: { oil_price: "up" },
      },
      {
        title: "Lạm phát tăng ngay",
        body: [
          "Xăng dầu nằm trong giỏ hàng tính CPI và là chi phí của gần như mọi hàng hóa. Chỉ sau một quý, lạm phát tăng mạnh.",
        ],
        nodes: ["oil_price", "cpi"],
        links: [["oil_price", "cpi"]],
        lines: ["cpi"],
        periods: [1, 1],
        expect: { cpi: "up" },
      },
      {
        title: "NHNN tăng lãi suất để chống lạm phát",
        body: [
          "Thấy lạm phát tăng, NHNN nâng lãi suất điều hành. Lãi vay ngân hàng tăng theo, VND mạnh lên một chút.",
        ],
        nodes: ["cpi", "policy_rate", "lending_rate", "fx_rate"],
        links: [["cpi", "policy_rate"], ["policy_rate", "lending_rate"], ["policy_rate", "fx_rate"]],
        lines: ["policy_rate", "lending_rate"],
        periods: [2, 3],
        expect: { policy_rate: "up", lending_rate: "up", fx_rate: "down" },
      },
      {
        title: "Tín dụng, đầu tư và GDP đi xuống",
        body: [
          "Vay đắt hơn nên tín dụng chậm lại, đầu tư và tiêu dùng giảm. Tăng trưởng GDP chậm lại, thất nghiệp nhích lên.",
        ],
        nodes: ["lending_rate", "credit", "investment", "consumption", "gdp_growth", "unemployment"],
        links: [["lending_rate", "credit"], ["credit", "investment"], ["credit", "consumption"], ["investment", "gdp_growth"], ["consumption", "gdp_growth"], ["gdp_growth", "unemployment"]],
        lines: ["credit", "investment", "gdp_growth"],
        periods: [4, 7],
        expect: { credit: "down", investment: "down", gdp_growth: "down", unemployment: "up" },
      },
      {
        title: "Kết quả: vừa lạm phát vừa chậm tăng trưởng",
        body: [
          "Sau 3 năm, lạm phát vẫn cao hơn đáng kể vì giá dầu không giảm, trong khi GDP thấp hơn. Lãi suất chỉ kéo được một phần lạm phát xuống.",
          "Đây là tình huống khó nhất cho NHNN: tăng lãi suất thì kinh tế càng chậm, không tăng thì lạm phát kéo dài. Năm 2008 và 2022 là ví dụ.",
        ],
        nodes: ["oil_price", "cpi", "policy_rate", "gdp_growth"],
        links: [["oil_price", "cpi"], ["cpi", "policy_rate"]],
        lines: ["cpi", "gdp_growth", "policy_rate"],
        periods: [8, 12],
        expect: { cpi: "up", gdp_growth: "down", policy_rate: "up" },
      },
    ],
  },
  {
    preset: "vnd-down",
    steps: [
      {
        title: "VND mất giá",
        body: [
          "Tỷ giá VND/USD tăng: cần nhiều tiền đồng hơn để đổi một đô la. Có thể do dòng vốn rút ra, nhập khẩu tăng, hoặc NHNN chủ động cho VND yếu đi.",
        ],
        nodes: ["fx_rate", "cpi", "policy_rate"],
        links: [],
        lines: ["fx_rate"],
        periods: [0, 0],
        expect: { fx_rate: "up" },
      },
      {
        title: "Hàng nhập đắt hơn, NHNN tăng lãi suất",
        body: [
          "Hàng nhập khẩu tính bằng tiền đồng đắt hơn, lạm phát tăng ngay quý sau.",
          "Để giữ tỷ giá và chặn lạm phát, NHNN nâng lãi suất điều hành.",
        ],
        nodes: ["fx_rate", "cpi", "policy_rate"],
        links: [["fx_rate", "cpi"], ["fx_rate", "policy_rate"]],
        lines: ["cpi", "policy_rate"],
        periods: [1, 1],
        expect: { cpi: "up", policy_rate: "up" },
      },
      {
        title: "Xuất khẩu được lợi",
        body: [
          "Hàng Việt Nam rẻ hơn với người mua nước ngoài, xuất khẩu ròng tăng. Cán cân vãng lai cải thiện, dự trữ ngoại hối tăng lên.",
          "Trong vài quý đầu, tăng trưởng GDP đi lên nhờ xuất khẩu.",
        ],
        nodes: ["fx_rate", "net_exports", "current_account", "reserves", "gdp_growth"],
        links: [["fx_rate", "net_exports"], ["net_exports", "current_account"], ["current_account", "reserves"], ["net_exports", "gdp_growth"]],
        lines: ["net_exports", "current_account", "gdp_growth"],
        periods: [2, 4],
        expect: { net_exports: "up", current_account: "up", reserves: "up", gdp_growth: "up" },
      },
      {
        title: "Lãi suất cao kéo đầu tư và tiêu dùng xuống",
        body: [
          "Lãi suất cao mà NHNN dùng để giữ tỷ giá làm tín dụng chậm lại, đầu tư và tiêu dùng giảm.",
          "Khoảng quý 6, phần giảm này bào mòn hết lợi ích từ xuất khẩu, tăng trưởng GDP tạm quay đầu giảm.",
        ],
        nodes: ["policy_rate", "lending_rate", "credit", "investment", "consumption", "gdp_growth"],
        links: [["policy_rate", "lending_rate"], ["lending_rate", "credit"], ["credit", "investment"], ["credit", "consumption"], ["investment", "gdp_growth"], ["consumption", "gdp_growth"]],
        lines: ["credit", "investment", "gdp_growth"],
        periods: [2, 6],
        expect: { credit: "down", investment: "down", gdp_growth: "down" },
      },
      {
        title: "Kết quả: GDP gần như không đổi, lạm phát cao hơn",
        body: [
          "Sau 3 năm, xuất khẩu và cán cân vãng lai tốt hơn, nhưng đầu tư, tiêu dùng yếu hơn; hai bên gần như triệt tiêu nhau, GDP chỉ cao hơn rất ít. Lạm phát thì cao hơn rõ.",
          "Vì vậy phá giá tiền tệ để thúc xuất khẩu không phải là \"bữa trưa miễn phí\".",
        ],
        nodes: ["fx_rate", "net_exports", "investment", "gdp_growth", "cpi"],
        links: [["fx_rate", "net_exports"], ["fx_rate", "cpi"], ["net_exports", "gdp_growth"], ["investment", "gdp_growth"]],
        lines: ["gdp_growth", "cpi", "net_exports"],
        periods: [7, 12],
        expect: { gdp_growth: "up", cpi: "up", net_exports: "up", investment: "down" },
      },
    ],
  },
  {
    preset: "fdi-up",
    steps: [
      {
        title: "Một làn sóng FDI mới",
        body: [
          "Các tập đoàn nước ngoài chuyển nhà máy sang Việt Nam, ví dụ để đa dạng chuỗi cung ứng khỏi Trung Quốc. Vốn FDI giải ngân tăng mạnh.",
        ],
        nodes: ["fdi", "investment", "reserves"],
        links: [],
        lines: ["fdi"],
        periods: [0, 0],
        expect: { fdi: "up" },
      },
      {
        title: "Đầu tư và dự trữ ngoại hối tăng ngay",
        body: [
          "Tiền xây nhà máy được tính vào đầu tư (I). USD đổ vào được NHNN mua lại, dự trữ ngoại hối tăng.",
        ],
        nodes: ["fdi", "investment", "reserves"],
        links: [["fdi", "investment"], ["fdi", "reserves"]],
        lines: ["investment", "reserves"],
        periods: [1, 1],
        expect: { investment: "up", reserves: "up" },
      },
      {
        title: "GDP tăng, VND mạnh lên",
        body: [
          "Đầu tư tăng kéo tăng trưởng GDP lên, thất nghiệp giảm.",
          "Dự trữ ngoại hối dồi dào giúp tỷ giá giảm (VND mạnh lên), làm hàng nhập rẻ hơn nên lạm phát lúc đầu giảm nhẹ.",
        ],
        nodes: ["investment", "gdp_growth", "unemployment", "reserves", "fx_rate", "cpi"],
        links: [["investment", "gdp_growth"], ["gdp_growth", "unemployment"], ["reserves", "fx_rate"], ["fx_rate", "cpi"]],
        lines: ["gdp_growth", "fx_rate", "unemployment"],
        periods: [2, 3],
        expect: { gdp_growth: "up", unemployment: "down", fx_rate: "down", cpi: "down" },
      },
      {
        title: "Nhà máy mới bắt đầu xuất khẩu",
        body: [
          "Sau khoảng 3 quý, nhà máy đi vào hoạt động và xuất hàng ra nước ngoài. Xuất khẩu ròng và cán cân vãng lai tăng, GDP được đẩy thêm.",
          "Kinh tế tăng nhanh giúp thu ngân sách tốt hơn, nợ công giảm.",
        ],
        nodes: ["fdi", "net_exports", "current_account", "gdp_growth", "fiscal_balance", "public_debt"],
        links: [["fdi", "net_exports"], ["net_exports", "current_account"], ["net_exports", "gdp_growth"], ["gdp_growth", "fiscal_balance"], ["fiscal_balance", "public_debt"]],
        lines: ["net_exports", "current_account", "gdp_growth"],
        periods: [3, 5],
        expect: { net_exports: "up", current_account: "up", fiscal_balance: "up", public_debt: "down" },
      },
      {
        title: "Kết quả: tăng trưởng cao hơn, lạm phát nhích nhẹ",
        body: [
          "Sau 3 năm: GDP cao hơn, thất nghiệp thấp hơn, dự trữ ngoại hối dồi dào, ngân sách tốt hơn.",
          "Lạm phát đổi chiều: lúc đầu giảm nhờ VND mạnh, sau đó tăng nhẹ vì kinh tế nóng hơn. FDI là cú sốc \"tốt\" hiếm hoi, gần như không có mặt trái lớn trong mô hình này.",
        ],
        nodes: ["fdi", "gdp_growth", "unemployment", "reserves", "cpi"],
        links: [["gdp_growth", "unemployment"], ["gdp_growth", "cpi"]],
        lines: ["gdp_growth", "reserves", "cpi"],
        periods: [6, 12],
        expect: { gdp_growth: "up", unemployment: "down", reserves: "up", cpi: "up" },
      },
    ],
  },
];

export const STORY_BY_PRESET = Object.fromEntries(SIM_STORIES.map((s) => [s.preset, s])) as Record<string, SimStory>;
