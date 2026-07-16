import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Monorepo: trace shared packages from repo root (packages/types, packages/ui).
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
