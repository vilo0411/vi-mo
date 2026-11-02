"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/quiz";
import { QUIZ_XP } from "@/lib/rewards";

/** Quiz tổng kết: vài câu rút ra từ chính lượt vừa chơi. Trả lời hết thì báo số câu đúng để cộng XP. */
export default function Quiz({ questions, onDone }: { questions: QuizQuestion[]; onDone: (correct: number) => void }) {
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [reported, setReported] = useState(false);
  if (!questions.length) return null;
  const answered = questions.filter((q) => picked[q.id] !== undefined).length;
  const correct = questions.filter((q) => picked[q.id] === q.answer).length;

  const pick = (q: QuizQuestion, k: number) => {
    if (picked[q.id] !== undefined) return;
    const next = { ...picked, [q.id]: k };
    setPicked(next);
    if (Object.keys(next).length === questions.length && !reported) {
      setReported(true);
      onDone(questions.filter((x) => next[x.id] === x.answer).length);
    }
  };

  return (
    <div className="rounded-lg border border-line p-4 space-y-4 text-sm">
      <div className="flex items-baseline justify-between gap-2">
        <div className="font-medium">🎓 Bạn hiểu lượt chơi vừa rồi tới đâu?</div>
        <div className="text-xs text-muted tabular-nums">
          {answered}/{questions.length} · mỗi câu đúng +{QUIZ_XP} XP
        </div>
      </div>
      {questions.map((q, i) => {
        const p = picked[q.id];
        return (
          <div key={q.id} className="space-y-2">
            <div className="font-medium">
              {i + 1}. {q.prompt}
            </div>
            <div className="grid gap-1.5">
              {q.options.map((o, k) => {
                const isAns = k === q.answer;
                const chosen = p === k;
                const style = p === undefined ? undefined : isAns ? { borderColor: "var(--up)", color: "var(--up)" } : chosen ? { borderColor: "var(--down)", color: "var(--down)" } : undefined;
                return (
                  <button
                    key={k}
                    type="button"
                    disabled={p !== undefined}
                    onClick={() => pick(q, k)}
                    className="text-left px-3 py-2 rounded-lg border border-line hover:border-accent disabled:hover:border-line"
                    style={style}
                  >
                    {p !== undefined && isAns ? "✓ " : p !== undefined && chosen ? "✗ " : ""}
                    {o}
                  </button>
                );
              })}
            </div>
            {p !== undefined && <p className="text-xs leading-relaxed rounded-lg bg-surface-2 p-2.5">{q.explain}</p>}
          </div>
        );
      })}
      {answered === questions.length && (
        <div className="font-medium">
          Đúng {correct}/{questions.length} câu{correct === questions.length ? " 🎉" : "."}
        </div>
      )}
    </div>
  );
}
