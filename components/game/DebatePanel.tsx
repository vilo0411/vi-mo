import type { Debate } from "@/content/scenarios";

/** Hai cố vấn nói ngược nhau. Họ có lý riêng và đều có thể sai. */
export default function DebatePanel({ debate }: { debate: Debate }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {[
        { name: "Cố vấn Hùng", side: "Trị nhanh, sợ mất niềm tin", text: debate.hung },
        { name: "Cố vấn Lan", side: "Tìm gốc cơn sốt", text: debate.lan },
      ].map((a) => (
        <div key={a.name} className="bg-surface border border-line rounded-xl p-3 text-sm leading-relaxed">
          <div className="font-medium">{a.name}</div>
          <div className="text-xs text-muted mb-1">{a.side}</div>
          &ldquo;{a.text}&rdquo;
        </div>
      ))}
    </div>
  );
}
