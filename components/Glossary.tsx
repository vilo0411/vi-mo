"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { INDICATOR_BY_ID } from "@/content/indicators";
import { TERM_CATEGORIES, TERM_SOURCES, TERMS, type TermCategory } from "@/content/glossary";
import SeriesChart from "./SeriesChart";

/** Bỏ dấu tiếng Việt để tìm "lam phat" vẫn ra "lạm phát". */
function fold(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}

export default function Glossary() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<TermCategory | "all">("all");
  const [open, setOpen] = useState<string | null>(null);

  // Link từ nơi khác tới /thuat-ngu#id thì mở sẵn thuật ngữ đó.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!TERMS.some((t) => t.id === id)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(id);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
  }, []);

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
        {list.map((t) => {
          const isOpen = open === t.id;
          return (
            <article key={t.id} id={t.id} className={`bg-surface border rounded-xl p-4 scroll-mt-20 ${isOpen ? "border-accent md:col-span-2" : "border-line"}`}>
              <button type="button" onClick={() => setOpen(isOpen ? null : t.id)} className="w-full text-left">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-semibold">{t.term}</h2>
                  <span className="text-xs text-muted whitespace-nowrap">{TERM_CATEGORIES[t.category]}</span>
                </div>
                <div className="text-xs text-muted italic mt-0.5">{t.en}</div>
                <p className="text-sm mt-2 leading-relaxed">{t.short}</p>
                {!isOpen && <span className="text-xs text-accent mt-2 inline-block">Đọc thêm</span>}
              </button>
              {isOpen && (
                <div className="mt-3 space-y-3">
                  <p className="text-sm leading-relaxed">{t.detail}</p>
                  {t.example && <p className="text-sm leading-relaxed border-l-2 border-accent pl-3">{t.example}</p>}
                  {t.seriesId && <SeriesChart lines={[{ id: t.seriesId, label: t.term }]} height={180} from={1995} />}
                  {t.related && (
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs text-muted">Liên quan trên bản đồ:</span>
                      {t.related.map((id) => (
                        <Link key={id} href={`/tu-dien/${id}`} className="text-xs px-2.5 py-1 rounded-full bg-surface-2 hover:text-accent">
                          {INDICATOR_BY_ID[id].name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
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
