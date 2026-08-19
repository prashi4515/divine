import type { MetadataRoute } from "next";
import {
  getAllGenealogyPeople,
  getGenealogyModules,
} from "@/lib/genealogy/store";
import { getAllEntities, getCollections } from "@/lib/knowledge/store";
import { entityHref } from "@/lib/knowledge/search";
import { getAtlasPlaces, atlasHref } from "@/lib/atlas/store";
import { getEvents, eventHref } from "@/lib/events/store";
import { getKingdoms, kingdomHref } from "@/lib/kingdoms/store";
import { getWeapons, weaponHref } from "@/lib/weapons/store";
import { getConcepts, conceptHref } from "@/lib/concepts/store";
import {
  getStaticGitaChapter,
  getStaticGitaChaptersIndex,
} from "@/lib/reading/gita-static";
import { getPublishedWorks } from "@/lib/api/works";
import { getPublishedChapters } from "@/lib/api/chapters";
import { publicChapterPath, publicWorkPath } from "@/lib/reading/work-paths";
import { absoluteUrl } from "@/lib/seo/site";
import { SUPPORTED_LOCALES, localizePath, normalizeCleanPath } from "@/lib/i18n/locales";

function hreflangLanguages(cleanPath: string) {
  const norm = normalizeCleanPath(cleanPath);
  return {
    en: absoluteUrl(norm),
    sa: absoluteUrl(localizePath(norm, "sa")),
    hi: absoluteUrl(localizePath(norm, "hi")),
    te: absoluteUrl(localizePath(norm, "te")),
    kn: absoluteUrl(localizePath(norm, "kn")),
    ta: absoluteUrl(localizePath(norm, "ta")),
    ml: absoluteUrl(localizePath(norm, "ml")),
    or: absoluteUrl(localizePath(norm, "or")),
    "x-default": absoluteUrl(norm),
  };
}

function localizedEntries(
  path: string,
  opts: {
    lastModified?: Date;
    changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority?: number;
  } = {},
): MetadataRoute.Sitemap {
  const norm = normalizeCleanPath(path);
  const alternates = { languages: hreflangLanguages(norm) };

  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl(norm),
      lastModified: opts.lastModified ?? new Date(),
      changeFrequency: opts.changeFrequency ?? "monthly",
      priority: opts.priority ?? 0.5,
      alternates,
    },
  ];

  for (const lang of SUPPORTED_LOCALES) {
    const locPath = localizePath(norm, lang);
    entries.push({
      url: absoluteUrl(locPath),
      lastModified: opts.lastModified ?? new Date(),
      changeFrequency: opts.changeFrequency ?? "monthly",
      priority: Math.max(0.1, (opts.priority ?? 0.5) - 0.1),
      alternates,
    });
  }

  return entries;
}

/**
 * Single consolidated sitemap — Next App Router outputs /sitemap.xml directly.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Static landing pages
  const staticPaths = [
    { path: "/", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/bhagavad-gita", changeFrequency: "weekly" as const, priority: 0.98 },
    { path: "/atlas", changeFrequency: "weekly" as const, priority: 0.95 },
    { path: "/events", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/kingdoms", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/weapons", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/concepts", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/timeline", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/encyclopedia", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/genealogy", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/privacy", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/terms", changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  const staticRoutes = staticPaths.flatMap((p) =>
    localizedEntries(p.path, {
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    }),
  );

  // 2. Gita Chapters & Verses
  const chapters = await getStaticGitaChaptersIndex().catch(() => []);
  const chapterRoutes = chapters.flatMap((ch) =>
    localizedEntries(`/bhagavad-gita/chapter-${ch.number}`, {
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    }),
  );

  const verseRoutes: MetadataRoute.Sitemap = [];
  for (const ch of chapters) {
    const snap = await getStaticGitaChapter(ch.number).catch(() => null);
    if (!snap) continue;
    for (const v of snap.verses) {
      verseRoutes.push(
        ...localizedEntries(`/verse/${ch.number}/${v.number}`, {
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.75,
        }),
      );
    }
  }

  // 3. Encyclopedia
  const [entities, collections] = await Promise.all([
    getAllEntities().catch(() => []),
    getCollections().catch(() => []),
  ]);
  const kinds = new Set(
    entities.filter((e) => e.status === "published").map((e) => e.kind),
  );
  const kindRoutes = [...kinds].flatMap((kind) =>
    localizedEntries(`/encyclopedia/${kind}`, {
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );
  const sectionRoutes = collections
    .filter((c) => c.kind === "encyclopedia-section")
    .flatMap((c) =>
      localizedEntries(`/encyclopedia/section/${c.slug}`, {
        changeFrequency: "weekly",
        priority: 0.85,
      }),
    );
  const entityRoutes = entities
    .filter((e) => e.status === "published")
    .flatMap((e) =>
      localizedEntries(entityHref(e), {
        priority: Math.min(0.9, 0.5 + e.importance * 0.08),
      }),
    );

  // 4. Atlas
  const places = await getAtlasPlaces().catch(() => []);
  const atlasRoutes = places.flatMap((p) =>
    localizedEntries(atlasHref(p), {
      priority: Math.min(0.9, 0.55 + p.importance * 0.07),
    }),
  );

  // 5. Knowledge (Events, Kingdoms, Weapons, Concepts)
  const [events, kingdoms, weapons, concepts] = await Promise.all([
    getEvents().catch(() => []),
    getKingdoms().catch(() => []),
    getWeapons().catch(() => []),
    getConcepts().catch(() => []),
  ]);
  const knowledgeRoutes: MetadataRoute.Sitemap = [
    ...events.flatMap((e) =>
      localizedEntries(eventHref(e), {
        priority: Math.min(0.92, 0.6 + e.importance * 0.06),
      }),
    ),
    ...kingdoms.flatMap((k) =>
      localizedEntries(kingdomHref(k), {
        priority: Math.min(0.92, 0.55 + k.importance * 0.07),
      }),
    ),
    ...weapons.flatMap((w) =>
      localizedEntries(weaponHref(w), {
        priority: Math.min(0.92, 0.55 + w.importance * 0.07),
      }),
    ),
    ...concepts.flatMap((c) =>
      localizedEntries(conceptHref(c), {
        priority: Math.min(0.92, 0.55 + c.importance * 0.07),
      }),
    ),
  ];

  // 6. Genealogy
  const [modules, people] = await Promise.all([
    getGenealogyModules().catch(() => []),
    getAllGenealogyPeople().catch(() => []),
  ]);
  const genealogyRoutes: MetadataRoute.Sitemap = [
    ...modules
      .filter((m) => m.status === "available")
      .flatMap((m) =>
        localizedEntries(`/genealogy/${m.slug}`, {
          changeFrequency: "weekly",
          priority: 0.85,
        }),
      ),
    ...people.flatMap((p) =>
      localizedEntries(`/genealogy/person/${p.id}`, {
        priority: Math.min(0.8, 0.4 + p.importance * 0.08),
      }),
    ),
  ];

  // 7. Other Scriptures
  const [works, scriptureChapters] = await Promise.all([
    getPublishedWorks().catch(() => []),
    getPublishedChapters().catch(() => []),
  ]);
  const nonGitaWorks = works.filter((w) => w.code !== "bg");
  const scriptureWorkRoutes = nonGitaWorks.flatMap((w) =>
    localizedEntries(publicWorkPath(w), {
      changeFrequency: "weekly",
      priority: 0.85,
    }),
  );
  const scriptureChapterRoutes = scriptureChapters
    .filter((ch) => nonGitaWorks.some((w) => w.code === ch.work.code))
    .flatMap((ch) =>
      localizedEntries(
        publicChapterPath(
          { code: ch.work.code, slug: ch.work.slug },
          ch.number,
        ),
        {
          changeFrequency: "monthly",
          priority: 0.75,
        },
      ),
    );

  const allRoutes = [
    ...staticRoutes,
    ...chapterRoutes,
    ...verseRoutes,
    ...kindRoutes,
    ...sectionRoutes,
    ...entityRoutes,
    ...atlasRoutes,
    ...knowledgeRoutes,
    ...genealogyRoutes,
    ...scriptureWorkRoutes,
    ...scriptureChapterRoutes,
  ];

  const seen = new Set<string>();
  return allRoutes.filter((r) => {
    if (!r.url || seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
}
