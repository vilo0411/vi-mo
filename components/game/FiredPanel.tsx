import Link from "next/link";
import { LESSONS } from "@/content/lessons";
import type { FireRule } from "@/lib/game";
import { FIRE_LESSON } from "@/lib/world";
import { formatReal } from "@/lib/game";
import SpeakButton from "./Speak";

/** Màn bị cách chức: chỉ số nào vượt ngưỡng, từ quý nào. */
export default function FiredPanel({ rule, real, year, quarter, street, children }: { rule: FireRule; real: number; year: number; quarter: number; street?: string; children?: React.ReactNode }) {
  const lesson = LESSONS.find((l) => l.slug === FIRE_LESSON[rule.node]);
  return (
    <div className="anim-pop rounded-xl border-2 p-5 space-y-3" style={{ borderColor: "var(--down)" }}>
      <div className="text-xs font-medium" style={{ color: "var(--down)" }}>
        Năm {year} · Quý {quarter}
      </div>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-semibold">🚪 Bạn bị cách chức: {rule.label.toLowerCase()}</h3>
        <SpeakButton
          id="fired"
          text={`Bạn bị cách chức: ${rule.label.toLowerCase()}. Chỉ số đã ${rule.op === ">" ? "vượt" : "rơi xuống dưới"} ngưỡng ${formatReal(rule.node, rule.value)} hai quý liền, quý này ở mức ${formatReal(rule.node, real)}.`}
        />
      </div>
      <p className="leading-relaxed">
        Chỉ số đã {rule.op === ">" ? "vượt" : "rơi xuống dưới"} ngưỡng <b className="font-medium tabular-nums">{formatReal(rule.node, rule.value)}</b> hai quý liền, quý này ở mức{" "}
        <b className="font-medium tabular-nums" style={{ color: "var(--down)" }}>
          {formatReal(rule.node, real)}
        </b>
        . Quốc hội và thị trường mất kiên nhẫn, nhiệm kỳ của bạn dừng ở đây.
      </p>
      {street && <p className="leading-relaxed rounded-lg bg-surface-2 p-3">{street}</p>}
      {lesson && (
        <p className="text-sm">
          Mấu chốt nằm ở bài <Link href={`/lo-trinh/${lesson.slug}`} className="text-accent underline decoration-dotted underline-offset-2">{lesson.title}</Link>. Ôn lại rồi thử hướng khác.
        </p>
      )}
      {children}
    </div>
  );
}
