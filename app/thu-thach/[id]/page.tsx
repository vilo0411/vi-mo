import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SCENARIOS, SCENARIO_BY_ID } from "@/content/scenarios";
import GamePlayer from "@/components/GamePlayer";

export function generateStaticParams() {
  return SCENARIOS.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `${SCENARIO_BY_ID[id]?.title ?? "Thử thách"} · Vĩ mô Việt Nam` };
}

export default function ScenarioPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <ScenarioContent params={params} />
    </Suspense>
  );
}

async function ScenarioContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scenario = SCENARIO_BY_ID[id];
  if (!scenario) notFound();
  return (
    <div className="space-y-6">
      <div>
        <Link href="/thu-thach" className="text-sm text-muted hover:text-text">← Tất cả thử thách</Link>
        <div className="text-sm text-muted mt-3">Vai của bạn: {scenario.role}</div>
        <h1 className="text-2xl font-semibold">{scenario.title}</h1>
        <p className="text-muted mt-1 max-w-3xl">
          <span className="text-text font-medium">Mục tiêu:</span> {scenario.goals}
        </p>
      </div>
      <GamePlayer key={scenario.id} scenario={scenario} />
    </div>
  );
}
