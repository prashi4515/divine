import type { MetadataRoute } from "next";
import {
  getAllGenealogyPeople,
  getGenealogyModules,
} from "@/lib/genealogy/store";
import { getStaticGitaChaptersIndex } from "@/lib/reading/gita-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://divine.app";

/**
 * Public sitemap — home, Gita chapters, search, and the full Genealogy graph.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [chapters, modules, people] = await Promise.all([
    getStaticGitaChaptersIndex().catch(() => []),
    getGenealogyModules().catch(() => []),
    getAllGenealogyPeople().catch(() => []),
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
      url: `${SITE_URL}/genealogy`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
  ];

  const chapterRoutes: MetadataRoute.Sitemap = chapters.map((ch) => ({
    url: `${SITE_URL}/bhagavad-gita/chapter-${ch.number}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const moduleRoutes: MetadataRoute.Sitemap = modules
    .filter((m) => m.status === "available")
    .map((m) => ({
      url: `${SITE_URL}/genealogy/${m.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    }));

  const personRoutes: MetadataRoute.Sitemap = people.map((p) => ({
    url: `${SITE_URL}/genealogy/person/${p.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: Math.min(0.85, 0.45 + p.importance * 0.08),
  }));

  return [...staticRoutes, ...chapterRoutes, ...moduleRoutes, ...personRoutes];
}
