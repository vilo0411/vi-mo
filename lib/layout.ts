import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode } from "elkjs/lib/elk-api";
import { INDICATORS } from "@/content/indicators";
import { linkKey, type Link } from "@/content/links";

export const CARD_W = 230;
export const CARD_H = 112;

export type XY = { x: number; y: number };
export type Layout = { positions: Record<string, XY>; edges: Record<string, XY[]> };

const elk = new ELK();
const cache = new Map<string, Promise<Layout>>();

// Thứ tự nhân quả: cạnh nào đi ngược thứ tự này (ví dụ lạm phát → lãi suất điều hành) được coi là vòng phản hồi
// và vẽ vòng ngược lại, thay vì làm đảo lộn cả bố cục từ trái sang phải.
const CAUSAL_ORDER = [
  "fed_rate", "oil_price", "remittances", "fdi", "fpi",
  "policy_rate", "omo", "credit_quota", "gov_spending", "tax", "public_investment",
  "interbank", "lending_rate", "real_rate", "fx_rate", "fiscal_balance",
  "credit", "reserves", "public_debt", "expectations", "confidence",
  "m2", "consumption", "investment", "net_exports",
  "current_account", "gdp_growth",
  "unemployment", "cpi",
];

const FIRST = new Set(["fed_rate", "oil_price", "remittances", "policy_rate", "gov_spending", "omo", "credit_quota", "tax", "public_investment"]);
const LAST = new Set(["cpi", "unemployment"]);

function rank(id: string) {
  const i = CAUSAL_ORDER.indexOf(id);
  return i < 0 ? CAUSAL_ORDER.length : i;
}

/**
 * Xếp các thẻ theo lớp từ trái sang phải và vạch đường nối vuông góc tránh thẻ (thuật toán layered của ELK).
 * Kết quả được nhớ theo tập thẻ, vì bản đồ đầy đủ và các bản đồ con dùng lại nhiều lần.
 */
export function layoutGraph(ids: string[], links: Link[]): Promise<Layout> {
  const nodeIds = [...ids].sort((a, b) => rank(a) - rank(b));
  const set = new Set(nodeIds);
  const edges = links
    .filter((l) => set.has(l.from) && set.has(l.to))
    .sort((a, b) => rank(a.from) - rank(b.from) || rank(a.to) - rank(b.to));
  const key = nodeIds.join(",") + "|" + edges.map(linkKey).join(",");
  const hit = cache.get(key);
  if (hit) return hit;

  const graph: ElkNode = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.cycleBreaking.strategy": "MODEL_ORDER",
      "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.spacing.nodeNodeBetweenLayers": "72",
      "elk.spacing.nodeNode": "44",
      "elk.layered.spacing.edgeNodeBetweenLayers": "20",
      "elk.spacing.edgeNode": "24",
      "elk.spacing.edgeEdge": "14",
      "elk.layered.mergeEdges": "false",
      "elk.partitioning.activate": "true",
    },
    children: nodeIds.map((id) => ({
      id,
      width: CARD_W,
      height: CARD_H,
      // Cú sốc bên ngoài và công cụ chính sách luôn ở cột đầu, kết quả cuối cùng ở cột cuối.
      layoutOptions: { "elk.partitioning.partition": String(FIRST.has(id) ? 0 : LAST.has(id) ? 2 : 1) },
    })),
    edges: edges.map((l) => ({ id: linkKey(l), sources: [l.from], targets: [l.to] })),
  };

  // ELK đôi khi lỗi với ràng buộc cột trên một số tập thẻ nhỏ: thử lại không ràng buộc, rồi mới xếp dạng lưới.
  const noPartition: ElkNode = {
    ...graph,
    layoutOptions: { ...graph.layoutOptions, "elk.partitioning.activate": "false" },
    children: graph.children!.map((c) => ({ ...c, layoutOptions: undefined })),
  };
  const job = elk
    .layout(graph)
    .catch(() => elk.layout(noPartition))
    .catch(() => gridLayout(nodeIds))
    .then((res) => {
    const positions: Record<string, XY> = {};
    for (const c of res.children ?? []) positions[c.id] = { x: c.x ?? 0, y: c.y ?? 0 };
    const out: Record<string, XY[]> = {};
    for (const e of res.edges ?? []) {
      const sec = e.sections?.[0];
      if (sec) out[e.id] = [sec.startPoint, ...(sec.bendPoints ?? []), sec.endPoint];
    }
    return { positions, edges: out };
  });
  cache.set(key, job);
  return job;
}

function gridLayout(ids: string[]): ElkNode {
  const cols = Math.ceil(Math.sqrt(ids.length));
  return {
    id: "root",
    children: ids.map((id, i) => ({ id, x: (i % cols) * (CARD_W + 80), y: Math.floor(i / cols) * (CARD_H + 60), width: CARD_W, height: CARD_H })),
    edges: [],
  };
}

export const ALL_IDS = INDICATORS.map((i) => i.id);
