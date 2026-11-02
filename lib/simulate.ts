import type { Link } from "@/content/links";

export type Shock = { node: string; size: number };

/**
 * Lan truyền một cú sốc qua mạng quan hệ nhân quả.
 * Mô hình giáo khoa: mỗi chỉ số ở kỳ t bằng tổng (dấu × độ mạnh × giá trị kỳ t − độ trễ)
 * của các chỉ số tác động vào nó, cộng cú sốc nếu đó là chỉ số bị sốc.
 * Cú sốc được giữ nguyên trong suốt thời gian mô phỏng (ví dụ NHNN giữ lãi suất cao).
 * Giá trị là "đơn vị cú sốc" tương đối, không phải phần trăm thật.
 */
export function simulate(links: Link[], nodes: string[], shock: Shock, periods: number): Record<string, number[]> {
  return simulateShocks(links, nodes, [{ ...shock, start: 0 }], periods);
}

/** Cú sốc bắt đầu ở kỳ `start`, kéo dài `duration` kỳ (bỏ trống là giữ mãi). */
export type TimedShock = Shock & { start: number; duration?: number };

export function simulateShocks(links: Link[], nodes: string[], shocks: TimedShock[], periods: number): Record<string, number[]> {
  const out: Record<string, number[]> = Object.fromEntries(nodes.map((n) => [n, Array(periods + 1).fill(0)]));
  const incoming = new Map<string, Link[]>();
  for (const l of links) incoming.set(l.to, [...(incoming.get(l.to) ?? []), l]);

  for (let t = 0; t <= periods; t++) {
    for (const n of nodes) {
      let v = 0;
      for (const s of shocks) {
        if (s.node === n && t >= s.start && (s.duration === undefined || t < s.start + s.duration)) v += s.size;
      }
      for (const l of incoming.get(n) ?? []) {
        const src = t - l.lag;
        if (src >= 0) v += l.sign * l.strength * out[l.from][src];
      }
      out[n][t] = v;
    }
  }
  return out;
}

export type Preset = { id: string; label: string; node: string; size: number; description: string };

export const PRESETS: Preset[] = [
  { id: "rate-up", label: "NHNN tăng lãi suất", node: "policy_rate", size: 1, description: "NHNN tăng lãi suất điều hành và giữ ở mức cao." },
  { id: "rate-down", label: "NHNN hạ lãi suất", node: "policy_rate", size: -1, description: "NHNN hạ lãi suất điều hành để kích thích kinh tế." },
  { id: "spend-up", label: "Tăng chi tiêu công", node: "gov_spending", size: 1, description: "Chính phủ tăng chi tiêu, ví dụ một gói kích cầu." },
  { id: "fed-up", label: "Fed tăng lãi suất", node: "fed_rate", size: 1, description: "Mỹ tăng lãi suất, USD mạnh lên trên toàn cầu." },
  { id: "oil-up", label: "Giá dầu tăng", node: "oil_price", size: 1, description: "Giá dầu thế giới tăng mạnh, ví dụ do xung đột." },
  { id: "vnd-down", label: "VND mất giá", node: "fx_rate", size: 1, description: "Tỷ giá VND/USD tăng." },
  { id: "fdi-up", label: "FDI đổ vào", node: "fdi", size: 1, description: "Một làn sóng vốn FDI mới, ví dụ dịch chuyển chuỗi cung ứng." },
];

/** Độ mạnh tương đối (−1..1 so với tác động lớn nhất) thành chữ, thay cho số thập phân khó hiểu. */
export function level(k: number): { text: string; word: "không đổi" | "nhẹ" | "vừa" | "mạnh" } {
  const a = Math.abs(k);
  if (a < 0.005) return { text: "Không đổi", word: "không đổi" };
  const up = k > 0;
  if (a < 0.15) return { text: `${up ? "↑" : "↓"} nhẹ`, word: "nhẹ" };
  if (a < 0.45) return { text: `${up ? "↑" : "↓"} vừa`, word: "vừa" };
  return { text: `${up ? "↑↑" : "↓↓"} mạnh`, word: "mạnh" };
}

export type StepEvent = {
  id: string;
  /** Giá trị ở kỳ t và kỳ trước (so với lúc chưa có cú sốc) */
  v: number;
  prev: number;
  /** new: lần đầu bị ảnh hưởng; stronger / weaker: tác động mạnh lên / dịu bớt; flip: đổi chiều */
  trend: "new" | "stronger" | "weaker" | "flip";
  /** Mũi tên đóng góp nhiều nhất vào thay đổi ở kỳ này, và giá trị của chỉ số nguồn lúc đó */
  driver?: { link: Link; from: number };
  /** Số mũi tên khác cũng đang tác động */
  others: number;
};

/**
 * Kể lại chuyện gì vừa xảy ra ở kỳ t: chỉ số nào vừa đổi và mũi tên nào đẩy nó.
 * Bỏ qua thay đổi nhỏ hơn `min` (cùng đơn vị với kết quả mô phỏng).
 */
export function explainStep(result: Record<string, number[]>, links: Link[], t: number, shockNode: string, min = 0.01): StepEvent[] {
  const out: StepEvent[] = [];
  for (const id of Object.keys(result)) {
    if (id === shockNode) continue;
    const v = result[id][t];
    const prev = t > 0 ? result[id][t - 1] : 0;
    const delta = v - prev;
    if (Math.abs(delta) < min) continue;
    const pushes = links
      .filter((l) => l.to === id && t - l.lag >= 0 && result[l.from])
      .map((l) => ({ link: l, from: result[l.from][t - l.lag], c: l.sign * l.strength * result[l.from][t - l.lag] }))
      .filter((p) => Math.abs(p.c) >= min / 2);
    // Ưu tiên mũi tên đẩy cùng hướng với thay đổi; không có thì lấy mũi tên mạnh nhất.
    const same = pushes.filter((p) => Math.sign(p.c) === Math.sign(delta));
    const pool = same.length ? same : pushes;
    const best = pool.sort((a, b) => Math.abs(b.c) - Math.abs(a.c))[0];
    const trend = Math.abs(prev) < min ? "new" : Math.sign(v) !== Math.sign(prev) ? "flip" : Math.abs(v) > Math.abs(prev) ? "stronger" : "weaker";
    out.push({ id, v, prev, trend, driver: best && { link: best.link, from: best.from }, others: Math.max(0, pushes.length - 1) });
  }
  return out.sort((a, b) => Math.abs(b.v - b.prev) - Math.abs(a.v - a.prev));
}
