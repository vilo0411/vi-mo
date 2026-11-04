"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { TERM_CATEGORIES, TERM_SOURCES, TERMS, type TermCategory } from "@/content/glossary";
import { fold } from "@/lib/text";

export default function Glossary() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<TermCategory | "all">("all");
  const router = useRouter();

  // Link cũ dạng /thuat-ngu#id chuyển sang trang riêng của thuật ngữ.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (TERMS.some((t) => t.id === id)) router.replace(`/thuat-ngu/${id}`);
  }, [router]);

  const list = useMemo(() => {
    const needle = fold(q.trim());
    return TERMS.filter((t) => (cat === "all" || t.category === cat) && (!needle || fold(`${t.term} ${t.en} ${t.short}`).includes(needle)));
  }, [q, cat]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm thuật ngữ, ví dụ: lạm phát cơ bản, PMI, QE"
          className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          aria-label="Tìm thuật ngữ"
        />
        <span className="text-sm text-muted">{list.length} thuật ngữ</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["all", ...Object.keys(TERM_CATEGORIES)] as (TermCategory | "all")[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`text-xs px-3 py-1.5 rounded-full border ${cat === c ? "border-accent text-accent bg-accent-soft" : "border-line text-muted hover:text-text"}`}
          >
            {c === "all" ? "Tất cả" : TERM_CATEGORIES[c]}
          </button>
        ))}
      </div>

      {list.length === 0 && <p className="text-sm text-muted">Không tìm thấy thuật ngữ nào. Thử từ khóa khác hoặc xem trong Từ điển chỉ số.</p>}

      <div className="grid gap-3 md:grid-cols-2">
        {list.map((t) => (
          <Link key={t.id} href={`/thuat-ngu/${t.id}`} className="block bg-surface border border-line rounded-xl p-4 hover:border-accent transition-colors">
            <span className="flex items-baseline justify-between gap-3">
              <span className="font-semibold">{t.term}</span>
              <span className="text-xs text-muted whitespace-nowrap">{TERM_CATEGORIES[t.category]}</span>
            </span>
            <span className="block text-xs text-muted italic mt-0.5">{t.en}</span>
            <span className="block text-sm mt-2 leading-relaxed">{t.short}</span>
          </Link>
        ))}
      </div>

      <section className="text-sm text-muted">
        <h2 className="font-medium text-text mb-1">Đọc thêm</h2>
        <ul className="space-y-0.5">
          {TERM_SOURCES.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-text">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
