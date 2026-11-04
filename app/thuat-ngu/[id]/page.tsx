import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SeriesChart from "@/components/SeriesChart";
import { TERMS, TERM_BY_ID, TERM_CATEGORIES } from "@/content/glossary";
import { INDICATOR_BY_ID } from "@/content/indicators";
import { effectLine, LINKS, linkKey } from "@/content/links";
import { firstMapWith, MAP_BY_ID } from "@/content/maps";
import { flattenTree, TREES } from "@/content/trees";
import { jsonLd, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return TERMS.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = TERM_BY_ID[id];
  return t ? { title: `${t.term} là gì? · Thuật ngữ vĩ mô`, description: t.short } : { title: "Thuật ngữ" };
}

export default function TermPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <TermPageContent params={params} />
    </Suspense>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold mb-2">{children}</h2>;
}

async function TermPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = TERM_BY_ID[id];
  if (!t) notFound();

  const related = (t.related ?? []).map((r) => INDICATOR_BY_ID[r]);
  const main = related[0];
  const moves = main ? LINKS.filter((l) => l.to === main.id).slice(0, 4) : [];
  const siblings = TERMS.filter((o) => o.category === t.category && o.id !== t.id);
  const mapId = main ? firstMapWith(main.id) : undefined;
  const trees = TREES.filter((tree) => flattenTree(tree.root).some((n) => n.indicatorId && t.related?.includes(n.indicatorId)));
  const url = `${SITE_URL}/thuat-ngu/${t.id}/`;

  return (
    <article className="max-w-3xl mx-auto space-y-7">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd([
            {
              "@context": "https://schema.org",
              "@type": "DefinedTerm",
              name: t.term,
              alternateName: t.en,
              description: t.short,
              url,
              inDefinedTermSet: { "@type": "DefinedTermSet", name: "Thuật ngữ kinh tế vĩ mô", url: `${SITE_URL}/thuat-ngu/` },
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Thuật ngữ", item: `${SITE_URL}/thuat-ngu/` },
                { "@type": "ListItem", position: 2, name: t.term, item: url },
              ],
            },
          ]),
        }}
      />

      <header>
        <nav className="text-sm text-muted" aria-label="Vị trí">
          <Link href="/thuat-ngu" className="hover:text-text">Thuật ngữ</Link>
          <span className="mx-1.5" aria-hidden>›</span>
          <span>{TERM_CATEGORIES[t.category]}</span>
        </nav>
        <h1 className="text-3xl font-semibold tracking-tight mt-3">{t.term} là gì?</h1>
        <p className="text-sm text-muted italic mt-1">{t.en}</p>
        <p className="text-lg leading-relaxed mt-3">{t.short}</p>
      </header>

      <section>
        <Heading>Hiểu kỹ hơn</Heading>
        <p className="leading-relaxed">{t.detail}</p>
        {t.example && <p className="leading-relaxed mt-3 border-l-2 border-accent pl-3">{t.example}</p>}
      </section>

      {t.seriesId && (
        <section className="bg-surface border border-line rounded-xl p-4">
          <SeriesChart lines={[{ id: t.seriesId, label: t.term }]} height={220} from={1995} />
        </section>
      )}

      {related.length > 0 && (
        <section>
          <Heading>Con số liên quan</Heading>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.map((i) => (
              <Link key={i.id} href={`/tu-dien/${i.id}`} className="block bg-surface border border-line rounded-xl p-4 hover:border-accent transition-colors">
                <span className="font-medium">{i.name}</span>
                <span className="block text-sm text-muted mt-1 leading-relaxed">{i.plain}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {moves.length > 0 && (
        <section>
          <Heading>Cái gì tác động tới {main.name}</Heading>
          <ul className="space-y-2.5">
            {moves.map((l) => (
              <li key={linkKey(l)} className="flex gap-2 leading-relaxed">
                <span className="font-semibold w-4 shrink-0" style={{ color: l.sign > 0 ? "var(--chart-2)" : "var(--chart-1)" }}>{l.sign > 0 ? "+" : "−"}</span>
                <span>{effectLine(INDICATOR_BY_ID[l.from].name, main.name, l.sign)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(mapId || trees.length > 0) && (
        <section>
          <Heading>Xem trong bức tranh chung</Heading>
          <div className="flex flex-wrap gap-2">
            {mapId && <Link href={`/ban-do/${mapId}?m=${main.id}`} className="text-sm px-3 py-1.5 rounded-lg border border-line bg-surface hover:border-accent">Bản đồ: {MAP_BY_ID[mapId].name}</Link>}
            {trees.map((tree) => <Link key={tree.id} href={`/cay/${tree.id}`} className="text-sm px-3 py-1.5 rounded-lg border border-line bg-surface hover:border-accent">{tree.name}</Link>)}
          </div>
        </section>
      )}

      {siblings.length > 0 && (
        <section>
          <Heading>Thuật ngữ cùng nhóm</Heading>
          <div className="flex flex-wrap gap-2">
            {siblings.map((o) => <Link key={o.id} href={`/thuat-ngu/${o.id}`} className="text-sm px-3 py-1.5 rounded-lg border border-line bg-surface hover:border-accent">{o.term}</Link>)}
          </div>
        </section>
      )}
    </article>
  );
}
