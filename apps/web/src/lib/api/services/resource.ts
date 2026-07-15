import { z } from "zod";
import { http } from "../http";

/**
 * Generic REST resource client factory. Domain services (users, library, …)
 * are built on this so pagination, filtering, and CRUD share ONE
 * implementation — no per-resource duplication.
 *
 * All list endpoints are assumed cursor/paged; never fetch unbounded sets.
 */

export type ListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  filters?: Record<string, string | number | boolean | undefined>;
};

export const pageMetaSchema = z.object({
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});
export type PageMeta = z.infer<typeof pageMetaSchema>;

export type Paginated<T> = { data: T[]; meta: PageMeta };

const detailEnvelopeSchema = z.object({ data: z.unknown() });

export function createResourceClient<T>(basePath: string, schema: z.ZodType<T>) {
  const listSchema = z.object({ data: z.array(schema), meta: pageMetaSchema });

  /** Validate `{ data: T }` without generic-inference widening `data` to optional. */
  const parseDetail = (json: unknown): T =>
    schema.parse(detailEnvelopeSchema.parse(json).data);

  return {
    list(params: ListParams = {}, signal?: AbortSignal): Promise<Paginated<T>> {
      const { filters, ...rest } = params;
      return http(basePath, (json) => listSchema.parse(json), {
        query: { ...rest, ...filters },
        signal,
      });
    },

    get(id: string, signal?: AbortSignal): Promise<T> {
      return http(`${basePath}/${encodeURIComponent(id)}`, parseDetail, { signal });
    },

    create(body: unknown): Promise<T> {
      return http(basePath, parseDetail, { method: "POST", body });
    },

    update(id: string, body: unknown): Promise<T> {
      return http(`${basePath}/${encodeURIComponent(id)}`, parseDetail, {
        method: "PATCH",
        body,
      });
    },

    remove(id: string): Promise<null> {
      return http(`${basePath}/${encodeURIComponent(id)}`, () => null, {
        method: "DELETE",
      });
    },
  };
}
