"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { MAP_BY_ID } from "@/content/maps";

/** Bản đồ từng nằm ở trang chủ. Static export không có redirect nên link cũ được chuyển tiếp ngay trên trình duyệt. */
export default function LegacyMapRedirect() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!["map", "focus", "from", "to", "explore"].some((k) => params.has(k))) return;
    const rest = new URLSearchParams(params);
    const map = rest.get("map") ?? "";
    rest.delete("map");
    const query = rest.toString();
    router.replace(`/ban-do/${MAP_BY_ID[map] ? map : "chinh"}${query ? `?${query}` : ""}`);
  }, [params, router]);

  return null;
}
