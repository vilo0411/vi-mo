"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LEVEL_LABEL, type Level } from "@/content/scenarios";
import { PROBLEMS, type Problem } from "@/content/problems";
import { useProgress } from "@/lib/progress";
import { PROBLEM_GATE, problemsMissing, problemXp } from "@/lib/rewards";

/** Đọc số người dùng gõ kiểu Việt Nam ("6,36", "106.513") hoặc kiểu quốc tế ("6.36"). */
export function parseNumber(raw: string, unit: string): number | null {
  let s = raw.trim().replace(/\s/g, "").replace(/%$/, "");
  if (!s) return null;
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
  else if (s.includes(",")) s = s.replace(",", ".");
  else if (unit === "đồng" && /^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  s = s.replace(/^−/, "-");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const LEVEL_COLOR: Record<Level, string> = { de: "var(--up)", vua: "var(--chart-2)", kho: "var(--down)" };

export default function ProblemSet() {
  const { progress } = useProgress();
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const solved = PROBLEMS.filter((p) => progress.solved[p.id]).length;
  const onResult = (ok: boolean) => {
    const next = ok ? combo + 1 : 0;
    setCombo(next);
    clearTimeout(timer.current);
    setShowCombo(next >= 2);
    if (next >= 2) timer.current = setTimeout(() => setShowCombo(false), 2500);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 bg-surface-2 rounded-full overflow-hidden">
          <div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${(solved / PROBLEMS.length) * 100}%` }} />
        </div>
        <span className="text-sm text-muted tabular-nums">
          Đã giải {solved}/{PROBLEMS.length}
        </span>
      </div>
      {showCombo && combo >= 2 && (
        <div key={combo} className="anim-pop fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-surface border border-line shadow-lg font-semibold" style={{ color: "var(--chart-2)" }} aria-live="polite">
          🔥 Combo ×{combo}
        </div>
      )}
      {(["de", "vua", "kho"] as Level[]).map((level) => {
        const list = PROBLEMS.map((p, i) => ({ p, i })).filter(({ p }) => p.level === level);
        const missing = problemsMissing(level, progress);
        const from = PROBLEM_GATE[level].from;
        const done = list.filter(({ p }) => progress.solved[p.id]).length;
        return (
          <div key={level} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: LEVEL_COLOR[level] }}>
                {missing ? "🔒 " : ""}Màn {LEVEL_LABEL[level]}
              </span>
              <span className="text-xs text-muted tabular-nums">
                {done}/{list.length}
              </span>
              {missing > 0 && from && (
                <span className="text-xs text-muted">
                  · Giải thêm {missing} bài {LEVEL_LABEL[from]} để mở
                </span>
              )}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {list.map(({ p, i }) =>
                missing ? (
                  <div key={p.id} className="bg-surface border border-dashed border-line rounded-xl p-4 opacity-60">
                    <div className="text-xs text-muted">Bài {i + 1} · 🔒 Chưa mở</div>
                    <div className="font-semibold mt-1">{p.title}</div>
                  </div>
                ) : (
                  <ProblemCard key={p.id} problem={p} index={i + 1} done={!!progress.solved[p.id]} onResult={onResult} />
                ),
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ProblemCard({
  problem: p,
  index,
  done,
  daily = false,
  onResult,
}: {
  problem: Problem;
  index?: number;
  done: boolean;
  daily?: boolean;
  onResult?: (ok: boolean) => void;
}) {
  const { solveProblem } = useProgress();
  const [input, setInput] = useState("");
  const [state, setState] = useState<"idle" | "empty" | "wrong" | "right">("idle");
  const [tries, setTries] = useState(0);
  const [hint, setHint] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [gain, setGain] = useState(0);

  const check = () => {
    const n = parseNumber(input, p.unit);
    if (n === null) {
      setState("empty");
      return;
    }
    const ok = Math.abs(n - p.answer) <= p.tolerance;
    if (state === "right") return;
    setTries((t) => t + 1);
    setState(ok ? "right" : "wrong");
    onResult?.(ok);
    if (ok) setGain(solveProblem(p.id, { clean: tries === 0 && !usedHint, daily }).xp);
  };

  const levelColor = LEVEL_COLOR[p.level];

  return (
    <div className={`bg-surface border rounded-xl p-4 space-y-3 ${done || state === "right" ? "border-up" : "border-line"}`} style={done || state === "right" ? { borderColor: "var(--up)" } : undefined}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted">
          {index ? `Bài ${index}` : "Bài hôm nay"} · +{problemXp(p, false)} XP
        </span>
        <span className="text-xs font-medium" style={{ color: levelColor }}>
          {LEVEL_LABEL[p.level]}
          {done && <span style={{ color: "var(--up)" }}> · đã giải</span>}
        </span>
      </div>
      <h3 className="font-semibold">{p.title}</h3>
      <p className="text-sm leading-relaxed">{p.prompt}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          check();
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (state === "empty" || state === "wrong") setState("idle");
          }}
          inputMode="decimal"
          placeholder="Nhập đáp số"
          aria-label={`Đáp số bài ${index ?? p.title}`}
          className="w-36 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm tabular-nums"
        />
        {p.unit && <span className="text-sm text-muted">{p.unit}</span>}
        <button type="submit" className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm">
          Kiểm tra
        </button>
        <button
          type="button"
          onClick={() => {
            setHint((h) => !h);
            setUsedHint(true);
          }} className="text-xs text-muted hover:text-text">
          {hint ? "Ẩn gợi ý" : "Gợi ý"}
        </button>
      </form>
      {state === "empty" && (
        <p className="text-xs" style={{ color: "var(--down)" }}>
          Nhập một con số trước, ví dụ 6,4 hoặc 6.4.
        </p>
      )}
      {state === "wrong" && (
        <p className="text-sm" style={{ color: "var(--down)" }}>
          Chưa đúng, thử lại nhé.{tries >= 2 && !hint ? " Bấm Gợi ý nếu cần." : ""}
        </p>
      )}
      {hint && <p className="text-sm text-muted leading-relaxed border-l-2 border-line pl-3">{p.hint}</p>}
      {(state === "right" || (state === "wrong" && tries >= 3)) && (
        <div className="text-sm leading-relaxed rounded-lg bg-surface-2 p-3 space-y-1">
          {state === "right" ? (
            <div className="font-medium flex flex-wrap items-center gap-2" style={{ color: "var(--up)" }}>
              Chính xác!
              {gain > 0 && <span className="anim-pop inline-block px-2 py-0.5 rounded-full text-xs bg-accent-soft text-accent">+{gain} XP</span>}
              {gain > 0 && tries === 1 && !usedHint && <span className="text-xs text-muted">Giải sạch: đúng ngay lần đầu</span>}
            </div>
          ) : (
            <div className="font-medium">Lời giải</div>
          )}
          <p>{p.solution}</p>
          {p.relatedTerm && (
            <Link href={`/thuat-ngu/${p.relatedTerm}`} className="text-xs text-accent">
              Đọc thêm trong Thuật ngữ →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
