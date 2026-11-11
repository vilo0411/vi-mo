export type WidgetId = "bakery" | "gdp-sort" | "contributions" | "loan" | "real-rate" | "exchange" | "class-fund" | "money-goods" | "money-bread";

/** Giải thích theo cách Feynman cho các bài chưa viết theo phố Cầu Tre: ví dụ đời thường, trẻ con cũng hiểu, kèm các thành phần tương tác. */
export const FEYNMAN: Record<string, { title: string; story: string[]; widgets: WidgetId[] }> = {
  "tien-dong-va-the-gioi": {
    title: "Tỷ giá là giá để đổi tiền",
    story: [
      "Bạn muốn mua một món đồ chơi ở Mỹ giá 10 đô la. Bạn phải mang tiền đồng ra đổi lấy đô la trước. Tỷ giá cho biết 1 đô la đổi được bao nhiêu đồng.",
      "Hôm qua 1 đô la đổi được 24.000 đồng, hôm nay đổi 26.000 đồng. Món đồ chơi đó đắt lên với bạn, dù ở Mỹ giá vẫn là 10 đô la. Ta nói tiền đồng \"yếu đi\".",
      "Ngược lại, cà phê Việt Nam lại rẻ đi với người Mỹ, nên họ mua nhiều hơn. Tiền đồng yếu làm hàng nhập khẩu đắt lên và hàng xuất khẩu rẻ đi: có người được, có người mất.",
      "Kéo thanh tỷ giá bên dưới để xem ai vui, ai buồn.",
    ],
    widgets: ["exchange"],
  },
  "chinh-phu-thu-chi": {
    title: "Ngân sách Nhà nước giống quỹ lớp",
    story: [
      "Đầu năm mỗi bạn góp tiền vào quỹ lớp: đó là thuế. Cả năm lớp chi tiền cho liên hoan, mua bóng, in tài liệu: đó là chi tiêu của Nhà nước.",
      "Nếu lớp muốn đi dã ngoại mà quỹ không đủ, lớp trưởng phải mượn cô giáo. Chi nhiều hơn thu gọi là bội chi, và khoản mượn đó là nợ.",
      "Mượn một lần không sao. Nhưng năm nào cũng chi nhiều hơn thu thì nợ cứ cộng dồn. Điều quan trọng là so nợ với \"thu nhập\": lớp càng đông, góp được càng nhiều thì cùng khoản nợ đó càng nhẹ. Với cả nước, \"thu nhập\" đó là GDP.",
      "Thử làm lớp trưởng bên dưới: đặt mức thu, mức chi và xem sau 10 năm nợ lớn tới đâu.",
    ],
    widgets: ["class-fund"],
  },
  "doc-cau-chuyen": {
    title: "Khi tiền nhiều hơn hàng",
    story: [
      "Một cái chợ nhỏ có 10 quả táo. Cả chợ có tổng cộng 100.000 đồng để mua táo, nên mỗi quả giá khoảng 10.000 đồng.",
      "Bỗng nhiên ai cũng có thêm tiền: cả chợ giờ có 200.000 đồng, nhưng vẫn chỉ có 10 quả táo. Ai cũng muốn mua, người bán thấy vậy thì tăng giá, và mỗi quả lên khoảng 20.000 đồng.",
      "Năm 2007 ở Việt Nam cũng gần như vậy: lượng tiền tăng khoảng 49% trong một năm, trong khi hàng hóa làm ra chỉ tăng khoảng 7%. Năm sau giá cả tăng 23%.",
      "Kéo hai thanh bên dưới để thấy giá cả phụ thuộc vào cuộc đua giữa tiền và hàng.",
    ],
    widgets: ["money-goods"],
  },
};
