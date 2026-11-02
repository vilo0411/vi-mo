import type { Series } from "@/lib/data";

export default function SourceBadge({ series }: { series: Series }) {
  return (
    <a
      href={series.url}
      target="_blank"
      rel="noreferrer"
      title={`Mã chuỗi: ${series.code}`}
      className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-surface-2 text-muted hover:text-text"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-up" aria-hidden />
      Dữ liệu thật · {series.source} · tải {series.updatedAt}
    </a>
  );
}
