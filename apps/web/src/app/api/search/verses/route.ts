import { NextResponse } from "next/server";
import { staticSearchVerses } from "@/lib/search/static-verse-search";

export const runtime = "nodejs";
/** Keep index warm across requests in the Node server. */
export const dynamic = "force-dynamic";

/**
 * Public verse search — served from static Gita snapshots (no Neon round-trip).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? undefined;
  const topic = url.searchParams.get("topic") ?? undefined;
  const lang = url.searchParams.get("lang") ?? "en";
  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 20);

  const started = Date.now();
  const results = await staticSearchVerses({ q, topic, lang, page, pageSize });
  const response = NextResponse.json(results);
  response.headers.set("Server-Timing", `search;dur=${Date.now() - started}`);
  response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return response;
}
