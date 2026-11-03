import { Suspense } from "react";
import { notFound } from "next/navigation";
import MapExplorer from "@/components/MapExplorer";
import { MAPS, MAP_BY_ID } from "@/content/maps";

export function generateStaticParams() {
  return MAPS.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `${MAP_BY_ID[id]?.name ?? "Bản đồ"} · Vĩ mô Việt Nam` };
}

export default function MapPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <MapPageContent params={params} />
    </Suspense>
  );
}

async function MapPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!MAP_BY_ID[id]) notFound();
  return <MapExplorer key={id} mapId={id} />;
}
