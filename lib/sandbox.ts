import { SCENARIOS, type Round, type Scenario } from "@/content/scenarios";
import { CUSTOM, eventLabel, type Guidance, type Step } from "./game";
import type { RoundShock } from "@/content/scenarios";

/** Sự kiện có thể rơi vào một năm ở chế độ tự do: lấy từ vòng mở đầu của các kịch bản, cộng một năm yên ả. */
export type PoolEvent = { id: string; title: string; story: string; event: RoundShock[]; from?: string };

export const EVENT_POOL: PoolEvent[] = [
  ...SCENARIOS.map((s) => {
    const r = s.rounds[s.start];
    return { id: s.id, title: eventLabel(r), story: r.story, event: r.event, from: s.title };
  }),
  { id: "calm", title: "một năm yên ả", story: "Thế giới không có biến động lớn. Đây là lúc để sửa những gì còn dang dở từ các năm trước, hoặc để yên cho nền kinh tế tự hồi phục.", event: [] },
];

/** Số khởi điểm đầy đủ: gộp mọi chỉ số mà các kịch bản có, ưu tiên kịch bản được chọn. */
export function fullBaseline(base: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of SCENARIOS) for (const [k, v] of Object.entries(s.baseline)) if (out[k] === undefined) out[k] = v;
  return { ...out, ...base };
}

/** Bộ sinh số ngẫu nhiên có seed (mulberry32): cùng seed, cùng chuỗi sự kiện. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Vòng thứ k (bắt đầu từ 1): sự kiện rút ngẫu nhiên, cường độ nhân 0,5–1,5. Năm 1 không bao giờ yên ả. */
export function sandboxRound(seed: number, k: number): Round {
  const r = rng(seed * 1000 + k);
  const pool = k === 1 ? EVENT_POOL.filter((e) => e.event.length) : EVENT_POOL;
  const ev = pool[Math.floor(r() * pool.length)];
  const mult = Math.round((0.5 + r()) * 10) / 10;
  return {
    id: `s${k}`,
    title: `Năm ${k}: ${ev.title}`,
    story: ev.event.length ? `${ev.story} (Cường độ năm nay: ${Math.round(mult * 100)}% so với lần trước${ev.from ? `, trong "${ev.from}"` : ""}.)` : ev.story,
    event: ev.event.map((e) => ({ ...e, size: Math.round(e.size * mult * 100) / 100 })),
    question: "Năm nay bạn điều hành thế nào?",
    choices: [],
  };
}

/** Kịch bản tổng hợp cho chế độ tự do, đủ để dùng lại runGame, attribute, explainQuarter, checkFired. */
export function sandboxScenario(seed: number, years: number, baseline: Record<string, number>, fire: boolean): Scenario {
  const rounds: Record<string, Round> = {};
  for (let k = 1; k <= years; k++) rounds[`s${k}`] = sandboxRound(seed, k);
  return {
    id: "tu-do",
    title: "Chế độ tự do",
    period: "Không giới hạn",
    level: "kho",
    role: "Người điều hành chính sách",
    teaser: "Mỗi năm một biến cố ngẫu nhiên. Bạn trụ được bao lâu?",
    goals: "Giữ ghế càng lâu càng tốt.",
    difficulty: 1,
    baseline: fullBaseline(baseline),
    baselineNote: "Số khởi điểm do bạn chọn.",
    targets: [],
    start: "s1",
    rounds,
    reality: "",
    // Tắt cách chức: đặt ngưỡng không bao giờ chạm tới.
    fire: fire ? undefined : { cpi: 1e9, gdp: -1e9, reserves: -1e9 },
  };
}

/** Bước của năm k ở chế độ tự do: luôn là tự đặt con số, rồi sang vòng k+1. */
export function sandboxStep(k: number, custom: RoundShock[], guidance: Guidance, advised: boolean): Step {
  return { roundId: `s${k}`, choiceId: CUSTOM, custom, next: `s${k + 1}`, guidance, advised };
}

export const SANDBOX_MAX_XP_YEARS = 20;
