import type { Link } from "@/content/links";

export type CausalPath = { nodes: string[]; links: Link[]; sign: 1 | -1; strength: number };

/** Tìm mọi chuỗi nhân quả không lặp từ `from` tới `to`, dài tối đa `maxHops` bước. */
export function findPaths(links: Link[], from: string, to: string, maxHops = 5): CausalPath[] {
  const out = new Map<string, Link[]>();
  for (const l of links) out.set(l.from, [...(out.get(l.from) ?? []), l]);

  const results: CausalPath[] = [];
  const walk = (node: string, visited: Set<string>, path: Link[]) => {
    if (node === to && path.length) {
      const sign = path.reduce<number>((s, l) => s * l.sign, 1) as 1 | -1;
      const strength = path.reduce((s, l) => s * l.strength, 1);
      results.push({ nodes: [from, ...path.map((l) => l.to)], links: [...path], sign, strength });
      return;
    }
    if (path.length >= maxHops) return;
    for (const l of out.get(node) ?? []) {
      if (visited.has(l.to)) continue;
      visited.add(l.to);
      path.push(l);
      walk(l.to, visited, path);
      path.pop();
      visited.delete(l.to);
    }
  };
  walk(from, new Set([from]), []);
  return results.sort((a, b) => b.strength - a.strength || a.links.length - b.links.length);
}
