"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const ITEMS = [
  { href: "/", label: "Thư viện" },
  { href: "/lo-trinh", label: "Bắt đầu học" },
  { href: "/thu-thach", label: "Thử thách" },
  { href: "/case-study", label: "Case study" },
  { href: "/tu-dien", label: "Chỉ số" },
  { href: "/thuat-ngu", label: "Thuật ngữ" },
  { href: "/mo-phong", label: "Mô phỏng" },
  { href: "/so-sanh", label: "So sánh" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="border-b border-line bg-surface">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-3 sm:gap-6">
        <Link href="/" className="font-semibold whitespace-nowrap">
          Vĩ mô Việt Nam
        </Link>
        <nav className="flex min-w-0 gap-1 overflow-x-auto text-sm">
          {ITEMS.map((it) => {
            const active = it.href === "/" ? path === "/" || path.startsWith("/ban-do") : path.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap ${active ? "bg-accent-soft text-accent font-medium" : "text-muted hover:text-text"}`}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
