"use client";

import { CartesianGrid, Legend, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getSeries, formatValue } from "@/lib/data";
import SourceBadge from "./SourceBadge";

type Line_ = { id: string; label: string };

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

export default function SeriesChart({
  lines,
  height = 220,
  highlight,
  from,
  to,
  showSource = true,
}: {
  lines: Line_[];
  height?: number;
  highlight?: [number, number];
  from?: number;
  to?: number;
  showSource?: boolean;
}) {
  const series = lines.map((l) => getSeries(l.id)).filter(Boolean) as NonNullable<ReturnType<typeof getSeries>>[];
  if (!series.length) return null;
  const years = new Set<number>();
  for (const s of series) for (const p of s.points) if ((from === undefined || p.year >= from) && (to === undefined || p.year <= to)) years.add(p.year);
  const data = [...years].sort((a, b) => a - b).map((year) => {
    const row: Record<string, number | null> = { year };
    for (const s of series) row[s.id] = s.points.find((p) => p.year === year)?.value ?? null;
    return row;
  });
  // Hai chuỗi khác đơn vị (ví dụ % và USD) thì chuỗi thứ hai dùng trục phải, nếu không một đường sẽ bị ép phẳng.
  const dual = series.length === 2 && series[0].unit !== series[1].unit;
  const axisOf = (i: number) => (dual && i === 1 ? "right" : "left");
  const labelOf = (id: string) => {
    const label = lines.find((l) => l.id === id)?.label ?? id;
    return dual && series[1]?.id === id ? `${label} (trục phải)` : label;
  };

  return (
    <div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: "var(--muted)", fontSize: 12 }} stroke="var(--border)" />
            <YAxis
              yAxisId="left"
              tick={{ fill: dual ? COLORS[0] : "var(--muted)", fontSize: 12 }}
              stroke="var(--border)"
              width={56}
              tickFormatter={(v: number) => v.toLocaleString("vi-VN")}
            />
            {dual && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: COLORS[1], fontSize: 12 }}
                stroke="var(--border)"
                width={56}
                tickFormatter={(v: number) => v.toLocaleString("vi-VN")}
              />
            )}
            {highlight && <ReferenceArea yAxisId="left" x1={highlight[0]} x2={highlight[1]} fill="var(--accent)" fillOpacity={0.12} />}
            <Tooltip
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
              labelStyle={{ color: "var(--muted)" }}
              formatter={(v, name) => {
                const s = series.find((x) => x.id === name);
                return [formatValue(v as number, s?.unit), labelOf(String(name))];
              }}
            />
            {lines.length > 1 && (
              <Legend formatter={(id) => <span style={{ color: "var(--text)", fontSize: 12 }}>{labelOf(String(id))}</span>} />
            )}
            {series.map((s, i) => (
              <Line
                key={s.id}
                yAxisId={axisOf(i)}
                dataKey={s.id}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={data.length < 15 ? { r: 3 } : false}
                connectNulls={false}
                isAnimationActive={false}
                type={s.id === "policy_rate" ? "stepAfter" : "monotone"}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {showSource && (
        <div className="flex flex-wrap gap-2 mt-2">
          {series.map((s) => (
            <SourceBadge key={s.id} series={s} />
          ))}
          {series.length > 0 && (
            <span className="text-xs text-muted self-center">Đơn vị: {[...new Set(series.map((s) => s.unit))].join(" · ")}</span>
          )}
        </div>
      )}
    </div>
  );
}
