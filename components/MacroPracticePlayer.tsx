"use client";

import { useEffect, useRef, useState } from "react";
import { PRACTICE_GAMES, type PracticeGameId, type PracticeQuestion } from "@/content/macro-practice";
import { classifyDirection, directionChange, DIRECTION_OPTIONS, parseInterval, scoreInterval } from "@/lib/macro-practice";
import { useProgress } from "@/lib/progress";
import SourceBadge from "./SourceBadge";

type Result = { response: string; correct: boolean; points: number };
type Phase = "intro" | "question" | "review" | "summary";

const PRIMARY = "min-h-11 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const PANEL = "space-y-5 rounded-xl border border-line bg-surface p-4 sm:p-6";

const format = (value: number, minimumFractionDigits = 0, maximumFractionDigits = minimumFractionDigits) =>
  value.toLocaleString("vi-VN", { minimumFractionDigits, maximumFractionDigits });

function valueLabel(value: number, unit: PracticeQuestion["unit"]) {
  if (unit === "%") return `${format(value, 2)}%`;
  if (unit === "VND/USD") return `${format(value, 2)} VND/USD`;
  return `${format(value, 1)} tỷ USD`;
}

function QuestionReview({ question, result }: { question: PracticeQuestion; result: Result }) {
  const { previous, answer, unit, year, explanation, source } = question;
  const change = unit === "tỷ USD" ? null : directionChange(previous, answer, unit === "VND/USD");

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <p className="[overflow-wrap:anywhere]">Bạn trả lời <strong>{result.response}</strong></p>
      <dl className="grid grid-cols-2 gap-3 rounded-lg bg-surface-2 p-3 tabular-nums">
        <div>
          <dt className="text-muted">{year - 1}</dt>
          <dd className="font-semibold">{valueLabel(previous, unit)}</dd>
        </div>
        <div>
          <dt className="text-muted">{year}</dt>
          <dd className="font-semibold">{valueLabel(answer, unit)}</dd>
        </div>
      </dl>
      {change !== null && (
        <p>
          {DIRECTION_OPTIONS.find(({ value }) => value === classifyDirection(change))?.label}
          {" · "}{change > 0 ? "+" : ""}{format(change, 0, 3)}{unit === "%" ? " điểm phần trăm" : "%"} so với năm trước.
        </p>
      )}
      <p>{explanation}</p>
      <SourceBadge series={source} />
    </div>
  );
}

function IntervalForm({ answer, onAnswer }: { answer: number; onAnswer: (result: Result) => void }) {
  const [error, setError] = useState(false);
  const inputStyle = "min-h-11 w-full rounded-lg border border-line bg-bg px-3 py-2 tabular-nums focus-visible:outline-2 focus-visible:outline-accent";

  return (
    <form className="space-y-4" onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const lower = String(data.get("lower") ?? "").trim();
      const upper = String(data.get("upper") ?? "").trim();
      const interval = parseInterval(lower, upper);
      if (!interval) {
        setError(true);
        return;
      }
      const { low, high } = interval;
      onAnswer({
        ...scoreInterval(answer, low, high),
        response: `${lower} – ${upper} tỷ USD`,
      });
    }}>
      <p id="practice-input-hint" className="text-sm text-muted">Nhập hai cận theo tỷ USD. Bạn có thể dùng dấu phẩy hoặc dấu chấm thập phân.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="block font-medium">Cận dưới</span>
          <input name="lower" type="text" inputMode="decimal" aria-invalid={error} aria-describedby={error ? "practice-input-error" : "practice-input-hint"} className={inputStyle} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="block font-medium">Cận trên</span>
          <input name="upper" type="text" inputMode="decimal" aria-invalid={error} aria-describedby={error ? "practice-input-error" : "practice-input-hint"} className={inputStyle} />
        </label>
      </div>
      {error && <p id="practice-input-error" role="alert" className="text-sm text-down">Nhập hai số hợp lệ với 0 &lt; cận dưới &lt; cận trên.</p>}
      <button type="submit" className={PRIMARY}>Chốt khoảng</button>
    </form>
  );
}

export default function MacroPracticePlayer({ gameId, questions }: { gameId: PracticeGameId; questions: PracticeQuestion[] }) {
  const game = PRACTICE_GAMES[gameId];
  const key = `${gameId}:v${game.version}`;
  const { progress, recordMacroPractice } = useProgress();
  const record = progress.macroPractice[key];
  const [phase, setPhase] = useState<Phase>("intro");
  const [results, setResults] = useState<Result[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const finished = useRef(false);

  useEffect(() => {
    if (phase !== "intro") heading.current?.focus();
  }, [phase]);

  const total = results.reduce((sum, result) => sum + result.points, 0);

  function start() {
    finished.current = false;
    setResults([]);
    setPhase("question");
  }

  function submit(result: Result) {
    if (phase !== "question") return;
    setResults((previous) => previous.length === results.length ? [...previous, result] : previous);
    setPhase("review");
  }

  function advance() {
    if (phase !== "review" || finished.current) return;
    if (results.length < questions.length) {
      setPhase("question");
      return;
    }
    finished.current = true;
    recordMacroPractice(key, total);
    setPhase("summary");
  }

  const recordLine = (
    <p className="text-sm text-muted tabular-nums">
      {record ? `Kỷ lục ${record.best}/${game.maxPoints} điểm · Ván gần nhất ${record.latest}/${game.maxPoints} điểm` : "Kỷ lục cá nhân xuất hiện sau ván đầu tiên."}
    </p>
  );

  if (phase === "intro") {
    return (
      <section className={PANEL}>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Cách chơi</h2>
          <p className="text-sm leading-relaxed">{questions.length} câu, theo nhịp của bạn. {game.rules}</p>
        </div>
        {recordLine}
        <button type="button" className={PRIMARY} onClick={start}>Bắt đầu</button>
      </section>
    );
  }

  if (phase === "summary") {
    const correct = results.filter((result) => result.correct).length;
    const misses = questions.flatMap((question, index) => results[index].correct ? [] : [{ question, result: results[index] }]);

    return (
      <section className={PANEL}>
        <div className="space-y-2">
          <h2 ref={heading} tabIndex={-1} className="text-lg font-semibold">Tổng kết ván</h2>
          <p className="text-3xl font-semibold tabular-nums">{total}<span className="text-base font-normal text-muted">/{game.maxPoints} điểm</span></p>
          <p>{gameId === "doan-chieu" ? "Câu đúng" : "Khoảng trúng"} {correct}/{questions.length}</p>
          {recordLine}
        </div>
        {misses.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Xem lại các câu chưa đúng</h3>
            {misses.map(({ question, result }) => (
              <details key={`${question.label}-${question.year}`} className="rounded-lg border border-line px-3 py-2">
                <summary className="cursor-pointer py-1 text-sm font-medium">{question.label} năm {question.year}</summary>
                <div className="pb-2 pt-3"><QuestionReview question={question} result={result} /></div>
              </details>
            ))}
          </div>
        )}
        <button type="button" className={PRIMARY} onClick={start}>Chơi lại</button>
      </section>
    );
  }

  const index = phase === "review" ? results.length - 1 : results.length;
  const question = questions[index];
  const result = results[index];
  const isDirection = gameId === "doan-chieu";

  return (
    <section className={PANEL}>
      <div className="flex flex-wrap justify-between gap-2 border-b border-line pb-3 text-sm text-muted tabular-nums">
        <span>Câu {index + 1}/{questions.length}</span>
        <span>{total}/{game.maxPoints} điểm</span>
      </div>
      {phase === "review" ? (
        <>
          <div className="space-y-1">
            <h2 ref={heading} tabIndex={-1} className="text-lg font-semibold">{question.label} năm {question.year}</h2>
            <p className={`text-sm font-semibold ${result.correct ? "text-up" : "text-down"}`}>
              {result.correct ? (isDirection ? "Chính xác" : "Khoảng trúng") : (isDirection ? "Chưa đúng" : "Khoảng trượt")} · +{result.points} điểm
            </p>
          </div>
          <QuestionReview question={question} result={result} />
          <button key="advance" type="button" className={PRIMARY} onClick={advance}>
            {index + 1 === questions.length ? "Xem tổng kết" : "Câu tiếp theo"}
          </button>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <h2 ref={heading} tabIndex={-1} className="text-lg font-semibold">
              {isDirection ? `${question.label} năm ${question.year} thay đổi thế nào?` : `${question.label} năm ${question.year} khoảng bao nhiêu?`}
            </h2>
            <p className="text-sm leading-relaxed text-muted">{question.context}</p>
            <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm tabular-nums">
              Mốc năm {question.year - 1} <strong>{valueLabel(question.previous, question.unit)}</strong>
            </p>
          </div>
          {isDirection ? (
            <div className="grid gap-2 sm:grid-cols-3">
              {DIRECTION_OPTIONS.map(({ value, label }) => (
                <button key={value} type="button" className="min-h-11 rounded-lg border border-line px-3 py-2 text-sm font-medium hover:border-accent hover:bg-accent-soft" onClick={() => {
                  const change = directionChange(question.previous, question.answer, question.unit === "VND/USD");
                  const correct = value === classifyDirection(change);
                  submit({ response: label, correct, points: Number(correct) });
                }}>{label}</button>
              ))}
            </div>
          ) : (
            <IntervalForm key={index} answer={question.answer} onAnswer={submit} />
          )}
        </>
      )}
    </section>
  );
}
