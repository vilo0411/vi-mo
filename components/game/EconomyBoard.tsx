"use client";

import { useMemo } from "react";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { INDICATORS, INDICATOR_BY_ID } from "@/content/indicators";
import { SIM_LINKS, linkKey } from "@/content/links";
import type { Round, RoundShock, Scenario } from "@/content/scenarios";
import { breaches, describeChange, describeShock, formatReal, REAL_SCALE, ROUND_PERIODS, SCOREBOARD, toReal, type FireRule } from "@/lib/game";
import MacroGraph, { type NodeState } from "../MacroGraph";
import TrustBar from "./TrustBar";

// Thẻ khái niệm không có trong mô phỏng.
const SIM_INDICATORS = INDICATORS.filter((i) => !i.concept);
const SEEN = 0.02;

/** Cột bên phải khi chơi: Tín nhiệm, bảng chỉ số, bản đồ nhân quả và biểu đồ theo quý. */
export default function EconomyBoard({
  scenario,
  result,
  tView,
  trust,
  round,
  myShocks,
  rules = [],
}: {
  scenario: Scenario;
  result: Record<string, number[]>;
  tView: number;
  trust: number;
  /** Vòng đang chơi, để đánh dấu chỗ sự kiện tác động */
  round?: Round;
  /** Cú sốc của quyết định vừa chọn, để đánh dấu chỗ bạn tác động */
  myShocks?: RoundShock[];
  /** Ngưỡng bị cách chức, hiện trên thẻ chỉ số */
  rules?: FireRule[];
}) {
  // Chỉ hiện những chỉ số đã bị ảnh hưởng tính tới kỳ đang xem, nên bản đồ mọc dần theo từng quyết định.
  const visibleIds = useMemo(() => {
    const out = SIM_INDICATORS.map((i) => i.id).filter((id) => result[id].slice(0, tView + 1).some((x) => Math.abs(x) > SEEN));
    return out.length ? out : [scenario.rounds[scenario.start].event[0]?.node ?? "cpi"];
  }, [result, tView, scenario]);

  const maxAbs = useMemo(() => Math.max(0.05, ...SIM_INDICATORS.flatMap((i) => result[i.id].slice(0, tView + 1).map(Math.abs))), [result, tView]);

  const nodeState = useMemo(() => {
    const out: Record<string, NodeState> = {};
    for (const ind of SIM_INDICATORS) {
      const v = result[ind.id][tView];
      const base = scenario.baseline[ind.id];
      const board = SCOREBOARD.find((m) => m.id === ind.id);
      const good = !board || Math.abs(v) < SEEN ? null : (v > 0) !== (board.bad === "up");
      if (base !== undefined && REAL_SCALE[ind.id]) {
        const real = toReal(ind.id, base, v);
        const sc = REAL_SCALE[ind.id];
        const delta = sc.kind === "pp" ? `${real - base >= 0 ? "+" : "−"}${Math.abs(real - base).toFixed(1).replace(".", ",")} điểm %` : `${real - base >= 0 ? "+" : "−"}${Math.abs((real / base - 1) * 100).toFixed(1).replace(".", ",")}%`;
        out[ind.id] = { value: formatReal(ind.id, real), note: Math.abs(v) < SEEN ? "như khởi điểm" : `${delta} so với khởi điểm`, good, intensity: v / maxAbs };
      } else {
        out[ind.id] = { value: Math.abs(v) < SEEN ? "Không đổi" : v > 0 ? "↑ Tăng" : "↓ Giảm", note: Math.abs(v) < SEEN ? " " : describeChange(v), good, intensity: v / maxAbs };
      }
    }
    // Đánh dấu trên bản đồ chỗ sự kiện năm nay tác động vào và chỗ quyết định của bạn tác động vào.
    if (round) {
      for (const e of round.event) if (out[e.node]) out[e.node].badge = { text: "Sự kiện năm nay", tone: "event" };
      if (myShocks) for (const c of myShocks) if (out[c.node]) out[c.node].badge = { text: `Bạn: ${describeShock(scenario, c)}`, tone: "you" };
    }
    return out;
  }, [result, tView, maxAbs, scenario, round, myShocks]);

  const active = useMemo(() => {
    const keys = new Set<string>();
    const nodes = new Set<string>();
    for (const l of SIM_LINKS) {
      const src = tView - l.lag;
      if (src >= 0 && Math.abs(result[l.from][src]) > SEEN) {
        keys.add(linkKey(l));
        nodes.add(l.from);
        nodes.add(l.to);
      }
    }
    for (const id of visibleIds) if (Math.abs(result[id][tView]) > SEEN) nodes.add(id);
    return { keys, nodes };
  }, [result, tView, visibleIds]);

  const chartData = Array.from({ length: tView + 1 }, (_, k) => ({
    t: k,
    cpi: Math.round(toReal("cpi", scenario.baseline.cpi, result.cpi[k]) * 10) / 10,
    gdp_growth: Math.round(toReal("gdp_growth", scenario.baseline.gdp_growth, result.gdp_growth[k]) * 10) / 10,
  }));

  return (
        <div className="space-y-4 min-w-0">
          <TrustBar value={trust} />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {SCOREBOARD.map((m) => {
              const v = result[m.id][tView];
              const base = scenario.baseline[m.id];
              const bad = m.bad === "up" ? v > SEEN : v < -SEEN;
              const good = m.bad === "up" ? v < -SEEN : v > SEEN;
              const target = scenario.targets.find((t) => t.node === m.id);
              const rule = rules.find((r) => r.node === m.id);
              const danger = rule && base !== undefined && breaches(rule, toReal(m.id, base, v));
              return (
                <div key={m.id} className="bg-surface border rounded-xl p-3" style={{ borderColor: danger ? "var(--down)" : "var(--border)" }}>
                  <div className="text-xs text-muted">{m.label}</div>
                  <div className="text-lg font-medium mt-0.5 tabular-nums" style={{ color: bad ? "var(--down)" : good ? "var(--up)" : "var(--text)" }}>
                    {base !== undefined ? formatReal(m.id, toReal(m.id, base, v)) : describeChange(v)}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    {target ? `Mục tiêu ${target.op === "<=" ? "≤" : "≥"} ${formatReal(m.id, target.value)}` : base !== undefined ? `Khởi điểm ${formatReal(m.id, base)}` : " "}
                  </div>
                  {rule && rule.value > -1e8 && rule.value < 1e8 && (
                    <div className="text-[11px] mt-0.5" style={{ color: danger ? "var(--down)" : "var(--muted)" }}>
                      {danger ? "⚠ " : ""}Cách chức nếu {rule.op} {formatReal(m.id, rule.value)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <MacroGraph
            nodeState={nodeState}
            visibleIds={visibleIds}
            highlightNodes={active.nodes}
            highlightLinks={active.keys}
            draggable={false}
            height={500}
          />
          <p className="text-xs text-muted">
            Bản đồ chỉ hiện những chỉ số đã bị ảnh hưởng. Mỗi lựa chọn được chạy qua mô hình từng quý, nên bạn thấy tác động lan dần qua các mũi tên. {scenario.baselineNote}
          </p>
          <div className="bg-surface border border-line rounded-xl p-4">
            <h3 className="font-medium mb-2 text-sm">Lạm phát và tăng trưởng theo quý</h3>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="var(--grid)" vertical={false} />
                  <XAxis dataKey="t" tick={{ fill: "var(--muted)", fontSize: 12 }} stroke="var(--border)" tickFormatter={(k: number) => `Q${k}`} />
                  <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} stroke="var(--border)" width={40} unit="%" />
                  {Array.from({ length: Math.floor(tView / ROUND_PERIODS) }, (_, k) => (
                    <ReferenceLine key={k} x={(k + 1) * ROUND_PERIODS} stroke="var(--border)" strokeDasharray="3 3" />
                  ))}
                  {scenario.targets
                    .filter((t) => t.node === "cpi" || t.node === "gdp_growth")
                    .map((t) => (
                      <ReferenceLine key={t.node} y={t.value} stroke={t.node === "cpi" ? "var(--chart-2)" : "var(--chart-1)"} strokeDasharray="2 4" />
                    ))}
                  <Tooltip
                    contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
                    labelFormatter={(k) => `Quý ${k}`}
                    formatter={(v, id) => [`${(v as number).toLocaleString("vi-VN")}%`, INDICATOR_BY_ID[id as string].name]}
                  />
                  <Legend formatter={(id) => <span style={{ color: "var(--text)", fontSize: 12 }}>{INDICATOR_BY_ID[id as string].name}</span>} />
                  <Line dataKey="cpi" stroke="var(--chart-2)" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line dataKey="gdp_growth" stroke="var(--chart-1)" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted mt-1">Đường chấm là mục tiêu.</p>
          </div>
        </div>
  );
}
