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

export type SitemapId =
  | "static"
  | "gita"
  | "verses"
  | "encyclopedia"
  | "atlas"
  | "knowledge"
  | "genealogy"
  | "scriptures";

export async function generateSitemaps() {
  return [
    { id: "static" },
    { id: "gita" },
    { id: "verses" },
    { id: "encyclopedia" },
    { id: "atlas" },
    { id: "knowledge" },
    { id: "genealogy" },
    { id: "scriptures" },
  ] satisfies Array<{ id: SitemapId }>;
}

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

function deduplicateAndSort(routes: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  const unique = routes.filter((r) => {
    if (!r.url || seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  return unique.sort((a, b) => a.url.localeCompare(b.url));
}

async function safeFetch<T>(name: string, fetcher: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fetcher();
  } catch (err) {
    console.error(`[sitemap] Error loading ${name} data for sitemap generation:`, err);
    return fallback;
  }
}

type Props = {
  id?: Promise<string> | string;
};

export default async function sitemap(props?: Props): Promise<MetadataRoute.Sitemap> {
  const resolvedId = props?.id ? (typeof props.id === "object" && "then" in props.id ? await props.id : props.id) : undefined;
  const id = resolvedId as SitemapId | undefined;
  const now = new Date();

  // 1. Static landing pages
  if (!id || id === "static") {
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
    if (id === "static") return deduplicateAndSort(staticRoutes);
  }

  // 2. Gita Chapters
  if (!id || id === "gita") {
    const chapters = await safeFetch("gita chapters", () => getStaticGitaChaptersIndex(), []);
    const chapterRoutes = chapters.flatMap((ch) =>
      localizedEntries(`/bhagavad-gita/chapter-${ch.number}`, {
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.9,
      }),
    );
    if (id === "gita") return deduplicateAndSort(chapterRoutes);
  }

  // 3. Gita Verses
  if (!id || id === "verses") {
    const chapters = await safeFetch("gita chapters for verses", () => getStaticGitaChaptersIndex(), []);
    const verseRoutes: MetadataRoute.Sitemap = [];
    for (const ch of chapters) {
      const snap = await safeFetch(`gita chapter ${ch.number}`, () => getStaticGitaChapter(ch.number), null);
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
    if (id === "verses") return deduplicateAndSort(verseRoutes);
  }

  // 4. Encyclopedia
  if (!id || id === "encyclopedia") {
    const [entities, collections] = await Promise.all([
      safeFetch("encyclopedia entities", () => getAllEntities(), []),
      safeFetch("encyclopedia collections", () => getCollections(), []),
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
    const encyclopediaRoutes = [...kindRoutes, ...sectionRoutes, ...entityRoutes];
    if (id === "encyclopedia") return deduplicateAndSort(encyclopediaRoutes);
  }

  // 5. Atlas
  if (!id || id === "atlas") {
    const places = await safeFetch("atlas places", () => getAtlasPlaces(), []);
    const atlasRoutes = places.flatMap((p) =>
      localizedEntries(atlasHref(p), {
        priority: Math.min(0.9, 0.55 + p.importance * 0.07),
      }),
    );
    if (id === "atlas") return deduplicateAndSort(atlasRoutes);
  }

  // 6. Knowledge (Events, Kingdoms, Weapons, Concepts)
  if (!id || id === "knowledge") {
    const [events, kingdoms, weapons, concepts] = await Promise.all([
      safeFetch("knowledge events", () => getEvents(), []),
      safeFetch("knowledge kingdoms", () => getKingdoms(), []),
      safeFetch("knowledge weapons", () => getWeapons(), []),
      safeFetch("knowledge concepts", () => getConcepts(), []),
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
    if (id === "knowledge") return deduplicateAndSort(knowledgeRoutes);
  }

  // 7. Genealogy
  if (!id || id === "genealogy") {
    const [modules, people] = await Promise.all([
      safeFetch("genealogy modules", () => getGenealogyModules(), []),
      safeFetch("genealogy people", () => getAllGenealogyPeople(), []),
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
    if (id === "genealogy") return deduplicateAndSort(genealogyRoutes);
  }

  // 8. Other Scriptures
  if (!id || id === "scriptures") {
    const [works, scriptureChapters] = await Promise.all([
      safeFetch("scripture works", () => getPublishedWorks(), []),
      safeFetch("scripture chapters", () => getPublishedChapters(), []),
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
    const scriptureRoutes = [...scriptureWorkRoutes, ...scriptureChapterRoutes];
    if (id === "scriptures") return deduplicateAndSort(scriptureRoutes);
  }

  // Fallback: Return all deduplicated and sorted routes if no matching id or if all requested
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

  const chapters = await safeFetch("gita chapters", () => getStaticGitaChaptersIndex(), []);
  const chapterRoutes = chapters.flatMap((ch) =>
    localizedEntries(`/bhagavad-gita/chapter-${ch.number}`, {
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    }),
  );

  const verseRoutes: MetadataRoute.Sitemap = [];
  for (const ch of chapters) {
    const snap = await safeFetch(`gita chapter ${ch.number}`, () => getStaticGitaChapter(ch.number), null);
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

  const [entities, collections] = await Promise.all([
    safeFetch("encyclopedia entities", () => getAllEntities(), []),
    safeFetch("encyclopedia collections", () => getCollections(), []),
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

  const places = await safeFetch("atlas places", () => getAtlasPlaces(), []);
  const atlasRoutes = places.flatMap((p) =>
    localizedEntries(atlasHref(p), {
      priority: Math.min(0.9, 0.55 + p.importance * 0.07),
    }),
  );

  const [events, kingdoms, weapons, concepts] = await Promise.all([
    safeFetch("knowledge events", () => getEvents(), []),
    safeFetch("knowledge kingdoms", () => getKingdoms(), []),
    safeFetch("knowledge weapons", () => getWeapons(), []),
    safeFetch("knowledge concepts", () => getConcepts(), []),
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

  const [modules, people] = await Promise.all([
    safeFetch("genealogy modules", () => getGenealogyModules(), []),
    safeFetch("genealogy people", () => getAllGenealogyPeople(), []),
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

  const [works, scriptureChapters] = await Promise.all([
    safeFetch("scripture works", () => getPublishedWorks(), []),
    safeFetch("scripture chapters", () => getPublishedChapters(), []),
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

  return deduplicateAndSort(allRoutes);
}
