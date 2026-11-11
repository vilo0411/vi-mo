import { SCENARIOS, type Level, type Scenario } from "@/content/scenarios";
import { PROBLEMS, type Problem } from "@/content/problems";
import { LESSONS } from "@/content/lessons";

/** Tiến độ của người chơi, lưu trong trình duyệt. XP không lưu riêng mà luôn tính lại từ đây. */
export type Progress = {
  lessons: Record<string, true>;
  /** Số sao tốt nhất (1–3) của mỗi thử thách */
  stars: Record<string, number>;
  /** Điểm cao nhất của mỗi thử thách */
  best: Record<string, number>;
  /** Các bài tính toán đã giải đúng */
  solved: Record<string, true>;
  /** Bài giải đúng ngay lần đầu, không xem gợi ý */
  cleanSolves: Record<string, true>;
  /** Huy hiệu đã mở: id → ngày mở (YYYY-MM-DD) */
  badges: Record<string, string>;
  /** Những ngày có chơi (YYYY-MM-DD, giờ máy người dùng) */
  days: string[];
  /** Những ngày đã xong bài hằng ngày */
  daily: Record<string, true>;
  /** Số câu quiz đúng tốt nhất (0–3) của mỗi thử thách */
  quiz: Record<string, number>;
  /** Số năm trụ được lâu nhất ở chế độ tự do */
  sandboxBest: number;
  /** Các mục đã mở trong thư viện, ví dụ "map:chinh" */
  seenItems: Record<string, true>;
  /** Các mục người học lưu lại trong thư viện */
  savedItems: Record<string, true>;
  /** Số lần bị cách chức ở mỗi thử thách */
  losses: Record<string, number>;
  /** Kỷ lục luyện đọc số liệu, theo trò và phiên bản câu hỏi. */
  macroPractice: Record<string, { best: number; latest: number }>;
};

export const EMPTY_PROGRESS: Progress = { lessons: {}, stars: {}, best: {}, solved: {}, cleanSolves: {}, badges: {}, days: [], daily: {}, quiz: {}, sandboxBest: 0, seenItems: {}, savedItems: {}, losses: {}, macroPractice: {} };

/** Kết quả một lượt chơi thử thách, dùng cho các huy hiệu cần biết người chơi đã làm gì. */
export type RunInfo = {
  scenarioId: string;
  stars: number;
  points: number;
  usedCustom: boolean;
  soldReserves: boolean;
  /** Có hỏi cố vấn ở ít nhất một năm */
  usedAdvisor?: boolean;
  /** Có phát ngôn (không trung lập) và mọi lần phát ngôn đều khớp với hành động */
  talkConsistent?: boolean;
  /** Ở kịch bản có phần đoán: đoán đúng mọi năm của nhiệm kỳ */
  allGuessed?: boolean;
};

// ---------- XP và cấp bậc ----------

export const LEVEL_MULT: Record<Level, number> = { de: 1, vua: 1.5, kho: 2 };
export const PROBLEM_XP: Record<Level, number> = { de: 30, vua: 50, kho: 80 };
export const BADGE_XP = 50;
export const LESSON_XP = 40;
export const DAILY_XP = 100;
export const QUIZ_XP = 20;
export const SANDBOX_YEAR_XP = 10;
export const SANDBOX_XP_CAP = 20;

export function scenarioXp(s: Scenario, stars: number) {
  return Math.round(stars * 100 * LEVEL_MULT[s.level]);
}

export function problemXp(p: Problem, clean: boolean) {
  return Math.round(PROBLEM_XP[p.level] * (clean ? 1.5 : 1));
}

/** Tổng XP, tính lại hoàn toàn từ tiến độ nên chơi lại cùng một thử thách không cộng thêm. */
export function totalXp(p: Progress) {
  let xp = LESSONS.filter((l) => p.lessons[l.slug]).length * LESSON_XP;
  for (const s of SCENARIOS) xp += scenarioXp(s, p.stars[s.id] ?? 0);
  for (const q of PROBLEMS) if (p.solved[q.id]) xp += problemXp(q, !!p.cleanSolves[q.id]);
  xp += Object.keys(p.badges).length * BADGE_XP;
  xp += Object.keys(p.daily).length * DAILY_XP;
  xp += Object.values(p.quiz).reduce((a, n) => a + Math.min(3, n), 0) * QUIZ_XP;
  xp += Math.min(SANDBOX_XP_CAP, p.sandboxBest) * SANDBOX_YEAR_XP;
  return xp;
}

export const RANKS: { title: string; xp: number }[] = [
  { title: "Thực tập sinh", xp: 0 },
  { title: "Chuyên viên", xp: 150 },
  { title: "Chuyên viên chính", xp: 400 },
  { title: "Phó Vụ trưởng", xp: 800 },
  { title: "Vụ trưởng", xp: 1400 },
  { title: "Phó Thống đốc", xp: 2200 },
  { title: "Thống đốc", xp: 3200 },
];

export function rankOf(xp: number) {
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i].xp) index = i;
  const rank = RANKS[index];
  const next = RANKS[index + 1];
  const pct = next ? (xp - rank.xp) / (next.xp - rank.xp) : 1;
  return { index, rank, next, pct };
}

// ---------- Ngày và chuỗi ngày ----------

const pad = (n: number) => String(n).padStart(2, "0");

/** Ngày theo giờ máy người dùng, dạng YYYY-MM-DD. */
export function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(key: string, n: number) {
  const [y, m, d] = key.split("-").map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}

/** Số ngày chơi liên tiếp tính tới hôm nay. Hôm nay chưa chơi thì chuỗi tính tới hôm qua vẫn còn giữ. */
export function streak(days: string[], today: string) {
  const set = new Set(days);
  let cur = set.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (set.has(cur)) {
    n++;
    cur = addDays(cur, -1);
  }
  return n;
}

/** Chuỗi dài nhất từng đạt. */
export function longestStreak(days: string[]) {
  const set = new Set(days);
  let best = 0;
  for (const d of set) {
    if (set.has(addDays(d, -1))) continue;
    let n = 0;
    let cur = d;
    while (set.has(cur)) {
      n++;
      cur = addDays(cur, 1);
    }
    best = Math.max(best, n);
  }
  return best;
}

/** Bài tính của ngày hôm nay: băm chuỗi ngày (FNV-1a) để mọi người cùng ngày nhận cùng một bài. */
export function dailyPick(key: string): Problem {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return PROBLEMS[h % PROBLEMS.length];
}

// ---------- Chiến dịch ----------

export const CHAPTERS: { level: Level; title: string; need: number }[] = [
  { level: "de", title: "Chặng 1 · Làm quen", need: 0 },
  { level: "vua", title: "Chặng 2 · Khủng hoảng", need: 2 },
  { level: "kho", title: "Chặng 3 · Bão ngoại", need: 6 },
];

export const MAX_STARS = SCENARIOS.length * 3;

export function totalStars(p: Progress) {
  return SCENARIOS.reduce((a, s) => a + (p.stars[s.id] ?? 0), 0);
}

export function chapterOf(level: Level) {
  return CHAPTERS.find((c) => c.level === level)!;
}

/** Số sao còn thiếu để mở chặng; 0 là đã mở. */
export function starsMissing(level: Level, p: Progress) {
  return Math.max(0, chapterOf(level).need - totalStars(p));
}

export function isUnlocked(s: Scenario, p: Progress) {
  return starsMissing(s.level, p) === 0;
}

/** Bài tính cũng mở theo chặng: bài Vừa cần giải 2 bài Dễ, bài Khó cần giải 4 bài Vừa. */
export const PROBLEM_GATE: Record<Level, { from?: Level; need: number }> = {
  de: { need: 0 },
  vua: { from: "de", need: 2 },
  kho: { from: "vua", need: 4 },
};

export function problemsMissing(level: Level, p: Progress) {
  const g = PROBLEM_GATE[level];
  if (!g.from) return 0;
  const done = PROBLEMS.filter((q) => q.level === g.from && p.solved[q.id]).length;
  return Math.max(0, g.need - done);
}

// ---------- Huy hiệu ----------

export type Badge = { id: string; icon: string; title: string; desc: string; check: (p: Progress, run?: RunInfo) => boolean };

const byLevel = (level: Level) => SCENARIOS.filter((s) => s.level === level);
const all3 = (list: Scenario[], p: Progress) => list.length > 0 && list.every((s) => (p.stars[s.id] ?? 0) >= 3);

export const BADGES: Badge[] = [
  { id: "first-term", icon: "🎖️", title: "Nhiệm kỳ đầu tiên", desc: "Hoàn thành một thử thách bất kỳ.", check: (p) => Object.keys(p.stars).length > 0 },
  { id: "perfect", icon: "⭐", title: "Hoàn hảo", desc: "Đạt 3 sao ở một thử thách.", check: (p) => Object.values(p.stars).some((s) => s >= 3) },
  { id: "vua-all", icon: "🛡️", title: "Vượt khủng hoảng", desc: "3 sao mọi thử thách mức Vừa.", check: (p) => all3(byLevel("vua"), p) },
  { id: "kho-all", icon: "🏛️", title: "Thống đốc thép", desc: "3 sao mọi thử thách mức Khó.", check: (p) => all3(byLevel("kho"), p) },
  { id: "all-3", icon: "👑", title: "Toàn tập", desc: `3 sao cả ${SCENARIOS.length} thử thách.`, check: (p) => all3(SCENARIOS, p) },
  { id: "buffer", icon: "💰", title: "Giữ bộ đệm", desc: "Đạt từ 2 sao mà không bán đồng đô la dự trữ nào.", check: (_, r) => !!r && r.stars >= 2 && !r.soldReserves },
  { id: "hands-on", icon: "🎛️", title: "Tự tay điều hành", desc: "Đạt từ 2 sao khi có dùng phương án tự đặt con số.", check: (_, r) => !!r && r.stars >= 2 && r.usedCustom },
  { id: "high-score", icon: "🚀", title: "Điểm cao", desc: "Đạt từ 85 điểm trong một nhiệm kỳ.", check: (_, r) => !!r && r.points >= 85 },
  { id: "self-made", icon: "🧭", title: "Tự lực", desc: "Đạt 3 sao bằng phán đoán của mình: không hỏi cố vấn, hoặc đoán đúng mọi năm ở kịch bản có phần đoán.", check: (_, r) => !!r && r.stars >= 3 && (r.allGuessed ?? !r.usedAdvisor) },
  { id: "walk-the-talk", icon: "🎙️", title: "Lời nói đi đôi việc làm", desc: "Đạt từ 2 sao, có phát ngôn và mọi lần phát ngôn đều khớp với hành động.", check: (_, r) => !!r && r.stars >= 2 && !!r.talkConsistent },
  { id: "quiz-3", icon: "🎓", title: "Hiểu bài", desc: "Trả lời đúng cả 3 câu quiz sau một nhiệm kỳ.", check: (p) => Object.values(p.quiz).some((n) => n >= 3) },
  { id: "sandbox-10", icon: "🪑", title: "Ghế vững", desc: "Trụ 10 năm ở chế độ tự do.", check: (p) => p.sandboxBest >= 10 },
  { id: "first-solve", icon: "🧮", title: "Bài tính đầu tiên", desc: "Giải đúng một bài tính.", check: (p) => Object.keys(p.solved).length > 0 },
  { id: "quick-math", icon: "⚡", title: "Nhẩm nhanh", desc: "Giải đúng ngay lần đầu, không gợi ý, 5 bài.", check: (p) => Object.keys(p.cleanSolves).length >= 5 },
  { id: "all-solved", icon: "🧠", title: "Máy tính sống", desc: `Giải hết ${PROBLEMS.length} bài tính.`, check: (p) => PROBLEMS.every((q) => p.solved[q.id]) },
  { id: "streak-3", icon: "🔥", title: "Bắt nhịp", desc: "Chơi 3 ngày liên tiếp.", check: (p) => longestStreak(p.days) >= 3 },
  { id: "streak-7", icon: "📅", title: "Một tuần bền bỉ", desc: "Chơi 7 ngày liên tiếp.", check: (p) => longestStreak(p.days) >= 7 },
  { id: "streak-30", icon: "🏆", title: "Kỷ luật thép", desc: "Chơi 30 ngày liên tiếp.", check: (p) => longestStreak(p.days) >= 30 },
  { id: "daily-10", icon: "🗓️", title: "Chăm chỉ", desc: "Hoàn thành 10 bài hằng ngày.", check: (p) => Object.keys(p.daily).length >= 10 },
];

export const BADGE_BY_ID = Object.fromEntries(BADGES.map((b) => [b.id, b]));

/** Huy hiệu mới mở với tiến độ này (và lượt chơi vừa xong, nếu có). */
export function newBadges(p: Progress, run?: RunInfo) {
  return BADGES.filter((b) => !p.badges[b.id] && b.check(p, run));
}

export type Reward = { xp: number; badges: Badge[]; levelUp: string | null; newRecord?: boolean };

/** Ghi huy hiệu mới vào tiến độ và so XP, cấp bậc trước và sau. */
export function settle(prev: Progress, next: Progress, run?: RunInfo): { progress: Progress; reward: Reward } {
  const today = dayKey();
  const fresh = newBadges(next, run);
  const badges = { ...next.badges };
  for (const b of fresh) badges[b.id] = today;
  const progress = { ...next, badges };
  const before = totalXp(prev);
  const after = totalXp(progress);
  const r0 = rankOf(before);
  const r1 = rankOf(after);
  return { progress, reward: { xp: after - before, badges: fresh, levelUp: r1.index > r0.index ? r1.rank.title : null } };
}
