import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CASES, CASE_BY_SLUG } from "@/content/cases";
import CaseStepper from "@/components/CaseStepper";

export function generateStaticParams() {
  return CASES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `${CASE_BY_SLUG[slug]?.title ?? "Case study"} · Vĩ mô Việt Nam` };
}

export default function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense>
      <CasePageContent params={params} />
    </Suspense>
  );
}

async function CasePageContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = CASE_BY_SLUG[slug];
  if (!study) notFound();
  const idx = CASES.indexOf(study);
  const prev = CASES[idx - 1];
  const next = CASES[idx + 1];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/case-study" className="text-sm text-muted hover:text-text">← Tất cả case study</Link>
        <div className="text-sm text-muted mt-3">{study.period}</div>
        <h1 className="text-2xl font-semibold">{study.title}</h1>
        <p className="text-muted mt-1 max-w-3xl leading-relaxed">{study.summary}</p>
      </div>
      <CaseStepper key={study.slug} study={study} />
      <nav className="flex justify-between gap-4 border-t border-line pt-4 text-sm">
        {prev ? <Link href={`/case-study/${prev.slug}`} className="text-accent">← {prev.period}: {prev.title}</Link> : <span />}
        {next && <Link href={`/case-study/${next.slug}`} className="text-accent text-right">{next.period}: {next.title} →</Link>}
      </nav>
    </div>
  );
}
