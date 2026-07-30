"use client";

import * as React from "react";
import Link from "next/link";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { KnowledgeEntity, KnowledgeRelation } from "@/lib/knowledge/types";
import { ENTITY_KIND_TOKENS } from "@/lib/knowledge/types";
import { buildEgoGraph } from "@/lib/knowledge/graph";
import { entityHref } from "@/lib/knowledge/search";
import { displayEnglishName } from "@/lib/text/modern-english";

export function EntityGraphWidget({
  root,
  neighbors,
}: {
  root: KnowledgeEntity;
  neighbors: Array<{ entity: KnowledgeEntity; relation: KnowledgeRelation }>;
}) {
  return (
    <ReactFlowProvider>
      <GraphInner root={root} neighbors={neighbors} />
    </ReactFlowProvider>
  );
}

function GraphInner({
  root,
  neighbors,
}: {
  root: KnowledgeEntity;
  neighbors: Array<{ entity: KnowledgeEntity; relation: KnowledgeRelation }>;
}) {
  const { nodes: laid, edges: laidEdges } = React.useMemo(
    () => buildEgoGraph(root, neighbors),
    [root, neighbors],
  );

  const nodes: Node[] = laid.map((n) => {
    const tokens = ENTITY_KIND_TOKENS[n.entity.kind];
    return {
      id: n.id,
      position: { x: n.x, y: n.y },
      data: { label: displayEnglishName(n.entity) },
      style: {
        width: 160,
        padding: 8,
        borderRadius: 12,
        border: `1px solid ${tokens.ring}66`,
        background: tokens.tint,
        fontSize: 12,
        fontWeight: 500,
      },
    };
  });

  const edges: Edge[] = laidEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    style: {
      stroke: e.variant ? "#a08060" : "#8a7a60",
      strokeDasharray: e.variant ? "2 4" : undefined,
    },
  }));

  return (
    <div className="border-border/70 h-[320px] overflow-hidden rounded-2xl border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background gap={16} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
      <div className="border-border/60 flex flex-wrap gap-2 border-t px-3 py-2">
        {laid.slice(0, 8).map((n) => (
          <Link
            key={n.id}
            href={entityHref(n.entity)}
            className="text-muted-foreground hover:text-foreground text-[11px] underline-offset-2 hover:underline"
          >
            {displayEnglishName(n.entity)}
          </Link>
        ))}
      </div>
    </div>
  );
}
