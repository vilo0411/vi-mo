import { Suspense } from "react";
import CompareTool from "@/components/CompareTool";

export const metadata = { title: "So sánh hai chỉ số · Vĩ mô Việt Nam" };

export default function ComparePage() {
  return (
    <Suspense>
      <CompareTool />
    </Suspense>
  );
}
