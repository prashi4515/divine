/**
 * Atlas search — English / Indic / aliases, grouped results, recent history.
 * No MapLibre dependency.
 */
import { searchEntities, type EntitySearchHit } from "@/lib/knowledge/search";
import {
  localizedNameKeys,
  resolveLocalizedName,
} from "@/lib/atlas/data/localized-name";
import type { TraditionalAtlasLabel } from "@/lib/atlas/data/traditional-label-types";
import type { AtlasPlace } from "@/lib/atlas/geo";
import type { AtlasDataset } from "@divine/types";
import { displayLocalizedName } from "@/lib/i18n/localize-entity";

export type AtlasSearchGroup =
  | "places"
  | "rivers"
  | "events"
  | "routes"
  | "people"
  | "recent";

export type AtlasSearchResult = {
  id: string;
  group: AtlasSearchGroup;
  label: string;
  subtitle: string;
  longitude: number;
  latitude: number;
  zoom: number;
  placeSlug?: string;
  eventId?: string;
  routeId?: string;
  riverId?: string;
  personId?: string;
};

export type AtlasSearchPerson = {
  id: string;
  name: string;
  placeSlug: string;
  longitude: number;
  latitude: number;
};

export type SearchAtlasOptions = {
  limit?: number;
  lang?: string;
  traditionalLabels?: readonly TraditionalAtlasLabel[];
  people?: readonly AtlasSearchPerson[];
};

const RECENT_KEY = "divine.atlas.recent-searches.v1";
const MAX_RECENT = 8;

function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function matches(keys: readonly string[], qFold: string): boolean {
  return keys.some((k) => {
    const f = fold(k);
    return f === qFold || f.startsWith(qFold) || f.includes(qFold);
  });
}

export function loadRecentSearches(): AtlasSearchResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AtlasSearchResult[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(hit: AtlasSearchResult): void {
  if (typeof window === "undefined") return;
  try {
    const prev = loadRecentSearches().filter((r) => r.id !== hit.id);
    const next = [hit, ...prev].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

function hitToResult(
  h: EntitySearchHit,
  place: AtlasPlace,
  lang: string,
): AtlasSearchResult {
  return {
    id: place.id,
    group: "places",
    label: displayLocalizedName(place, lang),
    subtitle: place.englishName !== h.name ? place.englishName : h.kind,
    longitude: place.atlas.longitude,
    latitude: place.atlas.latitude,
    zoom: 7.8,
    placeSlug: place.slug,
  };
}

export function searchAtlas(
  query: string,
  places: readonly AtlasPlace[],
  dataset: AtlasDataset,
  options: SearchAtlasOptions | number = 12,
): AtlasSearchResult[] {
  const opts: SearchAtlasOptions =
    typeof options === "number" ? { limit: options } : options;
  const limit = opts.limit ?? 12;
  const lang = opts.lang ?? "en";
  const traditionalLabels = opts.traditionalLabels ?? [];
  const people = opts.people ?? [];

  const q = query.trim();
  if (!q) {
    return loadRecentSearches().map((r) => ({ ...r, group: "recent" as const }));
  }

  const qFold = fold(q);
  const results: AtlasSearchResult[] = [];
  const seen = new Set<string>();

  const placeHits = searchEntities(places, q, limit);
  for (const h of placeHits) {
    const place = places.find((p) => p.id === h.id);
    if (!place || seen.has(place.id)) continue;
    seen.add(place.id);
    results.push(hitToResult(h, place, lang));
  }

  for (const place of places) {
    if (seen.has(place.id)) continue;
    const keys = [
      place.name,
      place.englishName,
      place.iastName ?? "",
      place.slug,
      displayLocalizedName(place, lang),
      ...(place.aliases ?? []),
    ];
    if (!matches(keys, qFold)) continue;
    seen.add(place.id);
    results.push({
      id: place.id,
      group: "places",
      label: displayLocalizedName(place, lang),
      subtitle:
        place.englishName !== place.name ? place.englishName : place.kind,
      longitude: place.atlas.longitude,
      latitude: place.atlas.latitude,
      zoom: 7.8,
      placeSlug: place.slug,
    });
  }

  for (const label of traditionalLabels) {
    if (seen.has(label.id)) continue;
    const keys = localizedNameKeys(label.name, label.iast);
    if (!matches(keys, qFold)) continue;
    seen.add(label.id);
    results.push({
      id: label.id,
      group: "places",
      label: resolveLocalizedName(label.name, lang, label.iast),
      subtitle: label.kind,
      longitude: label.lng,
      latitude: label.lat,
      zoom: 7.2,
    });
  }

  for (const river of dataset.rivers) {
    const keys = [river.name, river.iastName ?? "", river.slug];
    if (!matches(keys, qFold)) continue;
    if (seen.has(river.id)) continue;
    seen.add(river.id);
    const mid = river.points[Math.floor(river.points.length / 2)];
    if (!mid) continue;
    const [lat, lng] = mid;
    results.push({
      id: river.id,
      group: "rivers",
      label: river.name,
      subtitle: "River",
      longitude: lng,
      latitude: lat,
      zoom: 6.8,
      riverId: river.id,
      placeSlug: river.entityId
        ? places.find((p) => p.id === river.entityId)?.slug
        : undefined,
    });
  }

  for (const ev of dataset.events) {
    const keys = [ev.name, ev.iastName ?? "", ev.slug];
    if (!matches(keys, qFold)) continue;
    if (seen.has(ev.id)) continue;
    seen.add(ev.id);
    results.push({
      id: ev.id,
      group: "events",
      label: ev.name,
      subtitle: "Event",
      longitude: ev.longitude,
      latitude: ev.latitude,
      zoom: 7.5,
      eventId: ev.id,
      placeSlug: ev.placeId
        ? places.find((p) => p.id === ev.placeId)?.slug
        : undefined,
    });
  }

  for (const route of dataset.routes) {
    const keys = [
      route.title,
      route.iastTitle ?? "",
      route.slug,
      route.summary,
      route.description,
    ];
    if (!matches(keys, qFold)) continue;
    if (seen.has(route.id)) continue;
    seen.add(route.id);
    const first = places.find((p) => p.id === route.placeIds[0]);
    if (!first) continue;
    results.push({
      id: route.id,
      group: "routes",
      label: route.title,
      subtitle: "Journey",
      longitude: first.atlas.longitude,
      latitude: first.atlas.latitude,
      zoom: 6,
      routeId: route.id,
    });
  }

  for (const person of people) {
    if (seen.has(person.id)) continue;
    if (!matches([person.name], qFold)) continue;
    seen.add(person.id);
    results.push({
      id: person.id,
      group: "people",
      label: person.name,
      subtitle: "Character",
      longitude: person.longitude,
      latitude: person.latitude,
      zoom: 7.5,
      placeSlug: person.placeSlug,
      personId: person.id,
    });
  }

  return results.slice(0, limit);
}

export const SEARCH_GROUP_LABELS: Record<AtlasSearchGroup, string> = {
  recent: "Recent",
  places: "Places",
  rivers: "Rivers",
  events: "Events",
  routes: "Journeys",
  people: "Characters",
};
