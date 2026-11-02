"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { INDICATOR_BY_ID } from "@/content/indicators";
import { CASE_BY_SLUG } from "@/content/cases";
import type { Choice, Round, Scenario } from "@/content/scenarios";
import {
  allPlaythroughs,
  attribute,
  averageValues,
  checkFired,
  CUSTOM,
  describeShock,
  eventLabel,
  explainQuarter,
  finalResult,
  fireRules,
  formatReal,
  GUIDANCE,
  guidanceShocks,
  talkPreview,
  nearestChoice,
  ROUND_PERIODS,
  runGame,
  score,
  storyFor,
  type Guidance,
  type Step,
} from "@/lib/game";
import { bestContinuation, expertPath, stepLabels, taylorAdvice } from "@/lib/advisor";
import { buildQuiz } from "@/lib/quiz";
import { narrateChoice, narrateEvent, narrateQuarter, whySeen } from "@/lib/narration";
import { useProgress, type Reward } from "@/lib/progress";
import AdvisorPanel from "./game/AdvisorPanel";
import Briefing from "./game/Briefing";
import ExpertCompare from "./game/ExpertCompare";
import FiredPanel from "./game/FiredPanel";
import GuidancePicker from "./game/GuidancePicker";
import Hint from "./game/Hint";
import Quiz from "./game/Quiz";
import CustomChoice from "./game/CustomChoice";
import EconomyBoard from "./game/EconomyBoard";
import PlaybackBar from "./game/PlaybackBar";
import QuarterPanel from "./game/QuarterPanel";
import { Confetti, CountUp, PopStars, RewardPanel } from "./game/ResultFx";
import YearSummary, { yearNarration } from "./game/YearSummary";
import EffectList from "./game/EffectList";
import SpeakButton, { VoiceBar } from "./game/Speak";
import { prefetch } from "@/lib/speech";

const LETTERS = ["A", "B", "C", "D"];

/** Lựa chọn của một bước, kể cả khi người chơi tự đặt con số. */
/** Lời kể đầu năm: câu chuyện, sự kiện là gì và sẽ kéo nền kinh tế đi đâu, câu hỏi và các phương án. */
function storyNarration(round: Round, story: string[], idx: number, withChoices: boolean) {
  return [
    `Năm ${idx + 1}. ${round.title}.`,
    ...story.map((p, k) => (k > 0 ? `Hậu quả từ năm trước: ${p}` : p)),
    ...(withChoices ? [narrateEvent(round.event), round.question, ...round.choices.map((c, k) => `Phương án ${LETTERS[k]}: ${c.label}. ${c.detail}`)] : []),
  ].join(" ");
}

const firedOutro = (label: string) =>
  `Và rồi điều tồi tệ nhất đã đến: ${label.toLowerCase()} hai quý liền. Quốc hội và thị trường mất kiên nhẫn, bạn bị cách chức. Nhiệm kỳ dừng ở đây.`;

function choiceOf(scenario: Scenario, step: Step): Choice {
  const round = scenario.rounds[step.roundId];
  if (step.choiceId !== CUSTOM) return round.choices.find((c) => c.id === step.choiceId)!;
  const near = nearestChoice(round, step.custom ?? []);
  return {
    id: CUSTOM,
    label: "Tự đặt con số",
    detail: "",
    shocks: step.custom ?? [],
    next: step.next,
    feedback: `Lựa chọn của bạn gần nhất với phương án "${near.label}". ${near.feedback}`,
  };
}

export default function GamePlayer({ scenario }: { scenario: Scenario }) {
  const [started, setStarted] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [revealed, setRevealed] = useState(false);
  // Kỳ đang chiếu khi tua từng quý sau mỗi lựa chọn; null là đứng yên.
  const [animT, setAnimT] = useState<number | null>(null);
  // Kỳ người chơi chọn xem lại sau khi đã tua xong năm; null là xem cuối năm.
  const [reviewT, setReviewT] = useState<number | null>(null);

  const { recordRun, recordQuiz, progress } = useProgress();
  // Hướng dẫn chỉ hiện cho người chưa hoàn thành nhiệm kỳ nào.
  const newbie = Object.keys(progress.stars).length === 0;
  const [guidance, setGuidance] = useState<Guidance>("neutral");
  const [advice, setAdvice] = useState<{ taylor: ReturnType<typeof taylorAdvice>; pick?: { id: string; label: string; points: number } } | null>(null);
  // Quý bị cách chức trong năm vừa chọn, biết trước ngay khi chọn nhưng chỉ lộ ra khi bấm tới quý đó.
  const [fired, setFired] = useState<ReturnType<typeof checkFired>>(null);
  const rules = useMemo(() => fireRules(scenario), [scenario]);
  const expert = useMemo(() => expertPath(scenario), [scenario]);
  // Phần thưởng của nhiệm kỳ vừa xong. Chỉ ghi khi mô phỏng đã tua hết, để không lộ kết quả trước.
  const [reward, setReward] = useState<Reward | null>(null);
  const pendingRun = useRef<Parameters<typeof recordRun>[0] | null>(null);
  const totalRounds = useMemo(() => allPlaythroughs(scenario)[0].length, [scenario]);

  const roundId = useMemo(() => {
    let id: string | undefined = scenario.start;
    for (const s of steps) id = choiceOf(scenario, s).next;
    return id;
  }, [scenario, steps]);

  const currentRoundId = revealed ? steps.at(-1)!.roundId : roundId;
  const round = currentRoundId ? scenario.rounds[currentRoundId] : undefined;
  const lastChoice = revealed ? choiceOf(scenario, steps.at(-1)!) : undefined;
  const ended = revealed && !lastChoice?.next;
  const roundIndex = revealed ? steps.length - 1 : steps.length;
  const roundStart = roundIndex * ROUND_PERIODS;

  const { result, periods } = useMemo(() => runGame(scenario, steps), [scenario, steps]);
  // Trước khi chọn: thấy sự kiện vừa xảy ra. Sau khi chọn: tua hết năm đó.
  const tTarget = revealed ? Math.min(periods, roundStart + ROUND_PERIODS) : roundStart;
  const tView = animT ?? reviewT ?? tTarget;
  const final = useMemo(() => (ended ? finalResult(scenario, result, periods) : null), [ended, scenario, result, periods]);
  const story = round ? storyFor(round, result, roundStart) : [];
  const quiz = useMemo(() => (final ? buildQuiz(scenario, steps) : []), [final, scenario, steps]);

  // Tín nhiệm: điểm tạm tính theo cùng công thức chấm cuối nhiệm kỳ, cập nhật từng quý.
  const trust = useMemo(() => (tView === 0 ? 100 : score(averageValues(result, tView), scenario.difficulty).points), [result, tView, scenario.difficulty]);

  // Tua xong năm: dừng hoạt cảnh và, nếu là năm cuối, ghi kết quả nhiệm kỳ.
  const finish = useCallback(() => {
    setAnimT(null);
    const run = pendingRun.current;
    pendingRun.current = null;
    if (run) setReward(recordRun(run));
  }, [recordRun]);

  // Không tự chạy: người chơi bấm để sang từng quý, đọc xong giải thích rồi mới đi tiếp.
  const stepForward = () => {
    if (animT === null) return;
    if (fired && animT >= fired.t) return;
    if (animT >= tTarget) finish();
    else setAnimT(animT + 1);
  };
  const skip = () => (fired ? setAnimT(fired.t) : finish());
  const firedNow = !!fired && revealed && tView >= fired.t;
  const stepBack = () => {
    if (animT !== null && animT > roundStart) setAnimT(animT - 1);
  };

  // Tách kết quả theo nguồn: sự kiện của từng năm và lựa chọn của bạn.
  const att = useMemo(() => attribute(scenario, steps), [scenario, steps]);
  const notes = useMemo(() => (revealed ? explainQuarter(scenario, att, result, tView) : []), [revealed, scenario, att, result, tView]);
  // Công cụ đã dùng ở các năm trước: lời kể không định nghĩa lại.
  const knownTools = useMemo(
    () => new Set((revealed ? steps.slice(0, -1) : steps).flatMap((x) => choiceOf(scenario, x).shocks.map((sh) => sh.node))),
    [scenario, steps, revealed],
  );

  // Lời kể của từng quý trong năm vừa chọn, tính một lần: dùng để đọc và để tải trước giọng.
  const quarterTexts = useMemo(() => {
    if (!revealed) return [];
    const step = steps.at(-1)!;
    const choice = choiceOf(scenario, step);
    const idx = step.choiceId === CUSTOM ? 3 : scenario.rounds[step.roundId].choices.findIndex((x) => x.id === step.choiceId);
    const intro = narrateChoice(scenario, roundIndex + 1, LETTERS[idx], choice, step.guidance, new Set(knownTools));
    const all = Array.from({ length: tTarget - roundStart + 1 }, (_, q) => explainQuarter(scenario, att, result, roundStart + q));
    return all.map((ns, q) =>
      narrateQuarter(ns, q, {
        intro: q === 0 ? intro : undefined,
        last: roundStart + q >= tTarget,
        year: roundIndex + 1,
        seen: whySeen(all.slice(0, q)),
        outro: fired && roundStart + q >= fired.t ? firedOutro(fired.rule.label) : undefined,
      }),
    );
  }, [revealed, steps, scenario, roundIndex, knownTools, tTarget, roundStart, att, result, fired]);

  // Đang cân nhắc: tạo sẵn lời kể quý đầu của từng phương án (theo giọng phát ngôn đang chọn), bấm chọn là nghe ngay.
  const choiceTexts = useMemo(() => {
    if (revealed || !round) return [];
    return round.choices.map((c) => {
      const next = [...steps, { roundId: round.id, choiceId: c.id, guidance }];
      const r = runGame(scenario, next).result;
      const notes0 = explainQuarter(scenario, attribute(scenario, next), r, roundStart);
      const k = round.choices.indexOf(c);
      return narrateQuarter(notes0, 0, { intro: narrateChoice(scenario, roundIndex + 1, LETTERS[k], c, guidance, new Set(knownTools)), last: false, year: roundIndex + 1, seen: new Set() });
    });
  }, [revealed, round, steps, guidance, scenario, roundStart, roundIndex, knownTools]);
  useEffect(() => {
    if (choiceTexts.length) prefetch(choiceTexts);
  }, [choiceTexts]);
  // Kết quả nếu chưa ra quyết định năm nay, để so "trước" và "sau" quyết định.
  const before = useMemo(() => (revealed ? runGame(scenario, steps.slice(0, -1)).result : null), [revealed, scenario, steps]);
  const attBefore = useMemo(() => (revealed ? attribute(scenario, steps.slice(0, -1)) : null), [revealed, scenario, steps]);

  const choose = (choiceId: string, custom?: Step["custom"]) => {
    if (!round) return;
    const base: Step = custom ? { roundId: round.id, choiceId: CUSTOM, custom, next: nearestChoice(round, custom).next } : { roundId: round.id, choiceId };
    const step: Step = { ...base, guidance, advised: !!advice };
    const nextSteps = [...steps, step];
    setSteps(nextSteps);
    setRevealed(true);
    setAnimT(roundStart);
    setReviewT(null);
    setAdvice(null);
    const { result: r, periods: n } = runGame(scenario, nextSteps);
    const f0 = checkFired(scenario, r, Math.min(n, roundStart + ROUND_PERIODS), rules);
    setFired(f0);
    if (!f0 && !choiceOf(scenario, step).next) {
      const f = finalResult(scenario, r, n);
      const talks = nextSteps.filter((x) => x.guidance && x.guidance !== "neutral");
      pendingRun.current = {
        scenarioId: scenario.id,
        stars: f.stars,
        points: f.points,
        usedCustom: nextSteps.some((x) => x.choiceId === CUSTOM),
        soldReserves: nextSteps.some((x) => choiceOf(scenario, x).shocks.some((sh) => sh.node === "reserves" && sh.size < 0)),
        usedAdvisor: nextSteps.some((x) => x.advised),
        talkConsistent: talks.length > 0 && talks.every((x) => guidanceShocks(x.guidance, choiceOf(scenario, x).shocks).consistent),
      };
    }
  };

  const nextRound = () => {
    setRevealed(false);
    setReviewT(null);
    setGuidance("neutral");
  };
  const askAdvisor = () => {
    if (!round) return;
    const taylor = taylorAdvice(scenario, result, roundStart);
    const best = round.choices.length ? bestContinuation(scenario, steps, round.id) : undefined;
    const k = best ? round.choices.findIndex((c) => c.id === best.choiceId) : -1;
    setAdvice({ taylor, pick: best && k >= 0 ? { id: best.choiceId, label: `${LETTERS[k]}. ${round.choices[k].label}`, points: best.points } : undefined });
  };
  const restart = () => {
    setStarted(false);
    setSteps([]);
    setRevealed(false);
    setAnimT(null);
    setReward(null);
    setReviewT(null);
    setFired(null);
    setAdvice(null);
    setGuidance("neutral");
    pendingRun.current = null;
  };

  const playing = animT !== null;

  const yearNext =
    ended && final
      ? `Nhiệm kỳ của bạn kết thúc với ${final.points} trên 100 điểm, ${final.stars} sao. ${verdict(final.stars, final.allMet)} Chuyên gia chơi kịch bản này được ${expert.points} điểm. Kéo xuống để so sánh và làm vài câu hỏi ôn lại.`
      : `Bấm sang năm ${roundIndex + 2} để nghe tiếp câu chuyện.`;

  // Vừa chọn xong: tải trước giọng đọc cho mọi quý của năm, bảng tổng kết năm, và câu chuyện năm sau.
  const yearText = revealed && before && lastChoice ? yearNarration(scenario, roundIndex + 1, before, result, roundStart, Math.min(periods, roundStart + ROUND_PERIODS), lastChoice.feedback, yearNext) : "";
  const nextRoundId = revealed && !fired ? lastChoice?.next : undefined;
  const nextStoryText = nextRoundId
    ? storyNarration(scenario.rounds[nextRoundId], storyFor(scenario.rounds[nextRoundId], result, (roundIndex + 1) * ROUND_PERIODS), roundIndex + 1, true)
    : "";
  // Chưa vào chơi: tải trước câu chuyện năm đầu, bấm "Bắt đầu" là nghe ngay.
  const firstStoryText = !started && round ? storyNarration(round, story, 0, true) : "";
  const ahead = [firstStoryText, ...quarterTexts, yearText, nextStoryText].filter(Boolean).join("\u0000");
  useEffect(() => {
    if (ahead) prefetch(ahead.split("\u0000"));
  }, [ahead]);

  if (!started) return <Briefing scenario={scenario} rules={rules} onStart={() => setStarted(true)} />;

  return (
    <div className="space-y-5">
      <VoiceBar />
      <div className="flex flex-wrap gap-2 items-center text-sm">
        <span className="text-muted">Đường đi của bạn:</span>
        {steps.length === 0 && <span className="text-muted">chưa có quyết định nào</span>}
        {steps.map((s, k) => {
          const c = choiceOf(scenario, s);
          const idx = s.choiceId === CUSTOM ? 3 : scenario.rounds[s.roundId].choices.findIndex((x) => x.id === s.choiceId);
          return (
            <span key={k} className="inline-flex items-center gap-1.5">
              {k > 0 && <span className="text-muted">→</span>}
              <span className="px-2.5 py-1 rounded-full bg-accent-soft text-accent">
                Năm {k + 1}: {LETTERS[idx]}. {c.label}
              </span>
            </span>
          );
        })}
      </div>

      <div className="grid xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-5">
        <div className="space-y-4">
          {round && (
            <div className="bg-surface border border-line rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">
                  Năm {roundIndex + 1}/{totalRounds}
                </span>
                <div className="flex gap-1 flex-1">
                  {Array.from({ length: totalRounds }, (_, k) => (
                    <span key={k} className={`h-1 flex-1 rounded-full ${k <= roundIndex ? "bg-accent" : "bg-surface-2"}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold">{round.title}</h2>
                <SpeakButton
                  id={`story-${roundIndex}`}
                  auto={!revealed}
                  text={storyNarration(round, story, roundIndex, !revealed)}
                />
              </div>
              {story.map((p, k) => (
                <p key={k} className={`leading-relaxed ${k > 0 ? "text-sm rounded-lg p-2.5 bg-surface-2" : ""}`}>
                  {k > 0 && <span className="font-medium">Hậu quả từ năm trước: </span>}
                  {p}
                </p>
              ))}
              {!revealed && <EffectList shocks={round.event} title="Nếu bạn không làm gì, theo quy luật cú sốc này sẽ:" />}
            </div>
          )}

          {round && !revealed && roundIndex === 0 && (
            <Hint id="story" title="Bắt đầu từ câu chuyện" enabled={newbie}>
              Mỗi năm mở đầu bằng một sự kiện. Đọc kỹ: nó cho biết cú sốc đánh vào đâu (giá dầu, lãi suất Mỹ, xuất khẩu…). Bản đồ bên phải đã sáng lên ở chỗ đó.
            </Hint>
          )}

          {round && !revealed && (
            <div className="space-y-2">
              <h3 className="font-medium">{round.question}</h3>
              <Hint id="choices" title="Chọn một phương án" enabled={newbie}>
                Mỗi phương án ghi rõ con số nó thay đổi. Không chắc thì bấm &ldquo;Hỏi cố vấn&rdquo;. Bạn cũng có thể chọn giọng phát ngôn: lời nói cũng tác động lên thị trường.
              </Hint>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={askAdvisor} disabled={!!advice} className="px-3 py-1.5 rounded-lg border border-line text-sm hover:border-accent disabled:opacity-60">
                  🧑‍💼 Hỏi cố vấn
                </button>
              </div>
              {advice && <AdvisorPanel advice={advice.taylor} pick={advice.pick} onClose={() => setAdvice(null)} />}
              <GuidancePicker value={guidance} onChange={setGuidance} />
              {round.choices.map((c, k) => {
                const talk = talkPreview(guidance, c.shocks);
                const clash = talk ? !talk.consistent : false;
                const tip = advice?.pick?.id === c.id;
                return (
                <div
                  key={c.id}
                  className="bg-surface border border-line rounded-xl hover:border-accent transition-colors"
                  style={tip ? { borderColor: "var(--chart-3)", boxShadow: "0 0 0 2px var(--chart-3)" } : undefined}
                >
                <button type="button" onClick={() => choose(c.id)} className="w-full text-left p-4 pb-2 flex gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-surface-2 flex items-center justify-center text-sm font-semibold">{LETTERS[k]}</span>
                  <span>
                    <span className="font-medium block">{c.label}</span>
                    <span className="text-sm text-muted block mt-0.5">{c.detail}</span>
                    {c.shocks.length > 0 && (
                      <span className="block mt-1.5 space-y-0.5">
                        {c.shocks.map((sh, j) => (
                          <span key={j} className="block text-xs tabular-nums text-accent">
                            {describeShock(scenario, sh)}
                          </span>
                        ))}
                      </span>
                    )}
                    {tip && <span className="block mt-1.5 text-xs font-medium" style={{ color: "var(--chart-3)" }}>🧑‍💼 Cố vấn gợi ý</span>}
                    {talk && (
                      <span className="block mt-1.5 text-xs tabular-nums" style={{ color: clash ? "var(--down)" : "var(--up)" }}>
                        {clash
                          ? `⚠ Kèm phát ngôn ${GUIDANCE[guidance].label.toLowerCase()}: lời nói ngược việc làm nên phản tác dụng, ${talk.text}.`
                          : `🎙️ Kèm phát ngôn ${GUIDANCE[guidance].label.toLowerCase()}: ${talk.text}.`}
                      </span>
                    )}
                  </span>
                </button>
                <div className="px-4 pb-4 pl-14">
                  <EffectList shocks={c.shocks} title="Theo quy luật, nếu chỉ tính riêng phương án này:" />
                </div>
                </div>
                );
              })}
              <CustomChoice scenario={scenario} onSubmit={(shocks) => choose(CUSTOM, shocks)} />
            </div>
          )}

          {lastChoice && (
            <div className="rounded-xl p-5 space-y-3 border border-accent bg-accent-soft">
              <div className="text-xs font-medium text-accent">Năm {roundIndex + 1} · Bạn đã chọn: {lastChoice.label}</div>
              {lastChoice.shocks.length > 0 && (
                <ul className="text-sm tabular-nums space-y-0.5">
                  {lastChoice.shocks.map((sh, j) => (
                    <li key={j}>• {describeShock(scenario, sh)}</li>
                  ))}
                </ul>
              )}
              {lastChoice && steps.at(-1)?.guidance && steps.at(-1)!.guidance !== "neutral" && (
                <div className="text-sm">🎙️ Phát ngôn: {steps.at(-1)!.guidance === "hawk" ? "Cứng rắn" : "Mềm mỏng"}</div>
              )}
              {playing && !firedNow && (
                <PlaybackBar q={tView - roundStart} last={tView >= tTarget} onBack={stepBack} onStep={stepForward} onSkip={skip} />
              )}
            </div>
          )}

          {revealed && (playing || reviewT !== null) && tView - roundStart <= 1 && roundIndex === 0 && (
            <Hint id="quarter" title="Đi từng quý" enabled={newbie}>
              Mỗi quý, ô dưới đây kể chỉ số nào vừa đổi, đổi bao nhiêu, và đó là do sự kiện hay do lựa chọn của bạn. Đọc xong thì bấm sang quý sau.
            </Hint>
          )}

          {revealed && (playing || reviewT !== null) && (
            <QuarterPanel
              notes={notes}
              q={tView - roundStart}
              year={roundIndex + 1}
              story={round ? eventLabel(round) : ""}
              choice={lastChoice?.label ?? ""}
              narration={quarterTexts[tView - roundStart]}
            />
          )}

          {firedNow && fired && (
            <FiredPanel rule={fired.rule} real={fired.real} year={roundIndex + 1} quarter={fired.t - roundStart}>
              <p className="text-sm text-muted">
                Chuyên gia chơi kịch bản này được {expert.points} điểm với: {stepLabels(scenario, expert.steps).join(" → ")}.
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={restart} className="px-4 py-2 rounded-lg bg-accent text-white">
                  Chơi lại
                </button>
                <Link href="/thu-thach" className="px-4 py-2 rounded-lg border border-line">
                  Thử thách khác
                </Link>
              </div>
            </FiredPanel>
          )}

          {lastChoice && !playing && !fired && before && (
            <YearSummary
              scenario={scenario}
              year={roundIndex + 1}
              before={before}
              after={result}
              attBefore={attBefore!}
              attAfter={att}
              t0={roundStart}
              t1={Math.min(periods, roundStart + ROUND_PERIODS)}
              feedback={lastChoice.feedback}
              next={yearNext}
              reviewQ={reviewT === null ? null : reviewT - roundStart}
              onReview={(q) => setReviewT(q === null ? null : roundStart + q)}
              onReplay={() => {
                setReviewT(null);
                setAnimT(roundStart);
              }}
            >
              {!ended && (
                <button type="button" onClick={nextRound} className="px-4 py-2 rounded-lg bg-accent text-white">
                  Sang năm {roundIndex + 2} →
                </button>
              )}
            </YearSummary>
          )}

          {final && !playing && !fired && (
            <div className="bg-surface border border-line rounded-xl p-5 space-y-4">
              <div>
                <div className="text-xs text-muted">Kết quả nhiệm kỳ</div>
                <div className="flex flex-wrap items-baseline gap-3 mt-1">
                  <CountUp to={final.points} className="text-5xl font-semibold tabular-nums anim-glow" />
                  <span className="text-muted">/100 điểm</span>
                  <PopStars n={final.stars} />
                </div>
                <div className="text-sm font-medium mt-1">{verdict(final.stars, final.allMet)}</div>
              </div>
              {final.stars === 3 && <Confetti />}
              {reward && <RewardPanel reward={reward} />}
              <ExpertCompare
                scenario={scenario}
                mine={result}
                expert={expert.result}
                myPoints={final.points}
                expertPoints={expert.points}
                expertLabels={stepLabels(scenario, expert.steps)}
              />
              <Quiz key={steps.map((x) => x.choiceId).join("-")} questions={quiz} onDone={(n) => recordQuiz(scenario.id, n)} />
              <div>
                <div className="text-sm font-medium mb-1.5">Mục tiêu (bình quân năm cuối)</div>
                <ul className="space-y-1.5 text-sm">
                  {final.targets.map((t) => (
                    <li key={t.node} className="flex justify-between gap-3">
                      <span>
                        {INDICATOR_BY_ID[t.node].name} {t.op === "<=" ? "≤" : "≥"} {formatReal(t.node, t.value)}
                      </span>
                      <span className="tabular-nums" style={{ color: t.ok ? "var(--up)" : "var(--down)" }}>
                        {formatReal(t.node, t.real)} {t.ok ? "✓" : "✗"}
                      </span>
                    </li>
                  ))}
                </ul>
                {!final.allMet && <p className="text-xs text-muted mt-2">Chưa đạt hết mục tiêu nên tối đa 2 sao.</p>}
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Điểm tính theo mức các chỉ số đi sai hướng (lạm phát tăng, tăng trưởng giảm, tiền đồng mất giá, dự trữ giảm, nợ công tăng) trong cả nhiệm kỳ. Số thật được quy đổi từ mô hình giáo khoa của bản đồ, chỉ để minh họa. Không có đáp án duy nhất đúng.
              </p>
              <div className="rounded-lg bg-surface-2 p-4 text-sm leading-relaxed">
                <div className="font-medium mb-1">Thực tế đã xảy ra</div>
                {scenario.reality}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={restart} className="px-4 py-2 rounded-lg bg-accent text-white">
                  Chơi lại, thử hướng khác
                </button>
                {scenario.relatedCase && (
                  <Link href={`/case-study/${scenario.relatedCase}`} className="px-4 py-2 rounded-lg border border-line">
                    Đọc case study: {CASE_BY_SLUG[scenario.relatedCase].title}
                  </Link>
                )}
                <Link href="/thu-thach" className="px-4 py-2 rounded-lg border border-line">
                  Thử thách khác
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 min-w-0">
          <Hint id="board" title="Tín nhiệm, ngưỡng cách chức và bản đồ" enabled={newbie}>
            Thanh Tín nhiệm là điểm tạm tính: trên 70 là đang hướng tới 3 sao. Dưới mỗi chỉ số có ngưỡng cách chức: vượt 2 quý liền là mất ghế. Bản đồ cho thấy tác động lan qua các mũi tên.
          </Hint>
          <EconomyBoard scenario={scenario} result={result} tView={tView} trust={trust} round={round} myShocks={lastChoice?.shocks} rules={rules} />
        </div>
      </div>
    </div>
  );
}

function verdict(stars: number, allMet: boolean) {
  if (stars === 3) return "Xuất sắc! Nền kinh tế vượt cơn bão nhờ bạn.";
  if (stars === 2) return allMet ? "Khá tốt, nhưng cái giá phải trả còn cao." : "Khá tốt, nhưng còn mục tiêu chưa đạt.";
  return "Nhiệm kỳ sóng gió. Thử một hướng khác xem sao?";
}
