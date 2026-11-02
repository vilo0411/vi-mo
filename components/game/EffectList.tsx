import type { RoundShock } from "@/content/scenarios";
import { choiceEffects, effectHeadline } from "@/lib/why";
import { WhyBox } from "./QuarterPanel";

/**
 * Trước khi chọn: theo quy luật, riêng phương án (hay sự kiện) này sẽ đẩy lạm phát, tăng trưởng, tỷ giá đi đâu,
 * sau bao lâu, và vì sao (mở ra xem từng bước). Dành cho người chưa biết gì về vĩ mô.
 */
export default function EffectList({ shocks, title }: { shocks: RoundShock[]; title: string }) {
  const effects = choiceEffects(shocks);
  if (!effects.length) return null;
  return (
    <div className="space-y-1.5 text-xs">
      <div className="text-muted">{title}</div>
      <ul className="space-y-1.5">
        {effects.map((e) => (
          <li key={e.target} className="space-y-1">
            <div style={{ color: e.good ? "var(--up)" : "var(--down)" }}>
              {e.good ? "▲ Có lợi:" : "▼ Cái giá:"} {effectHeadline(e)}.
            </div>
            <WhyBox steps={e.steps} title="Vì sao?" />
          </li>
        ))}
      </ul>
    </div>
  );
}
