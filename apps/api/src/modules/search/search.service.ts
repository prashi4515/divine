import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export type SearchHitDto = {
  type: "scripture" | "work" | "chapter" | "verse" | "translation" | "topic";
  id: string;
  title: string;
  subtitle: string | null;
  href: string;
};

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  async search(query: string, limit = 20): Promise<SearchHitDto[]> {
    const q = query.trim();
    if (!q) return [];

    const take = Math.min(Math.max(limit, 1), 40);

    try {
      const [scriptures, works, chapters, verses, translations, topics] =
        await Promise.all([
          this.prisma.scripture.findMany({
            where: {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { slug: { contains: q, mode: "insensitive" } },
                { religion: { contains: q, mode: "insensitive" } },
              ],
            },
            take,
            orderBy: { name: "asc" },
          }),
          this.prisma.work.findMany({
            where: {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { code: { contains: q, mode: "insensitive" } },
                { slug: { contains: q, mode: "insensitive" } },
              ],
            },
            take,
          }),
          this.prisma.chapter.findMany({
            where: {
              OR: [
                { publicId: { contains: q, mode: "insensitive" } },
                { title: { contains: q, mode: "insensitive" } },
              ],
            },
            include: { work: true },
            take,
          }),
          this.prisma.verse.findMany({
            where: {
              OR: [
                { publicId: { contains: q, mode: "insensitive" } },
                { sanskritText: { contains: q, mode: "insensitive" } },
                { meaning: { contains: q, mode: "insensitive" } },
              ],
            },
            include: { chapter: { include: { work: true } } },
            take,
          }),
          this.prisma.translation.findMany({
            where: { text: { contains: q, mode: "insensitive" } },
            include: {
              verse: { include: { chapter: { include: { work: true } } } },
              language: true,
            },
            take,
          }),
          this.prisma.topic.findMany({
            where: {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { slug: { contains: q, mode: "insensitive" } },
              ],
            },
            take,
          }),
        ]);

      const hits: SearchHitDto[] = [];

      for (const s of scriptures) {
        hits.push({
          type: "scripture",
          id: s.id,
          title: s.name,
          subtitle: s.religion,
          href: `/admin/library/${s.id}`,
        });
      }

      for (const w of works) {
        hits.push({
          type: "work",
          id: w.id,
          title: w.title,
          subtitle: w.code,
          href: w.code === "bg" ? "/bhagavad-gita" : `/admin/library?search=${encodeURIComponent(w.slug)}`,
        });
      }

      for (const c of chapters) {
        const href =
          c.work.code === "bg"
            ? `/bhagavad-gita/chapter-${c.number}`
            : `/admin/chapters`;
        hits.push({
          type: "chapter",
          id: c.publicId,
          title: c.title ?? c.publicId,
          subtitle: c.work.title,
          href,
        });
      }

      for (const v of verses) {
        const href =
          v.chapter.work.code === "bg"
            ? `/bhagavad-gita/chapter-${v.chapter.number}#verse-${v.number}`
            : `/admin/library`;
        hits.push({
          type: "verse",
          id: v.publicId,
          title: v.publicId,
          subtitle: v.meaning?.slice(0, 120) ?? v.sanskritText.slice(0, 80),
          href,
        });
      }

      for (const t of translations) {
        const v = t.verse;
        const href =
          v.chapter.work.code === "bg"
            ? `/bhagavad-gita/chapter-${v.chapter.number}#verse-${v.number}`
            : `/admin/library`;
        hits.push({
          type: "translation",
          id: t.id,
          title: `${v.publicId} (${t.language.code})`,
          subtitle: t.text.slice(0, 120),
          href,
        });
      }

      for (const topic of topics) {
        hits.push({
          type: "topic",
          id: topic.id,
          title: topic.name,
          subtitle: topic.slug,
          href: `/admin/topics`,
        });
      }

      return hits.slice(0, take);
    } catch (error: unknown) {
      this.logger.error(
        "Search failed",
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
