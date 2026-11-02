import { BADGES } from "@/lib/rewards";

/** Lưới huy hiệu: cái đã mở có ngày mở, cái chưa mở hiện mờ kèm điều kiện. */
export default function BadgeCabinet({ earned }: { earned: Record<string, string> }) {
  return (
    <ul className="grid gap-3 grid-cols-2 sm:grid-cols-3">
      {BADGES.map((b) => {
        const at = earned[b.id];
        return (
          <li key={b.id} className={`rounded-xl border p-3 ${at ? "border-accent bg-accent-soft" : "border-dashed border-line"}`}>
            <div className={`text-3xl ${at ? "" : "grayscale opacity-40"}`} aria-hidden>
              {b.icon}
            </div>
            <div className="font-medium text-sm mt-1">{b.title}</div>
            <div className="text-xs text-muted mt-0.5 leading-relaxed">{b.desc}</div>
            <div className="text-[11px] mt-1.5" style={{ color: at ? "var(--up)" : "var(--muted)" }}>
              {at ? `Đã mở ${at.slice(8)}/${at.slice(5, 7)}/${at.slice(0, 4)}` : "🔒 Chưa mở"}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
