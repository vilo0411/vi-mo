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
  /** Chuỗi riêng khi tốc độ tăng dễ đọc hơn số trên thẻ chỉ số */
  seriesId?: string;
  seriesLabel?: string;
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
  treeId?: string;
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
  {
    id: "tang-truong",
    name: "Chẩn đoán: vì sao tăng trưởng chậm lại?",
    hint: "GDP tăng khi có người chi tiền. Đi qua từng nhóm người chi tiền bằng số liệu thật để tìm xem phần nào đang yếu đi.",
    category: "tang-truong",
    treeId: "tang-truong",
    mapId: "tong-cau",
    start: "gdp",
    steps: [
      {
        id: "gdp",
        kind: "check",
        title: "Kinh tế có thật sự tăng chậm lại không?",
        prompt: "So năm gần nhất với vài năm trước. Lưu ý: tăng trưởng thấp hơn năm trước vẫn là tăng, chỉ là tăng chậm hơn.",
        metricId: "gdp_growth",
        whereToLook: "Cục Thống kê công bố số GDP theo quý, thường vào đầu tháng sau khi hết quý.",
        options: [
          { label: "Có, chậm hơn rõ rệt", next: "exports", recap: "Tăng trưởng đang chậm lại", lead: "Vậy phải tìm xem ai đang chi ít đi. Việt Nam bán rất nhiều hàng ra thế giới, nên bắt đầu từ khách nước ngoài." },
          { label: "Không, vẫn như cũ hoặc nhanh hơn", next: "ket-on-dinh", recap: "Tăng trưởng không chậm lại", lead: "Vậy thì chưa có gì cần giải thích." },
        ],
      },
      {
        id: "exports",
        kind: "check",
        title: "Hàng bán ra nước ngoài có chậm lại không?",
        prompt: "Biểu đồ là tốc độ tăng xuất khẩu đã loại phần tăng giá. Dưới 0 nghĩa là bán được ít hơn năm trước.",
        metricId: "net_exports",
        seriesId: "exports_growth",
        seriesLabel: "Tốc độ tăng xuất khẩu",
        whereToLook: "Cơ quan Hải quan công bố số xuất nhập khẩu hàng hóa hai lần mỗi tháng.",
        options: [
          { label: "Có, giảm mạnh", next: "ket-the-gioi", recap: "Xuất khẩu giảm mạnh", lead: "Khách hàng nước ngoài đang mua ít đi." },
          { label: "Không", next: "consumption", recap: "Xuất khẩu vẫn ổn", lead: "Khách nước ngoài vẫn mua. Vậy hãy nhìn vào các gia đình trong nước." },
        ],
      },
      {
        id: "consumption",
        kind: "check",
        title: "Các gia đình có đang chi ít đi không?",
        prompt: "Biểu đồ là tốc độ tăng chi tiêu của hộ gia đình đã loại phần tăng giá. Đường này có thấp hơn hẳn mấy năm trước không?",
        metricId: "consumption",
        seriesId: "consumption_growth",
        seriesLabel: "Tốc độ tăng tiêu dùng",
        whereToLook: "Tổng mức bán lẻ hàng hóa và doanh thu dịch vụ được công bố hằng tháng. Nhớ trừ lạm phát khi đọc.",
        options: [
          { label: "Có, chậm hẳn", next: "confidence", recap: "Tiêu dùng chậm lại", lead: "Các gia đình đang chi chậm lại. Câu hỏi là vì họ không có tiền, hay vì họ lo." },
          { label: "Không", next: "investment", recap: "Tiêu dùng vẫn ổn", lead: "Tiêu dùng không phải vấn đề. Giờ hãy xem doanh nghiệp." },
        ],
      },
      {
        id: "confidence",
        kind: "check",
        title: "Có chuyện gì khiến mọi người lo lắng không?",
        prompt: "Con số này không có biểu đồ. Hãy nhớ lại: có dịch bệnh, cắt giảm việc làm hàng loạt, hay tin xấu về nhà đất và ngân hàng không?",
        metricId: "confidence",
        whereToLook: "Các khảo sát niềm tin người tiêu dùng, tin tức về cắt giảm nhân sự, và câu chuyện của những người xung quanh bạn.",
        options: [
          { label: "Có, mọi người đang lo", next: "ket-niem-tin", recap: "Mọi người đang lo lắng", lead: "Nỗi lo khiến tiền bị giữ lại." },
          { label: "Không thấy gì đặc biệt", next: "ket-thu-nhap", recap: "Không thấy nỗi lo lớn", lead: "Không phải nỗi lo, vậy có lẽ thu nhập đang yếu đi." },
        ],
      },
      {
        id: "investment",
        kind: "check",
        title: "Doanh nghiệp có đang đầu tư ít đi không?",
        prompt: "Biểu đồ là tốc độ tăng đầu tư đã loại phần tăng giá. Dưới 0 nghĩa là đầu tư ít hơn năm trước.",
        metricId: "investment",
        seriesId: "investment_growth",
        seriesLabel: "Tốc độ tăng đầu tư",
        whereToLook: "Cục Thống kê công bố vốn đầu tư toàn xã hội theo quý, tỷ lệ giải ngân đầu tư công có trên báo gần như mỗi tháng.",
        options: [
          { label: "Có, chậm hẳn", next: "lending", recap: "Đầu tư chậm lại", lead: "Doanh nghiệp đang ngại mở rộng. Có phải vì tiền vay quá đắt?" },
          { label: "Không", next: "ket-chua-ro", recap: "Đầu tư vẫn ổn", lead: "Đã đi qua các nhóm lớn mà chưa thấy nhóm nào yếu hẳn." },
        ],
      },
      {
        id: "lending",
        kind: "check",
        title: "Vay tiền có đang đắt hơn nhiều không?",
        prompt: "Nhìn lãi suất cho vay ở những năm gần đây. Lưu ý số liệu trong ứng dụng có thể chưa tới năm mới nhất.",
        metricId: "lending_rate",
        whereToLook: "Các ngân hàng niêm yết lãi suất vay trên trang của họ, báo chí thường so sánh hằng tháng.",
        options: [
          { label: "Có, tăng rõ rệt", next: "ket-that-chat", recap: "Lãi vay tăng rõ rệt", lead: "Tiền đắt có thể đã hãm đầu tư lại." },
          { label: "Không", next: "ket-ngai-dau-tu", recap: "Lãi vay không tăng", lead: "Tiền không đắt mà doanh nghiệp vẫn ngại." },
        ],
      },
      {
        id: "ket-on-dinh",
        kind: "conclusion",
        title: "Hiện kinh tế không chậm lại",
        story: "Nếu bạn vẫn thấy làm ăn khó khăn, điều đó có thể đúng với ngành của bạn, vì GDP là con số tổng của cả nước. Phần tăng trưởng có thể đến từ một vài ngành hoặc từ doanh nghiệp FDI.",
        policyView: "Khi tăng trưởng ổn, chính sách thường tập trung giữ giá cả và tỷ giá hơn là kích thích thêm.",
        watchNext: ["GDP quý tới", "Lạm phát", "Đóng góp của từng phần vào tăng trưởng"],
      },
      {
        id: "ket-the-gioi",
        kind: "conclusion",
        title: "Có lẽ lực kéo đến từ bên ngoài",
        story: "Việt Nam bán nhiều hàng ra thế giới, nên khi các khách hàng lớn yếu đi thì đơn hàng của các nhà máy giảm theo. Năm 2009, giữa khủng hoảng toàn cầu, xuất khẩu giảm khoảng 5%.",
        policyView: "Việt Nam không điều khiển được nhu cầu thế giới, nên thường bù lại bằng chi tiêu của Nhà nước và kích cầu trong nước.",
        watchNext: ["Đơn hàng của ngành xuất khẩu", "Tăng trưởng của Mỹ, Trung Quốc, châu Âu", "PMI"],
        caseSlug: "2009-kich-cau",
      },
      {
        id: "ket-niem-tin",
        kind: "conclusion",
        title: "Có lẽ nỗi lo đang giữ chặt túi tiền",
        story: "Khi lo cho công việc và tương lai, các gia đình hoãn mua sắm lớn và để dành nhiều hơn. Năm 2020, tốc độ tăng tiêu dùng chỉ còn khoảng 0,4%. Hạ lãi suất lúc này tác dụng chậm, vì vấn đề không phải giá tiền.",
        policyView: "Nhà nước thường hỗ trợ trực tiếp cho người dân, giảm thuế phí và giãn nợ. Quan trọng nhất là xử lý nguyên nhân khiến mọi người lo.",
        watchNext: ["Tổng mức bán lẻ", "Tiền gửi tiết kiệm", "Tin về việc làm"],
        caseSlug: "2020-covid",
      },
      {
        id: "ket-thu-nhap",
        kind: "conclusion",
        title: "Có lẽ thu nhập của các gia đình đang yếu",
        story: "Không có nỗi lo lớn nhưng người dân vẫn chi chậm lại, thường là vì thu nhập tăng không theo kịp. Con số [[unemployment|thất nghiệp]] thấp có thể không cho thấy điều này, vì nhiều người bị giảm giờ làm thay vì mất việc.",
        policyView: "Giảm thuế thu nhập, tăng lương cơ sở hoặc hỗ trợ nhóm thu nhập thấp là những cách hay được cân nhắc.",
        watchNext: ["Thu nhập bình quân", "Thiếu việc làm", "Tiêu dùng"],
      },
      {
        id: "ket-that-chat",
        kind: "conclusion",
        title: "Có lẽ tiền đắt đang hãm đầu tư",
        story: "Lãi vay cao khiến nhiều dự án không còn có lãi, nên doanh nghiệp dừng lại. Năm 2011, khi lãi vay gần 17% để chống lạm phát, đầu tư giảm khoảng 4%. Đây thường là cái giá của việc hãm giá cả.",
        policyView: "Có thể hạ lãi suất khi lạm phát đã lắng xuống. Nếu lạm phát còn cao, đây là lựa chọn rất khó giữa giá cả và tăng trưởng.",
        watchNext: ["Lạm phát", "Lãi suất cho vay", "Tín dụng"],
        caseSlug: "2011-nghi-quyet-11",
      },
      {
        id: "ket-ngai-dau-tu",
        kind: "conclusion",
        title: "Có lẽ doanh nghiệp không thấy khách hàng",
        story: "Tiền không đắt mà doanh nghiệp vẫn không đầu tư, thường vì họ chưa thấy đơn hàng. Khi đó hạ lãi suất thêm cũng ít tác dụng, giống tình huống gọi là [[bay-thanh-khoan|bẫy thanh khoản]].",
        policyView: "Chi tiêu và đầu tư của Nhà nước trở nên quan trọng hơn lãi suất, vì nó tạo ra nhu cầu trực tiếp.",
        watchNext: ["Giải ngân đầu tư công", "PMI", "Tín dụng cho sản xuất"],
      },
      {
        id: "ket-chua-ro",
        kind: "conclusion",
        title: "Chưa thấy nhóm nào yếu hẳn",
        story: "Khi mỗi phần chỉ yếu đi một chút, tăng trưởng vẫn có thể chậm lại. Cũng có thể phần chậm lại đến từ năm trước quá cao, nên năm nay so sánh trông thấp đi.",
        policyView: "Thường chưa cần phản ứng mạnh. Hãy chờ thêm số liệu của quý sau trước khi kết luận.",
        watchNext: ["GDP quý tới", "Đóng góp của từng phần", "Chi tiêu của Nhà nước"],
      },
    ],
  },
  {
    id: "ty-gia",
    name: "Chẩn đoán: vì sao tỷ giá căng?",
    hint: "Tiền đồng yếu đi khi đô la khan hiếm hoặc đô la mạnh lên. Lần theo số liệu để xem sức ép đến từ thế giới hay từ trong nước.",
    category: "doi-ngoai",
    mapId: "doi-ngoai",
    start: "fx",
    steps: [
      {
        id: "fx",
        kind: "check",
        title: "Tiền đồng có đang mất giá nhanh không?",
        prompt: "Con số là số đồng cần để mua 1 đô la. Đường đi lên là tiền đồng yếu đi. Việt Nam thường để tiền đồng yếu dần mỗi năm, nên hãy tìm đoạn dốc hơn bình thường.",
        metricId: "fx_rate",
        whereToLook: "Ngân hàng Nhà nước công bố tỷ giá trung tâm mỗi ngày, các ngân hàng niêm yết giá mua bán đô la trên trang của họ.",
        options: [
          { label: "Có, dốc hơn bình thường", next: "fed", recap: "Tiền đồng mất giá nhanh", lead: "Vậy có sức ép thật. Nguyên nhân hay gặp nhất là đô la mạnh lên, nên bắt đầu từ Mỹ." },
          { label: "Không, vẫn đều đều", next: "ket-on-dinh", recap: "Tỷ giá vẫn ổn", lead: "Vậy là chưa có sức ép đáng kể." },
        ],
      },
      {
        id: "fed",
        kind: "check",
        title: "Lãi suất Mỹ có tăng nhanh không?",
        prompt: "Lãi suất Mỹ cao thì giữ đô la có lợi hơn, và tiền chảy về Mỹ. Đường này có vọt lên không?",
        metricId: "fed_rate",
        whereToLook: "Fed họp khoảng tám lần một năm, kết quả được đưa tin ngay.",
        options: [
          { label: "Có, tăng nhanh", next: "reserves", recap: "Lãi suất Mỹ tăng nhanh", lead: "Sức ép đến từ bên ngoài. Giờ xem Ngân hàng Nhà nước đã phải đỡ tới đâu." },
          { label: "Không", next: "fpi", recap: "Lãi suất Mỹ không tăng", lead: "Không phải do Mỹ. Hãy xem vốn nước ngoài đang vào hay ra." },
        ],
      },
      {
        id: "reserves",
        kind: "check",
        title: "Dự trữ ngoại hối có giảm mạnh không?",
        prompt: "Khi bán đô la để đỡ tiền đồng, dự trữ sẽ giảm. Đường này có đi xuống rõ rệt không?",
        metricId: "reserves",
        whereToLook: "Ngân hàng Nhà nước không công bố thường xuyên, các báo cáo của IMF và World Bank có số liệu theo định kỳ.",
        options: [
          { label: "Có, giảm mạnh", next: "ket-fed-ban", recap: "Dự trữ giảm mạnh", lead: "Ngân hàng Nhà nước đã phải bán đô la để đỡ." },
          { label: "Không", next: "ket-fed-chiu", recap: "Dự trữ không giảm nhiều", lead: "Việt Nam có vẻ đang chịu được sức ép này." },
        ],
      },
      {
        id: "fpi",
        kind: "check",
        title: "Vốn nước ngoài có đang rút ra không?",
        prompt: "Số âm là nhà đầu tư nước ngoài bán tài sản ở Việt Nam và mang đô la đi nhiều hơn mang vào.",
        metricId: "fpi",
        whereToLook: "Các công ty chứng khoán tổng hợp giao dịch của khối ngoại mỗi ngày.",
        options: [
          { label: "Có, rút ra nhiều", next: "ket-von-rut", recap: "Vốn ngoại rút ra", lead: "Đô la đang chảy ra ngoài." },
          { label: "Không", next: "current-account", recap: "Vốn ngoại không rút nhiều", lead: "Không phải vốn ngoại. Vậy xem sổ thu chi đô la của cả nước." },
        ],
      },
      {
        id: "current-account",
        kind: "check",
        title: "Cả nước có đang chi đô la nhiều hơn thu không?",
        prompt: "Dưới 0 nghĩa là cả nước chi ngoại tệ nhiều hơn thu từ buôn bán, lợi nhuận và kiều hối.",
        metricId: "current_account",
        whereToLook: "Ngân hàng Nhà nước công bố cán cân thanh toán định kỳ. Số xuất nhập khẩu hàng hóa thì có hai lần mỗi tháng từ Hải quan.",
        options: [
          { label: "Có, thâm hụt lớn", next: "ket-thieu-do-la", recap: "Cán cân vãng lai thâm hụt", lead: "Đô la đang thiếu vì mua vào nhiều hơn bán ra." },
          { label: "Không", next: "cpi", recap: "Cán cân vãng lai ổn", lead: "Đô la không thiếu từ buôn bán. Còn lại câu hỏi về niềm tin vào tiền đồng." },
        ],
      },
      {
        id: "cpi",
        kind: "check",
        title: "Lạm phát trong nước có cao không?",
        prompt: "Khi giá cả tăng nhanh, tiền đồng mất sức mua, và người dân có xu hướng chuyển sang giữ đô la hoặc vàng.",
        metricId: "cpi",
        whereToLook: "Cục Thống kê công bố CPI đầu mỗi tháng.",
        options: [
          { label: "Có, cao", next: "ket-lam-phat", recap: "Lạm phát trong nước cao", lead: "Niềm tin vào tiền đồng đang yếu đi." },
          { label: "Không", next: "ket-ngoai-khac", recap: "Lạm phát trong nước thấp", lead: "Các nguyên nhân trong nước đều không rõ." },
        ],
      },
      {
        id: "ket-on-dinh",
        kind: "conclusion",
        title: "Hiện tỷ giá chưa có gì bất thường",
        story: "Tiền đồng thường yếu dần một chút mỗi năm, và điều đó bình thường. Một vài ngày tăng mạnh trên báo chưa chắc là xu hướng.",
        policyView: "Khi tỷ giá ổn, Ngân hàng Nhà nước có điều kiện mua thêm đô la vào dự trữ và tập trung cho lãi suất.",
        watchNext: ["Tỷ giá ở ngân hàng", "Lãi suất Fed", "Xuất siêu"],
      },
      {
        id: "ket-fed-ban",
        kind: "conclusion",
        title: "Có lẽ đô la mạnh đang ép tiền đồng",
        story: "Khi Mỹ tăng lãi suất nhanh, đô la mạnh lên so với hầu hết đồng tiền. Năm 2022, dự trữ của Việt Nam giảm khoảng 23 tỷ USD khi Ngân hàng Nhà nước đỡ tiền đồng.",
        policyView: "Ngân hàng Nhà nước thường bán đô la và tăng lãi suất. Dự trữ có giới hạn, và lãi suất cao thì vay vốn đắt hơn.",
        watchNext: ["Lãi suất Fed", "Dự trữ ngoại hối", "Lãi suất điều hành"],
        caseSlug: "2022-fed-trai-phieu",
      },
      {
        id: "ket-fed-chiu",
        kind: "conclusion",
        title: "Có lẽ sức ép từ Mỹ đang được hấp thụ",
        story: "Đô la mạnh lên, nhưng Việt Nam có đủ nguồn đô la từ xuất khẩu, FDI và kiều hối nên chưa phải đỡ nhiều. Để tiền đồng yếu đi một chút cũng là cách giảm sức ép.",
        policyView: "Ngân hàng Nhà nước có thể để tỷ giá linh hoạt hơn, thay vì bán dự trữ.",
        watchNext: ["Xuất siêu", "Lãi suất Fed", "Tỷ giá so với nhân dân tệ"],
      },
      {
        id: "ket-von-rut",
        kind: "conclusion",
        title: "Có lẽ vốn ngoại đang rút ra",
        story: "Nhà đầu tư bán cổ phiếu và trái phiếu, đổi tiền đồng lấy đô la để mang đi. Năm 2024 vốn gián tiếp rút ra ròng khoảng 5,7 tỷ USD. Dòng vốn này vào ra rất nhanh nên có thể tạo sức ép đột ngột.",
        policyView: "Ngân hàng Nhà nước có thể hút bớt tiền đồng để lãi suất ngắn hạn tăng, khiến giữ tiền đồng hấp dẫn hơn.",
        watchNext: ["Giao dịch của khối ngoại", "Lãi suất liên ngân hàng", "Chứng khoán"],
      },
      {
        id: "ket-thieu-do-la",
        kind: "conclusion",
        title: "Có lẽ cả nước đang thiếu đô la",
        story: "Mua hàng từ nước ngoài nhiều hơn bán ra thì đô la thiếu, và tiền đồng yếu đi. Năm 2008, cán cân vãng lai thâm hụt khoảng 11% GDP.",
        policyView: "Phải hạ nhiệt nhập khẩu, thường bằng cách siết tín dụng và để tỷ giá điều chỉnh. Tiền đồng yếu đi cũng giúp xuất khẩu tốt lên.",
        watchNext: ["Cán cân thương mại", "Tín dụng", "Dự trữ ngoại hối"],
        caseSlug: "2011-nghi-quyet-11",
      },
      {
        id: "ket-lam-phat",
        kind: "conclusion",
        title: "Có lẽ niềm tin vào tiền đồng đang yếu",
        story: "Khi giá cả tăng nhanh, mọi người chuyển sang giữ đô la và vàng để bảo vệ tiền của mình, gọi là [[do-la-hoa|đô la hóa]]. Càng nhiều người làm vậy, tiền đồng càng chịu sức ép.",
        policyView: "Việc quan trọng nhất là hãm lạm phát và giữ lãi suất tiền đồng đủ hấp dẫn.",
        watchNext: ["Lạm phát", "Giá vàng và đô la tự do", "Lãi suất tiền gửi"],
        caseSlug: "2011-nghi-quyet-11",
      },
      {
        id: "ket-ngoai-khac",
        kind: "conclusion",
        title: "Có lẽ là cú sốc riêng từ bên ngoài",
        story: "Sức ép có thể đến từ một nơi khác, như đồng nhân dân tệ bất ngờ mất giá, hoặc một đợt căng thẳng ngắn trên thị trường thế giới. Năm 2015, Trung Quốc phá giá đồng tiền và Việt Nam phải điều chỉnh theo.",
        policyView: "Ngân hàng Nhà nước thường để tỷ giá điều chỉnh vừa phải, giữ hàng xuất khẩu không bị kém cạnh tranh.",
        watchNext: ["Tỷ giá với nhân dân tệ", "Tin tức thị trường thế giới", "Tỷ giá trung tâm"],
        caseSlug: "2016-ty-gia-trung-tam",
      },
    ],
  },
];

export const ALGORITHM_BY_ID = Object.fromEntries(ALGORITHMS.map((a) => [a.id, a])) as Record<string, Algorithm>;
