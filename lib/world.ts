import { CAST, type Voice } from "@/content/world";
import type { Choice, Scenario } from "@/content/scenarios";
import { REAL_SCALE, toReal } from "./game";

/** Bài cần ôn khi bị cách chức vì chỉ số này. */
export const FIRE_LESSON: Record<string, string> = {
  cpi: "vi-sao-gia-tang",
  gdp_growth: "lai-suat",
  reserves: "tien-dong-va-the-gioi",
};

/**
 * Tin nhắn từ phố trong một năm: lời riêng của lựa chọn trước, rồi lời chung của những nhân vật
 * có chỉ số mình quan tâm vừa đổi nhiều nhất. Mỗi nhân vật nói một lần.
 */
export function streetVoices(before: Record<string, number[]>, t0: number, after: Record<string, number[]>, t1: number, choice?: Choice, max = 2): Voice[] {
  const out: Voice[] = [...(choice?.voices ?? [])];
  const hits = CAST.flatMap((c) =>
    c.watches.flatMap((w) => {
      const k = REAL_SCALE[w.node]?.k ?? 1;
      const d = ((after[w.node]?.[t1] ?? 0) - (before[w.node]?.[t0] ?? 0)) * k;
      const moved = w.dir === "up" ? d : -d;
      return moved >= w.min ? [{ by: c.id, text: w.text, weight: moved / w.min }] : [];
    }),
  ).sort((a, b) => b.weight - a.weight);
  for (const h of hits) if (!out.some((v) => v.by === h.by)) out.push({ by: h.by, text: h.text });
  return out.slice(0, max);
}

/** Kết cục từng nhân vật theo số thật của năm sau nhiệm kỳ. */
export function streetEndings(scenario: Scenario, values: Record<string, number>): Voice[] {
  return (scenario.endings ?? []).map((e) => {
    if (e.node === undefined) return { by: e.by, text: e.yes };
    const real = toReal(e.node, scenario.baseline[e.node], values[e.node] ?? 0);
    return { by: e.by, text: (e.op === "<=" ? real <= e.value + 1e-9 : real >= e.value - 1e-9) ? e.yes : e.no };
  });
}
