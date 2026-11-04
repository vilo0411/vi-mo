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
];

export const TREE_BY_ID = Object.fromEntries(TREES.map((t) => [t.id, t])) as Record<string, MetricTree>;

/** Mọi nút của cây, nút cha đứng trước nút con. */
export function flattenTree(node: TreeNode): TreeNode[] {
  return [node, ...(node.children ?? []).flatMap(flattenTree)];
}
