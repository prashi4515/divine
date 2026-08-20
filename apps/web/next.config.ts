import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Monorepo: trace shared packages from repo root (packages/types, packages/ui).
  outputFileTracingRoot: path.join(__dirname, "../.."),
  // Keep on-disk content snapshots in the Vercel serverless bundle.
  outputFileTracingIncludes: {
    "/api/gita/commentary/[publicId]": ["./content/gita/commentary/**/*"],
    "/bhagavad-gita": ["./content/gita/**/*"],
    "/bhagavad-gita/[slug]": ["./content/gita/**/*"],
    "/verse/[chapter]/[verse]": ["./content/gita/**/*"],
    "/sitemap": ["./content/**/*"],
    "/sitemap.xml": ["./content/**/*"],
    "/sitemap/[id]": ["./content/**/*"],
  },
  async redirects() {
    return [
      {
        source: "/bhagavad-gita/signup",
        destination: "/signup",
        permanent: false,
      },
      {
        source: "/accounts/signup",
        destination: "/signup",
        permanent: false,
      },
      {
        source: "/accounts/my-account/:path*",
        destination: "/account/:path*",
        permanent: false,
      },
      {
        source: "/accounts/my-account",
        destination: "/account",
        permanent: false,
      },
      {
        source: "/profile",
        destination: "/account",
        permanent: false,
      },
      // Clean URL aliases → canonical routes (do not break existing URLs)
      {
        source: "/chapter/:number(\\d+)",
        destination: "/bhagavad-gita/chapter-:number",
        permanent: true,
      },
      {
        source: "/characters/:slug",
        destination: "/encyclopedia/person/:slug",
        permanent: true,
      },
      {
        source: "/character/:slug",
        destination: "/encyclopedia/person/:slug",
        permanent: true,
      },
    ];
  },
  // No trailing slashes — keep one canonical form
  trailingSlash: false,
};

export default nextConfig;
