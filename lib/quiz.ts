import { INDICATOR_BY_ID } from "@/content/indicators";
import { SIM_LINKS } from "@/content/links";
import type { Scenario } from "@/content/scenarios";
import { attribute, driversBetween, EMPTY_ATTRIBUTION, realDelta, runGame, SCOREBOARD, type Step } from "./game";
import { findPaths } from "./paths";

export type QuizQuestion = { id: string; prompt: string; options: string[]; answer: number; explain: string };

const nameOf = (id: string) => INDICATOR_BY_ID[id]?.name ?? id;

/** Trộn thứ tự đáp án cố định theo chuỗi, để cùng một lượt chơi luôn ra cùng một đề. */
function shuffle<T>(xs: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function make(id: string, prompt: string, correct: string, wrong: string[], explain: string, seed: string): QuizQuestion {
  const options = shuffle([correct, ...wrong.filter((w) => w !== correct).slice(0, 3)], seed + id);
  return { id, prompt, options, answer: options.indexOf(correct), explain };
}

/** Ba câu hỏi rút ra từ chính lượt vừa chơi: tác động của lựa chọn, nguồn gốc lạm phát, kênh truyền dẫn. */
export function buildQuiz(scenario: Scenario, steps: Step[]): QuizQuestion[] {
  if (!steps.length) return [];
  const { periods } = runGame(scenario, steps);
  const att = attribute(scenario, steps);
  const seed = scenario.id + steps.map((s) => s.choiceId).join("-");
  const qs: QuizQuestion[] = [];
  const you1 = att.sources.find((s) => s.key === "y1-you");

  // 1. Chỉ số chấm điểm chịu tác động mạnh nhất từ lựa chọn năm 1, sau một năm.
  if (you1) {
    const t = Math.min(4, periods);
    const scored = SCOREBOARD.map((m) => ({ m, c: att.parts[you1.key][m.id]?.[t] ?? 0 }));
    const top = [...scored].sort((a, b) => Math.abs(b.c) * b.m.weight - Math.abs(a.c) * a.m.weight)[0];
    if (Math.abs(top.c) > 0.01)
      qs.push(
        make(
          "impact",
          `Sau một năm, lựa chọn "${you1.label}" ở năm 1 tác động mạnh nhất tới chỉ số nào?`,
          top.m.label,
          SCOREBOARD.map((m) => m.label),
          `Riêng lựa chọn này làm ${top.m.label.toLowerCase()} thay đổi ${realDelta(scenario, top.m.id, top.c)} sau 4 quý, nhiều nhất trong các chỉ số dùng để chấm điểm.`,
          seed,
        ),
      );
  }

  // 2. Lạm phát cuối nhiệm kỳ lệch khỏi khởi điểm chủ yếu do nguồn nào.
  const drivers = driversBetween(scenario, "cpi", EMPTY_ATTRIBUTION, 0, att, periods);
  if (drivers.length) {
    const label = (d: { kind: string; year: number; label: string }) => (d.kind === "you" ? `Lựa chọn "${d.label}" của bạn (năm ${d.year})` : `Sự kiện "${d.label}" (năm ${d.year})`);
    const main = drivers[0];
    qs.push(
      make(
        "cpi-source",
        "Cuối nhiệm kỳ, lạm phát lệch khỏi mức khởi điểm chủ yếu do đâu?",
        label(main),
        att.sources.map(label),
        `${label(main)} đóng góp ${main.amount} vào lạm phát cuối kỳ, nhiều nhất trong các nguồn.`,
        seed,
      ),
    );
  }

  // 3. Kênh truyền dẫn mạnh nhất từ công cụ của năm 1 tới tăng trưởng.
  if (you1) {
    const node = you1.shocks.find((s) => s.node !== "gdp_growth")?.node;
    const right = node ? findPaths(SIM_LINKS, node, "gdp_growth", 5)[0] : undefined;
    if (right) {
      const fmt = (ns: string[]) => ns.map(nameOf).join(" → ");
      const others = ["fed_rate", "oil_price", "gov_spending", "fx_rate", "reserves", "policy_rate"]
        .filter((x) => x !== node)
        .map((x) => findPaths(SIM_LINKS, x, "gdp_growth", 4)[0])
        .filter((p) => p && fmt(p.nodes) !== fmt(right.nodes))
        .map((p) => fmt(p!.nodes));
      if (others.length >= 2)
        qs.push(
          make(
            "channel",
            `Lựa chọn "${you1.label}" tác động tới tăng trưởng GDP chủ yếu qua kênh nào?`,
            fmt(right.nodes),
            others,
            `Công cụ bạn dùng tác động vào ${nameOf(node!).toLowerCase()}, rồi lan dần: ${fmt(right.nodes)}. ${right.links.at(-1)!.mechanism}`,
            seed,
          ),
        );
    }
  }
  return qs;
}
