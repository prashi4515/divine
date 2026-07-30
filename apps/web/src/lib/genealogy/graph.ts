import type {
  ConfidenceLevel,
  GenealogyModule,
  Person,
  RelationshipType,
} from "@/lib/genealogy/types";

/**
 * Graph builder — turns a module's person set into React-Flow nodes and edges
 * with a hierarchical layout suitable for family trees.
 *
 * Layout algorithm: simple deterministic BFS from the module root, packing
 * generations left-to-right and centring siblings under their parents.
 * Pure and framework-free; runs on server (SSG) or client (dynamic import).
 */

export type GraphNode = {
  id: string;
  personId: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const NODE_WIDTH = 200;
export const NODE_HEIGHT = 112;
const H_GAP = 40;
const V_GAP = 96;

export type GraphEdgeKind = "parent" | "spouse" | "sibling" | "other";

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  kind: GraphEdgeKind;
  relationshipType: RelationshipType;
  /** True when confidence is "variant" (dotted edge styling). */
  variant: boolean;
  confidence: ConfidenceLevel;
};

const PARENT_TYPES: readonly RelationshipType[] = [
  "son",
  "daughter",
  "adoptive-son",
  "adoptive-daughter",
  "descendant",
];
const SPOUSE_TYPES: readonly RelationshipType[] = ["spouse", "consort"];
const SIBLING_TYPES: readonly RelationshipType[] = ["brother", "sister"];

function edgeKind(type: RelationshipType): GraphEdgeKind {
  if (PARENT_TYPES.includes(type)) return "parent";
  if (SPOUSE_TYPES.includes(type)) return "spouse";
  if (SIBLING_TYPES.includes(type)) return "sibling";
  return "other";
}

/** Return all outgoing edges from a person that terminate inside `personIds`. */
function edgesFromPerson(
  person: Person,
  allowed: ReadonlySet<string>,
): GraphEdge[] {
  return person.relationships
    .filter((rel) => allowed.has(rel.personId))
    .map((rel) => ({
      id: `${person.id}--${rel.type}--${rel.personId}`,
      source: person.id,
      target: rel.personId,
      kind: edgeKind(rel.type),
      relationshipType: rel.type,
      variant: rel.confidence === "variant",
      confidence: rel.confidence,
    }));
}

/**
 * Compute a stable hierarchical layout for a module.
 * The root sits at generation 0; each parent-edge child sits one row below.
 * Anyone not reachable from the root is stacked in a "roots row" above.
 */
export function buildModuleGraph(
  mod: GenealogyModule,
  people: readonly Person[],
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const byId = new Map(people.map((p) => [p.id, p] as const));
  const allowed = new Set(mod.personIds);
  const roots = mod.rootPersonId ? [mod.rootPersonId] : [];

  const parentEdges: Array<{ parent: string; child: string }> = [];
  for (const person of people) {
    for (const rel of person.relationships) {
      if (edgeKind(rel.type) === "parent" && allowed.has(rel.personId)) {
        parentEdges.push({ parent: person.id, child: rel.personId });
      }
    }
  }

  const generation = new Map<string, number>();
  const seen = new Set<string>();
  const queue: string[] = [];
  for (const r of roots) {
    generation.set(r, 0);
    queue.push(r);
    seen.add(r);
  }
  while (queue.length > 0) {
    const id = queue.shift()!;
    const g = generation.get(id) ?? 0;
    for (const edge of parentEdges) {
      if (edge.parent === id && !seen.has(edge.child)) {
        generation.set(edge.child, g + 1);
        seen.add(edge.child);
        queue.push(edge.child);
      }
    }
  }

  for (const id of mod.personIds) {
    if (!generation.has(id)) generation.set(id, -1);
  }

  const rows = new Map<number, string[]>();
  for (const id of mod.personIds) {
    const g = generation.get(id) ?? -1;
    const row = rows.get(g) ?? [];
    row.push(id);
    rows.set(g, row);
  }

  const spouseOf = new Map<string, string[]>();
  for (const person of people) {
    for (const rel of person.relationships) {
      if (
        edgeKind(rel.type) === "spouse" &&
        allowed.has(rel.personId) &&
        allowed.has(person.id)
      ) {
        const list = spouseOf.get(person.id) ?? [];
        list.push(rel.personId);
        spouseOf.set(person.id, list);
      }
    }
  }

  for (const [g, row] of rows) {
    const ordered: string[] = [];
    const placed = new Set<string>();
    for (const id of row) {
      if (placed.has(id)) continue;
      ordered.push(id);
      placed.add(id);
      const spouses = spouseOf.get(id) ?? [];
      for (const s of spouses) {
        if (row.includes(s) && !placed.has(s)) {
          ordered.push(s);
          placed.add(s);
        }
      }
    }
    rows.set(g, ordered);
  }

  const nodes: GraphNode[] = [];
  const sortedGenerations = [...rows.keys()].sort((a, b) => a - b);
  const rowWidths = sortedGenerations.map((g) => {
    const count = rows.get(g)!.length;
    return count * NODE_WIDTH + (count - 1) * H_GAP;
  });
  const canvasWidth = Math.max(NODE_WIDTH, ...rowWidths, 0);

  for (let i = 0; i < sortedGenerations.length; i++) {
    const g = sortedGenerations[i]!;
    const row = rows.get(g)!;
    const rowWidth = rowWidths[i]!;
    const startX = (canvasWidth - rowWidth) / 2;
    const y = i * (NODE_HEIGHT + V_GAP);
    for (let j = 0; j < row.length; j++) {
      const id = row[j]!;
      if (!byId.has(id)) continue;
      nodes.push({
        id,
        personId: id,
        x: startX + j * (NODE_WIDTH + H_GAP),
        y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    }
  }

  const edgeSet = new Map<string, GraphEdge>();
  for (const person of people) {
    if (!allowed.has(person.id)) continue;
    for (const edge of edgesFromPerson(person, allowed)) {
      const key = `${edge.source}--${edge.target}--${edge.kind}`;
      if (!edgeSet.has(key)) edgeSet.set(key, edge);
    }
  }

  return { nodes, edges: [...edgeSet.values()] };
}

/**
 * BFS over parent relationships in the given person set, starting from
 * `personId` and following edges backwards (child → parent) to produce a
 * lineage highlight.
 */
export function computeLineage(
  personId: string,
  people: readonly Person[],
  moduleIds: ReadonlySet<string>,
): { personIds: Set<string>; edgeKey: (source: string, target: string) => string } {
  const childToParents = new Map<string, string[]>();
  for (const person of people) {
    if (!moduleIds.has(person.id)) continue;
    for (const rel of person.relationships) {
      if (!moduleIds.has(rel.personId)) continue;
      if (edgeKind(rel.type) === "parent") {
        const list = childToParents.get(rel.personId) ?? [];
        list.push(person.id);
        childToParents.set(rel.personId, list);
      }
    }
  }

  const seen = new Set<string>([personId]);
  const stack = [personId];
  while (stack.length > 0) {
    const id = stack.pop()!;
    const parents = childToParents.get(id) ?? [];
    for (const p of parents) {
      if (!seen.has(p)) {
        seen.add(p);
        stack.push(p);
      }
    }
  }

  return {
    personIds: seen,
    edgeKey: (source, target) => `${source}--${target}`,
  };
}
