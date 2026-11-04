import type { IndicatorProfile } from "../indicatorProfiles";

/** Hồ sơ nhóm ngân sách và nợ công. */
export const FISCAL_PROFILES: Record<string, IndicatorProfile> = {
  gov_spending: {
    alsoCalled: ["Chi tiêu dùng của Nhà nước", "Chữ G trong công thức GDP"],
    nuances: [
      "**Con số này không phải toàn bộ chi ngân sách.** Xây đường, làm cầu thuộc [[public_investment|đầu tư công]], nằm trong phần đầu tư.",
      "**Năm 2010 tỷ lệ nhảy gần gấp đôi.** Đây là do đổi phương pháp tính, không phải chi tiêu thật tăng gấp đôi.",
      "**Đây là tỷ trọng so với GDP.** Tỷ trọng giảm vẫn có thể là số tiền tăng, nếu GDP tăng nhanh hơn.",
    ],
    worked: {
      title: "Cứ 100 đồng GDP",
      rows: [
        { label: "Năm 2019", value: "khoảng 9,6 đồng" },
        { label: "Năm 2023", value: "khoảng 8,8 đồng" },
        { label: "Năm 2025", value: "khoảng 9,4 đồng" },
      ],
      note: "Đây là phần trả lương công chức, vận hành trường học, bệnh viện và bộ máy.",
    },
    whyMatters:
      "**Đây là cách Nhà nước trực tiếp đưa tiền vào nền kinh tế.** Tăng lương công chức thì hàng triệu người có thêm tiền chi tiêu. Khi tư nhân yếu đi, Nhà nước có thể chi thêm để đỡ tăng trưởng.",
    whenMisleading:
      "**Chi nhiều chưa chắc tốt, chi ít chưa chắc xấu.** Điều quan trọng là tiền được dùng vào đâu và có đổi lấy dịch vụ tốt không. So với [[fiscal_balance|cân bằng ngân sách]] để biết có phải đi vay để chi không.",
    breakdowns: [
      { by: "Lương và hoạt động", reveals: "phần chi cho bộ máy là bao nhiêu" },
      { by: "Y tế, giáo dục", reveals: "tiền đang đổi lấy dịch vụ công nào" },
      { by: "Trung ương và địa phương", reveals: "nơi nào đang chi nhiều" },
      { by: "So với thu ngân sách", reveals: "chi có vượt phần thu được không" },
    ],
    questions: {
      explore: ["Chi tăng thêm đang đến từ lương hay từ dịch vụ công?", "Nguồn tiền để chi là từ thuế hay từ đi vay?"],
      decide: ["Mình có đang thấy trường học, bệnh viện gần nhà tốt lên tương ứng không?"],
    },
  },

  tax: {
    alsoCalled: ["Tổng thu ngân sách", "Thu ngân sách so với GDP"],
    nuances: [
      "**Con số gồm cả thuế, phí và thu từ tài nguyên**, không chỉ thuế.",
      "**Thuế có nhiều loại.** Thuế giá trị gia tăng ai mua hàng cũng trả, thuế thu nhập cá nhân tính trên lương, thuế doanh nghiệp tính trên lợi nhuận.",
      "**Năm gần nhất của IMF có thể vẫn là số ước tính.**",
    ],
    worked: {
      title: "Cứ 100 đồng GDP, Nhà nước thu được",
      rows: [
        { label: "Năm 2007", value: "khoảng 20,6 đồng" },
        { label: "Năm 2024", value: "khoảng 17,6 đồng" },
      ],
      note: "Tỷ lệ này giảm dần, nhưng GDP lớn lên nhiều nên số tiền thu được không nhất thiết giảm.",
    },
    whyMatters:
      "**Thuế là cần gạt thứ hai của Nhà nước, bên cạnh chi tiêu.** Giảm thuế để lại nhiều tiền hơn cho dân và doanh nghiệp. Năm 2022, Việt Nam giảm thuế giá trị gia tăng và thuế xăng dầu để hỗ trợ phục hồi và kìm giá.",
    whenMisleading:
      "**Thu ngân sách tăng chưa chắc vì tăng thuế.** Kinh tế tốt, nhà đất mua bán nhiều thì thu cũng tăng. Giảm thuế cũng không phải lúc nào cũng làm người mua trả ít hơn, vì người bán có thể giữ lại một phần.",
    breakdowns: [
      { by: "Loại thuế", reveals: "thu từ tiêu dùng, thu nhập hay doanh nghiệp" },
      { by: "Thu từ đất đai và dầu thô", reveals: "phần thu một lần hoặc dao động theo giá" },
      { by: "Trong nước và xuất nhập khẩu", reveals: "ngân sách phụ thuộc vào đâu" },
      { by: "Thu so với dự toán", reveals: "kinh tế tốt hơn hay xấu hơn kế hoạch" },
    ],
    questions: {
      explore: ["Thu tăng do kinh tế tốt lên, hay do thu một lần như đất đai?", "Giảm thuế gần đây có làm giá bán giảm thật không?"],
      decide: ["Mình có biết mỗi tháng đang đóng những loại thuế nào không?"],
    },
  },

  public_investment: {
    alsoCalled: ["Vốn đầu tư công", "Giải ngân đầu tư công"],
    nuances: [
      "**Đầu tư công nằm trong chữ I, không nằm trong chữ G.** Xem thêm [[dau-tu-cong|thuật ngữ đầu tư công]].",
      "**Kế hoạch khác với số tiền đã chi.** Tiền chỉ tác động tới kinh tế khi thật sự được giải ngân.",
      "**Tỷ lệ giải ngân phụ thuộc vào mốc tính.** Cùng một năm 2024, con số tới 31/12 là 80,32%, còn con số 93% hay gặp trên báo là lũy kế tới 31/1/2025.",
    ],
    worked: {
      title: "Giải ngân năm 2024, tính tới 31/12/2024",
      rows: [
        { label: "Đã giải ngân", value: "548.569 tỷ đồng" },
        { label: "So với kế hoạch Thủ tướng giao", value: "80,32%" },
        { label: "So với tổng kế hoạch", value: "72,9%" },
      ],
      note: "Tức là gần một phần năm kế hoạch được giao chưa được giải ngân tới cuối năm.",
    },
    whyMatters:
      "**Đường sá, cảng biển vừa tạo việc làm ngay, vừa giúp nền kinh tế chạy tốt hơn về sau.** Vì vậy Chính phủ thường đôn đốc giải ngân khi muốn đỡ tăng trưởng.",
    whenMisleading:
      "**Giải ngân nhanh chưa chắc là tốt.** Đẩy tiền ra vội vàng để kịp chỉ tiêu có thể làm giảm chất lượng công trình. Hãy nhìn cả hiệu quả của dự án, không chỉ tỷ lệ.",
    breakdowns: [
      { by: "Bộ ngành và địa phương", reveals: "nơi nào giải ngân chậm" },
      { by: "Giai đoạn dự án", reveals: "chậm vì giải phóng mặt bằng hay vì thủ tục" },
      { by: "Lĩnh vực", reveals: "giao thông, năng lượng hay y tế" },
      { by: "Mốc thời gian", reveals: "tính tới cuối năm hay hết tháng 1 năm sau" },
    ],
    questions: {
      explore: ["Con số giải ngân được tính tới mốc nào?", "Vì sao giải ngân chậm: đất đai, thủ tục hay vật liệu?"],
      decide: ["Dự án hạ tầng gần nơi mình sống có đang đúng tiến độ không?"],
    },
  },

  fiscal_balance: {
    alsoCalled: ["Bội chi ngân sách", "Thâm hụt ngân sách"],
    nuances: [
      "**Số âm là chi nhiều hơn thu.** Phần thiếu phải đi vay, thường bằng trái phiếu chính phủ.",
      "**Số dương chưa chắc là tiết kiệm được vì chi tiêu hợp lý.** Có thể do chi chậm, chẳng hạn giải ngân không kịp.",
      "**Số ở đây theo định nghĩa của IMF**, nên có thể khác số Quốc hội công bố.",
    ],
    worked: {
      title: "Cứ 100 đồng GDP, thu trừ chi",
      rows: [
        { label: "Năm 2009", value: "thiếu khoảng 4,8 đồng" },
        { label: "Năm 2015", value: "thiếu khoảng 5 đồng" },
        { label: "Năm 2022", value: "dư khoảng 0,7 đồng" },
      ],
      note: "Năm 2009 thiếu nhiều vì Nhà nước chi thêm để đỡ kinh tế giữa khủng hoảng toàn cầu.",
    },
    whyMatters:
      "**Nó cho biết Nhà nước có sống trong khả năng của mình không.** Thiếu hụt khi khó khăn là bình thường, nhưng thiếu hụt liên tục sẽ làm [[public_debt|nợ công]] tăng.",
    whenMisleading:
      "**Thâm hụt không phải lúc nào cũng xấu.** Vay để xây hạ tầng có ích khác với vay để chi thường xuyên. Năm dịch bệnh 2020, thâm hụt 2,9% là để đỡ nền kinh tế.",
    breakdowns: [
      { by: "Chi thường xuyên và đầu tư", reveals: "vay để làm gì" },
      { by: "Thu một lần", reveals: "thu từ đất đai có đang che phần thiếu hụt không" },
      { by: "Theo chu kỳ", reveals: "thiếu hụt do kinh tế yếu hay do cách chi" },
      { by: "Nguồn bù đắp", reveals: "vay trong nước hay vay nước ngoài" },
    ],
    questions: {
      explore: ["Thâm hụt năm nay là do chi nhiều lên hay thu ít đi?", "Tiền vay được dùng cho đầu tư hay cho chi thường xuyên?"],
      decide: ["Khi nghe tin bội chi, mình có phân biệt được vay để đầu tư và vay để chi tiêu không?"],
    },
  },

  public_debt: {
    alsoCalled: ["Nợ chính phủ"],
    nuances: [
      "**Đây là tổng nợ tích lũy, còn bội chi là phần thiếu của một năm.** Bội chi cộng dồn lại thành nợ.",
      "**Tỷ lệ nợ có thể giảm mà số tiền nợ không giảm.** Chỉ cần GDP tăng nhanh hơn nợ.",
      "**Con số của IMF có thể khác số của Bộ Tài chính** vì phạm vi tính không giống nhau.",
    ],
    worked: {
      title: "Nợ công so với GDP",
      rows: [
        { label: "Năm 2015", value: "46,1%" },
        { label: "Năm 2021", value: "39,2%" },
        { label: "Năm 2025", value: "30,5%" },
      ],
      note: "Tức là nợ tương đương chưa tới một phần ba số hàng hóa làm ra trong năm 2025.",
    },
    whyMatters:
      "**Nợ thấp là khoản dự phòng cho lúc khó khăn.** Khi khủng hoảng đến, nước có nợ thấp vay thêm dễ hơn và có nhiều [[du-dia|dư địa]] để đỡ nền kinh tế.",
    whenMisleading:
      "**Không có con số an toàn cho mọi nước.** Điều quan trọng là khả năng trả nợ, đồng tiền vay và ai là chủ nợ. Tỷ lệ thấp cũng không tự động có nghĩa là tiền đã được dùng tốt.",
    breakdowns: [
      { by: "Nợ trong nước và nước ngoài", reveals: "chịu rủi ro tỷ giá tới đâu" },
      { by: "Kỳ hạn", reveals: "phải trả gấp bao nhiêu trong vài năm tới" },
      { by: "Tiền lãi phải trả", reveals: "nợ đang lấy đi bao nhiêu phần thu ngân sách" },
      { by: "Nợ được bảo lãnh", reveals: "có khoản nào Nhà nước có thể phải trả thay không" },
    ],
    questions: {
      explore: ["Tỷ lệ nợ giảm vì trả bớt nợ, hay vì GDP tăng?", "Khoản nợ tăng thêm được dùng cho việc gì?"],
      decide: ["Mình có nên lo khi nghe nợ công tăng, hay nên hỏi tiền vay đang được dùng vào đâu?"],
    },
  },
};
