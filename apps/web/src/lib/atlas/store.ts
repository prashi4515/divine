import "server-only";
import {
  getCollection,
  getEntitiesByIdsOrAliases,
  getEntityBundle,
  getRelated,
  type EntityBundle,
} from "@/lib/knowledge/store";
import { searchEntities } from "@/lib/knowledge/search";
import {
  atlasHref,
  isAtlasPlace,
  type AtlasPlace,
} from "@/lib/atlas/geo";
import { getAtlasRoutesFromDataset } from "@/lib/atlas/data/load-dataset";
import type { AtlasDataset, AtlasRoute } from "@divine/types";

export * from "@/lib/atlas/geo";
export { getAtlasDataset } from "@/lib/atlas/data/load-dataset";

export async function getAtlasRoutes(): Promise<readonly AtlasRoute[]> {
  return getAtlasRoutesFromDataset();
}

export async function getAtlasPlaces(): Promise<AtlasPlace[]> {
  const col = await getCollection("mahabharata");
  if (!col) return [];
  const entities = await getEntitiesByIdsOrAliases(col.entityIds);
  const places = entities.filter(
    (e): e is AtlasPlace => isAtlasPlace(e) && e.status === "published",
  );
  return places.sort(
    (a, b) => b.importance - a.importance || a.name.localeCompare(b.name),
  );
}

export async function getAtlasPlaceBySlug(
  slug: string,
): Promise<AtlasPlace | undefined> {
  const places = await getAtlasPlaces();
  return places.find((p) => p.slug === slug);
}

export async function getAtlasPlaceBundle(
  slug: string,
): Promise<(EntityBundle & { place: AtlasPlace }) | undefined> {
  const place = await getAtlasPlaceBySlug(slug);
  if (!place) return undefined;
  const bundle = await getEntityBundle(place.id);
  if (!bundle) return undefined;
  return { ...bundle, place };
}

export function searchAtlasPlaces(
  places: readonly AtlasPlace[],
  query: string,
  limit = 12,
) {
  return searchEntities(places, query, limit);
}

export async function getAtlasRelatedPeople(placeId: string) {
  const related = await getRelated(placeId);
  return related.filter((r) => r.other.id.startsWith("person."));
}

export async function buildRelatedPeopleMap(
  places: readonly AtlasPlace[],
): Promise<
  Record<string, Array<{ id: string; name: string; kind: string; href: string }>>
> {
  const { getRelatedMany } = await import("@/lib/knowledge/store");
  const relatedMap = await getRelatedMany(places.map((p) => p.id));
  const out: Record<
    string,
    Array<{ id: string; name: string; kind: string; href: string }>
  > = {};
  for (const p of places) {
    const people = (relatedMap.get(p.id) ?? []).filter((r) =>
      r.other.id.startsWith("person."),
    );
    out[p.id] = people.map((r) => ({
      id: r.other.id,
      name: r.other.name,
      kind: r.other.kind,
      href: `/encyclopedia/${r.other.kind}/${r.other.slug}`,
    }));
  }
  return out;
}

export type { AtlasDataset, AtlasRoute };
export { atlasHref };
