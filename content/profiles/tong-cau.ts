import type { IndicatorProfile } from "../indicatorProfiles";

/** Hồ sơ nhóm kết quả và tổng cầu. */
export const DEMAND_PROFILES: Record<string, IndicatorProfile> = {
  gdp_growth: {
    alsoCalled: ["Tốc độ tăng trưởng kinh tế", "Tăng trưởng GDP thực"],
    nuances: [
      "**Đây là tốc độ, không phải quy mô.** Nước nhỏ có thể tăng nhanh hơn nước lớn mà vẫn nhỏ hơn nhiều.",
      "**Đã loại phần tăng do giá.** Vì vậy nó đo lượng hàng hóa làm ra nhiều hơn, không phải số tiền nhiều hơn. Xem thêm [[gdp-danh-nghia-thuc|GDP danh nghĩa và GDP thực]].",
      "**So với năm thấp thì dễ cao.** Năm 2022 tăng 8,54% có phần vì so với năm 2021 rất thấp.",
    ],
    worked: {
      title: "Nền kinh tế qua hai năm",
      rows: [
        { label: "Quy mô năm 2020 (quy ước)", value: "100" },
        { label: "Năm 2021 tăng 2,55%", value: "khoảng 102,6" },
        { label: "Năm 2022 tăng 8,54%", value: "khoảng 111,3" },
      ],
      note: "Tăng trưởng cộng dồn theo năm, nên một năm tăng rất cao sau năm rất thấp chưa chắc là kinh tế đã bứt phá.",
    },
    whyMatters:
      "**Đây là con số tóm tắt sức khỏe của cả nền kinh tế.** Tăng trưởng cao thường có nghĩa nhiều việc làm hơn và thu nhập tốt hơn. Năm 2020 và 2021, tăng trưởng còn 2,87% và 2,55%, thấp nhất trong nhiều năm, vì dịch bệnh.",
    whenMisleading:
      "**GDP cao không có nghĩa ai cũng khá hơn.** Đây là tổng cả nước, không cho biết thu nhập chia thế nào. Một phần giá trị cũng thuộc về doanh nghiệp nước ngoài, nên xem thêm [[gni|GNI]].",
    breakdowns: [
      { by: "Ai đang chi tiền", reveals: "tiêu dùng, đầu tư, Nhà nước hay xuất khẩu đang kéo tăng trưởng, xem [[dong-gop-tang-truong|đóng góp vào tăng trưởng]]" },
      { by: "Ngành", reveals: "công nghiệp, dịch vụ hay nông nghiệp đang tăng tốt" },
      { by: "Trong nước và FDI", reveals: "doanh nghiệp Việt Nam có cùng tăng trưởng không" },
      { by: "Theo quý", reveals: "kinh tế đang tăng tốc hay chậm lại trong năm" },
    ],
    questions: {
      explore: ["Phần nào đóng góp nhiều nhất vào tăng trưởng năm nay?", "Năm trước có phải là mốc so sánh quá thấp không?"],
      decide: ["Con số này có khớp với công việc và thu nhập của mình không?"],
    },
  },

  unemployment: {
    alsoCalled: ["Tỷ lệ thất nghiệp"],
    nuances: [
      "**Không đi làm chưa chắc là thất nghiệp.** Chỉ tính người không có việc và đang tìm việc. Học sinh, người nội trợ, người đã nghỉ tìm việc không được tính.",
      "**Làm vài giờ một tuần vẫn được coi là có việc.** Vì vậy cần xem thêm [[thieu-viec-lam|thiếu việc làm]].",
      "**Đây là ước tính chuẩn hóa của Tổ chức Lao động Quốc tế.** Nó có thể khác con số trong nước.",
    ],
    worked: {
      title: "Trong 1.000 người có nhu cầu đi làm",
      rows: [
        { label: "Năm 2025, tỷ lệ 1,52%", value: "khoảng 15 người thất nghiệp" },
        { label: "Năm 2021, tỷ lệ 2,38%", value: "khoảng 24 người thất nghiệp" },
      ],
      note: "Cả những năm dịch bệnh, con số này vẫn thấp. Điều đó không có nghĩa ai cũng có việc tốt.",
    },
    whyMatters:
      "**Mất việc là cách suy thoái chạm tới từng gia đình rõ nhất.** Số người thất nghiệp tăng thì tiêu dùng giảm theo, và doanh nghiệp càng khó bán hàng.",
    whenMisleading:
      "**Thất nghiệp thấp ở Việt Nam không có nghĩa việc làm tốt.** Rất nhiều người làm [[phi-chinh-thuc|lao động phi chính thức]], không hợp đồng, không bảo hiểm. Khi khó khăn, họ làm ít đi hoặc đổi sang việc thu nhập thấp hơn thay vì nghỉ hẳn.",
    breakdowns: [
      { by: "Độ tuổi", reveals: "thanh niên thường thất nghiệp cao hơn mức chung" },
      { by: "Thành thị và nông thôn", reveals: "thành phố thường chịu tác động rõ hơn" },
      { by: "Thiếu việc làm", reveals: "bao nhiêu người có việc nhưng làm không đủ giờ" },
      { by: "Thu nhập", reveals: "người có việc có đang kiếm được ít hơn không" },
    ],
    questions: {
      explore: ["Thiếu việc làm đang đi cùng hướng với thất nghiệp không?", "Lương bình quân đang tăng hay giảm?"],
      decide: ["Nếu ngành của mình đang chậm lại, mình đã có khoản dự phòng cho vài tháng không?"],
    },
  },

  consumption: {
    alsoCalled: ["Chữ C trong công thức GDP"],
    nuances: [
      "**Con số ở đây là tỷ trọng, không phải tốc độ.** Tỷ trọng giảm chưa chắc người dân chi ít đi, có thể phần khác tăng nhanh hơn.",
      "**Tỷ trọng cao không phải là tốc độ tăng cao.** Muốn biết tiêu dùng đang tăng hay giảm, phải xem tốc độ tăng thực của nó.",
      "**Khoảng năm 2010, tỷ trọng giảm mạnh.** Phần giảm này có thể liên quan tới việc đổi phương pháp tính, nên đừng đọc thẳng như một cú sụt thật.",
    ],
    worked: {
      title: "Cứ 100 đồng GDP năm 2025",
      rows: [
        { label: "Hộ gia đình chi tiêu", value: "khoảng 53 đồng" },
        { label: "Đầu tư", value: "khoảng 31 đồng" },
        { label: "Nhà nước chi tiêu", value: "khoảng 9 đồng" },
      ],
      note: "Tiêu dùng là phần lớn nhất, nên các gia đình chỉ cần thận trọng hơn một chút là cả nền kinh tế thấy ngay.",
    },
    whyMatters:
      "**Đây là phần lớn nhất của nền kinh tế.** Hơn một nửa GDP đến từ chi tiêu của các gia đình, nên người dân lạc quan hay lo lắng quyết định rất nhiều tới tăng trưởng.",
    whenMisleading:
      "**Doanh thu bán lẻ tăng chưa chắc người dân mua nhiều hơn.** Có thể chỉ là giá cao hơn. Khi đọc [[ban-le|tổng mức bán lẻ]], hãy trừ lạm phát trước.",
    breakdowns: [
      { by: "Hàng thiết yếu và không thiết yếu", reveals: "người dân có đang cắt món không cần thiết không" },
      { by: "Nhóm thu nhập", reveals: "ai đang chi nhiều hơn, ai đang thắt lưng buộc bụng" },
      { by: "Thành thị và nông thôn", reveals: "sức mua khác nhau giữa các vùng" },
      { by: "Tốc độ tăng thực", reveals: "lượng mua thật sự sau khi bỏ phần tăng giá" },
    ],
    questions: {
      explore: ["Chi tiêu tăng do người dân mua nhiều hơn, hay do giá cao hơn?", "Thu nhập có đang tăng theo chi tiêu không?"],
      decide: ["Gia đình mình đang để dành được bao nhiêu phần trăm thu nhập?"],
    },
  },

  investment: {
    alsoCalled: ["Tổng tích lũy tài sản", "Chữ I trong công thức GDP"],
    nuances: [
      "**Đầu tư ở đây không phải mua cổ phiếu.** Nó là tiền xây nhà xưởng, mua máy móc, làm đường sá, xây nhà ở.",
      "**Con số gồm cả Nhà nước, tư nhân và FDI.** Muốn biết ai đầu tư thì phải chia nhỏ.",
      "**Đây là tỷ trọng so với GDP**, không phải tốc độ tăng.",
    ],
    worked: {
      title: "Đầu tư có hiệu quả không",
      rows: [
        { label: "Năm 2023: đầu tư 31,67% GDP, tăng trưởng 4,98%", value: "cần khoảng 6,4 đồng" },
        { label: "Năm 2025: đầu tư 30,8% GDP, tăng trưởng 8,02%", value: "cần khoảng 3,8 đồng" },
      ],
      note: "Đây là cách tính gần đúng [[icor|ICOR]]: cần bao nhiêu đồng đầu tư để GDP tăng thêm một đồng. Càng thấp càng tốt, nhưng dao động theo từng năm.",
    },
    whyMatters:
      "**Đầu tư hôm nay là năng lực sản xuất ngày mai.** Nó vừa tạo việc làm ngay, vừa giúp nền kinh tế làm ra nhiều hơn về sau. Doanh nghiệp ngừng đầu tư thường là dấu hiệu họ không tin vào tương lai gần.",
    whenMisleading:
      "**Đầu tư nhiều chưa chắc đầu tư tốt.** Năm 2007 tỷ lệ gần 40% GDP, nhưng một phần vào dự án kém hiệu quả. Hãy nhìn số tiền đó tạo ra được gì, không chỉ nhìn số tiền.",
    breakdowns: [
      { by: "Nhà nước, tư nhân, FDI", reveals: "nhóm nào đang kéo đầu tư" },
      { by: "Ngành", reveals: "tiền vào sản xuất, hạ tầng hay bất động sản" },
      { by: "Hiệu quả vốn", reveals: "dùng [[icor|ICOR]] để xem mỗi đồng vốn làm ra bao nhiêu" },
      { by: "Nguồn vốn", reveals: "dựa vào vốn vay hay vốn tự có" },
    ],
    questions: {
      explore: ["Nhóm nào đang tăng đầu tư, nhóm nào đang giảm?", "Đầu tư có đang tạo thêm sản lượng tương xứng không?"],
      decide: ["Nơi mình làm việc có đang mở rộng hay giữ nguyên, và điều đó nói gì về tương lai công việc?"],
    },
  },

  net_exports: {
    alsoCalled: ["Cán cân thương mại hàng hóa và dịch vụ", "X − M"],
    nuances: [
      "**Là bán ra trừ mua vào.** Xuất khẩu lớn mà nhập khẩu còn lớn hơn thì con số vẫn âm.",
      "**Con số gồm cả hàng hóa và dịch vụ.** Vì vậy nó khác [[can-can-thuong-mai|cán cân thương mại]] mà Hải quan công bố.",
      "**Nhập khẩu giảm cũng làm con số đẹp lên.** Đôi khi đó là dấu hiệu sản xuất yếu đi.",
    ],
    worked: {
      title: "Cứ 100 đồng GDP",
      rows: [
        { label: "Năm 2007", value: "mua vào nhiều hơn bán ra khoảng 13,6 đồng" },
        { label: "Năm 2023", value: "bán ra nhiều hơn mua vào khoảng 8,5 đồng" },
        { label: "Năm 2025", value: "bán ra nhiều hơn mua vào khoảng 6,2 đồng" },
      ],
      note: "Trong khoảng 15 năm, Việt Nam chuyển từ nhập siêu lớn sang xuất siêu.",
    },
    whyMatters:
      "**Nó cho thấy nền kinh tế kiếm được bao nhiêu đô la từ buôn bán.** Xuất siêu giúp tăng nguồn đô la, đỡ [[fx_rate|tỷ giá]] và góp vào tăng trưởng. Việt Nam mở cửa mạnh, nên phần này phụ thuộc nhiều vào thế giới.",
    whenMisleading:
      "**Xuất siêu lớn chưa chắc là tin tốt.** Năm 2023 con số cao một phần vì nhập khẩu giảm, trong khi tăng trưởng năm đó chỉ 4,98%. Một phần lớn xuất khẩu cũng do doanh nghiệp FDI làm ra và lợi nhuận có thể chuyển về nước họ.",
    breakdowns: [
      { by: "Xuất khẩu và nhập khẩu", reveals: "con số đổi vì bán ra hay vì mua vào" },
      { by: "Thị trường", reveals: "phụ thuộc vào Mỹ, Trung Quốc hay châu Âu bao nhiêu" },
      { by: "Mặt hàng", reveals: "điện tử, may mặc hay nông sản đang kéo xuất khẩu" },
      { by: "FDI và trong nước", reveals: "doanh nghiệp Việt Nam đóng góp bao nhiêu" },
    ],
    questions: {
      explore: ["Con số tăng vì xuất khẩu tốt hay vì nhập khẩu giảm?", "Nhập khẩu máy móc, nguyên liệu có giảm không? Đó có thể là tín hiệu sản xuất sắp chậm lại."],
      decide: ["Nếu làm trong ngành xuất khẩu, công việc của mình phụ thuộc vào thị trường nào?"],
    },
  },

  confidence: {
    alsoCalled: ["Niềm tin kinh doanh", "Niềm tin người tiêu dùng"],
    nuances: [
      "**Niềm tin không có một con số duy nhất trong ứng dụng.** Thường đo bằng khảo sát, gọi là [[niem-tin|chỉ số niềm tin]].",
      "**Đây là thứ thay đổi trước số liệu.** Người ta lo trước, cắt chi tiêu sau, rồi số liệu mới thấy.",
      "**Khảo sát đo cảm nhận, không đo hành động.** Có khi người ta nói lo mà vẫn mua sắm.",
    ],
    worked: {
      title: "Ví dụ giả định, không phải số liệu thật",
      rows: [
        { label: "Gia đình định mua xe", value: "300 triệu đồng" },
        { label: "Nghe tin công ty cắt giảm, hoãn mua", value: "giảm chi 300 triệu đồng" },
        { label: "Đại lý bán ít, giảm nhập hàng", value: "doanh thu giảm dây chuyền" },
      ],
      note: "Chưa ai mất việc nhưng nỗi lo đã làm chi tiêu giảm. Nỗi lo có thể tự làm kinh tế yếu đi.",
    },
    whyMatters:
      "**Tiền phải được chi thì mới tạo ra tăng trưởng.** Khi người dân và doanh nghiệp lo, họ giữ tiền lại dù lãi suất thấp. Đó là lý do chính sách đôi khi hạ lãi suất mà kinh tế vẫn không khá lên ngay.",
    whenMisleading:
      "**Tin xấu trên mạng không phải là niềm tin của cả nước.** Một vài câu chuyện lớn có thể khiến ta nghĩ mọi người đều bi quan trong khi số liệu chi tiêu vẫn ổn.",
    breakdowns: [
      { by: "Người tiêu dùng và doanh nghiệp", reveals: "ai đang lo nhiều hơn" },
      { by: "Hiện tại và tương lai", reveals: "họ thấy khó ngay bây giờ hay lo cho vài tháng tới" },
      { by: "Ý định mua hàng lớn", reveals: "nhà, xe có đang bị hoãn không" },
      { by: "Tiền gửi tiết kiệm", reveals: "người dân có đang giữ tiền nhiều hơn không" },
    ],
    questions: {
      explore: ["Người dân có đang gửi tiết kiệm nhiều hơn và mua sắm ít đi không?", "Doanh nghiệp có đang hoãn tuyển người và mở rộng không?"],
      decide: ["Mình đang lo vì thông tin có căn cứ, hay vì đọc nhiều tin xấu?"],
    },
  },
};
