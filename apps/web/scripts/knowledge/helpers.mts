/** Local helpers for knowledge scripts (avoid @divine/types ESM resolution in node). */

export type Cite = {
  work: string;
  section?: string;
  chapter?: string;
  verse?: string;
  note?: string;
};

export type Confidence = "verified" | "traditional" | "variant";

export function makeRelationId(
  fromId: string,
  type: string,
  toId: string,
): string {
  return `rel.${fromId}.${type}.${toId}`;
}
