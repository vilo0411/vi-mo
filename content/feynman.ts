export type WidgetId = "bakery" | "gdp-sort" | "contributions" | "loan" | "real-rate" | "exchange" | "class-fund" | "money-goods";

/** Giải thích theo cách Feynman cho từng bài: ví dụ đời thường, trẻ con cũng hiểu, kèm các thành phần tương tác. */
export const FEYNMAN: Record<string, { title: string; story: string[]; widgets: WidgetId[] }> = {
  "ba-con-so": {
    title: "Cả nước là một tiệm bánh mì khổng lồ",
    story: [
      "Tưởng tượng cả nước chỉ làm đúng một thứ: bánh mì. Năm ngoái làm được 100 ổ, năm nay làm được 107 ổ. Vậy tiệm đã lớn thêm 7%. Đó là tăng trưởng GDP: năm nay làm ra nhiều hơn năm ngoái bao nhiêu.",
      "Năm ngoái một ổ bánh giá 10.000 đồng, năm nay giá 10.400 đồng. Giá đã tăng 4%. Đó là lạm phát: cùng một món đồ, năm nay phải trả nhiều tiền hơn.",
      "Tiệm có 100 người muốn làm thợ, nhưng chỉ có chỗ cho 98 người. 2 người còn lại đang tìm việc. Đó là tỷ lệ thất nghiệp 2%.",
      "Bẫy hay gặp: tiền bán bánh tăng từ 1.000.000 lên 1.112.800 đồng, tức tăng 11,3%. Nhưng phần lớn chỗ tăng đó là do giá, chỉ 7% là bánh thật sự nhiều hơn. Kéo các thanh bên dưới để thấy.",
    ],
    widgets: ["bakery"],
  },
  "ai-tieu-tien": {
    title: "GDP là một cái bánh pizza chia làm bốn miếng",
    story: [
      "Mỗi ổ bánh mì làm ra đều có người mua. Hỏi \"ai mua?\" là một cách đếm GDP.",
      "Miếng lớn nhất là nhà mình mua để ăn: đó là tiêu dùng (C). Miếng thứ hai là chủ tiệm mua thêm lò nướng để mai làm được nhiều bánh hơn: đó là đầu tư (I). Miếng thứ ba là nhà trường mua bánh cho học sinh: đó là chi tiêu của Nhà nước (G).",
      "Miếng cuối hơi lạ: bạn ở nước khác mua bánh của mình thì cộng vào (xuất khẩu X), nhưng bột mì mình mua của nước khác thì trừ đi (nhập khẩu M), vì phần đó không phải mình làm ra.",
      "Bốn miếng cộng lại là cả cái bánh, tức 100% GDP. Chơi trò phân loại bên dưới xem bạn có xếp đúng miếng không.",
    ],
    widgets: ["gdp-sort", "contributions"],
  },
  "lai-suat": {
    title: "Lãi suất là tiền thuê tiền",
    story: [
      "Bạn mượn xe đạp của bạn thân một tuần, khi trả bạn tặng thêm một gói kẹo để cảm ơn. Mượn tiền cũng vậy: trả lại số tiền đã mượn, cộng thêm một khoản \"cảm ơn\". Khoản đó tính theo phần trăm mỗi năm, gọi là lãi suất.",
      "Ngân hàng Nhà nước giống như cửa hàng bán buôn tiền cho các ngân hàng. Khi cửa hàng bán buôn tăng giá, các ngân hàng bán lẻ (cho bạn vay) cũng tăng giá theo.",
      "Thuê tiền đắt lên thì nhiều người thôi không thuê nữa: hoãn mua nhà, hoãn mở quán. Mọi người tiêu ít đi, nên giá cả bớt tăng. Đó là cách tăng lãi suất kéo lạm phát xuống.",
      "Kéo thanh lãi suất bên dưới để xem tiền lãi tăng thế nào và bao nhiêu người trong xóm còn muốn vay.",
    ],
    widgets: ["loan", "real-rate"],
  },
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
