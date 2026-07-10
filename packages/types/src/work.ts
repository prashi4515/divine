import { z } from "zod";

/**
 * Public work resource — wire contract between API and clients.
 * Dates are ISO strings on the wire.
 */
export const workSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Work = z.infer<typeof workSchema>;

export const worksListResponseSchema = z.object({
  data: z.array(workSchema),
});

export type WorksListResponse = z.infer<typeof worksListResponseSchema>;
