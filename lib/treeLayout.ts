import type { TreeKind, TreeNode } from "@/content/trees";

export const TREE_CARD = { w: 250, h: 52 };
const COLUMN_GAP = 90;
const ROW_GAP = 10;
const COLUMNS: Record<TreeKind, number> = { key: 0, component: 1, driver: 2 };

export function columnX(kind: TreeKind) {
  return COLUMNS[kind] * (TREE_CARD.w + COLUMN_GAP);
}

/** Xếp cây từ trái sang phải: lá xếp dọc theo thứ tự, nút cha nằm giữa các nút con. */
export function layoutTree(root: TreeNode): Record<string, { x: number; y: number }> {
  const out: Record<string, { x: number; y: number }> = {};
  let nextY = 0;
  const place = (n: TreeNode): number => {
    const kids = n.children ?? [];
    let y: number;
    if (kids.length === 0) {
      y = nextY;
      nextY += TREE_CARD.h + ROW_GAP;
    } else {
      const ys = kids.map(place);
      y = (ys[0] + ys[ys.length - 1]) / 2;
      nextY += ROW_GAP;
    }
    out[n.id] = { x: columnX(n.kind), y };
    return y;
  };
  place(root);
  return out;
}
