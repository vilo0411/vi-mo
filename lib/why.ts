import { INDICATOR_BY_ID, INDICATORS } from "@/content/indicators";
import { SIM_LINKS, type Link } from "@/content/links";
import type { RoundShock } from "@/content/scenarios";
import { findPaths } from "./paths";
import { simulateShocks } from "./simulate";

/**
 * Giải thích cho người mới: vì sao một quyết định (hay một sự kiện) làm chỉ số khác thay đổi,
 * kể từng bước theo đường nhân quả trên bản đồ, mỗi bước kèm quy luật bằng lời thường.
 */

const nameOf = (id: string) => INDICATOR_BY_ID[id]?.name ?? id;
/** Viết thường chữ đầu, trừ từ viết tắt như NHNN, VND, GDP. */
export const lowerFirst = (s: string) => (/^\p{Lu}{2}/u.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));

/** Cách nói chiều thay đổi cho dễ hiểu: tỷ giá tăng nghĩa là tiền đồng yếu đi. */
const DIR: Record<string, [string, string]> = {
  fx_rate: ["tăng, tức là tiền đồng yếu đi", "giảm, tức là tiền đồng mạnh lên"],
  fiscal_balance: ["tốt lên, tức là bớt thâm hụt", "xấu đi, tức là thâm hụt nhiều hơn"],
  reserves: ["tăng", "giảm, tức là Nhà nước còn ít đô la hơn"],
  net_exports: ["tăng, tức là bán ra nước ngoài nhiều hơn mua vào", "giảm"],
  current_account: ["tốt lên, tức là đô la chảy vào nhiều hơn chảy ra", "xấu đi"],
};
export const dirWord = (id: string, up: boolean) => DIR[id]?.[up ? 0 : 1] ?? (up ? "tăng" : "giảm");

export type WhyStep = {
  from: string;
  to: string;
  /** "Lãi suất điều hành tăng nên lãi suất cho vay tăng." */
  text: string;
  /** Quy luật của mũi tên này, viết bằng lời thường (lấy từ bản đồ) */
  rule: string;
  /** Quy luật được viết cho chiều tăng, còn ở đây đang diễn ra theo chiều giảm */
  reverse: boolean;
  /** Độ trễ của bước này, tính theo quý */
  lag: number;
  fromUp: boolean;
  toUp: boolean;
};

/** Kể từng bước của một đường nhân quả. `startUp`: chỉ số đầu đường đang tăng hay giảm. */
export function explainPath(nodes: string[], links: Link[], startUp: boolean): WhyStep[] {
  let up = startUp;
  return links.map((l, i) => {
    const fromUp = up;
    const toUp = l.sign > 0 ? fromUp : !fromUp;
    up = toUp;
    return {
      from: nodes[i],
      to: nodes[i + 1],
      text: `${nameOf(nodes[i])} ${dirWord(nodes[i], fromUp)}, nên ${lowerFirst(nameOf(nodes[i + 1]))} ${dirWord(nodes[i + 1], toUp)}.`,
      rule: l.mechanism,
      reverse: !fromUp,
      lag: l.lag,
      fromUp,
      toUp,
    };
  });
}

/** Định nghĩa bằng lời thường của một chỉ số, cho người chưa biết gì. */
export const plainOf = (id: string) => INDICATOR_BY_ID[id]?.plain ?? "";

const IDS = INDICATORS.filter((i) => !i.concept).map((i) => i.id);
const HORIZON = 6;

export type ChoiceEffect = {
  target: string;
  /** Chỉ số mục tiêu sẽ tăng hay giảm vì riêng phương án này */
  up: boolean;
  /** Sau khoảng bao nhiêu quý thì thấy rõ */
  after: number;
  /** Tác động này tốt hay xấu cho người chơi */
  good: boolean;
  steps: WhyStep[];
};

const TARGETS: { id: string; bad: "up" | "down" }[] = [
  { id: "cpi", bad: "up" },
  { id: "gdp_growth", bad: "down" },
  { id: "fx_rate", bad: "up" },
];

/**
 * Trước khi chọn: phương án này, nếu đứng riêng, sẽ đẩy lạm phát, tăng trưởng, tỷ giá đi đâu, sau bao lâu, qua đường nào.
 * Chiều tác động lấy từ chính mô phỏng; đường kể lại là đường mạnh nhất cùng chiều đó.
 */
export function choiceEffects(shocks: RoundShock[]): ChoiceEffect[] {
  if (!shocks.length) return [];
  const sim = simulateShocks(SIM_LINKS, IDS, shocks.map((s) => ({ ...s, start: 0 })), HORIZON);
  const out: ChoiceEffect[] = [];
  for (const t of TARGETS) {
    if (shocks.some((s) => s.node === t.id)) continue;
    const xs = sim[t.id];
    const peak = xs.reduce((m, x) => (Math.abs(x) > Math.abs(m) ? x : m), 0);
    if (Math.abs(peak) < 0.03) continue;
    const up = peak > 0;
    const after = Math.max(1, xs.findIndex((x) => Math.abs(x) >= Math.abs(peak) * 0.5));
    let best: { nodes: string[]; links: Link[]; strength: number; up: boolean } | undefined;
    for (const sh of shocks) {
      for (const p of findPaths(SIM_LINKS, sh.node, t.id, 5)) {
        if ((p.sign * Math.sign(sh.size) > 0) !== up) continue;
        const strength = p.strength * Math.abs(sh.size);
        if (!best || strength > best.strength) best = { nodes: p.nodes, links: p.links, strength, up: sh.size > 0 };
        break;
      }
    }
    if (!best) continue;
    out.push({ target: t.id, up, after, good: up !== (t.bad === "up"), steps: explainPath(best.nodes, best.links, best.up) });
  }
  return out;
}

/** Một câu tóm tắt: "Lạm phát CPI sẽ giảm, thấy rõ sau khoảng 2 quý." */
export function effectHeadline(e: ChoiceEffect): string {
  return `${nameOf(e.target)} sẽ ${dirWord(e.target, e.up)}, thấy rõ sau khoảng ${e.after} quý`;
}

/** Cả chuỗi trong một câu: "Lãi suất điều hành tăng, kéo theo lãi suất cho vay tăng, rồi tín dụng giảm, cuối cùng lạm phát giảm." */
export function chainSentence(steps: WhyStep[]): string {
  if (!steps.length) return "";
  const head = `${nameOf(steps[0].from)} ${dirWord(steps[0].from, steps[0].fromUp)}`;
  if (steps.length === 1) return `${head}, nên ${lowerFirst(nameOf(steps[0].to))} ${dirWord(steps[0].to, steps[0].toUp)}.`;
  const mids = steps.map((st, i) => {
    const link = i === 0 ? "kéo theo" : i === steps.length - 1 ? "cuối cùng" : "rồi";
    return `${link} ${lowerFirst(nameOf(st.to))} ${dirWord(st.to, st.toUp)}`;
  });
  return `${head}, ${mids.join(", ")}.`;
}

/** Quy luật của một bước bằng lời thường, có "và ngược lại" khi lần này đi theo chiều giảm. */
export const ruleText = (st: WhyStep) => `${st.rule.replace(/\.?$/, ".")}${st.reverse ? " Điều ngược lại cũng đúng." : ""}`;
