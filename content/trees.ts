import type { LibraryCategory } from "./maps";

export type TreeKind = "key" | "component" | "driver";

/** Một nút của cây. Không gắn indicatorId nghĩa là nguyên nhân chưa có chuỗi số liệu riêng. */
export type TreeNode = {
  id: string;
  label: string;
  kind: TreeKind;
  indicatorId?: string;
  /** Nút này tăng thì nút cha tăng (+1) hay giảm (−1). Nút gốc để +1. */
  sign: 1 | -1;
  /** Câu hỏi đời thường, câu của nút cha được trả lời bởi các câu của nút con */
  question: string;
  /** Giải thích ngắn hiện khi người học mở câu hỏi */
  note: string;
  children?: TreeNode[];
};

export type MetricTree = { id: string; name: string; hint: string; category: LibraryCategory; mapId: string; root: TreeNode };

export const TREE_LEVELS: Record<TreeKind, { name: string; hint: string }> = {
  key: { name: "Con số cần hiểu", hint: "Câu hỏi lớn" },
  component: { name: "Nguyên nhân lớn", hint: "Nó có thể đến từ đâu" },
  driver: { name: "Điều cần kiểm tra", hint: "Con số nào cho câu trả lời" },
};

export const TREES: MetricTree[] = [
  {
    id: "lam-phat",
    name: "Vì sao giá cả tăng?",
    hint: "Lần theo bốn nguyên nhân lớn của lạm phát, rồi xem con số nào cho biết nguyên nhân đó có đang xảy ra không.",
    category: "tien-te",
    mapId: "lam-phat",
    root: {
      id: "cpi",
      label: "Lạm phát CPI",
      kind: "key",
      indicatorId: "cpi",
      sign: 1,
      question: "Vì sao giá cả đang tăng?",
      note: "Giá cả hiếm khi tăng vì một lý do duy nhất. Hãy hỏi lần lượt bốn câu dưới đây để tìm nguyên nhân chính.",
      children: [
        {
          id: "cau",
          label: "Mọi người mua nhiều hơn",
          kind: "component",
          sign: 1,
          question: "Có phải mọi người đang mua nhiều hơn lượng hàng làm ra?",
          note: "Hàng thì có hạn mà người mua đông lên, người bán sẽ tăng giá. Đây là lạm phát do cầu kéo.",
          children: [
            { id: "consumption", label: "Tiêu dùng hộ gia đình", kind: "driver", indicatorId: "consumption", sign: 1, question: "Các gia đình có đang chi tiêu mạnh tay hơn không?", note: "Tiêu dùng là phần lớn nhất trong tổng chi tiêu của nền kinh tế, nên nó tăng mạnh sẽ kéo giá lên." },
            { id: "investment", label: "Đầu tư", kind: "driver", indicatorId: "investment", sign: 1, question: "Doanh nghiệp có đang đổ tiền xây nhà máy, mua máy móc không?", note: "Đầu tư cũng là chi tiêu: mua xi măng, thép, máy móc và thuê người." },
            { id: "credit", label: "Tín dụng", kind: "driver", indicatorId: "credit", sign: 1, question: "Vay tiền có đang dễ hơn không?", note: "Vay dễ thì người dân và doanh nghiệp có thêm tiền để chi, nên cầu tăng." },
            { id: "m2", label: "Cung tiền M2", kind: "driver", indicatorId: "m2", sign: 1, question: "Lượng tiền trong nền kinh tế có tăng nhanh hơn lượng hàng hóa không?", note: "Tiền tăng nhanh hơn hàng làm ra thì mỗi đồng mua được ít hàng hơn." },
          ],
        },
        {
          id: "chi-phi",
          label: "Làm ra hàng đắt hơn",
          kind: "component",
          sign: 1,
          question: "Có phải chi phí làm ra hàng hóa đang đắt lên?",
          note: "Khi đầu vào đắt hơn, người bán tăng giá dù khách không mua nhiều hơn. Đây là lạm phát do chi phí đẩy.",
          children: [
            { id: "oil_price", label: "Giá dầu Brent", kind: "driver", indicatorId: "oil_price", sign: 1, question: "Giá xăng dầu thế giới có tăng không?", note: "Xăng dầu nằm trực tiếp trong rổ CPI, lại là chi phí vận tải của hầu hết hàng hóa." },
            { id: "thuc-pham", label: "Giá lương thực, thực phẩm", kind: "driver", sign: 1, question: "Giá gạo, thịt, rau có tăng không?", note: "Ăn uống chiếm phần lớn trong chi tiêu của gia đình Việt Nam, nên giá thực phẩm tác động mạnh tới CPI. Chưa có chuỗi số riêng trong ứng dụng." },
            { id: "unemployment", label: "Thất nghiệp", kind: "driver", indicatorId: "unemployment", sign: -1, question: "Doanh nghiệp có đang khó tuyển người không?", note: "Ít người thất nghiệp thì lao động khan hiếm, lương tăng và chi phí tăng theo. Ở Việt Nam, quan hệ này khá yếu." },
          ],
        },
        {
          id: "fx_rate",
          label: "Tiền đồng yếu đi",
          kind: "component",
          indicatorId: "fx_rate",
          sign: 1,
          question: "Có phải tiền đồng đang mất giá?",
          note: "Đô la đắt hơn thì xăng dầu, nguyên liệu và máy móc nhập khẩu tính bằng tiền đồng cũng đắt hơn.",
          children: [
            { id: "fed_rate", label: "Lãi suất Fed", kind: "driver", indicatorId: "fed_rate", sign: 1, question: "Mỹ có đang tăng lãi suất không?", note: "Lãi suất Mỹ cao khiến đô la mạnh lên và vốn rời khỏi các nước như Việt Nam." },
            { id: "reserves", label: "Dự trữ ngoại hối", kind: "driver", indicatorId: "reserves", sign: -1, question: "Ngân hàng Nhà nước còn nhiều đô la để giữ tỷ giá không?", note: "Dự trữ dồi dào thì có thể bán đô la ra để đỡ tiền đồng khi cần." },
            { id: "fpi", label: "Vốn gián tiếp FPI", kind: "driver", indicatorId: "fpi", sign: -1, question: "Nhà đầu tư nước ngoài đang mang tiền vào hay rút ra?", note: "Vốn vào làm tăng nguồn đô la và đỡ tiền đồng; vốn rút ra thì ngược lại." },
          ],
        },
        {
          id: "expectations",
          label: "Mọi người tin giá sẽ tăng",
          kind: "component",
          indicatorId: "expectations",
          sign: 1,
          question: "Có phải mọi người tin giá sẽ còn tăng?",
          note: "Ai cũng tin giá sẽ tăng thì người lao động đòi tăng lương, người bán tăng giá trước, và lạm phát tự thành hiện thực.",
          children: [
            { id: "policy_rate", label: "Lãi suất điều hành", kind: "driver", indicatorId: "policy_rate", sign: -1, question: "Ngân hàng Nhà nước có cho thấy quyết tâm giữ giá không?", note: "Tăng lãi suất đúng lúc giúp mọi người tin giá sẽ được kiểm soát." },
            { id: "gia-hang-ngay", label: "Giá các món mua hằng ngày", kind: "driver", sign: 1, question: "Giá xăng và đồ ăn có đang tăng thấy rõ không?", note: "Người dân thường đoán lạm phát qua những món mua mỗi ngày, hơn là qua con số công bố." },
          ],
        },
      ],
    },
  },
  {
    id: "tang-truong",
    name: "Vì sao tăng trưởng chậm lại?",
    hint: "GDP tăng khi có người chi tiền. Hãy xem ai đang chi ít đi: người dân, doanh nghiệp, Nhà nước hay khách hàng nước ngoài.",
    category: "tang-truong",
    mapId: "tong-cau",
    root: {
      id: "gdp_growth",
      label: "Tăng trưởng GDP",
      kind: "key",
      indicatorId: "gdp_growth",
      sign: 1,
      question: "Vì sao kinh tế đang tăng chậm lại?",
      note: "Thứ làm ra phải có người mua. Bốn nhóm người chi tiền trong nền kinh tế tương ứng với bốn câu hỏi dưới đây.",
      children: [
        {
          id: "consumption",
          label: "Người dân chi ít đi",
          kind: "component",
          indicatorId: "consumption",
          sign: 1,
          question: "Có phải người dân đang chi tiêu ít đi?",
          note: "Tiêu dùng là phần lớn nhất của GDP, nên chỉ cần các gia đình thắt lưng buộc bụng là tăng trưởng chậm lại rõ rệt.",
          children: [
            { id: "confidence", label: "Niềm tin", kind: "driver", indicatorId: "confidence", sign: 1, question: "Mọi người có đang lo lắng về việc làm và thu nhập không?", note: "Khi lo cho tương lai, người ta để dành nhiều hơn dù trong túi vẫn có tiền." },
            { id: "credit-c", label: "Tín dụng", kind: "driver", indicatorId: "credit", sign: 1, question: "Vay tiền mua nhà, mua xe có khó hơn không?", note: "Vay khó thì nhiều khoản mua lớn bị hoãn lại." },
            { id: "remittances", label: "Kiều hối", kind: "driver", indicatorId: "remittances", sign: 1, question: "Tiền người thân ở nước ngoài gửi về có giảm không?", note: "Kiều hối là khoản thu nhập thêm mà nhiều gia đình dùng để chi tiêu." },
            { id: "tax-c", label: "Thu ngân sách (thuế, phí)", kind: "driver", indicatorId: "tax", sign: -1, question: "Thuế và phí có đang lấy đi nhiều hơn không?", note: "Thuế cao hơn thì phần tiền còn lại để chi tiêu ít đi." },
          ],
        },
        {
          id: "investment",
          label: "Doanh nghiệp đầu tư ít đi",
          kind: "component",
          indicatorId: "investment",
          sign: 1,
          question: "Có phải doanh nghiệp đang ngại mở rộng?",
          note: "Doanh nghiệp xây nhà máy, mua máy móc khi tin sẽ bán được hàng và vay được vốn với giá hợp lý.",
          children: [
            { id: "credit-i", label: "Tín dụng", kind: "driver", indicatorId: "credit", sign: 1, question: "Doanh nghiệp có vay được vốn không?", note: "Nhiều dự án dựa vào vốn vay ngân hàng, nên vốn khó vay thì dự án dừng lại." },
            { id: "fdi", label: "Vốn FDI", kind: "driver", indicatorId: "fdi", sign: 1, question: "Doanh nghiệp nước ngoài có còn xây nhà máy ở Việt Nam không?", note: "Vốn FDI vào nhiều hơn nghĩa là có thêm nhà máy và việc làm." },
            { id: "public_investment", label: "Đầu tư công", kind: "driver", indicatorId: "public_investment", sign: 1, question: "Đường sá, cầu cảng của Nhà nước có đang được xây đúng tiến độ không?", note: "Đầu tư công được tính vào phần đầu tư. Giải ngân chậm thì phần này yếu đi." },
            { id: "confidence-i", label: "Niềm tin", kind: "driver", indicatorId: "confidence", sign: 1, question: "Chủ doanh nghiệp có tin sẽ bán được hàng không?", note: "Không tin có khách thì chẳng ai mở rộng sản xuất, dù vay vốn dễ." },
          ],
        },
        {
          id: "gov_spending",
          label: "Nhà nước chi ít đi",
          kind: "component",
          indicatorId: "gov_spending",
          sign: 1,
          question: "Có phải Nhà nước đang chi ít đi?",
          note: "Lương công chức, trường học và bệnh viện cũng là chi tiêu trong nền kinh tế.",
          children: [
            { id: "tax-g", label: "Thu ngân sách (thuế, phí)", kind: "driver", indicatorId: "tax", sign: 1, question: "Nhà nước có thu đủ tiền để chi không?", note: "Thu ít đi thì ngân sách eo hẹp hơn, trừ khi vay thêm." },
            { id: "public_debt", label: "Nợ công", kind: "driver", indicatorId: "public_debt", sign: -1, question: "Nợ công có khiến Nhà nước phải thận trọng hơn không?", note: "Nợ càng cao thì càng khó vay thêm để chi. Đây là nhận định chung, không phải quan hệ tự động." },
          ],
        },
        {
          id: "net_exports",
          label: "Bán ra thế giới kém đi",
          kind: "component",
          indicatorId: "net_exports",
          sign: 1,
          question: "Có phải hàng Việt Nam đang bán ra nước ngoài kém đi?",
          note: "Xuất khẩu ròng là bán ra trừ mua vào. Nền kinh tế Việt Nam mở, nên phần này biến động theo thế giới.",
          children: [
            { id: "the-gioi", label: "Nhu cầu của thế giới", kind: "driver", sign: 1, question: "Mỹ, Trung Quốc, châu Âu có đang mua ít hàng đi không?", note: "Khách hàng lớn suy yếu thì đơn hàng của các nhà máy Việt Nam giảm theo. Chưa có chuỗi số riêng trong ứng dụng." },
            { id: "fx_rate", label: "Tỷ giá VND/USD", kind: "driver", indicatorId: "fx_rate", sign: 1, question: "Hàng Việt Nam tính ra đô la có đắt hơn hàng nước khác không?", note: "Tiền đồng yếu đi giúp hàng xuất khẩu rẻ hơn với khách nước ngoài." },
            { id: "fdi-x", label: "Vốn FDI", kind: "driver", indicatorId: "fdi", sign: 1, question: "Các nhà máy nước ngoài có đang mở rộng sản xuất để xuất khẩu không?", note: "Phần lớn hàng xuất khẩu của Việt Nam đến từ doanh nghiệp có vốn nước ngoài." },
          ],
        },
      ],
    },
  },
  {
    id: "vay-tien",
    name: "Vì sao vay tiền đắt hơn?",
    hint: "Lãi vay là giá của tiền. Hãy xem giá đó tăng vì Ngân hàng Nhà nước, vì ngân hàng thiếu tiền, vì người gửi hay vì rủi ro.",
    category: "tien-te",
    mapId: "tin-dung",
    root: {
      id: "lending_rate",
      label: "Lãi suất cho vay",
      kind: "key",
      indicatorId: "lending_rate",
      sign: 1,
      question: "Vì sao lãi vay đang tăng?",
      note: "Ngân hàng cũng phải mua tiền rồi mới bán lại. Lãi vay bằng giá vốn cộng với phần bù rủi ro và lợi nhuận.",
      children: [
        {
          id: "policy_rate",
          label: "Lãi suất điều hành tăng",
          kind: "component",
          indicatorId: "policy_rate",
          sign: 1,
          question: "Có phải Ngân hàng Nhà nước đang nâng lãi suất?",
          note: "Giá bán buôn của tiền tăng thì giá bán lẻ cho người đi vay thường tăng theo, sau một độ trễ.",
          children: [
            { id: "cpi-p", label: "Lạm phát CPI", kind: "driver", indicatorId: "cpi", sign: 1, question: "Giá cả có đang tăng nhanh không?", note: "Ngân hàng Nhà nước thường nâng lãi suất để hãm lạm phát." },
            { id: "fx_rate", label: "Tỷ giá VND/USD", kind: "driver", indicatorId: "fx_rate", sign: 1, question: "Tiền đồng có đang chịu sức ép không?", note: "Lãi suất cao hơn giúp giữ người ta tiếp tục nắm tiền đồng." },
          ],
        },
        {
          id: "interbank",
          label: "Ngân hàng thiếu tiền",
          kind: "component",
          indicatorId: "interbank",
          sign: 1,
          question: "Có phải các ngân hàng đang thiếu tiền mặt?",
          note: "Ngân hàng cho nhau vay qua đêm. Lãi suất liên ngân hàng tăng là dấu hiệu tiền trong hệ thống đang căng.",
          children: [
            { id: "policy_rate-i", label: "Lãi suất điều hành", kind: "driver", indicatorId: "policy_rate", sign: 1, question: "Mức lãi của Ngân hàng Nhà nước có đang kéo thị trường lên không?", note: "Lãi suất điều hành là mốc tham chiếu cho giá tiền giữa các ngân hàng." },
            { id: "omo", label: "Hút tiền về (OMO, tín phiếu)", kind: "driver", indicatorId: "omo", sign: 1, question: "Ngân hàng Nhà nước có đang hút bớt tiền khỏi hệ thống không?", note: "Bán tín phiếu làm tiền trong tay các ngân hàng ít đi, nên giá tiền giữa họ tăng." },
          ],
        },
        {
          id: "huy-dong",
          label: "Người gửi đòi lãi cao hơn",
          kind: "component",
          sign: 1,
          question: "Có phải ngân hàng phải trả lãi cao hơn để giữ tiền gửi?",
          note: "Tiền gửi là nguồn vốn chính của ngân hàng. Trả lãi gửi cao hơn thì phải cho vay cao hơn. Chưa có chuỗi số riêng trên bản đồ.",
          children: [
            { id: "cpi-d", label: "Lạm phát CPI", kind: "driver", indicatorId: "cpi", sign: 1, question: "Lãi gửi có còn bù được giá cả tăng không?", note: "Nếu lãi gửi thấp hơn lạm phát, tiền gửi bị mất sức mua nên người gửi đòi cao hơn." },
            { id: "expectations", label: "Kỳ vọng lạm phát", kind: "driver", indicatorId: "expectations", sign: 1, question: "Mọi người có tin giá sẽ còn tăng không?", note: "Tin giá sẽ tăng thì người ta không muốn gửi dài hạn ở mức lãi cũ." },
          ],
        },
        {
          id: "rui-ro",
          label: "Cho vay rủi ro hơn",
          kind: "component",
          sign: 1,
          question: "Có phải ngân hàng lo khách vay không trả được nợ?",
          note: "Rủi ro cao hơn thì ngân hàng đòi phần bù cao hơn, hoặc từ chối cho vay.",
          children: [
            { id: "no-xau", label: "Nợ xấu", kind: "driver", sign: 1, question: "Nợ khó đòi của ngân hàng có tăng không?", note: "Nợ xấu nhiều thì ngân hàng phải để riêng một khoản phòng mất vốn và cho vay thận trọng hơn. Chưa có chuỗi số riêng trong ứng dụng." },
            { id: "gdp_growth", label: "Tăng trưởng GDP", kind: "driver", indicatorId: "gdp_growth", sign: -1, question: "Kinh tế có đang khó khăn không?", note: "Kinh tế yếu thì doanh nghiệp dễ gặp khó, nên khoản vay rủi ro hơn." },
          ],
        },
      ],
    },
  },
];

export const TREE_BY_ID = Object.fromEntries(TREES.map((t) => [t.id, t])) as Record<string, MetricTree>;

/** Mọi nút của cây, nút cha đứng trước nút con. */
export function flattenTree(node: TreeNode): TreeNode[] {
  return [node, ...(node.children ?? []).flatMap(flattenTree)];
}
