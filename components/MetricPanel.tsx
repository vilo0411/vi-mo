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
import { AnalysisSection, CalculationSection, WhySection } from "./ProfileSections";
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

const DIRECTION = { up: "Cao hơn là tốt", down: "Thấp hơn là tốt", neutral: "Tùy bối cảnh" };

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
  const measure = measureOf(ind, s?.unit);
  const outgoing = LINKS.filter((l) => l.from === id);
  const incoming = LINKS.filter((l) => l.to === id);
  const maps = MAPS.filter((m) => m.ids !== "all" && m.ids.includes(id));
  const [tab, setTab] = useState<Tab>("essence");
  const [copied, setCopied] = useState<"link" | "profile" | null>(null);

  const copy = async (kind: "link" | "profile", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div>
        <CloseButton onClick={onClose} />
        <div className="text-xs font-medium" style={{ color: `var(--g-${ind.group})` }}>{GROUPS[ind.group].name}</div>
        <h2 className="text-lg font-semibold">{ind.name}</h2>
        {profile?.alsoCalled && <p className="text-xs text-muted mt-0.5">Còn gọi là: {profile.alsoCalled.join(", ")}</p>}
        {last && (
          <div className="text-sm text-muted mt-1">
            Năm {last.year}: <span className="text-text font-medium">{formatValue(last.value, s?.unit)}</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => copy("link", `${location.origin}${location.pathname}?m=${id}`)}
          className="text-xs text-accent mt-1"
        >
          {copied === "link" ? "Đã sao chép link" : "Sao chép link tới chỉ số này"}
        </button>
      </div>

      {profile && (
        <div role="tablist" aria-label="Nội dung chỉ số" className="flex gap-1 border-b border-line text-sm">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`px-2.5 py-1.5 -mb-px border-b-2 whitespace-nowrap ${tab === t.id ? "border-accent text-accent font-medium" : "border-transparent text-muted hover:text-text"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {profile && tab === "calc" && <CalculationSection profile={profile} onMetric={onSelect} />}
      {profile && tab === "why" && <WhySection profile={profile} onMetric={onSelect} />}
      {profile && tab === "analysis" && <AnalysisSection profile={profile} onMetric={onSelect} />}

      {tab === "essence" && (
        <>
          <div className="rounded-lg bg-accent-soft p-3 text-sm leading-relaxed">
            <div className="text-xs font-medium text-accent mb-1">Nói đơn giản</div>
            <p>{ind.plain}</p>
            <p className="text-muted mt-1.5">Ví dụ: {ind.example}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-surface-2">{measure.label}</span>
            <span className="px-2 py-1 rounded-full bg-surface-2">{DIRECTION[ind.goodWhen]}</span>
          </div>
          <CardGuide ind={ind} />
          {ind.concept && <ConceptNote id={id} />}
          <div>
            <h3 className="text-sm font-medium mb-1">Định nghĩa đầy đủ</h3>
            <p className="text-sm leading-relaxed">{ind.definition}</p>
          </div>
          {ind.formula && (
            <div>
              <h3 className="text-sm font-medium mb-1">Công thức</h3>
              <p className="text-sm leading-relaxed rounded-lg bg-surface-2 px-3 py-2">{ind.formula}</p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium mb-1">Đọc thế nào?</h3>
            <p className="text-sm leading-relaxed">{ind.howToRead}</p>
          </div>
          <SeriesChart lines={[{ id: ind.seriesId, label: ind.name }]} height={170} from={1995} />
          {ind.dataNote && <p className="text-xs text-muted">{ind.dataNote}</p>}
          {GDP_PARTS.has(id) && (
            <div>
              <h3 className="text-sm font-medium mb-1">Mỗi phần góp bao nhiêu vào tăng trưởng GDP?</h3>
              <p className="text-xs text-muted mb-2 leading-relaxed">Tỷ trọng × tốc độ tăng của từng phần. Cộng lại ra gần đúng tốc độ tăng GDP.</p>
              <ContributionChart from={2012} height={220} showWorked={false} />
              <Link href="/tu-dien/gdp_growth#dong-gop" className="text-xs text-accent">
                Xem cách tính từng bước →
              </Link>
            </div>
          )}
          <RelatedTerms id={id} />
          <LinkList title="Ảnh hưởng tới" links={outgoing} side="to" onSelectLink={onSelectLink} />
          <LinkList title="Bị ảnh hưởng bởi" links={incoming} side="from" onSelectLink={onSelectLink} />
          {maps.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-1.5">Có mặt trong</h3>
              <ul className="space-y-1 text-sm">
                {maps.map((m) => (
                  <li key={m.id}>
                    {m.id === mapId ? (
                      <span className="block px-2 py-1">{m.name} <span className="text-xs text-muted">bạn đang ở đây</span></span>
                    ) : (
                      <Link href={`/ban-do/${m.id}?m=${id}`} className="block px-2 py-1 rounded-md hover:bg-surface-2">{m.name}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <div className="pt-3 border-t border-line flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={() => copy("profile", profileText(ind, profile))} className="text-sm px-3 py-1.5 rounded-lg border border-line hover:border-accent">
          {copied === "profile" ? "Đã sao chép" : "Sao chép hồ sơ chỉ số"}
        </button>
        <Link href={`/tu-dien/${id}`} className="text-sm text-accent">
          Trang đầy đủ →
        </Link>
      </div>
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
      <h3 className="text-sm font-medium mb-1.5">{title}</h3>
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
