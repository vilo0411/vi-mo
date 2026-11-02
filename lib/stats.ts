import type { Point } from "./data";

/**
 * Ghép hai chuỗi theo năm, trong đó b bị dịch đi `lag` năm:
 * lag = 2 nghĩa là so a năm t với b năm t + 2 (a đi trước b hai năm).
 */
export function alignWithLag(a: Point[], b: Point[], lag: number): { year: number; a: number; b: number }[] {
  const bMap = new Map(b.map((p) => [p.year, p.value]));
  const out: { year: number; a: number; b: number }[] = [];
  for (const p of a) {
    const bv = bMap.get(p.year + lag);
    if (bv !== undefined) out.push({ year: p.year, a: p.value, b: bv });
  }
  return out;
}

export function pearson(xs: number[], ys: number[]): number | undefined {
  const n = xs.length;
  if (n < 3 || ys.length !== n) return undefined;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (sxx === 0 || syy === 0) return undefined;
  return sxy / Math.sqrt(sxx * syy);
}

export function lagCorrelation(a: Point[], b: Point[], lag: number) {
  const pairs = alignWithLag(a, b, lag);
  return {
    r: pearson(pairs.map((p) => p.a), pairs.map((p) => p.b)),
    n: pairs.length,
  };
}

export function describeR(r: number | undefined): string {
  if (r === undefined) return "không đủ dữ liệu";
  const abs = Math.abs(r);
  const strength = abs >= 0.7 ? "mạnh" : abs >= 0.4 ? "vừa" : abs >= 0.2 ? "yếu" : "gần như không có";
  if (abs < 0.2) return "gần như không có tương quan";
  return `tương quan ${r > 0 ? "cùng chiều" : "ngược chiều"}, ${strength}`;
}
