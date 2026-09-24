import type { NextConfig } from "next";

const cloudflarePreview = process.env.CF_PREVIEW === "1";

const nextConfig: NextConfig = {
  ...(cloudflarePreview
    ? {
        env: { CF_PREVIEW: "1" },
        turbopack: {
          resolveAlias: {
            "@/lib/db": "./src/lib/db/cloudflare-preview.ts",
          },
        },
      }
    : {}),
};

export default nextConfig;
