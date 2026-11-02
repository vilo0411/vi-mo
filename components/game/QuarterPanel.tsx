import type { Driver, QuarterNote } from "@/lib/game";
import { narrateQuarter } from "@/lib/narration";
import { plainOf, ruleText, type WhyStep } from "@/lib/why";
import { QUARTER_LABEL } from "./PlaybackBar";
import SpeakButton from "./Speak";

const NOTES_SHOWN = 6;

/** Các nguồn tác động của một chỉ số, mỗi nguồn một nhãn: sự kiện trong câu chuyện hay lựa chọn của bạn. */
export function DriverChips({ drivers }: { drivers: Driver[] }) {
  if (!drivers.length) return null;
  return (
    <span className="flex flex-wrap gap-1.5">
      {drivers.slice(0, 3).map((d) => (
        <span
          key={d.key}
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]"
          style={{ borderColor: d.kind === "you" ? "var(--accent)" : "var(--g-ben-ngoai)" }}
        >
          <span className="font-medium" style={{ color: d.kind === "you" ? "var(--accent)" : "var(--g-ben-ngoai)" }}>
            {d.kind === "you" ? `Bạn, năm ${d.year}:` : `Sự kiện năm ${d.year}:`}
          </span>
          <span>{d.label}</span>
          {d.real && (
            <span className="tabular-nums font-medium" style={{ color: d.helps === null ? "var(--text)" : d.helps ? "var(--up)" : "var(--down)" }}>
              {d.amount}
            </span>
          )}
        </span>
      ))}
    </span>
  );
}

const DIRECT_TAG = {
  you: { text: "Quyết định của bạn", tone: "var(--accent)" },
  event: { text: "Sự kiện", tone: "var(--g-ben-ngoai)" },
  ended: { text: "Cú sốc đã qua", tone: "var(--muted)" },
} as const;

/** Chuyện gì vừa xảy ra trong quý đang xem: chỉ số nào đổi, do sự kiện nào hay lựa chọn nào, qua đường nào. */
export default function QuarterPanel({
  notes,
  q,
  year,
  story,
  choice,
  intro,
  outro,
  last = false,
  seen,
  narration,
}: {
  /** Lời kể đã tính sẵn (để khớp với bản đã tải trước); bỏ trống thì tự tính từ notes */
  narration?: string;
  /** Các chuỗi "vì sao" đã kể ở quý trước, để lời kể không lặp */
  seen?: Set<string>;
  notes: QuarterNote[];
  q: number;
  year: number;
  story: string;
  choice: string;
  /** Lời dẫn đọc trước quý đầu: bạn vừa chọn gì */
  intro?: string;
  /** Lời kết thay cho "bấm sang quý sau", ví dụ khi bị cách chức */
  outro?: string;
  last?: boolean;
}) {
  const shown = notes.slice(0, NOTES_SHOWN);
  const rest = notes.length - shown.length;
  return (
    <div className="bg-surface border border-line rounded-xl p-5 space-y-3" aria-live="polite">
      <div>
        <div className="text-xs text-muted">
          Năm {year} · {story} · bạn chọn &ldquo;{choice}&rdquo;
        </div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold">{QUARTER_LABEL(q)}: chuyện gì vừa xảy ra?</h3>
          <SpeakButton
            id={`quarter-${year}-${q}`}
            auto
            text={narration ?? narrateQuarter(notes, q, { intro: q === 0 ? intro : undefined, outro, last, year, seen })}
          />
        </div>
        {q === 0 && <p className="text-xs text-muted mt-0.5">Cú sốc và công cụ của bạn thay đổi ngay. Những chỉ số khác cần vài quý mới phản ứng, bấm sang quý sau để xem.</p>}
      </div>
      {!shown.length ? (
        <p className="text-sm text-muted">Quý này không có thay đổi đáng kể. Các chỉ số giữ gần như nguyên mức của quý trước.</p>
      ) : (
        <ol className="space-y-2">
          {shown.map((n, k) => (
            <li key={n.id} className="anim-toast rounded-lg border border-line p-3 text-sm space-y-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="font-medium">
                  {n.name}
                  {n.direct && (
                    <span className="ml-2 text-[11px] font-medium" style={{ color: DIRECT_TAG[n.direct].tone }}>
                      {DIRECT_TAG[n.direct].text}
                    </span>
                  )}
                </span>
                <span className="tabular-nums font-medium" style={{ color: n.good === null ? "var(--text)" : n.good ? "var(--up)" : "var(--down)" }}>
                  {n.change}
                  {n.good !== null && <span className="text-xs font-normal"> {n.good ? "· tốt" : "· xấu"}</span>}
                </span>
              </div>
              <p className="leading-relaxed">{n.verdict}</p>
              {!n.direct && <DriverChips drivers={n.drivers} />}
              {n.why?.length ? (
                <WhyBox steps={n.why} open={k < 2} />
              ) : (
                n.path &&
                n.path.length > 1 && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted">
                      Đường lan truyền: <span className="text-text">{n.path.join(" → ")}</span> <span className="text-accent">· vì sao?</span>
                    </summary>
                    {n.mechanism && <p className="leading-relaxed mt-1.5 pl-3 border-l-2 border-line">{n.mechanism}</p>}
                  </details>
                )
              )}
              {plainOf(n.id) && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted">ⓘ {n.name} là gì?</summary>
                  <p className="leading-relaxed mt-1 pl-3 border-l-2 border-line">{plainOf(n.id)}</p>
                </details>
              )}
            </li>
          ))}
        </ol>
      )}
      {rest > 0 && <p className="text-xs text-muted">và {rest} thay đổi nhỏ khác, xem trên bản đồ.</p>}
    </div>
  );
}

/** Vì sao chỉ số đổi: từng bước của đường nhân quả, mỗi bước kèm quy luật bằng lời thường. */
export function WhyBox({ steps, open = false, title = "Vì sao?" }: { steps: WhyStep[]; open?: boolean; title?: string }) {
  return (
    <details open={open} className="text-xs rounded-lg bg-surface-2 p-2.5">
      <summary className="cursor-pointer font-medium text-accent">{title}</summary>
      <ol className="mt-1.5 space-y-1.5">
        {steps.map((st, i) => (
          <li key={i} className="flex gap-2">
            <span className="w-4 h-4 shrink-0 rounded-full bg-surface flex items-center justify-center text-[10px] font-semibold mt-0.5">{i + 1}</span>
            <span className="leading-relaxed">
              <span className="font-medium">{st.text}</span>
              <span className="block text-muted">{ruleText(st)}</span>
            </span>
          </li>
        ))}
      </ol>
    </details>
  );
}
