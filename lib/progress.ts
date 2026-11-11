"use client";

import { useCallback, useEffect, useState } from "react";
import { dayKey, EMPTY_PROGRESS, settle, type Progress, type Reward, type RunInfo } from "./rewards";

export type { Progress, Reward } from "./rewards";

// Tiến độ học chỉ lưu trong trình duyệt của người học: mất khi xóa dữ liệu trang, không đồng bộ giữa các máy.
const KEY = "vi-mo:progress:v1";
export const REWARD_EVENT = "vi-mo:reward";

function read(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY_PROGRESS;
    const p = JSON.parse(raw) as Partial<Progress>;
    return {
      lessons: p.lessons ?? {},
      stars: p.stars ?? {},
      best: p.best ?? {},
      solved: p.solved ?? {},
      cleanSolves: p.cleanSolves ?? {},
      badges: p.badges ?? {},
      days: Array.isArray(p.days) ? p.days : [],
      daily: p.daily ?? {},
      quiz: p.quiz ?? {},
      sandboxBest: typeof p.sandboxBest === "number" ? p.sandboxBest : 0,
      seenItems: p.seenItems ?? {},
      savedItems: p.savedItems ?? {},
      losses: p.losses ?? {},
      macroPractice: p.macroPractice ?? {},
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

function write(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
  window.dispatchEvent(new Event("vi-mo:progress"));
}

/** Đánh dấu hôm nay có chơi, mở huy hiệu mới, lưu lại và báo phần thưởng cho lớp thông báo. */
function commit(prev: Progress, next: Progress, run?: RunInfo, extra?: Partial<Reward>): Reward {
  const today = dayKey();
  const days = next.days.includes(today) ? next.days : [...next.days, today].slice(-400);
  const { progress, reward } = settle(prev, { ...next, days }, run);
  write(progress);
  const out = { ...reward, ...extra };
  if (out.xp > 0 || out.badges.length || out.levelUp) window.dispatchEvent(new CustomEvent<Reward>(REWARD_EVENT, { detail: out }));
  return out;
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const sync = () => {
      setProgress(read());
      setLoaded(true);
    };
    sync();
    window.addEventListener("vi-mo:progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vi-mo:progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const completeLesson = useCallback((slug: string) => {
    const p = read();
    if (!p.lessons[slug]) commit(p, { ...p, lessons: { ...p.lessons, [slug]: true } });
  }, []);

  /** Đánh dấu đã mở một mục trong thư viện. Không tính XP. */
  const markSeen = useCallback((key: string) => {
    const p = read();
    if (!p.seenItems[key]) write({ ...p, seenItems: { ...p.seenItems, [key]: true } });
  }, []);

  /** Lưu hoặc bỏ lưu một mục trong thư viện. */
  const toggleSaved = useCallback((key: string) => {
    const p = read();
    const { [key]: was, ...rest } = p.savedItems;
    write({ ...p, savedItems: was ? rest : { ...rest, [key]: true } });
  }, []);

  /** Ghi kết quả một nhiệm kỳ: sao và điểm tốt nhất, rồi trả về phần thưởng của lượt này. */
  const recordRun = useCallback((run: RunInfo): Reward => {
    const p = read();
    const prevBest = p.best[run.scenarioId];
    const next: Progress = {
      ...p,
      stars: { ...p.stars, [run.scenarioId]: Math.max(p.stars[run.scenarioId] ?? 0, run.stars) },
      best: { ...p.best, [run.scenarioId]: Math.max(prevBest ?? 0, run.points) },
    };
    return commit(p, next, run, { newRecord: prevBest !== undefined && run.points > prevBest });
  }, []);

  /** Ghi một lần bị cách chức. Không có XP, nhưng vẫn tính là ngày có chơi. */
  const recordLoss = useCallback((scenarioId: string) => {
    const p = read();
    commit(p, { ...p, losses: { ...p.losses, [scenarioId]: (p.losses[scenarioId] ?? 0) + 1 } });
  }, []);

  /** Ghi một bài tính đã giải. clean: đúng ngay lần đầu, không gợi ý. daily: đây là bài của hôm nay. */
  const solveProblem = useCallback((id: string, opts: { clean?: boolean; daily?: boolean } = {}): Reward => {
    const p = read();
    const first = !p.solved[id];
    const next: Progress = {
      ...p,
      solved: { ...p.solved, [id]: true },
      cleanSolves: first && opts.clean ? { ...p.cleanSolves, [id]: true } : p.cleanSolves,
      daily: opts.daily ? { ...p.daily, [dayKey()]: true } : p.daily,
    };
    return commit(p, next);
  }, []);

  /** Ghi số câu quiz đúng, chỉ giữ lần tốt nhất. */
  const recordQuiz = useCallback((scenarioId: string, correct: number): Reward => {
    const p = read();
    return commit(p, { ...p, quiz: { ...p.quiz, [scenarioId]: Math.max(p.quiz[scenarioId] ?? 0, correct) } });
  }, []);

  /** Ghi số năm trụ được ở chế độ tự do, chỉ giữ kỷ lục. */
  const recordSandbox = useCallback((years: number): Reward => {
    const p = read();
    return commit(p, { ...p, sandboxBest: Math.max(p.sandboxBest, years) }, undefined, { newRecord: years > p.sandboxBest && p.sandboxBest > 0 });
  }, []);

  const recordMacroPractice = useCallback((key: string, points: number) => {
    const p = read();
    const best = Math.max(p.macroPractice[key]?.best ?? 0, points);
    write({ ...p, macroPractice: { ...p.macroPractice, [key]: { best, latest: points } } });
  }, []);

  return { progress, loaded, completeLesson, markSeen, toggleSaved, recordRun, recordLoss, solveProblem, recordQuiz, recordSandbox, recordMacroPractice };
}
