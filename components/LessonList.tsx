"use client";

import Link from "next/link";
import { LESSONS } from "@/content/lessons";
import { SCENARIOS } from "@/content/scenarios";
import { useProgress } from "@/lib/progress";

export default function LessonList() {
  const { progress } = useProgress();
  const done = LESSONS.filter((l) => progress.lessons[l.slug]).length;
  const stars = SCENARIOS.reduce((s, sc) => s + (progress.stars[sc.id] ?? 0), 0);
  const nextLesson = LESSONS.find((l) => !progress.lessons[l.slug]);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="text-xs text-muted">Bài đã học</div>
          <div className="text-2xl font-semibold mt-1 tabular-nums">
            {done}/{LESSONS.length}
          </div>
          <div className="h-1.5 bg-surface-2 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-accent" style={{ width: `${(done / LESSONS.length) * 100}%` }} />
          </div>
        </div>
        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="text-xs text-muted">Sao từ thử thách</div>
          <div className="text-2xl font-semibold mt-1 tabular-nums">
            {stars}/{SCENARIOS.length * 3}
          </div>
          <Link href="/thu-thach" className="text-xs text-accent mt-2 inline-block">
            Chơi thử thách →
          </Link>
        </div>
      </div>

      <ol className="space-y-3">
        {LESSONS.map((l, i) => {
          const isDone = !!progress.lessons[l.slug];
          const isNext = nextLesson?.slug === l.slug;
          return (
            <li key={l.slug}>
              <Link
                href={`/lo-trinh/${l.slug}`}
                className={`flex gap-4 items-start bg-surface border rounded-xl p-4 hover:border-accent transition-colors ${isNext ? "border-accent" : "border-line"}`}
              >
                <span
                  className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{ background: isDone ? "var(--up)" : "var(--surface-2)", color: isDone ? "white" : "var(--muted)" }}
                >
                  {isDone ? "✓" : i + 1}
                </span>
                <span className="flex-1">
                  <span className="font-medium block">{l.title}</span>
                  <span className="text-sm text-muted block mt-0.5">{l.question}</span>
                </span>
                <span className="text-xs text-muted whitespace-nowrap">
                  {isNext ? <span className="text-accent font-medium">Học tiếp</span> : `${l.minutes} phút`}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
