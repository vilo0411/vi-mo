"use client";

import { useEffect, useState } from "react";
import { useProgress, type Reward } from "@/lib/progress";
import { rankOf, totalXp } from "@/lib/rewards";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Số đếm dần từ 0 lên trong khoảng 1 giây. */
export function CountUp({ to, className }: { to: number; className?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const dur = prefersReducedMotion() ? 0 : 1000;
    const step = (t: number) => {
      const k = dur ? Math.min(1, (t - t0) / dur) : 1;
      setN(Math.round(to * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span className={className}>{n}</span>;
}

/** Ba ngôi sao bật lên lần lượt sau khi điểm đếm xong. */
export function PopStars({ n }: { n: number }) {
  return (
    <span className="text-3xl tracking-widest" aria-label={`${n} sao`}>
      {[0, 1, 2].map((k) => (
        <span key={k} className="anim-pop inline-block" style={{ color: k < n ? "var(--chart-2)" : "var(--border)", animationDelay: `${1 + k * 0.3}s` }}>
          ★
        </span>
      ))}
    </span>
  );
}

const CONFETTI_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--g-ben-ngoai)", "var(--down)"];

/** Pháo giấy khi đạt 3 sao. Tắt khi người dùng chọn giảm chuyển động. */
export function Confetti() {
  const pieces = Array.from({ length: 70 }, (_, i) => {
    const r = (k: number) => ((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1;
    return {
      left: `${r(1) * 100}%`,
      delay: `${1.6 + r(2) * 0.8}s`,
      dx: `${(r(3) - 0.5) * 240}px`,
      rot: `${(r(4) - 0.5) * 1440}deg`,
      w: 6 + r(5) * 6,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    };
  });
  return (
    <div className="confetti fixed inset-0 pointer-events-none overflow-hidden z-40" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece absolute top-0 opacity-0"
          style={{ left: p.left, width: p.w, height: p.w * 0.45, background: p.color, animationDelay: p.delay, ["--dx" as string]: p.dx, ["--rot" as string]: p.rot }}
        />
      ))}
    </div>
  );
}

/** XP, huy hiệu và cấp bậc nhận được sau nhiệm kỳ. */
export function RewardPanel({ reward }: { reward: Reward }) {
  const { progress } = useProgress();
  const { rank, next, pct } = rankOf(totalXp(progress));
  return (
    <div className="anim-pop rounded-lg border border-accent bg-accent-soft p-4 space-y-2 text-sm" style={{ animationDelay: "1.9s" }}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-accent text-base">{reward.xp > 0 ? `+${reward.xp} XP` : "Không có XP mới"}</span>
        {reward.newRecord && <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ background: "var(--chart-2)" }}>Kỷ lục mới!</span>}
        {reward.levelUp && <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ background: "var(--up)" }}>Lên cấp: {reward.levelUp}</span>}
      </div>
      {reward.xp === 0 && <p className="text-xs text-muted">Bạn đã nhận XP cho số sao này rồi. Đạt nhiều sao hơn để nhận thêm.</p>}
      {reward.badges.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {reward.badges.map((b) => (
            <li key={b.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-line" title={b.desc}>
              <span aria-hidden>{b.icon}</span>
              <span className="font-medium">{b.title}</span>
            </li>
          ))}
        </ul>
      )}
      <div>
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>{rank.title}</span>
          <span>{next ? next.title : "Cấp cao nhất"}</span>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-[width] duration-700" style={{ width: `${pct * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
