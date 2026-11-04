"use client";

import Link from "next/link";
import { useState } from "react";
import { GROUPS, INDICATOR_BY_ID, measureOf } from "@/content/indicators";
import { INDICATOR_PROFILES, profileText } from "@/content/indicatorProfiles";
import { LINKS, linkKey, type Link as CausalLink } from "@/content/links";
import { MAPS } from "@/content/maps";
import { formatManual, formatValue, getSeries, latest, manualConcept } from "@/lib/data";
import CardGuide from "./CardGuide";
import ContributionChart from "./ContributionChart";
import { latestState } from "./MacroGraph";
import { AnalysisSection, CalculationSection, SectionHeading, WhySection } from "./ProfileSections";
import RelatedTerms from "./RelatedTerms";
import SeriesChart from "./SeriesChart";

const GDP_PARTS = new Set(["gdp_growth", "consumption", "investment", "gov_spending", "net_exports"]);
const TABS = [
  { id: "essence", label: "Bản chất" },
  { id: "calc", label: "Cách tính" },
  { id: "why", label: "Vì sao" },
  { id: "analysis", label: "Phân tích" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const DIRECTION = {
  up: { label: "↑ Cao hơn là tốt", hint: "Con số này tăng thường là tin tốt cho nền kinh tế." },
  down: { label: "↓ Thấp hơn là tốt", hint: "Con số này giảm thường là tin tốt cho nền kinh tế." },
  neutral: { label: "Tùy bối cảnh", hint: "Con số này cao hay thấp không hẳn tốt hay xấu, còn tùy hoàn cảnh." },
};

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Đóng" className="float-right -mt-1 -mr-1 w-7 h-7 rounded-md text-muted hover:text-text hover:bg-surface-2">
      ×
    </button>
  );
}

type Props = { id: string; mapId?: string; onSelect: (id: string) => void; onSelectLink: (k: string) => void; onClose: () => void };

export default function MetricPanel({ id, mapId, onSelect, onSelectLink, onClose }: Props) {
  const ind = INDICATOR_BY_ID[id];
  const profile = INDICATOR_PROFILES[id];
  const s = getSeries(ind.seriesId);
  const last = latest(s);
  const card = latestState(ind);
  const measure = measureOf(ind, s?.unit);
  const outgoing = LINKS.filter((l) => l.from === id);
  const incoming = LINKS.filter((l) => l.to === id);
  const maps = MAPS.filter((m) => m.ids !== "all" && m.ids.includes(id));
  const [tab, setTab] = useState<Tab>("essence");
  const [copied, setCopied] = useState<"link" | "profile" | null>(null);
  const direction = DIRECTION[ind.goodWhen];

  const copy = async (kind: "link" | "profile", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

  return (
    <div className="-m-5 flex flex-col xl:h-[calc(100%+2.5rem)]">
      <header className="px-5 pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: `var(--g-${ind.group})` }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "currentColor" }} />
            {GROUPS[ind.group].tag}
          </span>
          <span className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => copy("link", `${location.origin}${location.pathname}?m=${id}`)}
              aria-label="Sao chép link tới chỉ số này"
              title={copied === "link" ? "Đã sao chép link" : "Sao chép link"}
              className={`w-7 h-7 grid place-items-center rounded-md hover:bg-surface-2 ${copied === "link" ? "text-accent" : "text-muted hover:text-text"}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M10 14a4 4 0 0 0 6 .4l3-3a4 4 0 0 0-5.700-5.700l-1.500 1.500M14 10a4 4 0 0 0-6-.4l-3 3a4 4 0 0 0 5.700 5.700l1.500-1.500" />
              </svg>
            </button>
            <button type="button" onClick={onClose} aria-label="Đóng" className="w-7 h-7 rounded-md bg-surface-2 text-muted hover:text-text">×</button>
          </span>
        </div>
        <h2 className="text-xl font-semibold mt-1">{ind.name}</h2>
        {profile?.alsoCalled && (
          <p className="mt-1.5 flex items-baseline gap-2 text-xs text-muted">
            <span className="shrink-0 rounded border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wider">Còn gọi là</span>
            <span>{profile.alsoCalled.join(", ")}</span>
          </p>
        )}
        <div role="tablist" aria-label="Nội dung chỉ số" className="mt-3 -mx-5 px-5 flex gap-1 border-y border-line text-sm overflow-x-auto overflow-y-hidden">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`px-2.5 py-2 -mb-px border-b-2 whitespace-nowrap ${tab === t.id ? "border-accent text-accent font-medium" : "border-transparent text-muted hover:text-text"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4 text-sm leading-relaxed">
        {tab === "essence" && (
          <>
            <section>
              <SectionHeading>Là gì</SectionHeading>
              <p>{ind.plain}</p>
              <p className="text-muted mt-1.5">Ví dụ: {ind.example}</p>
            </section>
            {ind.formula && (
              <section>
                <SectionHeading>Công thức</SectionHeading>
                <p className="rounded-lg bg-surface-2 px-3 py-2">{ind.formula}</p>
              </section>
            )}
            <section>
              <SectionHeading>Đơn vị và chiều tốt</SectionHeading>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-surface-2">{s?.unit ?? "Khái niệm, không đo bằng số"}</span>
                <span className="px-2.5 py-1 rounded-full bg-accent-soft text-accent cursor-help" title={direction.hint}>{direction.label}</span>
              </div>
            </section>
            {last && (
              <section>
                <SectionHeading>Số mới nhất</SectionHeading>
                <p>
                  <span className="text-lg font-semibold tabular-nums">{formatValue(last.value, s?.unit)}</span>
                  {measure.suffix && <span className="text-muted"> {measure.suffix}</span>}
                  <span className="text-muted"> · năm {last.year}</span>
                </p>
                <p className="text-xs text-muted">{card.note}</p>
              </section>
            )}
            {ind.concept && <ConceptNote id={id} />}
            {maps.length > 0 && (
              <section>
                <SectionHeading>Có mặt trong</SectionHeading>
                <ul className="space-y-1.5">
                  {maps.map((m) => (
                    <li key={m.id}>
                      {m.id === mapId ? (
                        <span className="block rounded-lg bg-surface-2 px-3 py-1.5">{m.name} <span className="text-xs text-muted">bạn đang ở đây</span></span>
                      ) : (
                        <Link href={`/ban-do/${m.id}?m=${id}`} className="block rounded-lg bg-surface-2 px-3 py-1.5 hover:text-accent">{m.name}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        {tab === "calc" && (
          <>
            {profile && <CalculationSection profile={profile} onMetric={onSelect} />}
            <section>
              <SectionHeading>Định nghĩa đầy đủ</SectionHeading>
              <p>{ind.definition}</p>
            </section>
            <section>
              <SectionHeading>Đọc con số thế nào</SectionHeading>
              <p>{ind.howToRead}</p>
            </section>
            {ind.dataNote && <p className="text-xs text-muted">{ind.dataNote}</p>}
            <details className="group">
              <summary className="cursor-pointer text-accent">Cách đọc thẻ trên bản đồ</summary>
              <div className="mt-2"><CardGuide ind={ind} /></div>
            </details>
          </>
        )}

        {tab === "why" && (
          <>
            {profile && <WhySection profile={profile} onMetric={onSelect} />}
            <LinkList title="Tác động tới" links={outgoing} side="to" onSelectLink={onSelectLink} />
            <LinkList title="Bị tác động bởi" links={incoming} side="from" onSelectLink={onSelectLink} />
          </>
        )}

        {tab === "analysis" && (
          <>
            <section>
              <SectionHeading>Diễn biến</SectionHeading>
              <SeriesChart lines={[{ id: ind.seriesId, label: ind.name }]} height={170} from={1995} />
            </section>
            {GDP_PARTS.has(id) && (
              <section>
                <SectionHeading>Mỗi phần góp bao nhiêu vào tăng trưởng GDP?</SectionHeading>
                <p className="text-xs text-muted mb-2">Tỷ trọng × tốc độ tăng của từng phần. Cộng lại ra gần đúng tốc độ tăng GDP.</p>
                <ContributionChart from={2012} height={220} showWorked={false} />
                <Link href="/tu-dien/gdp_growth#dong-gop" className="text-xs text-accent">Xem cách tính từng bước →</Link>
              </section>
            )}
            {profile && <AnalysisSection profile={profile} onMetric={onSelect} />}
            <RelatedTerms id={id} limit={3} />
          </>
        )}
      </div>

      <footer className="px-5 py-3 border-t border-line flex items-center gap-3">
        <button type="button" onClick={() => copy("profile", profileText(ind, profile))} className="flex-1 text-sm px-3 py-2 rounded-lg border border-line hover:border-accent">
          {copied === "profile" ? "Đã sao chép" : "Sao chép hồ sơ chỉ số"}
        </button>
        <Link href={`/tu-dien/${id}`} className="text-sm text-accent whitespace-nowrap">Trang đầy đủ →</Link>
      </footer>
    </div>
  );
}

function ConceptNote({ id }: { id: string }) {
  const m = manualConcept(id);
  return (
    <div className="text-xs rounded-lg border border-dashed border-line p-2.5 leading-relaxed space-y-1.5">
      <p>
        Đây là một <b className="font-medium">khái niệm</b>, không có chuỗi số liệu theo năm. Nó được đặt trên bản đồ để bạn thấy nó nối với những chỉ số nào.
      </p>
      {m && (
        <p>
          <b className="font-medium">Số công bố gần nhất:</b> {m.label} năm {m.year}: <b className="font-medium">{formatManual(m)}</b>. {m.detail}{" "}
          <a href={m.source} target="_blank" rel="noreferrer" className="text-accent">
            Nguồn ↗
          </a>
        </p>
      )}
    </div>
  );
}

function LinkList({ title, links, side, onSelectLink }: { title: string; links: CausalLink[]; side: "from" | "to"; onSelectLink: (k: string) => void }) {
  if (!links.length) return null;
  return (
    <div>
      <SectionHeading>{title}</SectionHeading>
      <ul className="space-y-1">
        {links.map((l) => (
          <li key={linkKey(l)}>
            <button type="button" onClick={() => onSelectLink(linkKey(l))} className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-surface-2 flex gap-2">
              <SignChip sign={l.sign} />
              <span>{INDICATOR_BY_ID[side === "to" ? l.to : l.from].name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SignChip({ sign }: { sign: 1 | -1 }) {
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-semibold shrink-0"
      style={{ background: "var(--surface-2)", color: sign > 0 ? "var(--chart-2)" : "var(--chart-1)" }}
      title={sign > 0 ? "Cùng chiều" : "Ngược chiều"}
    >
      {sign > 0 ? "+" : "−"}
    </span>
  );
}
