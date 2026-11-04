import type { IndicatorProfile } from "../indicatorProfiles";

/** Hồ sơ nhóm tiền tệ, ngân hàng và lãi suất. */
export const MONEY_PROFILES: Record<string, IndicatorProfile> = {
  lending_rate: {
    alsoCalled: ["Lãi vay ngân hàng"],
    nuances: [
      "**Đây là mức trung bình.** Khoản vay của bạn có thể cao hơn hoặc thấp hơn tùy kỳ hạn, tài sản thế chấp và mức rủi ro ngân hàng đánh giá.",
      "**Lãi ưu đãi không phải lãi thật.** Nhiều khoản vay mua nhà chỉ ưu đãi vài năm đầu, sau đó thả nổi theo thị trường.",
      "**Lãi suất đổi chậm.** Sau khi [[policy_rate|lãi suất điều hành]] thay đổi, lãi vay thường phải vài tháng mới đổi theo.",
    ],
    worked: {
      title: "Vay 100 triệu đồng, trả lãi một năm",
      rows: [
        { label: "Lãi suất bình quân năm 2011: 16,95%", value: "khoảng 17 triệu đồng" },
        { label: "Lãi suất bình quân năm 2023: 9,32%", value: "khoảng 9,3 triệu đồng" },
      ],
      note: "Cùng số tiền vay, tiền lãi năm 2011 cao gần gấp đôi năm 2023. Đây là phép tính đơn giản, chưa tính việc trả dần tiền gốc.",
    },
    whyMatters:
      "**Đây là giá của tiền mà người dân và doanh nghiệp thực sự trả.** Lãi vay cao thì ít người mua nhà, mua xe, ít doanh nghiệp mở xưởng. Năm 2011, lãi vay bình quân gần 17% là một lý do khiến nhiều doanh nghiệp gặp khó.",
    whenMisleading:
      "**Lãi cao chưa chắc là tiền đắt.** Năm 2011 lãi vay gần 17% nhưng [[cpi|lạm phát]] cũng gần 19%, nên phải xem cùng [[real_rate|lãi suất thực]]. Lãi thấp cũng chưa chắc vay được, vì ngân hàng có thể từ chối khách rủi ro.",
    breakdowns: [
      { by: "Kỳ hạn vay", reveals: "vay ngắn hạn và dài hạn có mức lãi khác nhau" },
      { by: "Người vay", reveals: "so doanh nghiệp lớn, doanh nghiệp nhỏ và cá nhân để biết ai vay khó hơn" },
      { by: "Mục đích vay", reveals: "vay sản xuất, mua nhà hay tiêu dùng thường có mức lãi khác nhau" },
      { by: "So với lãi tiền gửi", reveals: "khoảng cách giữa lãi vay và lãi gửi cho biết phần ngân hàng giữ lại" },
    ],
    questions: {
      explore: ["Lãi vay tăng do Ngân hàng Nhà nước, hay do ngân hàng thiếu tiền?", "Lãi vay đang cao hơn hay thấp hơn lạm phát?"],
      decide: ["Nếu lãi tăng thêm 2 điểm phần trăm, gia đình mình còn trả nổi khoản vay không?"],
    },
  },

  credit: {
    alsoCalled: ["Dư nợ tín dụng", "Tín dụng cho khu vực tư nhân"],
    nuances: [
      "**Con số ở đây là tổng dư nợ, không phải tốc độ tăng.** Báo chí hay nói \"tín dụng tăng 15%\", còn thẻ này cho biết tổng nợ lớn cỡ nào so với quy mô nền kinh tế.",
      "**Trên 100% GDP nghĩa là tổng nợ lớn hơn số hàng hóa làm ra trong một năm.** Đây không phải là phép tính sai.",
      "**Số trong ứng dụng chỉ tới năm 2022.** Đừng coi đó là tình hình hiện tại.",
    ],
    worked: {
      title: "Cứ 100 đồng nền kinh tế làm ra trong năm",
      rows: [
        { label: "Năm 2007", value: "dư nợ khoảng 86 đồng" },
        { label: "Năm 2022", value: "dư nợ khoảng 125 đồng" },
      ],
      note: "Nền kinh tế ngày càng dựa vào tiền vay ngân hàng. Đó là một lý do vì sao lãi suất tác động mạnh ở Việt Nam.",
    },
    whyMatters:
      "**Tiền vay là nhiên liệu của nền kinh tế.** Doanh nghiệp vay để mở rộng, gia đình vay để mua nhà. Tín dụng tăng quá nhanh dễ dẫn tới [[cpi|lạm phát]] và [[no-xau|nợ xấu]]; tăng quá chậm thì sản xuất thiếu vốn.",
    whenMisleading:
      "**Tín dụng tăng chưa chắc vào sản xuất.** Tiền có thể chảy vào bất động sản hay chứng khoán. Con số tổng không cho biết tiền đi đâu, và cũng không cho biết khoản vay có trả được không.",
    breakdowns: [
      { by: "Ngành", reveals: "tiền đang vào sản xuất, bất động sản hay tiêu dùng" },
      { by: "Người vay", reveals: "doanh nghiệp lớn, doanh nghiệp nhỏ hay hộ gia đình đang vay nhiều" },
      { by: "Kỳ hạn", reveals: "vốn ngắn hạn có đang được dùng cho dự án dài hạn không" },
      { by: "Chất lượng khoản vay", reveals: "[[no-xau|nợ xấu]] có tăng theo dư nợ không" },
    ],
    questions: {
      explore: ["Tín dụng tăng nhanh hơn hay chậm hơn tăng trưởng GDP?", "Phần tín dụng tăng thêm đang chảy vào đâu?"],
      decide: ["Gia đình mình đang nợ bao nhiêu so với thu nhập một năm?"],
    },
  },

  m2: {
    alsoCalled: ["Tổng phương tiện thanh toán"],
    nuances: [
      "**Con số ở đây là tốc độ tăng.** 5,7% năm 2022 không có nghĩa tiền giảm, mà là tiền tăng thêm 5,7% so với năm trước.",
      "**M2 không chỉ là tiền mặt.** Nó gồm cả tiền gửi ngân hàng, vì đó cũng là tiền bạn có thể dùng để chi.",
      "**Tiền tăng chủ yếu khi ngân hàng cho vay.** Vì vậy M2 và [[credit|tín dụng]] thường đi cùng nhau.",
    ],
    worked: {
      title: "Lượng tiền trong một năm",
      rows: [
        { label: "Đầu năm 2007", value: "100 đồng" },
        { label: "Tăng 49,11% trong năm 2007", value: "cuối năm khoảng 149 đồng" },
        { label: "Nếu tăng 5,68% như năm 2022", value: "cuối năm khoảng 106 đồng" },
      ],
      note: "Năm 2007, tiền tăng gần một nửa trong một năm. Năm sau đó lạm phát lên trên 23%.",
    },
    whyMatters:
      "**Tiền tăng nhanh hơn hàng hóa thì giá cả dễ tăng.** Theo dõi M2 giúp thấy sớm sức ép lạm phát. Năm 2007 M2 tăng hơn 49%, và năm 2008 [[cpi|lạm phát]] lên 23,12%.",
    whenMisleading:
      "**Tiền nhiều chưa chắc giá tăng ngay.** Nếu tiền nằm yên trong tài khoản, người dân không chi tiêu, giá có thể không đổi. Độ trễ cũng dài, có khi cả năm trở lên.",
    breakdowns: [
      { by: "Tiền mặt và tiền gửi", reveals: "người dân đang giữ tiền để chi hay để dành" },
      { by: "Tiền gửi đồng và ngoại tệ", reveals: "mọi người có đang chuyển sang giữ đô la không" },
      { by: "Nguồn tạo ra tiền", reveals: "tiền tăng do cho vay, do Ngân hàng Nhà nước mua đô la hay do Chính phủ chi" },
      { by: "So với GDP", reveals: "tiền có tăng nhanh hơn hàng hóa làm ra không" },
    ],
    questions: {
      explore: ["M2 có đang tăng nhanh hơn tăng trưởng GDP không?", "Tiền tăng thêm đang đến từ tín dụng hay từ nguồn khác?"],
      decide: ["Nếu tiền tăng nhanh và giá có thể lên, mình có đang giữ quá nhiều tiền mặt không?"],
    },
  },

  real_rate: {
    alsoCalled: ["Lãi suất sau khi trừ lạm phát"],
    nuances: [
      "**Công thức đơn giản: lãi suất trừ đi mức tăng giá.** Bạn được trả 7% mà giá tăng 5% thì thật ra chỉ giàu thêm khoảng 2%.",
      "**Số trong ứng dụng không trừ CPI.** World Bank dùng [[chi-so-giam-phat-gdp|chỉ số giảm phát GDP]], nên kết quả có thể khác phép tính bằng lạm phát CPI.",
      "**Lãi thực có thể âm.** Khi đó người gửi tiền mất sức mua, còn người vay được lợi.",
    ],
    worked: {
      title: "Năm 2023 và năm 2008",
      rows: [
        { label: "Năm 2023: lãi cho vay", value: "9,32%" },
        { label: "Năm 2023: lãi thực", value: "7,01%" },
        { label: "Năm 2008: lãi thực", value: "−5,62%" },
      ],
      note: "Năm 2008 lãi vay trên 15% nghe rất cao, nhưng giá cả tăng còn nhanh hơn. Năm 2023 lãi thấp hơn nhiều mà tiền thật ra lại đắt hơn.",
    },
    whyMatters:
      "**Đây là thước đo tiền đang đắt hay rẻ.** Người ta quyết định vay hay gửi dựa trên phần còn lại sau lạm phát, không phải con số trên biển quảng cáo. Nó cho biết chính sách đang thật sự chặt hay lỏng.",
    whenMisleading:
      "**Một năm nào đó có thể bị méo.** Năm 2010, số liệu từng xuống −20,5% vì đổi phương pháp tính, không phản ánh chi phí vay thật. Ngoài ra đây là lạm phát đã xảy ra, trong khi người đi vay quan tâm giá cả sắp tới.",
    breakdowns: [
      { by: "Lãi vay trừ lạm phát", reveals: "chi phí thật của người đi vay" },
      { by: "Lãi gửi trừ lạm phát", reveals: "tiền gửi có giữ được sức mua không" },
      { by: "Dùng CPI hay chỉ số giảm phát", reveals: "hai cách tính cho kết quả chênh nhau bao nhiêu" },
      { by: "So với lãi thực của Mỹ", reveals: "giữ tiền đồng có còn hấp dẫn hơn giữ đô la không" },
    ],
    questions: {
      explore: ["Lãi thực thay đổi vì lãi suất đổi, hay vì lạm phát đổi?", "Lãi thực đang cao hơn hay thấp hơn các năm trước?"],
      decide: ["Sau khi trừ lạm phát, tiền gửi tiết kiệm của mình còn sinh lời không?"],
    },
  },

  interbank: {
    alsoCalled: ["Lãi suất qua đêm"],
    nuances: [
      "**Người dân không vay ở mức lãi này.** Đây là giá các ngân hàng cho nhau vay, thường chỉ qua một đêm.",
      "**Ứng dụng chưa có chuỗi số theo năm.** Con số này đổi từng ngày, nên trung bình năm không nói lên nhiều.",
      "**Nó có thể nhảy rất mạnh trong vài ngày.** Một đợt căng thẳng ngắn chưa chắc là xu hướng.",
    ],
    worked: {
      title: "Ví dụ giả định, không phải số liệu thật",
      rows: [
        { label: "Cuối ngày ngân hàng A thiếu", value: "100 tỷ đồng" },
        { label: "Ngân hàng B đang thừa tiền, cho vay qua đêm", value: "100 tỷ đồng" },
        { label: "Nếu nhiều ngân hàng cùng thiếu", value: "giá vay qua đêm tăng" },
      ],
      note: "Giống như chợ tiền giữa các ngân hàng: người cần nhiều mà người bán ít thì giá lên.",
    },
    whyMatters:
      "**Đây là nhiệt kế của hệ thống ngân hàng.** Nó phản ứng rất sớm, trước cả [[lending_rate|lãi suất cho vay]]. Lãi liên ngân hàng tăng cho thấy tiền đang căng, hoặc Ngân hàng Nhà nước đang chủ động hút tiền về.",
    whenMisleading:
      "**Tăng vọt cuối quý hay cuối năm thường là chuyện theo mùa.** Ngân hàng cần nhiều tiền hơn vào những thời điểm đó. Hãy xem nó kéo dài bao lâu trước khi kết luận.",
    breakdowns: [
      { by: "Kỳ hạn", reveals: "qua đêm, một tuần hay một tháng cho thấy mức căng thẳng khác nhau" },
      { by: "So với lãi suất điều hành", reveals: "tiền trong hệ thống đang thừa hay thiếu" },
      { by: "Thời điểm trong năm", reveals: "tách phần căng thẳng theo mùa, như dịp Tết" },
      { by: "So với lãi suất USD", reveals: "chênh lệch này tác động tới [[fx_rate|tỷ giá]]" },
    ],
    questions: {
      explore: ["Lãi liên ngân hàng tăng trong vài ngày hay kéo dài nhiều tuần?", "Ngân hàng Nhà nước đang bơm tiền hay hút tiền?"],
      decide: ["Nếu đây là dấu hiệu tiền căng kéo dài, lãi vay của mình có thể tăng khi nào?"],
    },
  },

  omo: {
    alsoCalled: ["Nghiệp vụ thị trường mở", "Tín phiếu Ngân hàng Nhà nước"],
    nuances: [
      "**Đây là cách điều chỉnh lượng tiền hằng ngày.** Khác với lãi suất điều hành chỉ đổi vài năm một lần, công cụ này diễn ra gần như mỗi ngày.",
      "**Bơm và hút là hai chiều.** Cho ngân hàng vay là bơm tiền ra; bán [[tin-phieu|tín phiếu]] là hút tiền về.",
      "**Thẻ này là khái niệm, không có số theo năm.** Điều quan trọng là chiều bơm hay hút, không phải một con số.",
    ],
    worked: {
      title: "Ví dụ giả định, không phải số liệu thật",
      rows: [
        { label: "Các ngân hàng đang thừa", value: "10.000 tỷ đồng" },
        { label: "Ngân hàng Nhà nước bán tín phiếu", value: "hút về 6.000 tỷ đồng" },
        { label: "Tiền thừa còn lại", value: "4.000 tỷ đồng" },
      ],
      note: "Tiền ít đi thì giá vay giữa các ngân hàng tăng, và đồng tiền thường được đỡ hơn.",
    },
    whyMatters:
      "**Đây là cách nhanh nhất để thấy Ngân hàng Nhà nước đang muốn gì.** Có khi lãi suất điều hành đứng yên nhưng công cụ này đã thắt lại, nhất là khi cần đỡ [[fx_rate|tỷ giá]].",
    whenMisleading:
      "**Hút tiền một ngày không có nghĩa chính sách đã đổi hướng.** Phải nhìn lượng ròng trong vài tuần. Tin \"bơm ròng\" cũng có thể chỉ là xử lý khoản đáo hạn.",
    breakdowns: [
      { by: "Bơm ròng hay hút ròng", reveals: "chiều đi chung của chính sách" },
      { by: "Kỳ hạn", reveals: "ngắn hạn là xử lý tình thế, dài hơn là chủ ý" },
      { by: "Lãi suất trúng thầu", reveals: "giá tiền Ngân hàng Nhà nước đang chấp nhận" },
      { by: "So với tỷ giá", reveals: "hút tiền có đi cùng đợt căng thẳng tỷ giá không" },
    ],
    questions: {
      explore: ["Mấy tuần gần đây Ngân hàng Nhà nước bơm ròng hay hút ròng?", "Động thái này có đi cùng căng thẳng tỷ giá không?"],
      decide: ["Tin về bơm hút tiền có thực sự liên quan tới quyết định tài chính của mình không?"],
    },
  },

  credit_quota: {
    alsoCalled: ["Hạn mức tăng trưởng tín dụng", "Room tín dụng"],
    nuances: [
      "**Đây là giới hạn hành chính, không phải giá.** Lãi suất làm tiền đắt hơn, còn room trực tiếp chặn lượng tiền được cho vay.",
      "**Mỗi ngân hàng được giao mức khác nhau.** Ngân hàng hết room có thể từ chối khách dù khách đủ điều kiện.",
      "**Chỉ tiêu có thể điều chỉnh trong năm.** Con số đầu năm chưa chắc là con số cuối năm.",
    ],
    worked: {
      title: "Chỉ tiêu năm 2025, dư nợ là số giả định",
      rows: [
        { label: "Chỉ tiêu tăng tín dụng năm 2024", value: "khoảng 15%" },
        { label: "Chỉ tiêu tăng tín dụng năm 2025", value: "khoảng 16%" },
        { label: "Ngân hàng có dư nợ 100 tỷ đồng (giả định)", value: "cho vay tới khoảng 116 tỷ đồng" },
      ],
      note: "Chỉ tiêu 16% là số Ngân hàng Nhà nước công bố cho toàn hệ thống; phần dư nợ 100 tỷ đồng chỉ là ví dụ.",
    },
    whyMatters:
      "**Công cụ này giải thích vì sao có lúc lãi thấp mà vẫn khó vay.** Nó giúp kiểm soát [[credit|tín dụng]] nhanh, nhưng cũng khiến dòng vốn phụ thuộc vào hạn mức thay vì vào nhu cầu của thị trường.",
    whenMisleading:
      "**Chỉ tiêu cao không có nghĩa tiền sẽ chảy ra nhiều.** Nếu doanh nghiệp không muốn vay, room vẫn còn thừa. Hãy so mức thực hiện với chỉ tiêu.",
    breakdowns: [
      { by: "Theo ngân hàng", reveals: "ngân hàng nào được giao nhiều, ngân hàng nào đã gần hết room" },
      { by: "Chỉ tiêu và thực hiện", reveals: "nhu cầu vay đang mạnh hay yếu" },
      { by: "Theo thời điểm trong năm", reveals: "tín dụng có dồn vào những tháng cuối năm không" },
      { by: "Theo ngành", reveals: "room được ưu tiên cho lĩnh vực nào" },
    ],
    questions: {
      explore: ["Tín dụng thực tế đang ở đâu so với chỉ tiêu năm?", "Lãi suất và room đang đi cùng hướng hay ngược hướng?"],
      decide: ["Nếu định vay vào cuối năm, mình có nên hỏi ngân hàng trước về hạn mức còn lại không?"],
    },
  },
};
