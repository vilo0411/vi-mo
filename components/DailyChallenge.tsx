"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress";
import { DAILY_XP, dailyPick, dayKey } from "@/lib/rewards";
import { ProblemCard } from "./ProblemSet";

function untilMidnight() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const m = Math.ceil((end.getTime() - now.getTime()) / 60000);
  return `${Math.floor(m / 60)} giờ ${m % 60} phút`;
}

/** Bài hằng ngày: mỗi ngày một bài tính, giải được thì giữ chuỗi ngày và nhận thêm XP. */
export default function DailyChallenge() {
  const { progress, loaded } = useProgress();
  // Ngày chỉ biết được ở trình duyệt; đợi đọc xong tiến độ để không lệch với lúc render trên server.
  const [today, setToday] = useState<string | null>(null);
  const [left, setLeft] = useState("");
  // Vừa giải xong thì vẫn giữ thẻ bài để người chơi đọc lời giải và thấy XP vừa nhận.
  const [justDone, setJustDone] = useState(false);
  useEffect(() => {
    const tick = () => {
      setToday(dayKey());
      setLeft(untilMidnight());
    };
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 30000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  if (!today || !loaded) return <div className="h-40 rounded-xl bg-surface border border-line" aria-hidden />;
  const problem = dailyPick(today);
  const done = !!progress.daily[today];

  return (
    <div className="rounded-xl border-2 p-4 space-y-3" style={{ borderColor: "var(--chart-2)" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            📆
          </span>
          <div>
            <div className="font-semibold">Thử thách hôm nay</div>
            <div className="text-xs text-muted">Giải đúng để giữ chuỗi ngày và nhận thêm {DAILY_XP} XP</div>
          </div>
        </div>
        <span className="text-xs text-muted tabular-nums">Bài mới sau {left}</span>
      </div>
      {done && !justDone ? (
        <div className="rounded-lg bg-surface-2 p-4 text-sm">
          <div className="font-medium" style={{ color: "var(--up)" }}>
            ✓ Đã xong bài hôm nay: {problem.title}
          </div>
          <p className="text-muted mt-1">Quay lại sau {left} để nhận bài mới. Trong lúc chờ, thử một thử thách điều hành bên dưới.</p>
        </div>
      ) : (
        <ProblemCard key={today} problem={problem} done={!!progress.solved[problem.id]} daily onResult={(ok) => ok && setJustDone(true)} />
      )}
    </div>
  );
}
