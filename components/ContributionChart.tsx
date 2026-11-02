"use client";

import { useState } from "react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { contributionInputs, contributions } from "@/lib/contributions";
import { getSeries } from "@/lib/data";
import SourceBadge from "./SourceBadge";

const PARTS = [
  { key: "C", label: "Tiêu dùng (C)", color: "var(--chart-1)" },
  { key: "I", label: "Đầu tư (I)", color: "var(--chart-3)" },
  { key: "G", label: "Nhà nước (G)", color: "var(--g-chinh-sach)" },
  { key: "NX", label: "Xuất khẩu ròng (X − M)", color: "var(--chart-2)" },
  { key: "gap", label: "Chênh lệch thống kê", color: "var(--border)" },
] as const;

const fmt = (x: number, d = 1) => x.toLocaleString("vi-VN", { maximumFractionDigits: d, minimumFractionDigits: d });

/** Tăng trưởng GDP mỗi năm được tách thành phần đóng góp của C, I, G và xuất khẩu ròng. */
export default function ContributionChart({ from = 2005, height = 300, showWorked = true }: { from?: number; height?: number; showWorked?: boolean }) {
  const data = contributions(from);
  const [year, setYear] = useState(data.at(-1)?.year ?? 0);
  const c = data.find((d) => d.year === year);
  // Thiếu dữ liệu tốc độ tăng của các thành phần (chưa chạy npm run fetch-data) thì không vẽ gì.
  if (!c) return <p className="text-sm text-muted">Chưa có dữ liệu tốc độ tăng của các thành phần GDP. Chạy npm run fetch-data để tải.</p>;
  const inputs = contributionInputs(year);
  const x = inputs.find((i) => i.key === "X")!;
  const m = inputs.find((i) => i.key === "M")!;

  return (
    <div className="space-y-4">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            stackOffset="sign"
            margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
            onClick={(e) => {
              const y = Number((e as { activeLabel?: string | number } | null)?.activeLabel);
              if (y) setYear(y);
            }}
          >
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: "var(--muted)", fontSize: 12 }} stroke="var(--border)" />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} stroke="var(--border)" width={40} unit="%" />
            <ReferenceLine y={0} stroke="var(--muted)" />
            <Tooltip
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
              labelStyle={{ color: "var(--muted)" }}
              formatter={(v, key) => [`${fmt(v as number, 2)} điểm %`, key === "actual" ? "Tăng trưởng GDP thật" : PARTS.find((p) => p.key === key)?.label ?? String(key)]}
            />
            <Legend
              formatter={(key) => (
                <span style={{ color: "var(--text)", fontSize: 12 }}>{key === "actual" ? "Tăng trưởng GDP thật" : PARTS.find((p) => p.key === key)?.label}</span>
              )}
            />
            {PARTS.map((p) => (
              <Bar key={p.key} dataKey={p.key} stackId="g" fill={p.color} isAnimationActive={false} cursor="pointer" />
            ))}
            <Line dataKey="actual" stroke="var(--text)" strokeWidth={2} dot={{ r: 2.5 }} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <SourceBadge series={getSeries("consumption_growth")!} />
        <span className="text-xs text-muted">Bấm vào một cột để xem cách tính của năm đó.</span>
      </div>

      {showWorked && (
        <div className="rounded-xl bg-surface-2 p-4 space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Cách tính năm</span>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="text-sm py-0.5">
              {data.map((d) => (
                <option key={d.year} value={d.year}>
                  {d.year}
                </option>
              ))}
            </select>
          </div>
          <p className="text-muted leading-relaxed">
            Đóng góp của một thành phần = tỷ trọng của nó trong GDP năm trước × tốc độ tăng thực của nó năm nay. Cộng các đóng góp lại sẽ ra gần đúng tốc độ tăng GDP.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="text-xs text-muted text-left">
                  <th className="font-normal py-1 pr-3">Thành phần</th>
                  <th className="font-normal py-1 pr-3 text-right">Tỷ trọng {year - 1}</th>
                  <th className="font-normal py-1 pr-3 text-right">Tăng thực {year}</th>
                  <th className="font-normal py-1 text-right">Đóng góp</th>
                </tr>
              </thead>
              <tbody>
                {inputs
                  .filter((i) => i.key !== "X" && i.key !== "M")
                  .map((i) => (
                    <tr key={i.key} className="border-t border-line">
                      <td className="py-1.5 pr-3">{i.label}</td>
                      <td className="py-1.5 pr-3 text-right">{fmt(i.share)}%</td>
                      <td className="py-1.5 pr-3 text-right">{fmt(i.growth)}%</td>
                      <td className="py-1.5 text-right">
                        {fmt(i.share / 100, 3)} × {fmt(i.growth)} = <b className="font-medium">{fmt(c[i.key as "C" | "I" | "G"], 2)}</b>
                      </td>
                    </tr>
                  ))}
                <tr className="border-t border-line">
                  <td className="py-1.5 pr-3">Xuất khẩu ròng (X − M)</td>
                  <td className="py-1.5 pr-3 text-right text-xs">
                    X {fmt(x.share)}%, M {fmt(m.share)}%
                  </td>
                  <td className="py-1.5 pr-3 text-right text-xs">
                    X {fmt(x.growth)}%, M {fmt(m.growth)}%
                  </td>
                  <td className="py-1.5 text-right">
                    {fmt((x.share * x.growth) / 100, 2)} − {fmt((m.share * m.growth) / 100, 2)} = <b className="font-medium">{fmt(c.NX, 2)}</b>
                  </td>
                </tr>
                <tr className="border-t border-line font-medium">
                  <td className="py-1.5 pr-3" colSpan={3}>
                    Tổng đóng góp
                  </td>
                  <td className="py-1.5 text-right">{fmt(c.sum, 2)} điểm %</td>
                </tr>
                <tr>
                  <td className="py-1 pr-3 text-muted" colSpan={3}>
                    Tăng trưởng GDP thật (Cục Thống kê, qua World Bank)
                  </td>
                  <td className="py-1 text-right">{fmt(c.actual, 2)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Chênh lệch {fmt(c.gap, 2)} điểm % là do tỷ trọng tính theo giá hiện hành còn tốc độ tăng tính theo giá so sánh, cộng với sai số thống kê và thay đổi phương pháp tính (rõ nhất năm 2010).
            {Math.abs(c.NX) < Math.abs(c.C) &&
              " Để ý: xuất khẩu và nhập khẩu đều rất lớn (gần bằng GDP) nhưng gần như triệt tiêu nhau, nên đóng góp ròng của thương mại thường nhỏ hơn tiêu dùng."}
          </p>
        </div>
      )}
    </div>
  );
}
