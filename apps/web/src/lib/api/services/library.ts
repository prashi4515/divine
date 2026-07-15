import { z } from "zod";
import { http } from "../http";
import { createResourceClient } from "./resource";
import {
  mediaAssetSchema,
  scriptureNodeSchema,
  scriptureSchema,
  type MediaAsset,
  type Scripture,
  type ScriptureNode,
} from "../schemas";

const base = createResourceClient("/v1/scriptures", scriptureSchema);

const listSchema = z.object({
  data: z.array(scriptureSchema),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

const detailSchema = z.object({ data: scriptureSchema });
const nodesSchema = z.object({ data: z.array(scriptureNodeSchema) });
const nodeSchema = z.object({ data: scriptureNodeSchema });
const mediaListSchema = z.object({ data: z.array(mediaAssetSchema) });
const mediaSchema = z.object({ data: mediaAssetSchema });

export const libraryService = {
  ...base,

  list(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    religion?: string;
    published?: boolean;
    status?: string;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  } = {}) {
    return http("/v1/scriptures", (json) => listSchema.parse(json), {
      query: {
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
        religion: params.religion,
        published: params.published,
        status: params.status,
        sortBy: params.sortBy,
        sortDir: params.sortDir,
      },
    });
  },

  get(id: string): Promise<Scripture> {
    return http(`/v1/scriptures/${encodeURIComponent(id)}`, (json) =>
      detailSchema.parse(json).data,
    );
  },

  create(body: unknown): Promise<Scripture> {
    return http("/v1/scriptures", (json) => detailSchema.parse(json).data, {
      method: "POST",
      body,
    });
  },

  update(id: string, body: unknown): Promise<Scripture> {
    return http(
      `/v1/scriptures/${encodeURIComponent(id)}`,
      (json) => detailSchema.parse(json).data,
      { method: "PATCH", body },
    );
  },

  remove(id: string): Promise<null> {
    return http(`/v1/scriptures/${encodeURIComponent(id)}`, () => null, {
      method: "DELETE",
    });
  },

  publish(id: string): Promise<Scripture> {
    return http(
      `/v1/scriptures/${encodeURIComponent(id)}/publish`,
      (json) => detailSchema.parse(json).data,
      { method: "POST" },
    );
  },

  unpublish(id: string): Promise<Scripture> {
    return http(
      `/v1/scriptures/${encodeURIComponent(id)}/unpublish`,
      (json) => detailSchema.parse(json).data,
      { method: "POST" },
    );
  },

  archive(id: string): Promise<Scripture> {
    return http(
      `/v1/scriptures/${encodeURIComponent(id)}/archive`,
      (json) => detailSchema.parse(json).data,
      { method: "POST" },
    );
  },

  review(id: string): Promise<Scripture> {
    return http(
      `/v1/scriptures/${encodeURIComponent(id)}/review`,
      (json) => detailSchema.parse(json).data,
      { method: "POST" },
    );
  },

  duplicate(id: string): Promise<Scripture> {
    return http(
      `/v1/scriptures/${encodeURIComponent(id)}/duplicate`,
      (json) => detailSchema.parse(json).data,
      { method: "POST" },
    );
  },

  syncStructure(id: string): Promise<ScriptureNode[]> {
    return http(
      `/v1/scriptures/${encodeURIComponent(id)}/sync-structure`,
      (json) => nodesSchema.parse(json).data,
      { method: "POST" },
    );
  },

  listCatalogChapters(id: string) {
    return http(
      `/v1/scriptures/${encodeURIComponent(id)}/catalog/chapters`,
      (json) =>
        z
          .object({
            data: z.array(
              z.object({
                id: z.string(),
                publicId: z.string(),
                number: z.number(),
                title: z.string().nullable(),
                verseCount: z.number(),
                isPublished: z.boolean(),
              }),
            ),
          })
          .parse(json).data,
    );
  },

  listCatalogVerses(id: string, chapterPublicId: string) {
    return http(
      `/v1/scriptures/${encodeURIComponent(id)}/catalog/chapters/${encodeURIComponent(chapterPublicId)}/verses`,
      (json) =>
        z
          .object({
            data: z.array(
              z.object({
                id: z.string().uuid(),
                publicId: z.string(),
                number: z.number(),
                sanskritText: z.string(),
                transliteration: z.string().nullable(),
                meaning: z.string().nullable(),
                commentary: z.string().nullable(),
                seoTitle: z.string().nullable(),
                seoDescription: z.string().nullable(),
                sortOrder: z.number(),
                isPublished: z.boolean(),
                chapterPublicId: z.string(),
                chapterNumber: z.number(),
                workCode: z.string(),
                translations: z.array(
                  z.object({
                    id: z.string().uuid(),
                    languageCode: z.string(),
                    languageName: z.string(),
                    sourceKey: z.string(),
                    sourceDisplayName: z.string(),
                    text: z.string(),
                    isPublished: z.boolean(),
                  }),
                ),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            ),
          })
          .parse(json).data,
    );
  },

  listNodes(id: string): Promise<ScriptureNode[]> {
    return http(`/v1/scriptures/${encodeURIComponent(id)}/nodes`, (json) =>
      nodesSchema.parse(json).data,
    );
  },

  createNode(
    id: string,
    body: { label: string; title: string; parentId?: string | null; sortOrder?: number },
  ): Promise<ScriptureNode> {
    return http(
      `/v1/scriptures/${encodeURIComponent(id)}/nodes`,
      (json) => nodeSchema.parse(json).data,
      { method: "POST", body },
    );
  },

  updateNode(
    id: string,
    nodeId: string,
    body: { title?: string; label?: string; parentId?: string | null; sortOrder?: number },
  ): Promise<ScriptureNode> {
    return http(
      `/v1/scriptures/${encodeURIComponent(id)}/nodes/${encodeURIComponent(nodeId)}`,
      (json) => nodeSchema.parse(json).data,
      { method: "PATCH", body },
    );
  },

  deleteNode(id: string, nodeId: string): Promise<null> {
    return http(
      `/v1/scriptures/${encodeURIComponent(id)}/nodes/${encodeURIComponent(nodeId)}`,
      () => null,
      { method: "DELETE" },
    );
  },

  reorderNodes(id: string, orderedIds: string[]): Promise<ScriptureNode[]> {
    return http(
      `/v1/scriptures/${encodeURIComponent(id)}/nodes/reorder`,
      (json) => nodesSchema.parse(json).data,
      { method: "POST", body: { orderedIds } },
    );
  },

  listMedia(id: string): Promise<MediaAsset[]> {
    return http(`/v1/scriptures/${encodeURIComponent(id)}/media`, (json) =>
      mediaListSchema.parse(json).data,
    );
  },

  createMedia(
    id: string,
    body: {
      kind: string;
      fileName: string;
      mimeType: string;
      sizeBytes?: number;
      url: string;
    },
  ): Promise<MediaAsset> {
    return http(
      `/v1/scriptures/${encodeURIComponent(id)}/media`,
      (json) => mediaSchema.parse(json).data,
      { method: "POST", body },
    );
  },

  deleteMedia(id: string, mediaId: string): Promise<null> {
    return http(
      `/v1/scriptures/${encodeURIComponent(id)}/media/${encodeURIComponent(mediaId)}`,
      () => null,
      { method: "DELETE" },
    );
  },
};
