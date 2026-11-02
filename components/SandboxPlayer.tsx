"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SCENARIOS } from "@/content/scenarios";
import { INDICATOR_BY_ID } from "@/content/indicators";
import {
  attribute,
  averageValues,
  checkFired,
  describeShock,
  eventLabel,
  explainQuarter,
  fireRules,
  formatReal,
  GUIDANCE,
  ROUND_PERIODS,
  runGame,
  score,
  toReal,
  type Guidance,
  type Step,
} from "@/lib/game";
import { taylorAdvice } from "@/lib/advisor";
import { useProgress, type Reward } from "@/lib/progress";
import { sandboxScenario, sandboxStep } from "@/lib/sandbox";
import { SANDBOX_XP_CAP, SANDBOX_YEAR_XP } from "@/lib/rewards";
import AdvisorPanel from "./game/AdvisorPanel";
import CustomChoice from "./game/CustomChoice";
import EconomyBoard from "./game/EconomyBoard";
import FiredPanel from "./game/FiredPanel";
import GuidancePicker from "./game/GuidancePicker";
import PlaybackBar from "./game/PlaybackBar";
import QuarterPanel from "./game/QuarterPanel";
import { CountUp, RewardPanel } from "./game/ResultFx";
import YearSummary from "./game/YearSummary";
import SpeakButton, { VoiceBar } from "./game/Speak";
import { narrateChoice, narrateQuarter, whySeen } from "@/lib/narration";
import { prefetch } from "@/lib/speech";

/** Thanh trượt khi tự chỉnh nền kinh tế khởi điểm. */
const SLIDERS = [
  { id: "cpi", label: "Lạm phát", min: 0, max: 15, step: 0.5 },
  { id: "gdp_growth", label: "Tăng trưởng GDP", min: 0, max: 10, step: 0.5 },
  { id: "policy_rate", label: "Lãi suất điều hành", min: 0.5, max: 15, step: 0.5 },
  { id: "fx_rate", label: "Tỷ giá VND/USD", min: 20000, max: 27000, step: 100 },
  { id: "reserves", label: "Dự trữ ngoại hối (tỷ USD)", min: 15, max: 120, step: 5 },
  { id: "public_debt", label: "Nợ công (% GDP)", min: 20, max: 80, step: 1 },
] as const;

type Setup = { base: string; custom: Record<string, number>; fire: boolean; seed: number };

export default function SandboxPlayer() {
  const { recordSandbox, progress, loaded } = useProgress();
  const [setup, setSetup] = useState<Setup>({ base: SCENARIOS[0].id, custom: { ...SCENARIOS[0].baseline }, fire: true, seed: 0 });
  const [playing, setPlaying] = useState<Setup | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [animT, setAnimT] = useState<number | null>(null);
  const [reviewT, setReviewT] = useState<number | null>(null);
  const [guidance, setGuidance] = useState<Guidance>("neutral");
  const [advice, setAdvice] = useState<ReturnType<typeof taylorAdvice> | null>(null);
  const [fired, setFired] = useState<ReturnType<typeof checkFired>>(null);
  const [over, setOver] = useState<{ years: number; reward: Reward; fired: boolean } | null>(null);

  const baseline = useMemo(() => {
    const s = playing ?? setup;
    return s.base === "custom" ? s.custom : SCENARIOS.find((x) => x.id === s.base)!.baseline;
  }, [playing, setup]);
  const scenario = useMemo(() => sandboxScenario(playing?.seed ?? 1, steps.length + 2, baseline, playing?.fire ?? true), [playing, steps.length, baseline]);
  const rules = useMemo(() => fireRules(scenario), [scenario]);

  const year = revealed ? steps.length : steps.length + 1;
  const roundStart = (year - 1) * ROUND_PERIODS;
  const round = scenario.rounds[`s${year}`];
  const { result, periods } = useMemo(() => runGame(scenario, steps), [scenario, steps]);
  const tTarget = revealed ? Math.min(periods, roundStart + ROUND_PERIODS) : roundStart;
  const tView = animT ?? reviewT ?? tTarget;
  const trust = tView === 0 ? 100 : score(averageValues(result, tView), scenario.difficulty).points;
  const att = useMemo(() => attribute(scenario, steps), [scenario, steps]);
  const notes = useMemo(() => (revealed ? explainQuarter(scenario, att, result, tView) : []), [revealed, scenario, att, result, tView]);
  const before = useMemo(() => (revealed ? runGame(scenario, steps.slice(0, -1)).result : null), [revealed, scenario, steps]);
  const attBefore = useMemo(() => (revealed ? attribute(scenario, steps.slice(0, -1)) : null), [revealed, scenario, steps]);
  const last = revealed ? steps.at(-1) : undefined;
  const firedNow = !!fired && revealed && tView >= fired.t;
  const isAnimating = animT !== null;

  // Lời kể từng quý của năm vừa đặt số, tính một lần để đọc và tải trước giọng.
  const quarterTexts = useMemo(() => {
    if (!revealed) return [];
    const st = steps.at(-1)!;
    const intro = narrateChoice(scenario, year, "D", { id: "custom", label: "Tự đặt con số", detail: "", shocks: st.custom ?? [], feedback: "" }, st.guidance, new Set(steps.slice(0, -1).flatMap((x) => (x.custom ?? []).map((c) => c.node))));
    const all = Array.from({ length: tTarget - roundStart + 1 }, (_, q) => explainQuarter(scenario, att, result, roundStart + q));
    return all.map((ns, q) =>
      narrateQuarter(ns, q, {
        intro: q === 0 ? intro : undefined,
        last: roundStart + q >= tTarget,
        year,
        seen: whySeen(all.slice(0, q)),
        outro: fired && roundStart + q >= fired.t ? `Và rồi điều tồi tệ nhất đã đến: ${fired.rule.label.toLowerCase()} hai quý liền. Bạn bị cách chức sau ${year} năm tại vị.` : undefined,
      }),
    );
  }, [revealed, steps, scenario, year, tTarget, roundStart, att, result, fired]);
  const ahead = quarterTexts.join("\u0000");
  useEffect(() => {
    if (ahead) prefetch(ahead.split("\u0000"));
  }, [ahead]);

  const start = () => {
    const seed = setup.seed || Math.floor(Math.random() * 1e6) + 1;
    setSetup({ ...setup, seed });
    setPlaying({ ...setup, seed });
    setSteps([]);
    setRevealed(false);
    setAnimT(null);
    setReviewT(null);
    setFired(null);
    setOver(null);
    setGuidance("neutral");
    setAdvice(null);
  };

  const choose = (custom: Step["custom"]) => {
    const step = sandboxStep(year, custom ?? [], guidance, !!advice);
    const next = [...steps, step];
    setSteps(next);
    setRevealed(true);
    setAnimT(roundStart);
    setReviewT(null);
    setAdvice(null);
    const sc = sandboxScenario(playing!.seed, next.length + 2, baseline, playing!.fire);
    const { result: r, periods: n } = runGame(sc, next);
    setFired(checkFired(sc, r, Math.min(n, roundStart + ROUND_PERIODS)));
  };

  const finishYear = () => setAnimT(null);
  const stepForward = () => {
    if (animT === null) return;
    if (fired && animT >= fired.t) return;
    if (animT >= tTarget) finishYear();
    else setAnimT(animT + 1);
  };
  const end = (years: number, wasFired: boolean) => setOver({ years, reward: recordSandbox(years), fired: wasFired });
  const nextYear = () => {
    setRevealed(false);
    setReviewT(null);
    setGuidance("neutral");
  };

  if (!playing) return <SetupScreen setup={setup} onChange={setSetup} onStart={start} best={loaded ? progress.sandboxBest : 0} />;

  if (over) {
    const n = Math.max(1, Math.min(periods, over.years * ROUND_PERIODS));
    const avgTrust = score(averageValues(result, n), 1).points;
    const data = Array.from({ length: n + 1 }, (_, t) => ({
      t,
      cpi: Math.round(toReal("cpi", scenario.baseline.cpi, result.cpi[t]) * 10) / 10,
      gdp_growth: Math.round(toReal("gdp_growth", scenario.baseline.gdp_growth, result.gdp_growth[t]) * 10) / 10,
    }));
    return (
      <div className="max-w-3xl space-y-4">
        <div className="bg-surface border border-line rounded-xl p-5 space-y-4">
          <div className="text-xs text-muted">{over.fired ? "Bị cách chức" : "Từ nhiệm"} · ván #{playing.seed}</div>
          <div className="flex flex-wrap items-baseline gap-3">
            <CountUp to={over.years} className="text-5xl font-semibold tabular-nums anim-glow" />
            <span className="text-muted">năm tại vị</span>
            <span className="text-sm">
              Tín nhiệm bình quân <b className="font-medium tabular-nums">{avgTrust}</b>/100
            </span>
          </div>
          <p className="text-sm text-muted">
            Kỷ lục của bạn: {Math.max(progress.sandboxBest, over.years)} năm. Mỗi năm trụ được +{SANDBOX_YEAR_XP} XP, chỉ tính phần vượt kỷ lục cũ, tối đa {SANDBOX_XP_CAP} năm.
          </p>
          <RewardPanel reward={over.reward} />
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="var(--grid)" vertical={false} />
                <XAxis dataKey="t" tick={{ fill: "var(--muted)", fontSize: 12 }} stroke="var(--border)" tickFormatter={(k: number) => `Q${k}`} />
                <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} stroke="var(--border)" width={40} unit="%" />
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
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setPlaying(null); setSetup({ ...setup, seed: 0 }); }} className="px-4 py-2 rounded-lg bg-accent text-white">
              Ván mới
            </button>
            <button type="button" onClick={start} className="px-4 py-2 rounded-lg border border-line">
              Chơi lại đúng ván #{playing.seed}
            </button>
            <Link href="/thu-thach" className="px-4 py-2 rounded-lg border border-line">
              Về bản đồ chiến dịch
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <VoiceBar />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="px-2.5 py-1 rounded-full bg-accent-soft text-accent tabular-nums">Năm {year}</span>
        <span className="text-muted">Ván #{playing.seed}</span>
        <span className="text-muted">Kỷ lục: {progress.sandboxBest} năm</span>
        {!revealed && steps.length > 0 && (
          <button type="button" onClick={() => end(steps.length, false)} className="ml-auto px-3 py-1.5 rounded-lg border border-line">
            Từ nhiệm (giữ {steps.length} năm)
          </button>
        )}
      </div>

      <div className="grid xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-5">
        <div className="space-y-4">
          <div className="bg-surface border border-line rounded-xl p-5 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-semibold">{round.title}</h2>
              <SpeakButton id={`sandbox-${year}`} auto={!revealed} text={`Năm ${year}. ${round.title}. ${round.story}`} />
            </div>
            <p className="leading-relaxed">{round.story}</p>
            {round.event.length > 0 && (
              <ul className="text-xs tabular-nums text-muted space-y-0.5">
                {round.event.map((e, k) => (
                  <li key={k}>• {describeShock(scenario, e)}</li>
                ))}
              </ul>
            )}
          </div>

          {!revealed && (
            <div className="space-y-2">
              <button type="button" onClick={() => setAdvice(taylorAdvice(scenario, result, roundStart))} disabled={!!advice} className="px-3 py-1.5 rounded-lg border border-line text-sm hover:border-accent disabled:opacity-60">
                🧑‍💼 Hỏi cố vấn
              </button>
              {advice && <AdvisorPanel advice={advice} onClose={() => setAdvice(null)} />}
              <GuidancePicker value={guidance} onChange={setGuidance} />
              <CustomChoice key={year} scenario={scenario} onSubmit={choose} standalone />
            </div>
          )}

          {last && (
            <div className="rounded-xl p-5 space-y-3 border border-accent bg-accent-soft">
              <div className="text-xs font-medium text-accent">Năm {year} · Quyết định của bạn</div>
              <ul className="text-sm tabular-nums space-y-0.5">
                {(last.custom ?? []).length ? (last.custom ?? []).map((sh, j) => <li key={j}>• {describeShock(scenario, sh)}</li>) : <li>• Giữ nguyên mọi công cụ</li>}
                {last.guidance && last.guidance !== "neutral" && <li>🎙️ Phát ngôn: {GUIDANCE[last.guidance].label}</li>}
              </ul>
              {isAnimating && !firedNow && (
                <PlaybackBar q={tView - roundStart} last={tView >= tTarget} onBack={() => animT !== null && animT > roundStart && setAnimT(animT - 1)} onStep={stepForward} onSkip={() => (fired ? setAnimT(fired.t) : finishYear())} />
              )}
            </div>
          )}

          {revealed && (isAnimating || reviewT !== null) && (
            <QuarterPanel
              notes={notes}
              q={tView - roundStart}
              year={year}
              story={eventLabel(round)}
              choice="Tự đặt con số"
              narration={quarterTexts[tView - roundStart]}
            />
          )}

          {firedNow && fired && (
            <FiredPanel rule={fired.rule} real={fired.real} year={year} quarter={fired.t - roundStart}>
              <button type="button" onClick={() => end(year - 1, true)} className="px-4 py-2 rounded-lg bg-accent text-white">
                Xem tổng kết nhiệm kỳ ({year - 1} năm trọn vẹn)
              </button>
            </FiredPanel>
          )}

          {last && !isAnimating && !fired && before && attBefore && (
            <YearSummary
              next={`Bấm sang năm ${year + 1} để nghe tiếp, hoặc từ nhiệm nếu đã đủ.`}
              scenario={scenario}
              year={year}
              before={before}
              after={result}
              attBefore={attBefore}
              attAfter={att}
              t0={roundStart}
              t1={Math.min(periods, roundStart + ROUND_PERIODS)}
              feedback={`Ở chế độ tự do không có lời nhận xét dựng sẵn. Đọc bảng trên để thấy năm nay phần nào do biến cố "${eventLabel(round)}", phần nào do quyết định của bạn.`}
              reviewQ={reviewT === null ? null : reviewT - roundStart}
              onReview={(q) => setReviewT(q === null ? null : roundStart + q)}
              onReplay={() => {
                setReviewT(null);
                setAnimT(roundStart);
              }}
            >
              <button type="button" onClick={nextYear} className="px-4 py-2 rounded-lg bg-accent text-white">
                Sang năm {year + 1} →
              </button>
            </YearSummary>
          )}
        </div>

        <EconomyBoard scenario={scenario} result={result} tView={tView} trust={trust} round={round} myShocks={last?.custom} rules={playing.fire ? rules : []} />
      </div>
    </div>
  );
}

function SetupScreen({ setup, onChange, onStart, best }: { setup: Setup; onChange: (s: Setup) => void; onStart: () => void; best: number }) {
  const pickBase = (id: string) => {
    const sc = SCENARIOS.find((x) => x.id === id);
    onChange({ ...setup, base: id, custom: sc ? { ...setup.custom, ...sc.baseline } : setup.custom });
  };
  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] gap-6 max-w-5xl">
      <div className="space-y-4">
        <div className="bg-surface border border-line rounded-xl p-5 space-y-3">
          <h2 className="font-semibold">Nền kinh tế khởi điểm</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pickBase(s.id)}
                aria-pressed={setup.base === s.id}
                className={`text-left rounded-lg border p-3 text-sm ${setup.base === s.id ? "border-accent bg-accent-soft" : "border-line"}`}
              >
                <div className="font-medium">Như {s.title.toLowerCase()}</div>
                <div className="text-xs text-muted">{s.period}</div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => onChange({ ...setup, base: "custom" })}
              aria-pressed={setup.base === "custom"}
              className={`text-left rounded-lg border p-3 text-sm ${setup.base === "custom" ? "border-accent bg-accent-soft" : "border-line"}`}
            >
              <div className="font-medium">🎛️ Tự chỉnh</div>
              <div className="text-xs text-muted">Kéo thanh trượt bên dưới</div>
            </button>
          </div>
          {setup.base === "custom" && (
            <div className="space-y-3 pt-2">
              {SLIDERS.map((sl) => (
                <label key={sl.id} className="block text-sm">
                  <span className="flex justify-between">
                    <span>{sl.label}</span>
                    <span className="tabular-nums text-accent">{formatReal(sl.id, setup.custom[sl.id] ?? sl.min)}</span>
                  </span>
                  <input
                    type="range"
                    min={sl.min}
                    max={sl.max}
                    step={sl.step}
                    value={setup.custom[sl.id] ?? sl.min}
                    onChange={(e) => onChange({ ...setup, custom: { ...setup.custom, [sl.id]: Number(e.target.value) } })}
                    className="w-full"
                  />
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-surface border border-line rounded-xl p-5 space-y-3 text-sm">
          <h2 className="font-semibold">Luật chơi</h2>
          <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
            <li>Mỗi năm một biến cố ngẫu nhiên, lấy từ các kịch bản thật, có khi mạnh hơn, có khi nhẹ hơn. Cũng có năm yên ả.</li>
            <li>Bạn tự đặt con số cho lãi suất, chi tiêu công, bán đô la, và chọn giọng phát ngôn.</li>
            <li>Không có sao. Mục tiêu là trụ được càng nhiều năm càng tốt. Muốn dừng lúc nào thì bấm Từ nhiệm.</li>
          </ul>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={setup.fire} onChange={(e) => onChange({ ...setup, fire: e.target.checked })} />
            <span>Có thể bị cách chức (lạm phát phi mã, suy thoái, cạn dự trữ)</span>
          </label>
          <label className="block">
            <span className="text-xs text-muted">Số ván (để trống là ngẫu nhiên; nhập lại số cũ để chơi lại đúng chuỗi biến cố)</span>
            <input
              type="number"
              min={0}
              value={setup.seed || ""}
              placeholder="ngẫu nhiên"
              onChange={(e) => onChange({ ...setup, seed: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-1.5 tabular-nums"
            />
          </label>
          <p className="text-xs text-muted">Kỷ lục của bạn: {best} năm.</p>
        </div>
        <button type="button" onClick={onStart} className="w-full px-4 py-3 rounded-xl bg-accent text-white font-medium">
          Nhậm chức
        </button>
      </div>
    </div>
  );
}
