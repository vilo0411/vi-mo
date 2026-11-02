import { ROUND_PERIODS } from "@/lib/game";

export const QUARTER_LABEL = (q: number) => (q === 0 ? "Lúc quyết định có hiệu lực" : `Quý ${q}`);

/** Nút điều khiển: người chơi tự bấm sang từng quý, không chạy tự động. */
export default function PlaybackBar({ q, last, onBack, onStep, onSkip }: { q: number; last: boolean; onBack: () => void; onStep: () => void; onSkip: () => void }) {
  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center gap-1.5" aria-label={`Đang xem ${QUARTER_LABEL(q)}`}>
        {Array.from({ length: ROUND_PERIODS + 1 }, (_, k) => (
          <span key={k} className={`h-1.5 flex-1 rounded-full transition-colors ${k <= q ? "bg-accent" : "bg-surface"}`} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button type="button" onClick={onStep} className="px-4 py-2 rounded-lg bg-accent text-white font-medium">
          {last ? "Xem tổng kết năm →" : q === 0 ? "Xem quý 1 →" : `Sang quý ${q + 1} →`}
        </button>
        {q > 0 && (
          <button type="button" onClick={onBack} className="px-3 py-2 rounded-lg border border-line bg-surface">
            ← Quý trước
          </button>
        )}
        {!last && (
          <button type="button" onClick={onSkip} className="ml-auto text-xs text-muted hover:text-text underline underline-offset-2">
            Bỏ qua, xem tổng kết
          </button>
        )}
      </div>
    </div>
  );
}
