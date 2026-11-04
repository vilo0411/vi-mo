"use client";

import "@xyflow/react/dist/style.css";
import { memo, useEffect, useMemo, useRef } from "react";
import { Background, Controls, getViewportForBounds, Handle, MarkerType, Position, ReactFlow, useReactFlow, useStore, type Edge, type Node, type NodeProps, type Rect } from "@xyflow/react";
import { INDICATOR_BY_ID } from "@/content/indicators";
import { flattenTree, TREE_LEVELS, type TreeKind, type TreeNode } from "@/content/trees";
import { columnX, layoutTree, TREE_CARD } from "@/lib/treeLayout";
import { latestState } from "./MacroGraph";

type CardData = { node: TreeNode; dim: boolean; selected: boolean };
type HeaderData = { kind: TreeKind };

const HEADER_H = 40;
const KIND_COLOR: Record<TreeKind, string> = { key: "var(--g-ket-qua)", component: "var(--chart-2)", driver: "var(--chart-1)" };

const TreeCard = memo(function TreeCard({ data }: NodeProps<Node<CardData>>) {
  const { node, dim, selected } = data;
  const ind = node.indicatorId ? INDICATOR_BY_ID[node.indicatorId] : undefined;
  const st = ind ? latestState(ind) : undefined;
  return (
    <div
      style={{ width: TREE_CARD.w, height: TREE_CARD.h, borderColor: selected ? "var(--accent)" : undefined, opacity: dim ? 0.3 : 1 }}
      className={`rounded-lg border bg-surface px-3 py-1.5 text-left transition-opacity ${selected ? "border-2" : "border-line"}`}
    >
      {node.kind !== "key" && <Handle type="source" position={Position.Left} className="opacity-0" isConnectable={false} />}
      {node.children && <Handle type="target" position={Position.Right} className="opacity-0" isConnectable={false} />}
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 shrink-0 rounded-full" style={{ background: KIND_COLOR[node.kind] }} />
        <span className="text-sm font-medium truncate">{node.label}</span>
        {node.kind !== "key" && (
          <span className="ml-auto text-sm font-semibold" title={node.sign > 0 ? "Cùng chiều" : "Ngược chiều"} style={{ color: node.sign > 0 ? "var(--chart-2)" : "var(--chart-1)" }}>
            {node.sign > 0 ? "+" : "−"}
          </span>
        )}
      </div>
      <div className="text-xs text-muted truncate">
        {st?.value ? `${st.value}${st.suffix ? ` ${st.suffix}` : ""}` : ind ? "Khái niệm, không đo bằng số" : "Chưa có số liệu riêng"}
      </div>
    </div>
  );
});

function TreeHeader({ data }: NodeProps<Node<HeaderData>>) {
  const level = TREE_LEVELS[data.kind];
  return (
    <div style={{ width: TREE_CARD.w }} className="border-b-2 border-line pb-1">
      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: KIND_COLOR[data.kind] }}>{level.name}</div>
      <div className="text-xs text-muted">{level.hint}</div>
    </div>
  );
}

const nodeTypes = { card: TreeCard, header: TreeHeader };

/** Căn cây vừa khung. Vị trí đã biết trước nên tính thẳng, không cần chờ React Flow đo thẻ. */
function FitTree({ bounds }: { bounds: Rect }) {
  const { setViewport, viewportInitialized } = useReactFlow();
  const width = useStore((s) => s.width);
  const height = useStore((s) => s.height);
  const fitted = useRef(false);
  useEffect(() => {
    if (!viewportInitialized || !width || !height) return;
    setViewport(getViewportForBounds(bounds, width, height, 0.25, 1, "24px"), { duration: fitted.current ? 300 : 0 });
    fitted.current = true;
  }, [bounds, viewportInitialized, width, height, setViewport]);
  return null;
}

export default function TreeGraph({ root, active, onPick, onClear }: { root: TreeNode; active: string | null; onPick: (n: TreeNode) => void; onClear: () => void }) {
  const all = useMemo(() => flattenTree(root), [root]);
  const pos = useMemo(() => layoutTree(root), [root]);

  // Nút đang chọn sáng cùng nhánh của nó: các nút tổ tiên và nút con cháu.
  const lit = useMemo(() => {
    if (!active) return null;
    const out = new Set<string>();
    const walk = (n: TreeNode, trail: string[]) => {
      if (n.id === active) {
        trail.forEach((id) => out.add(id));
        flattenTree(n).forEach((c) => out.add(c.id));
      }
      n.children?.forEach((c) => walk(c, [...trail, n.id]));
    };
    walk(root, []);
    return out;
  }, [active, root]);

  const top = useMemo(() => Math.min(...Object.values(pos).map((p) => p.y)) - HEADER_H - 22, [pos]);
  const bounds = useMemo<Rect>(() => {
    const cards = Object.values(pos);
    return {
      x: 0,
      y: top,
      width: Math.max(...cards.map((p) => p.x)) + TREE_CARD.w,
      height: Math.max(...cards.map((p) => p.y)) + TREE_CARD.h - top,
    };
  }, [pos, top]);

  const nodes = useMemo<Node[]>(() => {
    const headers: Node[] = (Object.keys(TREE_LEVELS) as TreeKind[]).map((kind) => ({
      id: `header-${kind}`,
      type: "header",
      position: { x: columnX(kind), y: top },
      data: { kind },
      width: TREE_CARD.w,
      height: HEADER_H,
      selectable: false,
      draggable: false,
    }));
    return [
      ...headers,
      ...all.map((node) => ({
        id: node.id,
        type: "card",
        position: pos[node.id],
        data: { node, dim: !!lit && !lit.has(node.id), selected: node.id === active },
        width: TREE_CARD.w,
        height: TREE_CARD.h,
        draggable: false,
      })),
    ];
  }, [all, pos, lit, active, top]);

  const edges = useMemo<Edge[]>(
    () =>
      all.flatMap((parent) =>
        (parent.children ?? []).map((child) => {
          const color = child.sign > 0 ? "var(--chart-2)" : "var(--chart-1)";
          const on = !lit || (lit.has(parent.id) && lit.has(child.id));
          return {
            id: `${child.id}->${parent.id}`,
            source: child.id,
            target: parent.id,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed, color, width: 14, height: 14 },
            style: { stroke: color, strokeWidth: on && lit ? 2.5 : 1.25, opacity: on ? 1 : 0.12 },
          };
        }),
      ),
    [all, lit],
  );

  return (
    <div className="h-[560px] xl:h-full rounded-xl border border-line bg-surface overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        minZoom={0.25}
        maxZoom={1.4}
        nodesConnectable={false}
        nodesDraggable={false}
        onNodeClick={(_, n) => n.type === "card" && onPick((n.data as CardData).node)}
        onPaneClick={onClear}
      >
        <Background color="var(--grid)" gap={20} size={1.2} />
        <Controls showInteractive={false} />
        <FitTree bounds={bounds} />
      </ReactFlow>
    </div>
  );
}
