"use client";

import { useState, type ReactNode } from "react";
import type { Beat } from "@/content/lessons";
import { useProgress } from "@/lib/progress";
import LessonWidget from "../LessonWidgets";
import RichText from "../RichText";

function Think({ beat, picked, onPick }: { beat: Extract<Beat, { kind: "think" }>; picked: number | undefined; onPick: (k: number) => void }) {
  const done = picked !== undefined;
  return (
    <div className="rounded-xl border border-accent bg-accent-soft p-5 space-y-3">
      <div className="text-xs font-medium text-accent">Đoán trước khi đọc tiếp</div>
      <p className="font-medium leading-relaxed">
        <RichText text={beat.q} />
      </p>
      <div className="space-y-2">
        {beat.options.map((o, k) => {
          const right = k === beat.answer;
          const color = !done ? undefined : right ? "var(--up)" : picked === k ? "var(--down)" : undefined;
          return (
            <button
              key={k}
              type="button"
              disabled={done}
              onClick={() => onPick(k)}
              className={`w-full text-left text-sm rounded-lg border bg-surface px-3 py-2 ${done ? (right || picked === k ? "" : "opacity-60") : "border-line hover:border-accent"}`}
              style={color ? { borderColor: color } : undefined}
            >
              {o}
            </button>
          );
        })}
      </div>
      {done && (
        <p className="leading-relaxed anim-pop">
          <b className="font-medium" style={{ color: picked === beat.answer ? "var(--up)" : "var(--down)" }}>
            {picked === beat.answer ? "Đúng vậy. " : "Không hẳn. "}
          </b>
          <RichText text={beat.reveal} />
        </p>
      )}
    </div>
  );
}

/** Công thức chính xác, đứng trước ví dụ của khái niệm đó. */
function Formula({ beat }: { beat: Extract<Beat, { kind: "formula" }> }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 space-y-2">
      <div className="text-xs font-medium text-muted">Công thức · {beat.name}</div>
      {beat.expr.map((e, k) => (
        <p key={k} className="font-semibold leading-relaxed">
          {e}
        </p>
      ))}
      {beat.terms && (
        <dl className="text-sm space-y-1 leading-relaxed">
          {beat.terms.map(([t, d]) => (
            <div key={t}>
              <dt className="inline font-medium">{t}: </dt>
              <dd className="inline text-muted">{d}</dd>
            </div>
          ))}
        </dl>
      )}
      {beat.note && (
        <p className="text-sm text-muted leading-relaxed">
          <RichText text={beat.note} />
        </p>
      )}
    </div>
  );
}

/** Kể bài theo từng nhịp. Gặp câu đoán thì dừng lại, đoán xong mới hiện phần sau. Bài đã học thì mở hết. */
export default function LessonBeats({ slug, beats, children }: { slug: string; beats: Beat[]; children: ReactNode }) {
  const { progress } = useProgress();
  const [picked, setPicked] = useState<Record<number, number>>({});
  const learned = !!progress.lessons[slug];
  const firstOpen = learned ? -1 : beats.findIndex((b, k) => b.kind === "think" && picked[k] === undefined);
  const shown = firstOpen < 0 ? beats : beats.slice(0, firstOpen + 1);
  return (
    <>
      <div className="space-y-4">
        {shown.map((b, k) => {
          if (b.kind === "scene")
            return (
              <p key={k} className="text-[17px] leading-relaxed">
                <RichText text={b.text} />
              </p>
            );
          if (b.kind === "real")
            return (
              <div key={k} className="rounded-lg border-l-4 bg-surface-2 p-4 leading-relaxed" style={{ borderColor: "var(--chart-2)" }}>
                <div className="text-xs font-medium text-muted mb-1">Ngoài đời, ở Việt Nam</div>
                <RichText text={b.text} />
              </div>
            );
          if (b.kind === "formula") return <Formula key={k} beat={b} />;
          if (b.kind === "widget") return <LessonWidget key={k} id={b.id} />;
          return <Think key={k} beat={b} picked={learned ? b.answer : picked[k]} onPick={(o) => setPicked((p) => ({ ...p, [k]: o }))} />;
        })}
      </div>
      {firstOpen < 0 && children}
    </>
  );
}
