import type { Algorithm, AlgorithmStep } from "@/content/algorithms";

export function stepMap(a: Algorithm) {
  return Object.fromEntries(a.steps.map((s) => [s.id, s])) as Record<string, AlgorithmStep>;
}

/** Liệt kê lỗi cấu trúc: bước thiếu, bước không tới được, vòng lặp, nhánh cụt. */
export function algorithmProblems(a: Algorithm): string[] {
  const steps = stepMap(a);
  const out: string[] = [];
  if (!steps[a.start]) out.push(`thiếu bước đầu ${a.start}`);
  const seen = new Set<string>();
  const walk = (id: string, trail: string[]) => {
    if (trail.includes(id)) return void out.push(`vòng lặp tại ${id}`);
    const s = steps[id];
    if (!s) return void out.push(`thiếu bước ${id}`);
    seen.add(id);
    if (s.kind === "conclusion") return;
    if (s.options.length < 2) out.push(`bước ${id} cần ít nhất hai lựa chọn`);
    for (const o of s.options) walk(o.next, [...trail, id]);
  };
  if (steps[a.start]) walk(a.start, []);
  for (const s of a.steps) if (!seen.has(s.id)) out.push(`không tới được ${s.id}`);
  return out;
}

export type StepPoint = { id: string; x: number; y: number; parent?: string; kind: AlgorithmStep["kind"] };

/** Vị trí từng bước trên sơ đồ nhỏ: chiều dọc theo độ sâu, lá xếp ngang, nút cha nằm giữa các nút con. */
export function layoutAlgorithm(a: Algorithm): StepPoint[] {
  const steps = stepMap(a);
  const out: StepPoint[] = [];
  let leaf = 0;
  const place = (id: string, depth: number, parent?: string): number => {
    const s = steps[id];
    const kids = s.kind === "check" ? s.options.map((o) => place(o.next, depth + 1, id)) : [];
    const x = kids.length ? (kids[0] + kids[kids.length - 1]) / 2 : leaf++;
    out.push({ id, x, y: depth, parent, kind: s.kind });
    return x;
  };
  place(a.start, 0);
  return out;
}
