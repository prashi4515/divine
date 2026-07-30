"use client";

import dynamic from "next/dynamic";
import type { KnowledgeEntity, KnowledgeRelation } from "@/lib/knowledge/types";

const Graph = dynamic(
  () =>
    import("@/features/encyclopedia/entity-graph-widget").then(
      (m) => m.EntityGraphWidget,
    ),
  {
    ssr: false,
    loading: () => (
      <p className="text-muted-foreground text-sm">Loading graph…</p>
    ),
  },
);

/** Lazy React Flow ego graph — keeps @xyflow out of the initial route JS. */
export function LazyEntityGraph({
  root,
  neighbors,
}: {
  root: KnowledgeEntity;
  neighbors: Array<{ entity: KnowledgeEntity; relation: KnowledgeRelation }>;
}) {
  return <Graph root={root} neighbors={neighbors} />;
}
