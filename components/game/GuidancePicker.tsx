import { GUIDANCE, type Guidance } from "@/lib/game";

const ORDER: Guidance[] = ["hawk", "neutral", "dove"];

/** Chọn giọng phát ngôn đi kèm quyết định của năm. */
export default function GuidancePicker({ value, onChange }: { value: Guidance; onChange: (g: Guidance) => void }) {
  return (
    <fieldset className="bg-surface border border-line rounded-xl p-4 space-y-2">
      <legend className="sr-only">Giọng phát ngôn</legend>
      <div className="text-sm font-medium">🎙️ Giọng phát ngôn năm nay</div>
      <p className="text-xs text-muted leading-relaxed">
        Lời nói tác động lên kỳ vọng của thị trường trong 2 quý. Nói một đằng làm một nẻo (nói cứng rắn mà hạ lãi suất, hoặc ngược lại) thì thị trường mất niềm tin: tiền đồng yếu đi, lạm phát nhích lên, dù bạn nói cứng hay mềm.
      </p>
      <div className="grid grid-cols-3 gap-1.5" role="radiogroup">
        {ORDER.map((g) => (
          <button
            key={g}
            type="button"
            role="radio"
            aria-checked={value === g}
            onClick={() => onChange(g)}
            title={GUIDANCE[g].detail}
            className={`px-2 py-1.5 rounded-lg border text-sm ${value === g ? "bg-accent text-white border-accent" : "border-line"}`}
          >
            {GUIDANCE[g].label}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted">
        {GUIDANCE[value].detail}
        {value !== "neutral" && " Dòng 🎙️ trên từng phương án bên dưới cho biết lời nói này cộng thêm gì với phương án đó."}
      </p>
    </fieldset>
  );
}
