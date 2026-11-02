export type CaseStep = {
  title: string;
  body: string[];
  nodes: string[];
  links: [string, string][];
  chart: { id: string; label: string }[];
  years: [number, number];
};

export type CaseStudy = {
  slug: string;
  title: string;
  period: string;
  summary: string;
  steps: CaseStep[];
  questions: { q: string; a: string }[];
  /** Cú sốc trong mô phỏng gần nhất với giai đoạn này */
  simulatePreset?: string;
  simulateNote?: string;
  sources: { label: string; url: string }[];
};

const WB = { label: "World Bank, World Development Indicators", url: "https://data.worldbank.org/country/vietnam" };
const IMF = { label: "IMF, World Economic Outlook", url: "https://www.imf.org/external/datamapper/profile/VNM" };

export const CASES: CaseStudy[] = [
  {
    slug: "2008-lam-phat",
    title: "Tăng trưởng nóng và lạm phát 23%",
    period: "2007–2008",
    summary: "Gia nhập WTO kéo theo dòng vốn ngoại khổng lồ, tiền và tín dụng tăng vọt, lạm phát lên mức cao nhất trong hơn một thập kỷ. NHNN phải đưa lãi suất lên 15%.",
    steps: [
      {
        title: "Vốn ngoại ồ ạt đổ vào",
        body: [
          "Tháng 1/2007 Việt Nam chính thức trở thành thành viên WTO. Nhà đầu tư nước ngoài kỳ vọng rất lớn: vốn FDI giải ngân tăng từ 3,6% GDP năm 2006 lên 8,7% năm 2007 và 9,7% năm 2008. Vốn gián tiếp cũng đổ vào thị trường chứng khoán.",
          "Để giữ tỷ giá ổn định, NHNN mua lượng USD này vào. Dự trữ ngoại hối tăng từ 13,4 lên 23,5 tỷ USD chỉ trong năm 2007. Nhưng mỗi USD mua vào, NHNN phải trả bằng VND mới tạo ra.",
        ],
        nodes: ["fdi", "reserves"],
        links: [["fdi", "reserves"], ["fdi", "investment"]],
        chart: [{ id: "fdi", label: "FDI (% GDP)" }, { id: "reserves", label: "Dự trữ (tỷ USD)" }],
        years: [2006, 2008],
      },
      {
        title: "Tiền và tín dụng tăng vọt",
        body: [
          "Lượng VND bơm ra cộng với ngân hàng cho vay dễ dãi làm cung tiền M2 tăng 49% trong năm 2007, cao hơn hẳn mức khoảng 30% của ba năm trước đó. Dư nợ tín dụng tăng từ 65% lên 86% GDP chỉ trong một năm.",
          "Vốn vay chảy vào đầu tư (tỷ lệ đầu tư lên 39,6% GDP), bất động sản và chứng khoán. Nền kinh tế tăng 7,1%, trông rất tốt, nhưng đang \"quá nóng\": cầu tăng nhanh hơn khả năng sản xuất.",
        ],
        nodes: ["credit", "m2", "investment"],
        links: [["credit", "m2"], ["credit", "investment"], ["investment", "gdp_growth"]],
        chart: [{ id: "m2_growth", label: "Tăng trưởng M2 (%)" }, { id: "private_credit", label: "Tín dụng (% GDP)" }],
        years: [2006, 2008],
      },
      {
        title: "Lạm phát bùng nổ",
        body: [
          "Như dự đoán của quan hệ M2 → lạm phát (có độ trễ), CPI tăng từ 8,3% năm 2007 lên 23,1% năm 2008. Giá dầu thế giới cũng lên đỉnh giữa năm 2008, bình quân cả năm 97 USD/thùng, đổ thêm dầu vào lửa.",
          "Cùng lúc, nhập khẩu tăng vọt: xuất khẩu ròng âm 13,6% GDP và thâm hụt vãng lai lên gần 11% GDP năm 2008. Nền kinh tế đang tiêu nhiều hơn làm ra rất nhiều.",
        ],
        nodes: ["m2", "oil_price", "cpi", "net_exports", "current_account"],
        links: [["m2", "cpi"], ["oil_price", "cpi"], ["net_exports", "current_account"]],
        chart: [{ id: "cpi", label: "Lạm phát CPI (%)" }, { id: "m2_growth", label: "Tăng trưởng M2 (%)" }],
        years: [2007, 2008],
      },
      {
        title: "NHNN phanh gấp",
        body: [
          "Từ tháng 5/2008, NHNN đưa lãi suất tái cấp vốn lên 13%, rồi 15%. Lãi suất cho vay bình quân năm 2008 lên 15,8%. Dù vậy lãi suất thực vẫn âm khoảng 5,6% vì lạm phát còn cao hơn.",
          "Phanh gấp có tác dụng nhưng cũng có giá: tăng trưởng giảm còn 5,7%. Chỉ vài tháng sau, Lehman Brothers sụp đổ (9/2008) và NHNN phải quay ngoắt sang nới lỏng, hạ dần lãi suất về 7% vào đầu năm 2009. Xem tiếp ở case study 2009.",
        ],
        nodes: ["policy_rate", "lending_rate", "credit", "cpi", "gdp_growth"],
        links: [["cpi", "policy_rate"], ["policy_rate", "lending_rate"], ["lending_rate", "credit"]],
        chart: [{ id: "lending_rate", label: "Lãi suất cho vay (%)" }, { id: "cpi", label: "Lạm phát CPI (%)" }],
        years: [2008, 2009],
      },
    ],
    questions: [
      {
        q: "Lãi suất cho vay năm 2008 là 15,8% nhưng lãi suất thực lại âm. Điều đó nghĩa là gì với người đi vay?",
        a: "Lãi suất thực ≈ lãi suất danh nghĩa trừ lạm phát. Khi giá cả tăng nhanh hơn lãi phải trả, người vay thực chất trả lại ít sức mua hơn lúc vay. Vay để mua hàng hóa, nhà đất vẫn có lời, nên lãi suất danh nghĩa 15% vẫn chưa đủ để hãm cầu vay.",
      },
      {
        q: "Vì sao vốn ngoại đổ vào lại làm tăng cung tiền trong nước?",
        a: "Nhà đầu tư mang USD vào và cần VND để chi tiêu. Nếu NHNN không mua USD thì VND sẽ lên giá mạnh. Để giữ tỷ giá, NHNN mua USD và trả bằng VND mới, làm tăng lượng tiền cơ sở. NHNN có thể \"hút\" lại bằng cách bán tín phiếu (gọi là trung hòa), nhưng năm 2007 việc này không đủ mạnh.",
      },
      {
        q: "Trên bản đồ, đâu là chuỗi đi từ FDI tới lạm phát?",
        a: "FDI → Dự trữ ngoại hối (NHNN mua USD) → tiền bơm ra. Bản đồ của app đơn giản hóa chuỗi này qua tín dụng và M2 → lạm phát. Bạn có thể dùng \"Tìm đường đi\" trên trang Bản đồ để xem các chuỗi khác, ví dụ FDI → Đầu tư → GDP → Lạm phát.",
      },
    ],
    simulatePreset: "rate-up",
    simulateNote: "Mô phỏng cú sốc NHNN tăng lãi suất: tín dụng, M2, GDP và lạm phát cùng giảm. Thực tế năm 2008 lạm phát giảm rất nhanh từ cuối năm, nhưng một phần lớn là nhờ giá dầu và hàng hóa thế giới lao dốc sau khủng hoảng, không chỉ nhờ lãi suất.",
    sources: [WB, IMF, { label: "Bovagau: lịch sử thắt chặt và nới lỏng tiền tệ", url: "https://bovagau.vn/nhin-lai-nhung-lan-viet-nam-that-chat-roi-noi-long-tien-te-lai-suat-dieu-hanh-tung-len-15-lam-phat-van-gan-23-5242" }],
  },
  {
    slug: "2009-kich-cau",
    title: "Gói kích cầu giữa khủng hoảng toàn cầu",
    period: "2009–2010",
    summary: "Khủng hoảng tài chính toàn cầu làm xuất khẩu và FDI sụt giảm. Việt Nam nới lỏng cả tiền tệ lẫn tài khóa, giữ được tăng trưởng trên 5%, nhưng cũng gieo mầm cho đợt lạm phát năm 2011.",
    steps: [
      {
        title: "Cú sốc từ bên ngoài",
        body: [
          "Sau khi Lehman Brothers sụp đổ tháng 9/2008, thế giới rơi vào suy thoái. Các nước giàu mua ít hàng hơn: xuất khẩu của Việt Nam giảm từ 70% xuống 63% GDP năm 2009. FDI giải ngân giảm từ 9,7% xuống 7,2% GDP.",
          "Giá dầu bình quân năm giảm từ 97 xuống 62 USD/thùng, giúp lạm phát hạ nhiệt nhanh: CPI năm 2009 chỉ còn 6,7%. Lo ngại lớn nhất chuyển từ lạm phát sang suy thoái.",
        ],
        nodes: ["net_exports", "fdi", "oil_price", "cpi"],
        links: [["oil_price", "cpi"], ["net_exports", "gdp_growth"]],
        chart: [{ id: "exports", label: "Xuất khẩu (% GDP)" }, { id: "oil_price", label: "Giá dầu Brent (USD)" }],
        years: [2008, 2009],
      },
      {
        title: "Nới lỏng tiền tệ: hỗ trợ lãi suất 4%",
        body: [
          "NHNN hạ lãi suất tái cấp vốn từ 15% về 7% trong vòng vài tháng. Đầu năm 2009, Chính phủ còn trực tiếp trả hộ doanh nghiệp 4%/năm tiền lãi cho các khoản vay ngắn hạn (chương trình hỗ trợ lãi suất).",
          "Vốn vay rẻ chưa từng có: dư nợ tín dụng tăng từ 83% lên 103% GDP chỉ trong năm 2009, M2 tăng 26%. Kênh truyền dẫn tín dụng hoạt động rất mạnh.",
        ],
        nodes: ["policy_rate", "lending_rate", "credit", "m2"],
        links: [["policy_rate", "lending_rate"], ["lending_rate", "credit"], ["credit", "m2"]],
        chart: [{ id: "private_credit", label: "Tín dụng (% GDP)" }, { id: "lending_rate", label: "Lãi suất cho vay (%)" }],
        years: [2008, 2010],
      },
      {
        title: "Nới lỏng tài khóa",
        body: [
          "Chính phủ tăng chi, giãn và giảm một số loại thuế. Cân bằng ngân sách chuyển từ thâm hụt 0,4% GDP năm 2008 sang thâm hụt 4,8% GDP năm 2009. Nợ công tăng từ 31% lên 36% GDP.",
          "Đây là ví dụ về chính sách tài khóa ngược chu kỳ: Nhà nước chi nhiều hơn đúng lúc khu vực tư nhân và nước ngoài chi ít đi.",
        ],
        nodes: ["gov_spending", "fiscal_balance", "public_debt"],
        links: [["gov_spending", "fiscal_balance"], ["fiscal_balance", "public_debt"], ["gov_spending", "gdp_growth"]],
        chart: [{ id: "fiscal_balance", label: "Cân bằng ngân sách (% GDP)" }, { id: "public_debt", label: "Nợ công (% GDP)" }],
        years: [2008, 2010],
      },
      {
        title: "Thành công và cái giá phải trả",
        body: [
          "Tăng trưởng 5,4% năm 2009 và 6,4% năm 2010, thuộc nhóm cao trên thế giới giữa khủng hoảng.",
          "Nhưng lượng tiền và tín dụng khổng lồ vẫn còn đó. Lạm phát tăng trở lại: 9,2% năm 2010 rồi 18,7% năm 2011. Nhập siêu và lòng tin vào VND yếu đi khiến dự trữ ngoại hối giảm từ 23,9 tỷ USD (2008) xuống 12,5 tỷ USD (2010), và tỷ giá VND/USD bình quân tăng từ 16.300 lên 20.500 đồng (2008–2011). Bài học: kích cầu quá đà và kéo dài sẽ quay lại thành lạm phát.",
        ],
        nodes: ["m2", "cpi", "reserves", "fx_rate", "gdp_growth"],
        links: [["m2", "cpi"], ["fx_rate", "cpi"], ["reserves", "fx_rate"]],
        chart: [{ id: "cpi", label: "Lạm phát CPI (%)" }, { id: "reserves", label: "Dự trữ (tỷ USD)" }],
        years: [2009, 2011],
      },
    ],
    questions: [
      {
        q: "Vì sao Chính phủ chọn hỗ trợ lãi suất trực tiếp, thay vì chỉ để NHNN hạ lãi suất?",
        a: "Hạ lãi suất điều hành truyền qua ngân hàng thương mại chậm và không chắc chắn. Hỗ trợ trực tiếp 4% làm chi phí vay của doanh nghiệp giảm ngay. Nhược điểm là khó kiểm soát vốn rẻ chảy vào đâu, và tốn ngân sách.",
      },
      {
        q: "Tăng trưởng 2009–2010 vẫn tốt. Vậy gói kích cầu có thành công không?",
        a: "Thành công trong ngắn hạn: tránh được suy thoái. Thất bại ở chỗ không rút về kịp: tín dụng và M2 tiếp tục tăng nhanh trong 2010, dẫn tới lạm phát 18,7% năm 2011 và phải thắt chặt rất mạnh (xem case study 2011). Đánh giá một chính sách cần nhìn cả độ trễ.",
      },
    ],
    simulatePreset: "spend-up",
    simulateNote: "Mô phỏng tăng chi tiêu công: GDP tăng nhanh, nhưng ngân sách thâm hụt và nợ công tăng, lạm phát tăng với độ trễ. Thực tế 2009 còn có cú hạ lãi suất rất mạnh cùng lúc, nên hiệu ứng lên lạm phát lớn hơn mô phỏng này.",
    sources: [WB, IMF],
  },
  {
    slug: "2011-nghi-quyet-11",
    title: "Nghị quyết 11 và cái giá của ổn định",
    period: "2011–2013",
    summary: "Lạm phát lên gần 19%, Chính phủ chọn ưu tiên ổn định vĩ mô thay vì tăng trưởng. Tín dụng bị siết, tăng trưởng chậm lại, nợ xấu lộ ra, nhưng cán cân đối ngoại được cải thiện rõ rệt.",
    steps: [
      {
        title: "Lạm phát quay lại",
        body: [
          "Hậu quả của gói kích cầu cộng với giá hàng hóa thế giới tăng (dầu Brent bình quân 112 USD năm 2011) đẩy CPI lên 18,7%. VND mất giá liên tục, người dân chuyển sang giữ vàng và USD.",
        ],
        nodes: ["cpi", "oil_price", "m2", "fx_rate"],
        links: [["m2", "cpi"], ["oil_price", "cpi"], ["fx_rate", "cpi"]],
        chart: [{ id: "cpi", label: "Lạm phát CPI (%)" }, { id: "oil_price", label: "Giá dầu Brent (USD)" }],
        years: [2010, 2011],
      },
      {
        title: "Ưu tiên ổn định: siết tiền và cắt đầu tư công",
        body: [
          "Tháng 2/2011, Chính phủ ban hành Nghị quyết 11/NQ-CP, ưu tiên kiềm chế lạm phát và ổn định vĩ mô. NHNN đưa lãi suất tái cấp vốn từ 9% lên 12% (3/2011) rồi 15% (cuối năm 2011). Chính phủ cắt giảm đầu tư công.",
          "Tăng trưởng M2 giảm từ 29,7% xuống 11,9%. Tín dụng giảm từ 90% xuống 80% GDP. Lãi suất cho vay bình quân lên 17%. Tỷ lệ đầu tư giảm từ 37% xuống 32% GDP.",
        ],
        nodes: ["policy_rate", "lending_rate", "credit", "m2", "investment"],
        links: [["cpi", "policy_rate"], ["policy_rate", "lending_rate"], ["lending_rate", "credit"], ["credit", "investment"]],
        chart: [{ id: "m2_growth", label: "Tăng trưởng M2 (%)" }, { id: "lending_rate", label: "Lãi suất cho vay (%)" }],
        years: [2010, 2012],
      },
      {
        title: "Tăng trưởng chậm, nợ xấu lộ ra",
        body: [
          "Lạm phát hạ về 9,1% năm 2012 và 6,6% năm 2013. Cái giá là tăng trưởng giảm còn 5,5% năm 2012 và 2013, thấp hơn hẳn mức 6–7% quen thuộc.",
          "Khi tiền không còn rẻ, nhiều khoản vay của giai đoạn trước (đặc biệt vào bất động sản) không trả được. Nợ xấu ngân hàng trở thành vấn đề lớn, dẫn tới việc thành lập Công ty Quản lý tài sản VAMC năm 2013 để mua lại nợ xấu.",
        ],
        nodes: ["gdp_growth", "cpi", "credit"],
        links: [["investment", "gdp_growth"], ["gdp_growth", "cpi"]],
        chart: [{ id: "gdp_growth", label: "Tăng trưởng GDP (%)" }, { id: "cpi", label: "Lạm phát CPI (%)" }],
        years: [2011, 2013],
      },
      {
        title: "Mặt tích cực: cân bằng đối ngoại",
        body: [
          "Cầu trong nước yếu đi nên nhập khẩu giảm, trong khi xuất khẩu của các nhà máy FDI mới (như điện thoại) tăng. Xuất khẩu ròng chuyển từ âm 2,9% GDP (2011) sang dương 3,7% GDP (2012), lần đầu xuất siêu sau nhiều năm. Cán cân vãng lai thặng dư 4,8% GDP.",
          "Nhờ đó dự trữ ngoại hối tăng gần gấp đôi, từ 13,5 lên 25,6 tỷ USD, và tỷ giá ổn định trở lại. Đây là nền tảng cho giai đoạn ổn định sau đó.",
        ],
        nodes: ["net_exports", "current_account", "reserves", "fx_rate"],
        links: [["net_exports", "current_account"], ["current_account", "reserves"], ["reserves", "fx_rate"]],
        chart: [{ id: "net_exports", label: "Xuất khẩu ròng (% GDP)" }, { id: "reserves", label: "Dự trữ (tỷ USD)" }],
        years: [2011, 2013],
      },
    ],
    questions: [
      {
        q: "Ổn định vĩ mô và tăng trưởng mâu thuẫn với nhau ở đâu?",
        a: "Trong ngắn hạn, để hạ lạm phát phải giảm tổng cầu (siết tín dụng, cắt chi tiêu), nên tăng trưởng chậm lại. Về dài hạn chúng bổ trợ nhau: lạm phát thấp, tỷ giá ổn định giúp doanh nghiệp và nhà đầu tư lên kế hoạch dài hạn.",
      },
      {
        q: "Vì sao xuất siêu năm 2012 không hoàn toàn là tin tốt?",
        a: "Một phần xuất siêu đến từ nhập khẩu giảm do cầu trong nước yếu (doanh nghiệp ít đầu tư, nhập ít máy móc), chứ không chỉ do xuất khẩu mạnh. Cần nhìn vào nguyên nhân chứ không chỉ con số.",
      },
    ],
    simulatePreset: "rate-up",
    simulateNote: "Mô phỏng NHNN tăng lãi suất. Thực tế năm 2011 còn có hạn mức tăng trưởng tín dụng và cắt đầu tư công cùng lúc, nên tín dụng và đầu tư giảm mạnh hơn mô phỏng.",
    sources: [WB, IMF, { label: "Báo Chính phủ: NHNN điều chỉnh lãi suất tái cấp vốn (2011)", url: "https://baochinhphu.vn/ngan-hang-nha-nuoc-dieu-chinh-lai-suat-tai-cap-von-10265087.htm" }],
  },
  {
    slug: "2016-ty-gia-trung-tam",
    title: "Nhân dân tệ phá giá và cơ chế tỷ giá trung tâm",
    period: "2015–2016",
    summary: "Giá dầu sụp đổ đưa lạm phát về gần 0, nhưng Trung Quốc bất ngờ phá giá đồng nhân dân tệ và Fed bắt đầu tăng lãi suất. Việt Nam chuyển sang cơ chế tỷ giá trung tâm linh hoạt hơn.",
    steps: [
      {
        title: "Giá dầu sụp, lạm phát thấp kỷ lục",
        body: [
          "Giá dầu Brent bình quân giảm từ 99 USD (2014) xuống 53 USD (2015) và 45 USD (2016). CPI năm 2015 chỉ tăng 0,6%, gần như không có lạm phát.",
          "Mặt trái: thu ngân sách từ dầu thô giảm. Thâm hụt ngân sách khoảng 5% GDP, nợ công lên gần 48% GDP năm 2016, mức cao nhất trong dữ liệu.",
        ],
        nodes: ["oil_price", "cpi", "fiscal_balance", "public_debt"],
        links: [["oil_price", "cpi"], ["fiscal_balance", "public_debt"]],
        chart: [{ id: "oil_price", label: "Giá dầu Brent (USD)" }, { id: "cpi", label: "Lạm phát CPI (%)" }],
        years: [2014, 2016],
      },
      {
        title: "Cú sốc tỷ giá từ Trung Quốc và Mỹ",
        body: [
          "Ngày 11/8/2015, Trung Quốc, đối tác thương mại lớn nhất của Việt Nam, bất ngờ phá giá đồng nhân dân tệ. Hàng Trung Quốc rẻ hơn, gây áp lực lên hàng Việt Nam cạnh tranh trực tiếp. Tháng 12/2015, Fed tăng lãi suất lần đầu sau gần 10 năm, USD mạnh lên.",
          "NHNN phản ứng bằng cách điều chỉnh tỷ giá và nới biên độ giao dịch nhiều lần trong năm 2015.",
        ],
        nodes: ["fed_rate", "fx_rate", "net_exports"],
        links: [["fed_rate", "fx_rate"], ["fx_rate", "net_exports"]],
        chart: [{ id: "fx_rate", label: "Tỷ giá VND/USD" }, { id: "fed_rate", label: "Lãi suất Fed (%)" }],
        years: [2015, 2016],
      },
      {
        title: "Cơ chế tỷ giá trung tâm",
        body: [
          "Từ ngày 4/1/2016, NHNN công bố tỷ giá trung tâm mỗi ngày, tính theo diễn biến của một rổ 8 đồng tiền của các đối tác lớn, cùng cung cầu trong nước. Ngân hàng được giao dịch trong biên độ ±3% quanh tỷ giá trung tâm.",
          "Thay vì giữ cố định rồi phá giá một lần lớn (gây sốc như những năm 2009–2011), tỷ giá giờ điều chỉnh từng chút một. Tỷ giá bình quân năm 2016 chỉ tăng khoảng 1% so với 2015.",
        ],
        nodes: ["fx_rate", "policy_rate"],
        links: [["fx_rate", "policy_rate"], ["reserves", "fx_rate"]],
        chart: [{ id: "fx_rate", label: "Tỷ giá VND/USD" }],
        years: [2015, 2017],
      },
      {
        title: "Kết quả: dự trữ tăng mạnh",
        body: [
          "Tỷ giá ổn định hơn, xuất siêu và FDI đều đặn giúp NHNN mua vào ngoại tệ. Dự trữ tăng từ 28 tỷ USD (2015) lên 37 tỷ USD (2016) và 78 tỷ USD (2019). Tăng trưởng giữ được 6,7–7%.",
        ],
        nodes: ["reserves", "current_account", "fdi", "gdp_growth"],
        links: [["current_account", "reserves"], ["fdi", "reserves"]],
        chart: [{ id: "reserves", label: "Dự trữ (tỷ USD)" }, { id: "gdp_growth", label: "Tăng trưởng GDP (%)" }],
        years: [2015, 2019],
      },
    ],
    questions: [
      {
        q: "Giá dầu giảm là tốt hay xấu với Việt Nam?",
        a: "Cả hai. Tốt cho người tiêu dùng và doanh nghiệp vì chi phí giảm, lạm phát thấp. Xấu cho ngân sách vì nguồn thu từ dầu thô giảm. Đây là lý do một chỉ số có thể \"tốt\" hay \"xấu\" tùy góc nhìn.",
      },
      {
        q: "Vì sao điều chỉnh tỷ giá từng chút tốt hơn giữ cố định rồi phá giá một lần?",
        a: "Khi tỷ giá bị giữ cố định quá lâu, thị trường đoán trước sẽ có đợt phá giá, nên mọi người đổ xô mua USD, làm áp lực càng lớn và NHNN mất dự trữ. Điều chỉnh từng chút làm giảm kỳ vọng phá giá đột ngột và giảm đầu cơ.",
      },
    ],
    simulatePreset: "fed-up",
    simulateNote: "Mô phỏng Fed tăng lãi suất: VND mất giá, NHNN có xu hướng tăng lãi suất theo, đầu tư giảm nhẹ. Năm 2016 tác động thực tế nhỏ vì Fed tăng rất chậm và lạm phát Việt Nam đang thấp.",
    sources: [WB, IMF],
  },
  {
    slug: "2020-covid",
    title: "COVID-19: tăng trưởng thấp nhất nhiều thập kỷ",
    period: "2020–2021",
    summary: "Đại dịch làm tăng trưởng giảm còn dưới 3% hai năm liền. NHNN hạ lãi suất ba lần, nhưng chính xuất khẩu mới là phao cứu sinh của nền kinh tế.",
    steps: [
      {
        title: "Cú sốc kép: cung và cầu cùng giảm",
        body: [
          "Giãn cách xã hội làm nhà máy ngừng chạy (cú sốc cung) và người dân ngừng chi tiêu (cú sốc cầu). Tăng trưởng GDP giảm từ 7,4% (2019) xuống 2,9% (2020) và 2,6% (2021), khi đợt dịch Delta khiến miền Nam phải giãn cách kéo dài vào quý 3/2021.",
          "Tỷ lệ thất nghiệp tăng từ 1,7% lên 2,4% năm 2021. Con số nhỏ nhưng đằng sau là hàng triệu lao động mất việc hoặc giảm giờ làm, nhiều người phải về quê.",
        ],
        nodes: ["gdp_growth", "unemployment", "consumption"],
        links: [["consumption", "gdp_growth"], ["gdp_growth", "unemployment"]],
        chart: [{ id: "gdp_growth", label: "Tăng trưởng GDP (%)" }, { id: "unemployment", label: "Thất nghiệp (%)" }],
        years: [2019, 2021],
      },
      {
        title: "NHNN hạ lãi suất ba lần",
        body: [
          "NHNN hạ lãi suất tái cấp vốn từ 6% xuống 5% (17/3/2020), 4,5% (13/5/2020) và 4% (1/10/2020), mức thấp nhất trong lịch sử. Ngân hàng được phép cơ cấu lại thời hạn trả nợ cho khách hàng bị ảnh hưởng.",
          "Điều đáng chú ý: lãi suất cho vay bình quân năm gần như không đổi (7,7% năm 2019, 7,7% năm 2020, 7,8% năm 2021). Khi doanh nghiệp không có đơn hàng, vốn rẻ cũng không làm họ vay thêm. Kênh truyền dẫn bị \"tắc\".",
        ],
        nodes: ["policy_rate", "lending_rate", "credit"],
        links: [["policy_rate", "lending_rate"], ["lending_rate", "credit"]],
        chart: [{ id: "policy_rate", label: "Lãi suất điều hành (%)" }, { id: "lending_rate", label: "Lãi suất cho vay (%)" }],
        years: [2019, 2021],
      },
      {
        title: "Tài khóa: hỗ trợ có kiềm chế",
        body: [
          "Thâm hụt ngân sách tăng từ 0,4% lên 2,9% GDP năm 2020. So với nhiều nước, gói hỗ trợ của Việt Nam khá nhỏ, nên nợ công gần như không tăng (41% GDP) rồi giảm còn 39% năm 2021.",
          "Đầu năm 2022, Quốc hội thông qua Chương trình phục hồi và phát triển kinh tế - xã hội (Nghị quyết 43/2022/QH15) với quy mô khoảng 350 nghìn tỷ đồng để hỗ trợ giai đoạn mở cửa trở lại.",
        ],
        nodes: ["gov_spending", "fiscal_balance", "public_debt"],
        links: [["gov_spending", "fiscal_balance"], ["fiscal_balance", "public_debt"]],
        chart: [{ id: "fiscal_balance", label: "Cân bằng ngân sách (% GDP)" }, { id: "public_debt", label: "Nợ công (% GDP)" }],
        years: [2019, 2022],
      },
      {
        title: "Xuất khẩu là phao cứu sinh",
        body: [
          "Khi người dân các nước giàu ở nhà, họ mua nhiều điện thoại, máy tính, đồ gỗ hơn. Xuất khẩu tăng từ 84% lên 94% GDP năm 2021. Cán cân vãng lai thặng dư 4,3% GDP năm 2020, dự trữ ngoại hối tăng lên kỷ lục gần 110 tỷ USD năm 2021.",
          "Lạm phát vẫn thấp (3,2% năm 2020, 1,8% năm 2021) vì cầu trong nước yếu. Khi mở cửa, tăng trưởng bật lên 8,5% năm 2022.",
        ],
        nodes: ["net_exports", "current_account", "reserves", "cpi"],
        links: [["net_exports", "gdp_growth"], ["net_exports", "current_account"], ["current_account", "reserves"]],
        chart: [{ id: "exports", label: "Xuất khẩu (% GDP)" }, { id: "reserves", label: "Dự trữ (tỷ USD)" }],
        years: [2019, 2022],
      },
    ],
    questions: [
      {
        q: "Vì sao hạ lãi suất không cứu được tăng trưởng năm 2020–2021?",
        a: "Chính sách tiền tệ tác động qua cầu vay vốn. Khi nguyên nhân suy giảm là giãn cách (không thể mở cửa hàng, không có khách), doanh nghiệp không vay thêm dù lãi suất rẻ. Lúc này chính sách tài khóa nhắm trực tiếp vào người bị ảnh hưởng thường hiệu quả hơn.",
      },
      {
        q: "Thất nghiệp chỉ tăng từ 1,7% lên 2,4%. Vì sao chỉ số này không phản ánh hết mức độ khó khăn?",
        a: "Ở Việt Nam nhiều người làm việc phi chính thức. Người mất việc thường chuyển sang làm việc khác thu nhập thấp hơn hoặc về quê, không được tính là thất nghiệp. Nên xem thêm thiếu việc làm và thu nhập bình quân.",
      },
    ],
    simulatePreset: "rate-down",
    simulateNote: "Mô phỏng NHNN hạ lãi suất: tín dụng, đầu tư và GDP đều tăng. Đây chính là chỗ mô hình sai với thực tế 2020: mô hình giả định doanh nghiệp luôn phản ứng với lãi suất, nhưng trong đại dịch kênh tín dụng bị tắc.",
    sources: [WB, IMF, { label: "CafeF: Ấn tượng năm 2020, lãi suất giảm kỷ lục", url: "https://cafef.vn/an-tuong-nam-2020-lai-suat-giam-ky-luc-20201223101737451.chn" }],
  },
  {
    slug: "2022-fed-trai-phieu",
    title: "Fed tăng lãi suất và cơn bão trái phiếu doanh nghiệp",
    period: "2022–2023",
    summary: "Fed tăng lãi suất nhanh nhất trong 40 năm, VND chịu áp lực, NHNN bán dự trữ và tăng lãi suất. Cùng lúc, thị trường trái phiếu doanh nghiệp và bất động sản gần như đóng băng.",
    steps: [
      {
        title: "Fed tăng lãi suất mạnh nhất 40 năm",
        body: [
          "Lạm phát Mỹ lên trên 9% giữa năm 2022. Fed đưa lãi suất từ gần 0% lên khoảng 4,5% vào cuối năm 2022 và trên 5% năm 2023 (bình quân năm: 0,1% năm 2021, 1,7% năm 2022, 5,0% năm 2023). Giá dầu cũng lên gần 100 USD/thùng sau khi Nga tấn công Ukraine.",
          "USD mạnh lên so với hầu hết các đồng tiền. Vốn rút khỏi các thị trường mới nổi.",
        ],
        nodes: ["fed_rate", "oil_price", "fx_rate"],
        links: [["fed_rate", "fx_rate"], ["oil_price", "cpi"]],
        chart: [{ id: "fed_rate", label: "Lãi suất Fed (%)" }, { id: "oil_price", label: "Giá dầu Brent (USD)" }],
        years: [2021, 2023],
      },
      {
        title: "NHNN giữ giá VND",
        body: [
          "NHNN bán ngoại tệ để giữ tỷ giá: dự trữ giảm từ khoảng 109 tỷ USD (2021) xuống 87 tỷ USD (2022). Tháng 10/2022 NHNN nới biên độ tỷ giá từ ±3% lên ±5%.",
          "NHNN tăng lãi suất tái cấp vốn hai lần, lên 5% (23/9/2022) và 6% (25/10/2022). Đây là ví dụ rõ về mũi tên \"tỷ giá → lãi suất điều hành\": lạm phát Việt Nam lúc đó chỉ khoảng 3–4%, nhưng NHNN vẫn phải tăng lãi suất vì áp lực tỷ giá.",
        ],
        nodes: ["reserves", "fx_rate", "policy_rate"],
        links: [["reserves", "fx_rate"], ["fx_rate", "policy_rate"], ["policy_rate", "fx_rate"]],
        chart: [{ id: "reserves", label: "Dự trữ (tỷ USD)" }, { id: "fx_rate", label: "Tỷ giá VND/USD" }],
        years: [2021, 2023],
      },
      {
        title: "Trái phiếu doanh nghiệp và bất động sản đóng băng",
        body: [
          "Năm 2022, các vụ sai phạm trong phát hành trái phiếu doanh nghiệp (như Tân Hoàng Minh tháng 4 và Vạn Thịnh Phát tháng 10) làm niềm tin sụp đổ. Doanh nghiệp bất động sản, vốn dựa nhiều vào trái phiếu, không thể huy động vốn mới để trả nợ cũ.",
          "Lãi suất cho vay bình quân tăng từ 8,0% (2022) lên 9,3% (2023). Lãi suất thực lên 7%. Tháng 3/2023, Chính phủ ban hành Nghị định 08/2023/NĐ-CP cho phép doanh nghiệp đàm phán giãn, hoãn trả nợ trái phiếu.",
        ],
        nodes: ["lending_rate", "credit", "investment"],
        links: [["lending_rate", "credit"], ["credit", "investment"]],
        chart: [{ id: "lending_rate", label: "Lãi suất cho vay (%)" }, { id: "real_rate", label: "Lãi suất thực (%)" }],
        years: [2021, 2023],
      },
      {
        title: "Đảo chiều năm 2023",
        body: [
          "Khi áp lực tỷ giá dịu bớt, NHNN quay sang hạ lãi suất bốn lần trong năm 2023, đưa lãi suất tái cấp vốn từ 6% về 4,5% (19/6/2023).",
          "Tăng trưởng vẫn giảm từ 8,5% (2022) xuống 5,0% (2023) vì xuất khẩu yếu (từ 93% xuống 87% GDP) khi các nước giàu giảm mua. Lạm phát giữ khoảng 3,2%, trong mục tiêu. Cán cân vãng lai lại thặng dư lớn (6% GDP), một phần vì nhập khẩu giảm mạnh hơn xuất khẩu. Năm 2024 tăng trưởng hồi phục lên 7%.",
        ],
        nodes: ["policy_rate", "net_exports", "gdp_growth", "current_account"],
        links: [["net_exports", "gdp_growth"], ["net_exports", "current_account"]],
        chart: [{ id: "gdp_growth", label: "Tăng trưởng GDP (%)" }, { id: "exports", label: "Xuất khẩu (% GDP)" }],
        years: [2022, 2024],
      },
    ],
    questions: [
      {
        q: "Lạm phát Việt Nam năm 2022 chỉ khoảng 3%. Vậy vì sao NHNN vẫn tăng lãi suất?",
        a: "Vì áp lực tỷ giá. Khi lãi suất Fed tăng mạnh, chênh lệch lãi suất VND và USD thu hẹp, người dân và doanh nghiệp có xu hướng giữ USD. NHNN dùng cả hai công cụ: bán dự trữ và tăng lãi suất VND. Lãi suất điều hành không chỉ phục vụ mục tiêu lạm phát.",
      },
      {
        q: "Trên bản đồ, chuỗi nào nối lãi suất Fed với tăng trưởng GDP Việt Nam?",
        a: "Ví dụ: Fed → Tỷ giá → Lãi suất điều hành → Lãi suất cho vay → Tín dụng → Đầu tư → GDP. Hãy thử \"Tìm đường đi\" trên trang Bản đồ từ Lãi suất Fed tới Tăng trưởng GDP để xem đầy đủ các chuỗi.",
      },
    ],
    simulatePreset: "fed-up",
    simulateNote: "Mô phỏng Fed tăng lãi suất: VND mất giá, NHNN tăng lãi suất, dự trữ giảm, tín dụng và đầu tư giảm nhẹ. Mô hình không có kênh \"niềm tin\" của thị trường trái phiếu, nên bỏ sót cú sốc lớn nhất của năm 2022.",
    sources: [
      WB,
      IMF,
      { label: "Thư viện Pháp luật: Quyết định 1606/QĐ-NHNN (2022)", url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/ho-tro-phap-luat/chinh-sach-moi/42743/quyet-dinh-1606-qd-nhnn-tang-lai-suat-tai-cap-von-tai-chiet-khau" },
      { label: "VNUBW: NHNN giảm lãi suất điều hành lần thứ 4 năm 2023", url: "https://vnubw.org.vn/tin-tuc/t8363/nhnn-tiep-tuc-giam-lai-suat-dieu-hanh-lan-thu-4-trong-nam-2023" },
    ],
  },
];

export const CASE_BY_SLUG = Object.fromEntries(CASES.map((c) => [c.slug, c])) as Record<string, CaseStudy>;

export function casesMentioning(indicatorId: string): CaseStudy[] {
  return CASES.filter((c) => c.steps.some((s) => s.nodes.includes(indicatorId)));
}
