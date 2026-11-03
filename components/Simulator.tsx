"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CartesianGrid, Legend, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CASES } from "@/content/cases";
import { STORY_BY_PRESET, type SimStep } from "@/content/simStories";
import { INDICATORS, INDICATOR_BY_ID } from "@/content/indicators";
import { SIM_LINKS, linkKey } from "@/content/links";
import { lowerFirst } from "@/lib/data";
import { explainStep, level, PRESETS, simulate, type Preset, type StepEvent } from "@/lib/simulate";
import MacroGraph, { GraphLegend, type NodeState } from "./MacroGraph";
import { SignChip } from "./MetricPanel";

const PERIODS = 12;
// Mỗi kỳ dừng lại đủ lâu để kịp đọc thẻ nào vừa đổi.
const SPEEDS = { cham: { label: "Chậm", ms: 3000 }, vua: { label: "Vừa", ms: 1800 }, nhanh: { label: "Nhanh", ms: 900 } } as const;
const IDS = INDICATORS.filter((i) => !i.concept).map((i) => i.id);
const LINE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--g-ben-ngoai)"];
/** Dưới ngưỡng này coi như chưa bị ảnh hưởng (đơn vị cú sốc) */
const MIN = 0.01;
/** Số thẻ được gắn nhãn "Vừa đổi" mỗi bước, để mắt biết nhìn vào đâu mà không rối */
const BADGES = 3;

export default function Simulator() {
  const params = useSearchParams();
  const initial = PRESETS.find((p) => p.id === params.get("preset")) ?? PRESETS[0];
  const [presetId, setPresetId] = useState(initial.id);
  const [mode, setMode] = useState<"story" | "quarter">(params.get("che-do") === "quy" || params.has("t") ? "quarter" : "story");
  const initialT = Math.max(0, Math.min(PERIODS, Number(params.get("t")) || 0));

  const preset = PRESETS.find((p) => p.id === presetId)!;
  const result = useMemo(() => simulate(SIM_LINKS, IDS, { node: preset.node, size: preset.size }, PERIODS), [preset]);
  const maxAbs = useMemo(() => Math.max(...IDS.filter((i) => i !== preset.node).flatMap((i) => result[i].map(Math.abs)), MIN), [result, preset]);
  const story = STORY_BY_PRESET[preset.id];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Mô phỏng &ldquo;nếu… thì&rdquo;</h1>
        <p className="text-sm text-muted mt-1 max-w-3xl">
          Chọn một cú sốc, rồi đọc từng bước xem tác động lan qua nền kinh tế thế nào. Đây là mô hình giáo khoa: nó cho biết chiều tác động và mạnh hay nhẹ, không dự báo con số.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPresetId(p.id)}
            className={`text-sm px-3 py-1.5 rounded-full border ${p.id === presetId ? "border-accent text-accent bg-accent-soft font-medium" : "border-line text-muted hover:text-text"}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="inline-flex rounded-lg border border-line overflow-hidden text-sm" role="tablist" aria-label="Cách xem">
        {(
          [
            ["story", "Câu chuyện"],
            ["quarter", "Từng quý (nâng cao)"],
          ] as const
        ).map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => setMode(k)} className={`px-3 py-1.5 ${mode === k ? "bg-accent-soft text-accent font-medium" : "text-muted hover:text-text"}`}>
            {label}
          </button>
        ))}
      </div>

      {mode === "story" && story ? (
        <StoryView key={preset.id} preset={preset} steps={story.steps} result={result} maxAbs={maxAbs} onAdvanced={() => setMode("quarter")} initialStep={preset.id === initial.id ? (Number(params.get("buoc")) || 1) - 1 : 0} />
      ) : (
        <QuarterView key={preset.id} preset={preset} result={result} maxAbs={maxAbs} initialT={preset.id === initial.id ? initialT : 0} />
      )}
    </div>
  );
}

type SimResult = Record<string, number[]>;

/** Trình bày như case study: chữ bên trái, biểu đồ và bản đồ nhỏ của đúng bước đó bên phải. */
function StoryView({ preset, steps, result, maxAbs, onAdvanced, initialStep = 0 }: { preset: Preset; steps: SimStep[]; result: SimResult; maxAbs: number; onAdvanced: () => void; initialStep?: number }) {
  const [i, setI] = useState(Math.max(0, Math.min(steps.length - 1, initialStep)));
  const step = steps[i];
  const last = i === steps.length - 1;
  const [a, b] = step.periods;
  const nodes = [...new Set([...step.nodes, ...step.links.flat()])];
  const links = new Set(step.links.map(([from, to]) => linkKey({ from, to })));
  const cases = CASES.filter((c) => c.simulatePreset === preset.id);

  const nodeState: Record<string, NodeState> = {};
  for (const id of nodes) {
    const v = result[id][b];
    if (id === preset.node) {
      nodeState[id] = { value: v > 0 ? "↑ Tăng" : "↓ Giảm", note: "Cú sốc ban đầu", good: null, intensity: Math.sign(v), badge: { text: "Điểm bắt đầu", tone: "you" } };
    } else if (Math.abs(v) < MIN) {
      nodeState[id] = { value: "Chưa đổi", note: "Tác động chưa lan tới", good: null, intensity: 0 };
    } else {
      nodeState[id] = { value: level(v / maxAbs).text, note: b === 0 ? "" : `sau khoảng ${b} quý`, good: null, intensity: v / maxAbs };
    }
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-6">
      <div className="space-y-4">
        <div className="flex gap-1.5" role="tablist" aria-label="Các bước">
          {steps.map((s, k) => (
            <button key={k} type="button" role="tab" aria-selected={k === i} onClick={() => setI(k)} className={`h-1.5 flex-1 rounded-full ${k <= i ? "bg-accent" : "bg-surface-2"}`} title={s.title} />
          ))}
        </div>
        <div className="text-xs text-muted">
          Bước {i + 1}/{steps.length} · {a === b ? (a === 0 ? "ngay lúc cú sốc xảy ra" : `khoảng quý ${a}`) : `khoảng quý ${a}–${b}`}
        </div>
        <h2 className="text-xl font-semibold">{step.title}</h2>
        {step.body.map((p, k) => (
          <p key={k} className="leading-relaxed">
            {p}
          </p>
        ))}
        {step.links.length > 0 && (
          <details className="text-sm rounded-lg border border-line px-3 py-2">
            <summary className="cursor-pointer font-medium">Các mũi tên trong bước này ({step.links.length})</summary>
            <ul className="mt-2 space-y-2">
              {step.links.map(([from, to]) => {
                const l = SIM_LINKS.find((x) => x.from === from && x.to === to)!;
                return (
                  <li key={from + to}>
                    <div className="flex items-center gap-2 font-medium">
                      <SignChip sign={l.sign} />
                      {INDICATOR_BY_ID[from].name} → {INDICATOR_BY_ID[to].name}
                    </div>
                    <p className="text-muted text-xs leading-relaxed mt-0.5 ml-7">{l.mechanism}</p>
                  </li>
                );
              })}
            </ul>
          </details>
        )}
        <div className="flex gap-2 pt-2">
          <button type="button" disabled={i === 0} onClick={() => setI(i - 1)} className="px-4 py-2 rounded-lg border border-line disabled:opacity-40">
            Trước
          </button>
          {!last ? (
            <button type="button" onClick={() => setI(i + 1)} className="px-4 py-2 rounded-lg bg-accent text-white">
              Tiếp
            </button>
          ) : (
            <button type="button" onClick={onAdvanced} className="px-4 py-2 rounded-lg border border-accent text-accent">
              Xem chi tiết từng quý
            </button>
          )}
        </div>
        {last && cases.length > 0 && (
          <div className="rounded-lg bg-surface-2 p-3 text-sm space-y-1">
            <div className="font-medium">Chuyện này đã xảy ra thật ở Việt Nam</div>
            {cases.map((c) => (
              <Link key={c.slug} href={`/case-study/${c.slug}`} className="block text-accent">
                {c.period}: {c.title} →
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-4 min-w-0">
        <ResponseChart result={result} ids={step.lines} maxAbs={maxAbs} range={[a, b]} height={240} />
        <MacroGraph visibleIds={nodes} nodeState={nodeState} highlightLinks={links} selectedNode={nodes.includes(preset.node) ? preset.node : null} height={420} />
        <p className="text-xs text-muted">Màu cam: tăng, xanh: giảm. Màu càng đậm, tác động càng mạnh so với các chỉ số khác trong mô phỏng này.</p>
      </div>
    </div>
  );
}

/** Đường phản ứng theo quý so với lúc chưa có cú sốc. Trục dọc chỉ ghi tăng / giảm vì con số là đơn vị tương đối. */
function ResponseChart({ result, ids, maxAbs, current, range, height = 260 }: { result: SimResult; ids: string[]; maxAbs: number; current?: number; range?: [number, number]; height?: number }) {
  const data = Array.from({ length: PERIODS + 1 }, (_, k) => {
    const row: Record<string, number> = { t: k };
    for (const id of ids) row[id] = Math.round(result[id][k] * 1000) / 1000;
    return row;
  });
  const max = Math.max(MIN, ...ids.flatMap((id) => result[id].map(Math.abs)));
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <h2 className="font-semibold text-sm">Phản ứng theo thời gian</h2>
      <p className="text-xs text-muted mb-2">
        Trên đường 0 là tăng, dưới là giảm so với lúc chưa có cú sốc. Mỗi kỳ khoảng một quý.{range ? " Vùng tô màu là giai đoạn của bước này." : " Đường đứt là kỳ đang xem."}
      </p>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: "var(--muted)", fontSize: 12 }} stroke="var(--border)" tickFormatter={(k: number) => `Q${k}`} />
            <YAxis
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              stroke="var(--border)"
              width={48}
              domain={[-max * 1.1, max * 1.1]}
              ticks={[-max, 0, max]}
              tickFormatter={(v: number) => (v > 0 ? "tăng ↑" : v < 0 ? "giảm ↓" : "0")}
            />
            <ReferenceLine y={0} stroke="var(--border)" />
            {range && <ReferenceArea x1={range[0]} x2={Math.max(range[1], range[0] + 0.3)} fill="var(--accent)" fillOpacity={0.12} />}
            {current !== undefined && <ReferenceLine x={current} stroke="var(--accent)" strokeDasharray="4 4" />}
            <Tooltip
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
              labelFormatter={(k) => `Quý ${k}`}
              formatter={(v, id) => [level((v as number) / maxAbs).text, INDICATOR_BY_ID[id as string].name]}
            />
            <Legend formatter={(id) => <span style={{ color: "var(--text)", fontSize: 12 }}>{INDICATOR_BY_ID[id as string].name}</span>} />
            {ids.map((id, k) => (
              <Line key={id} dataKey={id} stroke={LINE_COLORS[k % LINE_COLORS.length]} strokeWidth={2} dot={false} isAnimationActive={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Chế độ nâng cao: đi từng quý, thấy mọi chỉ số bị lan tới. */
function QuarterView({ preset, result, maxAbs, initialT }: { preset: Preset; result: SimResult; maxAbs: number; initialT: number }) {
  const [t, setT] = useState(initialT);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<keyof typeof SPEEDS>("cham");
  const [watch, setWatch] = useState<string[]>(["gdp_growth", "cpi", "credit"]);

  // Chỉ vẽ những thẻ cú sốc lan tới trong cả 12 kỳ. Tập này cố định theo cú sốc nên bố cục không nhảy mỗi bước.
  const visibleIds = useMemo(() => IDS.filter((id) => id === preset.node || result[id].some((v) => Math.abs(v) >= MIN)), [result, preset]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setT((x) => {
        if (x >= PERIODS) {
          setPlaying(false);
          return x;
        }
        return x + 1;
      });
    }, SPEEDS[speed].ms);
    return () => clearInterval(timer);
  }, [playing, speed]);

  const events = useMemo(() => explainStep(result, SIM_LINKS, t, preset.node, MIN), [result, t, preset]);

  const nodeState = useMemo(() => {
    const out: Record<string, NodeState> = {};
    const fresh = new Set(events.slice(0, BADGES).map((e) => e.id));
    const byId = new Map(events.map((e) => [e.id, e]));
    for (const id of visibleIds) {
      const v = result[id][t];
      if (id === preset.node) {
        out[id] = { value: v > 0 ? "↑ Tăng" : "↓ Giảm", note: "Cú sốc ban đầu, giữ suốt mô phỏng", good: null, intensity: Math.sign(v), badge: { text: "Điểm bắt đầu", tone: "you" } };
        continue;
      }
      if (Math.abs(v) < MIN) {
        out[id] = { value: "Chưa đổi", note: "Tác động chưa lan tới", good: null, intensity: 0 };
        continue;
      }
      const e = byId.get(id);
      out[id] = {
        value: level(v / maxAbs).text,
        note: e ? TREND_NOTE[e.trend] : "Giữ nguyên như kỳ trước",
        good: null,
        intensity: v / maxAbs,
        badge: fresh.has(id) ? { text: "Vừa đổi", tone: "event" } : undefined,
      };
    }
    return out;
  }, [result, t, preset, maxAbs, events, visibleIds]);

  // Sáng lên: các thẻ đang bị ảnh hưởng, và đúng những mũi tên vừa đẩy thay đổi ở kỳ này.
  const highlight = useMemo(() => {
    const nodes = new Set(visibleIds.filter((id) => id === preset.node || Math.abs(result[id][t]) >= MIN));
    const links = new Set(events.flatMap((e) => (e.driver ? [linkKey(e.driver.link)] : [])));
    return { nodes, links };
  }, [visibleIds, result, t, preset, events]);

  const toggleWatch = (id: string) => setWatch((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id].slice(-4)));

  const go = (k: number) => {
    setPlaying(false);
    setT(Math.max(0, Math.min(PERIODS, k)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <MacroGraph
            nodeState={nodeState}
            visibleIds={visibleIds}
            highlightNodes={highlight.nodes}
            highlightLinks={highlight.links}
            selectedNode={preset.node}
            onNodeClick={toggleWatch}
            height="max(520px, calc(100vh - 300px))"
          />
          <GraphLegend mode="sim" />
          <p className="text-xs text-muted">
            Chỉ hiện {visibleIds.length} chỉ số mà cú sốc này lan tới. Thẻ mờ là chưa bị ảnh hưởng ở kỳ này. Bấm vào một thẻ để thêm hoặc bỏ nó khỏi biểu đồ bên dưới (tối đa 4).
          </p>
        </div>

        <aside className="xl:w-[380px] shrink-0 bg-surface border border-line rounded-xl p-5 space-y-4 self-start xl:sticky xl:top-4">
          <div>
            <div className="text-xs text-muted">{preset.description}</div>
            <h2 className="font-semibold text-lg mt-1">
              Kỳ {t} <span className="text-muted font-normal text-sm">· {t === 0 ? "ngay lúc cú sốc xảy ra" : `khoảng ${t} quý sau`}</span>
            </h2>
            <div className="h-1 bg-surface-2 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-accent transition-all" style={{ width: `${(t / PERIODS) * 100}%` }} />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => go(t - 1)} disabled={t === 0} className="px-3 py-2 rounded-lg border border-line text-sm disabled:opacity-40">
              ◀ Bước trước
            </button>
            <button type="button" onClick={() => go(t + 1)} disabled={t === PERIODS} className="flex-1 px-3 py-2 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-40">
              Bước tiếp ▶
            </button>
          </div>

          <Story t={t} events={events} presetNode={preset.node} presetUp={preset.size > 0} maxAbs={maxAbs} />

          {t === PERIODS && <Summary result={result} ids={watch.filter((id) => id !== preset.node)} maxAbs={maxAbs} />}

          <details className="text-sm border-t border-line pt-3">
            <summary className="cursor-pointer text-muted">Tự chạy, tua nhanh</summary>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  if (t >= PERIODS) setT(0);
                  setPlaying((p) => !p);
                }}
                className="px-3 py-1 rounded-md border border-line hover:border-accent"
              >
                {playing ? "Dừng" : "Tự chạy"}
              </button>
              <div className="inline-flex rounded-md border border-line overflow-hidden" role="group" aria-label="Tốc độ chạy">
                {(Object.keys(SPEEDS) as (keyof typeof SPEEDS)[]).map((k) => (
                  <button key={k} type="button" onClick={() => setSpeed(k)} className={`px-2 py-1 text-xs ${speed === k ? "bg-accent-soft text-accent" : "text-muted hover:text-text"}`}>
                    {SPEEDS[k].label}
                  </button>
                ))}
              </div>
              <input type="range" min={0} max={PERIODS} step={1} value={t} onChange={(e) => go(Number(e.target.value))} className="w-full" aria-label="Kỳ" />
            </div>
          </details>

          <p className="text-xs text-muted leading-relaxed">
            &ldquo;Nhẹ / vừa / mạnh&rdquo; so với chỉ số bị tác động nhiều nhất trong mô phỏng này. Mô hình bỏ qua kỳ vọng, niềm tin thị trường và các chính sách khác diễn ra cùng lúc.
          </p>
        </aside>
      </div>

      <ResponseChart result={result} ids={watch} maxAbs={maxAbs} current={t} />
    </div>
  );
}

const TREND_NOTE: Record<StepEvent["trend"], string> = {
  new: "Vừa bắt đầu bị ảnh hưởng",
  stronger: "Tác động đang mạnh lên",
  weaker: "Tác động đang dịu bớt",
  flip: "Vừa đổi chiều",
};

const SHOWN = 5;

function Story({ t, events, presetNode, presetUp, maxAbs }: { t: number; events: StepEvent[]; presetNode: string; presetUp: boolean; maxAbs: number }) {
  const shock = INDICATOR_BY_ID[presetNode];
  if (t === 0) {
    return (
      <div className="text-sm leading-relaxed rounded-lg bg-accent-soft p-3 space-y-1.5">
        <p>
          <b className="font-medium">{shock.name}</b> {presetUp ? "tăng" : "giảm"}. Đây là điểm bắt đầu.
        </p>
        <p className="text-muted">Chưa chỉ số nào khác thay đổi: tác động cần thời gian để đi qua các mũi tên. Bấm &ldquo;Bước tiếp&rdquo; để xem quý sau.</p>
      </div>
    );
  }
  if (!events.length) {
    return <p className="text-sm text-muted leading-relaxed">Kỳ này không có gì thay đổi đáng kể. Các chỉ số giữ nguyên mức của kỳ trước.</p>;
  }
  const rest = events.length - SHOWN;
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Chuyện gì vừa xảy ra?</h3>
      <ol className="space-y-2">
        {events.slice(0, SHOWN).map((e) => (
          <EventItem key={e.id} e={e} maxAbs={maxAbs} />
        ))}
      </ol>
      {rest > 0 && <p className="text-xs text-muted">và {rest} thay đổi nhỏ khác.</p>}
    </div>
  );
}

function EventItem({ e, maxAbs }: { e: StepEvent; maxAbs: number }) {
  const name = INDICATOR_BY_ID[e.id].name;
  const dir = e.v > 0 ? "tăng" : "giảm";
  const head =
    e.trend === "new" ? `${name} bắt đầu ${dir}` : e.trend === "stronger" ? `${name} ${dir} thêm` : e.trend === "weaker" ? `${name} bớt ${dir}` : `${name} đổi chiều, giờ ${dir}`;
  const lv = level(e.v / maxAbs);
  const d = e.driver;
  return (
    <li className="rounded-lg border border-line px-3 py-2 text-sm">
      <div className="flex items-start gap-2">
        <span className="flex-1 font-medium leading-snug">{head}</span>
        <span className="shrink-0 text-xs px-1.5 py-0.5 rounded tabular-nums" style={{ background: "var(--surface-2)", color: e.v > 0 ? "var(--chart-2)" : "var(--chart-1)" }}>
          {lv.text}
        </span>
      </div>
      {d && (
        <details className="mt-1">
          <summary className="cursor-pointer text-xs text-muted list-none flex items-center gap-1.5">
            <SignChip sign={d.link.sign} />
            <span>
              vì {lowerFirst(INDICATOR_BY_ID[d.link.from].name)} {d.from > 0 ? "↑" : "↓"} {d.link.lag > 1 ? `từ ${d.link.lag} quý trước` : "quý trước"}
              {e.others > 0 && `, cùng ${e.others} tác động khác`}
              <span className="text-accent"> · vì sao?</span>
            </span>
          </summary>
          <p className="text-xs leading-relaxed mt-1.5 pl-7">{d.link.mechanism}</p>
        </details>
      )}
    </li>
  );
}

function Summary({ result, ids, maxAbs }: { result: Record<string, number[]>; ids: string[]; maxAbs: number }) {
  if (!ids.length) return null;
  return (
    <div className="text-sm rounded-lg bg-surface-2 p-3 leading-relaxed">
      <b className="font-medium">Sau khoảng 3 năm:</b>{" "}
      {ids.map((id, k) => (
        <span key={id}>
          {k > 0 && ", "}
          {INDICATOR_BY_ID[id].name} {lowerFirst(level(result[id][PERIODS] / maxAbs).text)}
        </span>
      ))}
      .
    </div>
  );
}
