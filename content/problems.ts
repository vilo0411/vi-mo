import { getSeries, valueAt } from "@/lib/data";
import { contributionAt, contributionInputs } from "@/lib/contributions";

export type Problem = {
  id: string;
  level: "de" | "vua" | "kho";
  title: string;
  /** Đề bài, đã điền số liệu thật */
  prompt: string;
  answer: number;
  /** Sai số chấp nhận được (tuyệt đối) */
  tolerance: number;
  unit: string;
  hint: string;
  solution: string;
  relatedTerm?: string;
};

const v = (id: string, year: number) => {
  const x = valueAt(getSeries(id), year);
  if (x === undefined) throw new Error(`Thiếu dữ liệu ${id} năm ${year}`);
  return x;
};
const f = (x: number, d = 1) => x.toLocaleString("vi-VN", { maximumFractionDigits: d, minimumFractionDigits: d });
const r = (x: number, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

function build(): Problem[] {
  const lend08 = v("lending_rate", 2008);
  const cpi08 = v("cpi", 2008);
  const fx22 = v("fx_rate", 2022);
  const fx23 = v("fx_rate", 2023);
  const inv23 = v("investment", 2023);
  const g23 = v("gdp_growth", 2023);
  const ex25 = v("exports_usd", 2025);
  const im25 = v("imports_usd", 2025);
  const res25 = v("reserves", 2025);
  const cpi22 = v("cpi", 2022);
  const cpi23 = v("cpi", 2023);
  const pc24 = v("gdp_per_capita", 2024);
  const pc25 = v("gdp_per_capita", 2025);
  const c25 = v("consumption", 2025);
  const i25 = v("investment", 2025);
  const gc25 = v("gov_consumption", 2025);
  const nx25 = v("net_exports", 2025);
  const res21 = v("reserves", 2021);
  const res22 = v("reserves", 2022);

  const ci = Object.fromEntries(contributionInputs(2025).map((i) => [i.key, i]));
  const k25 = contributionAt(2025)!;

  return [
    {
      id: "dong-gop-tieu-dung",
      level: "vua",
      title: "Tiêu dùng góp bao nhiêu vào tăng trưởng?",
      prompt: `Năm 2024 tiêu dùng hộ gia đình chiếm ${f(ci.C.share, 2)}% GDP. Năm 2025 tiêu dùng tăng thực ${f(ci.C.growth, 2)}%. Tiêu dùng đóng góp bao nhiêu điểm % vào tăng trưởng GDP năm 2025?`,
      answer: r((ci.C.share * ci.C.growth) / 100),
      tolerance: 0.03,
      unit: "điểm %",
      hint: "Đóng góp = tỷ trọng năm trước × tốc độ tăng năm nay. Nhớ đổi tỷ trọng ra số thập phân (53% = 0,53).",
      solution: `${f(ci.C.share / 100, 4)} × ${f(ci.C.growth, 2)} ≈ ${f((ci.C.share * ci.C.growth) / 100, 2)} điểm %. Tức là gần một nửa trong khoảng 8% tăng trưởng năm 2025 đến từ người dân chi tiêu nhiều hơn.`,
      relatedTerm: "dong-gop-tang-truong",
    },
    {
      id: "dong-gop-tong",
      level: "kho",
      title: "Ghép lại tốc độ tăng GDP từ các thành phần",
      prompt: `Tỷ trọng năm 2024 và tốc độ tăng thực năm 2025: tiêu dùng ${f(ci.C.share)}% và ${f(ci.C.growth)}%; đầu tư ${f(ci.I.share)}% và ${f(ci.I.growth)}%; chi tiêu Nhà nước ${f(ci.G.share)}% và ${f(ci.G.growth)}%; xuất khẩu ${f(ci.X.share)}% và ${f(ci.X.growth)}%; nhập khẩu ${f(ci.M.share)}% và ${f(ci.M.growth)}%. Tính tổng đóng góp, tức tốc độ tăng GDP năm 2025 theo cách ghép thành phần.`,
      answer: k25.sum,
      tolerance: 0.1,
      unit: "%",
      hint: "Tính đóng góp của từng phần (tỷ trọng × tốc độ tăng). Với nhập khẩu thì trừ đi, vì nhập khẩu không phải hàng làm ra trong nước.",
      solution: `C ≈ ${f(k25.C, 2)}, I ≈ ${f(k25.I, 2)}, G ≈ ${f(k25.G, 2)}, X − M ≈ ${f((ci.X.share * ci.X.growth) / 100, 2)} − ${f((ci.M.share * ci.M.growth) / 100, 2)} = ${f(k25.NX, 2)}. Tổng ≈ ${f(k25.sum, 2)}%, rất gần con số chính thức ${f(k25.actual, 2)}%. Để ý xuất khẩu và nhập khẩu mỗi bên đóng góp khoảng 14–15 điểm % nhưng gần như triệt tiêu nhau.`,
      relatedTerm: "dong-gop-tang-truong",
    },
    {
      id: "gio-hang",
      level: "de",
      title: "Giỏ hàng sau hai năm",
      prompt: `Lạm phát Việt Nam năm 2022 là ${f(cpi22, 2)}% và năm 2023 là ${f(cpi23, 2)}%. Một giỏ hàng đầu năm 2022 giá 100.000 đồng thì cuối năm 2023 giá khoảng bao nhiêu đồng?`,
      answer: Math.round(100000 * (1 + cpi22 / 100) * (1 + cpi23 / 100)),
      tolerance: 60,
      unit: "đồng",
      hint: "Lạm phát cộng dồn theo kiểu lãi kép: nhân hai hệ số (1 + lạm phát) với nhau, không cộng hai con số lại.",
      solution: `100.000 × (1 + ${f(cpi22 / 100, 4)}) × (1 + ${f(cpi23 / 100, 4)}) ≈ ${Math.round(100000 * (1 + cpi22 / 100) * (1 + cpi23 / 100)).toLocaleString("vi-VN")} đồng. Nếu cộng thẳng ${f(cpi22, 2)}% + ${f(cpi23, 2)}% sẽ thiếu một chút, vì năm thứ hai giá tăng trên nền đã cao hơn.`,
      relatedTerm: "ky-vong-lam-phat",
    },
    {
      id: "mat-gia",
      level: "de",
      title: "Tiền đồng mất giá bao nhiêu?",
      prompt: `Tỷ giá bình quân năm 2022 là ${Math.round(fx22).toLocaleString("vi-VN")} đồng/USD, năm 2023 là ${Math.round(fx23).toLocaleString("vi-VN")} đồng/USD. Tỷ giá tăng bao nhiêu phần trăm?`,
      answer: r(((fx23 - fx22) / fx22) * 100),
      tolerance: 0.05,
      unit: "%",
      hint: "Phần trăm thay đổi = (giá trị mới − giá trị cũ) / giá trị cũ × 100.",
      solution: `(${Math.round(fx23)} − ${Math.round(fx22)}) / ${Math.round(fx22)} × 100 ≈ ${f(((fx23 - fx22) / fx22) * 100, 2)}%. Tiền đồng mất giá nhẹ so với USD, dù năm 2022 là năm áp lực rất lớn: phần lớn nhờ NHNN bán ra hàng chục tỷ USD dự trữ.`,
      relatedTerm: "pha-gia",
    },
    {
      id: "gdp-thanh-phan",
      level: "de",
      title: "Công thức GDP",
      prompt: `Năm 2025, tiêu dùng hộ gia đình chiếm ${f(c25)}% GDP, đầu tư ${f(i25)}%, chi tiêu dùng của Nhà nước ${f(gc25)}%. Nếu bốn thành phần C + I + G + (X − M) cộng lại đúng 100%, xuất khẩu ròng chiếm khoảng bao nhiêu % GDP?`,
      answer: r(100 - c25 - i25 - gc25, 1),
      tolerance: 0.15,
      unit: "% GDP",
      hint: "X − M = 100% − C − I − G.",
      solution: `100 − ${f(c25)} − ${f(i25)} − ${f(gc25)} = ${f(100 - c25 - i25 - gc25)}% GDP. Số liệu thật của World Bank là ${f(nx25)}%: phần chênh lệch nhỏ là \"sai số thống kê\" khi các thành phần được ước tính riêng.`,
      relatedTerm: "tong-cung-tong-cau",
    },
    {
      id: "lai-suat-thuc-2008",
      level: "vua",
      title: "Lãi suất thực năm 2008",
      prompt: `Năm 2008, lãi suất cho vay bình quân là ${f(lend08, 2)}%/năm, lạm phát CPI là ${f(cpi08, 2)}%. Lãi suất thực (tính gần đúng) là bao nhiêu?`,
      answer: r(lend08 - cpi08),
      tolerance: 0.1,
      unit: "%",
      hint: "Lãi suất thực ≈ lãi suất danh nghĩa − lạm phát.",
      solution: `${f(lend08, 2)} − ${f(cpi08, 2)} ≈ ${f(lend08 - cpi08, 2)}%. Lãi suất thực âm: dù lãi suất gần 16%, người đi vay vẫn có lợi vì giá cả tăng nhanh hơn. Vì vậy NHNN phải đẩy lãi suất điều hành lên 15% mới hãm được cầu vay.`,
      relatedTerm: "lai-suat-thuc",
    },
    {
      id: "icor",
      level: "vua",
      title: "Hiệu quả đầu tư (ICOR)",
      prompt: `Năm 2023, tổng đầu tư bằng ${f(inv23, 2)}% GDP và tăng trưởng GDP là ${f(g23, 2)}%. Tính ICOR gần đúng (làm tròn 2 chữ số thập phân).`,
      answer: r(inv23 / g23),
      tolerance: 0.05,
      unit: "",
      hint: "ICOR ≈ tỷ lệ đầu tư trên GDP / tốc độ tăng trưởng.",
      solution: `${f(inv23, 2)} / ${f(g23, 2)} ≈ ${f(inv23 / g23, 2)}. Cần khoảng ${f(inv23 / g23, 1)} đồng vốn để tạo ra thêm 1 đồng GDP. ICOR cao trong năm tăng trưởng thấp là bình thường, nhưng nếu kéo dài thì đầu tư đang kém hiệu quả.`,
      relatedTerm: "icor",
    },
    {
      id: "xuat-sieu",
      level: "vua",
      title: "Xuất siêu bao nhiêu tỷ USD?",
      prompt: `Năm 2025 Việt Nam xuất khẩu hàng hóa và dịch vụ khoảng ${f(ex25)} tỷ USD, nhập khẩu khoảng ${f(im25)} tỷ USD. Xuất khẩu ròng là bao nhiêu tỷ USD?`,
      answer: r(ex25 - im25, 1),
      tolerance: 0.15,
      unit: "tỷ USD",
      hint: "Xuất khẩu ròng = xuất khẩu − nhập khẩu.",
      solution: `${f(ex25)} − ${f(im25)} = ${f(ex25 - im25)} tỷ USD. Tổng kim ngạch rất lớn nhưng phần chênh lệch nhỏ hơn nhiều, vì hàng xuất khẩu cần rất nhiều linh kiện nhập khẩu.`,
      relatedTerm: "can-can-thuong-mai",
    },
    {
      id: "thang-nhap-khau",
      level: "vua",
      title: "Dự trữ đủ dùng mấy tháng?",
      prompt: `Cuối năm 2025 dự trữ ngoại hối khoảng ${f(res25)} tỷ USD. Nhập khẩu hàng hóa và dịch vụ cả năm khoảng ${f(im25)} tỷ USD. Dự trữ đủ trả cho khoảng bao nhiêu tháng nhập khẩu?`,
      answer: r(res25 / (im25 / 12)),
      tolerance: 0.05,
      unit: "tháng",
      hint: "Nhập khẩu một tháng = nhập khẩu cả năm / 12. Rồi lấy dự trữ chia cho số đó.",
      solution: `${f(im25)} / 12 ≈ ${f(im25 / 12)} tỷ USD/tháng. ${f(res25)} / ${f(im25 / 12)} ≈ ${f(res25 / (im25 / 12), 2)} tháng, dưới mốc 3 tháng thường được nhắc tới. World Bank tính ra khoảng 2,1 tháng vì gộp thêm cả các khoản thanh toán thu nhập.`,
      relatedTerm: "so-thang-nhap-khau",
    },
    {
      id: "ban-du-tru",
      level: "vua",
      title: "NHNN đã bán bao nhiêu đô la?",
      prompt: `Dự trữ ngoại hối năm 2021 khoảng ${f(res21)} tỷ USD, năm 2022 còn khoảng ${f(res22)} tỷ USD. Dự trữ giảm bao nhiêu phần trăm?`,
      answer: r(((res21 - res22) / res21) * 100, 1),
      tolerance: 0.15,
      unit: "%",
      hint: "Phần trăm giảm = (cũ − mới) / cũ × 100.",
      solution: `(${f(res21)} − ${f(res22)}) / ${f(res21)} × 100 ≈ ${f(((res21 - res22) / res21) * 100)}%. Khoảng ${f(res21 - res22)} tỷ USD, phần lớn do NHNN bán ra để giữ giá tiền đồng khi Fed tăng lãi suất mạnh.`,
      relatedTerm: "bo-ba",
    },
    {
      id: "gdp-thuc",
      level: "kho",
      title: "Tách tăng trưởng thật ra khỏi tăng giá",
      prompt: "GDP danh nghĩa của một nước tăng 10% trong năm, còn chỉ số giảm phát GDP tăng 4%. Tăng trưởng GDP thực là bao nhiêu phần trăm? (tính chính xác, không dùng phép trừ gần đúng)",
      answer: r((1.1 / 1.04 - 1) * 100),
      tolerance: 0.03,
      unit: "%",
      hint: "GDP thực = GDP danh nghĩa / chỉ số giá. Tăng trưởng thực = (1 + tăng danh nghĩa) / (1 + tăng giá) − 1.",
      solution: `1,10 / 1,04 − 1 ≈ ${f((1.1 / 1.04 - 1) * 100, 2)}%. Phép trừ 10% − 4% = 6% chỉ là xấp xỉ, sai nhiều hơn khi lạm phát cao.`,
      relatedTerm: "gdp-danh-nghia-thuc",
    },
    {
      id: "binh-quan",
      level: "kho",
      title: "GDP bình quân đầu người tính bằng USD",
      prompt: `GDP bình quân đầu người của Việt Nam năm 2024 là ${f(pc24, 0)} USD, năm 2025 là ${f(pc25, 0)} USD. Tăng bao nhiêu phần trăm? Vì sao con số này khác tốc độ tăng trưởng GDP thực ${f(v("gdp_growth", 2025), 1)}%?`,
      answer: r(((pc25 - pc24) / pc24) * 100),
      tolerance: 0.05,
      unit: "%",
      hint: "Tính phần trăm thay đổi như bình thường. Rồi nghĩ: số tính bằng USD còn chịu ảnh hưởng của những gì ngoài sản lượng?",
      solution: `(${f(pc25, 0)} − ${f(pc24, 0)}) / ${f(pc24, 0)} × 100 ≈ ${f(((pc25 - pc24) / pc24) * 100, 2)}%. Con số này khác tăng trưởng thực vì nó tính bằng USD danh nghĩa: gồm cả lạm phát trong nước, sự thay đổi tỷ giá, và bị chia cho dân số đang tăng.`,
      relatedTerm: "gdp-binh-quan",
    },
    {
      id: "no-cong",
      level: "kho",
      title: "Nợ công năm sau",
      prompt: "Nợ công đang là 35% GDP. Lãi suất bình quân trên nợ là 5%/năm, GDP danh nghĩa tăng 9%/năm, và năm nay ngân sách thâm hụt cơ bản (chưa tính trả lãi) 1% GDP. Theo công thức d₁ = d₀ × (1 + lãi suất) / (1 + tăng trưởng danh nghĩa) + thâm hụt cơ bản, nợ công năm sau là bao nhiêu % GDP?",
      answer: r(35 * (1.05 / 1.09) + 1),
      tolerance: 0.05,
      unit: "% GDP",
      hint: "Thay số vào công thức: 35 × 1,05 / 1,09 + 1.",
      solution: `35 × 1,05 / 1,09 + 1 ≈ ${f(35 * (1.05 / 1.09) + 1, 2)}% GDP. Dù vẫn thâm hụt, tỷ lệ nợ giảm nhẹ vì GDP tăng nhanh hơn lãi suất. Đây là lý do nợ công Việt Nam giảm từ gần 48% (2016) xuống khoảng 30% GDP.`,
      relatedTerm: "du-dia",
    },
    {
      id: "taylor",
      level: "kho",
      title: "Quy tắc Taylor",
      prompt: "Một ngân hàng trung ương đặt lãi suất theo quy tắc Taylor: i = r* + π + 0,5 × (π − π*) + 0,5 × khoảng cách sản lượng. Biết lãi suất thực trung tính r* = 2%, lạm phát hiện tại π = 6%, mục tiêu π* = 4%, khoảng cách sản lượng −1% (kinh tế hơi yếu). Lãi suất nên đặt là bao nhiêu?",
      answer: 2 + 6 + 0.5 * (6 - 4) + 0.5 * -1,
      tolerance: 0.01,
      unit: "%",
      hint: "Thay lần lượt từng số. Phần 0,5 × (π − π*) làm lãi suất cao hơn khi lạm phát vượt mục tiêu; phần khoảng cách sản lượng âm kéo lãi suất xuống.",
      solution: "2 + 6 + 0,5 × 2 + 0,5 × (−1) = 8,5%. Lạm phát vượt mục tiêu 2 điểm % nên lãi suất được đẩy lên hơn mức lạm phát, để lãi suất thực dương và đủ hãm cầu. Quy tắc này là công cụ tham khảo, NHNN không công bố dùng nó.",
      relatedTerm: "san-luong-tiem-nang",
    },
  ];
}

export const PROBLEMS = build();
