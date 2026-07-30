import type {
  KnowledgeEntity,
  KnowledgeRelation,
  RelationType,
} from "@/lib/knowledge/types";
import {
  createRelationshipIndex,
  getChildren,
  getParents,
} from "@/lib/knowledge/relationship-engine";

export type EgoNode = {
  id: string;
  entity: KnowledgeEntity;
  x: number;
  y: number;
  depth: number;
};

export type EgoEdge = {
  id: string;
  source: string;
  target: string;
  type: RelationType;
  variant: boolean;
};

const NODE_W = 180;
const H_GAP = 36;
const V_GAP = 100;

/**
 * 1-hop ego network around a root entity for the encyclopedia graph widget.
 * Parent/child placement uses the shared relationship engine (direction-aware).
 */
export function buildEgoGraph(
  root: KnowledgeEntity,
  neighbors: Array<{ entity: KnowledgeEntity; relation: KnowledgeRelation }>,
): { nodes: EgoNode[]; edges: EgoEdge[] } {
  const nodes: EgoNode[] = [
    { id: root.id, entity: root, x: 0, y: 0, depth: 0 },
  ];
  const edges: EgoEdge[] = [];
  const seen = new Set<string>([root.id]);

  const entityById = new Map<string, KnowledgeEntity>([[root.id, root]]);
  const relations: KnowledgeRelation[] = [];
  for (const n of neighbors) {
    entityById.set(n.entity.id, n.entity);
    relations.push(n.relation);
  }

  const index = createRelationshipIndex(relations, { dedupe: true });
  const parentHops = getParents(index, root.id);
  const childHops = getChildren(index, root.id);
  const parentIds = new Set(parentHops.map((h) => h.otherId));
  const childIds = new Set(childHops.map((h) => h.otherId));

  const parents = neighbors.filter((n) => parentIds.has(n.entity.id));
  const children = neighbors.filter((n) => childIds.has(n.entity.id));
  const kinship = new Set([...parentIds, ...childIds]);
  const others = neighbors.filter((n) => !kinship.has(n.entity.id));

  function placeRow(
    items: typeof neighbors,
    depth: number,
    y: number,
  ) {
    const count = items.length;
    const width = count * NODE_W + Math.max(0, count - 1) * H_GAP;
    const startX = -width / 2;
    items.forEach((item, i) => {
      if (seen.has(item.entity.id)) return;
      seen.add(item.entity.id);
      nodes.push({
        id: item.entity.id,
        entity: item.entity,
        x: startX + i * (NODE_W + H_GAP),
        y,
        depth,
      });
      edges.push({
        id: item.relation.id,
        source: item.relation.fromId,
        target: item.relation.toId,
        type: item.relation.type,
        variant: item.relation.confidence === "variant",
      });
    });
  }

  placeRow(parents, -1, -V_GAP);
  placeRow(children, 1, V_GAP);
  placeRow(others.slice(0, 12), 2, V_GAP * 2);

  if (nodes.length > 1) {
    const xs = nodes.filter((n) => n.depth !== 0).map((n) => n.x);
    if (xs.length) {
      const mid = (Math.min(...xs) + Math.max(...xs)) / 2;
      const rootNode = nodes.find((n) => n.id === root.id)!;
      rootNode.x = mid;
    }
  }

  return { nodes, edges };
}
