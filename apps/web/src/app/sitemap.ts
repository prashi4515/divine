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
import { getStaticGitaChaptersIndex } from "@/lib/reading/gita-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://divine.app";

/**
 * Public sitemap — home, Gita, Atlas, Encyclopedia, Genealogy.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    chapters,
    modules,
    people,
    entities,
    collections,
    atlasPlaces,
    events,
    kingdoms,
    weapons,
    concepts,
  ] = await Promise.all([
    getStaticGitaChaptersIndex().catch(() => []),
    getGenealogyModules().catch(() => []),
    getAllGenealogyPeople().catch(() => []),
    getAllEntities().catch(() => []),
    getCollections().catch(() => []),
    getAtlasPlaces().catch(() => []),
    getEvents().catch(() => []),
    getKingdoms().catch(() => []),
    getWeapons().catch(() => []),
    getConcepts().catch(() => []),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/bhagavad-gita`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/atlas`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/kingdoms`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/weapons`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/concepts`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/timeline`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/encyclopedia`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/genealogy`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const chapterRoutes: MetadataRoute.Sitemap = chapters.map((ch) => ({
    url: `${SITE_URL}/bhagavad-gita/chapter-${ch.number}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const atlasRoutes: MetadataRoute.Sitemap = atlasPlaces.map((p) => ({
    url: `${SITE_URL}${atlasHref(p)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: Math.min(0.9, 0.55 + p.importance * 0.07),
  }));

  const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${SITE_URL}${eventHref(e)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: Math.min(0.92, 0.6 + e.importance * 0.06),
  }));

  const kingdomRoutes: MetadataRoute.Sitemap = kingdoms.map((k) => ({
    url: `${SITE_URL}${kingdomHref(k)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: Math.min(0.92, 0.55 + k.importance * 0.07),
  }));

  const weaponRoutes: MetadataRoute.Sitemap = weapons.map((w) => ({
    url: `${SITE_URL}${weaponHref(w)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: Math.min(0.92, 0.55 + w.importance * 0.07),
  }));

  const conceptRoutes: MetadataRoute.Sitemap = concepts.map((c) => ({
    url: `${SITE_URL}${conceptHref(c)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: Math.min(0.92, 0.55 + c.importance * 0.07),
  }));

  const encyclopediaSections: MetadataRoute.Sitemap = collections
    .filter((c) => c.kind === "encyclopedia-section")
    .map((c) => ({
      url: `${SITE_URL}/encyclopedia/section/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    }));

  const entityRoutes: MetadataRoute.Sitemap = entities
    .filter((e) => e.status === "published")
    .map((e) => ({
      url: `${SITE_URL}${entityHref(e)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: Math.min(0.9, 0.5 + e.importance * 0.08),
    }));

  const moduleRoutes: MetadataRoute.Sitemap = modules
    .filter((m) => m.status === "available")
    .map((m) => ({
      url: `${SITE_URL}/genealogy/${m.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    }));

  const personRoutes: MetadataRoute.Sitemap = people.map((p) => ({
    url: `${SITE_URL}/genealogy/person/${p.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: Math.min(0.8, 0.4 + p.importance * 0.08),
  }));

  return [
    ...staticRoutes,
    ...chapterRoutes,
    ...atlasRoutes,
    ...eventRoutes,
    ...kingdomRoutes,
    ...weaponRoutes,
    ...conceptRoutes,
    ...encyclopediaSections,
    ...entityRoutes,
    ...moduleRoutes,
    ...personRoutes,
  ];
}
