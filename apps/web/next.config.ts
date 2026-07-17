import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Monorepo: trace shared packages from repo root (packages/types, packages/ui).
  outputFileTracingRoot: path.join(__dirname, "../.."),
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
    ];
  },
};

export default nextConfig;
