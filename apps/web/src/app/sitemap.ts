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

function entry(
  path: string,
  opts: {
    lastModified?: Date;
    changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority?: number;
  } = {},
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
    lastModified: opts.lastModified ?? new Date(),
    changeFrequency: opts.changeFrequency ?? "monthly",
    priority: opts.priority ?? 0.5,
  };
}

/**
 * Single consolidated sitemap — Next App Router outputs /sitemap.xml directly.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Static landing pages
  const staticRoutes: MetadataRoute.Sitemap = [
    entry("/", { changeFrequency: "weekly", priority: 1 }),
    entry("/bhagavad-gita", { changeFrequency: "weekly", priority: 0.98 }),
    entry("/atlas", { changeFrequency: "weekly", priority: 0.95 }),
    entry("/events", { changeFrequency: "weekly", priority: 0.9 }),
    entry("/kingdoms", { changeFrequency: "weekly", priority: 0.9 }),
    entry("/weapons", { changeFrequency: "weekly", priority: 0.9 }),
    entry("/concepts", { changeFrequency: "weekly", priority: 0.9 }),
    entry("/timeline", { changeFrequency: "weekly", priority: 0.9 }),
    entry("/encyclopedia", { changeFrequency: "weekly", priority: 0.9 }),
    entry("/genealogy", { changeFrequency: "weekly", priority: 0.9 }),
    entry("/about", { changeFrequency: "monthly", priority: 0.7 }),
    entry("/contact", { changeFrequency: "monthly", priority: 0.7 }),
    entry("/privacy", { changeFrequency: "monthly", priority: 0.5 }),
    entry("/terms", { changeFrequency: "monthly", priority: 0.5 }),
  ];

  // 2. Gita Chapters & Verses
  const chapters = await getStaticGitaChaptersIndex().catch(() => []);
  const chapterRoutes: MetadataRoute.Sitemap = chapters.map((ch) =>
    entry(`/bhagavad-gita/chapter-${ch.number}`, {
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
        entry(`/verse/${ch.number}/${v.number}`, {
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
  const kindRoutes = [...kinds].map((kind) =>
    entry(`/encyclopedia/${kind}`, {
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );
  const sectionRoutes = collections
    .filter((c) => c.kind === "encyclopedia-section")
    .map((c) =>
      entry(`/encyclopedia/section/${c.slug}`, {
        changeFrequency: "weekly",
        priority: 0.85,
      }),
    );
  const entityRoutes = entities
    .filter((e) => e.status === "published")
    .map((e) =>
      entry(entityHref(e), {
        priority: Math.min(0.9, 0.5 + e.importance * 0.08),
      }),
    );

  // 4. Atlas
  const places = await getAtlasPlaces().catch(() => []);
  const atlasRoutes = places.map((p) =>
    entry(atlasHref(p), {
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
    ...events.map((e) =>
      entry(eventHref(e), {
        priority: Math.min(0.92, 0.6 + e.importance * 0.06),
      }),
    ),
    ...kingdoms.map((k) =>
      entry(kingdomHref(k), {
        priority: Math.min(0.92, 0.55 + k.importance * 0.07),
      }),
    ),
    ...weapons.map((w) =>
      entry(weaponHref(w), {
        priority: Math.min(0.92, 0.55 + w.importance * 0.07),
      }),
    ),
    ...concepts.map((c) =>
      entry(conceptHref(c), {
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
      .map((m) =>
        entry(`/genealogy/${m.slug}`, {
          changeFrequency: "weekly",
          priority: 0.85,
        }),
      ),
    ...people.map((p) =>
      entry(`/genealogy/person/${p.id}`, {
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
  const scriptureWorkRoutes = nonGitaWorks.map((w) =>
    entry(publicWorkPath(w), {
      changeFrequency: "weekly",
      priority: 0.85,
    }),
  );
  const scriptureChapterRoutes = scriptureChapters
    .filter((ch) => nonGitaWorks.some((w) => w.code === ch.work.code))
    .map((ch) =>
      entry(
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
