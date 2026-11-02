import Link from "next/link";
import { INDICATOR_BY_ID } from "@/content/indicators";
import { TERMS } from "@/content/glossary";

/** Thuật ngữ trong trang Thuật ngữ có liên quan tới một chỉ số trên bản đồ. */
export function termsFor(id: string) {
  const own = INDICATOR_BY_ID[id]?.termId;
  return TERMS.filter((t) => t.id === own || t.related?.includes(id)).sort((a, b) => (a.id === own ? -1 : b.id === own ? 1 : 0));
}

export default function RelatedTerms({ id, limit = 6 }: { id: string; limit?: number }) {
  const terms = termsFor(id).slice(0, limit);
  if (!terms.length) return null;
  return (
    <div>
      <h3 className="text-sm font-medium mb-1.5">Thuật ngữ nên biết</h3>
      <ul className="space-y-1.5">
        {terms.map((t) => (
          <li key={t.id}>
            <Link href={`/thuat-ngu#${t.id}`} className="block rounded-lg border border-line px-3 py-2 hover:border-accent">
              <div className="text-sm font-medium">{t.term}</div>
              <div className="text-xs text-muted mt-0.5 leading-relaxed">{t.short}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
