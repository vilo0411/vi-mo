import { Suspense } from "react";
import Simulator from "@/components/Simulator";

export const metadata = { title: "Mô phỏng · Vĩ mô Việt Nam" };

export default function SimulatePage() {
  return (
    <Suspense>
      <Simulator />
    </Suspense>
  );
}
