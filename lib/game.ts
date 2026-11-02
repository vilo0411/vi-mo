import { INDICATORS } from "@/content/indicators";
import { SIM_LINKS } from "@/content/links";
import { INDICATOR_BY_ID } from "@/content/indicators";
import type { Choice, Round, RoundShock, Scenario, Target } from "@/content/scenarios";
import { simulateShocks, type TimedShock } from "./simulate";
import { findPaths } from "./paths";
import { explainPath, type WhyStep } from "./why";

/** Mỗi vòng là một năm, tức 4 kỳ (quý) trong mô phỏng. */
export const ROUND_PERIODS = 4;

/** Một quyết định. choiceId "custom" là người chơi tự đặt con số: cú sốc và vòng tiếp theo được lưu kèm. */
export type Step = {
  roundId: string;
  choiceId: string;
  custom?: RoundShock[];
  next?: string;
  /** Giọng phát ngôn đi kèm quyết định năm đó */
  guidance?: Guidance;
  /** Người chơi đã hỏi cố vấn trước khi chọn */
  advised?: boolean;
};

export type Guidance = "hawk" | "neutral" | "dove";

/**
 * Điều hành kỳ vọng: lời nói của người điều hành tác động ngắn hạn (2 quý) lên tỷ giá, lạm phát, tăng trưởng.
 * Nút "kỳ vọng" trên bản đồ chỉ là thẻ khái niệm, nên tác động được quy thẳng vào các chỉ số có trong mô phỏng.
 */
export const GUIDANCE: Record<Guidance, { label: string; detail: string; shocks: RoundShock[] }> = {
  hawk: {
    label: "Cứng rắn",
    detail: "Tuyên bố sẵn sàng thắt chặt để giữ giá trị tiền đồng và kéo lạm phát xuống.",
    shocks: [
      { node: "fx_rate", size: -0.25, duration: 2 },
      { node: "cpi", size: -0.1, duration: 2 },
      { node: "gdp_growth", size: -0.05, duration: 2 },
    ],
  },
  neutral: { label: "Trung lập", detail: "Không đưa tín hiệu gì thêm, để chính sách tự nói.", shocks: [] },
  dove: {
    label: "Mềm mỏng",
    detail: "Tuyên bố ưu tiên hỗ trợ tăng trưởng, sẵn sàng nới lỏng.",
    shocks: [
      { node: "fx_rate", size: 0.25, duration: 2 },
      { node: "cpi", size: 0.1, duration: 2 },
      { node: "gdp_growth", size: 0.05, duration: 2 },
    ],
  },
};

/**
 * Nói một đằng làm một nẻo: thị trường không tin lời Thống đốc nữa, dù lời đó cứng hay mềm.
 * Tiền đồng yếu đi, kỳ vọng lạm phát nhích lên, tăng trưởng giảm nhẹ. Luôn là tác động xấu, bằng nửa cỡ lời nói nhất quán.
 */
export const CREDIBILITY_LOSS: RoundShock[] = [
  { node: "fx_rate", size: 0.125, duration: 2 },
  { node: "cpi", size: 0.05, duration: 2 },
  { node: "gdp_growth", size: -0.025, duration: 2 },
];

/**
 * Cú sốc của phát ngôn. Nói một đằng làm một nẻo (nói cứng rắn mà hạ lãi suất, hoặc ngược lại)
 * thì thị trường không tin: dùng CREDIBILITY_LOSS, luôn là tác động xấu.
 */
export function guidanceShocks(g: Guidance | undefined, action: RoundShock[]): { shocks: RoundShock[]; consistent: boolean } {
  if (!g || g === "neutral") return { shocks: [], consistent: true };
  const want = g === "hawk" ? 1 : -1;
  const rate = action.filter((s) => s.node === "policy_rate").reduce((a, s) => a + s.size, 0);
  const consistent = Math.abs(rate) < 1e-9 || Math.sign(rate) === want;
  return { shocks: consistent ? GUIDANCE[g].shocks : CREDIBILITY_LOSS, consistent };
}

export const CUSTOM = "custom";

/** Các chỉ số dùng để chấm điểm và mức phạt cho mỗi đơn vị đi sai hướng. */
export const SCOREBOARD: { id: string; bad: "up" | "down"; weight: number; label: string }[] = [
  { id: "cpi", bad: "up", weight: 1, label: "Lạm phát" },
  { id: "gdp_growth", bad: "down", weight: 1, label: "Tăng trưởng" },
  { id: "fx_rate", bad: "up", weight: 0.6, label: "Tỷ giá" },
  { id: "reserves", bad: "down", weight: 0.35, label: "Dự trữ ngoại hối" },
  { id: "public_debt", bad: "up", weight: 0.6, label: "Nợ công" },
];

const IDS = INDICATORS.filter((i) => !i.concept).map((i) => i.id);

export function shocksFor(scenario: Scenario, steps: Step[], upToRound = steps.length): TimedShock[] {
  return sourcesFor(scenario, steps.slice(0, upToRound)).flatMap((src) => src.shocks);
}

/** Chạy mô phỏng cho các lựa chọn đã chọn, thêm một năm sau quyết định cuối để thấy hậu quả. */
export function runGame(scenario: Scenario, steps: Step[]) {
  const periods = (steps.length + 1) * ROUND_PERIODS;
  return { result: simulateShocks(SIM_LINKS, IDS, shocksFor(scenario, steps), periods), periods };
}

/**
 * Bình quân trên toàn bộ thời gian chơi: một đợt lạm phát hay một lần tiêu dự trữ ở năm đầu
 * vẫn bị tính, dù tới năm cuối đã hết.
 */
export function averageValues(result: Record<string, number[]>, periods: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const id of Object.keys(result)) {
    const xs = result[id].slice(1, periods + 1);
    out[id] = xs.reduce((a, b) => a + b, 0) / xs.length;
  }
  return out;
}

export function score(values: Record<string, number>, difficulty = 1) {
  let penalty = 0;
  const parts = SCOREBOARD.map((m) => {
    const v = values[m.id] ?? 0;
    const p = Math.max(0, m.bad === "up" ? v : -v) * m.weight;
    penalty += p;
    return { ...m, value: v, penalty: p };
  });
  const points = Math.max(0, Math.round(100 - penalty * 100 * difficulty));
  const stars = points >= 70 ? 3 : points >= 45 ? 2 : 1;
  return { points, stars, parts };
}

/** Giá trị bình quân của năm cuối cùng, dùng để so với mục tiêu. */
export function lastYearValues(result: Record<string, number[]>, periods: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const id of Object.keys(result)) {
    const tail = result[id].slice(periods - ROUND_PERIODS + 1, periods + 1);
    out[id] = tail.reduce((a, b) => a + b, 0) / tail.length;
  }
  return out;
}

/**
 * Quy đổi "đơn vị cú sốc" của mô hình ra số thật để người chơi đọc được.
 * pp: cộng thêm k điểm % cho mỗi đơn vị. pct: thay đổi k% so với số khởi điểm cho mỗi đơn vị.
 * Đây là hệ số minh họa cho mô hình giáo khoa, không phải ước lượng kinh tế lượng.
 */
export const REAL_SCALE: Record<string, { kind: "pp" | "pct"; k: number; unit: string }> = {
  cpi: { kind: "pp", k: 4, unit: "%" },
  gdp_growth: { kind: "pp", k: 2.5, unit: "%" },
  fx_rate: { kind: "pct", k: 4, unit: "đ" },
  reserves: { kind: "pct", k: 15, unit: "tỷ USD" },
  public_debt: { kind: "pp", k: 4, unit: "% GDP" },
  policy_rate: { kind: "pp", k: 1.5, unit: "%" },
  unemployment: { kind: "pp", k: 0.6, unit: "%" },
  m2: { kind: "pp", k: 10, unit: "%" },
  gov_spending: { kind: "pp", k: 1, unit: "% GDP" },
  fiscal_balance: { kind: "pp", k: 1.5, unit: "% GDP" },
  credit: { kind: "pp", k: 5, unit: "% GDP" },
  net_exports: { kind: "pp", k: 3, unit: "% GDP" },
  fdi: { kind: "pp", k: 1.5, unit: "% GDP" },
  consumption: { kind: "pp", k: 2, unit: "% GDP" },
  fed_rate: { kind: "pp", k: 2.5, unit: "%" },
  oil_price: { kind: "pct", k: 30, unit: "USD" },
};

export function toReal(id: string, base: number, v: number): number {
  const sc = REAL_SCALE[id];
  if (!sc) return base;
  return sc.kind === "pp" ? base + v * sc.k : base * (1 + (v * sc.k) / 100);
}

export function formatReal(id: string, x: number): string {
  const sc = REAL_SCALE[id];
  if (id === "fx_rate") return `${Math.round(x).toLocaleString("vi-VN")} đ`;
  const n = x.toLocaleString("vi-VN", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  if (!sc) return n;
  return sc.unit.startsWith("%") ? `${n}${sc.unit === "%" ? "%" : " " + sc.unit}` : `${n} ${sc.unit}`;
}

export function checkTargets(scenario: Scenario, values: Record<string, number>) {
  return scenario.targets.map((t: Target) => {
    const real = toReal(t.node, scenario.baseline[t.node], values[t.node] ?? 0);
    const ok = t.op === "<=" ? real <= t.value + 1e-9 : real >= t.value - 1e-9;
    return { ...t, real, ok };
  });
}

/** Điểm và sao cuối nhiệm kỳ: chưa đạt hết mục tiêu bằng số thì tối đa 2 sao. */
export function finalResult(scenario: Scenario, result: Record<string, number[]>, periods: number) {
  const s = score(averageValues(result, periods), scenario.difficulty);
  const targets = checkTargets(scenario, lastYearValues(result, periods));
  const allMet = targets.every((t) => t.ok);
  return { ...s, stars: allMet ? s.stars : Math.min(s.stars, 2), targets, allMet };
}

/** Câu chuyện của vòng, thêm những câu phản ánh hậu quả từ các lựa chọn trước. */
export function storyFor(round: Round, result: Record<string, number[]>, t: number): string[] {
  const extra = (round.storyIf ?? [])
    .filter((c) => {
      const v = result[c.node]?.[t] ?? 0;
      return (c.above !== undefined && v > c.above) || (c.below !== undefined && v < c.below);
    })
    .map((c) => c.text);
  return [round.story, ...extra];
}

export function describeChange(v: number): string {
  const a = Math.abs(v);
  if (a < 0.03) return "gần như không đổi";
  const dir = v > 0 ? "tăng" : "giảm";
  if (a < 0.15) return `${dir} nhẹ`;
  if (a < 0.4) return dir;
  return `${dir} mạnh`;
}

/** Liệt kê mọi đường chơi, dùng để kiểm tra điểm có phân hóa hợp lý. */
export function allPlaythroughs(scenario: Scenario): Step[][] {
  const out: Step[][] = [];
  const walk = (roundId: string, steps: Step[]) => {
    for (const c of scenario.rounds[roundId].choices) {
      const next = [...steps, { roundId, choiceId: c.id }];
      if (c.next) walk(c.next, next);
      else out.push(next);
    }
  };
  walk(scenario.start, []);
  return out;
}

const pct = (x: number, d = 1) => `${x >= 0 ? "+" : "−"}${Math.abs(x).toLocaleString("vi-VN", { maximumFractionDigits: d, minimumFractionDigits: d })}`;

/**
 * Tác động của giọng phát ngôn khi đi kèm một phương án, bằng con số thật, để hiện ngay trên thẻ phương án.
 * Đổi giọng thì dòng này đổi theo: nhất quán thì có lợi, thiếu nhất quán thì bị phạt vì mất uy tín.
 */
export function talkPreview(g: Guidance | undefined, action: RoundShock[]): { consistent: boolean; text: string } | null {
  const { shocks, consistent } = guidanceShocks(g, action);
  if (!shocks.length) return null;
  const parts = shocks.map((s) => {
    const name = INDICATOR_BY_ID[s.node]?.name ?? s.node;
    const sc = REAL_SCALE[s.node];
    if (!sc) return `${name} ${s.size > 0 ? "tăng" : "giảm"}`;
    return `${name} ${pct(s.size * sc.k, 2)}${sc.kind === "pp" ? " điểm %" : "%"}`;
  });
  return { consistent, text: `${parts.join(", ")} trong ${shocks[0].duration ?? 2} quý` };
}

/** Mô tả một cú sốc bằng con số thật, ví dụ "Lãi suất điều hành 4,0% → 5,5%". */
export function describeShock(scenario: Scenario, s: RoundShock): string {
  const name = INDICATOR_BY_ID[s.node]?.name ?? s.node;
  const sc = REAL_SCALE[s.node];
  const base = scenario.baseline[s.node];
  const temp = s.duration ? ` trong ${s.duration} quý` : "";
  if (!sc) return `${name} ${s.size > 0 ? "tăng" : "giảm"}${temp}`;
  if (s.node === "reserves" && base !== undefined) {
    const usd = Math.abs((base * sc.k * s.size) / 100);
    return `${s.size < 0 ? "Bán ra" : "Mua vào"} khoảng ${usd.toLocaleString("vi-VN", { maximumFractionDigits: 0 })} tỷ USD dự trữ`;
  }
  if (sc.kind === "pp") {
    const d = s.size * sc.k;
    if (base !== undefined) return `${name} ${formatReal(s.node, base)} → ${formatReal(s.node, base + d)}${temp}`;
    return `${name} ${pct(d)} điểm %${sc.unit === "% GDP" ? " GDP" : ""}${temp}`;
  }
  return `${name} ${pct(s.size * sc.k)}%${temp}`;
}

export const LEVERS = [
  { id: "rate", label: "Thay đổi lãi suất điều hành", unit: "điểm %", min: -3, max: 3, step: 0.25 },
  { id: "spend", label: "Thay đổi chi tiêu công", unit: "% GDP", min: -1, max: 2, step: 0.25 },
  { id: "sell", label: "Bán đô la từ dự trữ", unit: "% dự trữ", min: 0, max: 30, step: 2.5 },
] as const;

export type LeverValues = Record<(typeof LEVERS)[number]["id"], number>;

/** Đổi các con số người chơi tự đặt thành cú sốc cho mô hình, cùng thang quy đổi với REAL_SCALE. */
export function leversToShocks(v: LeverValues): RoundShock[] {
  const out: RoundShock[] = [];
  if (v.rate) out.push({ node: "policy_rate", size: v.rate / REAL_SCALE.policy_rate.k });
  if (v.spend) out.push({ node: "gov_spending", size: v.spend / REAL_SCALE.gov_spending.k });
  if (v.sell) {
    // Bán 7,5% dự trữ tương đương phương án "bán đô la" dựng sẵn: dự trữ −0,5, tỷ giá −0,8 trong 4 quý.
    const k = v.sell / 7.5;
    out.push({ node: "reserves", size: -0.5 * k }, { node: "fx_rate", size: -0.8 * k, duration: 4 });
  }
  return out;
}

/** Phương án dựng sẵn gần nhất với các cú sốc tự đặt, để biết câu chuyện rẽ sang nhánh nào. */
export function nearestChoice(round: Round, shocks: RoundShock[]): Choice {
  const vec = (ss: RoundShock[]) => {
    const m: Record<string, number> = {};
    for (const s of ss) m[s.node] = (m[s.node] ?? 0) + s.size;
    return m;
  };
  const a = vec(shocks);
  let best = round.choices[0];
  let bestD = Infinity;
  for (const c of round.choices) {
    const b = vec(c.shocks);
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    let d = 0;
    for (const k of keys) d += ((a[k] ?? 0) - (b[k] ?? 0)) ** 2;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

/** Một nguồn tác động trong trò chơi: sự kiện của một năm, hoặc lựa chọn của bạn trong năm đó. */
export type Source = {
  key: string;
  kind: "you" | "event";
  year: number;
  label: string;
  shocks: TimedShock[];
  /** Nguồn là lời phát ngôn, không phải công cụ: không coi là cú sốc đánh thẳng vào chỉ số */
  talk?: true;
};

const LETTERS = ["A", "B", "C", "D"];

/** Tên ngắn của sự kiện, lấy từ tiêu đề vòng: "Năm thứ nhất: xăng tăng giá từng tuần" → "xăng tăng giá từng tuần". */
export function eventLabel(round: Round) {
  const k = round.title.indexOf(":");
  return k >= 0 ? round.title.slice(k + 1).trim() : round.title;
}

function pushTalk(out: Source[], step: Step, action: RoundShock[], k: number, start: number) {
  const { shocks, consistent } = guidanceShocks(step.guidance, action);
  if (!shocks.length) return;
  const label = `Phát ngôn ${GUIDANCE[step.guidance!].label.toLowerCase()}${consistent ? "" : " (thiếu nhất quán)"}`;
  out.push({ key: `y${k + 1}-talk`, kind: "you", year: k + 1, label, shocks: shocks.map((e) => ({ ...e, start })), talk: true });
}

/** Tách các cú sốc theo nguồn, đi đúng nhánh mà người chơi đã chọn (giống shocksFor). */
export function sourcesFor(scenario: Scenario, steps: Step[]): Source[] {
  const out: Source[] = [];
  let roundId: string | undefined = scenario.start;
  for (let k = 0; k <= steps.length && roundId; k++) {
    const round: Round = scenario.rounds[roundId];
    const start = k * ROUND_PERIODS;
    if (round.event.length) out.push({ key: `y${k + 1}-event`, kind: "event", year: k + 1, label: eventLabel(round), shocks: round.event.map((e) => ({ ...e, start })) });
    const step = steps[k];
    if (!step) break;
    if (step.choiceId === CUSTOM) {
      out.push({ key: `y${k + 1}-you`, kind: "you", year: k + 1, label: "D. Tự đặt con số", shocks: (step.custom ?? []).map((e) => ({ ...e, start })) });
      pushTalk(out, step, step.custom ?? [], k, start);
      roundId = step.next;
      continue;
    }
    const idx = round.choices.findIndex((c) => c.id === step.choiceId);
    const choice = round.choices[idx];
    out.push({ key: `y${k + 1}-you`, kind: "you", year: k + 1, label: `${LETTERS[idx]}. ${choice.label}`, shocks: choice.shocks.map((e) => ({ ...e, start })) });
    pushTalk(out, step, choice.shocks, k, start);
    roundId = choice.next;
  }
  return out;
}

/** Kết quả mô phỏng của từng nguồn khi chạy riêng. Mô hình tuyến tính nên cộng các phần lại đúng bằng kết quả chung. */
export type Attribution = { sources: Source[]; parts: Record<string, Record<string, number[]>> };

export function attribute(scenario: Scenario, steps: Step[]): Attribution {
  const periods = (steps.length + 1) * ROUND_PERIODS;
  const sources = sourcesFor(scenario, steps);
  const parts: Attribution["parts"] = {};
  for (const src of sources) parts[src.key] = simulateShocks(SIM_LINKS, IDS, src.shocks, periods);
  return { sources, parts };
}

/** Phần đóng góp của một nguồn vào một chỉ số. */
export type Driver = { key: string; kind: "you" | "event"; year: number; label: string; c: number; amount: string; helps: boolean | null; /** amount là số thật hay chỉ là chữ "đẩy lên"/"kéo xuống" */ real: boolean };

/** Đổi một thay đổi của mô hình ra số thật, ví dụ "+2,4 điểm %" hay "+1,2%". */
export function realDelta(scenario: Scenario, id: string, c: number): string {
  const sc = REAL_SCALE[id];
  const base = scenario.baseline[id];
  const sign = c >= 0 ? "+" : "−";
  const n = (x: number, d = 1) => Math.abs(x).toLocaleString("vi-VN", { maximumFractionDigits: d, minimumFractionDigits: d });
  if (!sc) return c >= 0 ? "đẩy lên" : "kéo xuống";
  if (sc.kind === "pp") return `${sign}${n(c * sc.k)} điểm %${sc.unit === "% GDP" ? " GDP" : ""}`;
  if (id === "fx_rate" && base !== undefined) return `${sign}${Math.round(Math.abs((base * sc.k * c) / 100)).toLocaleString("vi-VN")} đ`;
  if (base !== undefined) return `${sign}${n((base * sc.k * c) / 100)} ${sc.unit}`;
  return `${sign}${n(c * sc.k)}%`;
}

function goodness(id: string, delta: number): boolean | null {
  const board = SCOREBOARD.find((m) => m.id === id);
  if (!board || Math.abs(delta) < 1e-6) return null;
  return delta > 0 !== (board.bad === "up");
}

/**
 * Chia thay đổi của chỉ số `id` (từ kỳ tA của A sang kỳ tB của B) theo từng nguồn.
 * Bỏ những nguồn đóng góp quá nhỏ so với nguồn lớn nhất.
 */
export function driversBetween(scenario: Scenario, id: string, A: Attribution, tA: number, B: Attribution, tB: number): Driver[] {
  const all = B.sources.map((src) => {
    const c = (B.parts[src.key]?.[id]?.[tB] ?? 0) - (A.parts[src.key]?.[id]?.[tA] ?? 0);
    return { key: src.key, kind: src.kind, year: src.year, label: src.label, c, amount: realDelta(scenario, id, c), helps: goodness(id, c), real: !!REAL_SCALE[id] };
  });
  const top = Math.max(0, ...all.map((d) => Math.abs(d.c)));
  return all.filter((d) => Math.abs(d.c) >= Math.max(0.005, top * 0.15)).sort((a, b) => Math.abs(b.c) - Math.abs(a.c));
}

/** Một dòng giải thích cho một kỳ: chỉ số nào đổi, đổi bao nhiêu, do sự kiện nào hay lựa chọn nào của bạn, đi qua đường nào. */
export type QuarterNote = {
  id: string;
  name: string;
  /** Cú sốc đánh thẳng vào chỉ số này đúng kỳ này, hoặc vừa hết hạn */
  direct?: "you" | "event" | "ended";
  v: number;
  prev: number;
  /** "3,0% → 3,6%" khi quy đổi được ra số thật, không thì "tăng nhẹ" */
  change: string;
  /** true: đi đúng hướng mong muốn, false: sai hướng, null: chỉ số không chấm điểm */
  good: boolean | null;
  drivers: Driver[];
  /** Câu nối thay đổi với câu chuyện và lựa chọn của bạn */
  verdict: string;
  /** Đường lan truyền từ chỗ nguồn chính tác động tới chỉ số này, ví dụ ["Lãi suất điều hành", "Lãi suất cho vay", "Tín dụng"] */
  path?: string[];
  /** Cơ chế của mũi tên cuối cùng trên đường đó */
  mechanism?: string;
  /** Giải thích từng bước của đường lan truyền, cho người mới */
  why?: WhyStep[];
};

const nameOf = (id: string) => INDICATOR_BY_ID[id]?.name ?? id;
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export function changeText(scenario: Scenario, id: string, prev: number, v: number): string {
  const base = scenario.baseline[id];
  if (base !== undefined && REAL_SCALE[id]) return `${formatReal(id, toReal(id, base, prev))} → ${formatReal(id, toReal(id, base, v))}`;
  return describeChange(v - prev);
}

/** Đường nhân quả mạnh nhất từ các cú sốc của nguồn tới chỉ số, cùng chiều với tác động của nguồn đó. */
function pathFrom(src: Source, id: string, level: number) {
  let best: { nodes: string[]; mechanism: string; strength: number; why: WhyStep[] } | undefined;
  for (const sh of src.shocks) {
    if (sh.node === id) continue;
    for (const p of findPaths(SIM_LINKS, sh.node, id, 5)) {
      if (p.sign * Math.sign(sh.size) !== Math.sign(level)) continue;
      if (!best || p.strength > best.strength) best = { nodes: p.nodes, mechanism: p.links.at(-1)!.mechanism, strength: p.strength, why: explainPath(p.nodes, p.links, sh.size > 0) };
      break; // findPaths đã xếp mạnh nhất lên đầu
    }
  }
  return best;
}

const whoOf = (d: Driver) => (d.kind === "you" ? `lựa chọn "${d.label}" của bạn (năm ${d.year})` : `sự kiện "${d.label}" (năm ${d.year})`);
const capFirst = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);

/**
 * Câu nối thay đổi với câu chuyện và lựa chọn: chỉ số đang lệch khỏi khởi điểm vì nguồn nào,
 * nguồn nào kéo ngược lại, và tác động đang mạnh lên hay yếu dần.
 * drivers là phần đóng góp của từng nguồn vào mức chênh so với khởi điểm; prev là mức đó ở kỳ trước.
 */
export function verdictFor(
  name: string,
  drivers: Driver[],
  prev: Record<string, number>,
  delta: number,
  direct?: { kind: "you" | "event" | "ended"; label: string; year: number },
): string {
  if (direct?.kind === "you") return `Đây chính là lựa chọn "${direct.label}" bạn đưa ra ở năm ${direct.year}. Công cụ thay đổi ngay, các chỉ số khác sẽ phản ứng dần trong những quý tới.`;
  if (direct?.kind === "event") return `Đây là diễn biến trong câu chuyện năm ${direct.year}: ${direct.label}. Bạn không điều khiển được cú sốc này, chỉ có thể đối phó với hậu quả.`;
  if (direct?.kind === "ended") return `Cú sốc "${direct.label}" (năm ${direct.year}) đã qua, ${lowerFirst(name)} trở về gần mức khởi điểm.`;
  const main = drivers[0];
  if (!main) return `${name} đã về gần mức khởi điểm: các tác động trước đó đã hết.`;

  const amt = (d: Driver) => (d.real ? ` ${d.amount}` : "");
  const net = drivers.reduce((a, d) => a + d.c, 0);
  const out: string[] = [];
  out.push(`${name} đang ${net > 0 ? "cao" : "thấp"} hơn khởi điểm, chủ yếu do ${whoOf(main)}${main.real ? `, khoảng ${main.amount}` : ""}.`);
  const was = prev[main.key] ?? 0;
  if (Math.sign(delta) !== Math.sign(net) && Math.abs(delta) > 1e-6) out.push("Quý này chỉ số đã nhích dần về phía khởi điểm.");
  else if (Math.abs(main.c) < Math.abs(was) * 0.9) out.push("Tác động đó đang yếu dần.");
  else if (Math.abs(main.c) > Math.abs(was) * 1.1 && Math.abs(was) > 1e-6) out.push("Tác động đó còn đang lan mạnh hơn.");
  for (const d of drivers.slice(1, 3)) {
    const same = Math.sign(d.c) === Math.sign(main.c);
    out.push(`${capFirst(whoOf(d))} ${same ? "đẩy thêm" : "kéo ngược lại"}${amt(d)}.`);
  }
  const mine = drivers.find((d) => d.kind === "you");
  if (mine?.helps === true) out.push(`Ở chỉ số này, lựa chọn "${mine.label}" đang có tác dụng.`);
  else if (mine?.helps === false) out.push(`Ở chỉ số này, đó là cái giá của lựa chọn "${mine.label}".`);
  else if (!mine && drivers.some((d) => d.helps === false)) out.push("Các lựa chọn của bạn chưa chạm tới chỉ số này.");
  return out.join(" ");
}

export const EMPTY_ATTRIBUTION: Attribution = { sources: [], parts: {} };

/**
 * Kể lại kỳ t: những chỉ số vừa đổi, chia theo nguồn (sự kiện trong câu chuyện, lựa chọn của bạn),
 * kèm đường lan truyền trên bản đồ. Cú sốc đánh thẳng vào chỉ số được kể trước.
 */
export function explainQuarter(scenario: Scenario, att: Attribution, result: Record<string, number[]>, t: number, min = 0.02): QuarterNote[] {
  const directOf = new Map<string, { kind: "you" | "event" | "ended"; label: string; year: number }>();
  for (const src of att.sources)
    for (const sh of src.shocks) {
      if (src.talk) continue;
      if (directOf.has(sh.node)) continue;
      if (sh.start === t) directOf.set(sh.node, { kind: src.kind, label: src.label, year: src.year });
      else if (sh.duration && sh.start + sh.duration === t) directOf.set(sh.node, { kind: "ended", label: src.label, year: src.year });
    }

  const notes: QuarterNote[] = [];
  for (const id of Object.keys(result)) {
    const v = result[id][t] ?? 0;
    const prev = t > 0 ? (result[id][t - 1] ?? 0) : 0;
    const delta = v - prev;
    const direct = directOf.get(id);
    if (Math.abs(delta) < min && !direct) continue;
    // Mức chênh so với khởi điểm, chia theo nguồn; và mức đó ở kỳ trước để biết tác động mạnh lên hay yếu dần.
    const drivers = driversBetween(scenario, id, EMPTY_ATTRIBUTION, 0, att, t);
    const prevLevel = Object.fromEntries(att.sources.map((x) => [x.key, t > 0 ? (att.parts[x.key][id]?.[t - 1] ?? 0) : 0]));
    const name = nameOf(id);
    let path: string[] | undefined;
    let mechanism: string | undefined;
    let why: WhyStep[] | undefined;
    const main = drivers[0];
    if (main && (!direct || direct.kind === "ended")) {
      const src = att.sources.find((x) => x.key === main.key)!;
      const p = pathFrom(src, id, att.parts[src.key][id][t]);
      if (p) {
        path = p.nodes.map(nameOf);
        mechanism = p.mechanism;
        why = p.why;
      }
    }
    notes.push({ id, name, direct: direct?.kind, v, prev, change: changeText(scenario, id, prev, v), good: goodness(id, delta), drivers, verdict: verdictFor(name, drivers, prevLevel, delta, direct), path, mechanism, why });
  }
  const rank = { you: 0, event: 1, ended: 2 } as const;
  const head = notes.filter((n) => n.direct).sort((a, b) => rank[a.direct!] - rank[b.direct!]);
  // Ưu tiên các chỉ số dùng để chấm điểm, rồi mới tới độ lớn của thay đổi.
  const chain = notes
    .filter((n) => !n.direct)
    .sort((a, b) => Number(b.good !== null) - Number(a.good !== null) || Math.abs(b.v - b.prev) - Math.abs(a.v - a.prev));
  return [...head, ...chain];
}

// ---------- Bị cách chức ----------

export type FireRule = { node: string; op: ">" | "<"; value: number; label: string };

/** Ngưỡng bị cách chức của kịch bản: vượt 2 quý liền là mất ghế. */
export function fireRules(scenario: Scenario): FireRule[] {
  const b = scenario.baseline;
  const f = scenario.fire ?? {};
  const cpiTarget = scenario.targets.find((t) => t.node === "cpi")?.value;
  const out: FireRule[] = [];
  if (b.cpi !== undefined) out.push({ node: "cpi", op: ">", value: f.cpi ?? Math.max((cpiTarget ?? b.cpi) + 4, b.cpi + 5), label: "Lạm phát phi mã" });
  if (b.gdp_growth !== undefined) out.push({ node: "gdp_growth", op: "<", value: f.gdp ?? 0, label: "Kinh tế suy thoái" });
  if (b.reserves !== undefined) out.push({ node: "reserves", op: "<", value: b.reserves * (f.reserves ?? 0.6), label: "Cạn dự trữ ngoại hối" });
  return out;
}

export function breaches(rule: FireRule, real: number) {
  return rule.op === ">" ? real > rule.value : real < rule.value;
}

/** Quý đầu tiên bị cách chức (vượt ngưỡng ở cả quý đó và quý trước), hoặc null. */
export function checkFired(scenario: Scenario, result: Record<string, number[]>, upTo: number, rules = fireRules(scenario)) {
  const realAt = (id: string, t: number) => toReal(id, scenario.baseline[id], result[id]?.[t] ?? 0);
  for (let t = 1; t <= upTo; t++)
    for (const rule of rules) {
      if (breaches(rule, realAt(rule.node, t)) && breaches(rule, realAt(rule.node, t - 1))) return { t, rule, real: realAt(rule.node, t) };
    }
  return null;
}
