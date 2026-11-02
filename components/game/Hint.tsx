"use client";

import { useEffect, useState } from "react";

// Hướng dẫn lần đầu: trạng thái lưu trong trình duyệt, chỉ là tiện ích nên đọc ghi lỗi thì coi như chưa xem.
const KEY = "vi-mo:hints";
const EVENT = "vi-mo:hints";
type State = { off: boolean; seen: Record<string, true> };

function read(): State {
  try {
    const raw = localStorage.getItem(KEY);
    const p = raw ? (JSON.parse(raw) as Partial<State>) : {};
    return { off: !!p.off, seen: p.seen ?? {} };
  } catch {
    return { off: false, seen: {} };
  }
}

function write(s: State) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function resetHints() {
  write({ off: false, seen: {} });
}

export function useHints() {
  const [state, setState] = useState<State | null>(null);
  useEffect(() => {
    const sync = () => setState(read());
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  return state;
}

/** Ô gợi ý tại chỗ cho người chơi lần đầu. `enabled` false thì không hiện (ví dụ đã chơi xong một nhiệm kỳ). */
export default function Hint({ id, title, children, enabled = true }: { id: string; title: string; children: React.ReactNode; enabled?: boolean }) {
  const state = useHints();
  if (!enabled || !state || state.off || state.seen[id]) return null;
  return (
    <div className="anim-toast rounded-xl border-2 border-dashed p-3 text-sm space-y-2" style={{ borderColor: "var(--chart-2)" }} role="note">
      <div className="flex items-start gap-2">
        <span aria-hidden>💡</span>
        <div className="flex-1">
          <div className="font-medium">{title}</div>
          <div className="text-muted leading-relaxed mt-0.5">{children}</div>
        </div>
      </div>
      <div className="flex gap-3 text-xs pl-6">
        <button type="button" onClick={() => write({ ...state, seen: { ...state.seen, [id]: true } })} className="px-2.5 py-1 rounded-lg bg-accent text-white">
          Đã hiểu
        </button>
        <button type="button" onClick={() => write({ ...state, off: true })} className="text-muted hover:text-text">
          Tắt hướng dẫn
        </button>
      </div>
    </div>
  );
}
