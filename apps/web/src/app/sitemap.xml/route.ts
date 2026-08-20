import { absoluteUrl } from "@/lib/seo/site";
import { generateSitemaps } from "../sitemap";

export async function GET() {
  const sitemaps = await generateSitemaps();
  
  const sitemapEntries = sitemaps
    .map(
      (s) => `  <sitemap>
    <loc>${absoluteUrl(`/sitemap/${s.id}.xml`)}</loc>
  </sitemap>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
