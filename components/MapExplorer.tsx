"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { GROUPS, INDICATORS, INDICATOR_BY_ID, type Group } from "@/content/indicators";
import { MAP_BY_ID } from "@/content/maps";
import { LINKS, linkKey, type Link as CausalLink } from "@/content/links";
import { branchesOf, exploreOrder, revealedFor } from "@/lib/explore";
import { getSeries, lowerFirst, YEAR_RANGE, zScore } from "@/lib/data";
import { findPaths } from "@/lib/paths";
import { useProgress } from "@/lib/progress";
import { fold } from "@/lib/text";
import MacroGraph, { GraphLegend, latestState, type NodeState } from "./MacroGraph";
import CardGuide from "./CardGuide";
import MetricPanel, { CloseButton, SignChip } from "./MetricPanel";
import RelatedTerms from "./RelatedTerms";
import SeriesChart from "./SeriesChart";

type Selection = { kind: "node"; id: string } | { kind: "link"; key: string } | null;

const INTRO_KEY = "vi-mo:intro-dismissed";

export default function MapExplorer({ mapId }: { mapId: string }) {
  const params = useSearchParams();
  const focus = useMemo(() => params.get("focus")?.split(",").filter((id) => INDICATOR_BY_ID[id]) ?? [], [params]);
  const metric = params.get("m");
  const [sel, setSel] = useState<Selection>(metric && INDICATOR_BY_ID[metric] ? { kind: "node", id: metric } : null);
  const [yearMode, setYearMode] = useState(false);
  const [year, setYear] = useState(2008);
  const [pathFrom, setPathFrom] = useState(params.get("from") ?? "");
  const [pathTo, setPathTo] = useState(params.get("to") ?? "");
  const [pathIdx, setPathIdx] = useState(0);
  const [explore, setExplore] = useState<Explore | null>(params.get("explore") ? startExplore("gdp_growth") : null);
  const [intro, setIntro] = useState(false);
  const [role, setRole] = useState<Group | null>(null);
  // Bấm thẳng lên thẻ thì giữ nguyên khung nhìn; mở chỉ số từ chỗ khác thì lia tới thẻ đó.
  const [fly, setFly] = useState(!!metric);
  const [full, setFull] = useState(!MAP_BY_ID[mapId].core || focus.length > 0);
  const [tour, setTour] = useState<number | null>(null);
  const wide = useWide();
  const { markSeen } = useProgress();

  useEffect(() => {
    markSeen(`map:${mapId}`);
  }, [mapId, markSeen]);

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
    const base = !full && map.core ? map.core : map.ids === "all" ? INDICATORS.map((i) => i.id) : map.ids;
    const extra = [...(paths ?? []).flatMap((p) => p.nodes), ...(sel?.kind === "node" ? [sel.id] : [])];
    return [...new Set([...base, ...extra])];
  }, [explore, map, paths, sel, full]);

  const nodeState = useMemo(() => {
    const out: Record<string, NodeState> = {};
    if (yearMode) {
      for (const ind of INDICATORS) {
        const z = zScore(getSeries(ind.seriesId), year);
        out[ind.id] = { ...latestState(ind, year), intensity: z === undefined ? 0 : z / 2 };
      }
    }
    if (!explore) out[map.keyId] = { ...(out[map.keyId] ?? latestState(INDICATOR_BY_ID[map.keyId])), badge: { text: "Bắt đầu từ đây", tone: "you" } };
    return out;
  }, [yearMode, year, map, explore]);

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
      const near = new Set([sel.id, ...ls.flatMap((l) => [l.from, l.to])]);
      return { highlightNodes: near, highlightLinks: new Set(ls.map(linkKey)), fitTo: fly ? [...near] : undefined };
    }
    if (sel?.kind === "link") {
      const l = LINKS.find((x) => linkKey(x) === sel.key)!;
      return { highlightNodes: new Set([l.from, l.to]), highlightLinks: new Set([sel.key]), fitTo: undefined };
    }
    if (role) {
      const ids = visibleIds.filter((id) => INDICATOR_BY_ID[id].group === role);
      const ls = LINKS.filter((l) => ids.includes(l.from) || ids.includes(l.to));
      return { highlightNodes: new Set(ids), highlightLinks: new Set(ls.map(linkKey)), fitTo: undefined };
    }
    if (focus.length) {
      const ls = LINKS.filter((l) => focus.includes(l.from) && focus.includes(l.to));
      return { highlightNodes: new Set(focus), highlightLinks: new Set(ls.map(linkKey)), fitTo: focus };
    }
    return { highlightNodes: null, highlightLinks: null, fitTo: undefined };
  }, [sel, activePath, explore, focus, role, visibleIds, fly]);

  const clearPath = () => {
    setPathFrom("");
    setPathTo("");
    setPathIdx(0);
  };

  const openMetric = (id: string) => {
    clearPath();
    setExplore(null);
    setRole(null);
    setTour(null);
    setFly(true);
    setSel({ kind: "node", id });
  };

  const startTour = (root = "gdp_growth") => {
    clearPath();
    setSel(null);
    setExplore(startExplore(root));
    dismissIntro();
  };

  const panel = tour !== null ? (
    <MapTour step={tour} onStep={setTour} onClose={() => { setTour(null); dismissIntro(); }} />
  ) : explore ? (
    <ExplorePanel state={explore} onChange={setExplore} onRestart={startTour} onClose={() => setExplore(null)} />
  ) : paths ? (
    <PathPanel paths={paths} idx={pathIdx} setIdx={setPathIdx} from={pathFrom} to={pathTo} onClose={clearPath} />
  ) : sel?.kind === "node" ? (
    <MetricPanel key={sel.id} id={sel.id} mapId={mapId} onSelect={openMetric} onSelectLink={(key) => setSel({ kind: "link", key })} onClose={() => setSel(null)} />
  ) : sel?.kind === "link" ? (
    <LinkPanel link={LINKS.find((l) => linkKey(l) === sel.key)!} onSelectNode={(id) => setSel({ kind: "node", id })} onClose={() => setSel(null)} />
  ) : intro ? (
    <IntroPanel onGuide={() => setTour(0)} onTour={startTour} onClose={dismissIntro} />
  ) : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-end justify-between">
        <div>
          <nav className="text-sm text-muted mb-1" aria-label="Vị trí">
            <Link href="/" className="hover:text-text">Thư viện</Link>
            <span className="mx-1.5" aria-hidden>›</span>
            <span className="text-text">{map.name}</span>
          </nav>
          <h1 className="text-2xl font-semibold">{map.name}</h1>
          <p className="text-sm text-muted mt-1 max-w-2xl">
            {map.hint} Mỗi thẻ là một chỉ số, mỗi mũi tên là một quan hệ nhân quả. Bấm vào thẻ để xem chi tiết.
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

      <div className="flex flex-wrap items-center gap-2 text-sm bg-surface border border-line rounded-xl px-4 py-2.5">
        <span className="font-medium">Tìm đường đi:</span>
        <span className="text-muted">từ</span>
        <IndicatorSelect value={pathFrom} onChange={(v) => { setPathFrom(v); setPathIdx(0); setExplore(null); }} />
        <span className="text-muted">tới</span>
        <IndicatorSelect value={pathTo} onChange={(v) => { setPathTo(v); setPathIdx(0); setExplore(null); }} />
        <button type="button" className="text-accent text-xs ml-1" onClick={() => { setExplore(null); setPathFrom("fed_rate"); setPathTo("cpi"); setPathIdx(0); }}>
          Ví dụ: Fed tới lạm phát Việt Nam
        </button>
        <MapSearch onPick={openMetric} />
      </div>

      {!explore && (
        <div className="flex flex-wrap items-center gap-2 text-xs" aria-label="Cách xem bản đồ">
          {map.core && (
            <div className="inline-flex rounded-full border border-line p-0.5" role="group" aria-label="Mức chi tiết">
              {[{ on: false, label: "Cốt lõi" }, { on: true, label: "Đầy đủ" }].map((v) => (
                <button
                  key={v.label}
                  type="button"
                  aria-pressed={full === v.on}
                  title={v.on ? "Hiện mọi thẻ của bản đồ" : "Chỉ hiện những thẻ quan trọng nhất"}
                  onClick={() => { setRole(null); setFull(v.on); }}
                  className={`px-2.5 py-0.5 rounded-full ${full === v.on ? "bg-accent-soft text-accent font-medium" : "text-muted hover:text-text"}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
          <span className="text-muted">Vai trò:</span>
          {(Object.keys(GROUPS) as Group[]).map((g) => {
            const n = visibleIds.filter((id) => INDICATOR_BY_ID[id].group === g).length;
            if (n === 0) return null;
            return (
              <button
                key={g}
                type="button"
                aria-pressed={role === g}
                title={GROUPS[g].hint}
                onClick={() => { setSel(null); setRole(role === g ? null : g); }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${role === g ? "border-accent bg-accent-soft" : "border-line hover:border-accent"}`}
              >
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: `var(--g-${g})` }} />
                {GROUPS[g].name}
                <span className="tabular-nums text-muted">{n}</span>
              </button>
            );
          })}
          <button type="button" onClick={() => setTour(0)} className="ml-auto px-2.5 py-1 rounded-full border border-line hover:border-accent" aria-label="Cách đọc bản đồ">
            ? Cách đọc bản đồ
          </button>
        </div>
      )}

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
            setFly(false);
            // Đang khám phá thì bấm vào thẻ là đi tới thẻ đó, không thoát chế độ khám phá.
            if (explore) setExplore(visit(explore, id));
            else setSel({ kind: "node", id });
          }}
          onLinkClick={(key) => { clearPath(); setExplore(null); setSel({ kind: "link", key }); }}
          onPaneClick={() => setSel(null)}
          fitTo={fitTo}
          reserveRight={panel && wide ? 400 : 0}
          height="max(600px, calc(100vh - 250px))"
          minimap={visibleIds.length > 15 && !panel}
        />
        {panel && (
          <aside className="mt-3 xl:mt-0 xl:absolute xl:right-3 xl:top-3 xl:bottom-3 xl:w-[390px] overflow-y-auto bg-surface border border-line rounded-xl p-5 shadow-lg z-10">
            {panel}
          </aside>
        )}
      </div>
      <GraphLegend mode={yearMode ? "year" : "map"} groups={false} />
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

const TOUR_STEPS = [
  { title: "Bản đồ này đọc thế nào?", body: "Mỗi thẻ là một con số của nền kinh tế Việt Nam, ví dụ giá cả tăng bao nhiêu hay có bao nhiêu người thất nghiệp. Mũi tên cho biết con số này kéo theo con số kia. Sáu bước ngắn dưới đây giúp bạn đọc được bản đồ." },
  { title: "Bắt đầu từ thẻ có nhãn", body: "Thẻ gắn nhãn \"Bắt đầu từ đây\" là con số quan trọng nhất của bản đồ. Hãy đọc nó trước, rồi lần theo các mũi tên đi vào để xem cái gì tác động tới nó." },
  { title: "Màu nhãn cho biết vai trò", body: "Màu ở góc thẻ cho biết con số đó đóng vai gì: công cụ Nhà nước chủ động điều chỉnh, cú sốc từ bên ngoài, hay kết quả mà ai cũng quan tâm. Bấm một vai trò ở phía trên để làm nổi các thẻ cùng loại." },
  { title: "Mũi tên có dấu + và −", body: "Dấu + nghĩa là cái này tăng thì cái kia tăng theo. Dấu − nghĩa là cái này tăng thì cái kia giảm. Nét đứt là quan hệ của một khái niệm, không đo được bằng số. Bấm vào mũi tên để đọc vì sao hai con số liên quan với nhau." },
  { title: "Cốt lõi và Đầy đủ", body: "Cốt lõi chỉ giữ những thẻ quan trọng nhất, rất hợp khi mới học. Khi đã quen, chuyển sang Đầy đủ để thấy mọi thẻ của bản đồ." },
  { title: "Xem kỹ một con số", body: "Bấm vào thẻ để đọc định nghĩa bằng lời thường, cách tính và ví dụ. Muốn tìm nhanh một con số thì dùng ô tìm kiếm phía trên. Nút \"Cách đọc bản đồ\" mở lại các bước này bất cứ lúc nào." },
];

function MapTour({ step, onStep, onClose }: { step: number; onStep: (n: number) => void; onClose: () => void }) {
  const s = TOUR_STEPS[step];
  const last = step === TOUR_STEPS.length - 1;
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <CloseButton onClick={onClose} />
      <p className="text-xs text-muted">Bước {step + 1} trên {TOUR_STEPS.length}</p>
      <h2 className="text-lg font-semibold">{s.title}</h2>
      <p>{s.body}</p>
      <div className="flex items-center justify-between pt-1">
        <button type="button" onClick={() => onStep(step - 1)} disabled={step === 0} className="text-muted hover:text-text disabled:opacity-40">Quay lại</button>
        <button type="button" onClick={() => (last ? onClose() : onStep(step + 1))} className="px-3 py-1.5 rounded-lg bg-accent text-white">{last ? "Xong" : "Tiếp"}</button>
      </div>
    </div>
  );
}

function MapSearch({ onPick }: { onPick: (id: string) => void }) {
  const [q, setQ] = useState("");
  const needle = fold(q.trim());
  const hits = needle ? INDICATORS.filter((i) => fold(`${i.name} ${i.short}`).includes(needle)).slice(0, 6) : [];
  const pick = (id: string) => {
    setQ("");
    onPick(id);
  };
  return (
    <div className="relative w-full sm:w-52 sm:ml-auto">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && hits[0]) pick(hits[0].id);
          if (e.key === "Escape") setQ("");
        }}
        placeholder="Tìm một con số…"
        aria-label="Tìm chỉ số trên bản đồ"
        className="w-full rounded-lg border border-line bg-surface px-2.5 py-1 text-sm"
      />
      {needle && (
        <ul className="absolute right-0 left-0 top-full mt-1 z-20 rounded-lg border border-line bg-surface shadow-lg overflow-hidden">
          {hits.length === 0 && <li className="px-2.5 py-1.5 text-muted">Không tìm thấy</li>}
          {hits.map((i) => (
            <li key={i.id}>
              <button type="button" onClick={() => pick(i.id)} className="w-full text-left px-2.5 py-1.5 hover:bg-surface-2">{i.name}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IntroPanel({ onGuide, onTour, onClose }: { onGuide: () => void; onTour: () => void; onClose: () => void }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <CloseButton onClick={onClose} />
      <h2 className="text-lg font-semibold">Mới bắt đầu?</h2>
      <p>Đừng cố đọc hết bản đồ cùng lúc. Bạn có thể chọn một trong các cách sau:</p>
      <button type="button" onClick={onGuide} className="w-full text-left rounded-lg border border-accent bg-accent-soft p-3">
        <div className="font-medium text-accent">Xem cách đọc bản đồ</div>
        <div className="text-muted text-xs mt-0.5">Sáu bước ngắn, mất khoảng một phút.</div>
      </button>
      <button type="button" onClick={() => onTour()} className="w-full text-left rounded-lg border border-line p-3 hover:border-accent">
        <div className="font-medium">Khám phá từng nhánh, bắt đầu từ GDP</div>
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
