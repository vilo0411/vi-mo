import type { Scenario } from "@/content/scenarios";
import { allPlaythroughs, CUSTOM, finalResult, REAL_SCALE, runGame, toReal, type Step } from "./game";

const n1 = (x: number) => x.toLocaleString("vi-VN", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const n2 = (x: number) => x.toLocaleString("vi-VN", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export type TaylorAdvice = {
  infl: number;
  inflTarget: number;
  growth: number;
  growthTarget: number;
  /** Mức đổi lãi suất điều hành gợi ý, điểm % */
  delta: number;
  lines: string[];
};

/**
 * Lời khuyên theo quy tắc Taylor giản lược: Δi = 1,0 × (lạm phát − mục tiêu) + 0,5 × (tăng trưởng − mục tiêu).
 * `result` là kết quả khi chưa ra quyết định năm nay, nên bình quân 4 quý tới chính là dự báo "nếu không làm gì".
 * Đây là quy tắc kinh nghiệm để tham khảo, không phải đáp án của trò chơi.
 */
export function taylorAdvice(scenario: Scenario, result: Record<string, number[]>, t: number): TaylorAdvice {
  const b = scenario.baseline;
  const avg = (id: string) => {
    const xs = (result[id] ?? []).slice(t + 1, t + 5);
    return xs.length ? xs.reduce((a, x) => a + x, 0) / xs.length : (result[id]?.[t] ?? 0);
  };
  const real = (id: string) => toReal(id, b[id], avg(id));
  const infl = real("cpi");
  const growth = real("gdp_growth");
  const inflTarget = scenario.targets.find((x) => x.node === "cpi")?.value ?? Math.min(b.cpi, 4);
  const growthTarget = scenario.targets.find((x) => x.node === "gdp_growth")?.value ?? b.gdp_growth;
  const raw = 1.0 * (infl - inflTarget) + 0.5 * (growth - growthTarget);
  const delta = Math.max(-3, Math.min(3, Math.round(raw * 4) / 4));

  const lines: string[] = [];
  lines.push(
    `Nếu năm nay không làm gì, lạm phát sẽ khoảng ${n1(infl)}%, ${infl > inflTarget ? `cao hơn mục tiêu ${n1(inflTarget)}% là ${n1(infl - inflTarget)} điểm %` : `dưới mục tiêu ${n1(inflTarget)}%`}; tăng trưởng khoảng ${n1(growth)}%, ${growth >= growthTarget ? "vẫn đạt" : `thiếu ${n1(growthTarget - growth)} điểm % so với`} mức ${n1(growthTarget)}%.`,
  );
  if (Math.abs(delta) < 0.25) lines.push("Theo quy tắc Taylor, lãi suất đang ở mức hợp lý: chưa cần đổi.");
  else
    lines.push(
      `Theo quy tắc Taylor (1,0 × độ lệch lạm phát + 0,5 × độ lệch tăng trưởng), nên ${delta > 0 ? "tăng" : "hạ"} lãi suất khoảng ${n2(Math.abs(delta))} điểm %.`,
    );

  if (b.fx_rate !== undefined && b.reserves !== undefined) {
    const fxUp = (real("fx_rate") / b.fx_rate - 1) * 100;
    const res = real("reserves");
    if (fxUp > 2 && res > b.reserves * 0.8) lines.push(`Tiền đồng đã mất giá ${n1(fxUp)}%, dự trữ còn ${Math.round(res)} tỷ USD: có thể bán một phần đô la để làm dịu tỷ giá, nhưng đừng tiêu quá tay.`);
    else if (fxUp > 2) lines.push(`Tiền đồng mất giá ${n1(fxUp)}% mà dự trữ đã mỏng: nên dùng lãi suất thay vì bán thêm đô la.`);
  }
  if (infl > inflTarget + 0.5 && growth >= growthTarget) lines.push("Nền kinh tế đang nóng: đừng nới lỏng hay tăng chi tiêu lúc này.");
  else if (infl > inflTarget + 0.5) lines.push("Vừa lạm phát vừa tăng trưởng yếu: thắt chặt sẽ làm tăng trưởng chậm thêm, cân nhắc mức tăng vừa phải.");
  if (growth < growthTarget - 0.3 && infl <= inflTarget && REAL_SCALE.gov_spending) lines.push("Kinh tế đang yếu mà lạm phát trong tầm kiểm soát: hạ lãi suất hoặc tăng chi tiêu công có chọn lọc đều đáng cân nhắc.");
  return { infl, inflTarget, growth, growthTarget, delta, lines };
}

/** Mọi cách chơi tiếp từ vòng `roundId`, mỗi cách là danh sách bước còn lại. */
function continuations(scenario: Scenario, roundId: string): Step[][] {
  const out: Step[][] = [];
  const walk = (id: string, acc: Step[]) => {
    for (const c of scenario.rounds[id].choices) {
      const next = [...acc, { roundId: id, choiceId: c.id }];
      if (c.next) walk(c.next, next);
      else out.push(next);
    }
  };
  walk(roundId, []);
  return out;
}

/**
 * Với mỗi phương án của năm nay, điểm cao nhất có thể đạt nếu những năm sau cũng chơi tốt nhất.
 * Cố vấn gợi ý phương án có điểm đó cao nhất.
 */
export function bestContinuation(scenario: Scenario, done: Step[], roundId: string) {
  const byChoice: Record<string, number> = {};
  for (const rest of continuations(scenario, roundId)) {
    const steps = [...done, ...rest];
    const { result, periods } = runGame(scenario, steps);
    const pts = finalResult(scenario, result, periods).points;
    const first = rest[0].choiceId;
    byChoice[first] = Math.max(byChoice[first] ?? -1, pts);
  }
  const best = Object.entries(byChoice).sort((a, b) => b[1] - a[1])[0];
  return { choiceId: best[0], points: best[1], byChoice };
}

/** Đường đi của "chuyên gia": cách chơi bằng các phương án dựng sẵn cho điểm cao nhất. */
export function expertPath(scenario: Scenario) {
  let best: { steps: Step[]; points: number; stars: number } | undefined;
  for (const steps of allPlaythroughs(scenario)) {
    const { result, periods } = runGame(scenario, steps);
    const f = finalResult(scenario, result, periods);
    if (!best || f.points > best.points) best = { steps, points: f.points, stars: f.stars };
  }
  const { result, periods } = runGame(scenario, best!.steps);
  return { ...best!, result, periods };
}

/** Tên ngắn của các bước, để hiện đường đi: "A. Tăng lãi suất". */
export function stepLabels(scenario: Scenario, steps: Step[]) {
  return steps.map((s) => {
    if (s.choiceId === CUSTOM) return "D. Tự đặt con số";
    const choices = scenario.rounds[s.roundId].choices;
    const k = choices.findIndex((c) => c.id === s.choiceId);
    return `${"ABCD"[k]}. ${choices[k].label}`;
  });
}
