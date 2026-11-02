import all from "@/data/series/all.json";
import manualConcepts from "@/data/manual/concepts.json";

export type Point = { year: number; value: number };
export type Series = {
  id: string;
  source: string;
  code: string;
  url: string;
  unit: string;
  frequency: string;
  updatedAt: string;
  points: Point[];
};

export const SERIES = all as unknown as Record<string, Series>;

export function getSeries(id: string): Series | undefined {
  return SERIES[id];
}

export function valueAt(s: Series | undefined, year: number): number | undefined {
  return s?.points.find((p) => p.year === year)?.value;
}

export function latest(s: Series | undefined): Point | undefined {
  return s?.points.at(-1);
}

/** Độ lệch chuẩn hóa so với trung bình lịch sử của chính chuỗi đó. */
export function zScore(s: Series | undefined, year: number): number | undefined {
  const v = valueAt(s, year);
  if (!s || v === undefined || s.points.length < 3) return undefined;
  const vals = s.points.map((p) => p.value);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const sd = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length);
  return sd === 0 ? 0 : (v - mean) / sd;
}

/** Số năm bị thiếu giữa năm đầu và năm cuối. */
export function missingYears(s: Series | undefined): number {
  if (!s || !s.points.length) return 0;
  const first = s.points[0].year;
  const last = s.points.at(-1)!.year;
  return last - first + 1 - s.points.length;
}

export const YEAR_RANGE = (() => {
  let min = Infinity;
  let max = -Infinity;
  for (const s of Object.values(SERIES)) {
    for (const p of s.points) {
      if (p.year >= 1995) min = Math.min(min, p.year);
      max = Math.max(max, p.year);
    }
  }
  return { min, max };
})();

export function formatValue(v: number | undefined, unit?: string): string {
  if (v === undefined || Number.isNaN(v)) return "—";
  const abs = Math.abs(v);
  const digits = abs >= 1000 ? 0 : abs >= 100 ? 0 : 1;
  const n = v.toLocaleString("vi-VN", { maximumFractionDigits: digits, minimumFractionDigits: digits });
  if (!unit) return n;
  if (unit.startsWith("%")) return `${n}%`;
  if (unit.startsWith("tỷ USD")) return `${n} tỷ USD`;
  if (unit.startsWith("VND")) return `${n} đ`;
  if (unit.startsWith("USD/thùng")) return `${n} USD`;
  return n;
}

/** Viết thường chữ cái đầu để ghép tên chỉ số vào giữa câu, giữ nguyên các chữ viết tắt như CPI, GDP, Fed. */
export function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** Thay đổi so với năm trước: chuỗi tính bằng % thì tính theo điểm %, chuỗi mức (tỷ giá, USD) thì tính theo % thay đổi. */
export function changeAt(s: Series | undefined, year: number): { delta: number; text: string } | undefined {
  const v = valueAt(s, year);
  const prev = valueAt(s, year - 1);
  if (!s || v === undefined || prev === undefined) return undefined;
  if (s.unit.startsWith("%")) {
    const d = v - prev;
    return { delta: d, text: `${d >= 0 ? "+" : "−"}${Math.abs(d).toLocaleString("vi-VN", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} điểm %` };
  }
  if (prev === 0) return undefined;
  const d = ((v - prev) / Math.abs(prev)) * 100;
  return { delta: d, text: `${d >= 0 ? "+" : "−"}${Math.abs(d).toLocaleString("vi-VN", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%` };
}

/** Cách viết ngắn cho thẻ: "↑ 0,4 điểm" (chuỗi %) hoặc "↓ 2,1%" (chuỗi mức). */
export function changeShort(s: Series | undefined, year: number): { delta: number; text: string } | undefined {
  const ch = changeAt(s, year);
  if (!ch || !s) return undefined;
  const n = Math.abs(ch.delta).toLocaleString("vi-VN", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const arrow = Math.abs(ch.delta) < 0.05 ? "→" : ch.delta > 0 ? "↑" : "↓";
  return { delta: ch.delta, text: `${arrow} ${n}${s.unit.startsWith("%") ? " điểm" : "%"}` };
}

/** Số công bố cho một khái niệm không có chuỗi theo năm (room tín dụng, kiều hối…), nhập tay kèm nguồn. */
export type ManualConcept = {
  id: string;
  value: number;
  unit: string;
  year: number;
  approx?: boolean;
  label: string;
  detail: string;
  source: string;
};

const MANUAL_CONCEPTS = Object.fromEntries((manualConcepts.items as ManualConcept[]).map((m) => [m.id, m])) as Record<string, ManualConcept>;

export function manualConcept(id: string): ManualConcept | undefined {
  return MANUAL_CONCEPTS[id];
}

export function formatManual(m: ManualConcept): string {
  const n = m.value.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
  return `${m.approx ? "~" : ""}${n}${m.unit === "%" ? "%" : ` ${m.unit}`}`;
}
