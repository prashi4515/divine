"use client";

import * as React from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type EdgeTypes,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { PersonNode, type PersonNodeData } from "@/features/genealogy/person-node";
import {
  buildModuleGraph,
  computeLineage,
  NODE_HEIGHT,
  NODE_WIDTH,
  type GraphEdgeKind,
} from "@/lib/genealogy/graph";
import type {
  GenealogyModule,
  Person,
  RelationshipType,
} from "@/lib/genealogy/types";
import { CATEGORY_TOKENS } from "@/lib/genealogy/types";
import { cn } from "@/lib/utils";

/**
 * Interactive graph — React Flow with a memoised custom node.
 * Lineage highlight + selected node dim non-lineage nodes for focus.
 */

const nodeTypes: NodeTypes = { person: PersonNode as unknown as NodeTypes[string] };

type PersonEdgeData = {
  kind: GraphEdgeKind;
  relationshipType: RelationshipType;
  variant: boolean;
  confidence: import("@/lib/genealogy/types").ConfidenceLevel;
};

const edgeTypes: EdgeTypes = {};

export function GenealogyGraph({
  module: mod,
  people,
  selectedId,
  onSelectPerson,
  focusRequestId,
  spinePath,
}: {
  module: GenealogyModule;
  people: readonly Person[];
  selectedId: string | null;
  onSelectPerson: (id: string) => void;
  /** When incremented, the graph pans to `selectedId`. */
  focusRequestId?: number;
  /** Optional dynasty spine from module.highlightPath. */
  spinePath?: readonly string[];
}) {
  return (
    <ReactFlowProvider>
      <GraphInner
        module={mod}
        people={people}
        selectedId={selectedId}
        onSelectPerson={onSelectPerson}
        focusRequestId={focusRequestId}
        spinePath={spinePath}
      />
    </ReactFlowProvider>
  );
}

function GraphInner({
  module: mod,
  people,
  selectedId,
  onSelectPerson,
  focusRequestId,
  spinePath,
}: {
  module: GenealogyModule;
  people: readonly Person[];
  selectedId: string | null;
  onSelectPerson: (id: string) => void;
  focusRequestId?: number;
  spinePath?: readonly string[];
}) {
  const flow = useReactFlow();
  const moduleIds = React.useMemo(() => new Set(mod.personIds), [mod.personIds]);
  const reduceMotion = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const built = React.useMemo(
    () => buildModuleGraph(mod, people),
    [mod, people],
  );

  const lineage = React.useMemo(() => {
    if (spinePath && spinePath.length > 0) {
      return { personIds: new Set(spinePath), edgeKey: () => "" };
    }
    if (!selectedId) return null;
    return computeLineage(selectedId, people, moduleIds);
  }, [selectedId, people, moduleIds, spinePath]);

  const nodes: Node<PersonNodeData>[] = React.useMemo(() => {
    return built.nodes.map((n) => {
      const person = people.find((p) => p.id === n.personId)!;
      const isHighlighted = lineage
        ? lineage.personIds.has(n.personId)
        : selectedId === n.personId;
      const isDimmed = Boolean(lineage) && !isHighlighted;
      return {
        id: n.id,
        position: { x: n.x, y: n.y },
        type: "person",
        data: {
          person,
          onOpen: onSelectPerson,
          isDimmed,
          isHighlighted,
          isRoot: mod.rootPersonId === n.personId,
        },
        selected: selectedId === n.personId,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        draggable: false,
        selectable: true,
        focusable: true,
      };
    });
  }, [built.nodes, people, lineage, selectedId, mod.rootPersonId, onSelectPerson]);

  const spineEdgeSet = React.useMemo(() => {
    if (!spinePath || spinePath.length < 2) return null;
    const set = new Set<string>();
    for (let i = 0; i < spinePath.length - 1; i++) {
      const a = spinePath[i]!;
      const b = spinePath[i + 1]!;
      set.add(`${a}--${b}`);
      set.add(`${b}--${a}`);
    }
    return set;
  }, [spinePath]);

  const edges: Edge<PersonEdgeData>[] = React.useMemo(() => {
    return built.edges.map((e) => {
      const onSpine =
        spineEdgeSet?.has(`${e.source}--${e.target}`) && e.kind === "parent";
      const isHighlighted =
        onSpine ||
        (lineage &&
          lineage.personIds.has(e.source) &&
          lineage.personIds.has(e.target) &&
          e.kind === "parent");
      const isDimmed =
        Boolean(lineage) &&
        !isHighlighted &&
        !(
          lineage &&
          lineage.personIds.has(e.source) &&
          lineage.personIds.has(e.target)
        );

      const stroke = edgeStroke(e.kind, isHighlighted, e.variant);

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.kind === "spouse" ? "straight" : "smoothstep",
        data: {
          kind: e.kind,
          relationshipType: e.relationshipType,
          variant: e.variant,
          confidence: e.confidence,
        },
        style: {
          stroke,
          strokeWidth: isHighlighted ? 2 : e.variant ? 1.25 : 1.5,
          strokeDasharray:
            e.kind === "spouse"
              ? "4 4"
              : e.variant
                ? "2 4"
                : undefined,
          opacity: isDimmed ? 0.18 : 1,
        },
        animated: Boolean(isHighlighted) && !reduceMotion,
        interactionWidth: 20,
      };
    });
  }, [built.edges, lineage, spineEdgeSet, reduceMotion]);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      flow.fitView({ padding: 0.2, duration: 400 });
    }, 30);
    return () => window.clearTimeout(t);
  }, [mod.slug, flow]);

  React.useEffect(() => {
    if (!selectedId || focusRequestId == null) return;
    const node = flow.getNode(selectedId);
    if (!node) return;
    flow.setCenter(
      node.position.x + NODE_WIDTH / 2,
      node.position.y + NODE_HEIGHT / 2,
      { zoom: Math.max(flow.getZoom(), 1.1), duration: 500 },
    );
  }, [selectedId, focusRequestId, flow]);

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, node) => onSelectPerson(node.id)}
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.75}
        panOnDrag
        panOnScroll={false}
        zoomOnScroll
        zoomOnPinch
        selectNodesOnDrag={false}
        nodesDraggable={false}
        elevateNodesOnSelect
        nodesFocusable
        className={cn("bg-transparent")}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="hsl(var(--muted-foreground) / 0.25)"
        />
        <MiniMap
          className="!bg-background/70 !border-border !rounded-lg !border !shadow-sm backdrop-blur-sm"
          nodeColor={(n) => {
            const person = (n.data as PersonNodeData).person;
            return CATEGORY_TOKENS[person.category].accent;
          }}
          nodeStrokeWidth={2}
          maskColor="hsl(var(--background) / 0.6)"
          pannable
          zoomable
        />
        <Controls
          position="bottom-right"
          className="!bg-background/70 !border-border !overflow-hidden !rounded-lg !border !shadow-sm backdrop-blur-sm"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}

function edgeStroke(
  kind: GraphEdgeKind,
  highlighted: boolean | null | undefined,
  variant: boolean,
): string {
  if (highlighted) return "hsl(var(--saffron))";
  if (kind === "spouse") return "hsl(var(--maroon) / 0.55)";
  if (variant) return "hsl(var(--muted-foreground) / 0.5)";
  if (kind === "parent") return "hsl(var(--foreground) / 0.45)";
  return "hsl(var(--muted-foreground) / 0.4)";
}
