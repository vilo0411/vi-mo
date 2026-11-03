import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GROUPS, INDICATORS, INDICATOR_BY_ID, measureOf } from "@/content/indicators";
import { effectLine, LINKS, linkKey } from "@/content/links";
import { casesMentioning } from "@/content/cases";
import { formatManual, formatValue, getSeries, latest, manualConcept, missingYears } from "@/lib/data";
import SeriesChart from "@/components/SeriesChart";
import ContributionChart from "@/components/ContributionChart";
import RelatedTerms from "@/components/RelatedTerms";
import { AnalysisSection, CalculationSection, WhySection } from "@/components/ProfileSections";
import { INDICATOR_PROFILES } from "@/content/indicatorProfiles";

const GDP_PARTS = new Set(["gdp_growth", "consumption", "investment", "gov_spending", "net_exports"]);

export function generateStaticParams() {
  return INDICATORS.map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `${INDICATOR_BY_ID[id]?.name ?? "Chỉ số"} · Từ điển` };
}

export default function IndicatorPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <IndicatorPageContent params={params} />
    </Suspense>
  );
}

async function IndicatorPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ind = INDICATOR_BY_ID[id];
  if (!ind) notFound();
  const s = getSeries(ind.seriesId);
  const last = latest(s);
  const gaps = missingYears(s);
  const outgoing = LINKS.filter((l) => l.from === id);
  const incoming = LINKS.filter((l) => l.to === id);
  const cases = casesMentioning(id);
  const manual = ind.concept ? manualConcept(id) : undefined;
  const profile = INDICATOR_PROFILES[id];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link href="/tu-dien" className="text-sm text-muted hover:text-text">← Từ điển</Link>
        <div className="text-xs font-medium mt-3" style={{ color: `var(--g-${ind.group})` }}>{GROUPS[ind.group].name}</div>
        <h1 className="text-2xl font-semibold">{ind.name}</h1>
        {last && (
          <p className="text-sm text-muted mt-1">
            Năm {last.year}: <span className="text-text font-medium">{formatValue(last.value, s?.unit)}</span>
          </p>
        )}
        {manual && (
          <p className="text-sm text-muted mt-1">
            {manual.label} năm {manual.year}: <span className="text-text font-medium">{formatManual(manual)}</span>.{" "}
            <a href={manual.source} target="_blank" rel="noreferrer" className="text-accent">Nguồn ↗</a>
          </p>
        )}
      </div>

      <p className="leading-relaxed">{ind.definition}</p>
      {measureOf(ind, s?.unit).explain && (
        <p className="text-sm rounded-lg bg-accent-soft p-3 leading-relaxed">
          <b className="font-medium">{measureOf(ind, s?.unit).label}.</b> {measureOf(ind, s?.unit).explain}
        </p>
      )}

      <div className="bg-surface border border-line rounded-xl p-4">
        <SeriesChart lines={[{ id: ind.seriesId, label: ind.name }, ...(ind.extraSeries ?? [])]} height={280} from={1990} />
        {(ind.dataNote || gaps > 0) && (
          <p className="text-xs text-muted mt-3">
            {ind.dataNote}
            {gaps > 0 && ` Dữ liệu không đầy đủ: thiếu ${gaps} năm trong khoảng ${s!.points[0].year}–${last!.year}.`}
          </p>
        )}
      </div>

      <dl className="grid sm:grid-cols-2 gap-4">
        <Fact title="Cách tính" body={ind.formula} />
        <Fact title="Ai công bố" body={ind.publisher} />
        <Fact title="Tần suất" body={ind.frequency} />
        <Fact title="Đơn vị trong app" body={s?.unit ?? "—"} />
      </dl>

      <section>
        <h2 className="text-lg font-semibold mb-2">Đọc thế nào?</h2>
        <p className="leading-relaxed">{ind.howToRead}</p>
      </section>

      {profile && (
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Cách tính và điểm dễ hiểu sai</h2>
            <CalculationSection profile={profile} />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Vì sao nên quan tâm</h2>
            <WhySection profile={profile} />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Phân tích sâu hơn</h2>
            <AnalysisSection profile={profile} />
          </div>
        </section>
      )}

      {GDP_PARTS.has(ind.id) && (
        <section id="dong-gop" className="scroll-mt-20">
          <h2 className="text-lg font-semibold mb-1">Đóng góp vào tăng trưởng GDP</h2>
          <p className="text-sm text-muted mb-3 leading-relaxed">
            Tỷ trọng của C, I, G, X − M cộng lại xấp xỉ 100% GDP, không phải bằng tốc độ tăng GDP. Để biết mỗi phần góp bao nhiêu vào con số tăng trưởng, phải nhân tỷ trọng với tốc độ tăng của chính phần đó.
          </p>
          <div className="bg-surface border border-line rounded-xl p-4">
            <ContributionChart />
          </div>
        </section>
      )}

      <section className="grid md:grid-cols-2 gap-6">
        <Relations title="Ảnh hưởng tới" links={outgoing} side="to" />
        <Relations title={`Cái gì tác động tới ${ind.name}`} links={incoming} side="from" />
      </section>

      <RelatedTerms id={id} limit={10} />

      {cases.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Xuất hiện trong case study</h2>
          <ul className="space-y-1">
            {cases.map((c) => (
              <li key={c.slug}>
                <Link href={`/case-study/${c.slug}`} className="text-accent">
                  {c.period}: {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Fact({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <dt className="text-xs text-muted">{title}</dt>
      <dd className="text-sm mt-1 leading-relaxed">{body}</dd>
    </div>
  );
}

function Relations({ title, links, side }: { title: string; links: typeof LINKS; side: "from" | "to" }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {links.length === 0 ? (
        <p className="text-sm text-muted">Không có trong bản đồ.</p>
      ) : (
        <ul className="space-y-3">
          {links.map((l) => {
            const other = INDICATOR_BY_ID[side === "to" ? l.to : l.from];
            return (
              <li key={linkKey(l)} className="text-sm">
                <Link href={`/tu-dien/${other.id}`} className="font-medium hover:text-accent">
                  <span style={{ color: l.sign > 0 ? "var(--chart-2)" : "var(--chart-1)" }}>{l.sign > 0 ? "+" : "−"}</span> {other.name}
                </Link>
                <p className="mt-0.5 leading-relaxed">{effectLine(INDICATOR_BY_ID[l.from].name, INDICATOR_BY_ID[l.to].name, l.sign)}</p>
                <p className="text-muted mt-0.5 leading-relaxed">{l.mechanism}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
