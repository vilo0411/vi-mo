import type { ReactNode } from "react";
import { BASIC_QUESTIONS, type IndicatorProfile } from "@/content/indicatorProfiles";
import RichText from "./RichText";

type Props = { profile: IndicatorProfile; onMetric?: (id: string) => void };

function Heading({ children }: { children: ReactNode }) {
  return <h3 className="text-xs uppercase tracking-wider text-muted mb-1.5">{children}</h3>;
}

export function CalculationSection({ profile, onMetric }: Props) {
  const { nuances, worked } = profile;
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <div>
        <Heading>Điểm dễ hiểu sai</Heading>
        <ul className="list-disc pl-4 space-y-2 marker:text-muted">
          {nuances.map((n) => <li key={n}><RichText text={n} onMetric={onMetric} /></li>)}
        </ul>
      </div>
      <div>
        <Heading>Ví dụ tính</Heading>
        <div className="rounded-lg bg-surface-2 p-3">
          <p className="font-medium">{worked.title}</p>
          <dl className="mt-2 space-y-1">
            {worked.rows.map((r) => (
              <div key={r.label} className="flex justify-between gap-4">
                <dt className="text-muted">{r.label}</dt>
                <dd className="text-right tabular-nums">{r.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 pt-2 border-t border-line">{worked.note}</p>
        </div>
      </div>
    </div>
  );
}

export function WhySection({ profile, onMetric }: Props) {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <div>
        <Heading>Vì sao quan trọng</Heading>
        <p><RichText text={profile.whyMatters} onMetric={onMetric} /></p>
      </div>
      <div>
        <Heading>Khi nào dễ đọc sai</Heading>
        <p><RichText text={profile.whenMisleading} onMetric={onMetric} /></p>
      </div>
    </div>
  );
}

function QuestionList({ title, hint, items }: { title: string; hint: string; items: string[] }) {
  return (
    <div>
      <Heading>{title} <span className="normal-case tracking-normal">· {items.length}</span></Heading>
      <p className="text-xs text-muted -mt-1 mb-1.5">{hint}</p>
      <ul className="list-disc pl-4 space-y-1 marker:text-muted">{items.map((q) => <li key={q}>{q}</li>)}</ul>
    </div>
  );
}

export function AnalysisSection({ profile, onMetric }: Props) {
  const { breakdowns, questions } = profile;
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <div>
        <Heading>Chia nhỏ để nhìn rõ</Heading>
        <ul className="list-disc pl-4 space-y-2 marker:text-muted">
          {breakdowns.map((b) => (
            <li key={b.by}><b className="font-semibold">{b.by}:</b> <RichText text={b.reveals} onMetric={onMetric} /></li>
          ))}
        </ul>
      </div>
      <QuestionList title="Câu hỏi cơ bản" hint="Nên hỏi với mọi con số vĩ mô" items={BASIC_QUESTIONS} />
      <QuestionList title="Câu hỏi khám phá" hint="Tìm nguyên nhân" items={questions.explore} />
      <QuestionList title="Câu hỏi cho chính bạn" hint="Con số này liên quan gì tới quyết định của bạn" items={questions.decide} />
    </div>
  );
}
