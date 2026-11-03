"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { INDICATORS } from "@/content/indicators";
import { FEATURED_KEYS, LIBRARY_CATEGORIES, LIBRARY_ITEMS, TYPE_LABELS, type LibraryCategory, type LibraryItem, type LibraryItemType } from "@/content/library";
import { firstMapWith } from "@/content/maps";
import { useProgress } from "@/lib/progress";
import { fold } from "@/lib/text";

type Filter = LibraryItemType | "all";

const TYPES = Object.keys(TYPE_LABELS) as LibraryItemType[];

export default function Library() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const { progress, loaded, toggleSaved } = useProgress();

  const needle = fold(q.trim());
  const items = useMemo(
    () => LIBRARY_ITEMS.filter((it) => (filter === "all" || it.type === filter) && (!needle || fold(`${it.name} ${it.hint}`).includes(needle))),
    [filter, needle],
  );
  const indicators = useMemo(() => (needle ? INDICATORS.filter((i) => fold(`${i.name} ${i.short}`).includes(needle)) : []), [needle]);
  const browsing = !needle && filter === "all";
  const featured = FEATURED_KEYS.map((k) => LIBRARY_ITEMS.find((it) => it.key === k)!);
  const saved = LIBRARY_ITEMS.filter((it) => progress.savedItems[it.key]);

  const card = (it: LibraryItem) => (
    <LibraryCard key={it.key} item={it} seen={loaded && !!progress.seenItems[it.key]} saved={loaded && !!progress.savedItems[it.key]} onToggleSaved={() => toggleSaved(it.key)} />
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_230px] lg:items-start">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Kinh tế vĩ mô <span className="text-accent">theo từng chủ đề</span>
          </h1>
          <p className="text-muted mt-3 max-w-2xl leading-relaxed">
            Chọn một chủ đề. Mỗi bản đồ cho thấy chỉ số nào tác động tới chỉ số nào, cùng chiều hay ngược chiều, và đâu là cần gạt mà chính sách thật sự kéo được.
          </p>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm chủ đề hoặc chỉ số, ví dụ: lạm phát, tỷ giá"
            className="mt-5 w-full max-w-xl rounded-lg border border-line bg-surface px-3 py-2.5 text-sm"
            aria-label="Tìm trong thư viện"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {(["all", ...TYPES] as Filter[]).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={filter === t}
                onClick={() => setFilter(t)}
                className={`text-xs px-3 py-1.5 rounded-full border ${filter === t ? "border-accent text-accent bg-accent-soft" : "border-line text-muted hover:text-text"}`}
              >
                {t === "all" ? "Tất cả" : TYPE_LABELS[t]} <span className="tabular-nums opacity-70">{t === "all" ? LIBRARY_ITEMS.length : LIBRARY_ITEMS.filter((it) => it.type === t).length}</span>
              </button>
            ))}
            <Link href="/tu-dien" className="text-xs px-3 py-1.5 rounded-full border border-line text-muted hover:text-text">
              Từ điển chỉ số <span className="tabular-nums opacity-70">{INDICATORS.length}</span>
            </Link>
          </div>
        </div>
        <LibraryStats />
      </div>

      {browsing && (
        <section className="rounded-2xl border border-accent bg-accent-soft p-4 sm:p-5">
          <h2 className="font-semibold">Mới bắt đầu? Đi theo thứ tự này</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{featured.map(card)}</div>
        </section>
      )}

      {browsing && loaded && saved.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Đã lưu</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{saved.map(card)}</div>
        </section>
      )}

      {indicators.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Chỉ số khớp với từ khóa</h2>
          <div className="flex flex-wrap gap-2">
            {indicators.map((i) => (
              <Link key={i.id} href={`/ban-do/${firstMapWith(i.id)}?m=${i.id}`} className="text-sm px-3 py-1.5 rounded-lg border border-line bg-surface hover:border-accent">
                {i.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {(Object.keys(LIBRARY_CATEGORIES) as LibraryCategory[]).map((c) => {
        const inCategory = items.filter((it) => it.category === c);
        if (inCategory.length === 0) return null;
        const meta = LIBRARY_CATEGORIES[c];
        return (
          <section key={c}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
              <span className="w-8 h-8 rounded-lg border border-line bg-surface grid place-items-center text-muted" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={meta.icon} />
                </svg>
              </span>
              <h2 className="text-lg font-semibold">{meta.name}</h2>
              <p className="text-sm text-muted">{meta.hint}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{inCategory.map(card)}</div>
          </section>
        );
      })}

      {items.length === 0 && indicators.length === 0 && <p className="text-sm text-muted">Không tìm thấy mục nào. Thử từ khóa khác hoặc xem trong Từ điển chỉ số.</p>}
    </div>
  );
}

function LibraryStats() {
  const rows: [string, number][] = [
    ["Chủ đề", Object.keys(LIBRARY_CATEGORIES).length],
    ...TYPES.map((t): [string, number] => [TYPE_LABELS[t], LIBRARY_ITEMS.filter((it) => it.type === t).length]),
    ["Chỉ số", INDICATORS.length],
  ];
  return (
    <aside className="bg-surface border border-line rounded-xl px-4 py-3" aria-label="Thư viện có gì">
      <p className="text-xs uppercase tracking-wider text-muted">Trong thư viện</p>
      <dl className="mt-1 divide-y divide-line text-sm">
        {rows.map(([label, n]) => (
          <div key={label} className="flex items-baseline justify-between py-2">
            <dt className="text-muted">{label}</dt>
            <dd className="font-semibold tabular-nums">{n}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

function LibraryCard({ item, seen, saved, onToggleSaved }: { item: LibraryItem; seen: boolean; saved: boolean; onToggleSaved: () => void }) {
  return (
    <article className="relative flex flex-col min-h-36 bg-surface border border-line rounded-xl p-4 hover:border-accent transition-colors">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="px-1.5 py-0.5 rounded border border-line text-muted">{TYPE_LABELS[item.type]}</span>
        {seen && <span className="text-accent">Đã xem</span>}
      </div>
      <h3 className="mt-3 font-semibold leading-snug">
        <Link href={item.href} title={item.hint} className="after:absolute after:inset-0 after:rounded-xl">
          {item.name}
        </Link>
      </h3>
      <div className="mt-auto pt-3 flex items-center justify-between text-xs text-muted">
        <span className="tabular-nums">{item.countLabel}</span>
        <button
          type="button"
          onClick={onToggleSaved}
          aria-pressed={saved}
          aria-label={saved ? `Bỏ lưu ${item.name}` : `Lưu ${item.name}`}
          className={`relative z-10 -m-1.5 p-1.5 ${saved ? "text-accent" : "hover:text-text"}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
            <path d="M6 3h12v18l-6-4.500L6 21V3Z" />
          </svg>
        </button>
      </div>
    </article>
  );
}
