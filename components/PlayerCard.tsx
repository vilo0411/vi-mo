"use client";

import { useRef } from "react";
import { useProgress } from "@/lib/progress";
import { PROBLEMS } from "@/content/problems";
import { addDays, BADGES, dayKey, MAX_STARS, rankOf, streak, totalStars, totalXp } from "@/lib/rewards";
import BadgeCabinet from "./BadgeCabinet";

const WEEKDAY = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/** Hồ sơ người chơi: cấp bậc, thanh XP, sao, chuỗi ngày và tủ huy hiệu. */
export default function PlayerCard() {
  const { progress, loaded } = useProgress();
  const dialog = useRef<HTMLDialogElement>(null);
  const xp = totalXp(progress);
  const { rank, next, pct, index } = rankOf(xp);
  const today = loaded ? dayKey() : "";
  const st = loaded ? streak(progress.days, today) : 0;
  const played = new Set(progress.days);
  const week = loaded ? Array.from({ length: 7 }, (_, k) => addDays(today, k - 6)) : [];
  const badgeCount = Object.keys(progress.badges).length;
  const solved = PROBLEMS.filter((p) => progress.solved[p.id]).length;

  return (
    <div className="bg-surface border border-line rounded-xl p-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] items-center">
      <div className="space-y-2 min-w-0">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 shrink-0 rounded-full bg-accent-soft text-accent flex items-center justify-center text-lg font-semibold tabular-nums" aria-hidden>
            {index + 1}
          </span>
          <div className="min-w-0">
            <div className="text-xs text-muted">Cấp {index + 1} · Cấp bậc của bạn</div>
            <div className="text-lg font-semibold truncate">{rank.title}</div>
          </div>
        </div>
        <div className="h-2.5 bg-surface-2 rounded-full overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct * 100)} aria-label="Tiến tới cấp sau">
          <div className="h-full bg-accent rounded-full transition-[width] duration-700" style={{ width: `${pct * 100}%` }} />
        </div>
        <div className="text-xs text-muted tabular-nums">
          {xp.toLocaleString("vi-VN")} XP{next ? ` · còn ${(next.xp - xp).toLocaleString("vi-VN")} XP để lên ${next.title}` : " · cấp cao nhất"}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3">
        <Stat label="Sao" value={`${totalStars(progress)}/${MAX_STARS}`} icon="★" color="var(--chart-2)" />
        <Stat label="Bài tính" value={`${solved}/${PROBLEMS.length}`} icon="🧮" />
        <div className="bg-surface-2 rounded-lg px-3 py-2">
          <div className="text-xs text-muted">Chuỗi ngày</div>
          <div className="font-semibold tabular-nums">🔥 {st}</div>
          <div className="flex gap-1 mt-1" aria-label="7 ngày gần nhất">
            {week.map((d) => (
              <span
                key={d}
                title={`${WEEKDAY[new Date(d + "T12:00:00").getDay()]} ${d.slice(8)}/${d.slice(5, 7)}${played.has(d) ? " · có chơi" : ""}`}
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: played.has(d) ? "var(--chart-2)" : "var(--border)", outline: d === today ? "1.5px solid var(--text)" : undefined, outlineOffset: 1 }}
              />
            ))}
          </div>
        </div>
        <button type="button" onClick={() => dialog.current?.showModal()} className="bg-surface-2 rounded-lg px-3 py-2 text-left hover:ring-1 hover:ring-accent">
          <div className="text-xs text-muted">Huy hiệu</div>
          <div className="font-semibold tabular-nums">
            🏅 {badgeCount}/{BADGES.length}
          </div>
          <div className="text-xs text-accent mt-1">Mở tủ →</div>
        </button>
      </div>

      <dialog
        ref={dialog}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto w-[min(720px,calc(100vw-32px))] max-h-[85vh] rounded-xl border border-line bg-surface text-text p-0 backdrop:bg-black/50"
      >
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              Tủ huy hiệu · {badgeCount}/{BADGES.length}
            </h2>
            <button type="button" onClick={() => dialog.current?.close()} className="px-3 py-1 rounded-lg border border-line text-sm">
              Đóng
            </button>
          </div>
          <BadgeCabinet earned={progress.badges} />
        </div>
      </dialog>
    </div>
  );
}

function Stat({ label, value, icon, color }: { label: string; value: string; icon: string; color?: string }) {
  return (
    <div className="bg-surface-2 rounded-lg px-3 py-2">
      <div className="text-xs text-muted">{label}</div>
      <div className="font-semibold tabular-nums">
        <span style={color ? { color } : undefined}>{icon}</span> {value}
      </div>
    </div>
  );
}
