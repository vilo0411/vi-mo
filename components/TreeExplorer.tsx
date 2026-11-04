"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ALGORITHMS } from "@/content/algorithms";
import { TREE_BY_ID, TREE_LEVELS, type TreeKind, type TreeNode } from "@/content/trees";
import { useProgress } from "@/lib/progress";
import MetricPanel from "./MetricPanel";
import TreeGraph from "./TreeGraph";

const DOT: Record<TreeKind, string> = { key: "var(--g-ket-qua)", component: "var(--chart-2)", driver: "var(--chart-1)" };

export default function TreeExplorer({ treeId }: { treeId: string }) {
  const tree = TREE_BY_ID[treeId];
  const [active, setActive] = useState<string | null>(null);
  const [metric, setMetric] = useState<string | null>(null);
  const [showQuestions, setShowQuestions] = useState(true);
  const { markSeen } = useProgress();
  const algorithm = ALGORITHMS.find((a) => a.treeId === treeId);

  useEffect(() => {
    markSeen(`tree:${treeId}`);
  }, [treeId, markSeen]);

  const pick = (n: TreeNode) => {
    setActive(n.id);
    if (n.indicatorId) setMetric(n.indicatorId);
    else {
      setMetric(null);
      setShowQuestions(true);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-end justify-between">
        <div>
          <nav className="text-sm text-muted mb-1" aria-label="Vị trí">
            <Link href="/" className="hover:text-text">Thư viện</Link>
            <span className="mx-1.5" aria-hidden>›</span>
            <span className="text-text">{tree.name}</span>
          </nav>
          <h1 className="text-2xl font-semibold">{tree.name}</h1>
          <p className="text-sm text-muted mt-1 max-w-2xl">{tree.hint} Bấm vào câu hỏi để xem nhánh tương ứng, bấm vào thẻ để đọc chi tiết.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showQuestions} onChange={(e) => setShowQuestions(e.target.checked)} />
            Câu hỏi của cây
          </label>
          {algorithm && <Link href={`/chan-doan/${algorithm.id}`} className="px-3 py-1.5 rounded-lg bg-accent text-white">Chẩn đoán từng bước</Link>}
          <Link href={`/ban-do/${tree.mapId}`} className="text-accent">Xem trên bản đồ →</Link>
        </div>
      </div>

      <div className="xl:flex xl:gap-3 xl:h-[max(620px,calc(100vh-210px))]">
        <div className="flex-1 min-w-0">
          <TreeGraph root={tree.root} active={active} onPick={pick} onClear={() => { setActive(null); setMetric(null); }} />
        </div>
        {metric ? (
          <aside className="mt-3 xl:mt-0 xl:w-[390px] xl:shrink-0 bg-surface border border-line rounded-xl p-5 overflow-hidden">
            <MetricPanel
              key={metric}
              id={metric}
              onSelect={setMetric}
              onSelectLink={(k) => {
                const [from, to] = k.split("->");
                setMetric(from === metric ? to : from);
              }}
              onClose={() => setMetric(null)}
            />
          </aside>
        ) : showQuestions ? (
          <aside className="mt-3 xl:mt-0 xl:w-[390px] xl:shrink-0 bg-surface border border-line rounded-xl overflow-y-auto" aria-label="Câu hỏi của cây">
            <div className="sticky top-0 z-10 bg-surface border-b border-line px-5 py-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Câu hỏi của cây</h2>
              <button type="button" onClick={() => setShowQuestions(false)} aria-label="Ẩn câu hỏi" className="w-7 h-7 rounded-md bg-surface-2 text-muted hover:text-text">×</button>
            </div>
            <ul className="px-5 py-3">
              <Question node={tree.root} active={active} onOpen={setActive} onMetric={setMetric} />
            </ul>
          </aside>
        ) : null}
      </div>

      <p className="text-xs text-muted">
        {(Object.keys(TREE_LEVELS) as TreeKind[]).map((k) => TREE_LEVELS[k].name).join(" → ")}. Mũi tên cam: cùng chiều, cái này tăng thì cái kia tăng. Mũi tên xanh: ngược chiều, cái này tăng thì cái kia giảm.
      </p>
    </div>
  );
}

function Question({ node, active, onOpen, onMetric }: { node: TreeNode; active: string | null; onOpen: (id: string | null) => void; onMetric: (id: string) => void }) {
  const open = active === node.id;
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onOpen(open ? null : node.id)}
        className={`w-full text-left flex gap-2 rounded-md px-1.5 py-1 leading-snug hover:bg-surface-2 ${node.kind === "driver" ? "text-sm" : "font-medium"} ${open ? "bg-accent-soft" : ""}`}
      >
        <span className="mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full" style={{ background: DOT[node.kind] }} />
        {node.question}
      </button>
      {open && (
        <div className="ml-5 mt-1 mb-2 text-sm leading-relaxed text-muted">
          <p>{node.note}</p>
          {node.indicatorId && (
            <button type="button" onClick={() => onMetric(node.indicatorId!)} className="text-accent mt-1">
              Xem chỉ số {node.label} →
            </button>
          )}
        </div>
      )}
      {node.children && (
        <ul className="ml-3.5 border-l border-line pl-2 space-y-0.5 my-1">
          {node.children.map((c) => <Question key={c.id} node={c} active={active} onOpen={onOpen} onMetric={onMetric} />)}
        </ul>
      )}
    </li>
  );
}
