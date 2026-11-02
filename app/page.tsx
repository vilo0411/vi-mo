import { Suspense } from "react";
import MapExplorer from "@/components/MapExplorer";

export default function Home() {
  return (
    <Suspense>
      <MapExplorer />
    </Suspense>
  );
}
