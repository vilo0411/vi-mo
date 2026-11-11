import { INDICATOR_BY_ID } from "@/content/indicators";
import type { Scenario } from "@/content/scenarios";
import { STREET, type Voice } from "@/content/world";
import { finalResult, formatReal, type Direction } from "@/lib/game";
import StreetFeed from "./StreetFeed";

export const directionWord: Record<Direction, string> = { up: "tăng", flat: "gần như đứng yên", down: "giảm" };

/** Một năm sau khi rời ghế: tác động trễ của các quyết định, cũng là năm dùng để so mục tiêu. */
export default function Epilogue({ final, voices, scenario }: { final: ReturnType<typeof finalResult>; voices: Voice[]; scenario: Scenario }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-5 space-y-3">
      <div>
        <div className="text-xs text-muted">Một năm sau khi bạn rời ghế</div>
        <p className="text-sm leading-relaxed mt-1">Chính sách có độ trễ, nên các quyết định của bạn vẫn tác động thêm một năm nữa. Đây là con số dùng để so với mục tiêu.</p>
      </div>
      <ul className="grid sm:grid-cols-2 gap-2 text-sm">
        {final.targets.map((t) => (
          <li key={t.node} className="rounded-lg bg-surface-2 p-3 flex justify-between gap-3">
            <span>{INDICATOR_BY_ID[t.node].name}</span>
            <b className="font-medium tabular-nums" style={{ color: t.ok ? "var(--up)" : "var(--down)" }}>
              {formatReal(t.node, t.real)}
            </b>
          </li>
        ))}
      </ul>
      {scenario.street && <StreetFeed voices={voices} title={`Chuyện ở ${STREET} bây giờ`} />}
    </div>
  );
}
