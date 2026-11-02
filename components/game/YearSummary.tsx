import type { Scenario } from "@/content/scenarios";
import { averageValues, changeText, driversBetween, formatReal, score, SCOREBOARD, toReal, type Attribution } from "@/lib/game";
import { DriverChips } from "./QuarterPanel";
import SpeakButton from "./Speak";
import { narrateYear } from "@/lib/narration";

const SEEN = 0.02;

/** Số chỉ số tốt lên, xấu đi, và Tín nhiệm trước/sau của một năm. Dùng chung cho bảng tổng kết và lời kể tải trước. */
export function yearStats(scenario: Scenario, before: Record<string, number[]>, after: Record<string, number[]>, t0: number, t1: number) {
  let goods = 0;
  let bads = 0;
  for (const m of SCOREBOARD) {
    const delta = after[m.id][t1] - before[m.id][t0];
    if (Math.abs(delta) < SEEN) continue;
    if (delta > 0 !== (m.bad === "up")) goods++;
    else bads++;
  }
  const trustOf = (res: Record<string, number[]>, t: number) => (t === 0 ? 100 : score(averageValues(res, t), scenario.difficulty).points);
  return { goods, bads, trust0: trustOf(before, t0), trust1: trustOf(after, t1) };
}

/** Lời kể tổng kết năm, đúng như nút Nghe ở bảng tổng kết sẽ đọc. */
export function yearNarration(scenario: Scenario, year: number, before: Record<string, number[]>, after: Record<string, number[]>, t0: number, t1: number, feedback: string, next: string) {
  const st = yearStats(scenario, before, after, t0, t1);
  return narrateYear(year, st.goods, st.bads, st.trust0, st.trust1, feedback, next);
}

/** Tóm tắt một năm: các chỉ số chấm điểm trước và sau quyết định, nhận xét, và xem lại từng quý. */
export default function YearSummary({
  scenario,
  year,
  before,
  after,
  t0,
  t1,
  feedback,
  reviewQ,
  onReview,
  onReplay,
  children,
  attBefore,
  attAfter,
  next = "",
}: {
  /** Câu kết của lời kể: mời sang năm sau, hoặc kết quả nhiệm kỳ */
  next?: string;
  scenario: Scenario;
  year: number;
  before: Record<string, number[]>;
  after: Record<string, number[]>;
  attBefore: Attribution;
  attAfter: Attribution;
  t0: number;
  t1: number;
  feedback: string;
  reviewQ: number | null;
  onReview: (q: number | null) => void;
  onReplay: () => void;
  children?: React.ReactNode;
}) {
  const rows = SCOREBOARD.map((m) => {
    const a = before[m.id][t0];
    const b = after[m.id][t1];
    const delta = b - a;
    const good = Math.abs(delta) < SEEN ? null : delta > 0 !== (m.bad === "up");
    const target = scenario.targets.find((t) => t.node === m.id);
    const real = scenario.baseline[m.id] !== undefined ? toReal(m.id, scenario.baseline[m.id], b) : undefined;
    const ok = target && real !== undefined ? (target.op === "<=" ? real <= target.value + 1e-9 : real >= target.value - 1e-9) : undefined;
    const drivers = driversBetween(scenario, m.id, attBefore, t0, attAfter, t1);
    return { ...m, a, b, good, target, ok, drivers };
  });
  const { goods, bads, trust0, trust1 } = yearStats(scenario, before, after, t0, t1);
  return (
    <div className="bg-surface border border-line rounded-xl p-5 space-y-4">
      <div>
        <div className="text-xs text-muted">Tổng kết năm {year}</div>
        <h3 className="font-semibold">
          {goods > bads ? "Năm này đi đúng hướng nhiều hơn" : goods < bads ? "Năm này cái giá khá đắt" : "Năm này được mất ngang nhau"}
        </h3>
        <p className="text-sm text-muted mt-0.5">
          {goods} chỉ số tốt lên, {bads} chỉ số xấu đi. Tín nhiệm{" "}
          <b className="font-medium tabular-nums" style={{ color: trust1 >= trust0 ? "var(--up)" : "var(--down)" }}>
            {trust0} → {trust1}
          </b>
          .
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted text-left">
            <th className="font-normal pb-1">Chỉ số</th>
            <th className="font-normal pb-1">Trước quyết định → cuối năm, và do đâu</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-line align-top">
              <td className="py-1.5 pr-2">{r.label}</td>
              <td className="py-1.5 tabular-nums">
                <span style={{ color: r.good === null ? "var(--text)" : r.good ? "var(--up)" : "var(--down)" }}>{changeText(scenario, r.id, r.a, r.b)}</span>
                {r.target && (
                  <span className="block text-[11px] text-muted">
                    Mục tiêu {r.target.op === "<=" ? "≤" : "≥"} {formatReal(r.id, r.target.value)}{" "}
                    <span style={{ color: r.ok ? "var(--up)" : "var(--down)" }}>{r.ok ? "✓ đang đạt" : "✗ chưa đạt"}</span>
                  </span>
                )}
                {r.good !== null && r.drivers.length > 0 && (
                  <span className="block mt-1">
                    <DriverChips drivers={r.drivers} />
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="rounded-lg bg-surface-2 p-3 text-sm leading-relaxed">
        <div className="flex items-start justify-between gap-3 mb-0.5">
          <div className="font-medium">Vì sao ra kết quả này?</div>
          <SpeakButton
            id={`year-${year}`}
            auto
            text={narrateYear(year, goods, bads, trust0, trust1, feedback, next)}
          />
        </div>
        {feedback}
      </div>
      <div className="space-y-1.5">
        <div className="text-xs text-muted">Xem lại từng quý (bản đồ và giải thích đổi theo):</div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {Array.from({ length: t1 - t0 + 1 }, (_, q) => (
            <button
              key={q}
              type="button"
              onClick={() => onReview(reviewQ === q ? null : q)}
              aria-pressed={reviewQ === q}
              className={`px-2.5 py-1 rounded-full border ${reviewQ === q ? "bg-accent text-white border-accent" : "border-line"}`}
            >
              {q === 0 ? "Đầu năm" : `Quý ${q}`}
            </button>
          ))}
          <button type="button" onClick={onReplay} className="px-2.5 py-1 rounded-full border border-line">
            ↻ Phát lại năm này
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
