import type { NextConfig } from "next";

// Cache Components / Partial Prefetching are left off: the Cloudflare adapter
// (OpenNext) does not fully support them yet, and every page here is static.
const nextConfig: NextConfig = {
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
