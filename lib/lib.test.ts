import { describe, expect, it } from "vitest";
import type { Link } from "@/content/links";
import { LINKS, SIM_LINKS } from "@/content/links";
import { INDICATORS } from "@/content/indicators";
import { SERIES } from "./data";
import { findPaths } from "./paths";
import { allPlaythroughs, attribute, checkFired, checkTargets, CUSTOM, eventLabel, explainQuarter, guidanceShocks, GUIDANCE, describeShock, finalResult, leversToShocks, nearestChoice, runGame, shocksFor, storyFor, toReal } from "./game";
import { PROBLEMS } from "@/content/problems";
import { parseNumber } from "@/components/ProblemSet";
import { SCENARIOS } from "@/content/scenarios";
import { LESSONS } from "@/content/lessons";
import { exploreOrder, revealedFor } from "./explore";
import { TERMS } from "@/content/glossary";
import { firstMapWith, MAPS, MAP_BY_ID } from "@/content/maps";
import { FEATURED_KEYS, LIBRARY_CATEGORIES, LIBRARY_ITEMS } from "@/content/library";
import { FEYNMAN } from "@/content/feynman";
import { INDICATOR_PROFILES } from "@/content/indicatorProfiles";
import { refsIn } from "@/components/RichText";
import { contributionAt, contributions } from "./contributions";
import { INDICATOR_BY_ID, measureOf } from "@/content/indicators";
import { explainStep, level, PRESETS, simulate, simulateShocks } from "./simulate";
import { SIM_STORIES, STORY_BY_PRESET } from "@/content/simStories";
import { changeShort, manualConcept } from "./data";
import { latestState } from "@/components/MacroGraph";
import { alignWithLag, lagCorrelation, pearson } from "./stats";
import { bestContinuation, expertPath, taylorAdvice } from "./advisor";
import { buildQuiz } from "./quiz";
import { sandboxRound, sandboxScenario, sandboxStep } from "./sandbox";
import { addDays, BADGE_BY_ID, BADGES, dailyPick, EMPTY_PROGRESS, isUnlocked, longestStreak, problemsMissing, rankOf, RANKS, settle, streak, totalXp, type Progress } from "./rewards";

const L = (from: string, to: string, sign: 1 | -1, lag: 1 | 2 | 3, strength: number): Link => ({
  from, to, sign, lag, strength, mechanism: "",
});

describe("simulate", () => {
  it("lan truyền theo dấu và độ trễ", () => {
    const links = [L("a", "b", -1, 1, 0.5), L("b", "c", 1, 2, 0.5)];
    const r = simulate(links, ["a", "b", "c"], { node: "a", size: 1 }, 4);
    expect(r.a).toEqual([1, 1, 1, 1, 1]);
    expect(r.b).toEqual([0, -0.5, -0.5, -0.5, -0.5]);
    // c nhận tác động từ b sau 2 kỳ: b bắt đầu khác 0 ở kỳ 1 nên c bắt đầu ở kỳ 3
    expect(r.c).toEqual([0, 0, 0, -0.25, -0.25]);
  });

  it("vòng phản hồi trên mạng thật không phát tán", () => {
    const ids = INDICATORS.filter((i) => !i.concept).map((i) => i.id);
    const r = simulate(SIM_LINKS, ids, { node: "policy_rate", size: 1 }, 40);
    for (const id of ids) for (const v of r[id]) expect(Math.abs(v)).toBeLessThan(5);
  });

  it("NHNN tăng lãi suất thì tín dụng giảm và lạm phát giảm", () => {
    const ids = INDICATORS.filter((i) => !i.concept).map((i) => i.id);
    const r = simulate(SIM_LINKS, ids, { node: "policy_rate", size: 1 }, 8);
    expect(r.credit[8]).toBeLessThan(0);
    expect(r.cpi[8]).toBeLessThan(0);
    expect(r.gdp_growth[8]).toBeLessThan(0);
  });
});

describe("stats", () => {
  it("dịch độ trễ đúng chiều", () => {
    const a = [{ year: 2000, value: 1 }, { year: 2001, value: 2 }];
    const b = [{ year: 2001, value: 10 }, { year: 2002, value: 20 }];
    expect(alignWithLag(a, b, 1)).toEqual([
      { year: 2000, a: 1, b: 10 },
      { year: 2001, a: 2, b: 20 },
    ]);
  });

  it("pearson", () => {
    expect(pearson([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1);
    expect(pearson([1, 2, 3, 4], [8, 6, 4, 2])).toBeCloseTo(-1);
    expect(pearson([1, 2], [1, 2])).toBeUndefined();
  });

  it("chuỗi trễ tìm được độ trễ đúng", () => {
    const a = Array.from({ length: 20 }, (_, i) => ({ year: 2000 + i, value: Math.sin(i) }));
    const b = a.map((p) => ({ year: p.year + 2, value: p.value }));
    expect(lagCorrelation(a, b, 2).r).toBeCloseTo(1);
  });
});

describe("paths", () => {
  it("tìm đường đi và tính dấu tổng hợp", () => {
    const links = [L("a", "b", -1, 1, 0.5), L("b", "c", -1, 1, 0.5), L("a", "c", 1, 1, 0.1)];
    const p = findPaths(links, "a", "c");
    expect(p).toHaveLength(2);
    expect(p[0].nodes).toEqual(["a", "b", "c"]);
    expect(p[0].sign).toBe(1);
    expect(p[0].strength).toBeCloseTo(0.25);
  });

  it("Fed tới lạm phát Việt Nam có ít nhất một đường", () => {
    expect(findPaths(LINKS, "fed_rate", "cpi").length).toBeGreaterThan(0);
  });
});

describe("content", () => {
  it("mọi cạnh trỏ tới chỉ số có thật", () => {
    const ids = new Set(INDICATORS.map((i) => i.id));
    for (const l of LINKS) {
      expect(ids.has(l.from), l.from).toBe(true);
      expect(ids.has(l.to), l.to).toBe(true);
    }
  });

  it("mọi chỉ số có dữ liệu", () => {
    for (const i of INDICATORS.filter((x) => !x.concept)) {
      expect(SERIES[i.seriesId]?.points.length, i.id).toBeGreaterThan(5);
      for (const e of i.extraSeries ?? []) expect(SERIES[e.id], e.id).toBeDefined();
    }
  });
});

describe("simulateShocks", () => {
  it("cú sốc có thời hạn tắt đúng kỳ", () => {
    const r = simulateShocks([], ["a"], [{ node: "a", size: 1, start: 2, duration: 2 }], 5);
    expect(r.a).toEqual([0, 0, 1, 1, 0, 0]);
  });
});

describe("game", () => {
  const ids = new Set(INDICATORS.map((i) => i.id));

  it("mọi kịch bản hợp lệ: vòng tiếp theo tồn tại, cú sốc trỏ tới chỉ số có thật", () => {
    for (const sc of SCENARIOS) {
      expect(sc.rounds[sc.start], sc.id).toBeDefined();
      for (const r of Object.values(sc.rounds)) {
        for (const e of r.event) expect(ids.has(e.node), e.node).toBe(true);
        for (const c of r.choices) {
          if (c.next) expect(sc.rounds[c.next], `${sc.id}/${c.id}`).toBeDefined();
          for (const s of c.shocks) expect(ids.has(s.node), s.node).toBe(true);
        }
      }
    }
  });

  it("lựa chọn ở vòng 2 bắt đầu tác động từ kỳ 4", () => {
    const sc = SCENARIOS.find((s) => s.id === "fed")!;
    const shocks = shocksFor(sc, [{ roundId: "fed-1", choiceId: "rate" }, { roundId: "fed-2a", choiceId: "cut" }]);
    expect(shocks.find((s) => s.node === "policy_rate" && s.size === -1)?.start).toBe(4);
  });

  it("mỗi kịch bản có ít nhất một đường đạt 3 sao và một đường dưới 3 sao", () => {
    for (const sc of SCENARIOS) {
      const stars = allPlaythroughs(sc).map((steps) => {
        const { result, periods } = runGame(sc, steps);
        return finalResult(sc, result, periods).stars;
      });
      expect(Math.max(...stars), sc.id).toBe(3);
      expect(Math.min(...stars), sc.id).toBeLessThan(3);
    }
  });

  it("mọi kịch bản có số khởi điểm cho các chỉ số dùng làm mục tiêu", () => {
    for (const sc of SCENARIOS) {
      for (const t of sc.targets) expect(sc.baseline[t.node], `${sc.id}/${t.node}`).toBeDefined();
      // Khi chưa có cú sốc, các mục tiêu đều đạt: mục tiêu là giữ được trạng thái ban đầu.
      expect(checkTargets(sc, {}).every((t) => t.ok), sc.id).toBe(true);
    }
  });

  it("quy đổi số thật và câu chuyện theo hậu quả", () => {
    expect(toReal("cpi", 3, 0.5)).toBeCloseTo(5);
    expect(toReal("fx_rate", 20000, 1)).toBeCloseTo(20800);
    const round = { id: "r", title: "", story: "gốc", event: [], question: "", choices: [], storyIf: [{ node: "cpi", above: 0.2, text: "nóng" }] };
    expect(storyFor(round, { cpi: [0.3] }, 0)).toEqual(["gốc", "nóng"]);
    expect(storyFor(round, { cpi: [0.1] }, 0)).toEqual(["gốc"]);
  });
});

describe("màn tính toán", () => {
  it("đáp án là số hữu hạn, id không trùng", () => {
    expect(new Set(PROBLEMS.map((p) => p.id)).size).toBe(PROBLEMS.length);
    for (const p of PROBLEMS) expect(Number.isFinite(p.answer), p.id).toBe(true);
  });

  it("đọc được số kiểu Việt Nam và quốc tế", () => {
    expect(parseNumber("6,36", "")).toBe(6.36);
    expect(parseNumber("6.36", "")).toBe(6.36);
    expect(parseNumber("106.513", "đồng")).toBe(106513);
    expect(parseNumber("1.234,5", "")).toBe(1234.5);
    expect(parseNumber("−7,3", "%")).toBe(-7.3);
    expect(parseNumber("", "")).toBeNull();
    expect(parseNumber("abc", "")).toBeNull();
  });

  it("đáp án mẫu khớp số liệu đã biết", () => {
    expect(PROBLEMS.find((p) => p.id === "lai-suat-thuc-2008")!.answer).toBeCloseTo(15.78 - 23.12, 1);
    expect(PROBLEMS.find((p) => p.id === "taylor")!.answer).toBe(8.5);
  });
});

describe("học tập", () => {
  const ids = new Set(INDICATORS.map((i) => i.id));
  it("bài học và tham quan trỏ tới chỉ số có thật, đáp án hợp lệ", () => {
    for (const l of LESSONS) {
      for (const id of l.indicators) expect(ids.has(id), id).toBe(true);
      for (const q of l.quiz) expect(q.answer).toBeLessThan(q.options.length);
    }
  });

  it("khám phá từ GDP đi qua hết bản đồ, các nhánh trực tiếp đứng trước", () => {
    const order = exploreOrder("gdp_growth");
    expect(new Set(order).size).toBe(INDICATORS.length);
    const direct = new Set(LINKS.filter((l) => l.to === "gdp_growth" || l.from === "gdp_growth").map((l) => (l.to === "gdp_growth" ? l.from : l.to)));
    expect(new Set(order.slice(1, 1 + direct.size))).toEqual(direct);
    expect(revealedFor(["gdp_growth"]).sort()).toEqual(["gdp_growth", ...direct].sort());
  });
});

describe("thuật ngữ", () => {
  it("id không trùng, liên kết và dữ liệu tồn tại", () => {
    const ids = new Set(INDICATORS.map((i) => i.id));
    expect(new Set(TERMS.map((t) => t.id)).size).toBe(TERMS.length);
    for (const t of TERMS) {
      for (const r of t.related ?? []) expect(ids.has(r), `${t.id}: ${r}`).toBe(true);
      if (t.seriesId) expect(SERIES[t.seriesId]?.points.length, t.id).toBeGreaterThan(5);
    }
  });
});

describe("đóng góp vào tăng trưởng", () => {
  it("tổng đóng góp năm 2025 khớp tăng trưởng thật trong khoảng 0,5 điểm %", () => {
    const c = contributionAt(2025)!;
    expect(c.C + c.I + c.G + c.NX).toBeCloseTo(c.sum, 1);
    expect(Math.abs(c.sum - c.actual)).toBeLessThan(0.5);
    expect(c.C).toBeCloseTo((53.56 * 7.31) / 100, 1);
  });

  it("cột chồng cộng cả phần chênh lệch đúng bằng tăng trưởng thật", () => {
    for (const c of contributions()) expect(c.sum + c.gap).toBeCloseTo(c.actual, 1);
  });

  it("phân biệt tỷ trọng và tốc độ tăng", () => {
    expect(measureOf(INDICATOR_BY_ID.consumption, "% GDP").kind).toBe("ty-trong");
    expect(measureOf(INDICATOR_BY_ID.gdp_growth, "%/năm").kind).toBe("toc-do");
  });
});

describe("thẻ khái niệm", () => {
  it("có thuật ngữ tương ứng và không lọt vào mô phỏng", () => {
    const termIds = new Set(TERMS.map((t) => t.id));
    for (const i of INDICATORS) if (i.termId) expect(termIds.has(i.termId), i.id).toBe(true);
    const concepts = new Set(INDICATORS.filter((i) => i.concept).map((i) => i.id));
    for (const l of SIM_LINKS) {
      expect(concepts.has(l.from), l.from).toBe(false);
      expect(concepts.has(l.to), l.to).toBe(false);
    }
  });
});

describe("tự đặt con số trong thử thách", () => {
  const fed = SCENARIOS.find((s) => s.id === "fed")!;

  it("đổi con số ra cú sốc và mô tả lại bằng số thật", () => {
    const shocks = leversToShocks({ rate: 1.5, spend: 0, sell: 0 });
    expect(shocks).toEqual([{ node: "policy_rate", size: 1 }]);
    expect(describeShock(fed, shocks[0])).toBe("Lãi suất điều hành 4,0% → 5,5%");
    expect(leversToShocks({ rate: 0, spend: 0, sell: 0 })).toEqual([]);
  });

  it("chọn nhánh câu chuyện theo phương án gần nhất", () => {
    const round = fed.rounds["fed-1"];
    expect(nearestChoice(round, leversToShocks({ rate: 1.5, spend: 0, sell: 0 })).id).toBe("rate");
    expect(nearestChoice(round, leversToShocks({ rate: 0, spend: 0, sell: 7.5 })).id).toBe("sell");
  });

  it("cú sốc tự đặt được đưa vào mô phỏng ở đúng năm", () => {
    const custom = leversToShocks({ rate: 3, spend: 0, sell: 0 });
    const shocks = shocksFor(fed, [{ roundId: "fed-1", choiceId: CUSTOM, custom, next: "fed-2a" }, { roundId: "fed-2a", choiceId: "hold" }]);
    expect(shocks.find((s) => s.node === "policy_rate")).toMatchObject({ size: 2, start: 0 });
    const { result, periods } = runGame(fed, [{ roundId: "fed-1", choiceId: CUSTOM, custom, next: "fed-2a" }]);
    expect(result.policy_rate[periods]).toBeGreaterThan(1.5);
  });
});

describe("bản đồ con và bài học", () => {
  it("mọi bản đồ con trỏ tới chỉ số có thật, bản đồ chính không có thẻ thiếu số liệu", () => {
    const ids = new Set(INDICATORS.map((i) => i.id));
    for (const m of MAPS) if (m.ids !== "all") for (const id of m.ids) expect(ids.has(id), `${m.id}/${id}`).toBe(true);
    const main = MAPS[0].ids as string[];
    for (const id of main) expect(INDICATOR_BY_ID[id].concept, id).toBeFalsy();
  });

  it("mọi thẻ trong bản đồ con đều nối với ít nhất một thẻ khác", () => {
    for (const m of MAPS) {
      if (m.ids === "all") continue;
      const ids = new Set(m.ids);
      for (const id of m.ids) expect(LINKS.some((l) => (l.from === id && ids.has(l.to)) || (l.to === id && ids.has(l.from))), `${m.id}/${id}`).toBe(true);
    }
  });

  it("thư viện không trùng mục, mỗi chủ đề có ít nhất hai mục và mọi mục trỏ tới bản đồ có thật", () => {
    expect(new Set(LIBRARY_ITEMS.map((it) => it.key)).size).toBe(LIBRARY_ITEMS.length);
    for (const c of Object.keys(LIBRARY_CATEGORIES)) expect(LIBRARY_ITEMS.filter((it) => it.category === c).length, c).toBeGreaterThanOrEqual(2);
    for (const it of LIBRARY_ITEMS) {
      expect(LIBRARY_CATEGORIES[it.category], it.key).toBeDefined();
      if (it.type === "map") expect(MAP_BY_ID[it.href.replace("/ban-do/", "")], it.key).toBeDefined();
    }
    for (const k of FEATURED_KEYS) expect(LIBRARY_ITEMS.some((it) => it.key === k), k).toBe(true);
  });

  it("hồ sơ chỉ số trỏ tới chỉ số và thuật ngữ có thật", () => {
    const known = new Set([...INDICATORS.map((i) => i.id), ...TERMS.map((t) => t.id)]);
    for (const [id, p] of Object.entries(INDICATOR_PROFILES)) {
      expect(INDICATOR_BY_ID[id], id).toBeDefined();
      const texts = [...p.nuances, p.whyMatters, p.whenMisleading, p.worked.note, ...p.breakdowns.map((b) => b.reveals)];
      for (const ref of texts.flatMap(refsIn)) expect(known.has(ref), `${id}/${ref}`).toBe(true);
      expect(p.breakdowns.length, id).toBeGreaterThanOrEqual(4);
      expect(p.breakdowns.length, id).toBeLessThanOrEqual(6);
      expect(p.questions.explore.length, id).toBeGreaterThanOrEqual(2);
      expect(p.questions.decide.length, id).toBeGreaterThanOrEqual(1);
    }
  });

  it("phần cốt lõi của mỗi bản đồ nằm trong bản đồ, nối liền nhau và chứa thẻ trọng tâm", () => {
    for (const m of MAPS) {
      if (m.ids === "all") {
        expect(INDICATOR_BY_ID[m.keyId], m.id).toBeDefined();
        continue;
      }
      const core = m.core ?? m.ids;
      expect(core.includes(m.keyId), m.id).toBe(true);
      const set = new Set(core);
      for (const id of core) {
        expect(m.ids.includes(id), `${m.id}/${id}`).toBe(true);
        expect(LINKS.some((l) => (l.from === id && set.has(l.to)) || (l.to === id && set.has(l.from))), `${m.id}/${id}`).toBe(true);
      }
    }
  });

  it("mọi chỉ số đều mở được trên một bản đồ con", () => {
    for (const i of INDICATORS) expect(firstMapWith(i.id), i.id).not.toBe("toan-bo");
  });

  it("mỗi bài học có giải thích Feynman và ít nhất một thành phần tương tác", () => {
    for (const l of LESSONS) {
      expect(FEYNMAN[l.slug], l.slug).toBeDefined();
      expect(FEYNMAN[l.slug].widgets.length, l.slug).toBeGreaterThan(0);
    }
  });

  it("thẻ thuế và FPI có số liệu thật", () => {
    for (const id of ["tax", "fpi"]) {
      expect(INDICATOR_BY_ID[id].concept, id).toBeFalsy();
      expect(SERIES[INDICATOR_BY_ID[id].seriesId]?.points.length, id).toBeGreaterThan(10);
    }
  });
});

describe("mô phỏng kể chuyện", () => {
  const ids = INDICATORS.filter((i) => !i.concept).map((i) => i.id);
  const r = simulate(SIM_LINKS, ids, { node: "policy_rate", size: 1 }, 12);

  it("kỳ 1: lãi suất cho vay tăng vì lãi suất điều hành tăng", () => {
    const e = explainStep(r, SIM_LINKS, 1, "policy_rate").find((x) => x.id === "lending_rate");
    expect(e).toBeDefined();
    expect(e!.v).toBeGreaterThan(0);
    expect(e!.trend).toBe("new");
    expect(e!.driver?.link.from).toBe("policy_rate");
  });

  it("kỳ 0 chưa có gì lan ra ngoài cú sốc", () => {
    expect(explainStep(r, SIM_LINKS, 0, "policy_rate")).toEqual([]);
  });

  it("mỗi thay đổi đều chỉ ra được mũi tên gây ra nó", () => {
    for (let t = 1; t <= 12; t++) for (const e of explainStep(r, SIM_LINKS, t, "policy_rate")) expect(e.driver, `${e.id} kỳ ${t}`).toBeDefined();
  });

  it("level đổi số tương đối thành chữ", () => {
    expect(level(0).text).toBe("Không đổi");
    expect(level(0.1).text).toBe("↑ nhẹ");
    expect(level(-0.3).text).toBe("↓ vừa");
    expect(level(0.9).text).toBe("↑↑ mạnh");
  });
});

describe("thẻ bản đồ", () => {
  it("không thẻ nào trống: khái niệm có số tay hoặc câu ngắn", () => {
    for (const i of INDICATORS) {
      const st = latestState(i);
      expect(st.value ?? st.line, i.id).toBeTruthy();
      if (i.concept && !manualConcept(i.id)) expect(i.cardLine, i.id).toBeTruthy();
    }
  });

  it("số tay nào cũng có nguồn", () => {
    for (const id of ["credit_quota", "public_investment", "remittances"]) expect(manualConcept(id)?.source, id).toMatch(/^https:/);
  });

  it("dòng thay đổi viết ngắn có mũi tên", () => {
    expect(changeShort(SERIES.cpi, 2025)?.text).toMatch(/^[↑↓→] \d+,\d điểm$/);
    expect(changeShort(SERIES.fx_rate, 2024)?.text).toMatch(/^[↑↓→] \d+,\d%$/);
  });

  it("số cũ hơn năm mới nhất thì có nhãn năm", () => {
    expect(latestState(INDICATOR_BY_ID.credit).yearTag).toBe("2022");
    expect(latestState(INDICATOR_BY_ID.gdp_growth).yearTag).toBeUndefined();
  });
});

describe("câu chuyện mô phỏng", () => {
  const ids = INDICATORS.filter((i) => !i.concept).map((i) => i.id);
  const keys = new Set(SIM_LINKS.map((l) => `${l.from}->${l.to}`));

  it("mỗi cú sốc đều có câu chuyện", () => {
    for (const p of PRESETS) expect(STORY_BY_PRESET[p.id], p.id).toBeDefined();
  });

  for (const story of SIM_STORIES) {
    it(`${story.preset}: lời kể khớp chiều của mô hình`, () => {
      const p = PRESETS.find((x) => x.id === story.preset)!;
      const r = simulate(SIM_LINKS, ids, { node: p.node, size: p.size }, 12);
      for (const [k, s] of story.steps.entries()) {
        const where = `${story.preset} bước ${k + 1}`;
        for (const [from, to] of s.links) expect(keys.has(`${from}->${to}`), `${where}: ${from}->${to}`).toBe(true);
        expect(s.lines.length, where).toBeLessThanOrEqual(4);
        for (const [id, dir] of Object.entries(s.expect)) {
          const v = r[id][s.periods[1]];
          expect(Math.abs(v), `${where}: ${id} phải đã đổi`).toBeGreaterThanOrEqual(0.01);
          expect(v > 0 ? "up" : "down", `${where}: ${id}`).toBe(dir);
        }
      }
    });
  }
});

describe("gamification", () => {
  const P = (x: Partial<Progress>): Progress => ({ ...EMPTY_PROGRESS, ...x });
  const oil = SCENARIOS.find((s) => s.id === "oil")!;
  const fed = SCENARIOS.find((s) => s.id === "fed")!;
  const covid = SCENARIOS.find((s) => s.id === "covid")!;

  it("XP tính lại từ tiến độ, chơi lại cùng số sao không cộng thêm", () => {
    expect(totalXp(EMPTY_PROGRESS)).toBe(0);
    const a = P({ stars: { oil: 2 } });
    expect(totalXp(a)).toBe(200);
    expect(totalXp(P({ stars: { oil: 3 } }))).toBe(300);
    expect(totalXp(P({ stars: { fed: 3 } }))).toBe(600);
    const first = settle(EMPTY_PROGRESS, a).progress;
    expect(settle(first, first).reward.xp).toBe(0);
    const p = PROBLEMS[0];
    const base = totalXp(P({ solved: { [p.id]: true } }));
    expect(totalXp(P({ solved: { [p.id]: true }, cleanSolves: { [p.id]: true } }))).toBe(Math.round(base * 1.5));
  });

  it("cấp bậc theo ngưỡng XP", () => {
    expect(rankOf(0).rank.title).toBe(RANKS[0].title);
    expect(rankOf(RANKS[1].xp - 1).index).toBe(0);
    expect(rankOf(RANKS[1].xp).index).toBe(1);
    expect(rankOf(99999).next).toBeUndefined();
    expect(rankOf(99999).pct).toBe(1);
    const r = rankOf((RANKS[1].xp + RANKS[2].xp) / 2);
    expect(r.pct).toBeCloseTo(0.5);
  });

  it("chuỗi ngày: đứt, giữ tới hôm qua, qua tháng", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(streak([], "2026-10-31")).toBe(0);
    expect(streak(["2026-10-29", "2026-10-30", "2026-10-31"], "2026-10-31")).toBe(3);
    expect(streak(["2026-10-29", "2026-10-30"], "2026-10-31")).toBe(2);
    expect(streak(["2026-10-28", "2026-10-30"], "2026-11-01")).toBe(0);
    expect(streak(["2026-09-30", "2026-10-01"], "2026-10-01")).toBe(2);
    expect(longestStreak(["2026-01-01", "2026-01-02", "2026-01-03", "2026-02-10"])).toBe(3);
  });

  it("bài hằng ngày ổn định theo ngày và đổi qua các ngày", () => {
    expect(dailyPick("2026-10-31").id).toBe(dailyPick("2026-10-31").id);
    const ids = new Set(Array.from({ length: 30 }, (_, k) => dailyPick(addDays("2026-10-01", k)).id));
    expect(ids.size).toBeGreaterThan(5);
  });

  it("mở khóa chặng theo tổng sao, bài tính theo số bài đã giải", () => {
    expect(isUnlocked(oil, EMPTY_PROGRESS)).toBe(true);
    expect(isUnlocked(covid, EMPTY_PROGRESS)).toBe(false);
    expect(isUnlocked(covid, P({ stars: { oil: 2 } }))).toBe(true);
    expect(isUnlocked(fed, P({ stars: { oil: 3, covid: 2 } }))).toBe(false);
    expect(isUnlocked(fed, P({ stars: { oil: 3, covid: 3 } }))).toBe(true);
    expect(problemsMissing("de", EMPTY_PROGRESS)).toBe(0);
    expect(problemsMissing("vua", EMPTY_PROGRESS)).toBe(2);
    const de = PROBLEMS.filter((q) => q.level === "de").slice(0, 2);
    expect(problemsMissing("vua", P({ solved: Object.fromEntries(de.map((q) => [q.id, true as const])) }))).toBe(0);
  });

  it("điều kiện huy hiệu", () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
    const run = { scenarioId: "oil", stars: 2, points: 60, usedCustom: false, soldReserves: false };
    expect(BADGE_BY_ID["buffer"].check(EMPTY_PROGRESS, run)).toBe(true);
    expect(BADGE_BY_ID["buffer"].check(EMPTY_PROGRESS, { ...run, soldReserves: true })).toBe(false);
    expect(BADGE_BY_ID["hands-on"].check(EMPTY_PROGRESS, { ...run, usedCustom: true })).toBe(true);
    expect(BADGE_BY_ID["high-score"].check(EMPTY_PROGRESS, { ...run, points: 85 })).toBe(true);
    expect(BADGE_BY_ID["all-3"].check(P({ stars: Object.fromEntries(SCENARIOS.map((s) => [s.id, 3])) }))).toBe(true);
    expect(BADGE_BY_ID["streak-3"].check(P({ days: ["2026-10-29", "2026-10-30", "2026-10-31"] }))).toBe(true);
    expect(BADGE_BY_ID["streak-3"].check(P({ days: ["2026-10-29", "2026-10-31"] }))).toBe(false);
  });

  it("settle ghi huy hiệu mới, cộng XP huy hiệu và báo lên cấp", () => {
    const next = P({ stars: { oil: 3 } });
    const { progress, reward } = settle(EMPTY_PROGRESS, next, { scenarioId: "oil", stars: 3, points: 80, usedCustom: false, soldReserves: false });
    const ids = reward.badges.map((b) => b.id).sort();
    expect(ids).toEqual(["buffer", "first-term", "perfect", "self-made"]);
    expect(Object.keys(progress.badges).sort()).toEqual(ids);
    expect(reward.xp).toBe(300 + 4 * 50);
    expect(reward.levelUp).toBe(rankOf(500).rank.title);
    // Lần sau không mở lại huy hiệu đã có.
    expect(settle(progress, progress).reward.badges).toEqual([]);
  });
});

describe("giải thích từng quý", () => {
  const oil = SCENARIOS.find((s) => s.id === "oil")!;
  const r1 = oil.rounds[oil.start];
  const r2 = oil.rounds[r1.choices[0].next!];
  const steps = [
    { roundId: r1.id, choiceId: r1.choices[0].id },
    { roundId: r2.id, choiceId: r2.choices[0].id },
  ];
  const { result, periods } = runGame(oil, steps);
  const att = attribute(oil, steps);

  it("cộng phần của từng nguồn lại đúng bằng kết quả chung", () => {
    for (const id of ["cpi", "gdp_growth", "fx_rate", "policy_rate"])
      for (let t = 0; t <= periods; t++) {
        const sum = att.sources.reduce((a, src) => a + att.parts[src.key][id][t], 0);
        expect(sum).toBeCloseTo(result[id][t], 9);
      }
  });

  it("nguồn mang tên sự kiện trong câu chuyện và phương án đã chọn", () => {
    expect(att.sources.map((x) => x.key)).toEqual(["y1-event", "y1-you", ...(r2.event.length ? ["y2-event"] : []), "y2-you"]);
    expect(att.sources[0].label).toBe(eventLabel(r1));
    expect(att.sources[1].label).toBe(`A. ${r1.choices[0].label}`);
  });

  it("đầu năm kể quyết định và sự kiện trước, đúng năm", () => {
    const n0 = explainQuarter(oil, att, result, 0);
    expect(n0[0].direct).toBe("you");
    expect(n0.some((n) => n.direct === "event")).toBe(true);
    const n4 = explainQuarter(oil, att, result, 4).find((n) => n.id === "policy_rate")!;
    expect(n4.direct).toBe("you");
    expect(n4.verdict).toContain(r2.choices[0].label);
  });

  it("các quý sau nói rõ do sự kiện nào hay lựa chọn nào, kèm đường lan truyền", () => {
    const cpi = explainQuarter(oil, att, result, 1).find((n) => n.id === "cpi")!;
    expect(cpi.drivers[0].kind).toBe("event");
    expect(cpi.verdict).toContain(eventLabel(r1));
    const gdp = explainQuarter(oil, att, result, 4).find((n) => n.id === "gdp_growth")!;
    expect(gdp.verdict).toContain(r1.choices[0].label);
    expect(gdp.path?.at(-1)).toBe("Tăng trưởng GDP");
  });
});

describe("học từ đối thủ", () => {
  const oil = SCENARIOS.find((s) => s.id === "oil")!;

  it("cố vấn Taylor: lạm phát cao thì khuyên tăng lãi suất, thấp thì hạ", () => {
    const hot = { cpi: Array(5).fill(0.5), gdp_growth: Array(5).fill(0) } as Record<string, number[]>;
    const cold = { cpi: Array(5).fill(-0.3), gdp_growth: Array(5).fill(-0.6) } as Record<string, number[]>;
    expect(taylorAdvice(oil, hot, 0).delta).toBeGreaterThan(0);
    expect(taylorAdvice(oil, cold, 0).delta).toBeLessThan(0);
    expect(Math.abs(taylorAdvice(oil, hot, 0).delta)).toBeLessThanOrEqual(3);
  });

  it("cố vấn tính trước khớp đường chuyên gia ở vòng đầu", () => {
    for (const sc of SCENARIOS) {
      const ex = expertPath(sc);
      const adv = bestContinuation(sc, [], sc.start);
      expect(adv.points, sc.id).toBe(ex.points);
      expect(adv.byChoice[ex.steps[0].choiceId], sc.id).toBe(ex.points);
    }
  });

  it("đường tốt nhất không bị cách chức, kịch bản Vừa/Khó có đường bị cách chức", () => {
    for (const sc of SCENARIOS) {
      const ex = expertPath(sc);
      expect(checkFired(sc, ex.result, ex.periods), sc.id).toBeNull();
      if (sc.level === "de") continue;
      const anyFired = allPlaythroughs(sc).some((st) => {
        const { result, periods } = runGame(sc, st);
        return checkFired(sc, result, periods) !== null;
      });
      expect(anyFired, sc.id).toBe(true);
    }
  });

  it("phát ngôn: nhất quán thì có lợi, thiếu nhất quán thì luôn bị phạt dù nói cứng hay mềm", () => {
    const hike = [{ node: "policy_rate", size: 1 }];
    const cut = [{ node: "policy_rate", size: -1 }];
    expect(guidanceShocks("hawk", hike)).toEqual({ shocks: GUIDANCE.hawk.shocks, consistent: true });
    for (const bad of [guidanceShocks("hawk", cut), guidanceShocks("dove", hike)]) {
      expect(bad.consistent).toBe(false);
      const by = Object.fromEntries(bad.shocks.map((x) => [x.node, x.size]));
      expect(by.fx_rate).toBeGreaterThan(0); // tiền đồng yếu đi
      expect(by.cpi).toBeGreaterThan(0);
      expect(by.gdp_growth).toBeLessThan(0);
    }
    expect(guidanceShocks("neutral", cut).shocks).toEqual([]);
  });

  it("phát ngôn là một nguồn riêng, cộng các nguồn vẫn đúng bằng kết quả chung", () => {
    const r1 = oil.rounds[oil.start];
    const steps = [{ roundId: r1.id, choiceId: r1.choices[0].id, guidance: "hawk" as const }];
    const att = attribute(oil, steps);
    expect(att.sources.some((x) => x.key === "y1-talk" && x.talk)).toBe(true);
    const { result, periods } = runGame(oil, steps);
    for (let t = 0; t <= periods; t++) {
      const sum = att.sources.reduce((a, x) => a + att.parts[x.key].fx_rate[t], 0);
      expect(sum).toBeCloseTo(result.fx_rate[t], 9);
    }
    // Phát ngôn không bị kể như cú sốc đánh thẳng vào lạm phát.
    expect(explainQuarter(oil, att, result, 0).find((n) => n.id === "cpi")?.direct).toBeUndefined();
  });

  it("quiz: đáp án nằm trong các lựa chọn, câu nguồn lạm phát khớp nguồn lớn nhất", () => {
    for (const sc of SCENARIOS) {
      const steps = allPlaythroughs(sc)[0];
      const qs = buildQuiz(sc, steps);
      expect(qs.length, sc.id).toBeGreaterThanOrEqual(2);
      for (const q of qs) {
        expect(q.answer, `${sc.id} ${q.id}`).toBeGreaterThanOrEqual(0);
        expect(new Set(q.options).size).toBe(q.options.length);
      }
    }
  });

  it("chế độ tự do: cùng seed cùng sự kiện, kịch bản tổng hợp chạy được", () => {
    expect(sandboxRound(42, 3)).toEqual(sandboxRound(42, 3));
    expect(sandboxRound(42, 1).event.length).toBeGreaterThan(0);
    const sc = sandboxScenario(42, 3, oil.baseline, true);
    const steps = [sandboxStep(1, [{ node: "policy_rate", size: 0.5 }], "hawk", false), sandboxStep(2, [{ node: "gov_spending", size: 1 }], "neutral", true)];
    const { result, periods } = runGame(sc, steps);
    expect(periods).toBe(12);
    expect(Number.isFinite(result.cpi[periods])).toBe(true);
    expect(explainQuarter(sc, attribute(sc, steps), result, 4).length).toBeGreaterThan(0);
    const off = sandboxScenario(42, 3, { ...oil.baseline }, false);
    expect(checkFired(off, { cpi: Array(13).fill(99), gdp_growth: Array(13).fill(-99), reserves: Array(13).fill(-99) }, 12)).toBeNull();
  });
});

describe("phát ngôn trên thẻ phương án và giọng đọc", () => {
  it("talkPreview đổi theo giọng và đảo dấu khi thiếu nhất quán", async () => {
    const { talkPreview } = await import("./game");
    const hike = [{ node: "policy_rate", size: 1 }];
    expect(talkPreview("neutral", hike)).toBeNull();
    const hawk = talkPreview("hawk", hike)!;
    const dove = talkPreview("dove", hike)!;
    expect(hawk.consistent).toBe(true);
    expect(dove.consistent).toBe(false);
    expect(hawk.text).not.toBe(dove.text);
    expect(hawk.text).toMatch(/Tỷ giá VND\/USD −/);
    expect(dove.text).toMatch(/Tỷ giá VND\/USD \+/);
  });
  it("toSpeech đọc ký hiệu bằng lời", async () => {
    const { toSpeech } = await import("./speech");
    expect(toSpeech("🎙️ Lạm phát 4,5% → +2,6 điểm %")).toBe("Lạm phát 4 phẩy 5 phần trăm, sang cộng 2 phẩy 6 điểm phần trăm");
  });
});

describe("người dẫn chuyện", () => {
  const oil = SCENARIOS.find((s) => s.id === "oil")!;
  it("kể lựa chọn, từng quý và lời mời đi tiếp", async () => {
    const { narrateChoice, narrateQuarter } = await import("./narration");
    const { attribute, explainQuarter, runGame } = await import("./game");
    const r1 = oil.rounds[oil.start];
    const c = r1.choices[0];
    const steps = [{ roundId: r1.id, choiceId: c.id, guidance: "dove" as const }];
    const { result } = runGame(oil, steps);
    const att = attribute(oil, steps);
    const intro = narrateChoice(oil, 1, "A", c, "dove");
    expect(intro).toMatch(/phương án A/);
    expect(intro).toMatch(/mất niềm tin/);
    expect(intro).toMatch(/Lãi suất điều hành là gì\?/);
    expect(intro).toMatch(/Vì sao lạm phát CPI lại giảm\?/);
    // Công cụ đã giải thích ở năm trước thì không định nghĩa lại
    expect(narrateChoice(oil, 2, "A", c, "dove", new Set(["policy_rate"]))).not.toMatch(/là gì\?/);
    const q0 = narrateQuarter(explainQuarter(oil, att, result, 0), 0, { intro, last: false, year: 1 });
    expect(q0.startsWith(intro)).toBe(true);
    expect(q0).toMatch(/Bấm sang quý 1/);
    const q4 = narrateQuarter(explainQuarter(oil, att, result, 4), 4, { last: true, year: 1 });
    expect(q4).toMatch(/khép lại/);
    expect(q4).not.toMatch(/undefined|NaN|  /);
  });
});

describe("giải thích cho người mới", () => {
  it("phương án tăng lãi suất: lạm phát giảm (có lợi), tăng trưởng giảm (cái giá), kèm từng bước", async () => {
    const { choiceEffects, chainSentence, lowerFirst } = await import("./why");
    const fx = choiceEffects([{ node: "policy_rate", size: 1 }]);
    const cpi = fx.find((e) => e.target === "cpi")!;
    const gdp = fx.find((e) => e.target === "gdp_growth")!;
    expect(cpi.up).toBe(false);
    expect(cpi.good).toBe(true);
    expect(gdp.up).toBe(false);
    expect(gdp.good).toBe(false);
    expect(cpi.steps[0].from).toBe("policy_rate");
    expect(cpi.steps.at(-1)!.to).toBe("cpi");
    expect(chainSentence(cpi.steps)).toMatch(/^Lãi suất điều hành tăng, kéo theo .*cuối cùng lạm phát CPI giảm\.$/);
    // Hạ lãi suất: mọi bước đảo chiều và được ghi rõ
    const cut = choiceEffects([{ node: "policy_rate", size: -1 }]).find((e) => e.target === "cpi")!;
    expect(cut.up).toBe(true);
    expect(cut.steps[0].reverse).toBe(true);
    expect(lowerFirst("NHNN tăng")).toBe("NHNN tăng");
    expect(lowerFirst("Lạm phát")).toBe("lạm phát");
  });

  it("mỗi chuỗi vì sao chỉ kể một lần trong năm", async () => {
    const { whyPicks, whySeen, whyKey } = await import("./narration");
    const { attribute, explainQuarter, runGame } = await import("./game");
    const oil = SCENARIOS.find((s) => s.id === "oil")!;
    const r1 = oil.rounds[oil.start];
    const steps = [{ roundId: r1.id, choiceId: r1.choices[0].id }];
    const { result } = runGame(oil, steps);
    const att = attribute(oil, steps);
    const all = [0, 1, 2, 3, 4].map((t) => explainQuarter(oil, att, result, t));
    const keys: string[] = [];
    all.forEach((ns, q) => keys.push(...whyPicks(ns, q, whySeen(all.slice(0, q))).map(whyKey)));
    expect(keys.length).toBeGreaterThan(0);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
