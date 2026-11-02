"use client";

import { useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Scenario } from "@/content/scenarios";
import { toReal } from "@/lib/game";

const METRICS = [
  { id: "cpi", label: "Lạm phát" },
  { id: "gdp_growth", label: "Tăng trưởng" },
] as const;

/** So đường đi của bạn với "chuyên gia" (cách chơi bằng phương án dựng sẵn cho điểm cao nhất). */
export default function ExpertCompare({
  scenario,
  mine,
  expert,
  myPoints,
  expertPoints,
  expertLabels,
}: {
  scenario: Scenario;
  mine: Record<string, number[]>;
  expert: Record<string, number[]>;
  myPoints: number;
  expertPoints: number;
  expertLabels: string[];
}) {
  const [metric, setMetric] = useState<(typeof METRICS)[number]["id"]>("cpi");
  const len = Math.min(mine[metric].length, expert[metric].length);
  const data = Array.from({ length: len }, (_, t) => ({
    t,
    you: Math.round(toReal(metric, scenario.baseline[metric], mine[metric][t]) * 10) / 10,
    expert: Math.round(toReal(metric, scenario.baseline[metric], expert[metric][t]) * 10) / 10,
  }));
  const diff = myPoints - expertPoints;
  return (
    <div className="rounded-lg border border-line p-4 space-y-3 text-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-medium">🧑‍💼 So với chuyên gia</div>
        <div className="tabular-nums">
          Bạn {myPoints} · Chuyên gia {expertPoints} ·{" "}
          <b className="font-medium" style={{ color: diff >= 0 ? "var(--up)" : "var(--down)" }}>
            {diff >= 0 ? (diff === 0 ? "ngang chuyên gia" : `hơn ${diff} điểm`) : `kém ${-diff} điểm`}
          </b>
        </div>
      </div>
      <p className="text-muted">Chuyên gia chọn: {expertLabels.map((l, k) => `Năm ${k + 1}: ${l}`).join(" → ")}.</p>
      <div className="flex gap-1.5 text-xs" role="tablist">
        {METRICS.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={metric === m.id}
            onClick={() => setMetric(m.id)}
            className={`px-2.5 py-1 rounded-full border ${metric === m.id ? "bg-accent text-white border-accent" : "border-line"}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: "var(--muted)", fontSize: 12 }} stroke="var(--border)" tickFormatter={(k: number) => `Q${k}`} />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} stroke="var(--border)" width={40} unit="%" domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
              labelFormatter={(k) => `Quý ${k}`}
              formatter={(v, id) => [`${(v as number).toLocaleString("vi-VN")}%`, id === "you" ? "Bạn" : "Chuyên gia"]}
            />
            <Legend formatter={(id) => <span style={{ color: "var(--text)", fontSize: 12 }}>{id === "you" ? "Bạn" : "Chuyên gia"}</span>} />
            <Line dataKey="you" stroke="var(--chart-1)" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="expert" stroke="var(--chart-3)" strokeWidth={2} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
