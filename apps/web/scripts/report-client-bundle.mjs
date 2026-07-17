#!/usr/bin/env node
/**
 * Summarize Next.js client chunk sizes after `pnpm --filter @divine/web build`.
 * Usage: node apps/web/scripts/report-client-bundle.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const chunksDir = path.join(__dirname, "../.next/static/chunks");

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.(js|css)$/.test(name)) {
      acc.push({ file: path.relative(chunksDir, full), bytes: st.size });
    }
  }
  return acc;
}

function fmt(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

const files = walk(chunksDir).sort((a, b) => b.bytes - a.bytes);
if (files.length === 0) {
  console.error("No chunks found. Run: pnpm --filter @divine/web build");
  process.exit(1);
}

const total = files.reduce((s, f) => s + f.bytes, 0);
console.log(`Client static chunks: ${files.length} files, ${fmt(total)} total\n`);
console.log("Top 25 by size:");
for (const f of files.slice(0, 25)) {
  console.log(`  ${fmt(f.bytes).padStart(10)}  ${f.file}`);
}

const classify = (name) => {
  const n = name.toLowerCase();
  if (n.includes("framework") || n.includes("main-app") || n.includes("webpack"))
    return "framework";
  if (n.includes("polyfill")) return "polyfill";
  if (n.includes("admin")) return "admin";
  if (n.includes("search") || n.includes("header-search")) return "search";
  if (n.includes("auth") || n.includes("login") || n.includes("signup"))
    return "auth";
  if (n.includes("reading") || n.includes("verse") || n.includes("chapter"))
    return "reading";
  return "other";
};

const byClass = {};
for (const f of files) {
  const c = classify(f.file);
  byClass[c] = (byClass[c] ?? 0) + f.bytes;
}
console.log("\nRough classification (filename heuristics):");
for (const [k, v] of Object.entries(byClass).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(12)} ${fmt(v)}`);
}
