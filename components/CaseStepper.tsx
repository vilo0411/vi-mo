"use client";

import Link from "next/link";
import { useState } from "react";
import type { CaseStudy } from "@/content/cases";
import { linkKey } from "@/content/links";
import { PRESETS } from "@/lib/simulate";
import MacroGraph from "./MacroGraph";
import SeriesChart from "./SeriesChart";

export default function CaseStepper({ study }: { study: CaseStudy }) {
  const [i, setI] = useState(0);
  const step = study.steps[i];
  const links = new Set(step.links.map(([from, to]) => linkKey({ from, to })));
  const nodes = new Set([...step.nodes, ...step.links.flat()]);
  const preset = PRESETS.find((p) => p.id === study.simulatePreset);
  const [y0, y1] = step.years;

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-6">
        <div className="space-y-4">
          <div className="flex gap-1.5" role="tablist" aria-label="Các bước">
            {study.steps.map((s, k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={k === i}
                onClick={() => setI(k)}
                className={`h-1.5 flex-1 rounded-full ${k <= i ? "bg-accent" : "bg-surface-2"}`}
                title={s.title}
              />
            ))}
          </div>
          <div className="text-xs text-muted">
            Bước {i + 1}/{study.steps.length}
          </div>
          <h2 className="text-xl font-semibold">{step.title}</h2>
          {step.body.map((p, k) => (
            <p key={k} className="leading-relaxed">
              {p}
            </p>
          ))}
          <div className="flex gap-2 pt-2">
            <button type="button" disabled={i === 0} onClick={() => setI(i - 1)} className="px-4 py-2 rounded-lg border border-line disabled:opacity-40">
              Trước
            </button>
            {i < study.steps.length - 1 ? (
              <button type="button" onClick={() => setI(i + 1)} className="px-4 py-2 rounded-lg bg-accent text-white">
                Tiếp
              </button>
            ) : (
              <a href="#cau-hoi" className="px-4 py-2 rounded-lg bg-accent text-white">
                Câu hỏi tự kiểm tra
              </a>
            )}
          </div>
        </div>
        <div className="space-y-4 min-w-0">
          <div className="bg-surface border border-line rounded-xl p-4">
            <SeriesChart lines={step.chart} height={240} highlight={[y0, y1]} from={Math.max(1995, y0 - 6)} to={Math.min(y1 + 4, 2025)} />
          </div>
          <MacroGraph visibleIds={[...nodes]} highlightLinks={links} height={420} />
        </div>
      </div>

      <section id="cau-hoi" className="max-w-3xl space-y-3 scroll-mt-6">
        <h2 className="text-xl font-semibold">Câu hỏi tự kiểm tra</h2>
        <p className="text-sm text-muted">Tự trả lời trước rồi mới mở đáp án.</p>
        {study.questions.map((q, k) => (
          <details key={k} className="bg-surface border border-line rounded-xl p-4 group">
            <summary className="cursor-pointer font-medium list-none flex gap-2">
              <span className="text-muted group-open:rotate-90 transition-transform">›</span>
              {q.q}
            </summary>
            <p className="mt-3 leading-relaxed text-sm">{q.a}</p>
          </details>
        ))}
      </section>

      {preset && (
        <section className="max-w-3xl bg-surface border border-line rounded-xl p-5 space-y-2">
          <h2 className="text-lg font-semibold">So mô hình với thực tế</h2>
          <p className="text-sm leading-relaxed">{study.simulateNote}</p>
          <Link href={`/mo-phong?preset=${preset.id}`} className="inline-block text-sm text-accent">
            Chạy mô phỏng &ldquo;{preset.label}&rdquo; →
          </Link>
        </section>
      )}

      <section className="max-w-3xl">
        <h2 className="text-sm font-medium mb-1">Nguồn</h2>
        <ul className="text-sm text-muted space-y-0.5">
          {study.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer" className="hover:text-text underline underline-offset-2">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
