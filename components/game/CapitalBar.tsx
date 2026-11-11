import { CAPITAL_MAX } from "@/lib/game";

/** Vốn chính trị: tiêu để ra quyết định khó, kiếm lại bằng cách đoán đúng. */
export default function CapitalBar({ value }: { value: number }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium">Vốn chính trị</span>
        <span className="flex gap-1" role="meter" aria-label="Vốn chính trị" aria-valuemin={0} aria-valuemax={CAPITAL_MAX} aria-valuenow={value}>
          {Array.from({ length: CAPITAL_MAX }, (_, k) => (
            <span key={k} className="w-3 h-3 rounded-full transition-colors duration-500" style={{ background: k < value ? "var(--accent)" : "var(--surface-2)" }} />
          ))}
        </span>
      </div>
      <p className="text-[11px] text-muted mt-1.5">Quyết định khó tốn vốn. Đoán đúng được thêm 1, để mục tiêu trượt xa mất 1.</p>
    </div>
  );
}
