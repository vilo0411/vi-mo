import Link from "next/link";
import { GROUPS, INDICATORS, type Group } from "@/content/indicators";
import { formatValue, getSeries, latest } from "@/lib/data";

export const metadata = { title: "Từ điển chỉ số · Vĩ mô Việt Nam" };

export default function Dictionary() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold">Từ điển chỉ số</h1>
        <p className="text-sm text-muted mt-1">
          {INDICATORS.length} chỉ số, chia theo vai trò trong nền kinh tế. Mỗi trang có định nghĩa, cách tính, ai công bố, cách đọc và dữ liệu thật.
        </p>
      </div>
      {(Object.keys(GROUPS) as Group[]).map((g) => (
        <section key={g}>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: `var(--g-${g})` }} />
            {GROUPS[g].name}
          </h2>
          <p className="text-sm text-muted mb-3">{GROUPS[g].hint}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INDICATORS.filter((i) => i.group === g).map((i) => {
              const s = getSeries(i.seriesId);
              const last = latest(s);
              return (
                <Link key={i.id} href={`/tu-dien/${i.id}`} className="block bg-surface border border-line rounded-xl p-4 hover:border-accent transition-colors">
                  <div className="flex justify-between gap-2 items-baseline">
                    <span className="font-medium">{i.name}</span>
                    {last && <span className="text-sm tabular-nums">{formatValue(last.value, s?.unit)}</span>}
                  </div>
                  <p className="text-sm text-muted mt-1 line-clamp-2">{i.definition}</p>
                  {last && <p className="text-xs text-muted mt-2">Số liệu mới nhất: năm {last.year}</p>}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
