import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import Nav from "@/components/Nav";
import RewardToast from "@/components/RewardToast";
import "./globals.css";

const font = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Bản đồ vĩ mô Việt Nam",
  description: "Học kinh tế vĩ mô qua các chỉ số liên kết với nhau, bằng dữ liệu thật của Việt Nam",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${font.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              let theme;
              try { theme = localStorage.getItem("theme"); } catch {}
              document.documentElement.dataset.theme = theme === "light" || theme === "dark"
                ? theme
                : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            })();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Nav />
        <RewardToast />
        <main className="flex-1 w-full max-w-[1680px] mx-auto px-4 sm:px-6 py-6">{children}</main>
        <footer className="text-xs text-muted text-center py-6 px-4">
          Dữ liệu: World Bank, IMF, FRED và các quyết định của NHNN. Mô phỏng là mô hình giáo khoa, không phải dự báo.
        </footer>
      </body>
    </html>
  );
}
