"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GROUPS, INDICATORS, INDICATOR_BY_ID } from "@/content/indicators";
import { LINKS } from "@/content/links";
import { formatValue, getSeries, lowerFirst } from "@/lib/data";
import { describeR, lagCorrelation } from "@/lib/stats";
import SourceBadge from "./SourceBadge";

const PAIRS: { a: string; b: string; lag: number; why: string }[] = [
  { a: "m2", b: "cpi", lag: 1, why: "Tiền tăng nhanh thì lạm phát có tăng theo không?" },
  { a: "lending_rate", b: "credit", lag: 0, why: "Lãi suất cao thì tín dụng có chậm lại không?" },
  { a: "fx_rate", b: "net_exports", lag: 1, why: "VND mất giá có giúp xuất khẩu không?" },
  { a: "oil_price", b: "cpi", lag: 0, why: "Giá dầu ảnh hưởng lạm phát mạnh tới đâu?" },
  { a: "gdp_growth", b: "unemployment", lag: 0, why: "Quy luật Okun có đúng ở Việt Nam?" },
  { a: "current_account", b: "reserves", lag: 0, why: "Thặng dư vãng lai có làm dự trữ tăng?" },
];

export default function CompareTool() {
  const router = useRouter();
  const params = useSearchParams();
  const ok = (id: string | null) => !!id && !!INDICATOR_BY_ID[id] && !INDICATOR_BY_ID[id].concept;
  const a = ok(params.get("a")) ? params.get("a")! : "m2";
  const b = ok(params.get("b")) ? params.get("b")! : "cpi";
  const lag = Math.max(-3, Math.min(3, Number(params.get("lag") ?? 0) || 0));

  const set = (next: { a?: string; b?: string; lag?: number }) => {
    const q = new URLSearchParams({ a: next.a ?? a, b: next.b ?? b, lag: String(next.lag ?? lag) });
    router.replace(`/so-sanh?${q}`, { scroll: false });
  };

  const ia = INDICATOR_BY_ID[a];
  const ib = INDICATOR_BY_ID[b];
  const sa = getSeries(ia.seriesId)!;
  const sb = getSeries(ib.seriesId)!;
  const { r, n } = lagCorrelation(sa.points, sb.points, lag);
  const byLag = [-3, -2, -1, 0, 1, 2, 3].map((k) => ({ k, ...lagCorrelation(sa.points, sb.points, k) }));
  const best = byLag.filter((x) => x.r !== undefined && x.n >= 8).sort((x, y) => Math.abs(y.r!) - Math.abs(x.r!))[0];
  const direct = LINKS.find((l) => l.from === a && l.to === b);
  const reverse = LINKS.find((l) => l.from === b && l.to === a);

  const bMap = new Map(sb.points.map((p) => [p.year, p.value]));
  const years = [...new Set([...sa.points.map((p) => p.year), ...sb.points.map((p) => p.year - lag)])].filter((y) => y >= 1990).sort((x, y) => x - y);
  const data = years.map((year) => ({
    year,
    a: sa.points.find((p) => p.year === year)?.value ?? null,
    b: bMap.get(year + lag) ?? null,
  }));

  const bLabel = lag === 0 ? ib.name : `${ib.name} (${lag > 0 ? `${lag} năm sau` : `${-lag} năm trước`})`;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">So sánh hai chỉ số</h1>
        <p className="text-sm text-muted mt-1 max-w-3xl">
          Chọn hai chỉ số để vẽ chồng lên nhau. Kéo độ trễ để kiểm tra xem chỉ số thứ nhất có &ldquo;đi trước&rdquo; chỉ số thứ hai không.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PAIRS.map((p) => (
          <button
            key={p.a + p.b}
            type="button"
            onClick={() => set(p)}
            className={`text-xs px-3 py-1.5 rounded-full border ${p.a === a && p.b === b ? "border-accent text-accent bg-accent-soft" : "border-line text-muted hover:text-text"}`}
          >
            {p.why}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-surface border border-line rounded-xl px-4 py-3 text-sm">
        <span className="w-3 h-3 rounded-full" style={{ background: "var(--chart-1)" }} />
        <Picker value={a} onChange={(v) => set({ a: v })} />
        <button type="button" onClick={() => set({ a: b, b: a, lag: -lag })} className="text-muted hover:text-text px-2" aria-label="Đổi chỗ">
          ⇄
        </button>
        <span className="w-3 h-3 rounded-full" style={{ background: "var(--chart-2)" }} />
        <Picker value={b} onChange={(v) => set({ b: v })} />
        <div className="flex items-center gap-2 sm:ml-auto">
          <label htmlFor="lag">Độ trễ</label>
          <input id="lag" type="range" min={-3} max={3} step={1} value={lag} onChange={(e) => set({ lag: Number(e.target.value) })} className="w-32" />
          <span className="tabular-nums w-16">{lag > 0 ? `+${lag} năm` : `${lag} năm`}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="bg-surface border border-line rounded-xl p-4">
          <div style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="var(--grid)" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: "var(--muted)", fontSize: 12 }} stroke="var(--border)" />
                <YAxis yAxisId="a" tick={{ fill: "var(--chart-1)", fontSize: 12 }} stroke="var(--border)" width={56} tickFormatter={(v: number) => v.toLocaleString("vi-VN")} />
                <YAxis yAxisId="b" orientation="right" tick={{ fill: "var(--chart-2)", fontSize: 12 }} stroke="var(--border)" width={56} tickFormatter={(v: number) => v.toLocaleString("vi-VN")} />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
                  formatter={(v, key) => [formatValue(v as number, key === "a" ? sa.unit : sb.unit), key === "a" ? ia.name : bLabel]}
                />
                <Legend formatter={(key) => <span style={{ color: "var(--text)", fontSize: 12 }}>{key === "a" ? `${ia.name} (trục trái)` : `${bLabel} (trục phải)`}</span>} />
                <Line yAxisId="a" dataKey="a" stroke="var(--chart-1)" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="b" dataKey="b" stroke="var(--chart-2)" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <SourceBadge series={sa} />
            {sb.id !== sa.id && <SourceBadge series={sb} />}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-surface border border-line rounded-xl p-4">
            <div className="text-xs text-muted">Hệ số tương quan (r)</div>
            <div className="text-3xl font-semibold tabular-nums mt-1">{r === undefined ? "—" : r.toFixed(2)}</div>
            <div className="text-sm mt-1">{describeR(r)}</div>
            <div className="text-xs text-muted mt-1">Tính trên {n} năm có đủ cả hai số liệu.</div>
            <div className="mt-4 space-y-1">
              {byLag.map((x) => (
                <button key={x.k} type="button" onClick={() => set({ lag: x.k })} className={`w-full flex items-center gap-2 text-xs ${x.k === lag ? "font-semibold" : ""}`}>
                  <span className="w-12 text-left tabular-nums text-muted">{x.k > 0 ? `+${x.k}` : x.k} năm</span>
                  <span className="flex-1 h-2 bg-surface-2 rounded relative overflow-hidden">
                    {x.r !== undefined && (
                      <span
                        className="absolute top-0 bottom-0"
                        style={{
                          left: x.r >= 0 ? "50%" : `${50 + x.r * 50}%`,
                          width: `${Math.abs(x.r) * 50}%`,
                          background: x.r >= 0 ? "var(--chart-2)" : "var(--chart-1)",
                        }}
                      />
                    )}
                  </span>
                  <span className="w-10 text-right tabular-nums">{x.r === undefined ? "—" : x.r.toFixed(2)}</span>
                </button>
              ))}
            </div>
            {best && best.k !== lag && (
              <p className="text-xs text-muted mt-3">Tương quan mạnh nhất ở độ trễ {best.k > 0 ? `+${best.k}` : best.k} năm.</p>
            )}
          </div>

          <div className="bg-surface border border-line rounded-xl p-4 text-sm space-y-2">
            <div className="font-medium">Bản đồ nói gì?</div>
            {direct ? (
              <p>
                Có quan hệ trực tiếp: {ia.name} tăng thì {lowerFirst(ib.name)} {direct.sign > 0 ? "tăng" : "giảm"}. {direct.mechanism}
              </p>
            ) : reverse ? (
              <p>Quan hệ trực tiếp đi theo chiều ngược lại: {ib.name} → {ia.name}. {reverse.mechanism}</p>
            ) : (
              <p className="text-muted">Không có mũi tên trực tiếp giữa hai chỉ số này. Thử &ldquo;Tìm đường đi&rdquo; trên trang Bản đồ để xem chuỗi gián tiếp.</p>
            )}
          </div>

          <div className="text-xs text-muted leading-relaxed space-y-2">
            <p>Tương quan không phải nhân quả. Hai chỉ số có thể cùng chịu tác động của một yếu tố thứ ba.</p>
            <p>Dữ liệu theo năm nên chỉ có khoảng 20–30 điểm. Một năm bất thường (như 2008) có thể làm r thay đổi nhiều.</p>
            <p>Độ trễ dương: so {lowerFirst(ia.name)} năm t với {lowerFirst(ib.name)} năm t + độ trễ.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Picker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {Object.entries(GROUPS).map(([g, gv]) => (
        <optgroup key={g} label={gv.name}>
          {INDICATORS.filter((i) => i.group === g && !i.concept).map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
