import type { LibraryCategory } from "./maps";

/** Một lựa chọn của người học. recap ghi lại điều họ đã thấy, lead là câu nối sang bước tiếp theo. */
export type AlgorithmOption = { label: string; next: string; recap: string; lead: string };

export type CheckStep = {
  id: string;
  kind: "check";
  title: string;
  prompt: string;
  /** Chỉ số để người học tự đối chiếu trên biểu đồ */
  metricId: string;
  /** Nên nhìn vào đâu nếu muốn kiểm tra ngoài ứng dụng */
  whereToLook: string;
  options: AlgorithmOption[];
};

export type ConclusionStep = {
  id: string;
  kind: "conclusion";
  title: string;
  /** Chuyện gì có lẽ đang xảy ra, kể bằng lời thường */
  story: string;
  /** Chính sách có thể phản ứng ra sao */
  policyView: string;
  /** Nên theo dõi gì tiếp */
  watchNext: string[];
  caseSlug?: string;
};

export type AlgorithmStep = CheckStep | ConclusionStep;

export type Algorithm = {
  id: string;
  name: string;
  hint: string;
  category: LibraryCategory;
  /** Cây câu hỏi và bản đồ đi cùng */
  treeId: string;
  mapId: string;
  start: string;
  steps: AlgorithmStep[];
};

export const ALGORITHMS: Algorithm[] = [
  {
    id: "lam-phat",
    name: "Chẩn đoán: vì sao lạm phát tăng?",
    hint: "Trả lời từng câu bằng cách nhìn số liệu thật. Mỗi câu trả lời mở ra bước tiếp theo, và cuối cùng bạn có một lời giải thích.",
    category: "tien-te",
    treeId: "lam-phat",
    mapId: "lam-phat",
    start: "cpi",
    steps: [
      {
        id: "cpi",
        kind: "check",
        title: "Lạm phát có thật sự đang tăng không?",
        prompt: "Trước khi tìm nguyên nhân, hãy kiểm tra xem có chuyện gì cần giải thích không. So năm gần nhất trên biểu đồ với vài năm trước đó.",
        metricId: "cpi",
        whereToLook: "Cục Thống kê công bố CPI đầu mỗi tháng, báo chí thường đưa tin ngay trong ngày.",
        options: [
          { label: "Có, cao hơn rõ rệt", next: "oil", recap: "Lạm phát đang cao hơn trước", lead: "Vậy là có chuyện cần giải thích. Bắt đầu từ nguyên nhân dễ thấy nhất: giá xăng dầu." },
          { label: "Không, vẫn như cũ hoặc thấp hơn", next: "ket-on-dinh", recap: "Lạm phát không tăng", lead: "Vậy thì chưa có gì đáng lo." },
        ],
      },
      {
        id: "oil",
        kind: "check",
        title: "Giá dầu thế giới có tăng mạnh không?",
        prompt: "Xăng dầu nằm trực tiếp trong giỏ hàng của mỗi gia đình, lại là chi phí chở mọi loại hàng hóa. Nhìn đường giá dầu ở năm gần nhất.",
        metricId: "oil_price",
        whereToLook: "Giá dầu Brent được công bố hằng ngày trên các trang tài chính. Giá xăng trong nước được điều chỉnh định kỳ.",
        options: [
          { label: "Có, tăng mạnh", next: "ket-chi-phi", recap: "Giá dầu tăng mạnh", lead: "Đã có một thủ phạm rõ ràng." },
          { label: "Không", next: "fx", recap: "Giá dầu không tăng nhiều", lead: "Giá dầu không phải lý do chính. Giờ hãy nhìn sang tiền đồng." },
        ],
      },
      {
        id: "fx",
        kind: "check",
        title: "Tiền đồng có đang mất giá nhanh không?",
        prompt: "Con số trên biểu đồ là số đồng cần để mua 1 đô la. Đường đi lên nghĩa là tiền đồng yếu đi, và hàng nhập khẩu đắt lên. Nó có dốc hơn bình thường không?",
        metricId: "fx_rate",
        whereToLook: "Ngân hàng Nhà nước công bố tỷ giá trung tâm mỗi ngày, các ngân hàng niêm yết giá mua bán đô la trên trang của họ.",
        options: [
          { label: "Có, dốc hơn hẳn", next: "ket-ty-gia", recap: "Tiền đồng mất giá nhanh", lead: "Tiền đồng yếu đi đã đủ để đẩy giá hàng nhập khẩu lên." },
          { label: "Không, vẫn đều đều", next: "credit", recap: "Tiền đồng ổn định", lead: "Chi phí từ bên ngoài có vẻ không phải lý do. Vậy thử xem tiền trong nước có đang nhiều lên không." },
        ],
      },
      {
        id: "credit",
        kind: "check",
        title: "Tiền vay có đang tăng rất nhanh không?",
        prompt: "Khi ngân hàng cho vay nhiều, nền kinh tế có thêm tiền để chi. Đường này cho biết dư nợ cho vay lớn cỡ nào so với quy mô nền kinh tế. Nó có vọt lên không?",
        metricId: "credit",
        whereToLook: "Ngân hàng Nhà nước công bố tốc độ tăng tín dụng định kỳ, báo chí thường so với chỉ tiêu cả năm.",
        options: [
          { label: "Có, vọt lên", next: "gdp", recap: "Tín dụng tăng rất nhanh", lead: "Có nhiều tiền hơn trong nền kinh tế. Câu hỏi tiếp theo: số tiền đó có làm ra thêm hàng hóa không?" },
          { label: "Không", next: "expectations", recap: "Tín dụng không tăng bất thường", lead: "Tiền không nhiều lên bất thường. Còn lại một khả năng khó thấy hơn: tâm lý của mọi người." },
        ],
      },
      {
        id: "gdp",
        kind: "check",
        title: "Kinh tế có đang tăng trưởng rất mạnh không?",
        prompt: "Nếu tiền nhiều lên cùng lúc với sản xuất tăng mạnh, nền kinh tế đang chạy nóng. Nếu tiền nhiều mà sản xuất không tăng, tiền đang đi vào chỗ khác.",
        metricId: "gdp_growth",
        whereToLook: "Cục Thống kê công bố số GDP theo quý.",
        options: [
          { label: "Có, tăng mạnh", next: "ket-cau-keo", recap: "Kinh tế tăng trưởng mạnh", lead: "Tiền nhiều và mọi người mua nhiều cùng lúc." },
          { label: "Không, khá yếu", next: "ket-tien-nhieu", recap: "Kinh tế không tăng mạnh", lead: "Tiền nhiều lên nhưng hàng hóa không tăng tương ứng." },
        ],
      },
      {
        id: "expectations",
        kind: "check",
        title: "Mọi người có đang lo giá sẽ còn tăng không?",
        prompt: "Con số này không có biểu đồ, vì Việt Nam chưa có số đo chính thức. Hãy nhìn quanh: người ta có đổ xô mua vàng, đô la hay tích trữ hàng không? Người bán có tăng giá trước khi chi phí tăng không?",
        metricId: "expectations",
        whereToLook: "Giá vàng và đô la tự do, tin tức về xếp hàng mua vàng, câu chuyện của người bán hàng quanh bạn.",
        options: [
          { label: "Có, thấy rõ", next: "ket-ky-vong", recap: "Mọi người lo giá còn tăng", lead: "Tâm lý có vẻ đang tự đẩy giá lên." },
          { label: "Không thấy gì đặc biệt", next: "ket-tam-thoi", recap: "Không thấy dấu hiệu tích trữ", lead: "Đã đi qua các nguyên nhân lớn mà chưa thấy cái nào rõ ràng." },
        ],
      },
      {
        id: "ket-on-dinh",
        kind: "conclusion",
        title: "Hiện chưa có đợt tăng giá nào cần giải thích",
        story: "Giá vẫn tăng, nhưng không nhanh hơn trước. Nếu bạn vẫn thấy đồ đắt lên, có thể đó là những món riêng trong giỏ hàng của bạn, vì con số công bố là mức trung bình của cả nước.",
        policyView: "Khi lạm phát thấp và ổn định, Ngân hàng Nhà nước có nhiều dư địa hơn để lo cho tăng trưởng.",
        watchNext: ["CPI tháng tới", "Giá xăng và thực phẩm", "Lạm phát cơ bản"],
      },
      {
        id: "ket-chi-phi",
        kind: "conclusion",
        title: "Có lẽ đây là lạm phát do chi phí đẩy",
        story: "Xăng đắt hơn thì chở hàng đắt hơn, và giá cả tăng dù không ai mua nhiều hơn. Loại lạm phát này khó chịu vì tăng lãi suất không làm giá dầu giảm. Giá dầu không quyết định tất cả: năm 2022 giá dầu Brent lên khoảng 99 USD nhưng CPI cả năm chỉ khoảng 3,2%, cho thấy cú sốc này có thể được đỡ bớt.",
        policyView: "Nhà nước thường xoay xở bằng thuế phí xăng dầu và điều hành giá. Nâng lãi suất chỉ hợp lý khi giá đã lan sang lương và các mặt hàng khác.",
        watchNext: ["Giá dầu Brent", "Giá xăng trong nước", "Giá vận tải và thực phẩm tháng sau"],
      },
      {
        id: "ket-ty-gia",
        kind: "conclusion",
        title: "Có lẽ giá đang được nhập khẩu qua tỷ giá",
        story: "Việt Nam mua từ nước ngoài rất nhiều nguyên liệu, máy móc và xăng dầu. Khi đô la đắt lên, những thứ này đắt theo, rồi giá bán trong nước tăng sau đó.",
        policyView: "Ngân hàng Nhà nước có thể bán đô la từ dự trữ và tăng lãi suất để đỡ tiền đồng, đổi lại vay vốn sẽ đắt hơn.",
        watchNext: ["Tỷ giá VND/USD", "Lãi suất Fed", "Dự trữ ngoại hối"],
        caseSlug: "2022-fed-trai-phieu",
      },
      {
        id: "ket-cau-keo",
        kind: "conclusion",
        title: "Có lẽ nền kinh tế đang chạy quá nóng",
        story: "Tiền vay dễ, người dân và doanh nghiệp chi mạnh, trong khi nhà máy chỉ làm ra được chừng ấy hàng. Người bán thấy khách đông nên tăng giá. Đây là lạm phát do cầu kéo, giống giai đoạn trước năm 2008.",
        policyView: "Đây là lúc lãi suất phát huy tác dụng: tăng lãi suất và siết tín dụng làm cầu nguội đi, nhưng tăng trưởng cũng chậm lại.",
        watchNext: ["Tốc độ tăng tín dụng", "Lãi suất điều hành", "Tiêu dùng và đầu tư"],
        caseSlug: "2008-lam-phat",
      },
      {
        id: "ket-tien-nhieu",
        kind: "conclusion",
        title: "Có lẽ tiền nhiều lên mà hàng hóa không tăng theo",
        story: "Tiền được bơm ra nhưng không làm ra thêm bao nhiêu hàng. Mỗi đồng vì thế mua được ít hơn. Nếu nghe tin lãi suất giảm, tín dụng tăng mà sản xuất vẫn trì trệ, hãy nghĩ tới tình huống này.",
        policyView: "Phải siết tiền lại dù kinh tế chưa khỏe, nên đây là lựa chọn rất khó. Việt Nam từng chọn ưu tiên ổn định trong năm 2011.",
        watchNext: ["Cung tiền M2", "Tín dụng", "Hiệu quả sử dụng vốn của nền kinh tế"],
        caseSlug: "2011-nghi-quyet-11",
      },
      {
        id: "ket-ky-vong",
        kind: "conclusion",
        title: "Có lẽ niềm tin đang tự đẩy giá lên",
        story: "Khi ai cũng tin giá sẽ tăng, người lao động đòi tăng lương, người bán tăng giá trước, người dân mua trữ. Niềm tin biến thành lạm phát thật. Năm 2008 và 2011, nhiều người đã đổ xô mua vàng và đô la vì lý do này.",
        policyView: "Điều quan trọng nhất là lấy lại niềm tin: Ngân hàng Nhà nước phải nói rõ và làm đúng điều đã nói, thường kèm một động thái mạnh về lãi suất.",
        watchNext: ["Giá vàng và đô la tự do", "Phát biểu của Ngân hàng Nhà nước", "Lương và giá bán"],
        caseSlug: "2008-lam-phat",
      },
      {
        id: "ket-tam-thoi",
        kind: "conclusion",
        title: "Có lẽ chỉ là đợt tăng tạm thời",
        story: "Khi không nguyên nhân lớn nào rõ ràng, đợt tăng thường đến từ vài mặt hàng riêng lẻ: giá lợn, giá gạo, một đợt tăng giá điện, học phí, hoặc mùa Tết. Những đợt này thường tự lắng xuống.",
        policyView: "Thường không cần phản ứng mạnh. Hãy theo dõi xem giá có lan sang nhiều mặt hàng khác không.",
        watchNext: ["Lạm phát cơ bản", "Giá thực phẩm", "Giá các dịch vụ do Nhà nước quản lý"],
      },
    ],
  },
];

export const ALGORITHM_BY_ID = Object.fromEntries(ALGORITHMS.map((a) => [a.id, a])) as Record<string, Algorithm>;
