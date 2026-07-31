/**
 * Public Atlas entry — MapLibre slippy map (client-only, no SSR).
 */
"use client";

import nextDynamic from "next/dynamic";
import type { AtlasDataset } from "@divine/types";
import type { AtlasPlace } from "@/lib/atlas/geo";

const AtlasMapApp = nextDynamic(
  () =>
    import("@/features/atlas/atlas-map-app").then((m) => m.AtlasMapApp),
  {
    ssr: false,
    loading: () => (
      <div className="border-border bg-muted/30 flex h-[min(78vh,820px)] min-h-[480px] items-center justify-center rounded-3xl border text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  },
);

export type AtlasExplorerProps = {
  dataset: AtlasDataset;
  places: AtlasPlace[];
  initialSlug?: string;
  relatedByPlaceId?: Record<
    string,
    Array<{ id: string; name: string; kind: string; href: string }>
  >;
};

export function AtlasExplorer(props: AtlasExplorerProps) {
  return <AtlasMapApp {...props} />;
}
