import type { TaylorAdvice } from "@/lib/advisor";
import SpeakButton from "./Speak";

/** Lời khuyên của cố vấn: lập luận theo quy tắc Taylor, và (nếu có) phương án tính trước tốt nhất. */
export default function AdvisorPanel({ advice, pick, onClose }: { advice: TaylorAdvice; pick?: { label: string; points: number }; onClose: () => void }) {
  return (
    <div className="anim-toast rounded-xl border p-4 space-y-2 text-sm" style={{ borderColor: "var(--chart-3)", background: "var(--surface)" }}>
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium">🧑‍💼 Cố vấn kinh tế</div>
        <span className="flex items-center gap-2">
          <SpeakButton
            id="advisor"
            auto
            text={[...advice.lines, pick ? `Nếu là tôi, tôi chọn ${pick.label}: chơi tốt các năm sau thì có thể đạt tới ${pick.points} điểm.` : ""].join(" ")}
          />
          <button type="button" onClick={onClose} className="text-xs text-muted hover:text-text">
            Đóng
          </button>
        </span>
      </div>
      <ul className="space-y-1.5 leading-relaxed">
        {advice.lines.map((l, k) => (
          <li key={k}>• {l}</li>
        ))}
      </ul>
      {pick && (
        <p className="rounded-lg bg-surface-2 p-2.5 leading-relaxed">
          Tôi đã thử trước mọi hướng đi cho các năm tới. Nếu là tôi, tôi chọn <b className="font-medium">{pick.label}</b>: chơi tốt các năm sau thì có thể đạt tới <b className="font-medium tabular-nums">{pick.points}</b> điểm.
        </p>
      )}
      <p className="text-xs text-muted">Quy tắc Taylor chỉ là kinh nghiệm, không phải đáp án. Tự quyết mà vẫn đạt 3 sao thì bạn nhận huy hiệu &ldquo;Tự lực&rdquo;.</p>
    </div>
  );
}
