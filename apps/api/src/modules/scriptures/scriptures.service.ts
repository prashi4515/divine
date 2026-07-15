import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type { MediaAsset, Scripture, ScriptureNode, Work } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { PrismaService } from "../../prisma/prisma.service";
import type {
  CreateMediaDto,
  CreateNodeDto,
  CreateScriptureDto,
  MediaAssetDto,
  ScriptureNodeDto,
  ScriptureResponseDto,
  UpdateNodeDto,
  UpdateScriptureDto,
} from "./scriptures.dto";

type ScriptureWithWork = Scripture & { work: Work | null };

@Injectable()
export class ScripturesService {
  private readonly logger = new Logger(ScripturesService.name);
  private readonly uploadsDir = join(process.cwd(), "uploads", "media");

  constructor(private readonly prisma: PrismaService) {}

  async list(params: {
    page: number;
    pageSize: number;
    search?: string;
    religion?: string;
    published?: boolean;
    status?: string;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }): Promise<{
    data: ScriptureResponseDto[];
    meta: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
    const where: Prisma.ScriptureWhereInput = {};
    if (params.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { religion: { contains: q, mode: "insensitive" } },
      ];
    }
    if (params.religion) where.religion = params.religion;
    if (params.published !== undefined) where.isPublished = params.published;
    if (params.status) where.status = params.status;

    const sortBy = params.sortBy ?? "sortOrder";
    const sortDir = params.sortDir ?? "asc";
    const orderBy: Prisma.ScriptureOrderByWithRelationInput[] = [];
    if (sortBy === "name") orderBy.push({ name: sortDir });
    else if (sortBy === "updatedAt") orderBy.push({ updatedAt: sortDir });
    else if (sortBy === "status") orderBy.push({ status: sortDir });
    else if (sortBy === "verseCount") orderBy.push({ verseCount: sortDir });
    else orderBy.push({ sortOrder: sortDir }, { name: "asc" });

    try {
      const [total, rows] = await this.prisma.$transaction([
        this.prisma.scripture.count({ where }),
        this.prisma.scripture.findMany({
          where,
          include: { work: true },
          orderBy,
          skip: (params.page - 1) * params.pageSize,
          take: params.pageSize,
        }),
      ]);

      return {
        data: rows.map((row) => this.toDto(row)),
        meta: {
          page: params.page,
          pageSize: params.pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / Math.max(1, params.pageSize))),
        },
      };
    } catch (error: unknown) {
      this.logger.error(
        "Failed to list scriptures",
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async getById(id: string): Promise<ScriptureResponseDto> {
    const row = await this.prisma.scripture.findUnique({
      where: { id },
      include: { work: true },
    });
    if (!row) throw new NotFoundException(`Scripture "${id}" not found`);
    return this.toDto(row);
  }

  async create(input: CreateScriptureDto): Promise<ScriptureResponseDto> {
    try {
      const row = await this.prisma.$transaction(async (tx) => {
        const work = await this.ensureLinkedWork(tx, input);
        const created = await tx.scripture.create({
          data: {
            ...this.toCreateData(input),
            work: { connect: { id: work.id } },
          },
        });
        return tx.scripture.findUniqueOrThrow({
          where: { id: created.id },
          include: { work: true },
        });
      });
      await this.syncCountsFromWork(row.id);
      return this.getById(row.id);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("A scripture with this slug already exists");
      }
      this.logger.error(
        "Failed to create scripture",
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async update(id: string, input: UpdateScriptureDto): Promise<ScriptureResponseDto> {
    await this.ensureExists(id);
    try {
      await this.prisma.$transaction(async (tx) => {
        const existing = await tx.scripture.findUniqueOrThrow({ where: { id } });
        const data = this.toUpdateData(input);

        if (!existing.workId) {
          const work = await this.ensureLinkedWork(tx, {
            name: input.name ?? existing.name,
            slug: input.slug ?? existing.slug,
            description: input.description ?? existing.description ?? undefined,
            workCode: input.workCode,
            isPublished: input.isPublished ?? existing.isPublished,
            status: input.status ?? existing.status,
          });
          data.work = { connect: { id: work.id } };
        } else if (
          input.name !== undefined ||
          input.slug !== undefined ||
          input.description !== undefined ||
          input.status !== undefined ||
          input.isPublished !== undefined
        ) {
          const status =
            input.status ??
            (input.isPublished === true
              ? "published"
              : input.isPublished === false
                ? "draft"
                : undefined);
          await tx.work.update({
            where: { id: existing.workId },
            data: {
              title: input.name,
              slug: input.slug,
              description: input.description,
              status,
              isPublished:
                input.isPublished !== undefined
                  ? input.isPublished
                  : status === "published"
                    ? true
                    : status
                      ? false
                      : undefined,
            },
          });
        }

        await tx.scripture.update({ where: { id }, data });
      });

      if (input.isPublished !== undefined || input.status !== undefined) {
        await this.syncPublishState(id);
      }
      await this.syncCountsFromWork(id);
      return this.getById(id);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("A scripture with this slug already exists");
      }
      this.logger.error(
        `Failed to update scripture ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Deletes the CMS scripture and its linked Work (chapters/verses/translations
   * cascade). Public catalog reads Works — leaving the Work behind kept deleted
   * scriptures visible on the site.
   */
  async remove(id: string): Promise<void> {
    const scripture = await this.prisma.scripture.findUnique({
      where: { id },
      select: { id: true, workId: true },
    });
    if (!scripture) {
      throw new NotFoundException(`Scripture "${id}" not found`);
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.mediaAsset.deleteMany({ where: { scriptureId: id } });
        await tx.scripture.delete({ where: { id } });
        if (scripture.workId) {
          await tx.work.delete({ where: { id: scripture.workId } });
        }
      });
    } catch (error: unknown) {
      this.logger.error(
        `Failed to delete scripture ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async publish(id: string): Promise<ScriptureResponseDto> {
    return this.update(id, { status: "published", isPublished: true, visibility: "public" });
  }

  async unpublish(id: string): Promise<ScriptureResponseDto> {
    return this.update(id, { status: "draft", isPublished: false });
  }

  async archive(id: string): Promise<ScriptureResponseDto> {
    return this.update(id, { status: "archived", isPublished: false });
  }

  async setReview(id: string): Promise<ScriptureResponseDto> {
    return this.update(id, { status: "review", isPublished: false });
  }

  async duplicate(id: string): Promise<ScriptureResponseDto> {
    const source = await this.prisma.scripture.findUnique({
      where: { id },
      include: { nodes: true, media: true, work: true },
    });
    if (!source) throw new NotFoundException(`Scripture "${id}" not found`);

    const baseSlug = `${source.slug}-copy`;
    let slug = baseSlug;
    let n = 2;
    while (await this.prisma.scripture.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${n}`;
      n += 1;
    }

    const codeBase = `${(source.work?.code ?? source.slug).slice(0, 20)}c`;
    let code = codeBase;
    let c = 2;
    while (await this.prisma.work.findUnique({ where: { code } })) {
      code = `${codeBase}${c}`;
      c += 1;
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const work = await tx.work.create({
        data: {
          code,
          slug,
          title: `${source.name} (Copy)`,
          description: source.description,
          sortOrder: source.sortOrder,
          status: "draft",
          isPublished: false,
        },
      });

      const scripture = await tx.scripture.create({
        data: {
          workId: work.id,
          name: `${source.name} (Copy)`,
          slug,
          shortName: source.shortName,
          description: source.description,
          religion: source.religion,
          originalLanguage: source.originalLanguage,
          author: source.author,
          estimatedDate: source.estimatedDate,
          coverImageUrl: source.coverImageUrl,
          bannerImageUrl: source.bannerImageUrl,
          themeColor: source.themeColor,
          accentColor: source.accentColor,
          seoTitle: source.seoTitle,
          seoDescription: source.seoDescription,
          seoKeywords: source.seoKeywords,
          canonicalUrl: source.canonicalUrl,
          ogImageUrl: source.ogImageUrl,
          copyright: source.copyright,
          license: source.license,
          website: source.website,
          visibility: "private",
          defaultLanguage: source.defaultLanguage,
          readingDirection: source.readingDirection,
          structureLevels: source.structureLevels ?? [],
          status: "draft",
          isPublished: false,
          sortOrder: source.sortOrder,
        },
      });

      const idMap = new Map<string, string>();
      const roots = source.nodes.filter((node) => !node.parentId);
      const queue = [...roots.sort((a, b) => a.sortOrder - b.sortOrder)];
      while (queue.length) {
        const node = queue.shift()!;
        const createdNode = await tx.scriptureNode.create({
          data: {
            scriptureId: scripture.id,
            parentId: node.parentId ? idMap.get(node.parentId) ?? null : null,
            label: node.label,
            title: node.title,
            sortOrder: node.sortOrder,
          },
        });
        idMap.set(node.id, createdNode.id);
        for (const child of source.nodes
          .filter((n) => n.parentId === node.id)
          .sort((a, b) => a.sortOrder - b.sortOrder)) {
          queue.push(child);
        }
      }

      for (const media of source.media) {
        await tx.mediaAsset.create({
          data: {
            scriptureId: scripture.id,
            kind: media.kind,
            fileName: media.fileName,
            mimeType: media.mimeType,
            sizeBytes: media.sizeBytes,
            url: media.url,
          },
        });
      }

      return scripture.id;
    });

    return this.getById(created);
  }

  async syncStructureFromWork(id: string): Promise<ScriptureNodeDto[]> {
    const scripture = await this.prisma.scripture.findUnique({
      where: { id },
      include: { work: { include: { chapters: { orderBy: { sortOrder: "asc" } } } } },
    });
    if (!scripture) throw new NotFoundException(`Scripture "${id}" not found`);
    if (!scripture.work) {
      throw new NotFoundException("Scripture is not linked to a work catalog");
    }

    const levels = this.asStringArray(scripture.structureLevels);
    const chapterLabel =
      levels.find((l) => ["Chapter", "Surah", "Section"].includes(l)) ??
      levels[0] ??
      "Chapter";

    await this.prisma.$transaction(async (tx) => {
      await tx.scriptureNode.deleteMany({ where: { scriptureId: id } });
      let order = 0;
      for (const chapter of scripture.work!.chapters) {
        await tx.scriptureNode.create({
          data: {
            scriptureId: id,
            label: chapterLabel,
            title: chapter.title ?? `${chapterLabel} ${chapter.number}`,
            sortOrder: order++,
          },
        });
      }
    });

    await this.syncCountsFromWork(id);
    return this.listNodes(id);
  }

  async listNodes(scriptureId: string): Promise<ScriptureNodeDto[]> {
    await this.ensureExists(scriptureId);
    const rows = await this.prisma.scriptureNode.findMany({
      where: { scriptureId },
      orderBy: { sortOrder: "asc" },
    });
    return this.buildTree(rows);
  }

  async createNode(scriptureId: string, input: CreateNodeDto): Promise<ScriptureNodeDto> {
    await this.ensureExists(scriptureId);
    if (input.parentId) {
      const parent = await this.prisma.scriptureNode.findFirst({
        where: { id: input.parentId, scriptureId },
      });
      if (!parent) throw new NotFoundException("Parent node not found");
    }

    const max = await this.prisma.scriptureNode.aggregate({
      where: { scriptureId, parentId: input.parentId ?? null },
      _max: { sortOrder: true },
    });

    const row = await this.prisma.scriptureNode.create({
      data: {
        scriptureId,
        parentId: input.parentId ?? null,
        label: input.label,
        title: input.title,
        sortOrder: input.sortOrder ?? (max._max.sortOrder ?? -1) + 1,
      },
    });

    await this.recomputeNodeCounts(scriptureId);
    return this.toNodeDto(row, []);
  }

  async updateNode(
    scriptureId: string,
    nodeId: string,
    input: UpdateNodeDto,
  ): Promise<ScriptureNodeDto> {
    const existing = await this.prisma.scriptureNode.findFirst({
      where: { id: nodeId, scriptureId },
    });
    if (!existing) throw new NotFoundException("Node not found");

    const row = await this.prisma.scriptureNode.update({
      where: { id: nodeId },
      data: {
        title: input.title,
        label: input.label,
        parentId: input.parentId === undefined ? undefined : input.parentId,
        sortOrder: input.sortOrder,
      },
    });
    await this.recomputeNodeCounts(scriptureId);
    return this.toNodeDto(row, []);
  }

  async deleteNode(scriptureId: string, nodeId: string): Promise<void> {
    const existing = await this.prisma.scriptureNode.findFirst({
      where: { id: nodeId, scriptureId },
    });
    if (!existing) throw new NotFoundException("Node not found");
    await this.prisma.scriptureNode.delete({ where: { id: nodeId } });
    await this.recomputeNodeCounts(scriptureId);
  }

  async reorderNodes(scriptureId: string, orderedIds: string[]): Promise<ScriptureNodeDto[]> {
    await this.ensureExists(scriptureId);
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.scriptureNode.updateMany({
          where: { id, scriptureId },
          data: { sortOrder: index },
        }),
      ),
    );
    return this.listNodes(scriptureId);
  }

  async listMedia(scriptureId: string): Promise<MediaAssetDto[]> {
    await this.ensureExists(scriptureId);
    const rows = await this.prisma.mediaAsset.findMany({
      where: { scriptureId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => this.toMediaDto(row));
  }

  async createMedia(scriptureId: string, input: CreateMediaDto): Promise<MediaAssetDto> {
    await this.ensureExists(scriptureId);
    const storedUrl = await this.persistMediaUrl(input.url, input.fileName, input.mimeType);

    const row = await this.prisma.mediaAsset.create({
      data: {
        scriptureId,
        kind: input.kind,
        fileName: input.fileName,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes ?? 0,
        url: storedUrl,
      },
    });

    if (input.kind === "cover") {
      await this.prisma.scripture.update({
        where: { id: scriptureId },
        data: { coverImageUrl: storedUrl },
      });
    }
    if (input.kind === "banner") {
      await this.prisma.scripture.update({
        where: { id: scriptureId },
        data: { bannerImageUrl: storedUrl },
      });
    }
    if (input.kind === "icon") {
      await this.prisma.scripture.update({
        where: { id: scriptureId },
        data: { ogImageUrl: storedUrl },
      });
    }

    return this.toMediaDto(row);
  }

  async deleteMedia(scriptureId: string, mediaId: string): Promise<void> {
    const existing = await this.prisma.mediaAsset.findFirst({
      where: { id: mediaId, scriptureId },
    });
    if (!existing) throw new NotFoundException("Media not found");
    await this.prisma.mediaAsset.delete({ where: { id: mediaId } });
  }

  async listCatalogChapters(scriptureId: string): Promise<
    Array<{
      id: string;
      publicId: string;
      number: number;
      title: string | null;
      verseCount: number;
      isPublished: boolean;
    }>
  > {
    const scripture = await this.prisma.scripture.findUnique({ where: { id: scriptureId } });
    if (!scripture) throw new NotFoundException(`Scripture "${scriptureId}" not found`);
    if (!scripture.workId) return [];

    const chapters = await this.prisma.chapter.findMany({
      where: { workId: scripture.workId },
      orderBy: { sortOrder: "asc" },
    });
    return chapters.map((c) => ({
      id: c.id,
      publicId: c.publicId,
      number: c.number,
      title: c.title,
      verseCount: c.verseCount,
      isPublished: c.isPublished,
    }));
  }

  async listCatalogVerses(scriptureId: string, chapterPublicId: string) {
    const scripture = await this.prisma.scripture.findUnique({ where: { id: scriptureId } });
    if (!scripture) throw new NotFoundException(`Scripture "${scriptureId}" not found`);
    if (!scripture.workId) return [];

    const chapter = await this.prisma.chapter.findFirst({
      where: { publicId: chapterPublicId, workId: scripture.workId },
      include: { work: true },
    });
    if (!chapter) throw new NotFoundException(`Chapter "${chapterPublicId}" not found`);

    const rows = await this.prisma.verse.findMany({
      where: { chapterId: chapter.id },
      include: {
        chapter: { include: { work: true } },
        translations: {
          include: { language: true, translationSource: true },
          orderBy: [{ language: { sortOrder: "asc" } }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { number: "asc" }],
    });

    return rows.map((row) => ({
      id: row.id,
      publicId: row.publicId,
      number: row.number,
      sanskritText: row.sanskritText,
      transliteration: row.transliteration,
      meaning: row.meaning,
      commentary: row.commentary,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      sortOrder: row.sortOrder,
      isPublished: row.isPublished,
      chapterPublicId: row.chapter.publicId,
      chapterNumber: row.chapter.number,
      workCode: row.chapter.work.code,
      translations: row.translations.map((t) => ({
        id: t.id,
        languageCode: t.language.code,
        languageName: t.language.name,
        sourceKey: t.translationSource.key,
        sourceDisplayName: t.translationSource.displayName,
        text: t.text,
        isPublished: t.isPublished,
      })),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  }

  private async persistMediaUrl(
    url: string,
    fileName: string,
    mimeType: string,
  ): Promise<string> {
    if (!url.startsWith("data:")) return url;

    const match = /^data:([^;]+);base64,(.+)$/s.exec(url);
    if (!match) return url;

    const buffer = Buffer.from(match[2]!, "base64");
    await mkdir(this.uploadsDir, { recursive: true });
    const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 16);
    const ext =
      extname(fileName) ||
      (mimeType.includes("png")
        ? ".png"
        : mimeType.includes("jpeg") || mimeType.includes("jpg")
          ? ".jpg"
          : mimeType.includes("pdf")
            ? ".pdf"
            : mimeType.includes("audio")
              ? ".mp3"
              : ".bin");
    const storedName = `${hash}-${randomUUID().slice(0, 8)}${ext}`;
    const absolute = join(this.uploadsDir, storedName);
    await writeFile(absolute, buffer);
    return `/v1/media/files/${storedName}`;
  }

  private async ensureLinkedWork(
    tx: Prisma.TransactionClient,
    input: {
      name: string;
      slug: string;
      description?: string | null;
      workCode?: string;
      isPublished?: boolean;
      status?: string;
    },
  ): Promise<Work> {
    const code = this.normalizeWorkCode(input.workCode ?? input.slug);
    const isPublished = input.isPublished ?? false;
    const status = input.status ?? (isPublished ? "published" : "draft");

    return tx.work.upsert({
      where: { code },
      create: {
        code,
        slug: input.slug,
        title: input.name,
        description: input.description ?? null,
        status,
        isPublished,
        sortOrder: 0,
      },
      update: {
        slug: input.slug,
        title: input.name,
        description: input.description ?? null,
        status,
        isPublished,
      },
    });
  }

  private normalizeWorkCode(raw: string): string {
    const cleaned = raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 32);
    return cleaned || `w${randomUUID().replace(/-/g, "").slice(0, 8)}`;
  }

  private async syncPublishState(scriptureId: string): Promise<void> {
    const scripture = await this.prisma.scripture.findUnique({ where: { id: scriptureId } });
    if (!scripture?.workId) return;

    const published = scripture.isPublished && scripture.status === "published";
    await this.prisma.$transaction([
      this.prisma.work.update({
        where: { id: scripture.workId },
        data: {
          isPublished: published,
          status: scripture.status,
        },
      }),
      this.prisma.chapter.updateMany({
        where: { workId: scripture.workId },
        data: { isPublished: published },
      }),
      this.prisma.verse.updateMany({
        where: { chapter: { workId: scripture.workId } },
        data: { isPublished: published },
      }),
      this.prisma.translation.updateMany({
        where: { verse: { chapter: { workId: scripture.workId } } },
        data: { isPublished: published },
      }),
    ]);
  }

  async syncCountsFromWork(scriptureId: string): Promise<void> {
    const scripture = await this.prisma.scripture.findUnique({ where: { id: scriptureId } });
    if (!scripture?.workId) {
      await this.recomputeNodeCounts(scriptureId);
      return;
    }

    const [chapterCount, verseCount, translationCount] = await Promise.all([
      this.prisma.chapter.count({ where: { workId: scripture.workId } }),
      this.prisma.verse.count({ where: { chapter: { workId: scripture.workId } } }),
      this.prisma.translation.count({
        where: { verse: { chapter: { workId: scripture.workId } } },
      }),
    ]);

    await this.prisma.scripture.update({
      where: { id: scriptureId },
      data: {
        chapterCount,
        verseCount,
        translationCount,
        bookCount: scripture.bookCount,
      },
    });
  }

  private async ensureExists(id: string): Promise<void> {
    const count = await this.prisma.scripture.count({ where: { id } });
    if (!count) throw new NotFoundException(`Scripture "${id}" not found`);
  }

  private async recomputeNodeCounts(scriptureId: string): Promise<void> {
    const scripture = await this.prisma.scripture.findUnique({ where: { id: scriptureId } });
    if (!scripture) return;
    if (scripture.workId) {
      await this.syncCountsFromWork(scriptureId);
      return;
    }

    const levels = this.asStringArray(scripture.structureLevels);
    const nodes = await this.prisma.scriptureNode.findMany({
      where: { scriptureId },
      select: { label: true },
    });

    const bookLike = new Set(["Book", "Testament", "Kanda", "Basket", "Part"]);
    const chapterLike = new Set(["Chapter", "Surah", "Section"]);
    const lastLevel = levels[levels.length - 1]?.toLowerCase();

    let bookCount = 0;
    let chapterCount = 0;
    let verseCount = 0;
    for (const node of nodes) {
      if (bookLike.has(node.label)) bookCount += 1;
      if (chapterLike.has(node.label)) chapterCount += 1;
      if (node.label === "Verse" || node.label.toLowerCase() === lastLevel) {
        if (node.label === "Verse") verseCount += 1;
      }
    }

    await this.prisma.scripture.update({
      where: { id: scriptureId },
      data: { bookCount, chapterCount, verseCount },
    });
  }

  private toCreateData(input: CreateScriptureDto): Prisma.ScriptureCreateInput {
    const isPublished = input.isPublished ?? false;
    return {
      name: input.name,
      slug: input.slug,
      shortName: input.shortName,
      description: input.description,
      religion: input.religion,
      originalLanguage: input.originalLanguage,
      author: input.author,
      estimatedDate: input.estimatedDate,
      coverImageUrl: input.coverImageUrl,
      bannerImageUrl: input.bannerImageUrl,
      themeColor: input.themeColor,
      accentColor: input.accentColor,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      seoKeywords: input.seoKeywords,
      canonicalUrl: input.canonicalUrl,
      ogImageUrl: input.ogImageUrl,
      copyright: input.copyright,
      license: input.license,
      website: input.website,
      visibility: input.visibility ?? "private",
      defaultLanguage: input.defaultLanguage,
      readingDirection: input.readingDirection ?? "ltr",
      structureLevels: input.structureLevels ?? ["Chapter", "Verse"],
      status: input.status ?? (isPublished ? "published" : "draft"),
      isPublished,
    };
  }

  private toUpdateData(input: UpdateScriptureDto): Prisma.ScriptureUpdateInput {
    const data: Prisma.ScriptureUpdateInput = {};
    const assign = <K extends keyof UpdateScriptureDto>(key: K) => {
      if (input[key] !== undefined && key !== "workCode") {
        (data as Record<string, unknown>)[key as string] = input[key];
      }
    };
    assign("name");
    assign("slug");
    assign("shortName");
    assign("description");
    assign("religion");
    assign("originalLanguage");
    assign("author");
    assign("estimatedDate");
    assign("coverImageUrl");
    assign("bannerImageUrl");
    assign("themeColor");
    assign("accentColor");
    assign("seoTitle");
    assign("seoDescription");
    assign("seoKeywords");
    assign("canonicalUrl");
    assign("ogImageUrl");
    assign("copyright");
    assign("license");
    assign("website");
    assign("visibility");
    assign("defaultLanguage");
    assign("readingDirection");
    assign("structureLevels");
    assign("status");
    assign("isPublished");
    if (input.isPublished === true && input.status === undefined) {
      data.status = "published";
    }
    if (input.isPublished === false && input.status === undefined) {
      data.status = "draft";
    }
    return data;
  }

  private toDto(row: ScriptureWithWork): ScriptureResponseDto {
    return {
      id: row.id,
      workId: row.workId,
      workCode: row.work?.code ?? null,
      name: row.name,
      slug: row.slug,
      shortName: row.shortName,
      description: row.description,
      religion: row.religion,
      originalLanguage: row.originalLanguage,
      author: row.author,
      estimatedDate: row.estimatedDate,
      coverImageUrl: row.coverImageUrl,
      bannerImageUrl: row.bannerImageUrl,
      themeColor: row.themeColor,
      accentColor: row.accentColor,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      seoKeywords: row.seoKeywords,
      canonicalUrl: row.canonicalUrl,
      ogImageUrl: row.ogImageUrl,
      copyright: row.copyright,
      license: row.license,
      website: row.website,
      visibility: row.visibility,
      defaultLanguage: row.defaultLanguage,
      readingDirection: row.readingDirection,
      structureLevels: this.asStringArray(row.structureLevels),
      status: row.status,
      isPublished: row.isPublished,
      bookCount: row.bookCount,
      chapterCount: row.chapterCount,
      verseCount: row.verseCount,
      translationCount: row.translationCount,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private asStringArray(value: Prisma.JsonValue): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === "string");
  }

  private buildTree(rows: ScriptureNode[]): ScriptureNodeDto[] {
    const map = new Map<string, ScriptureNodeDto>();
    for (const row of rows) {
      map.set(row.id, this.toNodeDto(row, []));
    }
    const roots: ScriptureNodeDto[] = [];
    for (const row of rows) {
      const node = map.get(row.id)!;
      if (row.parentId && map.has(row.parentId)) {
        map.get(row.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  private toNodeDto(row: ScriptureNode, children: ScriptureNodeDto[]): ScriptureNodeDto {
    return {
      id: row.id,
      scriptureId: row.scriptureId,
      parentId: row.parentId,
      label: row.label,
      title: row.title,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      children,
    };
  }

  private toMediaDto(row: MediaAsset): MediaAssetDto {
    return {
      id: row.id,
      scriptureId: row.scriptureId,
      kind: row.kind,
      fileName: row.fileName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      url: row.url,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
