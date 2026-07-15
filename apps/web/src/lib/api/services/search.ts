import { searchResponseSchema, type SearchHit } from "@divine/types";
import { http } from "../http";

export const searchService = {
  search(q: string, limit = 20): Promise<SearchHit[]> {
    return http(
      "/v1/search",
      (json) => searchResponseSchema.parse(json).data,
      { query: { q, limit } },
    );
  },
};
