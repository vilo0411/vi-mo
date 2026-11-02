import { LINKS, type Link } from "@/content/links";

export type Branches = { causes: Link[]; effects: Link[] };

export function branchesOf(id: string, links: Link[] = LINKS): Branches {
  return {
    causes: links.filter((l) => l.to === id).sort((a, b) => b.strength - a.strength),
    effects: links.filter((l) => l.from === id).sort((a, b) => b.strength - a.strength),
  };
}

/**
 * Thứ tự đi qua bản đồ theo từng lớp nhánh, bắt đầu từ `root`: trước hết là các nhánh trực tiếp của root
 * (nguyên nhân trước, hệ quả sau, mạnh trước yếu sau), rồi lần lượt đi tiếp vào từng nhánh đó.
 */
export function exploreOrder(root: string, links: Link[] = LINKS): string[] {
  const order = [root];
  const seen = new Set(order);
  for (let i = 0; i < order.length; i++) {
    const { causes, effects } = branchesOf(order[i], links);
    for (const l of [...causes.map((c) => c.from), ...effects.map((e) => e.to)]) {
      if (!seen.has(l)) {
        seen.add(l);
        order.push(l);
      }
    }
  }
  return order;
}

/** Những thẻ cần hiện khi đã đi qua `visited`: chính các thẻ đó cộng mọi nhánh trực tiếp của chúng. */
export function revealedFor(visited: string[], links: Link[] = LINKS): string[] {
  const out = new Set(visited);
  for (const id of visited) {
    const { causes, effects } = branchesOf(id, links);
    for (const l of causes) out.add(l.from);
    for (const l of effects) out.add(l.to);
  }
  return [...out];
}
