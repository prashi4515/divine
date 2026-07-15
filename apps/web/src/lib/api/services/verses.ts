import {
  verseDetailResponseSchema,
  versesListResponseSchema,
  type Verse,
  contentRevisionSchema,
} from "@divine/types";
import { z } from "zod";
import { http, getPublicApiBaseUrl } from "../http";

const revisionListSchema = z.object({
  data: z.array(contentRevisionSchema),
});

export const versesService = {
  listByChapter(chapterPublicId: string): Promise<{
    data: Verse[];
    languages: Array<{ code: string; name: string; nativeName: string | null }>;
  }> {
    return http(
      "/v1/verses",
      (json) => {
        const parsed = versesListResponseSchema.parse(json);
        return {
          data: parsed.data,
          languages: parsed.meta?.languages ?? [],
        };
      },
      {
        auth: false,
        query: { chapterPublicId },
      },
    );
  },

  get(publicId: string): Promise<Verse> {
    return http(
      `/v1/verses/${encodeURIComponent(publicId)}`,
      (json) => verseDetailResponseSchema.parse(json).data,
      { auth: false },
    );
  },

  getById(id: string): Promise<Verse> {
    return http(
      `/v1/verses/by-id/${encodeURIComponent(id)}`,
      (json) => verseDetailResponseSchema.parse(json).data,
    );
  },

  update(id: string, body: unknown): Promise<Verse> {
    return http(
      `/v1/verses/by-id/${encodeURIComponent(id)}`,
      (json) => verseDetailResponseSchema.parse(json).data,
      { method: "PATCH", body },
    );
  },

  listRevisions(id: string) {
    return http(
      `/v1/verses/by-id/${encodeURIComponent(id)}/revisions`,
      (json) => revisionListSchema.parse(json).data,
    );
  },
};

/** Resolve media paths that are API-relative (`/v1/media/files/...`). */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/v1/")) {
    try {
      return `${getPublicApiBaseUrl()}${url}`;
    } catch {
      return url;
    }
  }
  return url;
}
