import {
  getSiteUrl,
  absoluteUrl,
  normalizePath,
} from "../apps/web/src/lib/seo/site";
import {
  homeSeo,
  gitaIndexSeo,
  chapterSeo,
  verseSeo,
  searchSeo,
  atlasIndexSeo,
  genealogyIndexSeo,
} from "../apps/web/src/lib/seo/titles";
import { buildPageMetadata } from "../apps/web/src/lib/seo/metadata";
import { breadcrumbJsonLd, websiteJsonLd } from "../apps/web/src/lib/seo/json-ld";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
}

console.log("🔍 Running DIVINE Automated SEO Audit & Integrity Checks...\n");

// 1. Site URL & Canonical Safety
const siteUrl = getSiteUrl();
assert(!siteUrl.endsWith("/"), "getSiteUrl() must not end with a trailing slash");
assert(absoluteUrl("/bhagavad-gita") === `${siteUrl}/bhagavad-gita`, "absoluteUrl must normalize leading slash");
assert(normalizePath("/atlas/?ref=123") === "/atlas", "normalizePath must strip query parameters for canonicals");
console.log("✅ Check 1 PASSED: Site URL & Canonical normalization verified.");

// 2. Metadata Input Validation
const pages = [
  { name: "Home", input: homeSeo() },
  { name: "Gita Index", input: gitaIndexSeo() },
  { name: "Chapter 2", input: chapterSeo(2, "Sāṅkhya Yoga") },
  { name: "Verse 2.47", input: verseSeo(2, 47, "Karmanye vadhikaraste ma phaleshu kadachana") },
  { name: "Atlas Index", input: atlasIndexSeo() },
  { name: "Genealogy Index", input: genealogyIndexSeo() },
];

for (const p of pages) {
  assert(Boolean(p.input.title && p.input.title.trim().length > 5), `${p.name} title must be non-empty`);
  assert(Boolean(p.input.description && p.input.description.trim().length > 10), `${p.name} description must be non-empty`);
  assert(p.input.path.startsWith("/"), `${p.name} path must start with a slash`);

  const built = buildPageMetadata(p.input);
  assert(Boolean(built.title), `${p.name} built metadata title must exist`);
  assert(Boolean(built.description), `${p.name} built metadata description must exist`);
  assert(Boolean(built.openGraph?.title), `${p.name} OpenGraph title must exist`);
  assert(Boolean(built.twitter?.card === "summary_large_image"), `${p.name} Twitter card must be summary_large_image`);
}
console.log("✅ Check 2 PASSED: Public page Metadata, OG, and Twitter Card schemas verified.");

// 3. Search Page Noindex Compliance
const searchInput = searchSeo("karma");
assert(searchInput.noindex === true, "Search queries must be marked noindex");
const builtSearch = buildPageMetadata(searchInput);
assert(
  typeof builtSearch.robots === "object" &&
    builtSearch.robots !== null &&
    "index" in builtSearch.robots &&
    builtSearch.robots.index === false,
  "Search page Metadata robots tag must set index: false",
);
console.log("✅ Check 3 PASSED: Search query noindex policy enforced.");

// 4. JSON-LD Schema Validation
const crumbs = breadcrumbJsonLd([
  { name: "Home", href: "/" },
  { name: "Bhagavad Gita", href: "/bhagavad-gita" },
  { name: "Chapter 2" },
]);
assert(crumbs["@type"] === "BreadcrumbList", "Breadcrumb JSON-LD type must be BreadcrumbList");
assert(crumbs.itemListElement.length === 3, "Breadcrumb JSON-LD must contain 3 items");
assert(crumbs.itemListElement[0]?.item === `${siteUrl}/`, "Home crumb item must point to root");

const siteLd = websiteJsonLd();
assert(siteLd["@type"] === "WebSite", "WebSite JSON-LD type must be WebSite");
console.log("✅ Check 4 PASSED: Schema.org JSON-LD structures validated.");

console.log("\n🎉 ALL SEO AUDIT CHECKS PASSED SUCCESSFULLY!");
