import { Suspense } from "react";
import LegacyMapRedirect from "@/components/LegacyMapRedirect";
import Library from "@/components/Library";

export default function Home() {
  return (
    <>
      <Suspense>
        <LegacyMapRedirect />
      </Suspense>
      <Library />
    </>
  );
}
