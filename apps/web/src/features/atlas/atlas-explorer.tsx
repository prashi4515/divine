/**
 * Public Atlas entry — MapLibre slippy map (client-only, no SSR).
 */
"use client";

import nextDynamic from "next/dynamic";
import type { AtlasDataset } from "@divine/types";
import type { TraditionalAtlasLabel } from "@/lib/atlas/data/traditional-label-types";
import type { AtlasPlace } from "@/lib/atlas/geo";

const AtlasMapApp = nextDynamic(
  () =>
    import("@/features/atlas/atlas-map-app").then((m) => m.AtlasMapApp),
  {
    ssr: false,
    loading: () => (
      <div className="bg-muted/30 text-muted-foreground flex h-full min-h-[520px] items-center justify-center text-sm">
        Loading map…
      </div>
    ),
  },
);

export type AtlasExplorerProps = {
  dataset: AtlasDataset;
  places: AtlasPlace[];
  traditionalLabels?: readonly TraditionalAtlasLabel[];
  initialSlug?: string;
  relatedByPlaceId?: Record<
    string,
    Array<{ id: string; name: string; kind: string; href: string }>
  >;
};

export function AtlasExplorer(props: AtlasExplorerProps) {
  return <AtlasMapApp {...props} />;
}
