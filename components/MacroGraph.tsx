"use client";

import "@xyflow/react/dist/style.css";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  applyNodeChanges,
  Background,
  BaseEdge,
  Controls,
  getSmoothStepPath,
  getViewportForBounds,
  Handle,
  MarkerType,
  NodeToolbar,
  Panel,
  Position,
  ReactFlow,
  useNodesInitialized,
  useReactFlow,
  useStore,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeChange,
  type NodeProps,
} from "@xyflow/react";
import { GROUPS, INDICATOR_BY_ID, measureOf, type Indicator } from "@/content/indicators";
import { LINKS, linkKey } from "@/content/links";
import { changeShort, formatManual, formatValue, getSeries, latest, manualConcept, valueAt, YEAR_RANGE } from "@/lib/data";
import { ALL_IDS, CARD_H, CARD_W, layoutGraph, type Layout, type XY } from "@/lib/layout";

export type NodeState = {
  /** Số lớn trên thẻ. Bỏ trống thì dùng giá trị mới nhất của chuỗi dữ liệu. */
  value?: string;
  /** Chữ nhỏ ngay sau số lớn cho biết đơn vị đo, ví dụ "GDP" (tỷ trọng) hay "/năm" (tốc độ tăng) */
  suffix?: string;
  /** Câu chữ thay cho số lớn khi không có số (khái niệm, năm chưa có số liệu) */
  line?: string;
  /** Nhãn năm cạnh số lớn khi số không phải của năm mới nhất */
  yearTag?: string;
  /** Dòng nhỏ dưới số lớn */
  note?: string;
  /** true: thay đổi tốt, false: xấu, null: trung tính */
  good?: boolean | null;
  /** −1..1: âm tô xanh (thấp hơn / giảm), dương tô cam (cao hơn / tăng) */
  intensity?: number;
  /** Nhãn nổi phía trên thẻ, ví dụ "Quyết định của bạn" hoặc "Sự kiện" */
  badge?: { text: string; tone: "you" | "event" };
};

type NodeData = {
  ind: Indicator;
  state?: NodeState;
  dim: boolean;
  selected: boolean;
  hovered: boolean;
};

const LAYOUT_KEY = "vi-mo:layout:v3";

/**
 * Giá trị mặc định trên thẻ: số của năm (mặc định năm mới nhất) và thay đổi so với năm trước.
 * Khái niệm không có chuỗi số: dùng số công bố nhập tay nếu có, không thì một câu giải thích ngắn.
 */
export function latestState(ind: Indicator, year?: number): NodeState {
  if (ind.concept) {
    const m = manualConcept(ind.id);
    if (m && (year === undefined || year === m.year)) {
      return { value: formatManual(m), note: `${m.label}, ${m.year}`, good: null };
    }
    return { line: ind.cardLine ?? ind.plain, note: m ? `Khái niệm · có số năm ${m.year}` : "Khái niệm · không có số theo năm", good: null };
  }
  const s = getSeries(ind.seriesId);
  const first = s?.points[0]?.year;
  const last = latest(s)?.year;
  const y = year ?? last;
  if (y === undefined || first === undefined || last === undefined) return { line: "Chưa có số liệu", good: null };
  const v = valueAt(s, y);
  if (v === undefined) {
    const range = y < first ? `Số liệu bắt đầu từ ${first}` : y > last ? `Số mới nhất là năm ${last}` : `Có số ${first}–${last}, thiếu năm ${y}`;
    return { line: `Chưa có số năm ${y}`, note: range, good: null };
  }
  const ch = changeShort(s, y);
  const good = !ch || ind.goodWhen === "neutral" || Math.abs(ch.delta) < 0.05 ? null : (ch.delta > 0) === (ind.goodWhen === "up");
  const m = measureOf(ind, s?.unit);
  return {
    value: formatValue(v, s?.unit),
    suffix: m.suffix,
    note: ch ? `${ch.text} so với ${y - 1}` : `năm ${y}`,
    good,
    // Số không phải của năm mới nhất trên bản đồ thì ghi rõ năm, tránh tưởng là số năm nay.
    yearTag: year === undefined && y < YEAR_RANGE.max ? String(y) : undefined,
  };
}

const IndicatorNode = memo(function IndicatorNode({ data }: NodeProps<Node<NodeData>>) {
  const { ind, state, dim, selected, hovered } = data;
  const st = state ?? latestState(ind);
  const k = Math.max(-1, Math.min(1, st.intensity ?? 0));
  const tint = k === 0 ? "var(--surface)" : `color-mix(in srgb, ${k > 0 ? "var(--chart-2)" : "var(--chart-1)"} ${Math.round(Math.abs(k) * 35)}%, var(--surface))`;
  const noteColor = st.good === true ? "var(--up)" : st.good === false ? "var(--down)" : "var(--muted)";
  return (
    <>
      <NodeToolbar isVisible={hovered && !dim} position={Position.Bottom} offset={8}>
        <div className="w-72 rounded-lg border border-line bg-surface p-3 text-left shadow-lg">
          <div className="text-xs font-medium" style={{ color: `var(--g-${ind.group})` }}>
            {ind.name}
          </div>
          <p className="text-sm mt-1 leading-snug" style={{ color: "var(--text)" }}>
            {ind.plain}
          </p>
          <p className="text-xs mt-2 leading-snug" style={{ color: "var(--muted)" }}>
            Ví dụ: {ind.example}
          </p>
          <p className="text-xs mt-2" style={{ color: "var(--accent)" }}>
            Bấm vào thẻ để xem chi tiết
          </p>
        </div>
      </NodeToolbar>
      {st.badge && (
        <div
          className="absolute -top-3 left-3 z-10 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap max-w-[210px] truncate"
          style={{
            background: st.badge.tone === "you" ? "var(--accent)" : "var(--g-ben-ngoai)",
            color: "white",
          }}
        >
          {st.badge.text}
        </div>
      )}
      <div
        className="rounded-xl text-left cursor-pointer transition-opacity node-appear overflow-hidden"
        style={{
          width: CARD_W,
          height: CARD_H,
          background: tint,
          border: `1px ${ind.concept ? "dashed" : "solid"} ${selected ? "var(--accent)" : ind.concept ? "var(--border-strong, var(--muted))" : "var(--border)"}`,
          boxShadow: selected
            ? "0 0 0 2px var(--accent)"
            : st.badge
              ? `0 0 0 2px ${st.badge.tone === "you" ? "var(--accent)" : "var(--g-ben-ngoai)"}`
              : "0 1px 2px rgba(0,0,0,0.04)",
          opacity: dim ? 0.12 : 1,
          padding: "12px 14px",
        }}
      >
        {(["top", "bottom", "left", "right"] as const).map((side) => (
          <span key={side}>
            <Handle type="source" id={`s-${side}`} position={side as Position} style={{ opacity: 0, pointerEvents: "none" }} isConnectable={false} />
            <Handle type="target" id={`t-${side}`} position={side as Position} style={{ opacity: 0, pointerEvents: "none" }} isConnectable={false} />
          </span>
        ))}
        <div className="flex items-start justify-between gap-2">
          <span className="text-[13px] leading-tight line-clamp-2" style={{ color: "var(--muted)" }}>
            {ind.name}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: `var(--g-${ind.group})` }}>
            {GROUPS[ind.group].tag}
          </span>
        </div>
        {st.value === undefined && st.line ? (
          <div className="text-[14px] leading-snug mt-1.5 line-clamp-2" style={{ color: "var(--text)", minHeight: 38 }}>
            {st.line}
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5 mt-1.5 min-w-0">
            <span className="text-[26px] leading-tight tabular-nums truncate" style={{ color: "var(--text)" }}>
              {st.value ?? "—"}
              {st.suffix && (
                <span className="text-[13px] ml-1" style={{ color: "var(--muted)" }}>
                  {st.suffix}
                </span>
              )}
            </span>
            {st.yearTag && (
              <span className="shrink-0 text-[11px] px-1.5 rounded tabular-nums" style={{ background: "var(--surface-2)", color: "var(--muted)" }} title={`Số mới nhất có được là của năm ${st.yearTag}`}>
                {st.yearTag}
              </span>
            )}
          </div>
        )}
        <div className="text-[12px] mt-1 leading-tight truncate" style={{ color: noteColor }}>
          {st.note ?? " "}
        </div>
      </div>
    </>
  );
});

type EdgeData = { points?: XY[]; signLabel?: string; labelColor: string };

/** Đường gấp khúc đi qua các điểm do ELK tính, bo tròn ở góc. */
function roundedPath(pts: XY[], r = 12): string {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i - 1];
    const c = pts[i];
    const n = pts[i + 1];
    const r1 = Math.min(r, Math.hypot(c.x - p.x, c.y - p.y) / 2, Math.hypot(n.x - c.x, n.y - c.y) / 2);
    const a = { x: c.x + (Math.sign(p.x - c.x) * r1), y: c.y + (Math.sign(p.y - c.y) * r1) };
    const b = { x: c.x + (Math.sign(n.x - c.x) * r1), y: c.y + (Math.sign(n.y - c.y) * r1) };
    d += ` L ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L ${last.x} ${last.y}`;
}

function longestSegmentMid(pts: XY[]): XY {
  let best = { len: -1, mid: pts[0] };
  for (let i = 0; i < pts.length - 1; i++) {
    const len = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
    if (len > best.len) best = { len, mid: { x: (pts[i].x + pts[i + 1].x) / 2, y: (pts[i].y + pts[i + 1].y) / 2 } };
  }
  return best.mid;
}

function CausalEdge(props: EdgeProps<Edge<EdgeData>>) {
  const { data, style, markerEnd } = props;
  let path: string;
  let label: XY;
  if (data?.points && data.points.length >= 2) {
    path = roundedPath(data.points);
    label = longestSegmentMid(data.points);
  } else {
    // Thẻ đã bị kéo khỏi vị trí tự động: nối thẳng bằng đường gấp khúc đơn giản.
    const [p, lx, ly] = getSmoothStepPath({ ...props, borderRadius: 12 });
    path = p;
    label = { x: lx, y: ly };
  }
  return (
    <BaseEdge
      path={path}
      style={style}
      markerEnd={markerEnd}
      label={data?.signLabel}
      labelX={label.x}
      labelY={label.y}
      labelStyle={{ fill: data?.labelColor, fontWeight: 600, fontSize: 14 }}
      labelShowBg
      labelBgStyle={{ fill: "var(--surface)" }}
      labelBgPadding={[5, 2]}
      labelBgBorderRadius={4}
    />
  );
}

const nodeTypes = { indicator: IndicatorNode };
const edgeTypes = { causal: CausalEdge };

function handlesFor(from: XY, to: XY) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx > CARD_W * 0.6) return { sourceHandle: "s-right", targetHandle: "t-left" };
  if (dx < -CARD_W * 0.6) return { sourceHandle: "s-left", targetHandle: "t-right" };
  return dy > 0 ? { sourceHandle: "s-bottom", targetHandle: "t-top" } : { sourceHandle: "s-top", targetHandle: "t-bottom" };
}

function loadOverrides(): Record<string, XY> {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    return raw ? (JSON.parse(raw) as Record<string, XY>) : {};
  } catch {
    return {};
  }
}

/**
 * Căn khung nhìn khi khung đổi kích thước hoặc tập thẻ cần xem đổi.
 * Tự tính viewport thay vì gọi fitView(): với nodes được điều khiển từ ngoài, fitView() xếp hàng chờ
 * một lần setNodes và có thể không bao giờ chạy.
 */
function AutoFit({ ids, focus, reserveRight = 0 }: { ids: string[]; focus: boolean; reserveRight?: number }) {
  const { getNodesBounds, setViewport, viewportInitialized } = useReactFlow();
  const width = useStore((s) => s.width);
  const height = useStore((s) => s.height);
  const ready = useNodesInitialized();
  const key = ids.join(",");
  const fitted = useRef(false);
  useEffect(() => {
    if (!ready || !viewportInitialized || !width || !height || !key) return;
    const gap = focus ? 60 : 24;
    const vp = getViewportForBounds(getNodesBounds(key.split(",")), width, height, 0.25, 1, {
      top: `${gap}px`,
      bottom: `${gap}px`,
      left: `${gap}px`,
      right: `${gap + reserveRight}px`,
    });
    // Lần căn đầu tiên hiện ngay; các lần sau (mở thêm thẻ, đổi vùng xem) mới chuyển động mượt.
    setViewport(vp, { duration: fitted.current ? 350 : 0 });
    fitted.current = true;
  }, [ready, viewportInitialized, width, height, key, focus, reserveRight, getNodesBounds, setViewport]);
  return null;
}

export default function MacroGraph({
  nodeState,
  visibleIds,
  highlightNodes,
  highlightLinks,
  selectedNode,
  selectedLink,
  onNodeClick,
  onLinkClick,
  onPaneClick,
  fitTo,
  reserveRight,
  height = 640,
  showSigns = true,
  draggable = true,
  children,
}: {
  nodeState?: Record<string, NodeState>;
  /** Chỉ hiện và tự xếp những thẻ này (bản đồ con). Bỏ trống là toàn bộ bản đồ. */
  visibleIds?: string[];
  highlightNodes?: Set<string> | null;
  highlightLinks?: Set<string> | null;
  selectedNode?: string | null;
  selectedLink?: string | null;
  onNodeClick?: (id: string) => void;
  onLinkClick?: (key: string) => void;
  onPaneClick?: () => void;
  /** Phóng to vừa những thẻ này. Bỏ trống thì xem toàn bộ các thẻ đang hiện. */
  fitTo?: string[];
  /** Chừa khoảng trống bên phải (px) cho bảng thông tin nổi đè lên bản đồ */
  reserveRight?: number;
  height?: number | string;
  showSigns?: boolean;
  /** Tắt kéo thả khi bố cục tự thay đổi liên tục (ví dụ trong thử thách) */
  draggable?: boolean;
  children?: React.ReactNode;
}) {
  const subset = !!visibleIds;
  const idsKey = (visibleIds ?? ALL_IDS).join(",");
  const ids = useMemo(() => (idsKey ? idsKey.split(",") : []), [idsKey]);

  const [layout, setLayout] = useState<Layout | null>(null);
  // Vị trí các thẻ người dùng đã kéo đi. Chỉ lưu lại cho bản đồ đầy đủ.
  const [overrides, setOverrides] = useState<Record<string, XY>>({});
  const [base, setBase] = useState<Node[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);

  // Vị trí kéo tay chỉ thuộc về đúng bố cục đã kéo. Đổi sang tập thẻ khác (ví dụ khi khám phá từng nhánh)
  // thì bỏ đi, nếu không các thẻ của bố cục mới sẽ bị đặt vào chỗ cũ và đè lên nhau.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOverrides(subset ? {} : loadOverrides());
  }, [subset, idsKey]);

  useEffect(() => {
    let alive = true;
    layoutGraph(ids, LINKS).then((l) => {
      if (alive) setLayout(l);
    });
    return () => {
      alive = false;
    };
  }, [ids]);

  // Dựng lại danh sách thẻ khi bố cục đổi, giữ kích thước đã đo (measured) để React Flow biết thẻ đã sẵn sàng.
  useEffect(() => {
    if (!layout) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBase((prev) => {
      const measured = new Map(prev.map((n) => [n.id, n.measured]));
      return ids
        .filter((id) => layout.positions[id])
        .map((id) => ({
          id,
          type: "indicator",
          position: overrides[id] ?? layout.positions[id],
          measured: measured.get(id),
          data: {},
        }));
    });
  }, [layout, ids, overrides]);

  const nodes: Node<NodeData>[] = useMemo(
    () =>
      base.map((n) => ({
        ...n,
        data: {
          ind: INDICATOR_BY_ID[n.id],
          state: nodeState?.[n.id],
          dim: !!highlightNodes && !highlightNodes.has(n.id),
          selected: selectedNode === n.id,
          hovered: hovered === n.id,
        },
        // Thẻ đang được chú ý nằm trên các thẻ mờ.
        zIndex: highlightNodes ? (highlightNodes.has(n.id) ? 10 : 0) : 1,
      })),
    [base, nodeState, highlightNodes, selectedNode, hovered],
  );

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    // Bỏ qua thay đổi "select" vì việc chọn thẻ do component cha quản lý.
    const relevant = changes.filter((c) => c.type === "position" || c.type === "dimensions");
    if (relevant.length) setBase((ns) => applyNodeChanges(relevant, ns));
  }, []);

  const onNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      setOverrides((o) => {
        const next = { ...o, [node.id]: node.position };
        if (!subset) {
          try {
            localStorage.setItem(LAYOUT_KEY, JSON.stringify(next));
          } catch {}
        }
        return next;
      });
    },
    [subset],
  );

  const resetLayout = () => {
    try {
      localStorage.removeItem(LAYOUT_KEY);
    } catch {}
    setOverrides({});
  };

  const positions = useMemo(() => Object.fromEntries(base.map((n) => [n.id, n.position])) as Record<string, XY>, [base]);

  const edges: Edge<EdgeData>[] = useMemo(() => {
    if (!layout) return [];
    const visible = new Set(base.map((n) => n.id));
    return LINKS.filter((l) => visible.has(l.from) && visible.has(l.to)).map((l) => {
      const key = linkKey(l);
      const on = highlightLinks ? highlightLinks.has(key) : false;
      const dim = !!highlightLinks && !on;
      const active = on || selectedLink === key;
      const color = active ? "var(--accent)" : "var(--muted)";
      const routed = !overrides[l.from] && !overrides[l.to];
      return {
        id: key,
        source: l.from,
        target: l.to,
        type: "causal",
        ...handlesFor(positions[l.from], positions[l.to]),
        data: {
          points: routed ? layout.edges[key] : undefined,
          signLabel: showSigns && !dim ? (l.sign > 0 ? "+" : "−") : undefined,
          labelColor: color,
        },
        style: {
          stroke: color,
          strokeWidth: active ? 2.5 : 1.25,
          strokeDasharray: l.sign < 0 ? "6 4" : undefined,
          opacity: dim ? 0.05 : active ? 1 : 0.6,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 14, height: 14 },
        zIndex: active ? 10 : 0,
      };
    });
  }, [layout, base, positions, overrides, highlightLinks, selectedLink, showSigns]);

  const fitIds = fitTo?.length ? fitTo.filter((id) => ids.includes(id)) : ids;

  return (
    <div style={{ height }} className={`relative rounded-xl border border-line bg-surface overflow-hidden ${draggable ? "" : "animate-layout"}`}>
      <ReactFlow
        nodesDraggable={draggable}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange as (c: NodeChange<Node<NodeData>>[]) => void}
        onNodeDragStop={onNodeDragStop}
        nodesConnectable={false}
        minZoom={0.2}
        maxZoom={1.6}
        onNodeClick={(_, n) => onNodeClick?.(n.id)}
        onEdgeClick={(_, e) => onLinkClick?.(e.id)}
        onPaneClick={onPaneClick}
        onNodeMouseEnter={(_, n) => setHovered(n.id)}
        onNodeMouseLeave={() => setHovered(null)}
        onNodeDragStart={() => setHovered(null)}
      >
        <Background color="var(--grid)" gap={20} size={1.2} />
        <Controls showInteractive={false} />
        <AutoFit ids={fitIds} focus={!!fitTo?.length} reserveRight={reserveRight} />
        {Object.keys(overrides).length > 0 && (
          <Panel position="top-left">
            <button type="button" onClick={resetLayout} className="text-xs px-2.5 py-1 rounded-md border border-line bg-surface text-muted hover:text-text">
              Sắp xếp lại tự động
            </button>
          </Panel>
        )}
        {children}
      </ReactFlow>
    </div>
  );
}

export function GraphLegend({ mode }: { mode: "map" | "year" | "sim" }) {
  return (
    <div className="flex flex-col md:flex-row gap-3 md:items-center text-xs text-muted">
      {mode !== "sim" && <SampleCard mode={mode} />}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 items-center">
        {Object.entries(GROUPS).map(([g, v]) => (
          <span key={g} className="inline-flex items-center gap-1.5" title={v.hint}>
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: `var(--g-${g})` }} />
            {v.name}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <svg width="26" height="8" aria-hidden><line x1="0" y1="4" x2="26" y2="4" stroke="currentColor" strokeWidth="1.5" /></svg>
          <b className="font-semibold">+</b> cùng chiều
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="26" height="8" aria-hidden><line x1="0" y1="4" x2="26" y2="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 4" /></svg>
          <b className="font-semibold">−</b> ngược chiều
        </span>
        {mode === "year" && (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--chart-2)" }} /> cao hơn trung bình
            <span className="w-2.5 h-2.5 rounded-sm ml-2" style={{ background: "var(--chart-1)" }} /> thấp hơn trung bình
          </span>
        )}
        {mode === "sim" && (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--chart-2)" }} /> tăng
            <span className="w-2.5 h-2.5 rounded-sm ml-2" style={{ background: "var(--chart-1)" }} /> giảm
            <span className="ml-2">Màu càng đậm, tác động càng mạnh</span>
          </span>
        )}
        <span>Kéo thả thẻ để sắp xếp.</span>
      </div>
    </div>
  );
}

/** Thẻ mẫu thu nhỏ, chú thích từng phần để người mới biết đọc thẻ thế nào. */
function SampleCard({ mode }: { mode: "map" | "year" }) {
  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="rounded-lg border border-line bg-surface px-2.5 py-1.5 w-[150px] leading-tight">
        <div className="flex justify-between text-[10px]">
          <span>Lạm phát CPI</span>
          <span className="font-semibold uppercase" style={{ color: "var(--g-ket-qua)" }}>Kết quả</span>
        </div>
        <div className="text-[16px] text-text tabular-nums">
          3,3% <span className="text-[10px] text-muted">/năm</span>
        </div>
        <div className="text-[10px]" style={{ color: "var(--up)" }}>↓ 0,3 điểm so với 2024</div>
      </div>
      <ul className="space-y-0.5">
        <li><b className="font-medium text-text">Số lớn:</b> {mode === "year" ? "giá trị của năm đang chọn" : "số mới nhất (ô xám nhỏ = năm, nếu không phải năm nay)"}</li>
        <li><b className="font-medium text-text">Dòng nhỏ:</b> đổi so với năm trước. <span style={{ color: "var(--up)" }}>Xanh</span> = tốt, <span style={{ color: "var(--down)" }}>đỏ</span> = xấu, xám = tùy bối cảnh</li>
        <li><b className="font-medium text-text">Viền nét đứt:</b> khái niệm, thường không có số theo năm</li>
      </ul>
    </div>
  );
}
