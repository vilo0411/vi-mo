import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { INDICATOR_BY_ID } from "@/content/indicators";

const TOKEN = /(\*\*[^*]+\*\*|\[\[[^|\]]+\|[^\]]+\]\])/g;

function inline(text: string, onMetric?: (id: string) => void): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    const bold = part.match(/^\*\*(.+)\*\*$/);
    if (bold) return <b key={i} className="font-semibold">{inline(bold[1], onMetric)}</b>;
    const ref = part.match(/^\[\[([^|\]]+)\|([^\]]+)\]\]$/);
    if (!ref) return <Fragment key={i}>{part}</Fragment>;
    const [, id, label] = ref;
    const className = "text-accent underline decoration-dotted underline-offset-2";
    if (!INDICATOR_BY_ID[id]) return <Link key={i} href={`/thuat-ngu/${id}`} className={className}>{label}</Link>;
    if (onMetric) return <button key={i} type="button" onClick={() => onMetric(id)} className={className}>{label}</button>;
    return <Link key={i} href={`/tu-dien/${id}`} className={className}>{label}</Link>;
  });
}

/** Hiện **đậm** và [[id|nhãn]]. Trên bản đồ, truyền onMetric để mở chỉ số ngay trong panel. */
export default function RichText({ text, onMetric }: { text: string; onMetric?: (id: string) => void }) {
  return <>{inline(text, onMetric)}</>;
}

/** Lấy mọi id được nhắc tới, dùng trong test. */
export function refsIn(text: string) {
  return [...text.matchAll(/\[\[([^|\]]+)\|/g)].map((m) => m[1]);
}
