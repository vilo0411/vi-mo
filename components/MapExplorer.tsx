"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { GROUPS, INDICATORS, INDICATOR_BY_ID } from "@/content/indicators";
import { MAPS, MAP_BY_ID } from "@/content/maps";
import { LINKS, linkKey, type Link as CausalLink } from "@/content/links";
import { branchesOf, exploreOrder, revealedFor } from "@/lib/explore";
import { formatManual, formatValue, getSeries, latest, lowerFirst, manualConcept, YEAR_RANGE, zScore } from "@/lib/data";
import { findPaths } from "@/lib/paths";
import MacroGraph, { GraphLegend, latestState, type NodeState } from "./MacroGraph";
import SeriesChart from "./SeriesChart";
import ContributionChart from "./ContributionChart";
import CardGuide from "./CardGuide";
import RelatedTerms from "./RelatedTerms";

type Selection = { kind: "node"; id: string } | { kind: "link"; key: string } | null;

const INTRO_KEY = "vi-mo:intro-dismissed";
const GDP_PARTS = new Set(["gdp_growth", "consumption", "investment", "gov_spending", "net_exports"]);

export default function MapExplorer() {
  const params = useSearchParams();
  const focus = useMemo(() => params.get("focus")?.split(",").filter((id) => INDICATOR_BY_ID[id]) ?? [], [params]);
  const [sel, setSel] = useState<Selection>(null);
  const [mapId, setMapId] = useState(MAP_BY_ID[params.get("map") ?? ""] ? params.get("map")! : "chinh");
  const [yearMode, setYearMode] = useState(false);
  const [year, setYear] = useState(2008);
  const [pathFrom, setPathFrom] = useState(params.get("from") ?? "");
  const [pathTo, setPathTo] = useState(params.get("to") ?? "");
  const [pathIdx, setPathIdx] = useState(0);
  const [explore, setExplore] = useState<Explore | null>(params.get("explore") ? startExplore("gdp_growth") : null);
  const [intro, setIntro] = useState(false);
  const wide = useWide();

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIntro(localStorage.getItem(INTRO_KEY) !== "1");
    } catch {
      setIntro(true);
    }
  }, []);

  const dismissIntro = () => {
    setIntro(false);
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {}
  };

  const paths = useMemo(() => (pathFrom && pathTo && pathFrom !== pathTo ? findPaths(LINKS, pathFrom, pathTo, 5).slice(0, 6) : null), [pathFrom, pathTo]);
  const activePath = paths?.[pathIdx];
  // Khám phá: chỉ hiện chỉ số đang xem và các nhánh nối trực tiếp với nó, không có thẻ mờ phía sau gây rối mắt.
  const map = MAP_BY_ID[mapId];
  const visibleIds = useMemo(() => {
    if (explore) return revealedFor([explore.at]);
    // Đang tìm đường đi: hiện đủ các thẻ trên mọi chuỗi tìm được, kể cả thẻ ngoài bản đồ đang chọn.
    const base = map.ids === "all" ? INDICATORS.map((i) => i.id) : map.ids;
    const extra = [...(paths ?? []).flatMap((p) => p.nodes), ...(sel?.kind === "node" ? [sel.id] : [])];
    return [...new Set([...base, ...extra])];
  }, [explore, map, paths, sel]);

  const nodeState = useMemo(() => {
    if (!yearMode) return undefined;
    const out: Record<string, NodeState> = {};
    for (const ind of INDICATORS) {
      const z = zScore(getSeries(ind.seriesId), year);
      out[ind.id] = { ...latestState(ind, year), intensity: z === undefined ? 0 : z / 2 };
    }
    return out;
  }, [yearMode, year]);

  const { highlightNodes, highlightLinks, fitTo } = useMemo(() => {
    if (explore) {
      const { causes, effects } = branchesOf(explore.at);
      return { highlightNodes: null, highlightLinks: new Set([...causes, ...effects].map(linkKey)), fitTo: undefined };
    }
    if (activePath) {
      return { highlightNodes: new Set(activePath.nodes), highlightLinks: new Set(activePath.links.map(linkKey)), fitTo: undefined };
    }
    if (sel?.kind === "node") {
      const ls = LINKS.filter((l) => l.from === sel.id || l.to === sel.id);
      return { highlightNodes: new Set([sel.id, ...ls.flatMap((l) => [l.from, l.to])]), highlightLinks: new Set(ls.map(linkKey)), fitTo: undefined };
    }
    if (sel?.kind === "link") {
      const l = LINKS.find((x) => linkKey(x) === sel.key)!;
      return { highlightNodes: new Set([l.from, l.to]), highlightLinks: new Set([sel.key]), fitTo: undefined };
    }
    if (focus.length) {
      const ls = LINKS.filter((l) => focus.includes(l.from) && focus.includes(l.to));
      return { highlightNodes: new Set(focus), highlightLinks: new Set(ls.map(linkKey)), fitTo: focus };
    }
    return { highlightNodes: null, highlightLinks: null, fitTo: undefined };
  }, [sel, activePath, explore, focus]);

  const clearPath = () => {
    setPathFrom("");
    setPathTo("");
    setPathIdx(0);
  };

  const startTour = (root = "gdp_growth") => {
    clearPath();
    setSel(null);
    setExplore(startExplore(root));
    dismissIntro();
  };

  const panel = explore ? (
    <ExplorePanel state={explore} onChange={setExplore} onRestart={startTour} onClose={() => setExplore(null)} />
  ) : paths ? (
    <PathPanel paths={paths} idx={pathIdx} setIdx={setPathIdx} from={pathFrom} to={pathTo} onClose={clearPath} />
  ) : sel?.kind === "node" ? (
    <NodePanel id={sel.id} onSelectLink={(key) => setSel({ kind: "link", key })} onClose={() => setSel(null)} />
  ) : sel?.kind === "link" ? (
    <LinkPanel link={LINKS.find((l) => linkKey(l) === sel.key)!} onSelectNode={(id) => setSel({ kind: "node", id })} onClose={() => setSel(null)} />
  ) : intro ? (
    <IntroPanel onTour={startTour} onClose={dismissIntro} />
  ) : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Bản đồ chỉ số vĩ mô</h1>
          <p className="text-sm text-muted mt-1 max-w-2xl">
            Mỗi thẻ là một chỉ số với số liệu thật mới nhất của Việt Nam. Mỗi mũi tên là một quan hệ nhân quả. Rê chuột lên thẻ để xem định nghĩa, bấm để xem chi tiết.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button type="button" onClick={() => startTour()} className="px-3 py-1.5 rounded-lg bg-accent text-white">
            Khám phá từng nhánh
          </button>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={yearMode} onChange={(e) => setYearMode(e.target.checked)} />
            Xem theo năm
          </label>
          <input
            type="range"
            min={YEAR_RANGE.min}
            max={YEAR_RANGE.max}
            step={1}
            value={year}
            disabled={!yearMode}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-40"
            aria-label="Chọn năm"
          />
          <span className={`font-medium tabular-nums ${yearMode ? "" : "text-muted"}`}>{year}</span>
        </div>
      </div>

      {!explore && (
        <div className="flex flex-wrap items-center gap-2">
          {MAPS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMapId(m.id);
                setSel(null);
              }}
              title={m.hint}
              className={`text-sm px-3 py-1.5 rounded-full border ${m.id === mapId ? "border-accent text-accent bg-accent-soft font-medium" : "border-line text-muted hover:text-text"}`}
            >
              {m.name}
            </button>
          ))}
          <span className="text-xs text-muted ml-1">{map.hint}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-sm bg-surface border border-line rounded-xl px-4 py-2.5">
        <span className="font-medium">Tìm đường đi:</span>
        <span className="text-muted">từ</span>
        <IndicatorSelect value={pathFrom} onChange={(v) => { setPathFrom(v); setPathIdx(0); setExplore(null); }} />
        <span className="text-muted">tới</span>
        <IndicatorSelect value={pathTo} onChange={(v) => { setPathTo(v); setPathIdx(0); setExplore(null); }} />
        <button type="button" className="text-accent text-xs ml-1" onClick={() => { setExplore(null); setPathFrom("fed_rate"); setPathTo("cpi"); setPathIdx(0); }}>
          Ví dụ: Fed tới lạm phát Việt Nam
        </button>
      </div>

      <div className="relative">
        <MacroGraph
          nodeState={nodeState}
          visibleIds={visibleIds}
          highlightNodes={highlightNodes}
          highlightLinks={highlightLinks}
          selectedNode={explore ? explore.at : sel?.kind === "node" ? sel.id : null}
          selectedLink={sel?.kind === "link" ? sel.key : null}
          onNodeClick={(id) => {
            clearPath();
            // Đang khám phá thì bấm vào thẻ là đi tới thẻ đó, không thoát chế độ khám phá.
            if (explore) setExplore(visit(explore, id));
            else setSel({ kind: "node", id });
          }}
          onLinkClick={(key) => { clearPath(); setExplore(null); setSel({ kind: "link", key }); }}
          onPaneClick={() => setSel(null)}
          fitTo={fitTo}
          reserveRight={panel && wide ? 400 : 0}
          height="max(600px, calc(100vh - 250px))"
        />
        {panel && (
          <aside className="mt-3 xl:mt-0 xl:absolute xl:right-3 xl:top-3 xl:bottom-3 xl:w-[390px] overflow-y-auto bg-surface border border-line rounded-xl p-5 shadow-lg z-10">
            {panel}
          </aside>
        )}
      </div>
      <GraphLegend mode={yearMode ? "year" : "map"} />
    </div>
  );
}

/** Màn hình đủ rộng (xl) thì bảng thông tin nổi đè lên bản đồ, nên bản đồ phải chừa chỗ cho nó. */
function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return wide;
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Đóng" className="float-right -mt-1 -mr-1 w-7 h-7 rounded-md text-muted hover:text-text hover:bg-surface-2">
      ×
    </button>
  );
}

function IndicatorSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="text-sm">
      <option value="">Chọn chỉ số</option>
      {Object.entries(GROUPS).map(([g, gv]) => (
        <optgroup key={g} label={gv.name}>
          {INDICATORS.filter((i) => i.group === g).map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function IntroPanel({ onTour, onClose }: { onTour: () => void; onClose: () => void }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <CloseButton onClick={onClose} />
      <h2 className="text-lg font-semibold">Mới bắt đầu?</h2>
      <p>Đừng cố đọc hết bản đồ cùng lúc. Có hai cách bắt đầu:</p>
      <button type="button" onClick={() => onTour()} className="w-full text-left rounded-lg border border-accent bg-accent-soft p-3">
        <div className="font-medium text-accent">Khám phá từng nhánh, bắt đầu từ GDP</div>
        <div className="text-muted text-xs mt-0.5">Bản đồ chỉ hiện GDP và các nhánh của nó, rồi mở dần từng nhánh một.</div>
      </button>
      <Link href="/lo-trinh" className="block rounded-lg border border-line p-3 hover:border-accent">
        <div className="font-medium">Lộ trình 6 bài (khoảng 30 phút)</div>
        <div className="text-muted text-xs mt-0.5">Mỗi bài ngắn, có câu hỏi nhanh để tự kiểm tra.</div>
      </Link>
      <Link href="/thu-thach" className="block rounded-lg border border-line p-3 hover:border-accent">
        <div className="font-medium">Thử làm Thống đốc</div>
        <div className="text-muted text-xs mt-0.5">Chọn cách ứng phó với Fed tăng lãi suất, giá dầu tăng, khủng hoảng, và xem kết quả.</div>
      </Link>
    </div>
  );
}

type Explore = { root: string; visited: string[]; at: string };

function startExplore(root: string): Explore {
  return { root, visited: [root], at: root };
}

function visit(e: Explore, id: string): Explore {
  return { ...e, at: id, visited: e.visited.includes(id) ? e.visited : [...e.visited, id] };
}

function ExplorePanel({
  state,
  onChange,
  onRestart,
  onClose,
}: {
  state: Explore;
  onChange: (e: Explore) => void;
  onRestart: (root: string) => void;
  onClose: () => void;
}) {
  const order = exploreOrder(state.root);
  const ind = INDICATOR_BY_ID[state.at];
  const { causes, effects } = branchesOf(state.at);
  // "Tiếp theo" đi lần lượt qua các nhánh theo từng lớp: hết các nhánh của GDP rồi mới tới nhánh của nhánh.
  const next = order.find((id) => !state.visited.includes(id));
  const back = state.visited.length > 1 ? state.visited[state.visited.length - 2] : null;
  const isRoot = state.at === state.root;

  return (
    <div className="space-y-4">
      <CloseButton onClick={onClose} />
      <div className="flex items-center gap-2 text-xs text-muted">
        <span>Khám phá từ</span>
        <select value={state.root} onChange={(e) => onRestart(e.target.value)} className="text-xs py-0.5">
          {INDICATORS.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
        <span className="ml-auto tabular-nums">
          {state.visited.length}/{INDICATORS.length}
        </span>
      </div>
      <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
        <div className="h-full bg-accent transition-all" style={{ width: `${(state.visited.length / INDICATORS.length) * 100}%` }} />
      </div>
      {state.visited.length > 1 && (
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="text-muted">Đã đi qua:</span>
          {state.visited.map((id, k) => (
            <span key={id} className="inline-flex items-center gap-1">
              {k > 0 && <span className="text-muted">→</span>}
              <button type="button" onClick={() => onChange({ ...state, at: id })} className={id === state.at ? "text-accent font-medium" : "text-muted hover:text-text"}>
                {INDICATOR_BY_ID[id].short}
              </button>
            </span>
          ))}
        </div>
      )}
      <div>
        <div className="text-xs font-medium" style={{ color: `var(--g-${ind.group})` }}>{GROUPS[ind.group].name}</div>
        <h2 className="text-lg font-semibold">{ind.name}</h2>
        <p className="text-sm leading-relaxed mt-1">{ind.plain}</p>
        <p className="text-xs text-muted leading-relaxed mt-1">Ví dụ: {ind.example}</p>
      </div>
      {isRoot && state.visited.length === 1 && (
        <p className="text-sm rounded-lg bg-accent-soft p-3 leading-relaxed">
          Bản đồ chỉ hiện {ind.name} và các nhánh nối trực tiếp với nó. Bấm &ldquo;Tiếp theo&rdquo; để đi lần lượt vào từng nhánh. Mỗi bước, bản đồ chuyển sang chỉ số mới và các nhánh của nó.
        </p>
      )}
      <CardGuide ind={ind} />
      <details className="text-sm">
        <summary className="cursor-pointer font-medium">Đọc chỉ số này thế nào?</summary>
        <p className="mt-1.5 leading-relaxed">{ind.howToRead}</p>
      </details>
      <RelatedTerms id={state.at} limit={3} />
      <BranchList title={`Điều gì làm ${lowerFirst(ind.name)} thay đổi?`} links={causes} side="from" visited={state.visited} onGo={(id) => onChange(visit(state, id))} />
      <BranchList title={`${ind.name} ảnh hưởng tới đâu?`} links={effects} side="to" visited={state.visited} onGo={(id) => onChange(visit(state, id))} />
      <div className="flex gap-2 pt-1 sticky bottom-0 bg-surface pb-1">
        <button type="button" disabled={!back} onClick={() => back && onChange({ ...state, at: back, visited: state.visited.slice(0, -1) })} className="px-3 py-1.5 rounded-lg border border-line text-sm disabled:opacity-40">
          Quay lại
        </button>
        {next ? (
          <button type="button" onClick={() => onChange(visit(state, next))} className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm">
            Tiếp theo: {INDICATOR_BY_ID[next].name}
          </button>
        ) : (
          <Link href="/lo-trinh" className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm">
            Xong! Học tiếp theo lộ trình
          </Link>
        )}
      </div>
    </div>
  );
}

function BranchList({
  title,
  links,
  side,
  visited,
  onGo,
}: {
  title: string;
  links: CausalLink[];
  side: "from" | "to";
  visited: string[];
  onGo: (id: string) => void;
}) {
  if (!links.length) return null;
  return (
    <div>
      <h3 className="text-sm font-medium mb-1.5">
        {title} <span className="text-muted font-normal">({links.length} nhánh)</span>
      </h3>
      <ul className="space-y-1.5">
        {links.map((l) => {
          const id = side === "from" ? l.from : l.to;
          const done = visited.includes(id);
          return (
            <li key={linkKey(l)}>
              <button type="button" onClick={() => onGo(id)} className="w-full text-left rounded-lg border border-line px-3 py-2 hover:border-accent">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <SignChip sign={l.sign} />
                  <span className="flex-1">{INDICATOR_BY_ID[id].name}</span>
                  {done && <span className="text-xs" style={{ color: "var(--up)" }}>đã xem</span>}
                </div>
                <p className="text-xs text-muted mt-1 leading-relaxed">{l.mechanism}</p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function NodePanel({ id, onSelectLink, onClose }: { id: string; onSelectLink: (k: string) => void; onClose: () => void }) {
  const ind = INDICATOR_BY_ID[id];
  const s = getSeries(ind.seriesId);
  const last = latest(s);
  const outgoing = LINKS.filter((l) => l.from === id);
  const incoming = LINKS.filter((l) => l.to === id);
  return (
    <div className="space-y-4">
      <div>
        <CloseButton onClick={onClose} />
        <div className="text-xs font-medium" style={{ color: `var(--g-${ind.group})` }}>{GROUPS[ind.group].name}</div>
        <h2 className="text-lg font-semibold">{ind.name}</h2>
        {last && (
          <div className="text-sm text-muted">
            Năm {last.year}: <span className="text-text font-medium">{formatValue(last.value, s?.unit)}</span>
          </div>
        )}
      </div>
      <div className="rounded-lg bg-accent-soft p-3 text-sm leading-relaxed">
        <div className="text-xs font-medium text-accent mb-1">Nói đơn giản</div>
        <p>{ind.plain}</p>
        <p className="text-muted mt-1.5">Ví dụ: {ind.example}</p>
      </div>
      <CardGuide ind={ind} />
      {ind.concept && <ConceptNote id={id} />}
      <div>
        <h3 className="text-sm font-medium mb-1">Định nghĩa đầy đủ</h3>
        <p className="text-sm leading-relaxed">{ind.definition}</p>
      </div>
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
      <Link href={`/tu-dien/${id}`} className="inline-block text-sm text-accent">
        Xem trang đầy đủ trong từ điển →
      </Link>
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

function LinkPanel({ link, onSelectNode, onClose }: { link: CausalLink; onSelectNode: (id: string) => void; onClose: () => void }) {
  const a = INDICATOR_BY_ID[link.from];
  const b = INDICATOR_BY_ID[link.to];
  return (
    <div className="space-y-4">
      <div>
        <CloseButton onClick={onClose} />
        <div className="text-xs text-muted">Quan hệ {link.sign > 0 ? "cùng chiều" : "ngược chiều"}</div>
        <h2 className="text-lg font-semibold leading-snug">
          <button type="button" className="hover:text-accent" onClick={() => onSelectNode(a.id)}>{a.name}</button>
          <span className="text-muted"> → </span>
          <button type="button" className="hover:text-accent" onClick={() => onSelectNode(b.id)}>{b.name}</button>
        </h2>
        <p className="text-sm text-muted mt-1">
          {a.name} tăng thì {lowerFirst(b.name)} {link.sign > 0 ? "tăng" : "giảm"}.
        </p>
      </div>
      <p className="text-sm leading-relaxed">{link.mechanism}</p>
      {link.example && (
        <p className="text-sm leading-relaxed border-l-2 border-accent pl-3">
          <span className="text-muted">Ở Việt Nam: </span>
          {link.example}
        </p>
      )}
      <SeriesChart lines={[{ id: a.seriesId, label: a.name }]} height={130} from={1995} showSource={false} />
      <SeriesChart lines={[{ id: b.seriesId, label: b.name }]} height={130} from={1995} showSource={false} />
      <Link href={`/so-sanh?a=${a.id}&b=${b.id}`} className="inline-block text-sm text-accent">
        So sánh hai chỉ số này, có độ trễ →
      </Link>
    </div>
  );
}

function PathPanel({
  paths,
  idx,
  setIdx,
  from,
  to,
  onClose,
}: {
  paths: ReturnType<typeof findPaths>;
  idx: number;
  setIdx: (i: number) => void;
  from: string;
  to: string;
  onClose: () => void;
}) {
  const a = INDICATOR_BY_ID[from];
  const b = INDICATOR_BY_ID[to];
  if (!paths.length) {
    return (
      <div className="space-y-2 text-sm">
        <CloseButton onClick={onClose} />
        <h2 className="text-lg font-semibold">Không tìm thấy đường đi</h2>
        <p className="text-muted">Không có chuỗi nhân quả nào (tối đa 5 bước) đi từ {a.name} tới {b.name} trong bản đồ này.</p>
      </div>
    );
  }
  const p = paths[idx];
  return (
    <div className="space-y-4">
      <div>
        <CloseButton onClick={onClose} />
        <h2 className="text-lg font-semibold leading-snug">{a.name} → {b.name}</h2>
        <p className="text-sm text-muted">Tìm thấy {paths.length} chuỗi. Chuỗi mạnh nhất ở trên cùng.</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {paths.map((x, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            className={`text-xs px-2.5 py-1 rounded-full border ${i === idx ? "border-accent text-accent bg-accent-soft" : "border-line text-muted"}`}
          >
            Chuỗi {i + 1} ({x.links.length} bước, {x.sign > 0 ? "+" : "−"})
          </button>
        ))}
      </div>
      <ol className="space-y-3">
        {p.links.map((l) => (
          <li key={linkKey(l)} className="text-sm">
            <div className="flex gap-2 items-center font-medium">
              <SignChip sign={l.sign} />
              {INDICATOR_BY_ID[l.from].name} → {INDICATOR_BY_ID[l.to].name}
            </div>
            <p className="text-muted mt-0.5 ml-7 leading-relaxed">{l.mechanism}</p>
          </li>
        ))}
      </ol>
      <p className="text-sm bg-surface-2 rounded-lg p-3">
        Gộp cả chuỗi: {a.name} tăng thì {lowerFirst(b.name)} <b className="font-medium">{p.sign > 0 ? "tăng" : "giảm"}</b>. Dấu của chuỗi bằng tích các dấu: hai dấu − liên tiếp thành +.
      </p>
    </div>
  );
}
