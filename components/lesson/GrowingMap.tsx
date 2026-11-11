"use client";

import { useMemo } from "react";
import { LESSONS } from "@/content/lessons";
import { LINKS } from "@/content/links";
import { useProgress } from "@/lib/progress";
import { INDICATOR_BY_ID } from "@/content/indicators";
import MacroGraph, { latestState, type NodeState } from "../MacroGraph";

/** Mọi chỉ số đã gặp tính tới hết bài thứ `upTo`. */
const idsUpTo = (upTo: number) => [...new Set(LESSONS.slice(0, upTo + 1).filter((l) => l.beats).flatMap((l) => l.indicators))];

/** Bản đồ của người học lớn dần theo bài: phần mới của bài này được làm sáng. */
export function LessonMap({ slug }: { slug: string }) {
  const idx = LESSONS.findIndex((l) => l.slug === slug);
  const fresh = useMemo(() => {
    const before = new Set(idsUpTo(idx - 1));
    return new Set(LESSONS[idx].indicators.filter((id) => !before.has(id)));
  }, [idx]);
  // Chỉ hiện mảnh mới và những mảnh cũ nối thẳng với nó, để thẻ đủ lớn mà đọc được.
  const ids = useMemo(() => {
    const known = new Set(idsUpTo(idx));
    const near = new Set(fresh);
    for (const l of LINKS) {
      if (fresh.has(l.from) && known.has(l.to)) near.add(l.to);
      if (fresh.has(l.to) && known.has(l.from)) near.add(l.from);
    }
    return [...near];
  }, [idx, fresh]);
  // Giữ nguyên độ rõ của các mảnh cũ, chỉ gắn nhãn cho mảnh mới.
  const nodeState = useMemo(() => {
    const out: Record<string, NodeState> = {};
    for (const id of ids) out[id] = { ...latestState(INDICATOR_BY_ID[id]), ...(fresh.has(id) ? { badge: { text: "Mới", tone: "you" as const } } : {}) };
    return out;
  }, [ids, fresh]);
  return (
    <section>
      <h2 className="text-lg font-semibold">Bản đồ của bạn lớn thêm</h2>
      <p className="text-sm text-muted mt-1 mb-3">
        {idx === 0 ? "Đây là ba mảnh đầu tiên." : `Thêm ${fresh.size} mảnh mới, nối vào ${ids.length - fresh.size} mảnh bạn đã có.`} Mỗi mũi tên là một quan hệ nhân quả.
      </p>
      <div className="rounded-xl border border-line bg-surface overflow-hidden">
        <MacroGraph visibleIds={ids} nodeState={nodeState} height={idx === 0 ? 300 : 460} draggable={false} />
      </div>
    </section>
  );
}

/** Bản đồ ở trang lộ trình: chỉ gồm những bài đã học. */
export function JourneyMap() {
  const { progress, loaded } = useProgress();
  const ids = useMemo(() => [...new Set(LESSONS.filter((l) => l.beats && progress.lessons[l.slug]).flatMap((l) => l.indicators))], [progress.lessons]);
  if (!loaded || ids.length === 0) return null;
  return (
    <section>
      <h2 className="font-semibold mb-2">Bản đồ bạn đã ghép được</h2>
      <div className="rounded-xl border border-line bg-surface overflow-hidden">
        <MacroGraph visibleIds={ids} height={320} draggable={false} />
      </div>
    </section>
  );
}
