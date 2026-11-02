

/** Thanh Tín nhiệm: điểm tạm tính theo từng quý, có mốc 2 sao (45) và 3 sao (70). */
export default function TrustBar({ value }: { value: number }) {
  const color = value >= 70 ? "var(--up)" : value >= 45 ? "var(--chart-2)" : "var(--down)";
  return (
    <div className="bg-surface border border-line rounded-xl p-3">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-medium">Tín nhiệm của thị trường</span>
        <span className="tabular-nums font-semibold" style={{ color }}>
          {value}/100
        </span>
      </div>
      <div className="relative h-2.5 bg-surface-2 rounded-full" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label="Tín nhiệm">
        <div className="h-full rounded-full transition-[width,background-color] duration-700" style={{ width: `${value}%`, background: color }} />
        {[45, 70].map((m) => (
          <span key={m} className="absolute -top-0.5 h-3.5 w-px" style={{ left: `${m}%`, background: "var(--muted)" }} aria-hidden />
        ))}
      </div>
      <div className="relative h-4 text-[10px] text-muted" aria-hidden>
        <span className="absolute -translate-x-1/2" style={{ left: "45%" }}>
          ★★
        </span>
        <span className="absolute -translate-x-1/2" style={{ left: "70%" }}>
          ★★★
        </span>
      </div>
    </div>
  );
}
