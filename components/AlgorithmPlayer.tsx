"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ALGORITHM_BY_ID, type Algorithm, type AlgorithmOption, type CheckStep, type ConclusionStep } from "@/content/algorithms";
import { CASES } from "@/content/cases";
import { INDICATOR_BY_ID } from "@/content/indicators";
import { TREE_BY_ID } from "@/content/trees";
import { layoutAlgorithm, stepMap } from "@/lib/algorithm";
import { formatValue, getSeries, latest } from "@/lib/data";
import { useProgress } from "@/lib/progress";
import RichText from "./RichText";
import SeriesChart from "./SeriesChart";

/** Một chặng đã đi: đứng ở bước nào và đã chọn gì để rời bước đó. */
type Visit = { stepId: string; chosen?: AlgorithmOption };

export default function AlgorithmPlayer({ algorithmId }: { algorithmId: string }) {
  const alg = ALGORITHM_BY_ID[algorithmId];
  const steps = useMemo(() => stepMap(alg), [alg]);
  const [trail, setTrail] = useState<Visit[]>([{ stepId: alg.start }]);
  const { markSeen } = useProgress();

  const here = trail[trail.length - 1];
  const step = steps[here.stepId];
  const lead = trail[trail.length - 2]?.chosen?.lead;
  const done = step.kind === "conclusion";

  useEffect(() => {
    if (done) markSeen(`algorithm:${algorithmId}`);
  }, [done, algorithmId, markSeen]);

  const choose = (o: AlgorithmOption) => {
    setTrail([...trail.slice(0, -1), { stepId: here.stepId, chosen: o }, { stepId: o.next }]);
  };
  const backTo = (i: number) => setTrail([...trail.slice(0, i), { stepId: trail[i].stepId }]);
  const taken = trail.filter((v) => v.chosen);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <header>
        <nav className="text-sm text-muted mb-1" aria-label="Vị trí">
          <Link href="/" className="hover:text-text">Thư viện</Link>
          <span className="mx-1.5" aria-hidden>›</span>
          <span className="text-text">{alg.name}</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{alg.name}</h1>
        <p className="text-muted mt-2 max-w-2xl leading-relaxed">{alg.hint}</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_230px] xl:items-start">
        <section className="xl:order-2 bg-surface border border-line rounded-xl p-5 space-y-4" aria-live="polite">
          {lead && <p className="text-sm text-muted leading-relaxed">{lead}</p>}
          {step.kind === "check" ? (
            <Check key={step.id} step={step} index={trail.length} onChoose={choose} />
          ) : (
            <Conclusion key={step.id} step={step} alg={alg} recaps={taken.map((v) => v.chosen!.recap)} onRestart={() => setTrail([{ stepId: alg.start }])} />
          )}
        </section>

        <aside className="xl:order-1 bg-surface border border-line rounded-xl p-4" aria-label="Đường bạn đã đi">
          <h2 className="text-xs uppercase tracking-wider text-muted mb-2">Đường bạn đã đi</h2>
          {taken.length === 0 ? (
            <p className="text-sm text-muted leading-relaxed">Câu trả lời của bạn sẽ hiện ở đây. Bấm vào một câu để quay lại bước đó.</p>
          ) : (
            <ol className="space-y-1.5">
              {taken.map((v, i) => (
                <li key={v.stepId}>
                  <button type="button" onClick={() => backTo(i)} className="w-full text-left text-sm rounded-md px-2 py-1.5 bg-surface-2 hover:text-accent leading-snug">
                    {v.chosen!.recap}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </aside>

        <aside className="xl:order-3 bg-surface border border-line rounded-xl p-4" aria-label="Vị trí của bạn">
          <h2 className="text-xs uppercase tracking-wider text-muted mb-2">Bạn đang ở đâu</h2>
          <StepMap alg={alg} trail={trail.map((v) => v.stepId)} />
          <p className="text-xs text-muted mt-2">Chấm xanh là đường đã đi, chấm vuông là kết luận.</p>
        </aside>
      </div>
    </div>
  );
}

function Check({ step, index, onChoose }: { step: CheckStep; index: number; onChoose: (o: AlgorithmOption) => void }) {
  const ind = INDICATOR_BY_ID[step.metricId];
  const seriesId = step.seriesId ?? ind.seriesId;
  const label = step.seriesLabel ?? ind.name;
  const s = getSeries(seriesId);
  const last = latest(s);
  return (
    <>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted">Bước {index}</p>
        <h2 className="text-xl font-semibold mt-1">{step.title}</h2>
        <p className="leading-relaxed mt-2">{step.prompt}</p>
      </div>
      {last && (
        <div>
          <p className="text-sm text-muted mb-1">
            {label}, năm {last.year}: <span className="text-text font-medium">{formatValue(last.value, s?.unit)}</span>
          </p>
          <SeriesChart lines={[{ id: seriesId, label }]} height={200} from={2000} />
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {step.options.map((o) => (
          <button key={o.next} type="button" onClick={() => onChoose(o)} className="rounded-lg border border-line px-3 py-2.5 text-left font-medium hover:border-accent hover:text-accent">
            {o.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted leading-relaxed">
        <span className="font-medium text-text">Muốn xem số mới nhất:</span> {step.whereToLook}
      </p>
    </>
  );
}

function Conclusion({ step, alg, recaps, onRestart }: { step: ConclusionStep; alg: Algorithm; recaps: string[]; onRestart: () => void }) {
  const story = step.caseSlug ? CASES.find((c) => c.slug === step.caseSlug) : undefined;
  return (
    <>
      <div>
        <p className="text-xs uppercase tracking-wider text-accent">Kết luận</p>
        <h2 className="text-xl font-semibold mt-1">{step.title}</h2>
        <p className="text-sm text-muted mt-1">Đây là gợi ý để suy nghĩ tiếp, không phải đáp án chắc chắn. Thực tế thường có nhiều nguyên nhân cùng lúc.</p>
      </div>
      <div>
        <h3 className="text-xs uppercase tracking-wider text-muted mb-1.5">Bạn đã thấy</h3>
        <ul className="list-disc pl-4 space-y-0.5 marker:text-muted">{recaps.map((r) => <li key={r}>{r}</li>)}</ul>
      </div>
      <div>
        <h3 className="text-xs uppercase tracking-wider text-muted mb-1.5">Chuyện gì có lẽ đang xảy ra</h3>
        <p className="leading-relaxed"><RichText text={step.story} /></p>
      </div>
      <div>
        <h3 className="text-xs uppercase tracking-wider text-muted mb-1.5">Chính sách có thể làm gì</h3>
        <p className="leading-relaxed">{step.policyView}</p>
      </div>
      <div>
        <h3 className="text-xs uppercase tracking-wider text-muted mb-1.5">Theo dõi gì tiếp</h3>
        <ul className="list-disc pl-4 space-y-0.5 marker:text-muted">{step.watchNext.map((w) => <li key={w}>{w}</li>)}</ul>
      </div>
      {story && (
        <Link href={`/case-study/${story.slug}`} className="block rounded-lg border border-accent bg-accent-soft p-3 hover:opacity-90">
          <span className="block text-xs text-accent font-medium">Chuyện tương tự đã xảy ra ở Việt Nam, {story.period}</span>
          <span className="block font-medium mt-0.5">{story.title}</span>
        </Link>
      )}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <button type="button" onClick={onRestart} className="px-3 py-1.5 rounded-lg bg-accent text-white">Làm lại từ đầu</button>
        {alg.treeId && <Link href={`/cay/${alg.treeId}`} className="text-accent">{TREE_BY_ID[alg.treeId].name}</Link>}
        <Link href={`/ban-do/${alg.mapId}`} className="text-accent">Xem trên bản đồ</Link>
      </div>
    </>
  );
}

function StepMap({ alg, trail }: { alg: Algorithm; trail: string[] }) {
  const pts = useMemo(() => layoutAlgorithm(alg), [alg]);
  const byId = Object.fromEntries(pts.map((p) => [p.id, p]));
  const cols = Math.max(...pts.map((p) => p.x)) + 1;
  const rows = Math.max(...pts.map((p) => p.y)) + 1;
  const W = 200;
  const H = rows * 36;
  const px = (x: number) => 10 + (x * (W - 20)) / Math.max(cols - 1, 1);
  const py = (y: number) => 10 + (y * (H - 20)) / Math.max(rows - 1, 1);
  const visited = new Set(trail);
  const current = trail[trail.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Bạn đang ở bước ${trail.length} của sơ đồ chẩn đoán`}>
      {pts.filter((p) => p.parent).map((p) => {
        const a = byId[p.parent!];
        const on = visited.has(p.id) && visited.has(p.parent!);
        return <line key={p.id} x1={px(a.x)} y1={py(a.y)} x2={px(p.x)} y2={py(p.y)} stroke={on ? "var(--accent)" : "var(--muted)"} strokeOpacity={on ? 1 : 0.35} strokeWidth={on ? 2 : 1} />;
      })}
      {pts.map((p) => {
        const on = visited.has(p.id);
        const fill = on ? "var(--accent)" : "var(--surface-2)";
        const stroke = on ? "var(--accent)" : "var(--muted)";
        const r = p.id === current ? 6.5 : 4;
        return p.kind === "conclusion" ? (
          <rect key={p.id} x={px(p.x) - r} y={py(p.y) - r} width={r * 2} height={r * 2} rx={1.5} fill={fill} stroke={stroke} />
        ) : (
          <circle key={p.id} cx={px(p.x)} cy={py(p.y)} r={r} fill={fill} stroke={stroke} />
        );
      })}
    </svg>
  );
}
