import type { Choice, Scenario } from "@/content/scenarios";
import { INDICATOR_BY_ID } from "@/content/indicators";
import { describeShock, GUIDANCE, guidanceShocks, type Guidance, type QuarterNote } from "./game";
import { chainSentence, choiceEffects, dirWord, lowerFirst, plainOf, ruleText, type WhyStep } from "./why";

/**
 * Lời kể cho giọng đọc: viết như người dẫn chuyện, nối với câu chuyện và lựa chọn của người chơi,
 * thay vì đọc lại nguyên các ô số liệu.
 */

const OPENERS = [
  "Và đây là phản ứng đầu tiên của nền kinh tế.",
  "Ba tháng trôi qua.",
  "Sáu tháng sau, sang quý hai.",
  "Chín tháng sau, bước vào quý ba.",
  "Cuối năm, quý thứ tư.",
];
const lower = lowerFirst;
const upper = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const unquote = (s: string) => s.replace(/^[A-D]\.\s*/, "");

/** "4,0% → 5,5%" thành "từ 4,0% lên 5,5%". Không có số thật thì giữ chữ như "tăng mạnh". */
function movement(n: QuarterNote, verb = "đi"): string {
  const [a, b] = n.change.split(" → ");
  if (!b) return n.change;
  return `${verb} từ ${a} ${n.v >= n.prev ? "lên" : "xuống"} ${b}`;
}

/** Gọi tên một nguồn theo kiểu kể chuyện: lời phát ngôn, quyết định của bạn, hay sự kiện. */
function yours(label: string) {
  return /^Phát ngôn/.test(label) ? `lời ${lower(label)} của bạn` : `quyết định "${unquote(label)}" của bạn`;
}

/** Vì sao chỉ số đổi, kể theo nguồn lớn nhất. Cùng nguồn với câu trước thì nói gọn "cũng vì…". */
function cause(n: QuarterNote, year: number, prevKey: string | undefined): { text: string; key?: string } {
  const [main, second] = n.drivers;
  if (!main) return { text: "" };
  const when = main.year === year ? "" : ` từ năm ${main.year}`;
  const what = main.kind === "event" ? `chuyện ${lower(main.label)}${when}` : `${yours(main.label)}${when}`;
  let s = main.key === prevKey ? `Cũng là vì ${what}` : main.kind === "event" ? `Nguyên nhân chính vẫn là ${what}` : `Đó là tác động từ ${what}`;
  if (second && second.kind === "you" && Math.sign(second.c) !== Math.sign(main.c)) s += `, còn ${yours(second.label)} đang kéo ngược lại`;
  return { text: `${s}.`, key: main.key };
}

const nameOf = (id: string) => INDICATOR_BY_ID[id]?.name ?? id;

/**
 * Kể một chuỗi nhân quả cho tai nghe: cả chuỗi trong một câu, rồi tối đa `maxRules` quy luật chưa kể.
 * Ưu tiên quy luật của bước đầu (công cụ tác động ra sao) và bước cuối (tới chỉ số đang nói).
 */
export function tellSteps(steps: WhyStep[], said?: Set<string>, maxRules = 1): string {
  const order = steps.length > 1 ? [steps[0], steps.at(-1)!, ...steps.slice(1, -1)] : steps;
  const rules: string[] = [];
  for (const st of order) {
    if (rules.length >= maxRules) break;
    const key = `${st.from}>${st.to}`;
    if (said?.has(key)) continue;
    said?.add(key);
    rules.push(ruleText(st));
  }
  return [chainSentence(steps), rules.length ? `Lý do: ${rules.map(lower).join(" Ngoài ra, ")}` : ""].filter(Boolean).join(" ");
}

/** Những diễn biến được giải thích "vì sao" trong quý này: tối đa 2, chưa giải thích ở quý trước, và đang đi cùng chiều nguồn gây ra nó. */
export function whyPicks(notes: QuarterNote[], q: number, seen: Set<string> = new Set()): QuarterNote[] {
  // Quý đầu đã có lời dẫn về lựa chọn (kèm vì sao), nên chưa kể thêm.
  if (q === 0) return [];
  return topNotes(notes, q)
    .filter((n) => !n.direct && n.why?.length && n.drivers[0] && !seen.has(whyKey(n)) && Math.sign(n.v - n.prev) === Math.sign(n.v))
    .sort((a, b) => Number(b.drivers[0].kind === "you") - Number(a.drivers[0].kind === "you"))
    .slice(0, 2);
}
export const whyKey = (n: QuarterNote) => `${n.id}|${n.drivers[0]?.key}`;

/** Các chuỗi "vì sao" đã kể ở những quý trước trong cùng năm, để quý sau không kể lại. */
export function whySeen(earlier: QuarterNote[][]): Set<string> {
  const seen = new Set<string>();
  earlier.forEach((notes, q) => whyPicks(notes, q, seen).forEach((n) => seen.add(whyKey(n))));
  return seen;
}

function topNotes(notes: QuarterNote[], q: number) {
  const rank = (n: QuarterNote) => (n.direct ? 0 : n.good !== null ? 1 : 2);
  return [...notes].sort((a, b) => rank(a) - rank(b)).slice(0, q === 0 ? 4 : 3);
}

const GOOD = ["Tin tốt: ", "Thêm nữa, ", "Cũng đáng mừng, "];
const BAD = ["Tin không vui: ", "Tệ hơn, ", "Thêm một nỗi lo: "];

/**
 * Lời dẫn khi người chơi vừa chọn: họ đã làm gì, công cụ đó là gì (lần đầu dùng),
 * theo quy luật nó sẽ tác động tới đâu và vì sao, kèm lời phát ngôn.
 * `known`: các công cụ đã giải thích ở năm trước, để khỏi định nghĩa lại.
 */
export function narrateChoice(scenario: Scenario, year: number, letter: string, choice: Choice, guidance?: Guidance, known: Set<string> = new Set()): string {
  const out: string[] = [];
  if (choice.id === "custom") {
    out.push(`Năm ${year}. Bạn không theo phương án dựng sẵn mà tự đặt con số.`);
    out.push(...choice.shocks.map((s) => `${describeShock(scenario, s)}.`));
  } else {
    out.push(`Năm ${year}. Bạn chọn phương án ${letter}: ${lower(choice.label)}.`);
    if (choice.detail) out.push(choice.detail.endsWith(".") ? choice.detail : `${choice.detail}.`);
  }
  for (const sh of choice.shocks) {
    if (known.has(sh.node) || !plainOf(sh.node)) continue;
    known.add(sh.node);
    out.push(`${nameOf(sh.node)} là gì? ${plainOf(sh.node)}`);
  }
  const effects = choiceEffects(choice.shocks);
  if (effects.length) {
    out.push(`Theo quy luật kinh tế, nếu chỉ tính riêng quyết định này thì ${effects.map((e) => `${lower(nameOf(e.target))} sẽ ${dirWord(e.target, e.up).split(",")[0]} sau khoảng ${e.after} quý`).join(", ")}.`);
    const said = new Set<string>();
    const gain = effects.find((e) => e.good);
    const cost = effects.find((e) => !e.good);
    if (gain) out.push(`Vì sao ${lower(nameOf(gain.target))} lại ${dirWord(gain.target, gain.up).split(",")[0]}? ${tellSteps(gain.steps, said, 2)}`);
    if (cost) out.push(`Nhưng có cái giá phải trả. ${tellSteps(cost.steps, said, 1)}`);
  }
  if (guidance && guidance !== "neutral") {
    const { consistent } = guidanceShocks(guidance, choice.shocks);
    out.push(
      consistent
        ? `Trước báo giới, bạn chọn giọng ${GUIDANCE[guidance].label.toLowerCase()}, và lời nói khớp với việc làm: thị trường tin bạn, nên tiền đồng và giá cả được giữ ổn định hơn ngay từ đầu.`
        : `Trước báo giới, bạn nói giọng ${GUIDANCE[guidance].label.toLowerCase()}, nhưng việc làm lại đi hướng khác. Thị trường thấy lời nói và việc làm không khớp nên mất niềm tin: người ta lo tiền đồng mất giá, đổ đi mua đô la, và giá cả nhích lên.`,
    );
  }
  out.push("Giờ hãy xem nền kinh tế thực sự phản ứng ra sao.");
  return out.join(" ");
}

/** Giải thích sự kiện cho người mới: chỉ số bị sốc là gì, và nếu không làm gì thì nó kéo nền kinh tế đi đâu, vì sao. */
export function narrateEvent(shocks: { node: string; size: number }[]): string {
  const out: string[] = [];
  for (const id of [...new Set(shocks.map((s) => s.node))]) if (plainOf(id)) out.push(`${nameOf(id)} là gì? ${plainOf(id)}`);
  const effects = choiceEffects(shocks);
  if (effects.length) {
    out.push(`Nếu bạn không làm gì, cú sốc này sẽ khiến ${effects.map((e) => `${lower(nameOf(e.target))} ${dirWord(e.target, e.up).split(",")[0]} sau khoảng ${e.after} quý`).join(", ")}.`);
    const worst = effects.find((e) => !e.good) ?? effects[0];
    out.push(`Vì sao? ${tellSteps(worst.steps, new Set(), 1)}`);
  }
  return out.join(" ");
}

/** Lời kể một quý: mở đầu theo thời gian, rồi vài diễn biến quan trọng nhất, rồi lời mời đi tiếp. */
export function narrateQuarter(
  notes: QuarterNote[],
  q: number,
  opts: { intro?: string; last: boolean; outro?: string; year?: number; /** Các chuỗi "vì sao" đã kể ở quý trước */ seen?: Set<string> },
): string {
  const out: string[] = [];
  const year = opts.year ?? 0;
  if (opts.intro) out.push(opts.intro);
  const top = topNotes(notes, q);
  const explain = new Set(whyPicks(notes, q, opts.seen));
  const said = new Set<string>();
  out.push(top.length ? (OPENERS[q] ?? `Quý ${q}.`) : `${(OPENERS[q] ?? `Quý ${q}.`).replace(/\.$/, ",")} nền kinh tế khá yên ắng: các chỉ số gần như giữ nguyên.`);
  let goods = 0;
  let bads = 0;
  let others = 0;
  let prevKey: string | undefined;
  for (const n of top) {
    if (n.direct === "you") out.push(`${n.name} ${movement(n, n.v >= n.prev ? "được nâng" : "được hạ")} ngay lập tức, đúng như bạn quyết định. Các chỉ số khác sẽ phản ứng dần.`);
    else if (n.direct === "event") out.push(`Cùng lúc, ${lower(n.name)} ${movement(n, "vọt")}. Đó là cú sốc trong câu chuyện, nằm ngoài tầm tay bạn.`.replace("vọt từ", n.v >= n.prev ? "vọt từ" : "rơi từ"));
    else if (n.direct === "ended") out.push(`${n.name} ${movement(n, "quay")}: cú sốc trước đó đã hết tác dụng.`);
    else {
      const lead = n.good === true ? GOOD[goods++ % GOOD.length] : n.good === false ? BAD[bads++ % BAD.length] : others++ ? "Ngoài ra, " : "Cùng lúc, ";
      const c = cause(n, year, prevKey);
      prevKey = c.key ?? prevKey;
      out.push(`${lead}${lower(n.name)} ${movement(n)}.${c.text ? ` ${c.text}` : ""}`);
      if (explain.has(n) && n.why) out.push(`Vì sao? ${tellSteps(n.why, said)}`);
    }
  }
  if (opts.outro) out.push(opts.outro);
  else out.push(opts.last ? "Một năm đã khép lại. Bấm xem tổng kết để biết cả năm được và mất những gì." : `Bấm sang quý ${q + 1} để nghe tiếp.`);
  return out.map((x) => upper(x)).join(" ");
}

/** Lời kể tổng kết năm: được bao nhiêu, mất bao nhiêu, và vì sao. */
export function narrateYear(year: number, goods: number, bads: number, trust0: number, trust1: number, feedback: string, next: string): string {
  const mood = goods > bads ? "Nhìn chung, năm nay bạn đi đúng hướng nhiều hơn." : goods < bads ? "Năm nay cái giá khá đắt." : "Năm nay được mất ngang nhau.";
  const trust = trust1 > trust0 ? `Tín nhiệm của bạn tăng từ ${trust0} lên ${trust1}.` : trust1 < trust0 ? `Tín nhiệm của bạn giảm từ ${trust0} xuống ${trust1}.` : `Tín nhiệm giữ ở mức ${trust1}.`;
  return `Tổng kết năm ${year}. ${mood} ${goods} chỉ số tốt lên, ${bads} chỉ số xấu đi. ${trust} Vì sao vậy? ${feedback} ${next}`;
}
