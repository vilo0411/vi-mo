import { getSeries, valueAt } from "./data";

export type Contribution = {
  year: number;
  /** Điểm % đóng góp vào tăng trưởng GDP thực của từng thành phần */
  C: number;
  I: number;
  G: number;
  NX: number;
  sum: number;
  actual: number;
  /** Phần chênh lệch giữa tổng đóng góp và tăng trưởng thật */
  gap: number;
};

const v = (id: string, y: number) => valueAt(getSeries(id), y);

/**
 * Đóng góp của thành phần i vào tăng trưởng năm t ≈ tỷ trọng của i trong GDP năm t−1 × tốc độ tăng thực của i năm t.
 * Xuất khẩu ròng = tỷ trọng xuất khẩu × tăng xuất khẩu − tỷ trọng nhập khẩu × tăng nhập khẩu.
 * Tỷ trọng tính theo giá hiện hành nên tổng không khớp tuyệt đối với tăng trưởng thật; phần lệch được giữ lại để hiện ra.
 */
export function contributionAt(year: number): Contribution | undefined {
  const p = year - 1;
  const parts = {
    sC: v("consumption", p), gC: v("consumption_growth", year),
    sI: v("investment", p), gI: v("investment_growth", year),
    sG: v("gov_consumption", p), gG: v("gov_consumption_growth", year),
    sX: v("exports", p), gX: v("exports_growth", year),
    sM: v("imports", p), gM: v("imports_growth", year),
    actual: v("gdp_growth", year),
  };
  if (Object.values(parts).some((x) => x === undefined)) return undefined;
  const q = parts as Record<keyof typeof parts, number>;
  const round = (x: number) => Math.round(x * 100) / 100;
  const C = (q.sC * q.gC) / 100;
  const I = (q.sI * q.gI) / 100;
  const G = (q.sG * q.gG) / 100;
  const NX = (q.sX * q.gX - q.sM * q.gM) / 100;
  const sum = C + I + G + NX;
  return { year, C: round(C), I: round(I), G: round(G), NX: round(NX), sum: round(sum), actual: q.actual, gap: round(q.actual - sum) };
}

export function contributions(from = 1997): Contribution[] {
  const out: Contribution[] = [];
  for (let y = from; y <= 2030; y++) {
    const c = contributionAt(y);
    if (c) out.push(c);
  }
  return out;
}

/** Số liệu đầu vào của một năm, để hiện cách tính từng bước. */
export function contributionInputs(year: number) {
  const p = year - 1;
  return [
    { key: "C", label: "Tiêu dùng hộ gia đình (C)", share: v("consumption", p)!, growth: v("consumption_growth", year)! },
    { key: "I", label: "Đầu tư (I)", share: v("investment", p)!, growth: v("investment_growth", year)! },
    { key: "G", label: "Chi tiêu dùng của Nhà nước (G)", share: v("gov_consumption", p)!, growth: v("gov_consumption_growth", year)! },
    { key: "X", label: "Xuất khẩu (X)", share: v("exports", p)!, growth: v("exports_growth", year)! },
    { key: "M", label: "Nhập khẩu (M, trừ đi)", share: v("imports", p)!, growth: v("imports_growth", year)! },
  ];
}
