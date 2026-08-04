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
import { absoluteUrl } from "@/lib/seo/site";

type SitemapId =
  | "static"
  | "chapters"
  | "verses"
  | "encyclopedia"
  | "atlas"
  | "knowledge"
  | "genealogy";

export async function generateSitemaps() {
  return [
    { id: "static" },
    { id: "chapters" },
    { id: "verses" },
    { id: "encyclopedia" },
    { id: "atlas" },
    { id: "knowledge" },
    { id: "genealogy" },
  ] satisfies Array<{ id: SitemapId }>;
}

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
 * Split sitemaps for scale — Next serves /sitemap/{id}.xml and an index.
 */
export default async function sitemap(props: {
  id: Promise<string> | string;
}): Promise<MetadataRoute.Sitemap> {
  const id = (await props.id) as SitemapId;
  const now = new Date();

  if (id === "static") {
    return [
      entry("/", { changeFrequency: "weekly", priority: 1 }),
      entry("/bhagavad-gita", { changeFrequency: "weekly", priority: 0.98 }),
      entry("/search", { changeFrequency: "daily", priority: 0.8 }),
      entry("/atlas", { changeFrequency: "weekly", priority: 0.95 }),
      entry("/events", { changeFrequency: "weekly", priority: 0.9 }),
      entry("/kingdoms", { changeFrequency: "weekly", priority: 0.9 }),
      entry("/weapons", { changeFrequency: "weekly", priority: 0.9 }),
      entry("/concepts", { changeFrequency: "weekly", priority: 0.9 }),
      entry("/timeline", { changeFrequency: "weekly", priority: 0.9 }),
      entry("/encyclopedia", { changeFrequency: "weekly", priority: 0.9 }),
      entry("/genealogy", { changeFrequency: "weekly", priority: 0.9 }),
    ];
  }

  if (id === "chapters") {
    const chapters = await getStaticGitaChaptersIndex().catch(() => []);
    return chapters.map((ch) =>
      entry(`/bhagavad-gita/chapter-${ch.number}`, {
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.9,
      }),
    );
  }

  if (id === "verses") {
    const chapters = await getStaticGitaChaptersIndex().catch(() => []);
    const routes: MetadataRoute.Sitemap = [];
    for (const ch of chapters) {
      const snap = await getStaticGitaChapter(ch.number).catch(() => null);
      if (!snap) continue;
      for (const v of snap.verses) {
        routes.push(
          entry(`/verse/${ch.number}/${v.number}`, {
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.75,
          }),
        );
      }
    }
    return routes;
  }

  if (id === "encyclopedia") {
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
    const sections = collections
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
    return [...kindRoutes, ...sections, ...entityRoutes];
  }

  if (id === "atlas") {
    const places = await getAtlasPlaces().catch(() => []);
    return places.map((p) =>
      entry(atlasHref(p), {
        priority: Math.min(0.9, 0.55 + p.importance * 0.07),
      }),
    );
  }

  if (id === "knowledge") {
    const [events, kingdoms, weapons, concepts] = await Promise.all([
      getEvents().catch(() => []),
      getKingdoms().catch(() => []),
      getWeapons().catch(() => []),
      getConcepts().catch(() => []),
    ]);
    return [
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
  }

  if (id === "genealogy") {
    const [modules, people] = await Promise.all([
      getGenealogyModules().catch(() => []),
      getAllGenealogyPeople().catch(() => []),
    ]);
    return [
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
  }

  return [];
}
