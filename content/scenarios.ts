import type { Shock } from "@/lib/simulate";
import type { CastId, Voice } from "./world";

/** Cú sốc tính từ đầu vòng. duration bỏ trống là kéo dài tới hết trò chơi. */
export type RoundShock = Shock & { duration?: number };

export type Choice = {
  id: string;
  label: string;
  detail: string;
  shocks: RoundShock[];
  /** Nhận xét hiện ra sau khi chọn: chuyện gì xảy ra và vì sao */
  feedback: string;
  /** Vòng tiếp theo. Bỏ trống là kết thúc. */
  next?: string;
  /** Vốn chính trị phải bỏ ra để chọn phương án này */
  cost?: number;
  /** Phản ứng của nền kinh tế với lựa chọn này: tính từ đầu năm sau và được kể trong câu chuyện năm sau */
  aftermath?: Aftermath;
  /** Lời nhân vật dành riêng cho lựa chọn này, ưu tiên hơn lời chung */
  voices?: Voice[];
};

export type Aftermath = { label: string; story: string; shocks: RoundShock[] };

/** Người chơi đoán chỉ số sau một năm sẽ đi hướng nào. lesson là bài cần ôn nếu đoán sai. */
export type Predict = { node: string; q: string; lesson: string };

/** Hai cố vấn nói ngược nhau. Lời khuyên có thể sai, không phải đáp án. */
export type Debate = { hung: string; lan: string };

/** Kết cục của một nhân vật ở màn "một năm sau": so số thật của chỉ số với value. Không có node là kết cục cố định. */
export type Ending = { by: CastId; yes: string } & ({ node?: undefined } | { node: string; op: "<=" | ">="; value: number; no: string });

/** Một diễn biến có thể xảy ra của kịch bản, ghi đè một phần các vòng. Người chơi chỉ biết khi sang năm đó. */
export type Variant = {
  id: string;
  label: string;
  rounds: Record<string, Partial<Omit<Round, "choices">> & { choices?: Record<string, Partial<Choice>> }>;
  /** Diễn biến khó hơn thì chấm nới tay hơn, cùng ý nghĩa với Scenario.difficulty */
  difficulty?: number;
  endings?: Ending[];
};

/** Thêm một câu vào câu chuyện nếu một chỉ số đã lệch quá mức (theo mô hình) khi bước vào vòng này. */
export type StoryIf = { node: string; above?: number; below?: number; text: string };

export type Round = {
  id: string;
  title: string;
  story: string;
  storyIf?: StoryIf[];
  /** Sự kiện xảy ra đầu vòng, trước khi người chơi chọn */
  event: RoundShock[];
  question: string;
  choices: Choice[];
  predict?: Predict;
  debate?: Debate;
};

/** Mục tiêu tính bằng số thật, so với giá trị bình quân năm cuối của nhiệm kỳ. */
export type Target = { node: string; op: "<=" | ">="; value: number };

export type Level = "de" | "vua" | "kho";
export const LEVEL_LABEL: Record<Level, string> = { de: "Dễ", vua: "Vừa", kho: "Khó" };

export type Scenario = {
  id: string;
  title: string;
  period: string;
  level: Level;
  role: string;
  teaser: string;
  goals: string;
  /** Hệ số độ khó khi chấm điểm: nhỏ hơn 1 là nới tay cho kịch bản mà cú sốc rất khó né. */
  difficulty: number;
  /** Số khởi điểm (khi chưa có cú sốc), gần với số liệu thật của giai đoạn đó */
  baseline: Record<string, number>;
  baselineNote: string;
  targets: Target[];
  start: string;
  rounds: Record<string, Round>;
  /** Ngưỡng bị cách chức riêng, nếu khác mặc định: lạm phát tối đa (%), tăng trưởng tối thiểu (%), dự trữ tối thiểu (tỷ lệ so với khởi điểm) */
  fire?: { cpi?: number; gdp?: number; reserves?: number };
  /** Thực tế đã xảy ra, hiện ở cuối trò chơi */
  reality: string;
  relatedCase?: string;
  /** Kịch bản diễn ra ở phố Cầu Tre: có đoán trước, cố vấn tranh luận, vốn chính trị, tin nhắn từ phố */
  street?: true;
  /** Các diễn biến có thể xảy ra, rút ngẫu nhiên khi bắt đầu lượt */
  variants?: Variant[];
  /** Các bài nên học trước */
  lessons?: string[];
  endings?: Ending[];
  /** Chuyện gì xảy ra với phố khi người chơi bị cách chức, theo chỉ số gây ra */
  firedStreet?: Record<string, string>;
};

const OIL_STREET: Ending[] = [
  { by: "ba", node: "policy_rate", op: "<=", value: 4.7, yes: "Cô Ba đã vay được tiền, lò thứ hai đỏ lửa từ sáng sớm.", no: "Cô Ba vẫn chưa mua lò. Tờ báo giá lò nướng nằm im trong ngăn kéo." },
  { by: "tu", node: "gdp_growth", op: ">=", value: 6, yes: "Anh Tư có việc đều, tổ thợ vừa nhận thêm người.", no: "Anh Tư đi làm ba ngày một tuần, những ngày còn lại chạy xe ôm." },
  { by: "bay", node: "cpi", op: "<=", value: 4, yes: "Sổ tiết kiệm của bà Bảy giữ được sức mua.", no: "Tiền lãi của bà Bảy không theo kịp giá chợ, bà cắt bớt mấy món mỗi tuần." },
];
const OIL_ENDINGS: Ending[] = [...OIL_STREET, { by: "sau", yes: "Chú Sáu vẫn chạy xe, lại có lời như trước." }];

export const SCENARIOS: Scenario[] = [
  {
    id: "oil",
    title: "Giá dầu tăng vọt",
    period: "Giống năm 2022",
    level: "de",
    role: "Người điều hành chính sách",
    teaser: "Xung đột ở nước ngoài đẩy giá dầu lên cao, và phố Cầu Tre là nơi thấy đầu tiên. Bạn chống lạm phát hay bảo vệ tăng trưởng, khi chưa ai biết dầu sẽ hạ lúc nào?",
    goals: "Không để lạm phát vượt 4%, giữ tăng trưởng từ 6% trở lên.",
    difficulty: 1.3,
    baseline: { cpi: 3, gdp_growth: 7, fx_rate: 23200, reserves: 100, public_debt: 37, oil_price: 70, policy_rate: 4 },
    baselineNote: "Số khởi điểm gần với Việt Nam năm 2021–2022 khi chưa có cú sốc giá dầu.",
    targets: [
      { node: "cpi", op: "<=", value: 4 },
      { node: "gdp_growth", op: ">=", value: 6 },
    ],
    street: true,
    lessons: ["ba-con-so", "ai-tieu-tien", "vi-sao-gia-tang", "lai-suat"],
    start: "oil-1",
    rounds: {
      "oil-1": {
        id: "oil-1",
        title: "Năm thứ nhất: xăng tăng giá từng tuần",
        story: "Giá dầu thế giới tăng hơn 50% trong vài tháng. Trên phố Cầu Tre, chú Sáu đổ xăng mỗi tuần một giá, cước giao hàng lên theo, bột về tiệm cô Ba cũng đắt hơn. Bạn nhận ra cơn sốt này rồi đấy: hàng đắt lên vì chi phí tăng, không phải vì cả phố tiêu nhiều hơn. Điều chưa ai biết là dầu sẽ hạ nhanh hay ở lại lâu.",
        event: [{ node: "oil_price", size: 1.6, duration: 5 }],
        question: "Bạn làm gì?",
        debate: {
          hung: "Tăng lãi suất ngay. Để giá chạy thêm vài tháng là người dân mất niềm tin, lúc đó muốn kéo xuống còn đắt hơn nhiều.",
          lan: "Dầu đắt đâu phải do dân chi nhiều. Tăng lãi thì xăng có rẻ đi không? Tôi sợ ta làm khổ cô Ba mà chú Sáu vẫn phải đổ xăng giá đó.",
        },
        predict: { node: "cpi", q: "Với quyết định này, cuối năm lạm phát sẽ đi đâu so với bây giờ?", lesson: "vi-sao-gia-tang" },
        choices: [
          {
            id: "rate",
            label: "Tăng lãi suất",
            detail: "Thắt chặt tiền tệ để kìm lạm phát.",
            cost: 1,
            shocks: [{ node: "policy_rate", size: 1 }],
            feedback: "Lạm phát bớt tăng, nhưng lãi suất cao không làm dầu rẻ đi. Bạn đang hãm cầu để bù cho một cú sốc từ phía cung, nên tăng trưởng chịu thiệt.",
            voices: [{ by: "ba", text: "Tôi hoãn mua lò rồi đấy. Vay bây giờ thì tiền lời cả tháng chỉ đủ trả lãi." }],
            aftermath: {
              label: "doanh nghiệp hoãn đầu tư",
              story: "Cô Ba hoãn mua lò, công trình sửa tiệm của anh Tư dừng lại. Nhiều người trên phố cũng làm y như vậy.",
              shocks: [{ node: "investment", size: -0.2, duration: 4 }],
            },
            next: "oil-2",
          },
          {
            id: "tax",
            label: "Giảm thuế xăng dầu",
            detail: "Chính phủ giảm thuế để giá xăng bán lẻ tăng ít hơn.",
            cost: 2,
            shocks: [
              { node: "cpi", size: -0.25, duration: 5 },
              { node: "fiscal_balance", size: -0.4, duration: 5 },
            ],
            feedback: "Đánh trúng nguồn gốc: giá xăng tăng chậm lại nên lạm phát dịu bớt mà không làm vay vốn đắt hơn. Ngân sách mất một khoản thu trong thời gian giảm thuế.",
            voices: [{ by: "sau", text: "Mỗi bình xăng bớt được một ít. Cảm ơn nhé, nhưng nghe nói ngân sách đang kêu đấy." }],
            aftermath: {
              label: "ngân sách hụt thu",
              story: "Bộ Tài chính báo cáo ngân sách hụt thu, và Quốc hội bắt đầu hỏi khoản giảm thuế này kéo dài tới bao giờ.",
              shocks: [{ node: "fiscal_balance", size: -0.15, duration: 4 }],
            },
            next: "oil-2",
          },
          {
            id: "look-through",
            label: "Không làm gì, chờ giá dầu hạ",
            detail: "Coi đây là cú sốc tạm thời và \"nhìn xuyên qua\" nó.",
            shocks: [],
            feedback: "Bạn đặt cược rằng cơn sốt sẽ tự qua. Lạm phát tăng trong lúc dầu còn cao, và kết quả cược này phải sang năm mới biết.",
            voices: [{ by: "bay", text: "Giá chợ lên từng tuần mà sao chẳng thấy ai làm gì vậy?" }],
            next: "oil-2",
          },
        ],
      },
      "oil-2": {
        id: "oil-2",
        title: "Năm thứ hai: giá dầu hạ nhiệt",
        story: "Xung đột lắng xuống, giá dầu quay về mức cũ. Chú Sáu đổ xăng rẻ hơn hẳn. Những gì bạn đã làm năm ngoái thì vẫn đang tác động lên nền kinh tế.",
        storyIf: [{ node: "gdp_growth", below: -0.15, text: "Tăng trưởng đã chậm lại rõ rệt, doanh nghiệp than đơn hàng yếu." }],
        event: [],
        question: "Bây giờ bạn làm gì?",
        debate: {
          hung: "Đừng vội nới. Lạm phát vừa hạ mà nới ngay thì mọi công sức năm ngoái đổ sông đổ biển.",
          lan: "Cơn sốt đã qua, phố cần việc làm. Giữ lãi cao thêm một năm nữa là phạt anh Tư vì một lỗi không phải của anh ấy.",
        },
        predict: { node: "gdp_growth", q: "Với quyết định này, cuối năm tăng trưởng sẽ đi đâu so với bây giờ?", lesson: "lai-suat" },
        choices: [
          {
            id: "unwind",
            label: "Nới lỏng trở lại",
            detail: "Hạ lãi suất một chút để hỗ trợ tăng trưởng.",
            shocks: [{ node: "policy_rate", size: -0.6 }],
            feedback: "Khi cú sốc đã qua, nới lỏng giúp tăng trưởng hồi phục. Nếu năm ngoái bạn đã tăng lãi suất, bước này gần như đưa chính sách về trạng thái ban đầu.",
          },
          {
            id: "keep",
            label: "Giữ nguyên",
            detail: "Không thay đổi gì thêm.",
            shocks: [],
            feedback: "Chính sách giữ nguyên. Kết quả cuối cùng phụ thuộc chủ yếu vào lựa chọn của năm ngoái.",
          },
          {
            id: "stimulus",
            label: "Kích cầu bằng chi tiêu công",
            detail: "Bù lại phần tăng trưởng đã mất.",
            cost: 2,
            shocks: [{ node: "gov_spending", size: 0.6 }],
            feedback: "Tăng trưởng được đẩy lên, nhưng nợ công tăng và lạm phát có thể quay lại vì tổng cầu tăng.",
          },
        ],
      },
    },
    variants: [
      { id: "tam-thoi", label: "Dầu hạ sau một năm", difficulty: 1.1, rounds: {} },
      {
        id: "keo-dai",
        label: "Dầu ở lại cao thêm một năm",
        difficulty: 0.7,
        endings: [...OIL_STREET, { by: "sau", yes: "Hai năm xăng đắt, chú Sáu đã bán một chiếc xe. Chiếc còn lại chỉ chạy tuyến gần." }],
        rounds: {
          "oil-1": {
            choices: {
              "look-through": {
                aftermath: {
                  label: "giá tăng lan khắp phố",
                  story: "Dầu chưa hạ, cũng chưa thấy ai ra tay. Chú Sáu tăng cước, cô Ba tăng giá bánh, và cả phố bắt đầu tin rằng giá sẽ còn lên.",
                  shocks: [{ node: "cpi", size: 0.3, duration: 4 }],
                },
              },
            },
          },
          "oil-2": {
            title: "Năm thứ hai: dầu chưa chịu hạ",
            story: "Xung đột kéo dài hơn mọi dự báo. Giá dầu vẫn cao, chú Sáu đã bán bớt một chiếc xe. Cú sốc tưởng tạm thời giờ bước sang năm thứ hai.",
            event: [{ node: "oil_price", size: 1.2, duration: 5 }],
            debate: {
              hung: "Tôi đã nói rồi: đây không còn là chuyện tạm thời. Lúc này mà nới lỏng là mất hết uy tín.",
              lan: "Dầu cao lâu thì phố càng yếu. Lãi suất vẫn không làm dầu rẻ đi, phải đỡ trực tiếp cho người chịu giá xăng.",
            },
            choices: {
              unwind: {
                feedback: "Bạn nới lỏng trong lúc dầu vẫn cao. Tăng trưởng được đỡ một phần, nhưng lạm phát mất thêm một lực kìm đúng lúc cú sốc còn đang đẩy lên.",
              },
              keep: {
                feedback: "Bạn giữ nguyên trong năm dầu thứ hai. Không thêm rủi ro, nhưng cũng không đỡ gì cho người đang chịu giá xăng.",
              },
              stimulus: {
                label: "Gia hạn giảm thuế xăng dầu",
                detail: "Đỡ trực tiếp cho giá xăng thêm một năm, đổi lại ngân sách mất thêm khoản thu.",
                shocks: [
                  { node: "cpi", size: -0.25, duration: 5 },
                  { node: "fiscal_balance", size: -0.4, duration: 5 },
                ],
                feedback: "Bạn đỡ thẳng vào nguồn gốc của cơn sốt thêm một năm. Giá xăng dịu bớt, còn ngân sách trả giá cho khoản thu đã mất.",
              },
            },
          },
        },
      },
    ],
    endings: OIL_ENDINGS,
    firedStreet: {
      cpi: "Giá trên phố đã lên tới mức cô Ba ngừng bán ổ nhỏ, và bà Bảy đổi tiền tiết kiệm sang vàng.",
      gdp_growth: "Công trình dừng hẳn, tổ thợ của anh Tư giải tán, và tiệm cô Ba đóng cửa sớm vì vắng khách.",
    },
    reality:
      "Năm 2022 giá dầu Brent bình quân gần 100 USD/thùng. Việt Nam chọn giảm thuế bảo vệ môi trường với xăng dầu và dùng quỹ bình ổn giá, thay vì tăng lãi suất vì lý do giá dầu. Lạm phát cả năm giữ ở khoảng 3,2%, trong mục tiêu. Nhiều ngân hàng trung ương coi giá dầu là cú sốc cung tạm thời và tránh phản ứng quá mạnh, trừ khi lạm phát bắt đầu lan rộng.",
  },
  {
    id: "covid",
    title: "Đại dịch COVID-19",
    period: "2020–2022",
    level: "vua",
    role: "Thủ tướng và Thống đốc",
    teaser: "Giãn cách xã hội, cửa hàng đóng cửa, đơn hàng biến mất. Ba năm, ba quyết định.",
    goals: "Giữ tăng trưởng bình quân từ 5% trở lên, lạm phát không quá 4%, nợ công không quá 45% GDP.",
    difficulty: 1,
    fire: { cpi: 6 },
    baseline: { cpi: 2.8, gdp_growth: 7.4, fx_rate: 23050, reserves: 78, public_debt: 41, unemployment: 1.7, policy_rate: 6 },
    baselineNote: "Số khởi điểm là số liệu thật năm 2019, trước đại dịch.",
    targets: [
      { node: "gdp_growth", op: ">=", value: 5 },
      { node: "cpi", op: "<=", value: 4 },
      { node: "public_debt", op: "<=", value: 45 },
    ],
    start: "covid-1",
    rounds: {
      "covid-1": {
        id: "covid-1",
        title: "2020: đại dịch ập đến",
        story: "Từ tháng 3, các đợt giãn cách làm hàng quán, du lịch, vận tải gần như ngừng lại. Người dân cắt chi tiêu, các nhà máy thiếu linh kiện từ Trung Quốc, đơn hàng xuất khẩu bị hoãn.",
        event: [
          { node: "consumption", size: -1, duration: 4 },
          { node: "net_exports", size: -0.4, duration: 2 },
          { node: "fdi", size: -0.3, duration: 4 },
        ],
        question: "Bạn ưu tiên công cụ nào?",
        choices: [
          {
            id: "rate",
            label: "Hạ lãi suất ba lần",
            detail: "NHNN đưa lãi suất điều hành xuống mức thấp nhất lịch sử.",
            shocks: [{ node: "policy_rate", size: -1 }],
            feedback: "Vốn rẻ hơn, nhưng khi cửa hàng phải đóng cửa, ít doanh nghiệp muốn vay để mở rộng. Tác động lên tăng trưởng chậm và yếu hơn bình thường.",
            next: "covid-2",
          },
          {
            id: "support",
            label: "Gói hỗ trợ trực tiếp",
            detail: "Trợ cấp người mất việc, giãn thuế, hỗ trợ tiền thuê cho doanh nghiệp.",
            shocks: [{ node: "gov_spending", size: 0.8 }],
            feedback: "Tiền đến thẳng tay người bị ảnh hưởng nên đỡ được tiêu dùng ngay. Ngân sách thâm hụt hơn và nợ công tăng.",
            next: "covid-2",
          },
          {
            id: "restructure",
            label: "Giãn nợ, cơ cấu lại khoản vay",
            detail: "Cho doanh nghiệp hoãn trả nợ, giữ nguyên nhóm nợ để không bị coi là nợ xấu.",
            shocks: [{ node: "credit", size: 0.3 }],
            feedback: "Doanh nghiệp tránh được phá sản hàng loạt, tín dụng không bị đứt gãy. Nhưng rủi ro nợ xấu bị dồn lại cho những năm sau.",
            next: "covid-2",
          },
        ],
      },
      "covid-2": {
        id: "covid-2",
        title: "2021: làn sóng Delta",
        story: "Đợt dịch Delta buộc TP.HCM và các tỉnh phía Nam giãn cách kéo dài trong quý 3. Cùng lúc, người dân các nước giàu ở nhà mua sắm trực tuyến nhiều, nên đơn hàng xuất khẩu điện tử, đồ gỗ lại tăng mạnh.",
        storyIf: [
          { node: "gdp_growth", below: -0.3, text: "Tăng trưởng năm ngoái đã rơi xuống rất thấp, nhiều doanh nghiệp nhỏ đóng cửa." },
          { node: "public_debt", above: 0.2, text: "Nợ công đã tăng, Bộ Tài chính cảnh báo dư địa chi tiêu đang hẹp lại." },
        ],
        event: [
          { node: "consumption", size: -0.8, duration: 2 },
          { node: "net_exports", size: 0.6, duration: 4 },
        ],
        question: "Bạn chuẩn bị gì cho giai đoạn mở cửa?",
        choices: [
          {
            id: "big",
            label: "Gói phục hồi lớn",
            detail: "Chương trình hỗ trợ quy mô hàng trăm nghìn tỷ đồng: giảm thuế, hỗ trợ lãi suất, đầu tư hạ tầng.",
            shocks: [{ node: "gov_spending", size: 1 }],
            feedback: "Tổng cầu được đẩy mạnh khi mở cửa. Nếu đi cùng giá cả thế giới tăng, lạm phát có thể nóng lên.",
            next: "covid-3",
          },
          {
            id: "targeted",
            label: "Hỗ trợ có chọn lọc",
            detail: "Chỉ hỗ trợ ngành và người bị ảnh hưởng nặng nhất.",
            shocks: [{ node: "gov_spending", size: 0.4 }],
            feedback: "Ít tốn kém hơn, nợ công tăng vừa phải, nhưng tăng trưởng hồi phục chậm hơn.",
            next: "covid-3",
          },
          {
            id: "careful",
            label: "Thận trọng, giữ nợ công thấp",
            detail: "Không tung thêm gói hỗ trợ mới.",
            shocks: [],
            feedback: "Nợ công được giữ thấp, để dành dư địa cho sau này, nhưng kinh tế tự phục hồi chậm hơn.",
            next: "covid-3",
          },
        ],
      },
      "covid-3": {
        id: "covid-3",
        title: "2022: mở cửa trở lại, giá cả thế giới tăng",
        story: "Nền kinh tế mở cửa hoàn toàn, người dân đi lại, mua sắm trở lại. Nhưng chiến sự ở Ukraine đẩy giá dầu và lương thực thế giới lên cao.",
        storyIf: [{ node: "cpi", above: 0.2, text: "Lạm phát đã bắt đầu nhích lên vì tổng cầu phục hồi nhanh." }],
        event: [
          { node: "oil_price", size: 0.8, duration: 4 },
          { node: "consumption", size: 0.6, duration: 4 },
        ],
        question: "Bước cuối cùng của bạn?",
        choices: [
          {
            id: "exit",
            label: "Rút dần hỗ trợ",
            detail: "Giảm chi tiêu hỗ trợ, NHNN tăng nhẹ lãi suất.",
            shocks: [
              { node: "gov_spending", size: -0.4 },
              { node: "policy_rate", size: 0.4 },
            ],
            feedback: "Lạm phát được giữ trong tầm kiểm soát, nợ công không tăng thêm, đổi lại tăng trưởng không bật lên quá cao.",
          },
          {
            id: "tax",
            label: "Giảm thuế giá trị gia tăng và thuế xăng dầu",
            detail: "Giảm thuế để kìm giá và kích thích tiêu dùng.",
            shocks: [
              { node: "cpi", size: -0.25, duration: 4 },
              { node: "fiscal_balance", size: -0.4, duration: 4 },
              { node: "consumption", size: 0.2, duration: 4 },
            ],
            feedback: "Giá cả dịu bớt và tiêu dùng được hỗ trợ cùng lúc. Ngân sách hụt thu trong thời gian giảm thuế.",
          },
          {
            id: "keep",
            label: "Giữ nguyên",
            detail: "Để các gói hỗ trợ cũ tiếp tục chạy.",
            shocks: [],
            feedback: "Tăng trưởng được giữ, nhưng khi cầu đã phục hồi mà hỗ trợ vẫn chạy, lạm phát dễ tăng.",
          },
        ],
      },
    },
    reality:
      "Thực tế tăng trưởng GDP Việt Nam là 2,9% (2020), 2,6% (2021) và 8,5% (2022). NHNN hạ lãi suất điều hành ba lần năm 2020 và cho phép cơ cấu lại nợ. Đầu năm 2022 Quốc hội thông qua Chương trình phục hồi khoảng 350 nghìn tỷ đồng, trong đó có giảm 2 điểm % thuế giá trị gia tăng. Lạm phát năm 2022 khoảng 3,2%.",
    relatedCase: "2020-covid",
  },
  {
    id: "crisis",
    title: "Khủng hoảng toàn cầu",
    period: "Giống năm 2009–2011",
    level: "vua",
    role: "Thủ tướng và Thống đốc",
    teaser: "Kinh tế thế giới suy thoái, đơn hàng xuất khẩu biến mất. Bạn kích thích bao nhiêu là đủ?",
    goals: "Tránh suy thoái sâu nhưng không để lạm phát và nợ công tăng vọt sau đó.",
    difficulty: 1,
    fire: { cpi: 11 },
    baseline: { cpi: 8, gdp_growth: 7, fx_rate: 16300, reserves: 24, public_debt: 31 },
    baselineNote: "Số khởi điểm gần với Việt Nam năm 2008, trước khi khủng hoảng lan tới.",
    targets: [
      { node: "gdp_growth", op: ">=", value: 5.5 },
      { node: "cpi", op: "<=", value: 10 },
      { node: "public_debt", op: "<=", value: 40 },
    ],
    start: "crisis-1",
    rounds: {
      "crisis-1": {
        id: "crisis-1",
        title: "Năm thứ nhất: đơn hàng biến mất",
        story: "Một ngân hàng lớn ở Mỹ sụp đổ, kinh tế thế giới rơi vào suy thoái. Các nước giàu mua ít hàng hơn, xuất khẩu Việt Nam giảm mạnh, các nhà máy FDI tạm hoãn mở rộng. Công nhân ở các khu công nghiệp bị giảm giờ làm.",
        event: [
          { node: "net_exports", size: -1, duration: 4 },
          { node: "fdi", size: -0.5, duration: 4 },
        ],
        question: "Bạn kích thích kinh tế thế nào?",
        choices: [
          {
            id: "rate",
            label: "Hạ lãi suất mạnh",
            detail: "NHNN hạ lãi suất để vốn rẻ hơn.",
            shocks: [{ node: "policy_rate", size: -1.2 }],
            feedback: "Vốn rẻ giúp tín dụng và đầu tư trong nước bù một phần cho xuất khẩu. Tác động cần vài quý mới thấy rõ.",
            next: "crisis-2",
          },
          {
            id: "spend",
            label: "Gói chi tiêu công",
            detail: "Chính phủ tăng chi và đẩy nhanh đầu tư công.",
            shocks: [{ node: "gov_spending", size: 1 }],
            feedback: "Chi tiêu công đi thẳng vào tổng cầu nên tác động nhanh. Ngân sách thâm hụt hơn, nợ công tăng.",
            next: "crisis-2",
          },
          {
            id: "both",
            label: "Cả hai, thật mạnh",
            detail: "Hạ lãi suất mạnh và tung gói kích cầu lớn cùng lúc.",
            shocks: [
              { node: "policy_rate", size: -1.2 },
              { node: "gov_spending", size: 1 },
            ],
            feedback: "Tăng trưởng được đỡ mạnh nhất. Nhưng một lượng lớn tiền và tín dụng được bơm ra, gieo mầm cho lạm phát khi kinh tế hồi phục.",
            next: "crisis-2",
          },
        ],
      },
      "crisis-2": {
        id: "crisis-2",
        title: "Năm thứ hai: thế giới hồi phục",
        story: "Kinh tế thế giới bắt đầu hồi phục, đơn hàng quay lại. Các gói kích thích của bạn vẫn đang chạy. Một số chuyên gia cảnh báo tín dụng đang tăng quá nhanh.",
        storyIf: [{ node: "credit", above: 0.3, text: "Tín dụng đã tăng rất nhanh, giá nhà đất và chứng khoán sôi động trở lại." }],
        event: [],
        question: "Bạn làm gì với các gói kích thích?",
        choices: [
          {
            id: "exit",
            label: "Rút dần kích thích",
            detail: "Tăng lãi suất trở lại và giảm chi tiêu công.",
            shocks: [
              { node: "policy_rate", size: 0.8 },
              { node: "gov_spending", size: -0.5 },
            ],
            feedback: "Rút kích thích đúng lúc giúp lạm phát và nợ công không tăng quá đà, đổi lại tăng trưởng hồi phục chậm hơn một chút.",
            next: "crisis-3",
          },
          {
            id: "keep",
            label: "Giữ nguyên",
            detail: "Để kinh tế hồi phục thật vững rồi mới tính.",
            shocks: [],
            feedback: "Tăng trưởng tốt, nhưng khi cầu thế giới đã quay lại mà kích thích vẫn chạy, lạm phát tăng dần.",
            next: "crisis-3",
          },
          {
            id: "more",
            label: "Kích thích thêm",
            detail: "Tận dụng đà hồi phục để tăng trưởng thật cao.",
            shocks: [
              { node: "policy_rate", size: -0.5 },
              { node: "gov_spending", size: 0.5 },
            ],
            feedback: "Tăng trưởng cao nhất trong ngắn hạn, nhưng lạm phát và nợ công tăng mạnh.",
            next: "crisis-3",
          },
        ],
      },
      "crisis-3": {
        id: "crisis-3",
        title: "Năm thứ ba: hóa đơn đến hạn",
        story: "Những gì bạn làm hai năm qua bắt đầu lộ rõ kết quả. Giá lương thực và dầu thế giới cũng đang tăng trở lại.",
        storyIf: [
          { node: "cpi", above: 0.25, text: "Lạm phát đã tăng cao, người dân đổ xô mua vàng và đô la để giữ giá trị." },
          { node: "public_debt", above: 0.25, text: "Nợ công tăng nhanh, các tổ chức xếp hạng tín nhiệm bắt đầu lên tiếng." },
          { node: "gdp_growth", below: -0.15, text: "Tăng trưởng vẫn yếu, thất nghiệp ở các khu công nghiệp là chủ đề nóng." },
        ],
        event: [{ node: "oil_price", size: 0.5, duration: 4 }],
        question: "Quyết định cuối cùng?",
        choices: [
          {
            id: "tighten",
            label: "Thắt chặt mạnh, ưu tiên ổn định",
            detail: "Tăng lãi suất, siết tín dụng, cắt đầu tư công.",
            shocks: [
              { node: "policy_rate", size: 1.2 },
              { node: "gov_spending", size: -0.4 },
            ],
            feedback: "Lạm phát và nợ công được kéo lại, nhưng tăng trưởng chậm hẳn. Đây gần với lựa chọn của Việt Nam năm 2011.",
          },
          {
            id: "mild",
            label: "Thắt chặt vừa phải",
            detail: "Tăng nhẹ lãi suất, giữ chi tiêu công.",
            shocks: [{ node: "policy_rate", size: 0.5 }],
            feedback: "Cân bằng giữa hai mục tiêu: lạm phát dịu bớt một phần, tăng trưởng không giảm quá sâu.",
          },
          {
            id: "continue",
            label: "Tiếp tục hỗ trợ tăng trưởng",
            detail: "Không thay đổi chính sách.",
            shocks: [],
            feedback: "Tăng trưởng được giữ thêm một thời gian, nhưng nếu lạm phát đã cao, nó có thể tiếp tục leo thang.",
          },
        ],
      },
    },
    reality:
      "Năm 2009, Việt Nam chọn cách tương tự \"cả hai\": NHNN hạ lãi suất tái cấp vốn từ 15% về 7%, Chính phủ hỗ trợ 4% lãi vay và nới lỏng tài khóa. Tăng trưởng giữ được 5,4% (2009) và 6,4% (2010). Nhưng kích thích kéo dài sang 2010, tín dụng tăng nhanh, lạm phát lên 18,7% năm 2011, buộc Chính phủ phải thắt chặt mạnh bằng Nghị quyết 11.",
    relatedCase: "2009-kich-cau",
  },
  {
    id: "fed",
    title: "Fed tăng lãi suất",
    period: "Giống năm 2022–2023",
    level: "kho",
    role: "Thống đốc Ngân hàng Nhà nước",
    teaser: "Mỹ tăng lãi suất mạnh, đô la tăng giá khắp thế giới. Ba năm giữ giá tiền đồng.",
    goals: "Lạm phát không quá 4,5%, tăng trưởng từ 6% trở lên, tiền đồng mất giá không quá 5%, dự trữ ngoại hối không dưới 85 tỷ USD.",
    difficulty: 0.7,
    fire: { cpi: 5, reserves: 0.85 },
    baseline: { cpi: 3.2, gdp_growth: 7, fx_rate: 23160, reserves: 109, public_debt: 39, policy_rate: 4, fed_rate: 0.1 },
    baselineNote: "Số khởi điểm gần với số liệu thật năm 2021: lãi suất tái cấp vốn 4%, dự trữ khoảng 109 tỷ USD, tỷ giá bình quân khoảng 23.160 đồng.",
    targets: [
      { node: "cpi", op: "<=", value: 4.5 },
      { node: "gdp_growth", op: ">=", value: 6 },
      { node: "fx_rate", op: "<=", value: 24318 },
      { node: "reserves", op: ">=", value: 85 },
    ],
    start: "fed-1",
    rounds: {
      "fed-1": {
        id: "fed-1",
        title: "Năm thứ nhất: đô la tăng vọt",
        story: "Lạm phát Mỹ lên cao, Fed tăng lãi suất nhanh nhất trong nhiều thập kỷ. Đô la mạnh lên, nhà đầu tư rút vốn khỏi các thị trường mới nổi. Trên thị trường, người dân và doanh nghiệp bắt đầu tích trữ đô la, tỷ giá VND/USD tăng từng ngày.",
        event: [{ node: "fed_rate", size: 1 }],
        question: "Bạn làm gì đầu tiên?",
        choices: [
          {
            id: "rate",
            label: "Tăng lãi suất ngay",
            detail: "Tăng lãi suất điều hành để giữ tiền đồng hấp dẫn hơn đô la.",
            shocks: [{ node: "policy_rate", size: 1 }],
            feedback: "Lãi suất tiền đồng cao hơn làm giữ tiền đồng có lợi hơn, áp lực tỷ giá giảm. Nhưng vay vốn đắt lên, tín dụng và đầu tư chậm lại, tăng trưởng bị ảnh hưởng.",
            next: "fed-2a",
          },
          {
            id: "sell",
            label: "Bán đô la từ dự trữ",
            detail: "Dùng quỹ dự trữ ngoại hối bán đô la ra thị trường để kéo tỷ giá xuống.",
            shocks: [
              { node: "fx_rate", size: -0.8, duration: 4 },
              { node: "reserves", size: -0.5 },
            ],
            feedback: "Tỷ giá ổn định ngay mà không cần làm vay vốn đắt hơn. Cái giá là dự trữ ngoại hối giảm, và đô la đã bán thì không quay lại. Nếu áp lực kéo dài, quỹ này sẽ cạn dần.",
            next: "fed-2b",
          },
          {
            id: "float",
            label: "Để tiền đồng mất giá",
            detail: "Không can thiệp, để tỷ giá tự điều chỉnh theo thị trường.",
            // Thấy NHNN không phản ứng, người dân đổ xô mua đô la, đẩy tỷ giá lên thêm.
            shocks: [{ node: "fx_rate", size: 0.3 }],
            feedback: "Giữ được dự trữ và lãi suất thấp. Nhưng thấy NHNN không phản ứng, nhiều người đổ xô mua đô la nên tiền đồng mất giá nhanh hơn. Hàng xuất khẩu rẻ hơn, còn xăng dầu, nguyên liệu nhập khẩu đắt lên và lạm phát bắt đầu nhích lên.",
            next: "fed-2c",
          },
        ],
      },
      "fed-2a": {
        id: "fed-2a",
        title: "Năm thứ hai: doanh nghiệp kêu vốn đắt",
        story: "Tỷ giá đã dịu bớt. Nhưng doanh nghiệp than lãi vay quá cao, nhiều dự án bất động sản dừng lại, đơn hàng xuất khẩu cũng giảm vì kinh tế thế giới chậm lại. Fed vẫn giữ lãi suất cao.",
        event: [{ node: "net_exports", size: -0.4 }],
        question: "Bước tiếp theo?",
        choices: [
          {
            id: "hold",
            label: "Giữ nguyên lãi suất",
            detail: "Kiên nhẫn chờ áp lực bên ngoài qua đi.",
            shocks: [],
            feedback: "Tỷ giá và lạm phát được giữ chắc, nhưng tăng trưởng tiếp tục chịu sức ép từ cả lãi suất cao lẫn xuất khẩu yếu.",
            next: "fed-3",
          },
          {
            id: "cut",
            label: "Hạ lãi suất trở lại",
            detail: "Đảo chiều để hỗ trợ doanh nghiệp, chấp nhận rủi ro tỷ giá.",
            shocks: [{ node: "policy_rate", size: -1 }],
            feedback: "Vốn rẻ lại giúp tín dụng và đầu tư hồi phục. Nhưng Fed vẫn đang giữ lãi suất cao, nên tiền đồng lại chịu áp lực.",
            next: "fed-3",
          },
          {
            id: "spend",
            label: "Đề xuất Chính phủ tăng đầu tư công",
            detail: "Giữ lãi suất, để Chính phủ đẩy nhanh giải ngân các dự án hạ tầng.",
            shocks: [{ node: "gov_spending", size: 0.7 }],
            feedback: "Chi tiêu công bù vào phần tổng cầu bị mất, tăng trưởng được đỡ mà không phải hạ lãi suất. Cái giá là ngân sách thâm hụt hơn và nợ công tăng.",
            next: "fed-3",
          },
        ],
      },
      "fed-2b": {
        id: "fed-2b",
        title: "Năm thứ hai: dự trữ vơi dần",
        story: "Fed tăng lãi suất thêm nữa. Bạn đã bán một lượng lớn đô la, dự trữ giảm rõ rệt. Thị trường bắt đầu lo: nếu dự trữ cạn thì tiền đồng sẽ mất giá mạnh.",
        event: [{ node: "fed_rate", size: 0.5 }],
        question: "Bạn tiếp tục thế nào?",
        choices: [
          {
            id: "sell-more",
            label: "Tiếp tục bán đô la",
            detail: "Giữ tỷ giá bằng mọi giá.",
            shocks: [
              { node: "fx_rate", size: -0.8, duration: 4 },
              { node: "reserves", size: -0.5 },
            ],
            feedback: "Tỷ giá giữ được thêm một thời gian, nhưng dự trữ giảm sâu hơn. Bộ đệm cho những cú sốc sau ngày càng mỏng.",
            next: "fed-3",
          },
          {
            id: "rate-now",
            label: "Chuyển sang tăng lãi suất",
            detail: "Ngừng bán dự trữ, tăng lãi suất để giữ tiền đồng.",
            shocks: [{ node: "policy_rate", size: 1 }],
            feedback: "Lãi suất cao hơn thay cho việc tiêu dự trữ. Tỷ giá ổn định hơn, dự trữ được giữ lại, nhưng tăng trưởng chậm đi.",
            next: "fed-3",
          },
          {
            id: "mix",
            label: "Kết hợp: nới biên độ tỷ giá và tăng lãi suất vừa phải",
            detail: "Cho tiền đồng mất giá một phần, tăng lãi suất một chút, ngừng bán dự trữ ồ ạt.",
            shocks: [{ node: "policy_rate", size: 0.5 }],
            feedback: "Chia nhỏ gánh nặng: tiền đồng mất giá có kiểm soát, lãi suất tăng vừa phải, dự trữ không bị tiêu thêm. Không chỉ số nào quá xấu, nhưng cũng không chỉ số nào được bảo vệ hoàn toàn.",
            next: "fed-3",
          },
        ],
      },
      "fed-2c": {
        id: "fed-2c",
        title: "Năm thứ hai: lạm phát nhập khẩu",
        story: "Tiền đồng mất giá đáng kể. Giá xăng dầu, thức ăn chăn nuôi, linh kiện nhập khẩu tăng. Lạm phát nhích lên, người dân bắt đầu phàn nàn về giá cả.",
        event: [],
        question: "Bạn phản ứng thế nào?",
        choices: [
          {
            id: "rate-late",
            label: "Tăng lãi suất mạnh",
            detail: "Muộn nhưng phải làm: tăng lãi suất để kéo lạm phát và tỷ giá về.",
            shocks: [{ node: "policy_rate", size: 1.2 }],
            feedback: "Lạm phát và tỷ giá được kéo lại, nhưng vì phản ứng muộn nên phải tăng mạnh hơn, tăng trưởng bị ảnh hưởng nhiều.",
            next: "fed-3",
          },
          {
            id: "fuel-tax",
            label: "Đề xuất giảm thuế xăng dầu",
            detail: "Chính phủ giảm thuế để giá xăng tăng chậm lại.",
            shocks: [
              { node: "cpi", size: -0.25 },
              { node: "fiscal_balance", size: -0.4 },
            ],
            feedback: "Giá xăng dịu bớt nên lạm phát tăng chậm lại mà không cần thắt chặt tiền tệ. Nhưng ngân sách mất một khoản thu, và nguyên nhân gốc (tiền đồng yếu) vẫn còn.",
            next: "fed-3",
          },
          {
            id: "wait",
            label: "Tiếp tục chờ",
            detail: "Tin rằng áp lực sẽ tự qua.",
            // Giá tăng lâu, người dân bắt đầu tin giá còn tăng nữa: kỳ vọng lạm phát tự đẩy giá lên.
            shocks: [{ node: "cpi", size: 0.2 }],
            feedback: "Không tốn dự trữ, không làm vay vốn đắt hơn, nhưng lạm phát và tỷ giá tiếp tục xấu đi. Kỳ vọng lạm phát có thể bám rễ.",
            next: "fed-3",
          },
        ],
      },
      "fed-3": {
        id: "fed-3",
        title: "Năm thứ ba: Fed dừng tăng, thị trường trái phiếu đóng băng",
        story: "Fed ngừng tăng lãi suất nhưng giữ ở mức cao. Trong nước, sau một loạt sai phạm trong phát hành trái phiếu doanh nghiệp, niềm tin sụp đổ: doanh nghiệp bất động sản không thể vay mới để trả nợ cũ.",
        storyIf: [
          { node: "fx_rate", above: 0.4, text: "Tiền đồng đã mất giá đáng kể so với năm đầu." },
          { node: "reserves", below: -0.5, text: "Dự trữ ngoại hối đã mỏng đi nhiều, bạn không còn nhiều đô la để bán." },
          { node: "gdp_growth", below: -0.2, text: "Tăng trưởng đã chậm lại rõ rệt." },
        ],
        event: [{ node: "credit", size: -0.4, duration: 4 }],
        question: "Quyết định cuối cùng của nhiệm kỳ?",
        choices: [
          {
            id: "cut",
            label: "Hạ lãi suất nhiều lần",
            detail: "Đảo chiều chính sách để cứu tăng trưởng.",
            shocks: [{ node: "policy_rate", size: -1 }],
            feedback: "Tín dụng và đầu tư hồi phục dần, nhưng Fed vẫn giữ lãi suất cao nên tiền đồng chịu áp lực trở lại.",
          },
          {
            id: "liquidity",
            label: "Hỗ trợ thanh khoản, cho giãn nợ trái phiếu",
            detail: "Giữ lãi suất, nhưng cho doanh nghiệp đàm phán giãn, hoãn trả nợ trái phiếu và bơm thanh khoản cho ngân hàng.",
            shocks: [{ node: "credit", size: 0.4 }],
            feedback: "Ngăn được làn sóng vỡ nợ mà không phải hạ lãi suất mạnh, giữ được tỷ giá. Vấn đề nợ được giãn ra chứ chưa được giải quyết.",
          },
          {
            id: "hold",
            label: "Giữ nguyên, ưu tiên tỷ giá",
            detail: "Không thay đổi gì cho tới khi Fed hạ lãi suất.",
            shocks: [],
            feedback: "Tỷ giá ổn định, nhưng tín dụng tiếp tục đóng băng và tăng trưởng yếu.",
          },
        ],
      },
    },
    reality:
      "Năm 2022, NHNN đã kết hợp nhiều cách: bán ngoại tệ (dự trữ giảm từ khoảng 109 xuống 87 tỷ USD), nới biên độ tỷ giá từ ±3% lên ±5% (10/2022) và tăng lãi suất tái cấp vốn hai lần lên 6%. Chính phủ giảm thuế bảo vệ môi trường với xăng dầu. Năm 2023, Chính phủ ban hành Nghị định 08/2023 cho giãn, hoãn nợ trái phiếu, và NHNN hạ lãi suất bốn lần. Tăng trưởng 2023 chỉ còn khoảng 5%.",
    relatedCase: "2022-fed-trai-phieu",
  },
  {
    id: "inflation-2008",
    title: "Lạm phát phi mã",
    period: "2007–2008",
    level: "kho",
    role: "Thống đốc Ngân hàng Nhà nước",
    teaser: "Vốn ngoại tràn vào sau khi gia nhập WTO, tiền và tín dụng tăng vọt. Bạn có kịp hãm lại trước khi lạm phát vượt 20%?",
    goals: "Lạm phát không quá 9%, tăng trưởng từ 5,5% trở lên, dự trữ ngoại hối không dưới 20 tỷ USD.",
    difficulty: 1.3,
    baseline: { cpi: 8.3, gdp_growth: 7.1, fx_rate: 16100, reserves: 23.5, public_debt: 32, m2: 30 },
    baselineNote: "Số khởi điểm gần với số liệu thật năm 2007 của Việt Nam (lạm phát 8,3%, tăng trưởng 7,1%, dự trữ khoảng 23,5 tỷ USD).",
    targets: [
      { node: "cpi", op: "<=", value: 9 },
      { node: "gdp_growth", op: ">=", value: 5.5 },
      { node: "reserves", op: ">=", value: 20 },
    ],
    start: "inf-1",
    rounds: {
      "inf-1": {
        id: "inf-1",
        title: "2007: tiền rẻ và vốn ngoại tràn vào",
        story: "Việt Nam vừa gia nhập WTO. Vốn FDI giải ngân tăng gấp đôi, nhà đầu tư nước ngoài đổ tiền vào chứng khoán. NHNN mua đô la vào để giữ tỷ giá, trả bằng tiền đồng mới. Ngân hàng cho vay dễ dãi, chứng khoán và nhà đất sốt nóng.",
        event: [
          { node: "fdi", size: 0.8, duration: 8 },
          { node: "credit", size: 1, duration: 4 },
          // Tiền đồng NHNN trả ra khi mua đô la vào.
          { node: "m2", size: 0.8, duration: 4 },
        ],
        question: "Bạn xử lý dòng tiền này thế nào?",
        choices: [
          {
            id: "sterilize",
            label: "Hút bớt tiền về",
            detail: "Bán tín phiếu, tăng dự trữ bắt buộc để trung hòa lượng tiền đồng đã bơm ra.",
            shocks: [
              { node: "m2", size: -0.6 },
              { node: "credit", size: -0.3 },
            ],
            feedback: "Lượng tiền tăng chậm lại mà chưa cần tăng lãi suất điều hành mạnh. Đây là phản ứng sớm, nên tốn ít \"thuốc đắng\" hơn về sau.",
            next: "inf-2",
          },
          {
            id: "rate",
            label: "Tăng lãi suất sớm",
            detail: "Tăng lãi suất điều hành ngay từ khi tín dụng mới bắt đầu nóng.",
            shocks: [{ node: "policy_rate", size: 1 }],
            feedback: "Tín dụng và đầu tư chậm lại, lạm phát bị hãm từ sớm. Nhưng lãi suất cao hơn cũng thu hút thêm vốn ngoại, áp lực mua đô la vào vẫn còn.",
            next: "inf-2",
          },
          {
            id: "growth",
            label: "Ưu tiên tăng trưởng, để thị trường tự điều chỉnh",
            detail: "Không thắt chặt, tận dụng làn sóng vốn để tăng trưởng thật nhanh.",
            shocks: [{ node: "credit", size: 0.3 }],
            feedback: "Tăng trưởng cao, thị trường sôi động. Nhưng tiền và tín dụng tiếp tục phình to, lạm phát sẽ đến với độ trễ vài quý.",
            next: "inf-2",
          },
        ],
      },
      "inf-2": {
        id: "inf-2",
        title: "Đầu 2008: giá cả leo thang, giá dầu lập đỉnh",
        story: "Giá lương thực và dầu thế giới tăng vọt. Giá cả trong nước tăng nhanh từng tháng, người dân đổ xô mua vàng. Nhập siêu lớn, cán cân vãng lai thâm hụt nặng.",
        storyIf: [
          { node: "cpi", above: 0.3, text: "Lạm phát đã lên mức hai con số và vẫn đang tăng." },
          { node: "m2", above: 0.3, text: "Cung tiền năm ngoái tăng rất nhanh, giờ là lúc độ trễ của nó bắt đầu lộ ra." },
        ],
        event: [{ node: "oil_price", size: 1.5, duration: 4 }],
        question: "Bạn ra tay thế nào?",
        choices: [
          {
            id: "shock",
            label: "Tăng lãi suất thật mạnh",
            detail: "Đưa lãi suất điều hành lên rất cao (kiểu 15%) để chặn lạm phát bằng mọi giá.",
            shocks: [{ node: "policy_rate", size: 1.5 }],
            feedback: "Lạm phát bị chặn lại, nhưng doanh nghiệp vay vốn với lãi suất rất cao, nhiều nơi phải ngừng sản xuất.",
            next: "inf-3",
          },
          {
            id: "quota",
            label: "Siết room tín dụng, cắt đầu tư công",
            detail: "Giới hạn trực tiếp lượng cho vay và hoãn các dự án công chưa cấp bách.",
            shocks: [
              { node: "credit", size: -0.6 },
              { node: "gov_spending", size: -0.5 },
            ],
            feedback: "Tổng cầu giảm nhanh mà lãi suất không phải lên quá cao. Nhưng biện pháp hành chính có thể làm méo mó thị trường: doanh nghiệp tốt cũng khó vay.",
            next: "inf-3",
          },
          {
            id: "price-control",
            label: "Bình ổn giá điện, xăng bằng ngân sách",
            detail: "Giữ giá các mặt hàng thiết yếu, Nhà nước bù lỗ.",
            shocks: [
              { node: "cpi", size: -0.3, duration: 4 },
              { node: "fiscal_balance", size: -0.5, duration: 4 },
            ],
            feedback: "CPI tạm thời thấp hơn, nhưng nguyên nhân gốc (tiền và tín dụng quá nhiều) chưa được xử lý. Khi thôi bình ổn, giá sẽ bật lên.",
            next: "inf-3",
          },
        ],
      },
      "inf-3": {
        id: "inf-3",
        title: "Cuối 2008: Lehman Brothers sụp đổ",
        story: "Khủng hoảng tài chính toàn cầu nổ ra. Giá dầu lao dốc, đơn hàng xuất khẩu biến mất, vốn ngoại rút đi. Từ lo lạm phát, bạn chuyển sang lo suy thoái.",
        storyIf: [{ node: "gdp_growth", below: -0.25, text: "Kinh tế vốn đã yếu đi vì đợt thắt chặt vừa rồi." }],
        event: [
          { node: "net_exports", size: -1, duration: 4 },
          { node: "fdi", size: -0.6, duration: 4 },
        ],
        question: "Quyết định cuối cùng?",
        choices: [
          {
            id: "ease-fast",
            label: "Hạ lãi suất thật nhanh",
            detail: "Đảo chiều chính sách tiền tệ, hạ lãi suất liên tục.",
            shocks: [{ node: "policy_rate", size: -1.5 }],
            feedback: "Vốn rẻ trở lại giúp đỡ tăng trưởng. Nếu bạn đã thắt chặt mạnh trước đó, bước này gần như đưa lãi suất về mức cũ.",
          },
          {
            id: "fiscal",
            label: "Kích cầu tài khóa",
            detail: "Tăng chi tiêu công và hỗ trợ doanh nghiệp.",
            shocks: [{ node: "gov_spending", size: 1 }],
            feedback: "Tổng cầu được đỡ nhanh, nhưng nợ công tăng.",
          },
          {
            id: "hold",
            label: "Giữ chính sách thắt chặt",
            detail: "Lo lạm phát quay lại nên chưa nới lỏng.",
            shocks: [],
            feedback: "Lạm phát giảm nhanh nhờ giá dầu sụp, nhưng tăng trưởng chịu cả cú sốc bên ngoài lẫn chính sách thắt chặt.",
          },
        ],
      },
    },
    reality:
      "Thực tế năm 2007 cung tiền M2 tăng 49%, tín dụng từ 65% lên 86% GDP. Lạm phát lên 23,1% năm 2008. NHNN tăng lãi suất tái cấp vốn lên 13% (5/2008) rồi 15%, siết tín dụng. Sau khi Lehman sụp đổ, từ tháng 10/2008 NHNN hạ lãi suất liên tục về 7% vào đầu 2009. Tăng trưởng 5,7% (2008) và 5,4% (2009).",
    relatedCase: "2008-lam-phat",
  },
  {
    id: "tariff-2025",
    title: "Thuế quan Mỹ",
    period: "2025",
    level: "kho",
    role: "Thủ tướng và Thống đốc",
    teaser: "Mỹ, thị trường xuất khẩu lớn nhất, bất ngờ công bố mức thuế 46% với hàng Việt Nam. Bạn giữ tăng trưởng thế nào?",
    goals: "Tăng trưởng từ 6,5% trở lên, lạm phát không quá 4,5%, tiền đồng mất giá không quá 4%, dự trữ không dưới 75 tỷ USD.",
    difficulty: 0.8,
    fire: { cpi: 5.5 },
    baseline: { cpi: 3.6, gdp_growth: 7, fx_rate: 24165, reserves: 83, public_debt: 31 },
    baselineNote: "Số khởi điểm gần với số liệu thật năm 2024 (lạm phát 3,6%, tăng trưởng 7%, tỷ giá bình quân khoảng 24.165 đồng, dự trữ khoảng 83 tỷ USD).",
    targets: [
      { node: "gdp_growth", op: ">=", value: 6.5 },
      { node: "cpi", op: "<=", value: 4.5 },
      { node: "fx_rate", op: "<=", value: 25132 },
      { node: "reserves", op: ">=", value: 75 },
    ],
    start: "tariff-1",
    rounds: {
      "tariff-1": {
        id: "tariff-1",
        title: "Tháng 4/2025: mức thuế đối ứng 46%",
        story: "Mỹ công bố áp thuế \"đối ứng\" với hàng loạt nước có thặng dư thương mại với Mỹ. Việt Nam bị áp mức 46%, thuộc nhóm cao nhất. Doanh nghiệp xuất khẩu dệt may, đồ gỗ, điện tử lo mất đơn hàng; các tập đoàn FDI cân nhắc hoãn mở rộng nhà máy.",
        event: [
          { node: "net_exports", size: -1 },
          { node: "fdi", size: -0.4, duration: 4 },
        ],
        question: "Phản ứng đầu tiên của bạn?",
        choices: [
          {
            id: "ease",
            label: "Hạ lãi suất, để tiền đồng yếu bớt",
            detail: "Hỗ trợ doanh nghiệp bằng vốn rẻ và tỷ giá có lợi cho xuất khẩu.",
            shocks: [
              { node: "policy_rate", size: -0.8 },
              { node: "fx_rate", size: 0.3 },
            ],
            feedback: "Doanh nghiệp xuất khẩu đỡ khó hơn nhờ tỷ giá và vốn rẻ. Nhưng tiền đồng yếu làm hàng nhập khẩu đắt lên, và một đồng tiền mất giá mạnh có thể bị phía Mỹ coi là thao túng tiền tệ.",
            next: "tariff-2",
          },
          {
            id: "negotiate",
            label: "Đàm phán: mua thêm hàng Mỹ, siết hàng trung chuyển",
            detail: "Cam kết nhập khẩu máy bay, khí hóa lỏng, nông sản Mỹ; chống hàng nước khác \"mượn\" xuất xứ Việt Nam.",
            shocks: [{ node: "net_exports", size: 0.5 }],
            feedback: "Giảm được nguy cơ chịu mức thuế cao nhất. Xuất khẩu ròng không hồi phục hoàn toàn vì mình cũng nhập thêm hàng Mỹ, nhưng thị trường quan trọng nhất được giữ.",
            next: "tariff-2",
          },
          {
            id: "domestic",
            label: "Dựa vào cầu trong nước: đẩy mạnh đầu tư công",
            detail: "Giải ngân nhanh các dự án hạ tầng lớn để bù phần xuất khẩu mất đi.",
            shocks: [{ node: "gov_spending", size: 0.8 }],
            feedback: "Tổng cầu trong nước bù một phần cho xuất khẩu, nhờ nợ công đang thấp nên còn dư địa. Nhưng xuất khẩu vẫn chịu mức thuế rất cao.",
            next: "tariff-2",
          },
        ],
      },
      "tariff-2": {
        id: "tariff-2",
        title: "Tháng 7/2025: thỏa thuận mức thuế 20%",
        story: "Hai bên công bố thỏa thuận: hàng Việt Nam chịu thuế 20%, hàng bị coi là trung chuyển chịu 40%. Thấp hơn nhiều so với 46%, nhưng vẫn cao hơn trước. Một số tập đoàn tiếp tục chuyển nhà máy sang Việt Nam vì mức thuế của các đối thủ cũng cao.",
        storyIf: [
          { node: "fx_rate", above: 0.3, text: "Tiền đồng đã yếu đi đáng kể so với đầu năm." },
          { node: "gdp_growth", below: -0.2, text: "Các khu công nghiệp báo đơn hàng giảm, tăng trưởng quý gần nhất chậm lại." },
        ],
        event: [
          { node: "net_exports", size: 0.5 },
          { node: "fdi", size: 0.3, duration: 4 },
        ],
        question: "Bạn làm gì tiếp theo?",
        choices: [
          {
            id: "ease-more",
            label: "Tiếp tục nới lỏng tiền tệ",
            detail: "Hạ thêm lãi suất để đẩy tín dụng.",
            shocks: [{ node: "policy_rate", size: -0.6 }],
            feedback: "Tín dụng và đầu tư tăng, nhưng tỷ giá tiếp tục chịu áp lực.",
          },
          {
            id: "stabilize",
            label: "Bán đô la giữ ổn định tỷ giá",
            detail: "Dùng một phần dự trữ để tiền đồng không mất giá thêm.",
            shocks: [
              { node: "fx_rate", size: -0.5, duration: 4 },
              { node: "reserves", size: -0.4 },
            ],
            feedback: "Tỷ giá ổn định, giúp kiểm soát lạm phát và tránh căng thẳng với Mỹ về tiền tệ. Dự trữ vốn đã mỏng lại giảm thêm.",
          },
          {
            id: "diversify",
            label: "Đa dạng hóa thị trường và tăng đầu tư công",
            detail: "Đẩy xuất khẩu sang EU, ASEAN, Nhật, đồng thời giải ngân đầu tư công.",
            shocks: [
              { node: "net_exports", size: 0.3 },
              { node: "gov_spending", size: 0.4 },
            ],
            feedback: "Giảm phụ thuộc vào một thị trường và hỗ trợ cầu trong nước. Tác động đến từ từ, nợ công tăng nhẹ.",
          },
        ],
      },
    },
    reality:
      "Tháng 4/2025 Mỹ công bố mức thuế đối ứng 46% với hàng Việt Nam. Ngày 2/7/2025, hai bên công bố thỏa thuận với mức thuế 20%, riêng hàng trung chuyển 40%. Theo số liệu World Bank, tăng trưởng GDP Việt Nam năm 2025 vẫn đạt khoảng 8%, xuất khẩu lên khoảng 98% GDP, một phần nhờ doanh nghiệp đẩy hàng đi sớm và FDI tiếp tục đổ vào, cùng với đầu tư công tăng mạnh.",
  },
];

export const SCENARIO_BY_ID = Object.fromEntries(SCENARIOS.map((s) => [s.id, s])) as Record<string, Scenario>;
