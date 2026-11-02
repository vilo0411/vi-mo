export type Link = {
  from: string;
  to: string;
  /** +1: cùng chiều (from tăng thì to tăng). −1: ngược chiều. */
  sign: 1 | -1;
  /** Độ trễ trong mô phỏng, tính theo kỳ (khoảng một quý). */
  lag: 1 | 2 | 3;
  /** Độ mạnh tương đối, 0–1. Là giả định để học, không phải hệ số ước lượng. */
  strength: number;
  mechanism: string;
  example?: string;
  /** Quan hệ của các thẻ khái niệm: vẽ trên bản đồ nhưng không đưa vào mô phỏng, để mô phỏng và thử thách giữ nguyên. */
  concept?: true;
};

export const LINKS: Link[] = [
  // Chính sách tiền tệ
  {
    from: "policy_rate", to: "lending_rate", sign: 1, lag: 1, strength: 0.8,
    mechanism: "NHNN tăng lãi suất cho ngân hàng vay thì ngân hàng phải trả giá vốn cao hơn, nên tăng lãi suất huy động và cho vay.",
    example: "Năm 2008 lãi suất tái cấp vốn lên 15% và lãi suất cho vay bình quân lên gần 16%.",
  },
  {
    from: "lending_rate", to: "credit", sign: -1, lag: 1, strength: 0.7,
    mechanism: "Vay đắt hơn thì doanh nghiệp và người dân vay ít đi, tín dụng tăng chậm lại.",
  },
  {
    from: "credit", to: "m2", sign: 1, lag: 1, strength: 0.7,
    mechanism: "Khi ngân hàng cho vay, khoản vay được chuyển vào tài khoản của người vay hoặc người bán, tạo ra tiền gửi mới. Vì vậy tín dụng tăng thì M2 tăng.",
  },
  {
    from: "m2", to: "cpi", sign: 1, lag: 2, strength: 0.5,
    mechanism: "Tiền tăng nhanh hơn lượng hàng hóa làm ra thì giá cả bị đẩy lên. Tác động thường đến sau vài quý.",
    example: "M2 tăng 49% năm 2007, lạm phát năm 2008 lên 23%.",
  },
  {
    from: "credit", to: "investment", sign: 1, lag: 1, strength: 0.6,
    mechanism: "Doanh nghiệp Việt Nam phụ thuộc nhiều vào vốn vay ngân hàng để xây nhà xưởng, mua máy móc, làm dự án bất động sản.",
  },
  {
    from: "credit", to: "consumption", sign: 1, lag: 1, strength: 0.3,
    mechanism: "Vay tiêu dùng, vay mua nhà, mua xe trả góp dễ hơn thì hộ gia đình chi tiêu nhiều hơn.",
  },
  {
    from: "policy_rate", to: "fx_rate", sign: -1, lag: 1, strength: 0.4,
    mechanism: "Lãi suất VND cao hơn thì giữ VND có lợi hơn giữ USD, nhu cầu USD giảm, VND bớt áp lực mất giá (tỷ giá VND/USD giảm hoặc tăng chậm lại).",
    example: "Tháng 9–10/2022 NHNN tăng lãi suất hai lần, một phần để giữ giá VND khi Fed tăng lãi suất mạnh.",
  },
  // Bên ngoài
  {
    from: "fed_rate", to: "fx_rate", sign: 1, lag: 1, strength: 0.5,
    mechanism: "Fed tăng lãi suất thì USD mạnh lên trên toàn cầu, vốn rút khỏi các nước mới nổi, VND chịu áp lực mất giá.",
    example: "Năm 2022 Fed tăng lãi suất nhanh nhất trong 40 năm, tỷ giá VND/USD tăng mạnh vào quý 3 và 4.",
  },
  {
    from: "fed_rate", to: "fdi", sign: -1, lag: 2, strength: 0.15,
    mechanism: "Vốn toàn cầu đắt hơn thì các tập đoàn mở rộng đầu tư ra nước ngoài thận trọng hơn. Tác động lên FDI vào Việt Nam khá yếu vì FDI chủ yếu theo chiến lược dài hạn.",
  },
  {
    from: "oil_price", to: "cpi", sign: 1, lag: 1, strength: 0.4,
    mechanism: "Xăng dầu nằm trực tiếp trong rổ CPI và là chi phí vận tải, sản xuất của hầu hết hàng hóa khác.",
    example: "Năm 2022 giá dầu Brent bình quân gần 100 USD/thùng, giá xăng trong nước có lúc vượt 30.000 đồng/lít.",
  },
  // Tỷ giá
  {
    from: "fx_rate", to: "net_exports", sign: 1, lag: 2, strength: 0.3,
    mechanism: "VND mất giá thì hàng Việt Nam rẻ hơn với người mua nước ngoài, hàng nhập khẩu đắt hơn, xuất khẩu ròng có xu hướng tăng. Hiệu ứng ở Việt Nam bị giảm bớt vì xuất khẩu cần nhiều nguyên liệu nhập khẩu.",
  },
  {
    from: "fx_rate", to: "cpi", sign: 1, lag: 1, strength: 0.3,
    mechanism: "VND mất giá thì xăng dầu, nguyên liệu, máy móc nhập khẩu tính bằng VND đắt hơn, đẩy giá trong nước lên.",
  },
  // Tài khóa
  {
    from: "gov_spending", to: "gdp_growth", sign: 1, lag: 1, strength: 0.4,
    mechanism: "Chi tiêu của Nhà nước là một phần trực tiếp của tổng cầu (chữ G trong GDP).",
  },
  {
    from: "gov_spending", to: "fiscal_balance", sign: -1, lag: 1, strength: 0.6,
    mechanism: "Chi nhiều hơn mà thu không đổi thì ngân sách thâm hụt nhiều hơn.",
  },
  {
    from: "fiscal_balance", to: "public_debt", sign: -1, lag: 1, strength: 0.6,
    mechanism: "Thâm hụt phải bù bằng vay nợ (chủ yếu phát hành trái phiếu chính phủ), nên ngân sách càng âm thì nợ công càng tăng.",
    example: "Giai đoạn 2012–2016 thâm hụt khoảng 5–6% GDP mỗi năm, nợ công tăng từ 38% lên gần 48% GDP.",
  },
  {
    from: "gdp_growth", to: "fiscal_balance", sign: 1, lag: 1, strength: 0.3,
    mechanism: "Kinh tế tăng trưởng thì thu thuế tăng, ngân sách bớt thâm hụt. Kinh tế suy yếu thì ngược lại.",
  },
  // Tổng cầu tới GDP
  {
    from: "consumption", to: "gdp_growth", sign: 1, lag: 1, strength: 0.5,
    mechanism: "Tiêu dùng là phần lớn nhất của tổng cầu, chiếm hơn một nửa GDP.",
  },
  {
    from: "investment", to: "gdp_growth", sign: 1, lag: 1, strength: 0.5,
    mechanism: "Đầu tư vừa là tổng cầu ngay lúc chi tiền, vừa tạo ra năng lực sản xuất cho tương lai.",
  },
  {
    from: "net_exports", to: "gdp_growth", sign: 1, lag: 1, strength: 0.4,
    mechanism: "Xuất khẩu ròng là phần (X − M) của tổng cầu. Với một nền kinh tế rất mở như Việt Nam, xuất khẩu là động lực tăng trưởng chính.",
  },
  // FDI và đối ngoại
  {
    from: "fdi", to: "investment", sign: 1, lag: 1, strength: 0.4,
    mechanism: "Vốn FDI giải ngân chính là đầu tư xây nhà máy, mua máy móc trong nước.",
  },
  {
    from: "fdi", to: "net_exports", sign: 1, lag: 3, strength: 0.3,
    mechanism: "Nhà máy FDI cần vài năm để đi vào hoạt động, sau đó tạo ra phần lớn kim ngạch xuất khẩu của Việt Nam.",
    example: "Samsung bắt đầu đầu tư lớn ở Bắc Ninh năm 2008, đến giữa thập niên 2010 điện thoại đã thành mặt hàng xuất khẩu số một.",
  },
  {
    from: "fdi", to: "reserves", sign: 1, lag: 1, strength: 0.4,
    mechanism: "Nhà đầu tư nước ngoài mang USD vào đổi sang VND để chi tiêu, NHNN có thể mua lượng USD đó vào dự trữ.",
  },
  {
    from: "net_exports", to: "current_account", sign: 1, lag: 1, strength: 0.8,
    mechanism: "Thương mại hàng hóa và dịch vụ là phần lớn nhất của cán cân vãng lai.",
  },
  {
    from: "current_account", to: "reserves", sign: 1, lag: 1, strength: 0.5,
    mechanism: "Thặng dư vãng lai nghĩa là có nhiều USD chảy vào hơn chảy ra, NHNN có thể mua vào làm dự trữ.",
    example: "Thặng dư vãng lai liên tục giúp dự trữ tăng từ khoảng 25 tỷ USD (2012) lên gần 110 tỷ USD (2021).",
  },
  {
    from: "reserves", to: "fx_rate", sign: -1, lag: 1, strength: 0.3,
    mechanism: "Dự trữ dồi dào thì NHNN có nhiều USD để bán ra khi cần giữ giá VND, thị trường cũng bớt lo VND mất giá.",
  },
  // Kết quả
  {
    from: "gdp_growth", to: "unemployment", sign: -1, lag: 1, strength: 0.4,
    mechanism: "Doanh nghiệp sản xuất nhiều hơn thì tuyển thêm người (quy luật Okun). Ở Việt Nam quan hệ này yếu vì khu vực phi chính thức lớn.",
  },
  {
    from: "gdp_growth", to: "cpi", sign: 1, lag: 2, strength: 0.3,
    mechanism: "Tổng cầu tăng nhanh hơn khả năng sản xuất thì giá cả bị kéo lên (lạm phát do cầu kéo).",
  },
  {
    from: "unemployment", to: "cpi", sign: -1, lag: 2, strength: 0.15,
    mechanism: "Thất nghiệp thấp thì lao động khan hiếm, lương tăng, chi phí và giá tăng theo (đường cong Phillips). Ở Việt Nam quan hệ này khá yếu.",
  },
  // Vòng phản hồi
  {
    from: "cpi", to: "policy_rate", sign: 1, lag: 1, strength: 0.5,
    mechanism: "Khi lạm phát vượt mục tiêu, NHNN tăng lãi suất để hãm lại. Đây là vòng phản hồi: kết quả quay lại điều chỉnh công cụ.",
    example: "Năm 2011 lạm phát lên gần 19%, NHNN đưa lãi suất tái cấp vốn từ 9% lên 15%.",
  },
  {
    from: "fx_rate", to: "policy_rate", sign: 1, lag: 1, strength: 0.3,
    mechanism: "Khi VND mất giá quá nhanh, NHNN có thể tăng lãi suất để giữ tỷ giá, kể cả khi lạm phát chưa cao.",
  },
];

const K = (from: string, to: string, sign: 1 | -1, mechanism: string): Link => ({ from, to, sign, lag: 1, strength: 0.4, mechanism, concept: true });

LINKS.push(
  K("tax", "consumption", -1, "Thuế cao hơn thì người dân còn ít tiền để chi tiêu."),
  K("tax", "investment", -1, "Thuế thu nhập doanh nghiệp cao hơn làm lợi nhuận sau thuế giảm, doanh nghiệp đầu tư ít đi."),
  K("tax", "fiscal_balance", 1, "Thu thuế nhiều hơn thì ngân sách bớt thâm hụt."),
  K("public_investment", "investment", 1, "Đầu tư công là một phần của tổng đầu tư (I)."),
  K("public_investment", "fiscal_balance", -1, "Chi đầu tư công nhiều hơn thì ngân sách thâm hụt hơn, nếu thu không đổi."),
  K("policy_rate", "interbank", 1, "Lãi suất điều hành là \"trần\" và \"sàn\" của hành lang lãi suất, kéo lãi suất liên ngân hàng theo."),
  K("omo", "interbank", 1, "NHNN hút tiền về thì ngân hàng thiếu tiền hơn, phải vay nhau với lãi suất cao hơn."),
  K("omo", "m2", -1, "Hút tiền về làm lượng tiền đồng trong hệ thống giảm."),
  K("interbank", "lending_rate", 1, "Ngân hàng vay nhau đắt hơn thì cũng cho khách hàng vay đắt hơn."),
  K("interbank", "fx_rate", -1, "Lãi suất tiền đồng ngắn hạn cao thì giữ tiền đồng có lợi hơn, giảm áp lực mua đô la."),
  K("credit_quota", "credit", 1, "Room tín dụng rộng hơn thì ngân hàng được phép cho vay nhiều hơn."),
  K("lending_rate", "real_rate", 1, "Lãi suất danh nghĩa tăng thì lãi suất thực tăng, nếu lạm phát không đổi."),
  K("cpi", "real_rate", -1, "Lạm phát tăng mà lãi suất không đổi thì lãi suất thực giảm."),
  K("real_rate", "credit", -1, "Lãi suất thực cao nghĩa là vay thực sự đắt, nên người ta vay ít đi."),
  K("cpi", "expectations", 1, "Giá đã tăng nhanh một thời gian thì mọi người bắt đầu tin giá sẽ còn tăng."),
  K("expectations", "cpi", 1, "Ai cũng tin giá sẽ tăng thì đòi tăng lương, tăng giá bán trước, và lạm phát tự thành hiện thực."),
  K("policy_rate", "expectations", -1, "NHNN tăng lãi suất kịp thời cho thấy quyết tâm chống lạm phát, giúp kỳ vọng hạ nhiệt."),
  K("confidence", "consumption", 1, "Lạc quan về tương lai thì người dân dám chi tiêu hơn."),
  K("confidence", "investment", 1, "Doanh nghiệp tin vào đơn hàng tương lai thì mới mở rộng sản xuất."),
  K("cpi", "confidence", -1, "Giá cả tăng nhanh làm người dân lo lắng, thu hẹp chi tiêu."),
  K("remittances", "current_account", 1, "Kiều hối là một khoản thu ngoại tệ trong cán cân vãng lai."),
  K("remittances", "consumption", 1, "Gia đình nhận kiều hối có thêm tiền để chi tiêu, xây nhà."),
  K("fed_rate", "fpi", -1, "Fed tăng lãi suất thì tiền rút khỏi thị trường mới nổi về Mỹ."),
  K("fpi", "fx_rate", -1, "Vốn ngoại vào thì đô la dồi dào hơn, tiền đồng lên giá. Vốn rút ra thì ngược lại."),
  K("fpi", "reserves", 1, "Vốn ngoại vào nhiều thì NHNN có thể mua thêm đô la làm dự trữ."),
);

/** Các quan hệ dùng trong mô phỏng và thử thách (không gồm quan hệ của thẻ khái niệm). */
export const SIM_LINKS = LINKS.filter((l) => !l.concept);

export function linkKey(l: { from: string; to: string }) {
  return `${l.from}->${l.to}`;
}
