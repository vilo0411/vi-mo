import { Suspense } from "react";
import { notFound } from "next/navigation";
import AlgorithmPlayer from "@/components/AlgorithmPlayer";
import { ALGORITHMS, ALGORITHM_BY_ID } from "@/content/algorithms";

export function generateStaticParams() {
  return ALGORITHMS.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `${ALGORITHM_BY_ID[id]?.name ?? "Chẩn đoán"} · Vĩ mô Việt Nam` };
}

export default function AlgorithmPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <AlgorithmPageContent params={params} />
    </Suspense>
  );
}

async function AlgorithmPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ALGORITHM_BY_ID[id]) notFound();
  return <AlgorithmPlayer key={id} algorithmId={id} />;
}
