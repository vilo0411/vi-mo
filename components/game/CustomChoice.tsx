"use client";

import { useState } from "react";
import type { Scenario } from "@/content/scenarios";
import { formatReal, LEVERS, leversToShocks, type LeverValues } from "@/lib/game";

/** Phương án D: người chơi tự đặt con số cho các công cụ. */
export default function CustomChoice({
  scenario,
  onSubmit,
  standalone = false,
}: {
  scenario: Scenario;
  onSubmit: (shocks: ReturnType<typeof leversToShocks>) => void;
  /** Chế độ tự do: luôn mở, không có chữ D, cho phép giữ nguyên mọi công cụ */
  standalone?: boolean;
}) {
  const [open, setOpen] = useState(standalone);
  const [v, setV] = useState<LeverValues>({ rate: 0, spend: 0, sell: 0 });
  const [error, setError] = useState(false);
  const shocks = leversToShocks(v);
  const reserves = scenario.baseline.reserves;
  const rate = scenario.baseline.policy_rate;

  const valueText = (id: (typeof LEVERS)[number]["id"], x: number) => {
    if (id === "rate") return rate !== undefined ? `${formatReal("policy_rate", rate)} → ${formatReal("policy_rate", rate + x)}` : `${x >= 0 ? "+" : ""}${x.toLocaleString("vi-VN")} điểm %`;
    if (id === "spend") return `${x >= 0 ? "+" : ""}${x.toLocaleString("vi-VN")} % GDP`;
    return reserves !== undefined ? `${x.toLocaleString("vi-VN")}% dự trữ ≈ ${Math.round((reserves * x) / 100).toLocaleString("vi-VN")} tỷ USD` : `${x.toLocaleString("vi-VN")}% dự trữ`;
  };

  return (
    <div className={`bg-surface border rounded-xl ${open ? "border-accent" : "border-line"}`}>
      <button type="button" onClick={() => !standalone && setOpen((o) => !o)} className="w-full text-left p-4 flex gap-3" aria-expanded={open}>
        <span className="w-7 h-7 shrink-0 rounded-full bg-surface-2 flex items-center justify-center text-sm font-semibold">{standalone ? "🎛️" : "D"}</span>
        <span>
          <span className="font-medium block">Tự đặt con số</span>
          <span className="text-sm text-muted block mt-0.5">Tự quyết định mức thay đổi lãi suất, chi tiêu công và lượng đô la bán ra.</span>
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {LEVERS.map((l) => (
            <label key={l.id} className="block text-sm">
              <span className="flex justify-between gap-2">
                <span>{l.label}</span>
                <span className="tabular-nums text-accent">{valueText(l.id, v[l.id])}</span>
              </span>
              <input
                type="range"
                min={l.min}
                max={l.max}
                step={l.step}
                value={v[l.id]}
                onChange={(e) => {
                  setV({ ...v, [l.id]: Number(e.target.value) });
                  setError(false);
                }}
                className="w-full"
              />
            </label>
          ))}
          {error && (
            <p className="text-xs" style={{ color: "var(--down)" }}>
              Kéo ít nhất một thanh khác 0, hoặc chọn một trong ba phương án ở trên.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => (shocks.length || standalone ? onSubmit(shocks) : setError(true))}
              className="px-4 py-2 rounded-lg bg-accent text-white text-sm"
            >
              {standalone && !shocks.length ? "Giữ nguyên mọi công cụ" : "Quyết định"}
            </button>
            {standalone && shocks.length > 0 && (
              <button type="button" onClick={() => setV({ rate: 0, spend: 0, sell: 0 })} className="px-3 py-2 rounded-lg border border-line text-sm">
                Đặt lại
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
