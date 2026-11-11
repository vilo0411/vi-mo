import type { Direction } from "@/lib/game";

export const DIRECTIONS: { id: Direction; label: string }[] = [
  { id: "down", label: "Giảm" },
  { id: "flat", label: "Gần như đứng yên" },
  { id: "up", label: "Tăng" },
];

/** Dừng lại đoán sau khi đã chọn, trước khi xem chuyện gì xảy ra. */
export default function PredictPanel({ label, q, onGuess, onBack }: { label: string; q: string; onGuess: (d: Direction) => void; onBack: () => void }) {
  return (
    <div className="anim-pop rounded-xl border border-accent bg-accent-soft p-5 space-y-3">
      <div className="text-xs font-medium text-accent">Bạn chọn: {label}</div>
      <p className="font-medium leading-relaxed">{q}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {DIRECTIONS.map((d) => (
          <button key={d.id} type="button" onClick={() => onGuess(d.id)} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm hover:border-accent">
            {d.label}
          </button>
        ))}
      </div>
      <div className="flex justify-between gap-3 text-xs text-muted">
        <span>Đoán đúng được thêm 1 vốn chính trị.</span>
        <button type="button" onClick={onBack} className="hover:text-text">
          ← Chọn lại
        </button>
      </div>
    </div>
  );
}
