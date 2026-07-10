import { worksListResponseSchema, type Work } from "@divine/types";
import { apiFetch } from "./client";

/**
 * GET /v1/works — published works ordered by sortOrder.
 */
export async function getPublishedWorks(): Promise<Work[]> {
  const result = await apiFetch(
    {
      path: "/v1/works",
      next: { revalidate: 60 },
    },
    (json) => worksListResponseSchema.parse(json),
  );
  return result.data;
}
