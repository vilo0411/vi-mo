"use client";

import { useEffect, useState } from "react";
import { REWARD_EVENT, type Reward } from "@/lib/progress";

type Toast = { id: number; icon: string; title: string; sub?: string };

let seq = 0;

/** Thông báo góc màn hình khi nhận XP, mở huy hiệu hay lên cấp. Tự ẩn sau vài giây. */
export default function RewardToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const on = (e: Event) => {
      const r = (e as CustomEvent<Reward>).detail;
      const add: Toast[] = [];
      if (r.levelUp) add.push({ id: ++seq, icon: "🎉", title: `Lên cấp: ${r.levelUp}`, sub: "Cấp bậc mới đã được ghi vào hồ sơ." });
      for (const b of r.badges) add.push({ id: ++seq, icon: b.icon, title: `Huy hiệu mới: ${b.title}`, sub: b.desc });
      if (r.xp > 0) add.push({ id: ++seq, icon: "✨", title: `+${r.xp} XP` });
      if (!add.length) return;
      setToasts((t) => [...t, ...add].slice(-5));
      const ids = new Set(add.map((a) => a.id));
      timers.push(setTimeout(() => setToasts((t) => t.filter((x) => !ids.has(x.id))), 4500));
    };
    window.addEventListener(REWARD_EVENT, on);
    return () => {
      window.removeEventListener(REWARD_EVENT, on);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 flex flex-col items-end gap-2 pointer-events-none" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="anim-toast pointer-events-auto w-full sm:w-80 flex gap-3 items-start bg-surface border border-line rounded-xl shadow-lg p-3">
          <span className="text-2xl leading-none" aria-hidden>
            {t.icon}
          </span>
          <div className="min-w-0">
            <div className="font-semibold text-sm">{t.title}</div>
            {t.sub && <div className="text-xs text-muted mt-0.5">{t.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
