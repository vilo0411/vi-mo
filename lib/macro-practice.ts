export const DIRECTION_THRESHOLD = 0.1;

export const DIRECTION_OPTIONS = [
  { value: "up", label: "Tăng" },
  { value: "down", label: "Giảm" },
  { value: "flat", label: "Gần như đi ngang" },
] as const;

export type PracticeDirection = (typeof DIRECTION_OPTIONS)[number]["value"];

export function directionChange(previous: number, current: number, relative: boolean) {
  const difference = current - previous;
  const change = relative ? (difference / previous) * 100 : difference;
  // Tránh sai lệch dấu phẩy động khi mức thay đổi đúng bằng ngưỡng.
  return Number(change.toFixed(10));
}

export function classifyDirection(change: number): PracticeDirection {
  if (change >= DIRECTION_THRESHOLD) return "up";
  if (change <= -DIRECTION_THRESHOLD) return "down";
  return "flat";
}

export function parseInterval(lower: string, upper: string) {
  const parse = (raw: string) => {
    const value = raw.trim();
    return /^\d+(?:[.,]\d+)?$/.test(value) ? Number(value.replace(",", ".")) : NaN;
  };
  const low = parse(lower);
  const high = parse(upper);
  if (!Number.isFinite(low) || !Number.isFinite(high) || low <= 0 || low >= high) return null;
  return { low, high };
}

export function scoreInterval(answer: number, low: number, high: number) {
  const correct = low <= answer && answer <= high;
  const width = Math.log2(high) - Math.log2(low);
  const points = correct ? Math.round(100 / (1 + width)) : 0;
  return { correct, points };
}
