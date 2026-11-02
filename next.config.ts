import type { NextConfig } from "next";

// Bản tĩnh cho GitHub Pages: STATIC_EXPORT=1 BASE_PATH=/vi-mo next build → thư mục out/
const isStatic = process.env.STATIC_EXPORT === "1";
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(isStatic && { output: "export", basePath, trailingSlash: true, images: { unoptimized: true } }),
  env: { NEXT_PUBLIC_STATIC_EXPORT: isStatic ? "1" : "0" },
  // PPR không chạy được ở chế độ export.
  cacheComponents: !isStatic,
  partialPrefetching: !isStatic,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
