import "server-only";
import {
  getCollection,
  getEntity,
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
import {
  getAtlasDataset,
  getAtlasRoutesFromDataset,
} from "@/lib/atlas/data/load-dataset";
import type { AtlasDataset, AtlasRoute } from "@divine/types";

export * from "@/lib/atlas/geo";
export { getAtlasDataset } from "@/lib/atlas/data/load-dataset";

export async function getAtlasRoutes(): Promise<readonly AtlasRoute[]> {
  return getAtlasRoutesFromDataset();
}

export async function getAtlasPlaces(): Promise<AtlasPlace[]> {
  const col = await getCollection("mahabharata");
  if (!col) return [];
  const places: AtlasPlace[] = [];
  for (const id of col.entityIds) {
    const e = await getEntity(id);
    if (e && isAtlasPlace(e) && e.status === "published") {
      places.push(e as AtlasPlace);
    }
  }
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
  const out: Record<
    string,
    Array<{ id: string; name: string; kind: string; href: string }>
  > = {};
  for (const p of places) {
    const people = await getAtlasRelatedPeople(p.id);
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
