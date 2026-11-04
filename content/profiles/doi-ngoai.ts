import type { IndicatorProfile } from "../indicatorProfiles";

/** Hồ sơ nhóm thế giới và dòng tiền ngoại tệ. */
export const EXTERNAL_PROFILES: Record<string, IndicatorProfile> = {
  fed_rate: {
    alsoCalled: ["Lãi suất quỹ liên bang", "Fed Funds Rate"],
    nuances: [
      "**Đây là lãi suất của Mỹ, không phải của Việt Nam.** Việt Nam không điều khiển được, nhưng chịu tác động mạnh.",
      "**Con số là bình quân năm.** Trong năm, Fed có thể đã đổi lãi suất nhiều lần.",
      "**Thông báo của Fed có tác động ngay.** Thị trường thường phản ứng trước khi lãi suất thật sự đổi.",
    ],
    worked: {
      title: "Hai năm tăng rất nhanh",
      rows: [
        { label: "Bình quân năm 2021", value: "0,08%" },
        { label: "Bình quân năm 2023", value: "5,02%" },
        { label: "Thay đổi", value: "tăng gần 5 điểm phần trăm" },
      ],
      note: "Gửi đô la vào Mỹ bỗng có lãi cao hơn nhiều, nên tiền trên thế giới chảy về Mỹ và đô la mạnh lên.",
    },
    whyMatters:
      "**Đô la là đồng tiền trung tâm của thế giới, nên lãi suất Mỹ giống như mức giá chung của tiền.** Fed tăng lãi suất thì [[fx_rate|tỷ giá]] của Việt Nam chịu sức ép, và Ngân hàng Nhà nước khó hạ lãi suất hơn.",
    whenMisleading:
      "**Fed tăng lãi suất không tự động làm tiền đồng mất giá nhiều.** Điều đó còn phụ thuộc vào xuất siêu, [[reserves|dự trữ]] và dòng vốn. Năm 2023 Fed giữ lãi suất cao mà Việt Nam vẫn hạ được lãi suất.",
    breakdowns: [
      { by: "Lãi suất và thông điệp", reveals: "Fed đang làm gì và nói sẽ làm gì" },
      { by: "Lạm phát Mỹ", reveals: "vì sao Fed phải giữ hay hạ lãi suất" },
      { by: "Chênh lệch với Việt Nam", reveals: "giữ đô la hay giữ tiền đồng có lợi hơn" },
      { by: "Sức mạnh đồng đô la", reveals: "đồng tiền các nước khác cũng chịu ảnh hưởng ra sao" },
    ],
    questions: {
      explore: ["Fed đang tăng hay giảm, và thị trường đoán gì cho vài tháng tới?", "Đồng tiền các nước khác có cùng yếu đi với tiền đồng không?"],
      decide: ["Nếu có khoản phải trả bằng đô la, mình có biết nó sẽ thay đổi ra sao khi đô la mạnh lên không?"],
    },
  },

  oil_price: {
    alsoCalled: ["Dầu Brent", "Giá dầu thế giới"],
    nuances: [
      "**Đây là giá dầu thô bằng đô la, không phải giá xăng trong nước.** Giá xăng còn tính thêm thuế, phí và tỷ giá.",
      "**Việt Nam vừa bán dầu thô vừa mua xăng dầu.** Giá dầu tăng có lợi cho ngân sách ở một phần, nhưng thiệt cho người tiêu dùng.",
      "**Con số là bình quân năm**, nên không thấy được những đợt tăng vọt trong vài tuần.",
    ],
    worked: {
      title: "Giá dầu Brent bình quân năm",
      rows: [
        { label: "Năm 2020", value: "khoảng 43 USD/thùng" },
        { label: "Năm 2022", value: "99 USD/thùng" },
        { label: "Năm 2025", value: "khoảng 68 USD/thùng" },
      ],
      note: "Từ 2020 tới 2022, giá dầu tăng hơn gấp đôi. Đó là cú sốc chi phí cho gần như mọi ngành.",
    },
    whyMatters:
      "**Dầu đi vào giá của gần như mọi thứ.** Xăng nằm trong giỏ hàng gia đình và trong chi phí chở hàng. Giá dầu tăng nên có thể đẩy [[cpi|lạm phát]] lên dù người dân không mua nhiều hơn.",
    whenMisleading:
      "**Giá dầu tăng chưa chắc làm lạm phát tăng mạnh.** Năm 2022 dầu lên 99 USD nhưng CPI cả năm chỉ khoảng 3,2%, một phần vì giảm thuế xăng dầu. Năm 2015 lạm phát rất thấp cũng có phần nhờ giá dầu giảm mạnh, không hẳn vì kinh tế yếu.",
    breakdowns: [
      { by: "Giá dầu thô và giá xăng", reveals: "phần thuế, phí và tỷ giá trong giá bạn trả" },
      { by: "Nguyên nhân tăng giá", reveals: "do thiếu nguồn cung hay do nhu cầu tăng" },
      { by: "Ngành chịu tác động", reveals: "vận tải, phân bón, nhựa, hàng không" },
      { by: "Theo tháng", reveals: "tăng trong thời gian ngắn hay kéo dài" },
    ],
    questions: {
      explore: ["Giá dầu tăng vì thiếu cung hay vì nhu cầu mạnh?", "Nhà nước có đang giảm thuế, phí để đỡ giá xăng không?"],
      decide: ["Chi phí đi lại và chở hàng chiếm bao nhiêu trong chi tiêu của gia đình mình?"],
    },
  },

  fx_rate: {
    alsoCalled: ["Tỷ giá đô la", "Tỷ giá USD/VND"],
    nuances: [
      "**Con số tăng nghĩa là tiền đồng yếu đi.** Cần nhiều đồng hơn để mua một đô la. Điều này dễ nhầm với người mới.",
      "**Đây là tỷ giá chính thức bình quân năm**, khác giá mua bán ở ngân hàng và giá thị trường tự do.",
      "**Tiền đồng ổn định với đô la chưa chắc ổn định với đồng tiền khác.** Xem thêm [[reer|tỷ giá thực hiệu dụng]].",
    ],
    worked: {
      title: "Một món hàng nhập khẩu giá 100 USD",
      rows: [
        { label: "Theo tỷ giá năm 2011", value: "khoảng 2,05 triệu đồng" },
        { label: "Theo tỷ giá năm 2024", value: "khoảng 2,42 triệu đồng" },
        { label: "Thay đổi", value: "đắt hơn khoảng 18%" },
      ],
      note: "Giá gốc không đổi, nhưng người mua Việt Nam phải trả nhiều tiền đồng hơn. Chưa tính thuế và chi phí khác.",
    },
    whyMatters:
      "**Tỷ giá nối giá trong nước với giá thế giới.** Tiền đồng yếu đi giúp hàng xuất khẩu rẻ hơn với khách nước ngoài, nhưng làm hàng nhập khẩu và các khoản nợ bằng đô la đắt hơn.",
    whenMisleading:
      "**Tiền đồng mất giá không hẳn là xấu, giữ giá không hẳn là tốt.** Giữ tỷ giá quá chặt có thể làm mất [[reserves|dự trữ]] và khiến hàng xuất khẩu kém cạnh tranh. Hãy xem nó mất giá nhanh tới đâu so với các nước khác.",
    breakdowns: [
      { by: "Tỷ giá chính thức và tự do", reveals: "chênh lệch lớn là dấu hiệu căng thẳng" },
      { by: "Với đồng nhân dân tệ và đồng tiền khác", reveals: "sức cạnh tranh thật của hàng Việt Nam" },
      { by: "Theo tháng", reveals: "mất giá từ từ hay đột ngột" },
      { by: "Nguồn cung đô la", reveals: "xuất siêu, FDI, kiều hối có đủ bù nhu cầu không" },
    ],
    questions: {
      explore: ["Tiền đồng yếu đi so với đô la, hay đô la mạnh lên so với mọi đồng tiền?", "Nguồn đô la vào có đang giảm không?"],
      decide: ["Gia đình mình có khoản nào phụ thuộc vào đô la, như học phí, du lịch hay nợ không?"],
    },
  },

  fdi: {
    alsoCalled: ["Đầu tư trực tiếp nước ngoài"],
    nuances: [
      "**Có hai con số thường bị nhầm.** Vốn đăng ký là lời hứa, vốn giải ngân là tiền thực sự vào. Thẻ này dùng số vốn thực sự chảy vào.",
      "**Đây là tỷ lệ so với GDP.** Số đô la có thể tăng trong khi tỷ lệ đứng yên.",
      "**FDI ở lại lâu, khác với [[fpi|vốn gián tiếp]].** Nhà máy không thể rút đi trong một ngày.",
    ],
    worked: {
      title: "Vốn FDI vào so với GDP",
      rows: [
        { label: "Năm 2008", value: "khoảng 9,7%" },
        { label: "Năm 2019", value: "khoảng 4,8%" },
        { label: "Năm 2025", value: "khoảng 4,3%" },
      ],
      note: "Năm 2008 là đợt vốn ồ ạt sau khi Việt Nam vào WTO. Sau đó tỷ lệ này khá ổn định dù nền kinh tế lớn lên.",
    },
    whyMatters:
      "**FDI mang tới nhà máy, việc làm và đô la.** Nó đóng góp lớn vào xuất khẩu và giúp đỡ [[fx_rate|tỷ giá]]. Việt Nam được lợi khi các tập đoàn dịch chuyển sản xuất sang đây.",
    whenMisleading:
      "**FDI cao không có nghĩa doanh nghiệp Việt Nam mạnh lên.** Nhiều nhà máy nhập linh kiện về lắp ráp, giá trị tạo ra trong nước không lớn, và lợi nhuận có thể chuyển về nước họ.",
    breakdowns: [
      { by: "Đăng ký và giải ngân", reveals: "lời hứa đã biến thành tiền thật bao nhiêu" },
      { by: "Ngành", reveals: "vào sản xuất, bất động sản hay công nghệ" },
      { by: "Quốc gia đầu tư", reveals: "Hàn Quốc, Singapore, Nhật Bản, Trung Quốc" },
      { by: "Tỷ lệ làm tại Việt Nam", reveals: "doanh nghiệp trong nước tham gia được bao nhiêu" },
    ],
    questions: {
      explore: ["Vốn giải ngân có theo kịp vốn đăng ký không?", "Dự án mới vào ngành nào?"],
      decide: ["Nếu làm cho doanh nghiệp FDI, công việc của mình phụ thuộc vào đơn hàng từ đâu?"],
    },
  },

  fpi: {
    alsoCalled: ["Đầu tư gián tiếp nước ngoài", "Vốn ngoại trên chứng khoán"],
    nuances: [
      "**Số âm nghĩa là vốn rút ra nhiều hơn vào.** Không phải số lỗi.",
      "**Khác với FDI, vốn này đi rất nhanh.** Bán cổ phiếu chỉ cần vài cú bấm, còn nhà máy thì không thể mang đi.",
      "**Con số ở đây là tỷ đô la**, không phải tỷ lệ so với GDP như thẻ FDI, nên đừng so trực tiếp.",
    ],
    worked: {
      title: "Dòng vốn gián tiếp ròng",
      rows: [
        { label: "Năm 2007", value: "vào khoảng 6,2 tỷ USD" },
        { label: "Năm 2024", value: "rút ra khoảng 5,7 tỷ USD" },
        { label: "Năm 2025", value: "rút ra khoảng 4,9 tỷ USD" },
      ],
      note: "Khi vốn rút ra, người bán đổi tiền đồng sang đô la mang đi, tạo sức ép lên tỷ giá.",
    },
    whyMatters:
      "**Đây là dòng tiền nhạy với tâm lý nhất.** Vốn ngoại rút mạnh có thể làm chứng khoán giảm và [[fx_rate|tỷ giá]] căng trong thời gian ngắn, nhất là khi [[fed_rate|lãi suất Mỹ]] cao.",
    whenMisleading:
      "**Vốn rút ra không có nghĩa kinh tế Việt Nam xấu đi.** Năm 2025 vốn vẫn rút ra trong khi tăng trưởng tới 8,02%. Nhiều khi nhà đầu tư chỉ đang chuyển tiền về nơi có lãi cao hơn.",
    breakdowns: [
      { by: "Cổ phiếu và trái phiếu", reveals: "vốn đang rời khỏi loại tài sản nào" },
      { by: "Theo tháng", reveals: "rút đột ngột hay rút đều" },
      { by: "So với các nước khác", reveals: "chỉ Việt Nam hay cả khu vực bị rút vốn" },
      { by: "Chênh lệch lãi suất", reveals: "lãi suất Mỹ có đang hút tiền về không" },
    ],
    questions: {
      explore: ["Các nước khác trong khu vực có bị rút vốn cùng lúc không?", "Vốn rút vì lãi suất Mỹ hay vì câu chuyện riêng của Việt Nam?"],
      decide: ["Nếu đầu tư chứng khoán, mình có đang quyết định chỉ theo động thái của khối ngoại không?"],
    },
  },

  remittances: {
    alsoCalled: ["Tiền gửi về từ nước ngoài"],
    nuances: [
      "**Con số 16 tỷ USD năm 2024 là ước tính.** Riêng TP.HCM có số chính thức 9,55 tỷ USD.",
      "**Thẻ này không có chuỗi số theo năm trong ứng dụng.** Vì vậy không có biểu đồ.",
      "**Tiền đi qua kênh không chính thức khó đo hết.** Con số thật có thể khác.",
    ],
    worked: {
      title: "Kiều hối năm 2024",
      rows: [
        { label: "Cả nước (ước tính)", value: "khoảng 16 tỷ USD" },
        { label: "Riêng TP.HCM", value: "9,55 tỷ USD" },
      ],
      note: "Hơn một nửa số ước tính của cả nước đổ về TP.HCM.",
    },
    whyMatters:
      "**Đây là nguồn đô la khá ổn định và trực tiếp vào túi các gia đình.** Nó vừa đỡ [[fx_rate|tỷ giá]], vừa giúp nhiều gia đình chi tiêu, xây nhà, cho con đi học.",
    whenMisleading:
      "**Kiều hối tăng không phải lúc nào cũng vì người thân gửi nhiều hơn để chi tiêu.** Một phần có thể đi vào bất động sản hoặc gửi ngân hàng, nên tác động lên tiêu dùng khó đoán.",
    breakdowns: [
      { by: "Địa phương nhận", reveals: "tiền về nơi nào nhiều nhất" },
      { by: "Nước gửi", reveals: "phụ thuộc vào kinh tế Mỹ, Nhật, Hàn Quốc hay châu Âu" },
      { by: "Kiều bào và người đi lao động", reveals: "hai nhóm có động cơ gửi tiền khác nhau" },
      { by: "Mục đích sử dụng", reveals: "tiền đi vào tiêu dùng, nhà đất hay kinh doanh" },
    ],
    questions: {
      explore: ["Kiều hối tăng vì kinh tế nước gửi tốt lên hay vì lý do khác?", "Tiền về đang được dùng vào việc gì?"],
      decide: ["Nếu gia đình mình nhận kiều hối, khoản này có đang được để dành cho lúc khó khăn không?"],
    },
  },

  current_account: {
    alsoCalled: ["Tài khoản vãng lai"],
    nuances: [
      "**Rộng hơn xuất khẩu ròng.** Nó còn tính lợi nhuận chuyển ra nước ngoài và [[remittances|kiều hối]] gửi về.",
      "**Số dương là cả nước thu về nhiều ngoại tệ hơn chi ra.** Xem thêm [[can-can-thanh-toan|cán cân thanh toán]].",
      "**Đây là tỷ lệ so với GDP**, không phải số đô la.",
    ],
    worked: {
      title: "Cứ 100 đồng GDP",
      rows: [
        { label: "Năm 2008", value: "thiếu khoảng 10,9 đồng" },
        { label: "Năm 2021", value: "thiếu khoảng 1,3 đồng" },
        { label: "Năm 2025", value: "dư khoảng 6,4 đồng" },
      ],
      note: "Năm 2008 cả nước chi ngoại tệ nhiều hơn thu rất lớn. Đó là một lý do tỷ giá căng thẳng trong giai đoạn đó.",
    },
    whyMatters:
      "**Đây giống như sổ thu chi đô la của cả nước.** Thặng dư giúp tăng [[reserves|dự trữ]] và đỡ tỷ giá; thâm hụt kéo dài thì phải vay hoặc nhận vốn từ nước ngoài để bù.",
    whenMisleading:
      "**Thặng dư lớn không phải lúc nào cũng tốt.** Nó có thể phản ánh việc đầu tư và nhập khẩu yếu đi. Thâm hụt cũng có thể chấp nhận được nếu tiền dùng để mua máy móc sinh lời.",
    breakdowns: [
      { by: "Hàng hóa", reveals: "xuất siêu đóng góp bao nhiêu" },
      { by: "Dịch vụ", reveals: "du lịch, vận tải có đang thiếu hụt không" },
      { by: "Thu nhập chuyển ra", reveals: "lợi nhuận FDI chuyển về nước họ là bao nhiêu" },
      { by: "Chuyển giao", reveals: "kiều hối bù được bao nhiêu" },
    ],
    questions: {
      explore: ["Thặng dư đến từ xuất khẩu mạnh hay từ nhập khẩu yếu?", "Lợi nhuận chuyển ra nước ngoài có đang tăng không?"],
      decide: ["Mình có thể đọc tin cán cân vãng lai và giải thích lại bằng lời cho người thân không?"],
    },
  },

  reserves: {
    alsoCalled: ["Dự trữ quốc tế"],
    nuances: [
      "**Đây là tiền của Ngân hàng Nhà nước, không phải tiền ngân sách để chi tiêu.** Nó gồm ngoại tệ và vàng.",
      "**Quy mô tuyệt đối chưa đủ.** Nên so với nhu cầu, thường tính theo [[so-thang-nhap-khau|số tháng nhập khẩu]].",
      "**Số liệu có độ trễ.** Ngân hàng Nhà nước không công bố thường xuyên như các chỉ số khác.",
    ],
    worked: {
      title: "Dự trữ khi đỡ tỷ giá",
      rows: [
        { label: "Năm 2021", value: "khoảng 109,4 tỷ USD" },
        { label: "Năm 2022", value: "khoảng 86,5 tỷ USD" },
        { label: "Thay đổi", value: "giảm khoảng 22,8 tỷ USD" },
      ],
      note: "Năm 2022, khi Fed tăng lãi suất mạnh, Ngân hàng Nhà nước bán đô la để đỡ tiền đồng.",
    },
    whyMatters:
      "**Đây là khoản dự phòng của cả nước.** Khi tiền đồng chịu sức ép, Ngân hàng Nhà nước có thể bán đô la để đỡ. Dự trữ càng dày, thế giới càng tin Việt Nam trả được tiền nhập khẩu và nợ.",
    whenMisleading:
      "**Dự trữ giảm không phải lúc nào cũng đáng lo.** Đó có thể là dùng đúng mục đích. Ngược lại, số tuyệt đối lớn vẫn có thể mỏng nếu nhập khẩu tăng nhanh hơn, như mức khoảng 2,1 tháng nhập khẩu năm 2025.",
    breakdowns: [
      { by: "Số tháng nhập khẩu", reveals: "đủ trả tiền hàng trong bao lâu" },
      { by: "So với nợ nước ngoài ngắn hạn", reveals: "có đủ trả nợ tới hạn không" },
      { by: "Thay đổi trong năm", reveals: "đang mua vào hay bán ra" },
      { by: "Vàng và ngoại tệ", reveals: "dự trữ gồm những gì" },
    ],
    questions: {
      explore: ["Dự trữ giảm vì Ngân hàng Nhà nước đỡ tỷ giá hay vì lý do khác?", "Lượng dự trữ hiện đủ bao nhiêu tháng nhập khẩu?"],
      decide: ["Khi đọc tin dự trữ giảm, mình có kiểm tra xem nó đủ dùng bao lâu trước khi lo không?"],
    },
  },
};
