"use client";

import { useState } from "react";
import type { Quiz } from "@/content/lessons";
import { useProgress } from "@/lib/progress";

export default function LessonQuiz({ slug, quiz }: { slug: string; quiz: Quiz[] }) {
  const { progress, completeLesson } = useProgress();
  const [picked, setPicked] = useState<(number | null)[]>(quiz.map(() => null));
  const done = !!progress.lessons[slug];
  const allRight = picked.every((p, i) => p === quiz[i].answer);

  const pick = (qi: number, oi: number) => {
    const next = picked.map((p, i) => (i === qi ? oi : p));
    setPicked(next);
    if (next.every((p, i) => p === quiz[i].answer)) completeLesson(slug);
  };

  return (
    <div className="space-y-4">
      {quiz.map((q, qi) => {
        const p = picked[qi];
        return (
          <div key={qi} className="bg-surface border border-line rounded-xl p-4 space-y-3">
            <div className="font-medium">
              Câu {qi + 1}. {q.q}
            </div>
            <div className="space-y-2">
              {q.options.map((o, oi) => {
                const chosen = p === oi;
                const right = oi === q.answer;
                const style =
                  p === null ? "border-line hover:border-accent" : chosen && right ? "border-up bg-surface-2" : chosen ? "border-down" : "border-line opacity-70";
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => pick(qi, oi)}
                    disabled={p === q.answer}
                    className={`w-full text-left text-sm rounded-lg border px-3 py-2 ${style}`}
                    style={chosen ? { borderColor: right ? "var(--up)" : "var(--down)" } : undefined}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
            {p !== null && (
              <p className="text-sm leading-relaxed" style={{ color: p === q.answer ? "var(--up)" : "var(--down)" }}>
                {p === q.answer ? "Đúng rồi. " : "Chưa đúng, thử lại nhé. "}
                {p === q.answer && <span style={{ color: "var(--text)" }}>{q.explain}</span>}
              </p>
            )}
          </div>
        );
      })}
      {(allRight || done) && (
        <div className="rounded-xl p-4 text-sm" style={{ background: "color-mix(in srgb, var(--up) 12%, var(--surface))" }}>
          <span className="font-medium" style={{ color: "var(--up)" }}>
            Đã hoàn thành bài này.
          </span>{" "}
          Tiến độ được lưu trong trình duyệt của bạn.
        </div>
      )}
    </div>
  );
}
