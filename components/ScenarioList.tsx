"use client";

import Link from "next/link";
import { LEVEL_LABEL, SCENARIOS, type Level, type Scenario } from "@/content/scenarios";
import { useProgress } from "@/lib/progress";
import { CHAPTERS, scenarioXp, starsMissing, totalStars } from "@/lib/rewards";

export const SANDBOX_NEED = 3;

const LEVEL_COLOR: Record<Level, string> = { de: "var(--up)", vua: "var(--chart-2)", kho: "var(--down)" };

export function Stars({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span className={`tracking-widest ${className}`} aria-label={`Đạt ${n} trên 3 sao`}>
      <span style={{ color: "var(--chart-2)" }}>{"★".repeat(n)}</span>
      <span style={{ color: "var(--border)" }}>{"★".repeat(3 - n)}</span>
    </span>
  );
}

/** Bản đồ chiến dịch: ba chặng nối nhau, chặng sau mở khi đủ sao. */
export default function ScenarioList() {
  const { progress, loaded } = useProgress();
  return (
    <ol className="relative space-y-8">
      {CHAPTERS.map((ch, k) => {
        const list = SCENARIOS.filter((s) => s.level === ch.level);
        // Chờ đọc xong tiến độ mới khóa, tránh nháy khóa với người đã mở.
        const missing = loaded ? starsMissing(ch.level, progress) : 0;
        const got = list.reduce((a, s) => a + (progress.stars[s.id] ?? 0), 0);
        const last = k === CHAPTERS.length - 1;
        return (
          <li key={ch.level} className="relative pl-10">
            {!last && <span aria-hidden className="absolute left-[15px] top-9 -bottom-8 w-0.5" style={{ background: missing ? "var(--border)" : LEVEL_COLOR[ch.level] }} />}
            <span
              aria-hidden
              className="absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
              style={{ background: missing ? "var(--border)" : LEVEL_COLOR[ch.level] }}
            >
              {missing ? "🔒" : k + 1}
            </span>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3 min-h-8">
              <h3 className="font-semibold">{ch.title}</h3>
              <span className="text-xs font-semibold" style={{ color: LEVEL_COLOR[ch.level] }}>
                {LEVEL_LABEL[ch.level]}
              </span>
              <span className="text-xs text-muted tabular-nums">
                {got}/{list.length * 3} ★
              </span>
              {missing > 0 && <span className="text-xs text-muted">Cần thêm {missing} sao để mở chặng này</span>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((s) => (
                <ScenarioCard key={s.id} s={s} stars={progress.stars[s.id] ?? 0} best={progress.best[s.id]} locked={missing > 0} />
              ))}
            </div>
          </li>
        );
      })}
      <SandboxCard missing={loaded ? Math.max(0, SANDBOX_NEED - totalStars(progress)) : 0} best={progress.sandboxBest} />
    </ol>
  );
}

/** Lối vào chế độ tự do, cuối bản đồ chiến dịch. */
function SandboxCard({ missing, best }: { missing: number; best: number }) {
  const body = (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-3xl" aria-hidden>
        ♾️
      </span>
      <div className="flex-1 min-w-48">
        <div className="font-semibold">Chế độ tự do</div>
        <p className="text-sm text-muted">Biến cố ngẫu nhiên mỗi năm, tự đặt mọi con số, không có đáp án. Bạn trụ được bao lâu?</p>
      </div>
      <span className="text-sm text-accent">{missing ? `🔒 Cần thêm ${missing} sao` : best ? `Kỷ lục ${best} năm · Chơi →` : "Chơi →"}</span>
    </div>
  );
  return (
    <li className="relative pl-10">
      <span aria-hidden className="absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center text-sm text-white" style={{ background: missing ? "var(--border)" : "var(--chart-3)" }}>
        {missing ? "🔒" : "∞"}
      </span>
      {missing ? (
        <div className="bg-surface border border-dashed border-line rounded-xl p-5 opacity-55">{body}</div>
      ) : (
        <Link href="/thu-thach/tu-do" className="block bg-surface border border-line rounded-xl p-5 hover:border-accent transition-colors">
          {body}
        </Link>
      )}
    </li>
  );
}

function ScenarioCard({ s, stars, best, locked }: { s: Scenario; stars: number; best?: number; locked: boolean }) {
  const body = (
    <>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted">{s.period}</span>
        <span className="text-muted tabular-nums">tối đa {scenarioXp(s, 3)} XP</span>
      </div>
      <div className="text-lg font-semibold mt-1">{s.title}</div>
      <div className="text-xs text-muted mt-0.5">Vai: {s.role}</div>
      <p className="text-sm text-muted mt-2 leading-relaxed flex-1">{s.teaser}</p>
      <div className="flex items-center justify-between mt-4">
        <span className="flex items-baseline gap-2">
          <Stars n={stars} className="text-lg" />
          {best !== undefined && <span className="text-xs text-muted tabular-nums">Kỷ lục {best}</span>}
        </span>
        <span className="text-sm text-accent">{locked ? "🔒 Chưa mở" : stars ? "Chơi lại →" : "Bắt đầu →"}</span>
      </div>
    </>
  );
  if (locked)
    return (
      <div className="flex flex-col bg-surface border border-dashed border-line rounded-xl p-5 opacity-55 select-none" aria-disabled>
        {body}
      </div>
    );
  return (
    <Link href={`/thu-thach/${s.id}`} className="flex flex-col bg-surface border border-line rounded-xl p-5 hover:border-accent hover:-translate-y-0.5 transition-all">
      {body}
    </Link>
  );
}
