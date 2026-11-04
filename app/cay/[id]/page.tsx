import { Suspense } from "react";
import { notFound } from "next/navigation";
import TreeExplorer from "@/components/TreeExplorer";
import { TREES, TREE_BY_ID } from "@/content/trees";

export function generateStaticParams() {
  return TREES.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `${TREE_BY_ID[id]?.name ?? "Cây chỉ số"} · Vĩ mô Việt Nam` };
}

export default function TreePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <TreePageContent params={params} />
    </Suspense>
  );
}

async function TreePageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!TREE_BY_ID[id]) notFound();
  return <TreeExplorer key={id} treeId={id} />;
}
