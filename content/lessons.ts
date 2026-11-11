import type { WidgetId } from "./feynman";

export type Quiz = {
  q: string;
  options: string[];
  answer: number;
  explain: string;
};

/**
 * Một nhịp của bài kể theo phố Cầu Tre. think dừng bài lại để người học đoán trước khi đọc tiếp.
 * formula luôn đứng trước ví dụ của khái niệm đó: công thức chính xác trước, câu chuyện minh họa sau.
 */
export type Beat =
  | { kind: "scene"; text: string }
  | { kind: "formula"; name: string; expr: string[]; terms?: [string, string][]; note?: string }
  | { kind: "think"; q: string; options: string[]; answer: number; reveal: string }
  | { kind: "widget"; id: WidgetId }
  | { kind: "real"; text: string };

export type Lesson = {
  slug: string;
  title: string;
  minutes: number;
  question: string;
  /** Bài kiểu cũ: các ý chính. Bài có beats không dùng. */
  ideas?: string[];
  indicators: string[];
  quiz: Quiz[];
  /** Việc nên làm ngay sau bài */
  tryIt: { label: string; href: string };
  /** Bài đã viết theo phố Cầu Tre. Bài chưa có beats hiện theo kiểu cũ. */
  beats?: Beat[];
  /** Một câu nhắc tập trước */
  recap?: string;
  /** Câu hỏi treo sang tập sau */
  hook?: string;
  /** Trận cuối của chặng này */
  boss?: { label: string; href: string };
};

export const LESSONS: Lesson[] = [
  {
    slug: "ba-con-so",
    title: "Ba con số ai cũng nhắc tới",
    minutes: 4,
    question: "Làm sao biết nền kinh tế đang khỏe hay yếu?",
    indicators: ["gdp_growth", "cpi", "unemployment"],
    beats: [
      { kind: "scene", text: "Đây là **phố Cầu Tre**. Cô Ba bán bánh mì ở đầu phố. Anh Tư làm thợ xây. Chú Sáu chạy xe tải giao hàng. Bà Bảy đã về hưu, sống nhờ tiền lãi sổ tiết kiệm. Từ giờ, ta sẽ dùng con phố này để minh họa cả nền kinh tế." },
      { kind: "scene", text: "Muốn biết một nền kinh tế khỏe hay yếu, người ta nhìn ba con số: làm ra có nhiều hơn không, giá có tăng nhanh không, mọi người có việc không. Đây là cách tính chính xác của hai con số đầu." },
      {
        kind: "formula",
        name: "Tăng trưởng GDP",
        expr: ["Tăng trưởng GDP (%) = (GDP thực năm nay − GDP thực năm trước) ÷ GDP thực năm trước × 100"],
        terms: [["GDP thực", "giá trị mọi hàng hóa, dịch vụ làm ra trong năm, tính theo giá của một năm gốc cố định, nên nó không tăng chỉ vì giá tăng"]],
      },
      {
        kind: "formula",
        name: "Lạm phát",
        expr: ["Lạm phát (%) = (CPI năm nay − CPI năm trước) ÷ CPI năm trước × 100"],
        terms: [["CPI", "chỉ số giá tiêu dùng: giá của một giỏ hàng cố định mà một gia đình tiêu biểu mua"]],
      },
      { kind: "scene", text: "Giờ áp dụng thử. Giả sử cả phố chỉ làm ra bánh mì, nên GDP thực chính là số ổ bánh và giỏ hàng chỉ có một ổ. Năm ngoái tiệm cô Ba làm 100 ổ, năm nay 107 ổ: tăng trưởng = (107 − 100) ÷ 100 × 100 = **7%**. Năm ngoái mỗi ổ 10.000 đồng, năm nay 10.400 đồng: lạm phát = (10.400 − 10.000) ÷ 10.000 × 100 = **4%**." },
      {
        kind: "think",
        q: "Tiền bán bánh của cô Ba tăng từ 1.000.000 lên 1.112.800 đồng, tức tăng 11,3%. Vậy phố đã làm ra nhiều hơn 11,3% phải không?",
        options: ["Đúng, tiền nhiều hơn 11,3% nghĩa là làm ra nhiều hơn 11,3%", "Không, tăng trưởng vẫn là 7%, phần còn lại do giá tăng"],
        answer: 1,
        reveal: "Công thức tăng trưởng dùng GDP thực nên đã loại phần giá. Tiền bán bánh là con số danh nghĩa, gồm cả lượng lẫn giá: 1,07 × 1,04 = 1,1128, tức tăng khoảng 11,3%.",
      },
      {
        kind: "formula",
        name: "Tỷ lệ thất nghiệp",
        expr: ["Tỷ lệ thất nghiệp (%) = Số người thất nghiệp ÷ Lực lượng lao động × 100"],
        terms: [
          ["Lực lượng lao động", "người đang có việc cộng người đang tìm việc"],
          ["Người thất nghiệp", "người muốn làm, đang tìm việc mà chưa có việc"],
        ],
      },
      { kind: "scene", text: "Trên phố có 100 người muốn đi làm, 98 người có việc. Hai người còn lại đang tìm việc, nên tỷ lệ thất nghiệp = 2 ÷ 100 × 100 = **2%**." },
      { kind: "widget", id: "bakery" },
      { kind: "real", text: "Thay phố Cầu Tre bằng cả Việt Nam, ta có [[gdp_growth|tăng trưởng GDP]], [[cpi|lạm phát CPI]] và [[unemployment|thất nghiệp]]. Kinh tế vĩ mô là nhìn cả nền kinh tế như một khối như vậy. Việt Nam thường tăng trưởng 6–7%/năm. Năm 2025 tăng khoảng 8%, lạm phát khoảng 3,3%." },
      { kind: "real", text: "Lạm phát vừa phải (khoảng 2–4%) là bình thường. Quá cao như năm 2008 (23%) thì tiền mất giá nhanh, và người như bà Bảy khổ nhất. Điều khó là tăng trưởng và lạm phát thường kéo nhau: phố làm ăn quá nóng thì giá cũng dễ tăng." },
    ],
    hook: "Năm nay phố làm thêm được 7 ổ bánh. Nhưng ai đã mua 7 ổ đó?",
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
    indicators: ["consumption", "investment", "gov_spending", "net_exports"],
    recap: "Tập trước, phố Cầu Tre làm ra 107 ổ bánh, nhiều hơn năm ngoái 7%.",
    beats: [
      { kind: "scene", text: "Cái gì làm ra cũng phải có người mua. Vì vậy GDP còn được tính bằng cách cộng tiền của mọi người mua lại." },
      {
        kind: "formula",
        name: "GDP theo phía chi tiêu",
        expr: ["GDP = C + I + G + (X − M)"],
        terms: [
          ["C", "tiêu dùng của hộ gia đình"],
          ["I", "đầu tư: nhà xưởng, máy móc, hạ tầng, nhà ở, hàng tồn kho"],
          ["G", "chi tiêu dùng của Nhà nước, như lương công chức"],
          ["X", "xuất khẩu: hàng làm ở trong nước, người nước ngoài mua"],
          ["M", "nhập khẩu: hàng làm ở nước ngoài. Phải trừ vì nó đã nằm trong C, I, G hoặc X nhưng không do trong nước làm ra"],
        ],
      },
      { kind: "scene", text: "Cô Ba xem lại sổ bán hàng và thấy đủ cả công thức. Các gia đình trên phố mua bánh ăn sáng là **C**. Chính cô bỏ tiền mua lò nướng mới để sang năm làm nhiều bánh hơn là **I**. Trường học trả lương cô giáo là **G**. Khách nước ngoài đặt bánh là **X**, còn bột mì nhập về là **M**." },
      {
        kind: "think",
        q: "Nhà nước làm một con đường mới qua phố, anh Tư được thuê đi xây. Khoản này tính vào đâu?",
        options: ["G, vì Nhà nước trả tiền", "I, vì con đường dùng lâu dài để làm ra thứ khác"],
        answer: 1,
        reveal: "Con đường giống cái lò của cô Ba: mua hôm nay để dùng nhiều năm. Nên nó là I, dù người trả tiền là Nhà nước. G chỉ gồm những khoản dùng hết trong năm như lương cô giáo.",
      },
      { kind: "widget", id: "gdp-sort" },
      { kind: "scene", text: "Từ nay, mỗi khi nghe tin một chính sách \"thúc đẩy tăng trưởng\", hãy hỏi đúng một câu: nó làm tăng C, I, G hay X − M?" },
      { kind: "real", text: "Ở Việt Nam năm 2025, [[consumption|C]] khoảng 53% GDP, [[investment|I]] khoảng 31%, [[gov_spending|G]] khoảng 9%, và [[net_exports|X − M]] khoảng 6%. Xuất khẩu Việt Nam rất lớn, gần bằng GDP, nhưng nhập khẩu cũng gần như vậy nên phần ròng nhỏ." },
      { kind: "scene", text: "Các con số trên là tỷ trọng, cộng lại xấp xỉ 100% GDP, chứ không cộng thành tốc độ tăng 8%. Muốn biết mỗi nhóm góp bao nhiêu vào tăng trưởng, phải dùng công thức khác." },
      {
        kind: "formula",
        name: "Đóng góp vào tăng trưởng",
        expr: ["Đóng góp (điểm %) = Tỷ trọng năm trước trong GDP × Tốc độ tăng của chính nhóm đó"],
      },
      { kind: "real", text: "Năm 2025, tiêu dùng chiếm 53,6% GDP năm trước và tăng 7,3%, nên đóng góp = 0,536 × 7,3 ≈ 3,9 điểm % trong 8% tăng trưởng." },
      { kind: "widget", id: "contributions" },
    ],
    hook: "Năm sau cả phố có thêm tiền và ai cũng muốn mua bánh, nhưng lò của cô Ba chỉ nướng được chừng ấy. Giá bánh sẽ ra sao?",
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
    slug: "vi-sao-gia-tang",
    title: "Hai cơn sốt giá",
    minutes: 6,
    question: "Giá tăng vì mọi người mua nhiều hơn, hay vì làm ra đắt hơn?",
    indicators: ["cpi", "m2", "oil_price"],
    recap: "Tập trước, ta biết bốn nhóm người mua: C, I, G và X − M.",
    beats: [
      {
        kind: "formula",
        name: "Tổng cầu",
        expr: ["Tổng cầu = C + I + G + (X − M)"],
        note: "Cùng bốn nhóm ở [[bai:ai-tieu-tien|tập trước]], nhưng ở đây là số tiền mọi người muốn chi ở mỗi mức giá, không phải số đã chi.",
      },
      {
        kind: "formula",
        name: "Phương trình trao đổi",
        expr: ["M × V = P × Y", "Tính theo tốc độ: %P ≈ %M + %V − %Y"],
        terms: [
          ["M", "lượng tiền trong nền kinh tế. Chữ M này khác M nhập khẩu ở công thức GDP"],
          ["V", "vòng quay của tiền: một đồng được tiêu bao nhiêu lần trong năm"],
          ["P", "mức giá chung"],
          ["Y", "lượng hàng hóa, dịch vụ thực làm ra"],
        ],
        note: "Nếu V không đổi, tiền tăng nhanh hơn hàng bao nhiêu thì giá tăng chừng đó. Đây là khung để suy nghĩ, ngoài đời V thay đổi và tác động đến có độ trễ.",
      },
      { kind: "scene", text: "Áp dụng vào phố. Năm nay lương tăng, ngân hàng cho vay dễ, cả phố rủng rỉnh, nên tổng cầu tăng. Nhưng lò của cô Ba chỉ nướng được từng ấy ổ, tức M tăng mà Y đứng yên." },
      {
        kind: "think",
        q: "Sáng nào bánh cũng hết sớm, khách còn xếp hàng. Cô Ba sẽ làm gì?",
        options: ["Giữ nguyên giá cho công bằng", "Tăng giá, vì trả cao hơn khách vẫn mua"],
        answer: 1,
        reveal: "Không phải cô tham, mà vì người muốn mua nhiều hơn số bánh có. Giá tăng vì **cầu kéo**: tiền đuổi theo hàng. Tiền tăng nhanh hơn hàng thì mỗi đồng mua được ít đi.",
      },
      { kind: "widget", id: "money-bread" },
      {
        kind: "formula",
        name: "Giá bán của một sản phẩm",
        expr: ["Giá bán = Chi phí làm ra một sản phẩm + Tiền lời trên một sản phẩm"],
        note: "Chi phí tăng mà người bán muốn giữ tiền lời thì giá bán phải tăng, dù không có thêm người mua.",
      },
      { kind: "scene", text: "Năm sau mọi chuyện khác hẳn. Khách không đông hơn, nhưng giá dầu thế giới tăng vọt. Chú Sáu đổ xăng đắt hơn nên tăng cước giao bột. Cô Ba nhập bột đắt hơn, ga đắt hơn." },
      {
        kind: "think",
        q: "Cô Ba cũng tăng giá bánh. Lần này khách có đông hơn không?",
        options: ["Có, giá tăng tức là nhiều người mua hơn", "Không, cô tăng giá dù khách vẫn thế, thậm chí ít đi"],
        answer: 1,
        reveal: "Đây là **chi phí đẩy**: giá tăng vì làm ra đắt hơn, không phải vì người mua đông hơn. Một cú đánh vào phía làm ra hàng như vậy gọi là **cú sốc cung**.",
      },
      { kind: "scene", text: "Hai cơn sốt trông giống nhau trên hóa đơn của bà Bảy, nhưng khác nhau ở một điểm rất quan trọng. Cầu kéo đi cùng phố làm ăn sôi động, tiệm đông khách, anh Tư thừa việc. Chi phí đẩy đi cùng phố khó khăn: giá lên mà khách vắng đi." },
      { kind: "real", text: "Năm 2007, lượng tiền ([[m2|M2]]) tăng khoảng 49% trong khi hàng làm ra chỉ tăng khoảng 7%. Năm 2008 lạm phát lên 23%. Cũng năm đó [[oil_price|giá dầu]] bình quân 97 USD/thùng đổ thêm dầu vào lửa, nên hai cơn sốt đã đến cùng một lúc." },
      { kind: "real", text: "Thử công thức: nếu V đứng yên, 49 − 7 = 42%. Lạm phát thực tế năm sau là 23%, thấp hơn nhiều. Khoảng cách đó là vì V không đứng yên, nên công thức cho biết hướng đi và lý do, không phải một con số dự báo chính xác." },
    ],
    hook: "Cả phố đang sốt giá. Ai có quyền hạ nhiệt, và làm bằng cách nào?",
    quiz: [
      {
        q: "Năm nay lương tăng mạnh, khách đông, tiệm nào cũng hết hàng và tăng giá. Đây là loại nào?",
        options: ["Cầu kéo", "Chi phí đẩy"],
        answer: 0,
        explain: "Người mua nhiều hơn số hàng có sẵn, nên giá bị kéo lên từ phía cầu.",
      },
      {
        q: "Bão làm mất mùa, rau đắt gấp đôi dù mọi người không ăn nhiều hơn. Đây là loại nào?",
        options: ["Cầu kéo", "Cú sốc cung, làm giá tăng theo kiểu chi phí đẩy"],
        answer: 1,
        explain: "Hàng làm ra ít đi và đắt hơn trong khi nhu cầu không đổi, nên đây là cú đánh vào phía cung.",
      },
      {
        q: "Làm sao phân biệt nhanh hai cơn sốt khi đọc tin?",
        options: ["Xem giá tăng bao nhiêu", "Xem kinh tế đang sôi động hay đang khó khăn trong lúc giá tăng"],
        answer: 1,
        explain: "Giá tăng cùng làm ăn sôi động thường là cầu kéo. Giá tăng mà làm ăn khó khăn thường là chi phí đẩy.",
      },
    ],
    tryIt: { label: "Mở cây câu hỏi: vì sao giá cả tăng?", href: "/cay/lam-phat" },
  },
  {
    slug: "lai-suat",
    title: "Ngân hàng Nhà nước và lãi suất",
    minutes: 6,
    question: "Vì sao cả nước chú ý mỗi khi Ngân hàng Nhà nước đổi lãi suất?",
    indicators: ["policy_rate", "lending_rate", "credit", "m2"],
    recap: "Tập trước, phố gặp hai cơn sốt giá: cầu kéo và chi phí đẩy.",
    beats: [
      { kind: "scene", text: "Tiền cũng đi thuê được như nhà: mượn một năm thì trả thêm một khoản, và khoản đó tính theo phần trăm gọi là **lãi suất**. Nói gọn, lãi suất là **tiền thuê tiền**." },
      {
        kind: "formula",
        name: "Tiền lãi",
        expr: ["Tiền lãi một năm = Số tiền vay × Lãi suất năm"],
        note: "Đây là công thức cho khoản vay giữ nguyên dư nợ trong năm, chưa tính lãi kép và trả dần.",
      },
      { kind: "scene", text: "Cô Ba muốn vay 200 triệu mua lò thứ hai. Tháng trước lãi 7%, tiền lãi một năm = 200 triệu × 7% = 14 triệu. Sáng nay ngân hàng báo 9%: 200 triệu × 9% = 18 triệu. Mỗi năm thêm **4 triệu**. Lời mỗi ổ 5.000 đồng, tức là thêm 800 ổ bánh mỗi năm chỉ để trả phần lãi tăng." },
      { kind: "scene", text: "Vì sao lãi tăng? Ngân hàng lấy tiền một phần từ người gửi như bà Bảy, một phần từ **Ngân hàng Nhà nước**, giống cửa hàng bán buôn tiền. Khi Ngân hàng Nhà nước tăng giá sỉ (lãi suất điều hành), các ngân hàng cũng tăng giá lẻ (lãi suất cho vay)." },
      {
        kind: "think",
        q: "Cô Ba hoãn mua lò. Cả phố ai cũng tính như cô. Chuyện gì xảy ra tiếp theo?",
        options: ["Không sao, chỉ là một cái lò", "Đầu tư (I) giảm, anh Tư bớt việc, cả phố chi tiêu ít đi", "Giá xăng rẻ đi ngay"],
        answer: 1,
        reveal: "Nhớ [[bai:ai-tieu-tien|tập 2]] không? Cái lò là I. Không ai mua lò, không ai xây thêm, nên anh Tư ít việc, có ít tiền tiêu hơn, và tiệm cô Ba cũng vắng đi. Tổng cầu giảm, nên người bán khó tăng giá hơn.",
      },
      { kind: "scene", text: "Chuỗi cần nhớ: **Ngân hàng Nhà nước tăng lãi suất → vay đắt → vay ít → tín dụng và tiền tăng chậm → chi tiêu giảm → lạm phát giảm**, nhưng tăng trưởng cũng chậm lại. Tín dụng ở đây là tổng số tiền ngân hàng đang cho vay. Hạ lãi suất thì ngược lại. Có một độ trễ: lãi suất đổi hôm nay, vài quý sau mới thấy rõ tác động." },
      { kind: "widget", id: "loan" },
      { kind: "scene", text: "Nhưng lãi suất ghi trên sổ chưa cho biết bạn được hay mất bao nhiêu sức mua. Muốn biết phải trừ lạm phát." },
      {
        kind: "formula",
        name: "Lãi suất thực",
        expr: ["Chính xác: Lãi suất thực = (1 + i) ÷ (1 + π) − 1", "Tính nhanh: Lãi suất thực ≈ i − π"],
        terms: [
          ["i", "lãi suất danh nghĩa, số ghi trên hợp đồng"],
          ["π", "lạm phát trong cùng kỳ"],
        ],
      },
      { kind: "scene", text: "Sổ tiết kiệm của bà Bảy lãi 6%, nhưng năm đó giá chợ tăng 8%. Tính nhanh: 6 − 8 = −2%. Tính chính xác: 1,06 ÷ 1,08 − 1 ≈ −1,9%. Tiền của bà nhiều hơn 6% mà mua được ít hàng hơn, nên bà lỗ gần 2% sức mua." },
      { kind: "widget", id: "real-rate" },
      { kind: "real", text: "Năm 2008 [[lending_rate|lãi suất cho vay]] gần 16% nhưng [[cpi|lạm phát]] 23%, nên trên thực tế tiền vẫn \"rẻ\": vay về mua hàng tích trữ vẫn có lời. Khi nghe tin về [[policy_rate|lãi suất điều hành]], hãy nhớ so nó với lạm phát." },
      {
        kind: "think",
        q: "Bây giờ quay lại [[bai:vi-sao-gia-tang|hai cơn sốt giá]]. Tăng lãi suất hợp với cơn sốt nào hơn?",
        options: ["Cầu kéo, vì nó làm mọi người chi tiêu ít đi", "Chi phí đẩy, vì nó làm xăng rẻ đi"],
        answer: 0,
        reveal: "Lãi suất tác động lên người mua. Nó hạ được cơn sốt cầu kéo. Với cơn sốt do dầu đắt, nó không làm dầu rẻ đi mà chỉ hãm cả phố lại, nên phố trả giá gấp đôi: vừa đắt vừa ế.",
      },
    ],
    hook: "Giờ bạn đã đủ đồ nghề. Dầu thế giới đang tăng, chú Sáu đổ xăng mỗi tuần một giá, và bạn là người phải quyết định.",
    boss: { label: "Trận cuối: Giá dầu tăng vọt", href: "/thu-thach/oil" },
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
